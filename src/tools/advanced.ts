import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CreateMessageResultSchema } from '@modelcontextprotocol/sdk/types.js';
import * as z from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Path for persistent state to survive across multiple one-shot CLI calls in tests
const STATE_FILE = path.join(os.tmpdir(), 'mcp-starter-template-state.json');

function getPersistedState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        }
    } catch (e) {
        // Fallback to default
    }
    return { secretToolEnabled: false };
}

function savePersistedState(state: { secretToolEnabled: boolean }) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state));
    } catch (e) {
        // Ignore save errors in template
    }
}

/**
 * Registers advanced tool examples demonstrating orchestration and high-level patterns.
 * Demonstrates:
 * 1. Sampling (requesting the client LLM to generate content) with fallback logic.
 * 2. Standard Long-Running Tool (async with cancellation).
 * 3. Dynamic Tool Management (enabling/disabling tools at runtime).
 */
export function registerAdvancedTools(server: McpServer) {
    // 1. Sampling Tool with Fallback & Cancellation
    server.registerTool(
        'research_and_summarize',
        {
            title: 'Research & Summarize',
            description: `Research a topic and provide a summary using the client LLM (sampling).
When to use:
- Generating synthesized overviews of complex subjects.
- Outsourcing high-level reasoning to the client.
IMPORTANT: Requires client sampling support. Falls back to a status message if unavailable.
Returns: A summarized text response.`,
            annotations: {
                readOnlyHint: true,
                openWorldHint: true,
            },
            inputSchema: {
                topic: z.string().describe('The topic to research and summarize, for example "WebSocket protocol design patterns".'),
            },
        },
        async ({ topic }, ctx) => {
            // Demonstrate usage of cancellation signal
            if (ctx.signal.aborted) {
                return {
                    content: [{ type: 'text', text: 'Task was cancelled before it started.' }],
                    isError: true,
                };
            }

            try {
                const result = await ctx.sendRequest(
                    {
                        method: 'sampling/createMessage',
                        params: {
                            messages: [{ role: 'user', content: { type: 'text', text: `Please provide a summary of ${topic}.` } }],
                            maxTokens: 100,
                        },
                    },
                    CreateMessageResultSchema,
                    { signal: ctx.signal } // Pass the cancellation signal to the request
                );

                const summaryText = result.content.type === 'text' ? result.content.text : 'No text content.';
                return {
                    content: [{ type: 'text', text: `[Sampling Result] Summary of ${topic}:\n\n${summaryText}` }],
                };
            } catch (error: unknown) {
                // If cancelled, return early
                if (error instanceof Error && error.name === 'AbortError') {
                    return { content: [{ type: 'text', text: 'Research was cancelled.' }] };
                }

                await server.server.sendLoggingMessage({
                    level: 'warning',
                    logger: 'advanced-tools',
                    data: `Sampling failed: ${error instanceof Error ? error.message : String(error)}. Using fallback.`
                });
                return {
                    content: [{ type: 'text', text: `[Fallback Result] Summary of ${topic}:\n\nSampling is unsupported by this client.` }],
                };
            }
        }
    );

    // 2. Standard Long-Running Tool
    // Demonstrates standard async execution with cancellation support.
    server.registerTool(
        'long_running_task',
        {
            title: 'Long Running Task',
            description: `A standard async tool that simulates a long-running process.
When to use:
- Operations that take several seconds to complete.
- Testing client-side timeouts and cancellation.
Returns: A success message after all steps complete.`,
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
            },
            inputSchema: {
                steps: z.number().int().min(1).max(20).default(5)
                    .describe('Number of steps to simulate.'),
            },
        },
        async ({ steps }, ctx) => {
            for (let i = 1; i <= steps; i++) {
                // Check if user cancelled the request
                if (ctx.signal.aborted) {
                    return {
                        content: [{ type: 'text', text: `Task cancelled at step ${i}.` }],
                        isError: true
                    };
                }

                await server.server.sendLoggingMessage({
                    level: 'info',
                    logger: 'advanced-tools',
                    data: `Processing step ${i} of ${steps}...`
                });

                // Simulate work
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            return {
                content: [{ type: 'text', text: `Successfully completed ${steps} steps.` }]
            };
        }
    );

    // 3. Dynamic Tool Management
    const state = getPersistedState();
    const secretTool = server.registerTool(
        'secret_access',
        {
            description: 'A tool that is usually disabled and must be unlocked.',
        },
        async () => {
            return {
                content: [{ type: 'text', text: 'You have accessed the secret chamber!' }]
            };
        }
    );

    // Apply persisted state
    if (!state.secretToolEnabled) {
        secretTool.disable();
    } else {
        secretTool.enable();
    }

    server.registerTool(
        'toggle_secret_tool',
        {
            title: 'Toggle Secret Tool',
            description: `Enables or disables the "secret_access" tool.
When to use:
- Managing access to restricted capabilities at runtime.
- Demonstrating dynamic tool registration and visibility.
Returns: A status message confirming the change.`,
            annotations: {
                destructiveHint: true,
                idempotentHint: true,
            },
            inputSchema: {
                enabled: z.boolean().describe('Whether to enable the tool.'),
            }
        },
        async ({ enabled }) => {
            if (enabled) {
                secretTool.enable();
            } else {
                secretTool.disable();
            }

            // Persist for future one-shot CLI calls
            savePersistedState({ secretToolEnabled: enabled });

            // Notify client that tool list has changed
            server.server.sendToolListChanged();

            return {
                content: [{ type: 'text', text: `Tool "secret_access" is now ${enabled ? 'ENABLED' : 'DISABLED'}.` }]
            };
        }
    );
}
