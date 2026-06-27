import type { INodeProperties } from 'n8n-workflow';

export function operationField(
	resource: string,
	options: Array<{ name: string; value: string; action: string; description?: string }>,
	defaultValue: string,
): INodeProperties {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options: options.map((o) => ({
			name: o.name,
			value: o.value,
			description: o.description,
			action: o.action,
		})),
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
		default: defaultValue,
	};
}

export function idField(
	displayName: string,
	name: string,
	resource: string | string[],
	operations: string[],
	required = true,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		required,
		displayOptions: {
			show: {
				resource: Array.isArray(resource) ? resource : [resource],
				operation: operations,
			},
		},
	};
}

export const labelColorOptions = [
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
];

export const listColorOptions = [
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
];

export const positionField = (
	resources: string[],
	operations: string[],
): INodeProperties => ({
	displayName: 'Position',
	name: 'position',
	type: 'number',
	default: 65536,
	required: true,
	displayOptions: { show: { resource: resources, operation: operations } },
	description: 'Sort order (default: 65536)',
});

export const nameField = (
	resources: string[],
	operations: string[],
	required = true,
): INodeProperties => ({
	displayName: 'Name',
	name: 'name',
	type: 'string',
	default: '',
	required,
	displayOptions: { show: { resource: resources, operation: operations } },
	description: 'The name or title of the resource',
});

export const userIdField = (
	resource: string,
	operations: string[],
): INodeProperties => ({
	displayName: 'User ID',
	name: 'userId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: [resource], operation: operations } },
});

export const binaryPropertyField = (
	resource: string,
	operations: string[],
): INodeProperties => ({
	displayName: 'Binary Property',
	name: 'binaryPropertyName',
	type: 'string',
	default: 'data',
	required: true,
	displayOptions: { show: { resource: [resource], operation: operations } },
	description: 'Name of the binary property containing the file to upload',
});
