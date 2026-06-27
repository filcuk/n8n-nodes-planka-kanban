import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const boardProperties: INodeProperties[] = [
	operationField(
		'board',
		[
			{ name: 'Create', value: 'create', description: 'Create a board inside a project', action: 'Create a board' },
			{ name: 'Delete', value: 'delete', description: 'Delete a board', action: 'Delete a board' },
			{ name: 'Get', value: 'get', description: 'Get a board by ID', action: 'Get a board' },
			{ name: 'Update', value: 'update', description: 'Update a board', action: 'Update a board' },
		],
		'create',
	),
	idField('Project ID', 'projectId', 'board', ['create']),
	idField('Board ID', 'boardId', 'board', ['delete', 'get', 'update'], false),
	nameField(['board'], ['create', 'update']),
	positionField(['board'], ['create', 'update']),
	{
		displayName: 'Default View',
		name: 'defaultView',
		type: 'options',
		options: [
			{ name: 'Kanban', value: 'kanban' },
			{ name: 'Grid', value: 'grid' },
			{ name: 'List', value: 'list' },
		],
		default: 'kanban',
		displayOptions: { show: { resource: ['board'], operation: ['update'] } },
	},
	{
		displayName: 'Default Card Type',
		name: 'defaultCardType',
		type: 'options',
		options: [
			{ name: 'Project', value: 'project' },
			{ name: 'Story', value: 'story' },
		],
		default: 'project',
		displayOptions: { show: { resource: ['board'], operation: ['update'] } },
	},
];

export async function executeBoard(
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
				url: `${baseUrl}/api/projects/${ctx.getNodeParameter('projectId', itemIndex)}/boards`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					position: ctx.getNodeParameter('position', itemIndex),
				},
			}),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('boardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/boards/${id}` }),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('boardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/boards/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					position: ctx.getNodeParameter('position', itemIndex) as number,
					defaultCardType: ctx.getNodeParameter('defaultCardType', itemIndex) as string,
					defaultView: ctx.getNodeParameter('defaultView', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('boardId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/boards/${id}` }),
		};
	}

	throw new Error(`Unsupported board operation: ${operation}`);
}
