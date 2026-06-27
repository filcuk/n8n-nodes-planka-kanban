import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, paginateCards, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const cardProperties: INodeProperties[] = [
	operationField(
		'card',
		[
			{ name: 'Create', value: 'create', description: 'Create a card in a list', action: 'Create a card' },
			{ name: 'Delete', value: 'delete', description: 'Delete a card', action: 'Delete a card' },
			{ name: 'Duplicate', value: 'duplicate', description: 'Duplicate a card', action: 'Duplicate a card' },
			{ name: 'Get', value: 'get', description: 'Get a card by ID', action: 'Get a card' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many cards in a list', action: 'Get many cards' },
			{
				name: 'Mark Notifications Read',
				value: 'readNotifications',
				description: 'Mark card notifications as read',
				action: 'Mark card notifications read',
			},
			{ name: 'Update', value: 'update', description: 'Update a card', action: 'Update a card' },
		],
		'create',
	),
	idField('List ID', 'listId', 'card', ['create', 'getAll', 'update']),
	idField('Card ID', 'cardId', 'card', ['delete', 'get', 'update', 'duplicate', 'readNotifications']),
	nameField(['card'], ['create', 'update', 'duplicate']),
	positionField(['card'], ['create', 'update', 'duplicate']),
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Due Date',
		name: 'dueDate',
		type: 'dateTime',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Project', value: 'project' },
			{ name: 'Story', value: 'story' },
		],
		default: 'project',
		displayOptions: { show: { resource: ['card'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['update'] } },
		description: 'ID of the board to move the card to',
	},
	{
		displayName: 'Cover Attachment ID',
		name: 'coverAttachmentId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['update'] } },
	},
	{
		displayName: 'Is Due Completed',
		name: 'isDueCompleted',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['card'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Is Subscribed',
		name: 'isSubscribed',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['card'], operation: ['update'] } },
	},
	{
		displayName: 'Stopwatch (JSON)',
		name: 'stopwatch',
		type: 'json',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['create', 'update'] } },
		description: 'Stopwatch object as JSON',
	},
	{
		displayName: 'Search',
		name: 'search',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['getAll'] } },
		description: 'Search term to filter cards',
	},
	{
		displayName: 'User IDs',
		name: 'userIds',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['getAll'] } },
		description: 'Comma-separated user IDs to filter by members or task assignees',
	},
	{
		displayName: 'Label IDs',
		name: 'labelIds',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['card'], operation: ['getAll'] } },
		description: 'Comma-separated label IDs to filter by labels',
	},
];

function parseOptionalJson(value: string | object): object | undefined {
	if (!value) return undefined;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value) as object;
	} catch {
		return undefined;
	}
}

export async function executeCard(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'create') {
		const body = bodyWithOptionalFields({
			name: ctx.getNodeParameter('name', itemIndex) as string,
			position: ctx.getNodeParameter('position', itemIndex) as number,
			description: ctx.getNodeParameter('description', itemIndex) as string,
			type: ctx.getNodeParameter('type', itemIndex) as string,
			dueDate: ctx.getNodeParameter('dueDate', itemIndex) as string,
			isDueCompleted: ctx.getNodeParameter('isDueCompleted', itemIndex) as boolean,
			stopwatch: parseOptionalJson(ctx.getNodeParameter('stopwatch', itemIndex) as string),
		});
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/lists/${ctx.getNodeParameter('listId', itemIndex)}/cards`,
				body,
			}),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('cardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/cards/${id}` }),
		};
	}

	if (operation === 'duplicate') {
		const id = ctx.getNodeParameter('cardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/cards/${id}/duplicate`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					position: ctx.getNodeParameter('position', itemIndex),
				},
			}),
		};
	}

	if (operation === 'getAll') {
		const listId = ctx.getNodeParameter('listId', itemIndex) as string;
		const qs = bodyWithOptionalFields({
			search: ctx.getNodeParameter('search', itemIndex) as string,
			userIds: ctx.getNodeParameter('userIds', itemIndex) as string,
			labelIds: ctx.getNodeParameter('labelIds', itemIndex) as string,
		});
		const items = await paginateCards(ctx, auth, listId, qs);
		return { type: 'items', items };
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('cardId', itemIndex) as string;
		const body = bodyWithOptionalFields({
			listId: ctx.getNodeParameter('listId', itemIndex) as string,
			boardId: ctx.getNodeParameter('boardId', itemIndex) as string,
			name: ctx.getNodeParameter('name', itemIndex) as string,
			description: ctx.getNodeParameter('description', itemIndex) as string,
			position: ctx.getNodeParameter('position', itemIndex) as number,
			type: ctx.getNodeParameter('type', itemIndex) as string,
			dueDate: ctx.getNodeParameter('dueDate', itemIndex) as string,
			coverAttachmentId: ctx.getNodeParameter('coverAttachmentId', itemIndex) as string,
			isDueCompleted: ctx.getNodeParameter('isDueCompleted', itemIndex) as boolean,
			isSubscribed: ctx.getNodeParameter('isSubscribed', itemIndex) as boolean,
			stopwatch: parseOptionalJson(ctx.getNodeParameter('stopwatch', itemIndex) as string),
		});
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/cards/${id}`,
				body,
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('cardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/cards/${id}` }),
		};
	}

	if (operation === 'readNotifications') {
		const id = ctx.getNodeParameter('cardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/cards/${id}/read-notifications`,
			}),
		};
	}

	throw new Error(`Unsupported card operation: ${operation}`);
}
