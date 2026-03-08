import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import os from 'node:os';
import { registerBinaryResources } from './binary.js';

export function registerResources(server: McpServer) {
    // 1. Static Resource
    // Using registerResource for consistent pattern across all primitives
    server.registerResource(
        'server-info',
        'info://server',
        {
            description: 'Provide basic information about the server environment.'
        },
        async (uri) => {
            const info = {
                name: 'mcp-starter-template',
                version: '1.0.0',
                platform: os.platform(),
                architecture: os.arch(),
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
            };

            return {
                contents: [
                    {
                        uri: uri.href,
                        text: JSON.stringify(info, null, 2),
                        mimeType: 'application/json',
                    },
                ],
            };
        }
    );

    // 2. Resource Template
    server.registerResource(
        'greeting',
        new ResourceTemplate('greeting://{name}', {
            list: async () => ({
                resources: [{ uri: 'greeting://world', name: 'Greeting for world' }]
            })
        }),
        {
            description: 'A dynamic greeting resource based on a name parameter.'
        },
        async (uri, { name }) => {
            const greeting = `Hello, ${name}! Welcome to the MCP Starter Template server.`;

            return {
                contents: [
                    {
                        uri: uri.href,
                        text: greeting,
                        mimeType: 'text/plain',
                    },
                ],
            };
        }
    );

    // Register binary resource examples
    registerBinaryResources(server);
}
