import { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties, } from 'n8n-workflow';

export class StraicoApi implements ICredentialType {
  name = 'straicoApi';
  displayName = 'Straico API';
  documentationUrl = 'https://documenter.getpostman.com/view/5900072/2s9YyzddrR';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.straico.com',
      uri: '/v0/user',
    },
  };
}