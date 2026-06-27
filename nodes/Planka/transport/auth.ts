import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { PlankaAuth } from '../types';

export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/$/, '');
}

export async function authenticate(ctx: IExecuteFunctions): Promise<PlankaAuth> {
	const credentials = await ctx.getCredentials('plankaApi');
	const baseUrl = normalizeBaseUrl(credentials.baseUrl as string);
	const authentication = (credentials.authentication as string) || 'password';

	if (authentication === 'apiKey') {
		const apiKey = credentials.apiKey as string;
		if (!apiKey) {
			throw new NodeApiError(ctx.getNode(), {}, { message: 'API Key is required.' });
		}
		return {
			baseUrl,
			headers: {
				Accept: 'application/json',
				'X-Api-Key': apiKey,
			},
		};
	}

	const loginResponse = await ctx.helpers.httpRequest({
		method: 'POST',
		url: `${baseUrl}/api/access-tokens`,
		body: {
			emailOrUsername: credentials.emailOrUsername,
			password: credentials.password,
		},
		json: true,
	});

	const accessToken = loginResponse.item;
	if (!accessToken) {
		throw new NodeApiError(ctx.getNode(), loginResponse, {
			message: 'Authentication Failed: Could not retrieve access token.',
		});
	}

	return {
		baseUrl,
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	};
}
