import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { registerAdvancedTools } from './advanced.js';

export function registerTools(server: McpServer) {
    // 1. Simple Synchronous Tool: Echo
    // Using registerTool for better type safety and configuration
    server.registerTool(
        'echo',
        {
            title: 'Echo Message',
            description: `Echo back a message with optional transformation.
When to use:
- Simple connectivity testing between the agent and server.
- Verifying the status of the transformation logic.
Returns: The processed message string.`,
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
            },
            inputSchema: {
                message: z.string().describe('The message to echo back to the user.'),
                transform: z
                    .enum(['uppercase', 'lowercase', 'none'])
                    .optional()
                    .default('none')
                    .describe('Optional transformation to apply to the message.'),
            },
        },
        async ({ message, transform }) => {
            let finalMessage = message;
            if (transform === 'uppercase') {
                finalMessage = message.toUpperCase();
            } else if (transform === 'lowercase') {
                finalMessage = message.toLowerCase();
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: finalMessage,
                    },
                ],
            };
        }
    );

    // 2. Async Tool with Side Effects / Network request: Fetch URL
    server.registerTool(
        'fetch_url',
        {
            title: 'Fetch URL Content',
            description: `Fetch the text content of a URL (safe HTTP GET).
When to use:
- Accessing documentation or public web content.
- Scraping text for analysis or summarization.
Returns: The raw text content, truncated if it exceeds maxLength.`,
            annotations: {
                readOnlyHint: true,
                openWorldHint: true,
            },
            inputSchema: {
                url: z.string().url().describe('The URL of the webpage or API to fetch, for example "https://docs.example.com/api".'),
                maxLength: z
                    .number()
                    .int()
                    .min(100)
                    .max(10000)
                    .optional()
                    .default(2000)
                    .describe('Maximum number of characters to return from the response.'),
            }
        },
        async ({ url, maxLength }) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                }

                const text = await response.text();
                const truncated = text.length > maxLength
                    ? text.substring(0, maxLength) + '\n\n...[TRUNCATED]'
                    : text;

                return {
                    content: [
                        {
                            type: 'text',
                            text: truncated,
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        }
    );

    // Register advanced orchestration examples
    registerAdvancedTools(server);
}
