import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField, userIdField } from '../descriptions/shared';
import { plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const cardMembershipProperties: INodeProperties[] = [
	operationField(
		'cardMembership',
		[
			{ name: 'Add', value: 'add', description: 'Add a user to a card', action: 'Add card member' },
			{ name: 'Remove', value: 'remove', description: 'Remove a user from a card', action: 'Remove card member' },
		],
		'add',
	),
	idField('Card ID', 'cardId', 'cardMembership', ['add', 'remove']),
	userIdField('cardMembership', ['add', 'remove']),
];

export async function executeCardMembership(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;
	const cardId = ctx.getNodeParameter('cardId', itemIndex) as string;
	const userId = ctx.getNodeParameter('userId', itemIndex) as string;

	if (operation === 'add') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/cards/${cardId}/card-memberships`,
				body: { userId },
			}),
		};
	}

	if (operation === 'remove') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/cards/${cardId}/card-memberships/userId:${userId}`,
			}),
		};
	}

	throw new Error(`Unsupported cardMembership operation: ${operation}`);
}
