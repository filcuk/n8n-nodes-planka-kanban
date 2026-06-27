import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const taskProperties: INodeProperties[] = [
	operationField(
		'task',
		[
			{ name: 'Create a Task', value: 'create', action: 'Create task' },
			{ name: 'Delete Task', value: 'delete', description: 'Delete a task', action: 'Delete task' },
			{ name: 'Update Task', value: 'update', description: 'Update a task', action: 'Update task' },
		],
		'create',
	),
	idField('Tasklist ID', 'tasklistId', 'task', ['create']),
	idField('Task ID', 'taskId', 'task', ['delete', 'update']),
	nameField(['task'], ['create', 'update']),
	positionField(['task'], ['create', 'update']),
	{
		displayName: 'Is Task Completed',
		name: 'isCompleted',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['task'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Assignee User ID',
		name: 'assigneeUserId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['task'], operation: ['create', 'update'] } },
	},
];

export async function executeTask(
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
				url: `${baseUrl}/api/task-lists/${ctx.getNodeParameter('tasklistId', itemIndex)}/tasks`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					position: ctx.getNodeParameter('position', itemIndex) as number,
					isCompleted: ctx.getNodeParameter('isCompleted', itemIndex) as boolean,
					assigneeUserId: ctx.getNodeParameter('assigneeUserId', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'update') {
		const taskId = ctx.getNodeParameter('taskId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/tasks/${taskId}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					position: ctx.getNodeParameter('position', itemIndex) as number,
					isCompleted: ctx.getNodeParameter('isCompleted', itemIndex) as boolean,
					assigneeUserId: ctx.getNodeParameter('assigneeUserId', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const taskId = ctx.getNodeParameter('taskId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/tasks/${taskId}`,
			}),
		};
	}

	throw new Error(`Unsupported task operation: ${operation}`);
}
