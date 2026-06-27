import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField, userIdField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const boardMembershipProperties: INodeProperties[] = [
	operationField(
		'boardMembership',
		[
			{ name: 'Create', value: 'create', description: 'Add a user to a board', action: 'Create board membership' },
			{ name: 'Delete', value: 'delete', description: 'Remove a board membership', action: 'Delete board membership' },
			{ name: 'Update', value: 'update', description: 'Update a board membership', action: 'Update board membership' },
		],
		'create',
	),
	idField('Board ID', 'boardId', 'boardMembership', ['create']),
	idField('Board Membership ID', 'boardMembershipId', 'boardMembership', ['delete', 'update']),
	userIdField('boardMembership', ['create']),
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		options: [
			{ name: 'Editor', value: 'editor' },
			{ name: 'Viewer', value: 'viewer' },
		],
		default: 'editor',
		displayOptions: { show: { resource: ['boardMembership'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Can Comment',
		name: 'canComment',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['boardMembership'], operation: ['create', 'update'] } },
	},
];

export async function executeBoardMembership(
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
				url: `${baseUrl}/api/boards/${ctx.getNodeParameter('boardId', itemIndex)}/board-memberships`,
				body: bodyWithOptionalFields({
					userId: ctx.getNodeParameter('userId', itemIndex) as string,
					role: ctx.getNodeParameter('role', itemIndex) as string,
					canComment: ctx.getNodeParameter('canComment', itemIndex) as boolean,
				}),
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('boardMembershipId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/board-memberships/${id}`,
				body: bodyWithOptionalFields({
					role: ctx.getNodeParameter('role', itemIndex) as string,
					canComment: ctx.getNodeParameter('canComment', itemIndex) as boolean,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('boardMembershipId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/board-memberships/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported boardMembership operation: ${operation}`);
}
