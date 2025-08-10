#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Configuration
const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

class GPT5MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'gpt5-mcp-server',
        version: '1.0.0',
        description: 'MCP server for GPT-5 API integration - provides text generation and conversation tools',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'gpt5_generate',
            description: 'Generate text using GPT-5 with a simple prompt',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The prompt to send to GPT-5'
                },
                max_tokens: {
                  type: 'number',
                  description: 'Maximum number of tokens to generate (default: 1000)',
                  default: 1000
                },
                temperature: {
                  type: 'number',
                  description: 'Sampling temperature (0-2, default: 0.7)',
                  default: 0.7
                }
              },
              required: ['prompt']
            }
          },
          {
            name: 'gpt5_messages',
            description: 'Send a conversation with multiple messages to GPT-5',
            inputSchema: {
              type: 'object',
              properties: {
                messages: {
                  type: 'array',
                  description: 'Array of message objects with role and content',
                  items: {
                    type: 'object',
                    properties: {
                      role: {
                        type: 'string',
                        enum: ['system', 'user', 'assistant'],
                        description: 'The role of the message sender'
                      },
                      content: {
                        type: 'string',
                        description: 'The content of the message'
                      }
                    },
                    required: ['role', 'content']
                  }
                },
                max_tokens: {
                  type: 'number',
                  description: 'Maximum number of tokens to generate (default: 1000)',
                  default: 1000
                },
                temperature: {
                  type: 'number',
                  description: 'Sampling temperature (0-2, default: 0.7)',
                  default: 0.7
                },
                system_prompt: {
                  type: 'string',
                  description: 'Optional system prompt to prepend to messages'
                }
              },
              required: ['messages']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'gpt5_generate':
            return await this.handleGenerate(args);
          
          case 'gpt5_messages':
            return await this.handleMessages(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async handleGenerate(args) {
    const { prompt, max_tokens = 1000, temperature = 0.7 } = args;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const messages = [{ role: 'user', content: prompt }];
    const response = await this.callGPT5API(messages, max_tokens, temperature);

    return {
      content: [
        {
          type: 'text',
          text: response
        }
      ]
    };
  }

  async handleMessages(args) {
    const { messages, max_tokens = 1000, temperature = 0.7, system_prompt } = args;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required');
    }

    const finalMessages = system_prompt 
      ? [{ role: 'system', content: system_prompt }, ...messages]
      : messages;

    const response = await this.callGPT5API(finalMessages, max_tokens, temperature);

    return {
      content: [
        {
          type: 'text',
          text: response
        }
      ]
    };
  }

  async callGPT5API(messages, maxTokens, temperature) {
    const requestBody = {
      model: 'gpt-5',
      messages,
      max_completion_tokens: maxTokens,  // GPT-5 uses max_completion_tokens
      temperature: 1  // GPT-5 only supports temperature = 1
    };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GPT-5 API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from GPT-5';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GPT-5 MCP server running on stdio');
  }
}

// Start the server
const server = new GPT5MCPServer();
server.run().catch(console.error);