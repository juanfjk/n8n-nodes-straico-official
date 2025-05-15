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
				default: ['anthropic/claude-3-haiku:beta'],
				required: true,
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['completion'],
					},
				},
				/*         options: [
          {
            name: 'Anthropic: Claude 3 Haiku',
            value: 'anthropic/claude-3-haiku:beta',
          },
          {
            name: 'Anthropic: Claude 3 Opus',
            value: 'anthropic/claude-3-opus',
          },
          {
            name: 'Anthropic: Claude 3 Sonnet',
            value: 'anthropic/claude-3-sonnet',
          },
          {
            name: 'Anthropic: Claude 3.5 Sonnet',
            value: 'anthropic/claude-3.5-sonnet',
          },
          {
            name: 'Cohere: Command R (08-2024)',
            value: 'cohere/command-r-08-2024',
          },
          {
            name: 'Cohere: Command R+ (08-2024)',
            value: 'cohere/command-r-plus-08-2024',
          },
          {
            name: 'Dolphin 2.6 Mixtral 8x7B',
            value: 'cognitivecomputations/dolphin-mixtral-8x7b',
          },
          {
            name: 'EVA Qwen2.5 14B',
            value: 'eva-unit-01/eva-qwen-2.5-14b',
          },
          {
            name: 'Goliath 120B',
            value: 'alpindale/goliath-120b',
          },
          {
            name: 'Google: Gemini Pro 1.5',
            value: 'google/gemini-pro-1.5',
          },
          {
            name: 'Google: Gemma 2 27B',
            value: 'google/gemma-2-27b-it',
          },
          {
            name: 'Gryphe: MythoMax L2 13B 8k',
            value: 'gryphe/mythomax-l2-13b',
          },
          {
            name: 'Meta: Llama 3 70B Instruct (nitro)',
            value: 'meta-llama/llama-3-70b-instruct:nitro',
          },
          {
            name: 'Meta: Llama 3 8B Instruct',
            value: 'meta-llama/llama-3-8b-instruct',
          },
          {
            name: 'Meta: Llama 3.1 405B Instruct',
            value: 'meta-llama/llama-3.1-405b-instruct',
          },
          {
            name: 'Meta: Llama 3.1 70B Instruct',
            value: 'meta-llama/llama-3.1-70b-instruct',
          },
          {
            name: 'Mistral: Codestral Mamba',
            value: 'mistralai/codestral-mamba',
          },
          {
            name: 'Mistral: Large',
            value: 'mistralai/mistral-large',
          },
          {
            name: 'Mistral: Mixtral 8x7B',
            value: 'mistralai/mixtral-8x7b-instruct',
          },
          {
            name: 'NVIDIA: Llama 3.1 Nemotron 70B Instruct',
            value: 'nvidia/llama-3.1-nemotron-70b-instruct',
          },
          {
            name: 'Nous: Hermes 3 405B Instruct',
            value: 'nousresearch/hermes-3-llama-3.1-405b',
          },
          {
            name: 'OpenAI: GPT-3.5 Turbo 16k',
            value: 'openai/gpt-3.5-turbo-0125',
          },
          {
            name: 'OpenAI: GPT-4',
            value: 'openai/gpt-4',
          },
          {
            name: 'OpenAI: GPT-4 Turbo 128k',
            value: 'openai/gpt-4-turbo-2024-04-09',
          },
          {
            name: 'OpenAI: GPT-4 Vision',
            value: 'openai/gpt-4-vision-preview',
          },
          {
            name: 'OpenAI: GPT-4o - New (Aug-06)',
            value: 'openai/gpt-4o-2024-08-06',
          },
          {
            name: 'OpenAI: GPT-4o - Old',
            value: 'openai/gpt-4o',
          },
          {
            name: 'OpenAI: GPT-4o mini',
            value: 'openai/gpt-4o-mini',
          },
          {
            name: 'OpenAI: o1-mini (Beta)',
            value: 'openai/o1-mini',
          },
          {
            name: 'OpenAI: o1-preview (Beta)',
            value: 'openai/o1-preview',
          },
          {
            name: 'Perplexity: Llama 3.1 Sonar 405B Online',
            value: 'perplexity/llama-3.1-sonar-huge-128k-online',
          },
          {
            name: 'Perplexity: Llama 3.1 Sonar 70B Online',
            value: 'perplexity/llama-3.1-sonar-large-128k-online',
          },
          {
            name: 'Perplexity: Llama 3.1 Sonar 8B Online',
            value: 'perplexity/llama-3.1-sonar-small-128k-online',
          },
          {
            name: 'Qwen 2 72B Instruct',
            value: 'qwen/qwen-2-72b-instruct',
          },
          {
            name: 'Qwen2-VL 72B Instruct',
            value: 'qwen/qwen-2-vl-72b-instruct',
          },
          {
            name: 'Qwen2.5 72B Instruct',
            value: 'qwen/qwen-2.5-72b-instruct',
          },
          {
            name: 'xAI: Grok Beta',
            value: 'x-ai/grok-beta',
          },
        ], */
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
				name: 'rag',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['agent'], operation: ['addRag'] } },
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
				displayName: 'Files',
				name: 'files',
				description: 'Files to upload',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create'] } },
				typeOptions: { multipleValues: true, file: true },
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
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create'] } },
				default: '',
			},
			{
				displayName: 'Files',
				name: 'files',
				description: 'Files to upload',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['rag'], operation: ['create'] } },
				typeOptions: { multipleValues: true, file: true },
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
				const name = this.getNodeParameter('name', i) as string;
				const description = this.getNodeParameter('description', i) as string;
				const filesParam = this.getNodeParameter('files', i) as string[];
				const credentials = await this.getCredentials('StraicoApi');
				const form = new FormData();
				form.append('name', name);
				form.append('description', description);
				for (const fileField of filesParam) {
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
				}
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
				const filesParam = this.getNodeParameter('files', i) as string[];
				const credentials = await this.getCredentials('StraicoApi');
				const form = new FormData();
				for (const fileField of filesParam) {
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
				}
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
			} else {
				// fallback to default routing
				returnData.push(items[i]);
			}
		}

		return this.prepareOutputData(returnData);
	}
}
