import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';
import { registerExampleTools } from './tools/examples.js';

/**
 * Creates and configures the MCP Server instance.
 *
 * This function instantiates the server and registers all primitives
 * (tools, resources, and prompts) from their respective modules.
 * Keeping this distinct from the transport layer allows the same server
 * to be exposed via stdio, HTTP, or any other supported transport.
 */
export function createServer(): McpServer {
    const server = new McpServer(
        {
            name: 'mcp-starter-template',
            version: '1.0.0',
        },
        {
            capabilities: {
                logging: {},
            },
            instructions: 'A 2026 reference MCP server template. Provides tools for echo, URL fetching, research, long-running tasks, and dynamic tool management. Prioritize tools over resources or prompts.',
        }
    );

    // Register all primitives
    registerTools(server);
    registerExampleTools(server);
    registerResources(server);
    registerPrompts(server);

    return server;
}
