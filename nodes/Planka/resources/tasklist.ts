import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const tasklistProperties: INodeProperties[] = [
	operationField(
		'tasklist',
		[
			{ name: 'Create a Task List', value: 'create', action: 'Create tasklist' },
			{ name: 'Delete Task List', value: 'delete', description: 'Delete a task list', action: 'Delete tasklist' },
			{ name: 'Get Task List', value: 'get', description: 'Get task list details', action: 'Get tasklist' },
			{ name: 'Update Task List', value: 'update', description: 'Update a task list', action: 'Update tasklist' },
		],
		'create',
	),
	idField('Card ID', 'cardId', 'tasklist', ['create']),
	idField('Tasklist ID', 'tasklistId', 'tasklist', ['delete', 'get', 'update']),
	nameField(['tasklist'], ['create', 'update']),
	positionField(['tasklist'], ['create', 'update']),
];

export async function executeTasklist(
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
				url: `${baseUrl}/api/cards/${ctx.getNodeParameter('cardId', itemIndex)}/task-lists`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					position: ctx.getNodeParameter('position', itemIndex),
				},
			}),
		};
	}

	if (operation === 'get') {
		const tasklistId = ctx.getNodeParameter('tasklistId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'GET',
				url: `${baseUrl}/api/task-lists/${tasklistId}`,
			}),
		};
	}

	if (operation === 'update') {
		const tasklistId = ctx.getNodeParameter('tasklistId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/task-lists/${tasklistId}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					position: ctx.getNodeParameter('position', itemIndex) as number,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const tasklistId = ctx.getNodeParameter('tasklistId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/task-lists/${tasklistId}`,
			}),
		};
	}

	throw new Error(`Unsupported tasklist operation: ${operation}`);
}
