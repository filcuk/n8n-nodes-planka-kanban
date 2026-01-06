import {
    IExecuteFunctions,
} from 'n8n-workflow';

import {
    IDataObject,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

export class Planka implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Planka',
        name: 'planka',
        icon: 'file:github.svg',
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
                    { name: 'Card', value: 'card' },
                    { name: 'Comment', value: 'comment' },
                    { name: 'Label', value: 'label' },
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
                    { name: 'Create', value: 'create', description: 'Create a new project' },
                    { name: 'Delete', value: 'delete', description: 'Delete a project' },
                    { name: 'Get', value: 'get', description: 'Get a project by ID' },
                    { name: 'Get All', value: 'getAll', description: 'Get all projects' },
                    { name: 'Update', value: 'update', description: 'Update a project' },
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
                    { name: 'Create', value: 'create', description: 'Create a board inside a project' },
                    { name: 'Delete', value: 'delete', description: 'Delete a board' },
                    { name: 'Get', value: 'get', description: 'Get a board by ID' },
                    { name: 'Update', value: 'update', description: 'Update a board' },
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
                    { name: 'Create', value: 'create', description: 'Create a list on a board' },
                    { name: 'Delete', value: 'delete', description: 'Delete a list' },
                    { name: 'Get', value: 'get', description: 'Get a list by ID' },
                    { name: 'Update', value: 'update', description: 'Update a list' },
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
                    { name: 'Create', value: 'create', description: 'Create a card in a list' },
                    { name: 'Delete', value: 'delete', description: 'Delete a card' },
                    { name: 'Get', value: 'get', description: 'Get a card by ID' },
                    { name: 'GetAll', value: 'getAll', description: 'Get all Cards in a list' },
                    { name: 'Update', value: 'update', description: 'Update a card' },
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
                    { name: 'Create', value: 'create', description: 'Add a comment to a card' },
                    { name: 'Update', value: 'update', description: 'Update a comment on a card' },
                    { name: 'Delete', value: 'delete', description: 'Delete a comment on a card' },
                    { name: 'Get All', value: 'getAll', description: 'Get comments for a card' },
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
                    { name: 'Create Label', value: 'create', description: 'Create a new label definition on a board' },
                    { name: 'Delete a label', value: 'delete', description: 'Deletes a label from a card' },
                    { name: 'Update Label', value: 'update', description: 'Update an existing label' },
                    { name: 'Add to Card', value: 'addToCard', description: 'Add an existing label to a card' },
                    { name: 'Remove from Card', value: 'removeFromCard', description: 'Remove an existing label on a card' },
                ],
                default: 'addToCard',
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
                        operation: ['create', 'getAll'],
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
                        operation: ['delete', 'get', 'update'],
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


            // ----------------------------------
            //         Required Data Fields
            // ----------------------------------
            {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['create', 'update'],
                        resource: ['project', 'board', 'list', 'card', 'label'],
                    },
                },
                description: 'The name or title of the resource',
            },

            // --- MANDATORY TYPES ---
            {
                displayName: 'Project Privacy',
                name: 'projectType',
                type: 'options',
                options: [
                    { name: 'Private', value: 'private' },
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
                displayName: 'List Type',
                name: 'listType',
                type: 'options',
                options: [
                    { name: 'Active', value: 'active' },
                    { name: 'Completed', value: 'completed' },
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

            // --- OPTIONAL FIELDS ---
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
                displayName: 'Position',
                name: 'position',
                type: 'number',
                default: 65536,
                displayOptions: {
                    show: {
                        resource: ['board', 'list', 'card'],
                        operation: ['create', 'update'],
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
        ],
    };

    // credentialTest = {
    //     connection: 'plankaApi',
    // };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0) as string;
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            try {
                const credentials = await this.getCredentials('plankaApi');

                // 1. LOGIN
                const loginOptions: IDataObject = {
                    method: 'POST',
                    uri: `${credentials.baseUrl}/api/access-tokens`,
                    body: {
                        emailOrUsername: credentials.emailOrUsername,
                        password: credentials.password,
                    },
                    json: true,
                };
                const loginResponse = await this.helpers.request(loginOptions);
                const accessToken = loginResponse.item;
                if (!accessToken) throw new Error('Authentication Failed: Could not retrieve access token.');

                // 2. PREPARE REQUEST
                const options: IDataObject = {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    json: true,
                };
                const baseUrl = credentials.baseUrl;

                // ----------------------------------------
                // RESOURCE: PROJECT
                // ----------------------------------------
                if (resource === 'project') {
                    if (operation === 'getAll') {
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/projects`;
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('projectId', i);
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/projects/${id}`;
                    }
                    else if (operation === 'create') {
                        const name = this.getNodeParameter('name', i);
                        const type = this.getNodeParameter('projectType', i); // REQUIRED
                        const description = this.getNodeParameter('description', i);

                        options.method = 'POST';
                        options.uri = `${baseUrl}/api/projects`;
                        options.body = {
                            name,
                            type, // "private"
                            description
                        };
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('projectId', i);
                        const name = this.getNodeParameter('name', i);
                        const description = this.getNodeParameter('description', i);

                        options.method = 'PATCH';
                        options.uri = `${baseUrl}/api/projects/${id}`;
                        options.body = { name, description };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('projectId', i);
                        options.method = 'DELETE';
                        options.uri = `${baseUrl}/api/projects/${id}`;
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
                        options.uri = `${baseUrl}/api/projects/${projectId}/boards`;
                        options.body = { name, position };
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('boardId', i);
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/boards/${id}`;
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('boardId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        options.method = 'PATCH';
                        options.uri = `${baseUrl}/api/boards/${id}`;
                        options.body = { name, position };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('boardId', i);
                        options.method = 'DELETE';
                        options.uri = `${baseUrl}/api/boards/${id}`;
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
                        const type = this.getNodeParameter('listType', i); // REQUIRED ("active")

                        options.method = 'POST';
                        options.uri = `${baseUrl}/api/boards/${boardId}/lists`;
                        options.body = { name, position, type };
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('listId', i);
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/lists/${id}`;
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('listId', i);
                        const name = this.getNodeParameter('name', i);
                        const position = this.getNodeParameter('position', i);
                        options.method = 'PATCH';
                        options.uri = `${baseUrl}/api/lists/${id}`;
                        options.body = { name, position };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('listId', i);
                        options.method = 'DELETE';
                        options.uri = `${baseUrl}/api/lists/${id}`;
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

                        options.method = 'POST';
                        options.uri = `${baseUrl}/api/lists/${listId}/cards`;

                        // CHANGE: Add "type": "card" here
                        options.body = {
                            name,
                            position,
                            description,
                            type: 'project' // <--- REQUIRED BY YOUR SERVER todo
                        };
                    }
                    else if (operation === 'get') {
                        const id = this.getNodeParameter('cardId', i);
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/cards/${id}`;
                    }
                    else if (operation === 'getAll') {
                        const listId = this.getNodeParameter('listId', i);
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/lists/${listId}/cards`;
                    }
                    else if (operation === 'update') {
                        const id = this.getNodeParameter('cardId', i);
                        const name = this.getNodeParameter('name', i);
                        const description = this.getNodeParameter('description', i);
                        options.method = 'PATCH';
                        options.uri = `${baseUrl}/api/cards/${id}`;
                        options.body = { name, description };
                    }
                    else if (operation === 'delete') {
                        const id = this.getNodeParameter('cardId', i);
                        options.method = 'DELETE';
                        options.uri = `${baseUrl}/api/cards/${id}`;
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
                        options.uri = `${baseUrl}/api/cards/${cardId}/comments`;
                        options.body = { text };
                    }
                    else if (operation === 'update') {
                        const commentId = this.getNodeParameter('commentId', i);
                        const text = this.getNodeParameter('text', i);

                        options.method = 'PATCH';
                        options.uri = `${baseUrl}/api/comments/${commentId}`;
                        options.body = { text };

                    }
                    else if (operation === 'getAll') {
                        const cardId = this.getNodeParameter('cardId', i);
                        options.method = 'GET';
                        options.uri = `${baseUrl}/api/cards/${cardId}/comments`;
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
                        options.uri = `${baseUrl}/api/boards/${boardId}/labels`;
                        options.body = { name, color, position: 65536 };
                    }
                    else if (operation === 'addToCard') {
                        const cardId = this.getNodeParameter('cardId', i);
                        const labelId = this.getNodeParameter('labelId', i);

                        options.method = 'POST';
                        options.uri = `${baseUrl}/api/cards/${cardId}/card-labels`;
                        options.body = { labelId };
                    }
                    else if (operation === 'removeFromCard') {
                        const cardId = this.getNodeParameter('cardId', i);
                        const labelId = this.getNodeParameter('labelId', i);

                        options.method = 'DELETE';
                        options.uri = `${baseUrl}/api/cards/${cardId}/cardId:${cardId}`;
                        options.body = { labelId };
                    }
                    else if (operation === 'delete') {
                        const labelId = this.getNodeParameter('labelId', i);

                        options.method = 'DELETE';
                        options.uri = `${baseUrl}/api/labels/${labelId}`;
                    }
                    else if (operation === 'update') {
                        const labelId = this.getNodeParameter('labelId', i);
                        const name = this.getNodeParameter('name', i);
                        const color = this.getNodeParameter('color', i);

                        options.method = 'PATCH';
                        options.uri = `${baseUrl}/api/labels/${labelId}`;
                        options.body = { name, color, position: 65536 };
                    }
                }

                const responseData = await this.helpers.request(options);
                returnData.push({ json: responseData });

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}