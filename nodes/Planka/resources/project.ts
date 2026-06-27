import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const projectProperties: INodeProperties[] = [
	operationField(
		'project',
		[
			{ name: 'Create', value: 'create', description: 'Create a new project', action: 'Create a project' },
			{ name: 'Delete', value: 'delete', description: 'Delete a project', action: 'Delete a project' },
			{ name: 'Get', value: 'get', description: 'Get a project by ID', action: 'Get a project' },
			{ name: 'Get Many', value: 'getAll', description: 'Get many projects', action: 'Get many projects' },
			{ name: 'Update', value: 'update', description: 'Update a project', action: 'Update a project' },
		],
		'getAll',
	),
	idField('Project ID', 'projectId', 'project', ['delete', 'get', 'update']),
	nameField(['project'], ['create', 'update']),
	{
		displayName: 'Project Type',
		name: 'projectType',
		type: 'options',
		options: [
			{ name: 'Private', value: 'private' },
			{ name: 'Shared', value: 'shared' },
		],
		default: 'private',
		required: true,
		displayOptions: { show: { resource: ['project'], operation: ['create'] } },
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['project'], operation: ['create', 'update'] } },
	},
];

export async function executeProject(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'getAll') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/projects` }),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('projectId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/projects/${id}` }),
		};
	}

	if (operation === 'create') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/projects`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					type: ctx.getNodeParameter('projectType', itemIndex),
					description: ctx.getNodeParameter('description', itemIndex),
				},
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('projectId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/projects/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					description: ctx.getNodeParameter('description', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('projectId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/projects/${id}` }),
		};
	}

	throw new Error(`Unsupported project operation: ${operation}`);
}
