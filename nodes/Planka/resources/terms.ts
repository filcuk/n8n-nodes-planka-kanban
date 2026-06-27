import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const termsProperties: INodeProperties[] = [
	operationField(
		'terms',
		[{ name: 'Get', value: 'get', description: 'Get terms and conditions', action: 'Get terms' }],
		'get',
	),
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['terms'], operation: ['get'] } },
	},
];

export async function executeTerms(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	if (operation === 'get') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'GET',
				url: `${auth.baseUrl}/api/terms`,
				qs: bodyWithOptionalFields({
					language: ctx.getNodeParameter('language', itemIndex) as string,
				}),
			}),
		};
	}

	throw new Error(`Unsupported terms operation: ${operation}`);
}
