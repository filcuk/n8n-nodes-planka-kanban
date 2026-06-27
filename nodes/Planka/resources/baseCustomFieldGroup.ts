import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { idField, nameField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const baseCustomFieldGroupProperties: INodeProperties[] = [
	operationField(
		'baseCustomFieldGroup',
		[
			{ name: 'Create', value: 'create', description: 'Create a base custom field group', action: 'Create base custom field group' },
			{ name: 'Delete', value: 'delete', description: 'Delete a base custom field group', action: 'Delete base custom field group' },
			{ name: 'Update', value: 'update', description: 'Update a base custom field group', action: 'Update base custom field group' },
		],
		'create',
	),
	idField('Project ID', 'projectId', 'baseCustomFieldGroup', ['create']),
	idField('Base Custom Field Group ID', 'baseCustomFieldGroupId', 'baseCustomFieldGroup', ['delete', 'update']),
	nameField(['baseCustomFieldGroup'], ['create', 'update']),
];

export async function executeBaseCustomFieldGroup(
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
				url: `${baseUrl}/api/projects/${ctx.getNodeParameter('projectId', itemIndex)}/base-custom-field-groups`,
				body: { name: ctx.getNodeParameter('name', itemIndex) },
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('baseCustomFieldGroupId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/base-custom-field-groups/${id}`,
				body: bodyWithOptionalFields({
					name: ctx.getNodeParameter('name', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('baseCustomFieldGroupId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'DELETE',
				url: `${baseUrl}/api/base-custom-field-groups/${id}`,
			}),
		};
	}

	throw new Error(`Unsupported baseCustomFieldGroup operation: ${operation}`);
}
