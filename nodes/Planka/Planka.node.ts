import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { executeResource, getAllResourceProperties } from './resources';
import { authenticate } from './transport/auth';

export class Planka implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Planka',
		name: 'planka',
		icon: { light: 'file:../../icons/planka.svg', dark: 'file:../../icons/planka.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Planka API 2.0',
		defaults: {
			name: 'Planka',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'plankaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Access Token', value: 'accessToken' },
					{ name: 'Action', value: 'action' },
					{ name: 'Attachment', value: 'attachment' },
					{ name: 'Background Image', value: 'backgroundImage' },
					{ name: 'Base Custom Field Group', value: 'baseCustomFieldGroup' },
					{ name: 'Board', value: 'board' },
					{ name: 'Board Membership', value: 'boardMembership' },
					{ name: 'Bootstrap', value: 'bootstrap' },
					{ name: 'Card', value: 'card' },
					{ name: 'Card Membership', value: 'cardMembership' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Config', value: 'config' },
					{ name: 'Custom Field', value: 'customField' },
					{ name: 'Custom Field Group', value: 'customFieldGroup' },
					{ name: 'Custom Field Value', value: 'customFieldValue' },
					{ name: 'Label', value: 'label' },
					{ name: 'List', value: 'list' },
					{ name: 'Notification', value: 'notification' },
					{ name: 'Notification Service', value: 'notificationService' },
					{ name: 'Project', value: 'project' },
					{ name: 'Project Manager', value: 'projectManager' },
					{ name: 'Task', value: 'task' },
					{ name: 'Tasklist', value: 'tasklist' },
					{ name: 'Term', value: 'terms' },
					{ name: 'User', value: 'user' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'project',
			},
			...getAllResourceProperties(),
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const auth = await authenticate(this);

		for (let i = 0; i < items.length; i++) {
			try {
				const result = await executeResource(this, i, auth, resource, operation);

				if (result.type === 'items') {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(result.items),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}

				returnData.push({ json: result.data });
			} catch (error) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : String(error);
					returnData.push({ json: { error: message } });
					continue;
				}
				if (error instanceof NodeOperationError || error instanceof NodeApiError) {
					throw error;
				}
				throw new NodeApiError(this.getNode(), error as { message?: string });
			}
		}

		return [returnData];
	}
}
