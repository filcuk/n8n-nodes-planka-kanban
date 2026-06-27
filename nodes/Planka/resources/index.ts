import type { INodeProperties, IExecuteFunctions  } from 'n8n-workflow';

import type { PlankaAuth, PlankaExecuteResult } from '../types';

import { accessTokenProperties, executeAccessToken } from './accessToken';
import { actionProperties, executeAction } from './action';
import { attachmentProperties, executeAttachment } from './attachment';
import { backgroundImageProperties, executeBackgroundImage } from './backgroundImage';
import { baseCustomFieldGroupProperties, executeBaseCustomFieldGroup } from './baseCustomFieldGroup';
import { boardProperties, executeBoard } from './board';
import { boardMembershipProperties, executeBoardMembership } from './boardMembership';
import { bootstrapProperties, executeBootstrap } from './bootstrap';
import { cardProperties, executeCard } from './card';
import { cardMembershipProperties, executeCardMembership } from './cardMembership';
import { commentProperties, executeComment } from './comment';
import { configProperties, executeConfig } from './config';
import { customFieldProperties, executeCustomField } from './customField';
import { customFieldGroupProperties, executeCustomFieldGroup } from './customFieldGroup';
import { customFieldValueProperties, executeCustomFieldValue } from './customFieldValue';
import { executeLabel, labelProperties } from './label';
import { executeList, listProperties } from './list';
import { executeNotification, notificationProperties } from './notification';
import { executeNotificationService, notificationServiceProperties } from './notificationService';
import { executeProject, projectProperties } from './project';
import { executeProjectManager, projectManagerProperties } from './projectManager';
import { executeTask, taskProperties } from './task';
import { executeTasklist, tasklistProperties } from './tasklist';
import { executeTerms, termsProperties } from './terms';
import { executeUser, userProperties } from './user';
import { executeWebhook, webhookProperties } from './webhook';

export type ResourceExecutor = (
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	operation: string,
) => Promise<PlankaExecuteResult>;

interface ResourceDefinition {
	properties: INodeProperties[];
	execute: ResourceExecutor;
}

export const resourceDefinitions: Record<string, ResourceDefinition> = {
	accessToken: { properties: accessTokenProperties, execute: executeAccessToken },
	action: { properties: actionProperties, execute: executeAction },
	attachment: { properties: attachmentProperties, execute: executeAttachment },
	backgroundImage: { properties: backgroundImageProperties, execute: executeBackgroundImage },
	baseCustomFieldGroup: { properties: baseCustomFieldGroupProperties, execute: executeBaseCustomFieldGroup },
	board: { properties: boardProperties, execute: executeBoard },
	boardMembership: { properties: boardMembershipProperties, execute: executeBoardMembership },
	bootstrap: { properties: bootstrapProperties, execute: executeBootstrap },
	card: { properties: cardProperties, execute: executeCard },
	cardMembership: { properties: cardMembershipProperties, execute: executeCardMembership },
	comment: { properties: commentProperties, execute: executeComment },
	config: { properties: configProperties, execute: executeConfig },
	customField: { properties: customFieldProperties, execute: executeCustomField },
	customFieldGroup: { properties: customFieldGroupProperties, execute: executeCustomFieldGroup },
	customFieldValue: { properties: customFieldValueProperties, execute: executeCustomFieldValue },
	label: { properties: labelProperties, execute: executeLabel },
	list: { properties: listProperties, execute: executeList },
	notification: { properties: notificationProperties, execute: executeNotification },
	notificationService: { properties: notificationServiceProperties, execute: executeNotificationService },
	project: { properties: projectProperties, execute: executeProject },
	projectManager: { properties: projectManagerProperties, execute: executeProjectManager },
	task: { properties: taskProperties, execute: executeTask },
	tasklist: { properties: tasklistProperties, execute: executeTasklist },
	terms: { properties: termsProperties, execute: executeTerms },
	user: { properties: userProperties, execute: executeUser },
	webhook: { properties: webhookProperties, execute: executeWebhook },
};

export function getAllResourceProperties(): INodeProperties[] {
	return Object.values(resourceDefinitions).flatMap((def) => def.properties);
}

export async function executeResource(
	ctx: IExecuteFunctions,
	itemIndex: number,
	auth: PlankaAuth,
	resource: string,
	operation: string,
): Promise<PlankaExecuteResult> {
	const definition = resourceDefinitions[resource];
	if (!definition) {
		throw new Error(`Unsupported resource: ${resource}`);
	}
	return definition.execute(ctx, itemIndex, auth, operation);
}
