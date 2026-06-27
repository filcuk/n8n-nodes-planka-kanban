import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const notificationProperties: INodeProperties[] = [
	operationField(
		'notification',
		[
			{ name: 'Get Many', value: 'getAll', description: 'Get user notifications', action: 'Get notifications' },
			{ name: 'Get', value: 'get', description: 'Get a notification', action: 'Get notification' },
			{ name: 'Mark All Read', value: 'readAll', description: 'Mark all notifications as read', action: 'Mark all notifications read' },
			{ name: 'Update', value: 'update', description: 'Update a notification', action: 'Update notification' },
		],
		'getAll',
	),
	idField('Notification ID', 'notificationId', 'notification', ['get', 'update']),
	{
		displayName: 'Is Read',
		name: 'isRead',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['notification'], operation: ['update'] } },
	},
];

export async function executeNotification(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'getAll') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/notifications` }),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('notificationId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/notifications/${id}` }),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('notificationId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/notifications/${id}`,
				body: bodyWithOptionalFields({
					isRead: ctx.getNodeParameter('isRead', itemIndex) as boolean,
				}),
			}),
		};
	}

	if (operation === 'readAll') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'POST', url: `${baseUrl}/api/notifications/read-all` }),
		};
	}

	throw new Error(`Unsupported notification operation: ${operation}`);
}
