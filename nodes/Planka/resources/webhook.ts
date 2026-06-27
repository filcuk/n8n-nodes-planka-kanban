import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const webhookProperties: INodeProperties[] = [
	operationField(
		'webhook',
		[
			{ name: 'Create', value: 'create', description: 'Create a webhook', action: 'Create webhook' },
			{ name: 'Delete', value: 'delete', description: 'Delete a webhook', action: 'Delete webhook' },
			{ name: 'Get Many', value: 'getAll', description: 'Get all webhooks', action: 'Get many webhooks' },
			{ name: 'Update', value: 'update', description: 'Update a webhook', action: 'Update webhook' },
		],
		'getAll',
	),
	idField('Webhook ID', 'webhookId', 'webhook', ['delete', 'update']),
	nameField(['webhook'], ['create', 'update'], false),
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['webhook'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Access Token',
		name: 'accessToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		displayOptions: { show: { resource: ['webhook'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['webhook'], operation: ['create', 'update'] } },
		description: 'Comma-separated list of events to subscribe to',
	},
	{
		displayName: 'Excluded Events',
		name: 'excludedEvents',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['webhook'], operation: ['create', 'update'] } },
		description: 'Comma-separated list of events to exclude',
	},
];

export async function executeWebhook(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'getAll') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/webhooks` }),
		};
	}

	if (operation === 'create') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/webhooks`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					url: ctx.getNodeParameter('url', itemIndex) as string,
					accessToken: ctx.getNodeParameter('accessToken', itemIndex) as string,
					events: ctx.getNodeParameter('events', itemIndex) as string,
					excludedEvents: ctx.getNodeParameter('excludedEvents', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('webhookId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/webhooks/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					url: ctx.getNodeParameter('url', itemIndex) as string,
					accessToken: ctx.getNodeParameter('accessToken', itemIndex) as string,
					events: ctx.getNodeParameter('events', itemIndex) as string,
					excludedEvents: ctx.getNodeParameter('excludedEvents', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('webhookId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/webhooks/${id}` }),
		};
	}

	throw new Error(`Unsupported webhook operation: ${operation}`);
}
