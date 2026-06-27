import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const actionProperties: INodeProperties[] = [
	operationField(
		'action',
		[
			{ name: 'Get Board Actions', value: 'getBoardActions', description: 'Get actions for a board', action: 'Get board actions' },
			{ name: 'Get Card Actions', value: 'getCardActions', description: 'Get actions for a card', action: 'Get card actions' },
		],
		'getBoardActions',
	),
	idField('Board ID', 'boardId', 'action', ['getBoardActions']),
	idField('Card ID', 'cardId', 'action', ['getCardActions']),
	{
		displayName: 'Before ID',
		name: 'beforeId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['action'], operation: ['getBoardActions', 'getCardActions'] } },
		description: 'Pagination cursor — ID of the last action from the previous page',
	},
];

export async function executeAction(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;
	const qs = bodyWithOptionalFields({
		beforeId: ctx.getNodeParameter('beforeId', itemIndex) as string,
	});

	if (operation === 'getBoardActions') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'GET',
				url: `${baseUrl}/api/boards/${ctx.getNodeParameter('boardId', itemIndex)}/actions`,
				qs,
			}),
		};
	}

	if (operation === 'getCardActions') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'GET',
				url: `${baseUrl}/api/cards/${ctx.getNodeParameter('cardId', itemIndex)}/actions`,
				qs,
			}),
		};
	}

	throw new Error(`Unsupported action operation: ${operation}`);
}
