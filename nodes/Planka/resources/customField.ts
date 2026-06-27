import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField, positionField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const customFieldProperties: INodeProperties[] = [
	operationField(
		'customField',
		[
			{ name: 'Create in Base Group', value: 'createInBaseGroup', description: 'Create a custom field in a base group', action: 'Create base custom field' },
			{ name: 'Create in Group', value: 'createInGroup', description: 'Create a custom field in a group', action: 'Create custom field' },
			{ name: 'Delete', value: 'delete', description: 'Delete a custom field', action: 'Delete custom field' },
			{ name: 'Update', value: 'update', description: 'Update a custom field', action: 'Update custom field' },
		],
		'createInGroup',
	),
	idField('Base Custom Field Group ID', 'baseCustomFieldGroupId', 'customField', ['createInBaseGroup']),
	idField('Custom Field Group ID', 'customFieldGroupId', 'customField', ['createInGroup']),
	idField('Custom Field ID', 'customFieldId', 'customField', ['delete', 'update']),
	nameField(['customField'], ['createInBaseGroup', 'createInGroup', 'update']),
	positionField(['customField'], ['createInBaseGroup', 'createInGroup', 'update']),
	{
		displayName: 'Show On Front Of Card',
		name: 'showOnFrontOfCard',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['customField'], operation: ['createInBaseGroup', 'createInGroup', 'update'] } },
	},
];

export async function executeCustomField(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;
	const body = bodyWithOptionalFields({
		name: ctx.getNodeParameter('name', itemIndex) as string,
		position: ctx.getNodeParameter('position', itemIndex) as number,
		showOnFrontOfCard: ctx.getNodeParameter('showOnFrontOfCard', itemIndex) as boolean,
	});

	if (operation === 'createInBaseGroup') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/base-custom-field-groups/${ctx.getNodeParameter('baseCustomFieldGroupId', itemIndex)}/custom-fields`,
				body,
			}),
		};
	}

	if (operation === 'createInGroup') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/custom-field-groups/${ctx.getNodeParameter('customFieldGroupId', itemIndex)}/custom-fields`,
				body,
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('customFieldId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/custom-fields/${id}`,
				body,
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('customFieldId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/custom-fields/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported customField operation: ${operation}`);
}
