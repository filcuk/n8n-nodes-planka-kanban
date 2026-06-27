import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField } from '../descriptions/shared';
import { plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const commentProperties: INodeProperties[] = [
	operationField(
		'comment',
		[
			{ name: 'Create', value: 'create', description: 'Add a comment to a card', action: 'Create a comment' },
			{ name: 'Delete', value: 'delete', description: 'Delete a comment', action: 'Delete a comment' },
			{ name: 'Get Many', value: 'getAll', description: 'Get comments for a card', action: 'Get many comments' },
			{ name: 'Update', value: 'update', description: 'Update a comment', action: 'Update a comment' },
		],
		'create',
	),
	idField('Card ID', 'cardId', 'comment', ['create', 'getAll']),
	idField('Comment ID', 'commentId', 'comment', ['update', 'delete']),
	{
		displayName: 'Comment Text',
		name: 'text',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['comment'], operation: ['create', 'update'] } },
	},
];

export async function executeComment(
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
				url: `${baseUrl}/api/cards/${ctx.getNodeParameter('cardId', itemIndex)}/comments`,
				body: { text: ctx.getNodeParameter('text', itemIndex) },
			}),
		};
	}

	if (operation === 'update') {
		const commentId = ctx.getNodeParameter('commentId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/comments/${commentId}`,
				body: { text: ctx.getNodeParameter('text', itemIndex) },
			}),
		};
	}

	if (operation === 'getAll') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'GET',
				url: `${baseUrl}/api/cards/${ctx.getNodeParameter('cardId', itemIndex)}/comments`,
			}),
		};
	}

	if (operation === 'delete') {
		const commentId = ctx.getNodeParameter('commentId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/comments/${commentId}`,
			}),
		};
	}

	throw new Error(`Unsupported comment operation: ${operation}`);
}
