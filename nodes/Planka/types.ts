import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';

export interface PlankaAuth {
	baseUrl: string;
	headers: Record<string, string>;
}

export type PlankaExecuteResult =
	| { type: 'json'; data: IDataObject }
	| { type: 'items'; items: IDataObject[] };

export type PlankaRequestOptions = Omit<IHttpRequestOptions, 'url'> & {
	url: string;
};
