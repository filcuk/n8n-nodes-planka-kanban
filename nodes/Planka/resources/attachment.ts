import type { IDataObject, INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { binaryPropertyField, idField, nameField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaMultipartRequest, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const attachmentProperties: INodeProperties[] = [
	operationField(
		'attachment',
		[
			{ name: 'Create', value: 'create', description: 'Create an attachment on a card', action: 'Create attachment' },
			{ name: 'Delete', value: 'delete', description: 'Delete an attachment', action: 'Delete attachment' },
			{ name: 'Update', value: 'update', description: 'Update an attachment', action: 'Update attachment' },
		],
		'create',
	),
	idField('Card ID', 'cardId', 'attachment', ['create']),
	idField('Attachment ID', 'attachmentId', 'attachment', ['delete', 'update']),
	nameField(['attachment'], ['create', 'update']),
	{
		displayName: 'Attachment Type',
		name: 'attachmentType',
		type: 'options',
		options: [
			{ name: 'File', value: 'file' },
			{ name: 'Link', value: 'link' },
		],
		default: 'link',
		required: true,
		displayOptions: { show: { resource: ['attachment'], operation: ['create'] } },
	},
	binaryPropertyField('attachment', ['create']),
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		displayOptions: {
			show: { resource: ['attachment'], operation: ['create'], attachmentType: ['link'] },
		},
		description: 'URL for link-type attachments',
	},
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['attachment'], operation: ['create'] } },
	},
];

export async function executeAttachment(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'create') {
		const cardId = ctx.getNodeParameter('cardId', itemIndex) as string;
		const attachmentType = ctx.getNodeParameter('attachmentType', itemIndex) as string;
		const body: IDataObject = {
			type: attachmentType,
			name: ctx.getNodeParameter('name', itemIndex),
		};

		const requestId = ctx.getNodeParameter('requestId', itemIndex) as string;
		if (requestId) body.requestId = requestId;

		if (attachmentType === 'link') {
			body.url = ctx.getNodeParameter('url', itemIndex);
		} else {
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', itemIndex) as string;
			const binaryData = ctx.helpers.assertBinaryData(itemIndex, binaryPropertyName);
			const buffer = await ctx.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
			body.file = {
				value: buffer,
				options: {
					filename: binaryData.fileName || 'file',
					contentType: binaryData.mimeType || 'application/octet-stream',
				},
			};
		}

		return {
			type: 'json',
			data: await plankaMultipartRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/cards/${cardId}/attachments`,
				body,
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('attachmentId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/attachments/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('attachmentId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/attachments/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported attachment operation: ${operation}`);
}
