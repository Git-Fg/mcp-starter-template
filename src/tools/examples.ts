import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * This file demonstrates 'graduated orchestration' levels for 2026 MCP servers.
 * These examples show how simple, well-described tools enable complex autonomous behaviors.
 */

export function registerExampleTools(server: McpServer) {
    /**
     * LEVEL 1: ATOMIC TOOL
     * Pure utility, zero dependencies, clear constraints.
     * Optimal for: Direct, predictable tasks.
     */
    server.registerTool(
        'ping_host',
        {
            description: `Check connectivity to a specific host.
When to use:
- Verifying if a service is reachable before attempting complex operations.
- Troubleshooting network barriers.
Returns: Connectivity status and latency.`,
            inputSchema: {
                host: z.string().describe('The hostname or IP address to ping.')
            }
        },
        async ({ host }) => {
            // Logic would go here. Returning mock for template purposes.
            return {
                content: [{ type: 'text', text: `Host ${host} is reachable. Latency: 12ms.` }]
            };
        }
    );

    /**
     * LEVEL 2: SEQUENTIAL/CHANNABLE TOOL
     * Designed to be the source for follow-up tools.
     * Optimal for: Multi-step workflows (e.g., Extract -> Search -> Summarize).
     */
    server.registerTool(
        'extract_keywords',
        {
            description: `Analyze text to find key technical terms.
When to use:
- Distilling complex content into searchable parameters.
- Preparing metadata for search_knowledge_base.
Returns: A JSON object containing extracted keywords and their count.`,
            inputSchema: {
                text: z.string().describe('The text to analyze.')
            }
        },
        async ({ text }) => {
            // Mock logic: extract words starting with capitals or technical patterns
            const keywords = text.match(/[A-Z][a-z]+/g) || ['general'];
            return {
                content: [{
                    type: 'text',
                    text: JSON.stringify({ keywords, count: keywords.length })
                }]
            };
        }
    );

    server.registerTool(
        'search_knowledge_base',
        {
            description: `Search the internal docs using keywords.
When to use:
- Retrieving specific documentation after focused keywords are identified.
- Best used after extract_keywords has provided a focused list of terms.
Returns: A list of relevant article titles.`,
            inputSchema: {
                query: z.array(z.string()).describe('List of keywords to search for.')
            }
        },
        async ({ query }) => {
            return {
                content: [{
                    type: 'text',
                    text: `Found 3 articles matching: ${query.join(', ')}. [Article 1: Architecture Guide, Article 2: API Reference, Article 3: Troubleshooting]`
                }]
            };
        }
    );

    /**
     * LEVEL 3: STATE-AWARE / DYNAMIC ORCHESTRATOR
     * Tools that manage life-cycles or enable other capabilities.
     * Optimal for: Complex environments with shared resources.
     */
    let isResourceLocked = false;
    server.registerTool(
        'toggle_workspace_lock',
        {
            description: `Lock or unlock the shared workspace.
When to use:
- Preventing conflicting changes during complex write operations.
- Coordinating access between multiple sub-tasks or agents.
Returns: The current lock status of the workspace.`,
            inputSchema: {
                lock: z.boolean().describe('True to lock, false to release.')
            }
        },
        async ({ lock }) => {
            isResourceLocked = lock;
            return {
                content: [{
                    type: 'text',
                    text: `Workspace ${lock ? 'LOCKED' : 'RELEASED'}.`
                }]
            };
        }
    );
}
