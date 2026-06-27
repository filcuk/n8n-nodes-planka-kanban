import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { operationField } from '../descriptions/shared';
import { plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const bootstrapProperties: INodeProperties[] = [
	operationField(
		'bootstrap',
		[{ name: 'Get', value: 'get', description: 'Get application bootstrap data', action: 'Get bootstrap' }],
		'get',
	),
];

export async function executeBootstrap(
	ctx: IExecuteFunctions,
	_itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	if (operation === 'get') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${auth.baseUrl}/api/bootstrap` }),
		};
	}

	throw new Error(`Unsupported bootstrap operation: ${operation}`);
}
