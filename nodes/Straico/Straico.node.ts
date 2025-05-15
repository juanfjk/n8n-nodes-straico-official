import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import FormData from 'form-data';

export class Straico implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Straico Official',
		name: 'Straico Official',
		icon: 'file:straico.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from Straico API',
		defaults: {
			name: 'Straico Official',
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
			baseURL: 'https://api.straico.com',
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
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Agent',
						value: 'agent',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'RAG',
						value: 'rag',
					},
				],
				default: 'prompt',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
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
								url: '/v0/user',
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
						resource: ['models'],
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
								url: '/v1/models',
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
						resource: ['prompt'],
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
								url: '/v1/prompt/completion',
							},
						},
					},
				],
				default: 'completion',
			},
			{
				displayName: 'Models',
				name: 'models',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				default: [],
				required: false,
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['completion'],
					},
				},
				routing: {
					request: {
						body: {
							models: '={{ $value }}',
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
						resource: ['prompt'],
						operation: ['completion'],
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
				displayName: 'Smart LLM Selector',
				name: 'smart_llm_selector',
				type: 'collection',
				placeholder: 'Add Selector',
				default: {},
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['completion'],
					},
				},
				options: [
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						description: 'Number of models to select (1-4)',
						typeOptions: {
							minValue: 1,
							maxValue: 4,
						},
					},
					{
						displayName: 'Pricing Method',
						name: 'pricing_method',
						type: 'options',
						options: [
							{ name: 'Quality', value: 'quality' },
							{ name: 'Balance', value: 'balance' },
							{ name: 'Budget', value: 'budget' },
						],
						default: 'balance',
						description: 'Pricing strategy for model selection',
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['completion'],
					},
				},
				options: [
					{
						displayName: 'File URLs',
						name: 'file_urls',
						type: 'string',
						default: '',
						description: 'Comma-separated list of file URLs to analyze',
						routing: {
							request: {
								body: {
									file_urls: '={{ $value.split(",").map(url => url.trim()) }}',
								},
							},
						},
					},
					{
						displayName: 'YouTube URLs',
						name: 'youtube_urls',
						type: 'string',
						default: '',
						description: 'Comma-separated list of YouTube URLs to analyze',
						routing: {
							request: {
								body: {
									youtube_urls: '={{ $value.split(",").map(url => url.trim()) }}',
								},
							},
						},
					},
					{
						displayName: 'Images',
						name: 'images',
						type: 'string',
						default: '',
						description: 'Comma-separated list of image URLs',
						routing: {
							request: {
								body: {
									images: '={{ $value.split(",").map(url => url.trim()) }}',
								},
							},
						},
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.7,
						description: 'Controls creativity and diversity of generated text',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
						},
						routing: {
							request: {
								body: {
									temperature: '={{ $value }}',
								},
							},
						},
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						default: 100,
						description: 'Maximum tokens to generate',
						typeOptions: {
							minValue: 1,
							maxValue: 2048,
						},
						routing: {
							request: {
								body: {
									max_tokens: '={{ $value }}',
								},
							},
						},
					},
					{
						displayName: 'Replace Failed Models',
						name: 'replace_failed_models',
						type: 'boolean',
						default: false,
						description: 'Replace failed models with similar ones if available',
						routing: {
							request: {
								body: {
									replace_failed_models: '={{ $value }}',
								},
							},
						},
					},
					{
						displayName: 'Display Transcripts',
						name: 'display_transcripts',
						type: 'boolean',
						default: false,
						description: 'If true, returns transcripts of the files',
						routing: {
							request: {
								body: {
									display_transcripts: '={{ $value }}',
								},
							},
						},
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['image'],
					},
				},
				options: [
					{
						name: 'Generate Image',
						value: 'generate',
						action: 'Generate an image',
						routing: {
							request: {
								method: 'POST',
								url: '/v0/image/generation',
							},
						},
					},
				],
				default: 'generate',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'openai/dall-e-3',
				required: true,
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
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
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
					},
				},
				routing: {
					request: {
						body: {
							description: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'options',
				options: [
					{
						name: 'Square',
						value: 'square',
					},
					{
						name: 'Landscape',
						value: 'landscape',
					},
					{
						name: 'Portrait',
						value: 'portrait',
					},
				],
				default: 'landscape',
				required: true,
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
					},
				},
				routing: {
					request: {
						body: {
							size: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Variations',
				name: 'variations',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 4,
				},
				default: 1,
				required: true,
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
					},
				},
				routing: {
					request: {
						body: {
							variations: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Seed',
				name: 'seed',
				type: 'number',
				default: null,
				description: 'Seed for reproducibility (only for flux and ideogram models)',
				typeOptions: {
					minValue: 0,
					maxValue: 2147483647,
				},
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
					},
				},
			},
			{
				displayName: 'Enhance Prompt',
				name: 'enhance',
				type: 'boolean',
				default: false,
				description: 'Use AI to enhance the original prompt',
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
					},
				},
			},
			{
				displayName: 'Custom Enhancer',
				name: 'customEnhancer',
				type: 'string',
				default: '',
				description: 'Custom instructions for the AI to enhance the prompt',
				displayOptions: {
					show: {
						resource: ['image'],
						operation: ['generate'],
						enhance: [true],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['agent'],
					},
				},
				options: [
					{ name: 'Create', value: 'create', action: 'Create a new agent' },
					{ name: 'Get Details', value: 'get', action: 'Get agent details' },
					{ name: 'List', value: 'list', action: 'List all agents' },
					{ name: 'Add RAG', value: 'addRag', action: 'Add RAG to agent' },
					{ name: 'Update', value: 'update', action: 'Update agent details' },
					{ name: 'Delete', value: 'delete', action: 'Delete agent' },
					{
						name: 'Prompt Completion',
						value: 'promptCompletion',
						action: 'Send a prompt to agent',
					},
				],
				default: 'list',
			},
			{
				displayName: 'Agent ID',
				name: 'agent_id',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['get', 'addRag', 'update', 'delete', 'promptCompletion'],
					},
				},
				default: '',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['agent'], operation: ['create', 'update'] } },
				default: '',
			},
			{
				displayName: 'Custom Prompt',
				name: 'custom_prompt',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['agent'], operation: ['create', 'update'] } },
				default: '',
			},
			{
				displayName: 'Default LLM',
				name: 'default_llm',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['agent'], operation: ['create', 'update'] } },
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['agent'], operation: ['create', 'update'] } },
				default: '',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				description: 'JSON array of tags, e.g. ["assistant","rag"]',
				required: false,
				displayOptions: { show: { resource: ['agent'], operation: ['create', 'update'] } },
				default: '[]',
			},
			{
				displayName: 'RAG ID',
				name: 'ragId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['get', 'update', 'delete', 'promptCompletion'],
					},
				},
				default: '',
			},
			{
				displayName: 'RAG ID',
				name: 'ragId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['agent'],
						operation: ['addRag'],
					},
				},
				default: '',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
				default: '',
			},
			{
				displayName: 'Search Type',
				name: 'search_type',
				type: 'options',
				options: [
					{ name: 'similarity', value: 'similarity' },
					{ name: 'mmr', value: 'mmr' },
					{ name: 'similarity_score_threshold', value: 'similarity_score_threshold' },
				],
				default: 'similarity',
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'k',
				name: 'k',
				type: 'number',
				default: 4,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'fetch_k',
				name: 'fetch_k',
				type: 'number',
				default: 10,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'lambda_mult',
				name: 'lambda_mult',
				type: 'number',
				default: 0.5,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'score_threshold',
				name: 'score_threshold',
				type: 'number',
				default: 0.5,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'Upload',
						value: 'upload',
						action: 'Upload a file',
						routing: {
							request: {
								method: 'POST',
								url: '/v0/file/upload',
								body: {
									file: '={{ $parameter["file"] }}',
								},
								json: false,
							},
						},
					},
				],
				default: 'upload',
			},
			{
				displayName: 'File',
				name: 'file',
				description: 'File to upload',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['file'],
						operation: ['upload'],
					},
				},
				typeOptions: {
					multipleValues: false,
					file: true,
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['rag'],
					},
				},
				options: [
					{ name: 'Create', value: 'create', action: 'Create a new RAG' },
					{ name: 'List', value: 'list', action: 'List all RAGs' },
					{ name: 'Get', value: 'get', action: 'Get RAG by ID' },
					{ name: 'Update', value: 'update', action: 'Update a RAG with files' },
					{ name: 'Delete', value: 'delete', action: 'Delete a RAG' },
					{
						name: 'Prompt Completion',
						value: 'promptCompletion',
						action: 'Send a prompt to a RAG',
					},
				],
				default: 'list',
			},
			{
				displayName: 'RAG ID',
				name: 'ragId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['get'] } },
				default: '',
			},
			{
				displayName: 'File',
				name: 'files',
				description: 'File to upload',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create', 'update'] } },
				typeOptions: { multipleValues: false, file: true },
				default: '',
			},
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'Search Type',
				name: 'search_type',
				type: 'options',
				options: [
					{ name: 'similarity', value: 'similarity' },
					{ name: 'mmr', value: 'mmr' },
					{ name: 'similarity_score_threshold', value: 'similarity_score_threshold' },
				],
				default: 'similarity',
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'k',
				name: 'k',
				type: 'number',
				default: 4,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'fetch_k',
				name: 'fetch_k',
				type: 'number',
				default: 10,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'lambda_mult',
				name: 'lambda_mult',
				type: 'number',
				default: 0.5,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'score_threshold',
				name: 'score_threshold',
				type: 'number',
				default: 0.5,
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['promptCompletion'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'ragName',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Description',
				name: 'ragDescription',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create'] } },
				default: '',
			},
		],
	};

	//add loadOptions
	/*   methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await this.helpers.request({
					method: 'GET',
					url: '/v1/models',
					json: true,
				});

				if (!response.success || !response.data.text) {
					throw new Error('Failed to load models');
				}

				return response.data.text.map((model: any) => ({
					name: model.name,
					value: model.model,
				}));
			},
		},
	}; */

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('StraicoApi');

					if (!credentials?.apiKey) {
						throw new Error('No API key provided in credentials');
					}

					const response = await this.helpers.request({
						method: 'GET',
						url: 'https://api.straico.com/v1/models',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
							Authorization: `Bearer ${credentials.apiKey}`,
						},
						json: true,
					});

					if (!response?.success || !response?.data?.chat) {
						throw new Error('Invalid response format from the API');
					}

					// Map the chat models from the response
					return response.data.chat.map((model: any) => ({
						name: model.name,
						value: model.model,
						description: `Max tokens: ${model.max_output}, Price: ${model.pricing.coins} coins per ${model.pricing.words} words`,
					}));
				} catch (error) {
					console.error('Error loading models:', error);
					throw new Error(`Failed to load models: ${error.message}`);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			if (resource === 'file' && operation === 'upload') {
				const binaryPropertyName = this.getNodeParameter('file', i) as string;
				const item = items[i];

				if (!item.binary || !item.binary[binaryPropertyName]) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data property "${binaryPropertyName}" found on item!`,
					);
				}

				const binaryData = item.binary[binaryPropertyName];
				const bufferData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
				const fileName = binaryData.fileName || 'uploaded_file.pdf';

				const form = new FormData();
				form.append('file', bufferData, fileName);

				const credentials = await this.getCredentials('StraicoApi');

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'https://api.straico.com/v0/file/upload',
					headers: {
						...form.getHeaders(),
						Authorization: `Bearer ${credentials.apiKey}`,
					},
					body: form,
				});

				returnData.push({ json: response });
			} else if (resource === 'rag' && operation === 'create') {
				const name = this.getNodeParameter('ragName', i) as string;
				const description = this.getNodeParameter('ragDescription', i) as string;
				const fileField = this.getNodeParameter('files', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const form = new FormData();
				form.append('name', name);
				form.append('description', description);
				const binaryData = items[i].binary?.[fileField];
				if (!binaryData) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data property "${fileField}" found on item!`,
					);
				}
				const bufferData = await this.helpers.getBinaryDataBuffer(i, fileField);
				const fileName = binaryData.fileName || 'uploaded_file.pdf';
				form.append('files', bufferData, fileName);
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'https://api.straico.com/v0/rag',
					headers: {
						...form.getHeaders(),
						Authorization: `Bearer ${credentials.apiKey}`,
					},
					body: form,
				});
				returnData.push({ json: response });
			} else if (resource === 'rag' && operation === 'list') {
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: 'https://api.straico.com/v0/rag/user',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'rag' && operation === 'get') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: `https://api.straico.com/v0/rag/${ragId}`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'rag' && operation === 'update') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				const fileField = this.getNodeParameter('files', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const form = new FormData();
				const binaryData = items[i].binary?.[fileField];
				if (!binaryData) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data property "${fileField}" found on item!`,
					);
				}
				const bufferData = await this.helpers.getBinaryDataBuffer(i, fileField);
				const fileName = binaryData.fileName || 'uploaded_file.pdf';
				form.append('files', bufferData, fileName);
				const response = await this.helpers.httpRequest({
					method: 'PUT',
					url: `https://api.straico.com/v0/rag/${ragId}`,
					headers: {
						...form.getHeaders(),
						Authorization: `Bearer ${credentials.apiKey}`,
					},
					body: form,
				});
				returnData.push({ json: response });
			} else if (resource === 'rag' && operation === 'delete') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'DELETE',
					url: `https://api.straico.com/v0/rag/${ragId}`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'rag' && operation === 'promptCompletion') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const search_type = this.getNodeParameter('search_type', i) as string;
				const k = this.getNodeParameter('k', i) as number;
				const fetch_k = this.getNodeParameter('fetch_k', i) as number;
				const lambda_mult = this.getNodeParameter('lambda_mult', i) as number;
				const score_threshold = this.getNodeParameter('score_threshold', i) as number;
				const credentials = await this.getCredentials('StraicoApi');
				const body: any = { prompt, model };
				if (search_type) body.search_type = search_type;
				if (k) body.k = k;
				if (fetch_k) body.fetch_k = fetch_k;
				if (lambda_mult) body.lambda_mult = lambda_mult;
				if (score_threshold) body.score_threshold = score_threshold;
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://api.straico.com/v0/rag/${ragId}/prompt`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body,
				});
				returnData.push({ json: response });
			} else if (resource === 'agent' && operation === 'update') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const name = this.getNodeParameter('name', i) as string;
				const custom_prompt = this.getNodeParameter('custom_prompt', i) as string;
				const default_llm = this.getNodeParameter('default_llm', i) as string;
				const description = this.getNodeParameter('description', i) as string;
				const tags = this.getNodeParameter('tags', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const body: any = { name, custom_prompt, default_llm, description };
				if (tags) body.tags = JSON.parse(tags);
				const response = await this.helpers.httpRequest({
					method: 'PUT',
					url: `https://stapi.straico.com/v0/agent/${agentId}`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body,
				});
				returnData.push({ json: response });
			} else if (resource === 'agent' && operation === 'delete') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'DELETE',
					url: `https://api.straico.com/v0/agent/${agentId}`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'agent' && operation === 'promptCompletion') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const search_type = this.getNodeParameter('search_type', i) as string;
				const k = this.getNodeParameter('k', i) as number;
				const fetch_k = this.getNodeParameter('fetch_k', i) as number;
				const lambda_mult = this.getNodeParameter('lambda_mult', i) as number;
				const score_threshold = this.getNodeParameter('score_threshold', i) as number;
				const credentials = await this.getCredentials('StraicoApi');
				const body: any = { prompt };
				if (search_type) body.search_type = search_type;
				if (k) body.k = k;
				if (fetch_k) body.fetch_k = fetch_k;
				if (lambda_mult) body.lambda_mult = lambda_mult;
				if (score_threshold) body.score_threshold = score_threshold;
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://api.straico.com/v0/agent/${agentId}/prompt`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body,
				});
				returnData.push({ json: response });
			} else if (resource === 'user' && operation === 'get') {
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: 'https://api.straico.com/v0/user',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'models' && operation === 'getAll') {
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: 'https://api.straico.com/v1/models',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				if (response.data) {
					// Procesar modelos de chat
					if (Array.isArray(response.data.chat)) {
						for (const model of response.data.chat) {
							returnData.push({ json: { ...model, type: 'chat' } });
						}
					}
					// Procesar modelos de imagen (puede ser array de arrays)
					if (Array.isArray(response.data.image)) {
						for (const imageGroup of response.data.image) {
							if (Array.isArray(imageGroup)) {
								for (const model of imageGroup) {
									returnData.push({ json: { ...model, type: 'image' } });
								}
							} else if (imageGroup) {
								returnData.push({ json: { ...imageGroup, type: 'image' } });
							}
						}
					}
				} else {
					returnData.push({ json: response });
				}
			} else if (resource === 'prompt' && operation === 'completion') {
				const models = this.getNodeParameter('models', i, []);
				const smartLlmSelector = this.getNodeParameter('smart_llm_selector', i, undefined);
				const message = this.getNodeParameter('message', i);
				const additionalFields = this.getNodeParameter('additionalFields', i, {});
				const credentials = await this.getCredentials('StraicoApi');

				// Validación exclusiva
				const hasModels = Array.isArray(models) && models.length > 0;
				const isSmartSelectorObj =
					smartLlmSelector &&
					typeof smartLlmSelector === 'object' &&
					!Array.isArray(smartLlmSelector);
				const hasSmartSelector =
					isSmartSelectorObj &&
					('quantity' in smartLlmSelector || 'pricing_method' in smartLlmSelector);
				if (!hasModels && !hasSmartSelector) {
					throw new NodeOperationError(
						this.getNode(),
						'You must provide either models or smart_llm_selector.',
					);
				}
				if (hasModels && hasSmartSelector) {
					throw new NodeOperationError(
						this.getNode(),
						'You cannot provide both models and smart_llm_selector.',
					);
				}

				const body: any = {
					message,
					...additionalFields,
				};
				if (hasModels) {
					body.models = models;
				}
				if (hasSmartSelector) {
					body.smart_llm_selector = smartLlmSelector;
				}

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'https://api.straico.com/v1/prompt/completion',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				});
				returnData.push({ json: response });
			} else if (resource === 'image' && operation === 'generate') {
				const model = this.getNodeParameter('model', i);
				const description = this.getNodeParameter('description', i);
				const size = this.getNodeParameter('size', i);
				const variations = this.getNodeParameter('variations', i);
				const seed = this.getNodeParameter('seed', i, undefined);
				const enhanceValue = Boolean(this.getNodeParameter('enhance', i, false));
				let customEnhancer;
				if (enhanceValue === true) {
					customEnhancer = this.getNodeParameter('customEnhancer', i, undefined);
				}
				const credentials = await this.getCredentials('StraicoApi');
				const body: any = {
					model,
					description,
					size,
					variations,
				};
				if (
					seed !== undefined &&
					seed !== null &&
					typeof model === 'string' &&
					(model.startsWith('flux') || model.startsWith('ideogram'))
				) {
					body.seed = seed;
				}
				if (enhanceValue === true) {
					body.enhance = true;
					if (customEnhancer) body.customEnhancer = customEnhancer;
				}
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'https://api.straico.com/v0/image/generation',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				});
				returnData.push({ json: response });
			} else if (resource === 'file' && operation !== 'upload') {
				// Implementa aquí otras operaciones de file si existen
				returnData.push({ json: { message: 'Operation not implemented' } });
			} else if (resource === 'agent' && operation === 'create') {
				const name = this.getNodeParameter('name', i) as string;
				const custom_prompt = this.getNodeParameter('custom_prompt', i) as string;
				const default_llm = this.getNodeParameter('default_llm', i) as string;
				const description = this.getNodeParameter('description', i) as string;
				const tags = this.getNodeParameter('tags', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const body: any = { name, custom_prompt, default_llm, description };
				if (tags) body.tags = tags;
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: 'https://api.straico.com/v0/agent',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body,
				});
				returnData.push({ json: response });
			} else if (resource === 'agent' && operation === 'get') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: `https://api.straico.com/v0/agent/${agentId}`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'agent' && operation === 'list') {
				const credentials = await this.getCredentials('StraicoApi');
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: 'https://api.straico.com/v0/agent/',
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
					},
				});
				returnData.push({ json: response });
			} else if (resource === 'agent' && operation === 'addRag') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const ragId = this.getNodeParameter('ragId', i) as string;
				const credentials = await this.getCredentials('StraicoApi');
				const body = { rag: ragId };
				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `https://stapi.straico.com/v0/agent/${agentId}/rag`,
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				});
				returnData.push({ json: response });
			} else {
				// fallback to default routing
				returnData.push(items[i]);
			}
		}

		return this.prepareOutputData(returnData);
	}
}
