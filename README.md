![Straico Banner](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-straico-official

This is an n8n community node. It lets you use Straico in your n8n workflows.

Straico is an AI-powered platform that provides advanced prompt completion, image generation, agent management, and Retrieval-Augmented Generation (RAG) capabilities via API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The Straico node supports the following operations:

- **User**
  - Get Info: Retrieve user information.
- **Models**
  - Get All: List all available models (chat and image).
- **Prompt**
  - Completion: Generate text completions using selected models or smart LLM selector.
- **Image**
  - Generate Image: Create images using AI models with customizable parameters.
- **Agent**
  - Create: Create a new agent.
  - Get Details: Retrieve agent details.
  - List: List all agents.
  - Add RAG: Link a RAG to an agent.
  - Update: Update agent details.
  - Delete: Delete an agent.
  - Prompt Completion: Send a prompt to an agent.
- **File**
  - Upload: Upload files for use in RAG or prompt operations.
- **RAG**
  - Create: Create a new RAG with files.
  - List: List all RAGs.
  - Get: Retrieve a RAG by ID.
  - Update: Update a RAG with new files.
  - Delete: Delete a RAG.
  - Prompt Completion: Send a prompt to a RAG.

## Credentials

To use this node, you need a Straico API key.

1. Sign up at [Straico](https://straico.com/) and obtain your API key from your account dashboard.
2. In n8n, add new credentials for "Straico API" and paste your API key.
3. The node will use this key to authenticate all API requests.

## Compatibility

- Minimum n8n version: 1.0.0
- Tested with n8n 1.x and Straico API v1.
- No known incompatibilities at this time.

## Usage

- For prompt completions, you must provide either a list of models or use the smart LLM selector, but not both.
- File and RAG operations require binary data to be present in the workflow item.
- For image generation, you can specify model, description, size, variations, and optional enhancement parameters.
- Refer to the [Straico API documentation](https://documenter.getpostman.com/view/5900072/2s9YyzddrR) for details on request and response formats.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Straico API documentation](https://documenter.getpostman.com/view/5900072/2s9YyzddrR)

## Version history

- **2.0.0**: Initial release with support for user, models, prompt, image, agent, file, and RAG operations.
