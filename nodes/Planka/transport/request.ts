import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import type { PlankaAuth, PlankaRequestOptions } from '../types';

type MultipartFile = {
	value: unknown;
	options?: {
		filename?: string;
		contentType?: string;
	};
};

function isMultipartFile(value: unknown): value is MultipartFile {
	return (
		typeof value === 'object' &&
		value !== null &&
		'value' in value &&
		(value as MultipartFile).value != null &&
		typeof (value as MultipartFile).value === 'object'
	);
}

function asUint8Array(value: unknown): Uint8Array {
	if (value instanceof Uint8Array) {
		return value;
	}
	throw new Error('Expected binary file data as a Buffer or Uint8Array');
}

function encodeUtf8(text: string): Uint8Array {
	const encoded = encodeURIComponent(text);
	const bytes: number[] = [];
	for (let i = 0; i < encoded.length; i++) {
		if (encoded[i] === '%') {
			bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
			i += 2;
		} else {
			bytes.push(encoded.charCodeAt(i));
		}
	}
	return new Uint8Array(bytes);
}

function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
	const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	return result;
}

/**
 * Build multipart/form-data without external deps (n8n Cloud forbids them).
 * Text fields are written before file parts for Planka/Skipper compatibility.
 */
function buildMultipartBody(body: IDataObject): { payload: Uint8Array; contentType: string } {
	const boundary = `----n8nPlankaBoundary${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
	const chunks: Uint8Array[] = [];
	const files: Array<[string, MultipartFile]> = [];

	for (const [key, value] of Object.entries(body)) {
		if (value === undefined || value === null || value === '') {
			continue;
		}
		if (isMultipartFile(value)) {
			files.push([key, value]);
			continue;
		}
		const text = typeof value === 'string' ? value : String(value);
		chunks.push(
			encodeUtf8(
				`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${text}\r\n`,
			),
		);
	}

	for (const [key, file] of files) {
		const filename = (file.options?.filename || 'file').replace(/"/g, '');
		const contentType = file.options?.contentType || 'application/octet-stream';
		chunks.push(
			encodeUtf8(
				`--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
			),
		);
		chunks.push(asUint8Array(file.value));
		chunks.push(encodeUtf8('\r\n'));
	}

	chunks.push(encodeUtf8(`--${boundary}--\r\n`));

	return {
		payload: concatUint8Arrays(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

export async function plankaRequest(
	ctx: IExecuteFunctions,
	auth: PlankaAuth,
	options: PlankaRequestOptions,
): Promise<IDataObject> {
	const response = await ctx.helpers.httpRequest({
		...options,
		headers: {
			...auth.headers,
			...options.headers,
		},
		json: options.json !== false,
	});
	return response as IDataObject;
}

export async function paginateCards(
	ctx: IExecuteFunctions,
	auth: PlankaAuth,
	listId: string,
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	const seenIds = new Set<string>();
	let cursorListChangedAt: string | null = null;
	let cursorId: string | null = null;

	let hasMore = true;

	while (hasMore) {
		const query: IDataObject = { ...qs };
		if (cursorListChangedAt && cursorId) {
			query['before[listChangedAt]'] = cursorListChangedAt;
			query['before[id]'] = cursorId;
		}

		const response = await plankaRequest(ctx, auth, {
			method: 'GET',
			url: `${auth.baseUrl}/api/lists/${listId}/cards`,
			qs: query,
		});

		const items = (response.items as IDataObject[]) || [];
		if (items.length === 0) {
			hasMore = false;
			break;
		}

		for (const item of items) {
			const id = item.id as string;
			if (!seenIds.has(id)) {
				seenIds.add(id);
				allItems.push(item);
			}
		}

		const lastItem = items[items.length - 1];
		cursorListChangedAt = lastItem.listChangedAt as string;
		cursorId = lastItem.id as string;
	}

	return allItems;
}

export function bodyWithOptionalFields(
	fields: Record<string, string | number | boolean | object | null | undefined>,
): IDataObject {
	const body: IDataObject = {};
	for (const [key, value] of Object.entries(fields)) {
		if (value !== undefined && value !== '' && value !== null) {
			body[key] = value;
		}
	}
	return body;
}

export async function plankaMultipartRequest(
	ctx: IExecuteFunctions,
	auth: PlankaAuth,
	options: {
		method: 'POST' | 'PATCH';
		url: string;
		body: IDataObject;
	},
): Promise<IDataObject> {
	const { payload, contentType } = buildMultipartBody(options.body);

	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		url: options.url,
		headers: {
			...auth.headers,
			'Content-Type': contentType,
		},
		body: payload,
		json: false,
	};
	const response = await ctx.helpers.httpRequest(requestOptions);

	if (typeof response === 'string') {
		return JSON.parse(response) as IDataObject;
	}
	return response as IDataObject;
}
