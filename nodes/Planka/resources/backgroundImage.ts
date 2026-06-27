import type { IDataObject, INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { binaryPropertyField, idField, operationField } from '../descriptions/shared';
import { plankaMultipartRequest, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const backgroundImageProperties: INodeProperties[] = [
	operationField(
		'backgroundImage',
		[
			{ name: 'Upload', value: 'upload', description: 'Upload a project background image', action: 'Upload background image' },
			{ name: 'Delete', value: 'delete', description: 'Delete a background image', action: 'Delete background image' },
		],
		'upload',
	),
	idField('Project ID', 'projectId', 'backgroundImage', ['upload']),
	idField('Background Image ID', 'backgroundImageId', 'backgroundImage', ['delete']),
	binaryPropertyField('backgroundImage', ['upload']),
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['backgroundImage'], operation: ['upload'] } },
	},
];

export async function executeBackgroundImage(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'upload') {
		const projectId = ctx.getNodeParameter('projectId', itemIndex) as string;
		const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', itemIndex) as string;
		const binaryData = ctx.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		const buffer = await ctx.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
		const body: IDataObject = {
			file: {
				value: buffer,
				options: {
					filename: binaryData.fileName || 'background',
					contentType: binaryData.mimeType || 'application/octet-stream',
				},
			},
		};
		const requestId = ctx.getNodeParameter('requestId', itemIndex) as string;
		if (requestId) body.requestId = requestId;

		return {
			type: 'json',
			data: await plankaMultipartRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/projects/${projectId}/background-images`,
				body,
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('backgroundImageId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/background-images/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported backgroundImage operation: ${operation}`);
}
