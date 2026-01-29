import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeApiError,
    IHttpRequestOptions,
} from 'n8n-workflow';

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
            // ----------------------------------
            //         Resource Selection
            // ----------------------------------
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    { name: 'Project', value: 'project' },
                    { name: 'Board', value: 'board' },
                    { name: 'List', value: 'list' },
                    { name: 'Label', value: 'label' },
                    { name: 'Card', value: 'card' },
                    { name: 'Comment', value: 'comment' },
                    { name: 'Tasklist', value: 'tasklist' },
                    { name: 'Task', value: 'task' },
                ],
                default: 'project',
            },

            // ----------------------------------
            //         Operations
            // ----------------------------------

            // PROJECT
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['project'] } },
                options: [
                    { name: 'Create', value: 'create', description: 'Create a new project', action: 'Create a project',},
                    { name: 'Delete', value: 'delete', description: 'Delete a project', action: 'Delete a project',},
                    { name: 'Get', value: 'get', description: 'Get a project by ID', action: 'Get a project',},
                    { name: 'Get Many', value: 'getAll', description: 'Get many projects', action: 'Get many projects',},
                    { name: 'Update', value: 'update', description: 'Update a project', action: 'Update a project',},
                ],
                default: 'getAll',
            },

            // BOARD
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['board'] } },
                options: [
                    { name: 'Create', value: 'create', description: 'Create a board inside a project', action: 'Create a board',},
                    { name: 'Delete', value: 'delete', description: 'Delete a board', action: 'Delete a board',},
                    { name: 'Get', value: 'get', description: 'Get a board by ID', action: 'Get a board',},
                    { name: 'Update', value: 'update', description: 'Update a board', action: 'Update a board',},
                ],
                default: 'create',
            },

            // LIST
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['list'] } },
                options: [
                    { name: 'Create', value: 'create', description: 'Create a list on a board', action: 'Create a list',},
                    { name: 'Delete', value: 'delete', description: 'Delete a list', action: 'Delete a list',},
                    { name: 'Get', value: 'get', description: 'Get a list by ID', action: 'Get a list',},
                    { name: 'Update', value: 'update', description: 'Update a list', action: 'Update a list',},
                ],
                default: 'create',
            },

            // CARD
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['card'] } },
                options: [
                    { name: 'Create', value: 'create', description: 'Create a card in a list', action: 'Create a card',},
                    { name: 'Delete', value: 'delete', description: 'Delete a card', action: 'Delete a card',},
                    { name: 'Get', value: 'get', description: 'Get a card by ID', action: 'Get a card',},
                    { name: 'Get Many', value: 'getAll', description: 'Get many Cards in a list', action: 'Get many cards',},
                    { name: 'Update', value: 'update', description: 'Update a card', action: 'Update a card',},
                    { name: 'Duplicate', value: 'duplicate', description: 'Duplicate a card', action: 'Duplicate a card',},
                ],
                default: 'create',
            },

            // Comment
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['comment'] } },
                options: [
                    { name: 'Create', value: 'create', description: 'Add a comment to a card', action: 'Create a comment',},
                    { name: 'Update', value: 'update', description: 'Update a comment on a card', action: 'Update a comment',},
                    { name: 'Delete', value: 'delete', description: 'Delete a comment on a card', action: 'Delete a comment',},
                    { name: 'Get Many', value: 'getAll', description: 'Get comments for a card', action: 'Get many comments',},
                ],
                default: 'create',
            },

            // Label
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['label'] } },
                options: [
                    { name: 'Add to Card', value: 'addToCard', description: 'Add an existing label to a card', action: 'Add card to label',},
                    { name: 'Create Label', value: 'create', description: 'Create a new label definition on a board', action: 'Create label',},
                    { name: 'Delete a Label', value: 'delete', description: 'Deletes a label from a card', action: 'Delete label',},
                    { name: 'Remove From Card', value: 'removeFromCard', description: 'Remove an existing label on a card', action: 'Remove label from card',},
                    { name: 'Update Label', value: 'update', description: 'Update an existing label', action: 'Update label',},
                ],
                default: 'addToCard',
            },

            // TASK LIST
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['tasklist'] } },
                options: [
                    { name: 'Create a Task list', value: 'create', description: 'Create a new task list', action: 'Create Tasklist',},
                    { name: 'Delete Task list', value: 'delete', description: 'Delete a task list', action: 'Delete Tasklist',},
                    { name: 'Get Task list', value: 'get', description: 'Get tasklist details', action: 'Get Tasklist details',},
                    { name: 'Update Task list', value: 'update', description: 'Update tasklist details', action: 'Update Tasklist',},
                ],
                default: 'create',
            },

            // TASK
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: { show: { resource: ['task'] } },
                options: [
                    { name: 'Create a Task', value: 'create', description: 'create a new task', action: 'Create Task',},
                    { name: 'Delete Task', value: 'delete', description: 'delete a task', action: 'Delete Task',},
                    { name: 'Update Task', value: 'update', description: 'update a task', action: 'Update Task',},
                ],
                default: 'create',
            },

            // ----------------------------------
            //         ID Parameters
            // ----------------------------------
            {
                displayName: 'Project ID',
                name: 'projectId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['project'],
                        operation: ['delete', 'get', 'update'],
                    }
                },
            },
            {
                displayName: 'Project ID',
                name: 'projectId',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['board'],
                        operation: ['create'],
                    }
                },
            },
            {
                displayName: 'Board ID',
                name: 'boardId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['board'],
                        operation: ['delete', 'get', 'update'],
                    }
                },
            },
            {
                displayName: 'Board ID',
                name: 'boardId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['list', 'label'],
                        operation: ['create'],
                    }
                },
            },
            {
                displayName: 'List ID',
                name: 'listId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['list'],
                        operation: ['delete', 'get', 'update'],
                    },
                },
            },
            {
                displayName: 'List ID',
                name: 'listId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['card'],
                        operation: ['create', 'getAll', 'update'],
                    },
                },
            },
            {
                displayName: 'Card ID',
                name: 'cardId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['card'],
                        operation: ['delete', 'get', 'update', "duplicate"],
                    }
                },
            },
            {
                displayName: 'Card ID',
                name: 'cardId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['comment'],
                        operation: ['create', 'getAll'],
                    }
                },
            },
            {
                displayName: 'Card ID',
                name: 'cardId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['label'],
                        operation: ['addToCard', 'removeFromCard'],
                    }
                },
            },
            {
                displayName: 'Card ID',
                name: 'cardId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ["tasklist"],
                        operation: ['create'],
                    }
                },
            },
            {
                displayName: 'Comment ID',
                name: 'commentId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['comment'],
                        operation: ['update', 'delete'],
                    }
                },
            },
            {
                displayName: 'Label ID',
                name: 'labelId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['label'],
                        operation: ['addToCard', 'delete', 'update', 'removeFromCard'],
                    },
                },
            },
            {
                displayName: 'Tasklist ID',
                name: 'tasklistId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['tasklist'],
                        operation: ['delete', 'get', 'update'],
                    },
                },
            },
            {
                displayName: 'Tasklist ID',
                name: 'tasklistId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['task'],
                        operation: ['create'],
                    },
                },
            },
            {
                displayName: 'Task ID',
                name: 'taskId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['task'],
                        operation: ['delete', 'update'],
                    },
                },
            },

            // ----------------------------------
            //         Other Data Fields
            // ----------------------------------
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['create', 'update', 'duplicate'],
                        resource: ['project', 'board', 'list', 'card', 'label', "task", "tasklist"],
                    },
                },
                description: 'The name or title of the resource',
            },
            {
                displayName: 'Project Type',
                name: 'projectType',
                type: 'options',
                options: [
                    { name: 'Private', value: 'private' },
                    { name: 'Shared', value: 'shared' },
                ],
                default: 'private',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['project'],
                        operation: ['create'],
                    },
                },
                description: 'Required by Planka API',
            },
            {
                displayName: 'Default View',
                name: 'defaultView',
                type: 'options',
                options: [
                    { name: 'Kanban', value: 'kanban' },
                    { name: 'Grid', value: 'grid' },
                    { name: 'List', value: 'list' },
                ],
                default: 'kanban',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['update'],
                        resource: ['board'],
                    },
                },
                description: 'The name or title of the resource',
            },
            {
                displayName: 'Default Card Type',
                name: 'defaultCardType',
                type: 'options',
                options: [
                    { name: 'Project', value: 'project' },
                    { name: 'Story', value: 'story' },
                ],
                default: 'project',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['update'],
                        resource: ['board'],
                    },
                },
                description: 'The name or title of the resource',
            },
            {
                displayName: 'List Type',
                name: 'listType',
                type: 'options',
                options: [
                    { name: 'Active', value: 'active' },
                    { name: 'Closed', value: 'closed' },
                ],
                default: 'active',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['list'],
                        operation: ['create'],
                    },
                },
                description: 'Required: Status of the list',
            },
            {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['card', 'project'],
                        operation: ['create', 'update'],
                    },
                },
            },
            {
                displayName: 'Due Date',
                name: 'dueDate',
                type: 'dateTime',
                default: '',
                required: false,
                description: 'Select the date and time (ISO 8601 format)',
                displayOptions: {
                    show: {
                        operation: ['create', 'update'],
                        resource: ['card'],
                    },
                },
            },
            {
                displayName: 'Type',
                name: 'type',
                type: 'options',
                options: [
                    { name: 'Project', value: 'project' },
                    { name: 'Story', value: 'story' },
                ],
                default: 'project',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['create', 'update'],
                        resource: ['card'],
                    },
                },
            },
            {
                displayName: 'Position',
                name: 'position',
                type: 'number',
                default: 65536,
                required: true,
                displayOptions: {
                    show: {
                        resource: ['board', 'list', 'card', "task", "tasklist"],
                        operation: ['create', 'update', 'duplicate'],
                    },
                },
                description: 'Sort order (default: 65536)',
            },
            {
                displayName: 'Color',
                name: 'color',
                type: 'options',
                options: [
                    { name: 'Antique Blue', value: 'antique-blue' },
                    { name: 'Apricot Red', value: 'apricot-red' },
                    { name: 'Autumn Leafs', value: 'autumn-leafs' },
                    { name: 'Berry Red', value: 'berry-red' },
                    { name: 'Bright Moss', value: 'bright-moss' },
                    { name: 'Coral Green', value: 'coral-green' },
                    { name: 'Dark Granite', value: 'dark-granite' },
                    { name: 'Deep Ocean', value: 'deep-ocean' },
                    { name: 'Desert Sand', value: 'desert-sand' },
                    { name: 'Egg Yellow', value: 'egg-yellow' },
                    { name: 'French Coast', value: 'french-coast' },
                    { name: 'Fresh Salad', value: 'fresh-salad' },
                    { name: 'Grey Stone', value: 'grey-stone' },
                    { name: 'Gun Metal', value: 'gun-metal' },
                    { name: 'Lagoon Blue', value: 'lagoon-blue' },
                    { name: 'Lavender Fields', value: 'lavender-fields' },
                    { name: 'Light Cocoa', value: 'light-cocoa' },
                    { name: 'Light Concrete', value: 'light-concrete' },
                    { name: 'Light Mud', value: 'light-mud' },
                    { name: 'Light Orange', value: 'light-orange' },
                    { name: 'Lilac Eyes', value: 'lilac-eyes' },
                    { name: 'Midnight Blue', value: 'midnight-blue' },
                    { name: 'Modern Green', value: 'modern-green' },
                    { name: 'Morning Sky', value: 'morning-sky' },
                    { name: 'Muddy Grey', value: 'muddy-grey' },
                    { name: 'Navy Blue', value: 'navy-blue' },
                    { name: 'Orange Peel', value: 'orange-peel' },
                    { name: 'Piggy Red', value: 'piggy-red' },
                    { name: 'Pink Tulip', value: 'pink-tulip' },
                    { name: 'Pirate Gold', value: 'pirate-gold' },
                    { name: 'Pumpkin Orange', value: 'pumpkin-orange' },
                    { name: 'Red Burgundy', value: 'red-burgundy' },
                    { name: 'Shady Rust', value: 'shady-rust' },
                    { name: 'Silver Glint', value: 'silver-glint' },
                    { name: 'Sugar Plum', value: 'sugar-plum' },
                    { name: 'Summer Sky', value: 'summer-sky' },
                    { name: 'Sunny Grass', value: 'sunny-grass' },
                    { name: 'Sweet Lilac', value: 'sweet-lilac' },
                    { name: 'Tank Green', value: 'tank-green' },
                    { name: 'Turquoise Sea', value: 'turquoise-sea' },
                    { name: 'Wet Moss', value: 'wet-moss' },
                    { name: 'Wet Rock', value: 'wet-rock' },
                ],
                default: 'pirate-gold',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['label'],
                        operation: ['create', 'update'],
                    },
                },
            },
            {
                displayName: 'Color',
                name: 'color',
                type: 'options',
                options: [
                    { name: 'Antique Blue', value: 'antique-blue' },
                    { name: 'Berry Red', value: 'berry-red' },
                    { name: 'Bright Moss', value: 'bright-moss' },
                    { name: 'Dark Granite', value: 'dark-granite' },
                    { name: 'Lagoon Blue', value: 'lagoon-blue' },
                    { name: 'Light Mud', value: 'light-mud' },
                    { name: 'Orange Peel', value: 'orange-peel' },
                    { name: 'Pink Tulip', value: 'pink-tulip' },
                    { name: 'Pumpkin Orange', value: 'pumpkin-orange' },
                    { name: 'Turquoise Sea', value: 'turquoise-sea' },
                ],
                default: 'berry-red',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['list'],
                        operation: ['update'],
                    },
                },
            },
            {
                displayName: 'Comment Text',
                name: 'text',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        resource: ['comment'],
                        operation: ['create', 'update'],
                    },
                },
            },
            {
                displayName: 'Is Task completed',
                name: 'isCompleted',
                type: 'boolean',
                default: false,
                displayOptions: {
                    show: {
                        resource: ['task'],
                        operation: ['create', 'update'],
                    },
                },
            },
        ],
        usableAsTool: true,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                const credentials = await this.getCredentials('plankaApi');

                // LOGIN
                const loginOptions: IHttpRequestOptions = {
                    method: 'POST',
                    url: `${credentials.baseUrl}/api/access-tokens`,
                    body: {
                        emailOrUsername: credentials.emailOrUsername,
                        password: credentials.password,
                    },
                    json: true,
                };
                const loginResponse = await this.helpers.httpRequest(loginOptions);

                const accessToken = loginResponse.item;
                if (!accessToken) throw new NodeApiError(this.getNode(), loginResponse, { message: 'Authentication Failed: Could not retrieve access token.' });

                // Remove trailing slash if present to prevent double slashes (e.g. //api)
                const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

                const options: IHttpRequestOptions = {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    json: true,
                    url: '',
                };

                // ----------------------------------------
                // RESOURCE: PROJECT
                // ----------------------------------------
                if (resource === 'project') {
                    if (operation === 'getAll') {
                        options.method = 'GET';
                        options.url = `${baseUrl}/api/projects`;
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('projectId', i);
                        options.method = 'GET';
                        options.url = `${baseUrl}/api/projects/${id}`;
                    }
                    else if (operation === 'create') {
                        const name = this.getNodeParameter('name', i);
                        const type = this.getNodeParameter('projectType', i);
                        const description = this.getNodeParameter('description', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/projects`;
                        options.body = {
                            name,
                            type,
                            description
                        };
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('projectId', i);
                        const name = this.getNodeParameter('name', i);
                        const description = this.getNodeParameter('description', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/projects/${id}`;
                        options.body = { name, description };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('projectId', i);
                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/projects/${id}`;
                    }
                }

                // ----------------------------------------
                // RESOURCE: BOARD
                // ----------------------------------------
                else if (resource === 'board') {
                    if (operation === 'create') {
                        const projectId = this.getNodeParameter('projectId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/projects/${projectId}/boards`;
                        options.body = { name, position };
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('boardId', i);
                        options.method = 'GET';
                        options.url = `${baseUrl}/api/boards/${id}`;
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('boardId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        const defaultCardType = this.getNodeParameter('defaultCardType', i);
                        const defaultView = this.getNodeParameter('defaultView', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/boards/${id}`;
                        options.body = { name, position, defaultCardType, defaultView };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('boardId', i);
                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/boards/${id}`;
                    }
                }

                // ----------------------------------------
                // RESOURCE: LIST
                // ----------------------------------------
                else if (resource === 'list') {
                    if (operation === 'create') {
                        const boardId = this.getNodeParameter('boardId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        const type = this.getNodeParameter('listType', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/boards/${boardId}/lists`;
                        options.body = { name, position, type };
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('listId', i);
                        options.method = 'GET';
                        options.url = `${baseUrl}/api/lists/${id}`;
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('listId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        const color = this.getNodeParameter('color', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/lists/${id}`;
                        options.body = { name, position, color };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('listId', i);
                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/lists/${id}`;
                    }
                }

                // ----------------------------------------
                // RESOURCE: CARD
                // ----------------------------------------
                else if (resource === 'card') {
                    if (operation === 'create') {
                        const listId = this.getNodeParameter('listId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        const description = this.getNodeParameter('description', i);
                        const type = this.getNodeParameter('type', i);
                        const dueDate = this.getNodeParameter('dueDate', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/lists/${listId}/cards`;

                        options.body = {
                            name,
                            position,
                            description,
                            type,
                        };

                        if (dueDate) {
                            options.body.dueDate = dueDate;
                        }
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('cardId', i);
                        options.method = 'GET';
                        options.url = `${baseUrl}/api/cards/${id}`;
                    }
                    else if (operation === 'duplicate') {
                        const id = this.getNodeParameter('cardId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/cards/${id}/duplicate`;
                        options.body = { position, name };
                    }
                    else if (operation === 'getAll') {
                        const listId = this.getNodeParameter('listId', i);
                        options.method = 'GET';
                        options.url = `${baseUrl}/api/lists/${listId}/cards`;
                    }
                    else if (operation === 'update') {
                        const listId = this.getNodeParameter('listId', i);
                        const id = this.getNodeParameter('cardId', i);
                        const name = this.getNodeParameter('name', i);
                        const description = this.getNodeParameter('description', i);
                        const position = this.getNodeParameter('position', i);
                        const type = this.getNodeParameter('type', i);
                        const dueDate = this.getNodeParameter('dueDate', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/cards/${id}`;
                        options.body = { listId, name, description, position, type };

                        if (dueDate) {
                            options.body.dueDate = dueDate;
                        }
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('cardId', i);
                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/cards/${id}`;
                    }
                }

                // ----------------------------------------
                // RESOURCE: COMMENT
                // ----------------------------------------
                else if (resource === 'comment') {
                    if (operation === 'create') {
                        const cardId = this.getNodeParameter('cardId', i);
                        const text = this.getNodeParameter('text', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/cards/${cardId}/comments`;
                        options.body = { text };
                    }
                    else if (operation === 'update') {
                        const commentId = this.getNodeParameter('commentId', i);
                        const text = this.getNodeParameter('text', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/comments/${commentId}`;
                        options.body = { text };

                    }
                    else if (operation === 'getAll') {
                        const cardId = this.getNodeParameter('cardId', i);

                        options.method = 'GET';
                        options.url = `${baseUrl}/api/cards/${cardId}/comments`;
                    }
                    else if (operation === 'delete') {
                        const commentId = this.getNodeParameter('commentId', i);

                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/comments/${commentId}`;
                    }
                }

                // ----------------------------------------
                // RESOURCE: LABEL
                // ----------------------------------------
                else if (resource === 'label') {
                    if (operation === 'create') {
                        const boardId = this.getNodeParameter('boardId', i);
                        const name = this.getNodeParameter('name', i);
                        const color = this.getNodeParameter('color', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/boards/${boardId}/labels`;
                        options.body = { name, color, position: 65536 };
                    }
                    else if (operation === 'addToCard') {
                        const cardId = this.getNodeParameter('cardId', i);
                        const labelId = this.getNodeParameter('labelId', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/cards/${cardId}/card-labels`;
                        options.body = { labelId };
                    }
                    else if (operation === 'removeFromCard') {
                        const cardId = this.getNodeParameter('cardId', i);
                        const labelId = this.getNodeParameter('labelId', i);

                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/cards/${cardId}/card-labels/labelId:${labelId}`;
                        options.body = { labelId };
                    }
                    else if (operation === 'delete') {
                        const labelId = this.getNodeParameter('labelId', i);

                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/labels/${labelId}`;
                    }
                    else if (operation === 'update') {
                        const labelId = this.getNodeParameter('labelId', i);
                        const name = this.getNodeParameter('name', i);
                        const color = this.getNodeParameter('color', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/labels/${labelId}`;
                        options.body = { name, color, position: 65536 };
                    }
                }

                // ----------------------------------------
                // RESOURCE: TASKLIST
                // ----------------------------------------
                else if (resource === 'tasklist') {
                    if (operation === 'create') {
                        const cardId = this.getNodeParameter('cardId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/cards/${cardId}/task-lists`;
                        options.body = { name, position };
                    }
                    else if (operation === 'delete') {
                        const tasklistId = this.getNodeParameter('tasklistId', i);

                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/task-lists/${tasklistId}`;
                    }
                    else if (operation === 'get') {
                        const tasklistId = this.getNodeParameter('tasklistId', i);

                        options.method = 'GET';
                        options.url = `${baseUrl}/api/task-lists/${tasklistId}`;
                    }
                    else if (operation === 'update') {
                        const tasklistId = this.getNodeParameter('tasklistId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/task-lists/${tasklistId}`;
                        options.body = { name, position };
                    }
                }

                    // ----------------------------------------
                    // RESOURCE: TASK
                // ----------------------------------------
                else if (resource === 'task') {
                    if (operation === 'create') {
                        const tasklistId = this.getNodeParameter('tasklistId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        const isCompleted = this.getNodeParameter('isCompleted', i);

                        options.method = 'POST';
                        options.url = `${baseUrl}/api/task-lists/${tasklistId}/tasks`;
                        options.body = { name, position, isCompleted };
                    }
                    else if (operation === 'delete') {
                        const taskId = this.getNodeParameter('taskId', i);

                        options.method = 'DELETE';
                        options.url = `${baseUrl}/api/tasks/${taskId}`;
                    }
                    else if (operation === 'update') {
                        const taskId = this.getNodeParameter('taskId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        const isCompleted = this.getNodeParameter('isCompleted', i);

                        options.method = 'PATCH';
                        options.url = `${baseUrl}/api/tasks/${taskId}`;
                        options.body = { name, position, isCompleted };
                    }
                }
                const responseData = await this.helpers.httpRequest(options);
                returnData.push({ json: responseData });

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw new NodeApiError(this.getNode(), error);
            }
        }

        return [returnData];
    }
}