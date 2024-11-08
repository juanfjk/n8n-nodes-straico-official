import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class Straico implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Straico',
    name: 'Straico',
    icon: 'file:straico.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
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
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'anthropic/claude-3-haiku:beta',
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
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            default: 0.7,
            description:
              'Controls the creativity and diversity of the generated text. Higher values lead to more creative but less coherent text.',
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
            description: 'The maximum number of tokens to generate in the completion.',
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
    ],
  };
}