import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const customFieldGroupProperties: INodeProperties[] = [
	operationField(
		'customFieldGroup',
		[
			{ name: 'Create on Board', value: 'createOnBoard', description: 'Create a custom field group on a board', action: 'Create board custom field group' },
			{ name: 'Create on Card', value: 'createOnCard', description: 'Create a custom field group on a card', action: 'Create card custom field group' },
			{ name: 'Delete', value: 'delete', description: 'Delete a custom field group', action: 'Delete custom field group' },
			{ name: 'Get', value: 'get', description: 'Get a custom field group', action: 'Get custom field group' },
			{ name: 'Update', value: 'update', description: 'Update a custom field group', action: 'Update custom field group' },
		],
		'get',
	),
	idField('Board ID', 'boardId', 'customFieldGroup', ['createOnBoard']),
	idField('Card ID', 'cardId', 'customFieldGroup', ['createOnCard']),
	idField('Custom Field Group ID', 'customFieldGroupId', 'customFieldGroup', ['delete', 'get', 'update']),
	idField('Base Custom Field Group ID', 'baseCustomFieldGroupId', 'customFieldGroup', ['createOnBoard', 'createOnCard']),
	nameField(['customFieldGroup'], ['createOnBoard', 'createOnCard', 'update']),
	positionField(['customFieldGroup'], ['createOnBoard', 'createOnCard', 'update']),
];

export async function executeCustomFieldGroup(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;
	const body = bodyWithOptionalFields({
		baseCustomFieldGroupId: ctx.getNodeParameter('baseCustomFieldGroupId', itemIndex) as string,
		name: ctx.getNodeParameter('name', itemIndex) as string,
		position: ctx.getNodeParameter('position', itemIndex) as number,
	});

	if (operation === 'createOnBoard') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/boards/${ctx.getNodeParameter('boardId', itemIndex)}/custom-field-groups`,
				body,
			}),
		};
	}

	if (operation === 'createOnCard') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/cards/${ctx.getNodeParameter('cardId', itemIndex)}/custom-field-groups`,
				body,
			}),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('customFieldGroupId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'GET',
				url: `${baseUrl}/api/custom-field-groups/${id}`,
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('customFieldGroupId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/custom-field-groups/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
					position: ctx.getNodeParameter('position', itemIndex) as number,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('customFieldGroupId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/custom-field-groups/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported customFieldGroup operation: ${operation}`);
}
