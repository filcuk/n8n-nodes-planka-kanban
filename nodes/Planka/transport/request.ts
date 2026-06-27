import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import type { PlankaAuth, PlankaRequestOptions } from '../types';

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
	const requestOptions: IHttpRequestOptions = {
		method: options.method,
		url: options.url,
		headers: {
			...auth.headers,
			'Content-Type': 'multipart/form-data',
		},
		body: options.body,
	};
	const response = await ctx.helpers.httpRequest(requestOptions);
	return response as IDataObject;
}
