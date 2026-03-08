import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer) {
    // 1. Persona-Driven Prompt (Architecture Consultant)
    // Demonstrates role prompting by using an initial message to establish context and persona.
    server.registerPrompt(
        'architecture-consultant',
        {
            description: 'Get architectural advice from a senior software consultant.',
            argsSchema: {
                projectDescription: z.string().describe('The project or system you need advice on.'),
            }
        },
        ({ projectDescription }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `You are a Senior Software Architect with 15+ years of experience in distributed systems and cloud-native patterns. Your goal is to provide robust, scalable, and maintainable architectural advice.
                        
                        Please review the following project description and provide high-level recommendations:
                        
                        ---
                        ${projectDescription}
                        ---`,
                    },
                },
            ],
        })
    );

    // 2. Few-Shot Prompt (Code Stylist)
    // Demonstrates few-shot prompting using both 'user' and 'assistant' roles to provide clear examples of desired behavior.
    server.registerPrompt(
        'code-stylist',
        {
            description: 'Refactor code to follow clean, modern 2026 conventions.',
            argsSchema: {
                code: z.string().describe('The code to restyle.'),
                language: z.string().describe('The programming language.'),
            }
        },
        ({ code, language }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: 'Restyle this TypeScript code: "const x = function(a) { return a*2; }"',
                    },
                },
                {
                    role: 'assistant',
                    content: {
                        type: 'text',
                        text: '```typescript\nconst double = (value: number): number => value * 2;\n```',
                    },
                },
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Now, please restyle the following ${language} code:\n\n${code}`,
                    },
                },
            ],
        })
    );

    // 3. Chain of Thought (CoT) Prompt (Logical Reasoner)
    // Demonstrates how to guide the AI through step-by-step reasoning for complex problems.
    server.registerPrompt(
        'logical-reasoner',
        {
            description: 'Solve complex logical problems using step-by-step reasoning.',
            argsSchema: {
                problem: z.string().describe('The logical problem to solve.'),
            }
        },
        ({ problem }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `You are a logical reasoning assistant. For the problem provided, please:
                        1. Identify the core components and constraints.
                        2. Think step-by-step to explore possible solutions.
                        3. Provide the final answer with a clear explanation.
                        
                        Problem:
                        ${problem}`,
                    },
                },
            ],
        })
    );

    // 4. Legacy compatible simple prompt (renamed for clarity)
    server.registerPrompt(
        'simple-summary',
        {
            description: 'A basic prompt for summarizing text.',
            argsSchema: {
                text: z.string().describe('Text to summarize.'),
            }
        },
        ({ text }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Please summarize this: ${text}`,
                    },
                },
            ],
        })
    );
}
