import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class Straico implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Straico',
		name: 'Straico',
		icon: 'file:straico.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Get Straico',
		description: 'Get data from Straico API',
		defaults: {
				name: 'Straico default',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
				{
						name: 'StraicoApi',
						required: true,
				},
		],
		requestDefaults: {
				baseURL: 'https://api.straico.com/v0',
				headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
				},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Models',
						value: 'models',
					},
					{
						name: 'Prompt',
						value: 'prompt',
					},
				],
				default: 'user',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'user',
						],
					},
				},
				options: [
					{
						name: 'Get Info',
						value: 'get',
						action: 'Get user information',
						routing: {
							request: {
								method: 'GET',
								url: '/user',
							},
						},
					},
				],
				default: 'get',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'models',
						],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						action: 'Get all models information',
						routing: {
							request: {
								method: 'GET',
								url: '/models',
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [
							'prompt',
						],
					},
				},
				options: [
					{
						name: 'Completion',
						value: 'completion',
						action: 'Create a completion',
						routing: {
							request: {
								method: 'POST',
								url: '/prompt/completion',
							},
						},
					},
				],
				default: 'completion',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'anthropic/claude-3-haiku:beta',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'prompt',
						],
						operation: [
							'completion',
						],
					},
				},
				routing: {
					request: {
						body: {
							model: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'prompt',
						],
						operation: [
							'completion',
						],
					},
				},
				routing: {
					request: {
						body: {
							message: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'prompt',
						],
						operation: [
							'completion',
						],
					},
				},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							stepSize: 0.1,
						},
						default: 0.7,
						description: 'Controls randomness in the model. Lower values make the model more focused and deterministic',
						routing: {
							request: {
								body: {
									'=temperature': '={{ $value }}',
								},
							},
						},
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1000,
						description: 'The maximum number of tokens to generate in the completion',
						routing: {
							request: {
								body: {
									'=max_tokens': '={{ $value }}',
								},
							},
						},
					},
				],
			},
		],
	};
}
