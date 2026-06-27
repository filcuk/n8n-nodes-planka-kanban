import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField, userIdField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

const formatOptions = [
	{ name: 'Text', value: 'text' },
	{ name: 'Markdown', value: 'markdown' },
	{ name: 'HTML', value: 'html' },
];

export const notificationServiceProperties: INodeProperties[] = [
	operationField(
		'notificationService',
		[
			{ name: 'Create for Board', value: 'createForBoard', description: 'Create a notification service for a board', action: 'Create board notification service' },
			{ name: 'Create for User', value: 'createForUser', description: 'Create a notification service for a user', action: 'Create user notification service' },
			{ name: 'Delete', value: 'delete', description: 'Delete a notification service', action: 'Delete notification service' },
			{ name: 'Test', value: 'test', description: 'Test a notification service', action: 'Test notification service' },
			{ name: 'Update', value: 'update', description: 'Update a notification service', action: 'Update notification service' },
		],
		'createForBoard',
	),
	idField('Board ID', 'boardId', 'notificationService', ['createForBoard']),
	userIdField('notificationService', ['createForUser']),
	idField('Notification Service ID', 'notificationServiceId', 'notificationService', ['delete', 'test', 'update']),
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['notificationService'],
				operation: ['createForBoard', 'createForUser', 'update'],
			},
		},
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		options: formatOptions,
		default: 'text',
		displayOptions: {
			show: {
				resource: ['notificationService'],
				operation: ['createForBoard', 'createForUser', 'update'],
			},
		},
	},
];

export async function executeNotificationService(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;
	const body = bodyWithOptionalFields({
		url: ctx.getNodeParameter('url', itemIndex) as string,
		format: ctx.getNodeParameter('format', itemIndex) as string,
	});

	if (operation === 'createForBoard') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/boards/${ctx.getNodeParameter('boardId', itemIndex)}/notification-services`,
				body,
			}),
		};
	}

	if (operation === 'createForUser') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/users/${ctx.getNodeParameter('userId', itemIndex)}/notification-services`,
				body,
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('notificationServiceId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/notification-services/${id}`,
				body,
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('notificationServiceId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/notification-services/${id}`,
			}),
		};
	}

	if (operation === 'test') {
		const id = ctx.getNodeParameter('notificationServiceId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/notification-services/${id}/test`,
			}),
		};
	}

	throw new Error(`Unsupported notificationService operation: ${operation}`);
}
