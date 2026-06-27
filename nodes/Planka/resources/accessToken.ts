import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

export const accessTokenProperties: INodeProperties[] = [
	operationField(
		'accessToken',
		[
			{ name: 'Accept Terms', value: 'acceptTerms', description: 'Accept terms and conditions', action: 'Accept terms' },
			{ name: 'Exchange OIDC', value: 'exchangeOidc', description: 'Exchange OIDC code for access token', action: 'Exchange OIDC token' },
			{ name: 'Logout', value: 'logout', description: 'Log out current user', action: 'Logout' },
			{ name: 'Revoke Pending Token', value: 'revokePending', description: 'Revoke a pending token', action: 'Revoke pending token' },
		],
		'logout',
	),
	{
		displayName: 'Pending Token',
		name: 'pendingToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		displayOptions: { show: { resource: ['accessToken'], operation: ['acceptTerms', 'revokePending'] } },
	},
	{
		displayName: 'Signature',
		name: 'signature',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['accessToken'], operation: ['acceptTerms'] } },
	},
	{
		displayName: 'Initial Language',
		name: 'initialLanguage',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['accessToken'], operation: ['acceptTerms'] } },
	},
	{
		displayName: 'OIDC Code',
		name: 'code',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['accessToken'], operation: ['exchangeOidc'] } },
	},
	{
		displayName: 'Nonce',
		name: 'nonce',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['accessToken'], operation: ['exchangeOidc'] } },
	},
	{
		displayName: 'With HTTP Only Token',
		name: 'withHttpOnlyToken',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['accessToken'], operation: ['exchangeOidc'] } },
	},
];

export async function executeAccessToken(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'logout') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/access-tokens/me` }),
		};
	}

	if (operation === 'acceptTerms') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/access-tokens/accept-terms`,
				body: bodyWithOptionalFields({
					pendingToken: ctx.getNodeParameter('pendingToken', itemIndex) as string,
					signature: ctx.getNodeParameter('signature', itemIndex) as string,
					initialLanguage: ctx.getNodeParameter('initialLanguage', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'exchangeOidc') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/access-tokens/exchange-with-oidc`,
				body: bodyWithOptionalFields({
					code: ctx.getNodeParameter('code', itemIndex) as string,
					nonce: ctx.getNodeParameter('nonce', itemIndex) as string,
					withHttpOnlyToken: ctx.getNodeParameter('withHttpOnlyToken', itemIndex) as boolean,
				}),
			}),
		};
	}

	if (operation === 'revokePending') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/access-tokens/revoke-pending-token`,
				body: { pendingToken: ctx.getNodeParameter('pendingToken', itemIndex) },
			}),
		};
	}

	throw new Error(`Unsupported accessToken operation: ${operation}`);
}
