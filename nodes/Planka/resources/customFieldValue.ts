import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

function customFieldValuePath(
	cardId: string,
	customFieldGroupId: string,
	customFieldId: string,
	forPatch: boolean,
): string {
	const segment = `customFieldGroupId:${customFieldGroupId}:customFieldId:${customFieldId}`;
	if (forPatch) {
		return `/api/cards/${cardId}/custom-field-values/${segment}`;
	}
	return `/api/cards/${cardId}/custom-field-value/${segment}`;
}

export const customFieldValueProperties: INodeProperties[] = [
	operationField(
		'customFieldValue',
		[
			{ name: 'Set', value: 'set', description: 'Set a custom field value on a card', action: 'Set custom field value' },
			{ name: 'Clear', value: 'clear', description: 'Clear a custom field value on a card', action: 'Clear custom field value' },
		],
		'set',
	),
	idField('Card ID', 'cardId', 'customFieldValue', ['set', 'clear']),
	idField('Custom Field Group ID', 'customFieldGroupId', 'customFieldValue', ['set', 'clear']),
	idField('Custom Field ID', 'customFieldId', 'customFieldValue', ['set', 'clear']),
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['customFieldValue'], operation: ['set'] } },
	},
];

export async function executeCustomFieldValue(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;
	const cardId = ctx.getNodeParameter('cardId', itemIndex) as string;
	const customFieldGroupId = ctx.getNodeParameter('customFieldGroupId', itemIndex) as string;
	const customFieldId = ctx.getNodeParameter('customFieldId', itemIndex) as string;

	if (operation === 'set') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}${customFieldValuePath(cardId, customFieldGroupId, customFieldId, true)}`,
				body: bodyWithOptionalFields({
					content: ctx.getNodeParameter('content', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'clear') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}${customFieldValuePath(cardId, customFieldGroupId, customFieldId, false)}`,
			}),
		};
	}

	throw new Error(`Unsupported customFieldValue operation: ${operation}`);
}
