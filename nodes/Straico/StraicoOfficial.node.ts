import { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { IExecuteFunctions, NodeOperationError, IRequestOptions, LoggerProxy as Logger } from 'n8n-workflow';

export class StraicoOfficial implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Straico Official',
		name: 'straicoOfficial',
		icon: 'file:straico.svg',
		group: ['transform'],
		version: [1, 2],
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Get data from Straico API',
		defaults: {
			name: 'Straico Official',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'straicoApi',
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
						name: 'Agent',
						value: 'agent',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Model',
						value: 'models',
					},
					{
						name: 'Prompt',
						value: 'prompt',
					},
					{
						name: 'RAG',
						value: 'rag',
					},
					{
						name: 'User',
						value: 'user',
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
								uri: '/v0/user',
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
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many models information',
						routing: {
							request: {
								method: 'GET',
								uri: '/v1/models',
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
								uri: '/v1/prompt/completion',
							},
						},
					},
				],
				default: 'completion',
			},
			{
				displayName: 'Model Names or IDs',
				name: 'models',
				type: 'multiOptions',
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				hint: 'Select one or more models for completion. Leave empty to use smart LLM selector.',
				typeOptions: {
					loadOptionsMethod: 'getModels',
				},
				default: [],
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
				typeOptions: {
					rows: 4,
				},
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
						'@version': [1, 2],
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
						displayName: 'Display Transcripts',
						name: 'display_transcripts',
						type: 'boolean',
						default: false,
						description: 'Whether to return transcripts of the files',
					},
					{
						displayName: 'File URLs',
						name: 'file_urls',
						type: 'string',
						default: '',
						hint: 'e.g. https://example.com/file1.pdf,https://example.com/file2.docx',
						description:
							'Comma-separated list of file URLs to analyze (up to 4, previously uploaded via the File Upload endpoint)',
					},
					{
						displayName: 'Images',
						name: 'images',
						type: 'string',
						default: '',
						hint: 'e.g. https://example.com/image1.jpg,https://example.com/image2.png',
						description: 'Comma-separated list of image URLs',
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
					},
					{
						displayName: 'Replace Failed Models',
						name: 'replace_failed_models',
						type: 'boolean',
						default: false,
						description: 'Whether to replace failed models with similar ones if available',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.7,
						description: 'Controls creativity and diversity of generated text (0-2)',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
						},
					},
					{
						displayName: 'YouTube URLs',
						name: 'youtube_urls',
						type: 'string',
						default: '',
						hint: 'e.g. https://youtube.com/watch?v=abc123,https://youtube.com/watch?v=def456',
						description: 'Comma-separated list of YouTube video URLs to analyze (up to 4)',
					},
				],
			},
			{
				displayName: 'Simplify',
				name: 'simplify',
				type: 'boolean',
				default: false,
				description: 'Whether to return a simplified version of the response instead of the raw data',
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['completion'],
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
								uri: '/v0/image/generation',
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
				typeOptions: {
					rows: 3,
				},
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
				description: 'Whether to use AI to enhance the original prompt',
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
					{ name: 'Add RAG', value: 'addRag', action: 'Add RAG to agent' },
					{ name: 'Create', value: 'create', action: 'Create a new agent' },
					{ name: 'Delete', value: 'delete', action: 'Delete agent' },
					{ name: 'Get Details', value: 'get', action: 'Get agent details' },
					{ name: 'List', value: 'list', action: 'List all agents' },
					{
						name: 'Prompt Completion',
						value: 'promptCompletion',
						action: 'Send a prompt to agent',
					},
					{ name: 'Update', value: 'update', action: 'Update agent details' },
				],
				default: 'list',
			},
			{
				displayName: 'Agent ID',
				name: 'agent_id',
				type: 'string',
				required: true,
				hint: 'e.g. agent_123456789',
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
				typeOptions: {
					rows: 4,
				},
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
				hint: 'e.g. ["assistant","rag","customer-support"]',
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
					{ name: 'Similarity', value: 'similarity' },
					{ name: 'Mmr', value: 'mmr' },
					{ name: 'Similarity_score_threshold', value: 'similarity_score_threshold' },
				],
				default: 'similarity',
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'K',
				name: 'k',
				type: 'number',
				default: 4,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'Fetch_k',
				name: 'fetch_k',
				type: 'number',
				default: 10,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'Lambda_mult',
				name: 'lambda_mult',
				type: 'number',
				default: 0.5,
				displayOptions: { show: { resource: ['agent'], operation: ['promptCompletion'] } },
			},
			{
				displayName: 'Score_threshold',
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
								uri: '/v0/file/upload',
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
					{ name: 'Delete', value: 'delete', action: 'Delete a RAG' },
					{ name: 'Get', value: 'get', action: 'Get RAG by ID' },
					{ name: 'List', value: 'list', action: 'List all ra gs' },
					{ name: 'Prompt Completion', value: 'promptCompletion', action: 'Send a prompt to a RAG' },
					{ name: 'Update', value: 'update', action: 'Update a RAG with files' },
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
					{ name: 'Similarity', value: 'similarity' },
					{ name: 'Mmr', value: 'mmr' },
					{ name: 'Similarity_score_threshold', value: 'similarity_score_threshold' },
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
				displayName: 'K',
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
				displayName: 'Fetch_k',
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
				displayName: 'Lambda_mult',
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
				displayName: 'Score_threshold',
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
			{
				displayName: 'Chunking Options',
				name: 'chunkingOptions',
				type: 'collection',
				placeholder: 'Add Chunking Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['rag'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Breakpoint Threshold Type',
						name: 'breakpoint_threshold_type',
						type: 'options',
						options: [
							{ name: 'Percentile', value: 'percentile' },
							{ name: 'Interquartile', value: 'interquartile' },
							{ name: 'Standard Deviation', value: 'standard_deviation' },
							{ name: 'Gradient', value: 'gradient' },
						],
						default: 'percentile',
						description: 'Breakpoint threshold type for semantic chunking',
						displayOptions: {
							show: {
								chunking_method: ['semantic'],
							},
						},
					},
					{
						displayName: 'Buffer Size',
						name: 'buffer_size',
						type: 'number',
						default: 100,
						description: 'Buffer size for semantic chunking',
						displayOptions: {
							show: {
								chunking_method: ['semantic'],
							},
						},
					},
					{
						displayName: 'Chunk Overlap',
						name: 'chunk_overlap',
						type: 'number',
						default: 50,
						description: 'Number of overlapping tokens between chunks',
						displayOptions: {
							show: {
								chunking_method: ['fixed_size', 'recursive', 'markdown', 'python', 'semantic'],
							},
						},
					},
					{
						displayName: 'Chunk Size',
						name: 'chunk_size',
						type: 'number',
						default: 1000,
						description: 'Size of each chunk',
						displayOptions: {
							show: {
								chunking_method: ['fixed_size', 'recursive', 'markdown', 'python', 'semantic'],
							},
						},
					},
					{
						displayName: 'Chunking Method',
						name: 'chunking_method',
						type: 'options',
						options: [
							{ name: 'Fixed Size', value: 'fixed_size' },
							{ name: 'Markdown', value: 'markdown' },
							{ name: 'Python', value: 'python' },
							{ name: 'Recursive', value: 'recursive' },
							{ name: 'Semantic', value: 'semantic' },
						],
						default: 'fixed_size',
						description: 'Chunking method to use for generating the RAG base',
					},
					{
						displayName: 'Separator',
						name: 'separator',
						type: 'string',
						default: '\n',
						description: 'Separator for fixed_size chunking',
						displayOptions: {
							show: {
								chunking_method: ['fixed_size'],
							},
						},
					},
					{
						displayName: 'Separators',
						name: 'separators',
						type: 'string',
						default: '\n\n,\n, ,',
						description: 'Comma-separated list of separators for recursive chunking',
						displayOptions: {
							show: {
								chunking_method: ['recursive'],
							},
						},
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const options: IRequestOptions = {
						method: 'GET',
						uri: '/v1/models',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
						},
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'straicoApi',
						options,
					);

					if (!response?.success || !response?.data?.chat) {
						throw new NodeOperationError(this.getNode(), 'Invalid response format from the API');
					}

					return response.data.chat.map((model: any) => ({
						name: model.name,
						value: model.model,
						description: `Max tokens: ${model.max_output}, Price: ${model.pricing.coins} coins per ${model.pricing.words} words`,
					}));
				} catch (error) {
					Logger.error('Error loading models in "Straico" node', { error: error.message });
					throw new NodeOperationError(this.getNode(), `Failed to load models: ${error.message}`);
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

				const options: IRequestOptions = {
					method: 'POST',
					uri: 'https://api.straico.com/v0/file/upload',
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					formData: {
						file: {
							value: bufferData,
							options: {
								filename: fileName,
							},
						},
					},
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'rag' && operation === 'create') {
				const name = this.getNodeParameter('ragName', i) as string;
				const description = this.getNodeParameter('ragDescription', i) as string;
				const fileField = this.getNodeParameter('files', i) as string;
				const chunkingOptions = (this.getNodeParameter('chunkingOptions', i, {}) || {}) as Record<
					string,
					any
				>;
				
				const formData: Record<string, any> = {
					name,
					description,
				};
				
				if (chunkingOptions.chunking_method) {
					formData.chunking_method = chunkingOptions.chunking_method;
					if (chunkingOptions.chunk_size !== undefined) {
						formData.chunk_size = chunkingOptions.chunk_size.toString();
					}
					if (chunkingOptions.chunk_overlap !== undefined) {
						formData.chunk_overlap = chunkingOptions.chunk_overlap.toString();
					}
					if (
						chunkingOptions.separator !== undefined &&
						chunkingOptions.chunking_method === 'fixed_size'
					) {
						formData.separator = chunkingOptions.separator;
					}
					if (
						chunkingOptions.separators !== undefined &&
						chunkingOptions.chunking_method === 'recursive'
					) {
						const separatorsArr = chunkingOptions.separators
							.split(',')
							.map((s: string) => s.trim());
						formData.separators = JSON.stringify(separatorsArr);
					}
					if (
						chunkingOptions.breakpoint_threshold_type !== undefined &&
						chunkingOptions.chunking_method === 'semantic'
					) {
						formData.breakpoint_threshold_type = chunkingOptions.breakpoint_threshold_type;
					}
					if (
						chunkingOptions.buffer_size !== undefined &&
						chunkingOptions.chunking_method === 'semantic'
					) {
						formData.buffer_size = chunkingOptions.buffer_size.toString();
					}
				}
				
				const binaryData = items[i].binary?.[fileField];
				if (!binaryData) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data property "${fileField}" found on item!`,
					);
				}
				const bufferData = await this.helpers.getBinaryDataBuffer(i, fileField);
				const fileName = binaryData.fileName || 'uploaded_file.pdf';
				
				formData.files = {
					value: bufferData,
					options: {
						filename: fileName,
					},
				};
				
				const options: IRequestOptions = {
					method: 'POST',
					uri: 'https://api.straico.com/v0/rag',
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					formData,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);
				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'rag' && operation === 'list') {
				const options: IRequestOptions = {
					method: 'GET',
					uri: 'https://api.straico.com/v0/rag/user',
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'rag' && operation === 'get') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				
				const options: IRequestOptions = {
					method: 'GET',
					uri: `https://api.straico.com/v0/rag/${ragId}`,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'rag' && operation === 'update') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				const fileField = this.getNodeParameter('files', i) as string;
				
				const binaryData = items[i].binary?.[fileField];
				if (!binaryData) {
					throw new NodeOperationError(
						this.getNode(),
						`No binary data property "${fileField}" found on item!`,
					);
				}
				const bufferData = await this.helpers.getBinaryDataBuffer(i, fileField);
				const fileName = binaryData.fileName || 'uploaded_file.pdf';
				
				const formData = {
					files: {
						value: bufferData,
						options: {
							filename: fileName,
						},
					},
				};
				
				const options: IRequestOptions = {
					method: 'PUT',
					uri: `https://api.straico.com/v0/rag/${ragId}`,
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					formData,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'rag' && operation === 'delete') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				
				const options: IRequestOptions = {
					method: 'DELETE',
					uri: `https://api.straico.com/v0/rag/${ragId}`,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'rag' && operation === 'promptCompletion') {
				const ragId = this.getNodeParameter('ragId', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const search_type = this.getNodeParameter('search_type', i) as string;
				const k = this.getNodeParameter('k', i) as number;
				const fetch_k = this.getNodeParameter('fetch_k', i) as number;
				const lambda_mult = this.getNodeParameter('lambda_mult', i) as number;
				const score_threshold = this.getNodeParameter('score_threshold', i) as number;
				const simplify = this.getNodeParameter('simplify', i, false) as boolean;

				const body: any = { prompt, model };
				if (search_type) body.search_type = search_type;
				if (k) body.k = k;
				if (fetch_k) body.fetch_k = fetch_k;
				if (lambda_mult) body.lambda_mult = lambda_mult;
				if (score_threshold) body.score_threshold = score_threshold;

				const options: IRequestOptions = {
					method: 'POST',
					uri: `https://api.straico.com/v0/rag/${ragId}/prompt`,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					form: body,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				let outputData = response;
				if (simplify && response && typeof response === 'object') {
					outputData = {
						id: response.id,
						message: response.message,
						model: response.model,
						usage: response.usage,
						created_at: response.created_at,
					};
				}

				returnData.push({ 
					json: outputData,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'agent' && operation === 'update') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const name = this.getNodeParameter('name', i) as string;
				const custom_prompt = this.getNodeParameter('custom_prompt', i) as string;
				const default_llm = this.getNodeParameter('default_llm', i) as string;
				const description = this.getNodeParameter('description', i) as string;
				const tags = this.getNodeParameter('tags', i) as string;
				const body: any = { name, custom_prompt, default_llm, description };
				if (tags) body.tags = JSON.parse(tags);

				const options: IRequestOptions = {
					method: 'PUT',
					uri: `https://stapi.straico.com/v0/agent/${agentId}`,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					form: body,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'agent' && operation === 'delete') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				
				const options: IRequestOptions = {
					method: 'DELETE',
					uri: `https://api.straico.com/v0/agent/${agentId}`,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'agent' && operation === 'promptCompletion') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const search_type = this.getNodeParameter('search_type', i) as string;
				const k = this.getNodeParameter('k', i) as number;
				const fetch_k = this.getNodeParameter('fetch_k', i) as number;
				const lambda_mult = this.getNodeParameter('lambda_mult', i) as number;
				const score_threshold = this.getNodeParameter('score_threshold', i) as number;
				const simplify = this.getNodeParameter('simplify', i, false) as boolean;

				const body: any = { prompt };
				if (search_type) body.search_type = search_type;
				if (k) body.k = k;
				if (fetch_k) body.fetch_k = fetch_k;
				if (lambda_mult) body.lambda_mult = lambda_mult;
				if (score_threshold) body.score_threshold = score_threshold;
				const options: IRequestOptions = {
					method: 'POST',
					uri: `https://api.straico.com/v0/agent/${agentId}/prompt`,
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					form: body,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				let outputData = response;
				if (simplify && response && typeof response === 'object') {
					outputData = {
						id: response.id,
						message: response.message,
						model: response.model,
						usage: response.usage,
						created_at: response.created_at,
					};
				}

				returnData.push({ 
					json: outputData,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'user' && operation === 'get') {
				const options: IRequestOptions = {
					method: 'GET',
					uri: 'https://api.straico.com/v0/user',
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'models' && operation === 'getAll') {
				const options: IRequestOptions = {
					method: 'GET',
					uri: 'https://api.straico.com/v1/models',
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				if (response.data) {
					if (Array.isArray(response.data.chat)) {
						for (const model of response.data.chat) {
							returnData.push({ json: { ...model, type: 'chat' }, pairedItem: { item: i } });
						}
					}
					if (Array.isArray(response.data.image)) {
						for (const imageGroup of response.data.image) {
							if (Array.isArray(imageGroup)) {
								for (const model of imageGroup) {
									returnData.push({ json: { ...model, type: 'image' }, pairedItem: { item: i } });
								}
							} else if (imageGroup) {
								returnData.push({ json: { ...imageGroup, type: 'image' }, pairedItem: { item: i } });
							}
						}
					}
				} else {
					returnData.push({ json: response, pairedItem: { item: i } });
				}
			} else if (resource === 'prompt' && operation === 'completion') {
				const models = this.getNodeParameter('models', i, []);
				const smartLlmSelector = this.getNodeParameter('smart_llm_selector', i, undefined);
				const message = this.getNodeParameter('message', i);
				const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<
					string,
					any
				>;
				const simplify = this.getNodeParameter('simplify', i, false) as boolean;

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

				const body: Record<string, any> = { message };
				if (hasModels) {
					body.models = models;
				}
				if (hasSmartSelector) {
					body.smart_llm_selector = smartLlmSelector;
				}

				const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
				let imagesArr: string[] = [];
				if (
					typeof additionalFields.file_urls === 'string' &&
					additionalFields.file_urls.trim() !== ''
				) {
					const arr = additionalFields.file_urls
						.split(',')
						.map((url: string) => url.trim())
						.filter((url: string) => url);
					const fileUrlsArr = arr.filter((url: string) => {
						const isImage = imageExtensions.some((ext) => url.toLowerCase().includes(ext));
						if (isImage) imagesArr.push(url);
						return !isImage;
					});
					if (fileUrlsArr.length > 0) body.file_urls = fileUrlsArr;
				}
				if (
					typeof additionalFields.youtube_urls === 'string' &&
					additionalFields.youtube_urls.trim() !== ''
				) {
					const arr = additionalFields.youtube_urls
						.split(',')
						.map((url: string) => url.trim())
						.filter((url: string) => url);
					if (arr.length > 0) body.youtube_urls = arr;
				}
				if (typeof additionalFields.images === 'string' && additionalFields.images.trim() !== '') {
					const arr = additionalFields.images
						.split(',')
						.map((url: string) => url.trim())
						.filter((url: string) => url);
					imagesArr = imagesArr.concat(arr);
				}
				if (imagesArr.length > 0) body.images = imagesArr;

				['temperature', 'max_tokens', 'replace_failed_models', 'display_transcripts'].forEach(
					(field) => {
						if (additionalFields[field] !== undefined) {
							body[field] = additionalFields[field];
						}
					},
				);

				const options: IRequestOptions = {
					method: 'POST',
					uri: 'https://api.straico.com/v1/prompt/completion',
					headers: {
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				let outputData = response;
				if (simplify && response && typeof response === 'object') {
					outputData = {
						id: response.id,
						message: response.message,
						model: response.model,
						usage: response.usage,
						created_at: response.created_at,
					};
				}

				returnData.push({ 
					json: outputData,
					pairedItem: {
						item: i,
					},
				});
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
				const options: IRequestOptions = {
					method: 'POST',
					uri: 'https://api.straico.com/v0/image/generation',
					headers: {
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'file' && operation !== 'upload') {
				returnData.push({ json: { message: 'Operation not implemented' }, pairedItem: { item: i } });
			} else if (resource === 'agent' && operation === 'create') {
				const name = this.getNodeParameter('name', i) as string;
				const custom_prompt = this.getNodeParameter('custom_prompt', i) as string;
				const default_llm = this.getNodeParameter('default_llm', i) as string;
				const description = this.getNodeParameter('description', i) as string;
				const tags = this.getNodeParameter('tags', i) as string;

				const body: any = { name, custom_prompt, default_llm, description };
				if (tags) body.tags = tags;

				const options: IRequestOptions = {
					method: 'POST',
					uri: 'https://api.straico.com/v0/agent',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					form: body,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'agent' && operation === 'get') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				
				const options: IRequestOptions = {
					method: 'GET',
					uri: `https://api.straico.com/v0/agent/${agentId}`,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'agent' && operation === 'list') {
				const options: IRequestOptions = {
					method: 'GET',
					uri: 'https://api.straico.com/v0/agent/',
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else if (resource === 'agent' && operation === 'addRag') {
				const agentId = this.getNodeParameter('agent_id', i) as string;
				const ragId = this.getNodeParameter('ragId', i) as string;
				const body = { rag: ragId };

				const options: IRequestOptions = {
					method: 'POST',
					uri: `https://stapi.straico.com/v0/agent/${agentId}/rag`,
					headers: {
						'Content-Type': 'application/json',
					},
					body,
					json: true,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'straicoApi',
					options,
				);

				returnData.push({ 
					json: response,
					pairedItem: {
						item: i,
					},
				});
			} else {
				returnData.push(items[i]);
			}
		}

		return this.prepareOutputData(returnData);
	}
}
