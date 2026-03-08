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
            title: 'Server Environment Info',
            description: `Provides basic information about the server environment.
When to use:
- Checking server version, platform, or resource usage.
- Debugging environment-specific issues.
- For example, use this to check if the server is running on "darwin" or "linux".`,
            mimeType: 'application/json',
            annotations: {
                audience: ['assistant'],
                priority: 0.8,
            },
            icons: [
                {
                    src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMjAiIGhlaWdodD0iOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHJlY3QgeD0iMiIgeT0iMTQiIHdpZHRoPSIyMCIgaGVpZ2h0PSI4IiByeD0iMiIgcnk9IjIiPjwvcmVjdD48bGluZSB4MT0iNiIgeTE9IjYiIHgyPSI2LjAxIiB5Mj0iNiI+PC9saW5lPjxsaW5lIHgxPSI2IiB5MT0iMTgiIHgyPSI2LjAxIiB5Mj0iMTgiPjwvbGluZT48L3N2Zz4=',
                    mimeType: 'image/svg+xml',
                }
            ]
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
            title: 'Dynamic Greeting',
            description: `A dynamic greeting resource based on a name parameter.
When to use:
- Generating personalized welcome messages.
- Demonstrating resource template parameter substitution.
- For example, read "greeting://Alice" to get a personalized greeting for Alice.`,
            mimeType: 'text/plain',
            annotations: {
                audience: ['user', 'assistant'],
                priority: 0.5,
            }
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
