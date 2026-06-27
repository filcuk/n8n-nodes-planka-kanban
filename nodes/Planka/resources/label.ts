import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, labelColorOptions, nameField, operationField } from '../descriptions/shared';
import { plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const labelProperties: INodeProperties[] = [
	operationField(
		'label',
		[
			{ name: 'Add to Card', value: 'addToCard', description: 'Add a label to a card', action: 'Add label to card' },
			{ name: 'Create Label', value: 'create', description: 'Create a label on a board', action: 'Create label' },
			{ name: 'Delete a Label', value: 'delete', action: 'Delete label' },
			{ name: 'Remove From Card', value: 'removeFromCard', description: 'Remove a label from a card', action: 'Remove label from card' },
			{ name: 'Update Label', value: 'update', description: 'Update a label', action: 'Update label' },
		],
		'addToCard',
	),
	idField('Board ID', 'boardId', 'label', ['create']),
	idField('Card ID', 'cardId', 'label', ['addToCard', 'removeFromCard']),
	idField('Label ID', 'labelId', 'label', ['addToCard', 'delete', 'update', 'removeFromCard']),
	nameField(['label'], ['create', 'update']),
	{
		displayName: 'Color',
		name: 'color',
		type: 'options',
		options: labelColorOptions,
		default: 'pirate-gold',
		displayOptions: { show: { resource: ['label'], operation: ['create', 'update'] } },
	},
];

export async function executeLabel(
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
				url: `${baseUrl}/api/boards/${ctx.getNodeParameter('boardId', itemIndex)}/labels`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					color: ctx.getNodeParameter('color', itemIndex),
					position: 65536,
				},
			}),
		};
	}

	if (operation === 'addToCard') {
		const cardId = ctx.getNodeParameter('cardId', itemIndex) as string;
		const labelId = ctx.getNodeParameter('labelId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/cards/${cardId}/card-labels`,
				body: { labelId },
			}),
		};
	}

	if (operation === 'removeFromCard') {
		const cardId = ctx.getNodeParameter('cardId', itemIndex) as string;
		const labelId = ctx.getNodeParameter('labelId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/cards/${cardId}/card-labels/labelId:${labelId}`,
			}),
		};
	}

	if (operation === 'delete') {
		const labelId = ctx.getNodeParameter('labelId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/labels/${labelId}`,
			}),
		};
	}

	if (operation === 'update') {
		const labelId = ctx.getNodeParameter('labelId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/labels/${labelId}`,
				body: {
					name: ctx.getNodeParameter('name', itemIndex),
					color: ctx.getNodeParameter('color', itemIndex),
					position: 65536,
				},
			}),
		};
	}

	throw new Error(`Unsupported label operation: ${operation}`);
}
