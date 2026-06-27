import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField, userIdField } from '../descriptions/shared';
import { plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const projectManagerProperties: INodeProperties[] = [
	operationField(
		'projectManager',
		[
			{ name: 'Create', value: 'create', description: 'Add a project manager', action: 'Create project manager' },
			{ name: 'Delete', value: 'delete', description: 'Remove a project manager', action: 'Delete project manager' },
		],
		'create',
	),
	idField('Project ID', 'projectId', 'projectManager', ['create']),
	idField('Project Manager ID', 'projectManagerId', 'projectManager', ['delete']),
	userIdField('projectManager', ['create']),
];

export async function executeProjectManager(
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
				url: `${baseUrl}/api/projects/${ctx.getNodeParameter('projectId', itemIndex)}/project-managers`,
				body: { userId: ctx.getNodeParameter('userId', itemIndex) },
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('projectManagerId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/project-managers/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported projectManager operation: ${operation}`);
}
