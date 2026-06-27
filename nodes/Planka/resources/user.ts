import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import { binaryPropertyField, idField, nameField, operationField } from '../descriptions/shared';
import { bodyWithOptionalFields, plankaMultipartRequest, plankaRequest } from '../transport/request';
import type { PlankaAuth, PlankaExecuteResult } from '../types';

const userRoleOptions = [
	{ name: 'Admin', value: 'admin' },
	{ name: 'Project Owner', value: 'projectOwner' },
	{ name: 'Board User', value: 'boardUser' },
];

export const userProperties: INodeProperties[] = [
	operationField(
		'user',
		[
			{ name: 'Create', value: 'create', description: 'Create a user', action: 'Create user' },
			{ name: 'Create API Key', value: 'createApiKey', description: 'Create an API key for a user', action: 'Create user API key' },
			{ name: 'Delete', value: 'delete', description: 'Delete a user', action: 'Delete user' },
			{ name: 'Get', value: 'get', description: 'Get a user', action: 'Get user' },
			{ name: 'Get Many', value: 'getAll', description: 'Get all users', action: 'Get many users' },
			{ name: 'Update', value: 'update', description: 'Update a user', action: 'Update user' },
			{ name: 'Update Email', value: 'updateEmail', description: 'Update user email', action: 'Update user email' },
			{ name: 'Update Password', value: 'updatePassword', description: 'Update user password', action: 'Update user password' },
			{ name: 'Update Username', value: 'updateUsername', description: 'Update user username', action: 'Update user username' },
			{ name: 'Upload Avatar', value: 'uploadAvatar', description: 'Upload user avatar', action: 'Upload user avatar' },
		],
		'getAll',
	),
	idField('User ID', 'userId', 'user', ['delete', 'get', 'update', 'createApiKey', 'uploadAvatar', 'updateEmail', 'updatePassword', 'updateUsername']),
	nameField(['user'], ['create', 'update'], false),
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'updateEmail'] } },
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'updateUsername'] } },
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'updatePassword'] } },
	},
	{
		displayName: 'Current Password',
		name: 'currentPassword',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['updateEmail', 'updatePassword', 'updateUsername'] } },
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		options: userRoleOptions,
		default: 'boardUser',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Organization',
		name: 'organization',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['user'], operation: ['create', 'update'] } },
	},
	binaryPropertyField('user', ['uploadAvatar']),
];

export async function executeUser(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
): Promise<PlankaExecuteResult> {
	const { baseUrl } = auth;

	if (operation === 'getAll') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/users` }),
		};
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'GET', url: `${baseUrl}/api/users/${id}` }),
		};
	}

	if (operation === 'create') {
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/users`,
				body: bodyWithOptionalFields({
					email: ctx.getNodeParameter('email', itemIndex) as string,
					password: ctx.getNodeParameter('password', itemIndex) as string,
					role: ctx.getNodeParameter('role', itemIndex) as string,
					name: ctx.getNodeParameter('name', itemIndex) as string,
					username: ctx.getNodeParameter('username', itemIndex) as string,
					phone: ctx.getNodeParameter('phone', itemIndex) as string,
					organization: ctx.getNodeParameter('organization', itemIndex) as string,
					language: ctx.getNodeParameter('language', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/users/${id}`,
				body: bodyWithOptionalFields({
					role: ctx.getNodeParameter('role', itemIndex) as string,
					name: ctx.getNodeParameter('name', itemIndex) as string,
					phone: ctx.getNodeParameter('phone', itemIndex) as string,
					organization: ctx.getNodeParameter('organization', itemIndex) as string,
					language: ctx.getNodeParameter('language', itemIndex) as string,
				}),
			}),
		};
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'DELETE', url: `${baseUrl}/api/users/${id}` }),
		};
	}

	if (operation === 'createApiKey') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, { method: 'POST', url: `${baseUrl}/api/users/${id}/api-key` }),
		};
	}

	if (operation === 'updateEmail') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/users/${id}/email`,
				body: {
					email: ctx.getNodeParameter('email', itemIndex),
					currentPassword: ctx.getNodeParameter('currentPassword', itemIndex),
				},
			}),
		};
	}

	if (operation === 'updatePassword') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/users/${id}/password`,
				body: {
					password: ctx.getNodeParameter('password', itemIndex),
					currentPassword: ctx.getNodeParameter('currentPassword', itemIndex),
				},
			}),
		};
	}

	if (operation === 'updateUsername') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		return {
			type: 'json',
			data: await plankaRequest(ctx, auth, {
				method: 'PATCH',
				url: `${baseUrl}/api/users/${id}/username`,
				body: {
					username: ctx.getNodeParameter('username', itemIndex),
					currentPassword: ctx.getNodeParameter('currentPassword', itemIndex),
				},
			}),
		};
	}

	if (operation === 'uploadAvatar') {
		const id = ctx.getNodeParameter('userId', itemIndex) as string;
		const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', itemIndex) as string;
		const binaryData = ctx.helpers.assertBinaryData(itemIndex, binaryPropertyName);
		const buffer = await ctx.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
		return {
			type: 'json',
			data: await plankaMultipartRequest(ctx, auth, {
				method: 'POST',
				url: `${baseUrl}/api/users/${id}/avatar`,
				body: {
					file: {
						value: buffer,
						options: {
							filename: binaryData.fileName || 'avatar',
							contentType: binaryData.mimeType || 'image/png',
						},
					},
				},
			}),
		};
	}

	throw new Error(`Unsupported user operation: ${operation}`);
}
