import {
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class PlankaApi implements ICredentialType {
    name = 'plankaApi';
    displayName = 'Planka API';
    documentationUrl = 'https://github.com/plankanban/planka';

    // Define the fields
    properties: INodeProperties[] = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'http://localhost:3000',
            description: 'The URL of your Planka instance (e.g. http://localhost:3000)',
        },
        {
            displayName: 'Email or Username',
            name: 'emailOrUsername',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Password',
            name: 'password',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
        },
    ];

    test: ICredentialTestRequest = {
        request: {
            // We use the baseUrl provided by the user
            baseURL: '={{$credentials.baseUrl}}',
            // We try to login. If 200 OK, test passes. If 401/403, test fails.
            url: '/api/access-tokens',
            method: 'POST',
            body: {
                emailOrUsername: '={{$credentials.emailOrUsername}}',
                password: '={{$credentials.password}}',
            },
        },
    };
}