import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, listColorOptions, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const listProperties: INodeProperties[] = [
	operationField(
		'list',
		[
			{ name: 'Clear', value: 'clear', description: 'Clear all cards from a list', action: 'Clear a list' },
			{ name: 'Create', value: 'create', description: 'Create a list on a board', action: 'Create a list' },
			{ name: 'Delete', value: 'delete', description: 'Delete a list', action: 'Delete a list' },
			{ name: 'Get', value: 'get', description: 'Get a list by ID', action: 'Get a list' },
			{ name: 'Move Cards', value: 'moveCards', description: 'Move cards to archive list', action: 'Move list cards' },
			{ name: 'Sort', value: 'sort', description: 'Sort cards in a list', action: 'Sort list cards' },
			{ name: 'Update', value: 'update', description: 'Update a list', action: 'Update a list' },
		],
		'create',
	),
	idField('Board ID', 'boardId', 'list', ['create']),
	idField('List ID', 'listId', 'list', ['clear', 'delete', 'get', 'moveCards', 'sort', 'update']),
	idField('Target List ID', 'targetListId', 'list', ['moveCards']),
	nameField(['list'], ['create', 'update']),
	positionField(['list'], ['create', 'update']),
	{
		displayName: 'List Type',
		name: 'listType',
		type: 'options',
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'Closed', value: 'closed' },
		],
		default: 'active',
		required: true,
		displayOptions: { show: { resource: ['list'], operation: ['create'] } },
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'options',
		options: listColorOptions,
		default: 'berry-red',
		displayOptions: { show: { resource: ['list'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Sort Field',
		name: 'sortFieldName',
		type: 'options',
		options: [
			{ name: 'Name', value: 'name' },
			{ name: 'Due Date', value: 'dueDate' },
			{ name: 'Created At', value: 'createdAt' },
		],
		default: 'name',
		required: true,
		displayOptions: { show: { resource: ['list'], operation: ['sort'] } },
	},
	{
		displayName: 'Sort Order',
		name: 'sortOrder',
		type: 'options',
		options: [
			{ name: 'Ascending', value: 'asc' },
			{ name: 'Descending', value: 'desc' },
		],
		default: 'asc',
		displayOptions: { show: { resource: ['list'], operation: ['sort'] } },
	},
];

export async function executeList(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'create') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/boards/${ctx.getNodeParameter('boardId', itemIndex)}/lists`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					position: ctx.getNodeParameter('position', itemIndex),
					type: ctx.getNodeParameter('listType', itemIndex),
					color: ctx.getNodeParameter('color', itemIndex),
				},
			}),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('listId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/lists/${id}` }),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('listId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/lists/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					position: ctx.getNodeParameter('position', itemIndex) as number,
					color: ctx.getNodeParameter('color', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('listId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/lists/${id}` }),
		};
	}

	if (operation === 'clear') {
		const id = ctx.getNodeParameter('listId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'POST', url: `${baseUrl}/api/lists/${id}/clear` }),
		};
	}

	if (operation === 'moveCards') {
		const id = ctx.getNodeParameter('listId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/lists/${id}/move-cards`,
				body: { listId: ctx.getNodeParameter('targetListId', itemIndex) },
			}),
		};
	}

	if (operation === 'sort') {
		const id = ctx.getNodeParameter('listId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/lists/${id}/sort`,
				body: bodyWithOptionalFields({
					fieldName: ctx.getNodeParameter('sortFieldName', itemIndex) as string,
					order: ctx.getNodeParameter('sortOrder', itemIndex) as string,
				}),
			}),
		};
	}

	throw new Error(`Unsupported list operation: ${operation}`);
}
