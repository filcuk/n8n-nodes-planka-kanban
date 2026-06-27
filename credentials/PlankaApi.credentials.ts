import {
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestMethods,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class PlankaApi implements ICredentialType {
	name = 'plankaApi';
	displayName = 'Planka API';
	documentationUrl = 'https://github.com/plankanban/planka';
	icon: Icon = { light: 'file:../icons/planka.svg', dark: 'file:../icons/planka.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:3000',
			description: 'The URL of your Planka instance (e.g. http://localhost:3000)',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'options',
			options: [
				{ name: 'Email and Password', value: 'password' },
				{ name: 'API Key', value: 'apiKey' },
			],
			default: 'password',
		},
		{
			displayName: 'Email or Username',
			name: 'emailOrUsername',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authentication: ['password'],
				},
			},
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authentication: ['password'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authentication: ['apiKey'],
				},
			},
			description: 'User API key (X-Api-Key header). Create via User → Create API Key.',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/$/, "")}}',
			url: '={{$credentials.authentication === "apiKey" ? "/api/bootstrap" : "/api/access-tokens"}}',
			method: '={{$credentials.authentication === "apiKey" ? "GET" : "POST"}}' as IHttpRequestMethods,
			headers: {
				'X-Api-Key': '={{$credentials.authentication === "apiKey" ? $credentials.apiKey : undefined}}',
			},
			body: {
				emailOrUsername: '={{$credentials.authentication === "password" ? $credentials.emailOrUsername : undefined}}',
				password: '={{$credentials.authentication === "password" ? $credentials.password : undefined}}',
			},
		},
	};
}
