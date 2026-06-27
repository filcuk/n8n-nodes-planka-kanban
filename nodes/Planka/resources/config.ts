import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const configProperties: INodeProperties[] = [
	operationField(
		'config',
		[
			{ name: 'Get', value: 'get', description: 'Get application configuration', action: 'Get config' },
			{ name: 'Test SMTP', value: 'testSmtp', description: 'Test SMTP configuration', action: 'Test SMTP' },
			{ name: 'Update', value: 'update', description: 'Update application configuration', action: 'Update config' },
		],
		'get',
	),
	{
		displayName: 'SMTP Host',
		name: 'smtpHost',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP Port',
		name: 'smtpPort',
		type: 'number',
		default: 587,
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP Name',
		name: 'smtpName',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP Secure',
		name: 'smtpSecure',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP TLS Reject Unauthorized',
		name: 'smtpTlsRejectUnauthorized',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP User',
		name: 'smtpUser',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP Password',
		name: 'smtpPassword',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
	{
		displayName: 'SMTP From',
		name: 'smtpFrom',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['config'], operation: ['update'] } },
	},
];

export async function executeConfig(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'get') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/config` }),
		};
	}

	if (operation === 'update') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/config`,
				body: bodyWithOptionalFields({
					smtpHost: ctx.getNodeParameter('smtpHost', itemIndex) as string,
					smtpPort: ctx.getNodeParameter('smtpPort', itemIndex) as number,
					smtpName: ctx.getNodeParameter('smtpName', itemIndex) as string,
					smtpSecure: ctx.getNodeParameter('smtpSecure', itemIndex) as boolean,
					smtpTlsRejectUnauthorized: ctx.getNodeParameter('smtpTlsRejectUnauthorized', itemIndex) as boolean,
					smtpUser: ctx.getNodeParameter('smtpUser', itemIndex) as string,
					smtpPassword: ctx.getNodeParameter('smtpPassword', itemIndex) as string,
					smtpFrom: ctx.getNodeParameter('smtpFrom', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'testSmtp') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'POST', url: `${baseUrl}/api/config/test-smtp` }),
		};
	}

	throw new Error(`Unsupported config operation: ${operation}`);
}
