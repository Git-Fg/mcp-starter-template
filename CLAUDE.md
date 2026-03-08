# AI Agent Instructions for MCP Starter Template

This document provides instructions for AI agents working on this codebase.

## Project Vision
A minimal, highly structured, and modular MCP server template designed for developer reuse. It prioritizes the `stdio` transport as the primary communication mechanism for tools like Claude Desktop and Cursor.

## Architecture Guidelines (Agent-First & Tools-First)
In 2026, **Autonomous AI Agents** are the primary users of MCP. For optimal integration, follow these "Agent-First" principles:

- **Tools-First Strategy**: Focus on creating simple, efficient, and robust **Tools**. Tools are the most reliable primitive for agentic workflows.
- **Discouraged Primitives**: In 99% of cases, **Resources**, **Prompts**, and **Sampling** should be considered legacy or specialized edge cases. They add significant complexity for both developers and agents without offering proportional benefits in an autonomous context.
- **Long-Running Processes**: Use tools together with **Progress Logging** (`server.sendLoggingMessage`) for any tasks that take time. This keeps the agent informed without protocol friction.
- **Transport & Registration**: Exclusively `stdio`. Use the modern `registerTool` (and similar) config-based registration for strict typing and runtime flexibility.
- **Sampling Fallbacks**: If sampling is absolutely necessary, **mandate** a manual tool fallback. Never assume client support.

## Advanced Pattern: Dynamic Tool Registration
In 2026, **Dynamic Registration** is the single most efficient way to leverage MCP servers. While it introduces implementation complexity, its benefits for autonomous orchestration are critical:

- **Context Rot Prevention**: By enabling/disabling tools based on current session state, you prevent "context rot" caused by exposing too many irrelevant tools to the agent's limited tool-call window.
- **Precision Orchestration**: Pushing the "right tool at the right time" (e.g., enabling specialized analysis tools only after a data retrieval step) dramatically improves agent reliability and reduces token waste.
- **Implementation**: Use the `RegisteredTool` object returned by `registerTool` to `enable()` or `disable()` capabilities at runtime. Always trigger `server.sendToolListChanged()` to notify the client of the update.

## Graduated Complexity: Tool Orchestration Levels
Always aim for the lowest complexity that achieves the objective. Use the `src/tools/examples.ts` as a blueprint for these levels:

1. **Level 1: Atomic (Connectivity/Utility)**: Single-purpose tools like `ping_host`. High reliability, no state.
2. **Level 2: Sequential (Data Pipelines)**: Tools like `extract_keywords` designed to pipe into `search_knowledge_base`. Use descriptions to explicitly guide the agent on the dependency chain.
3. **Level 3: State-Aware (Environment Management)**: Tools like `toggle_workspace_lock` that manage the agent's operating environment.

### Cognitive-Friendly Descriptions
In 2026, the quality of a tool is measured by its **Description**.
- **Hinting**: Use the description to "hint" at follow-up tools (e.g., "After extracting keywords, use search_knowledge_base").
- **Schema Mapping**: Ensure parameter names match the agent's "mental model" of the domain to minimize mapping errors.

## Quick Start for New Servers
When creating a new server based on this template:
1. **Prune Primitives**: If Resources, Prompts, or Sampling aren't required for your specific use case, **delete them immediately**.
   - Remove folders: `src/resources/`, `src/prompts/`.
   - Cleanup `src/server.ts` imports and registration calls.
   - Simplified code is easier for AI agents to understand and maintain.
2. **Focus on Tools**: Add your logic to `src/tools/`.
3. **Craft Optimal Descriptions**: This is the most critical step for autonomous orchestration.

### Crafting Tool Descriptions (Orchestration-Ready)
Autonomous agents rely entirely on descriptions to know **when** and **how** to use a tool.
- **Intent-Driven**: Start with a clear verb (e.g., "Analyze", "Calculate", "Retrieve").
- **Constraint-Rich**: Explicitly state what the tool *cannot* do or any edge cases it handles.
- **Output Expectations**: Describe what the results will look like so the agent can plan follow-up steps.
- **Internal Chain-of-Thought**: For complex tools, include a brief "thinking" guide in the description to help the agent understand the underlying logic.

For detailed patterns and official examples, see [Tool Description Prompt Engineering](./docs/descriptions_prompt_engineering.md).
- **Testing Strategy**: For every new Tool, Resource, or Prompt added, an AI agent **MUST** adapt and expand the existing test suite in `tests/integration/cli.test.ts`. 
  - Tests rely on the `@modelcontextprotocol/inspector --cli` for "black-box" verification of the protocol.
  - Ensure `pnpm build` is run before `pnpm test` to verify the latest compiled code.

The MCP Inspector CLI is the primary tool for testing your server without needing a full-scale client like Claude Desktop.

### Basic Testing
Run the local build through the inspector:
```bash
npx @modelcontextprotocol/inspector --cli node dist/index.js
```

### Advanced Usage Examples

#### List Capabilities
```bash
# List available tools
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list

# List available resources
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/list

# List available prompts
npx @modelcontextprotocol/inspector --cli node dist/index.js --method prompts/list
```

#### Call Primitives
```bash
# Call a specific tool
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/call --tool-name echo --tool-arg message="Hello World"

# Call a tool with JSON arguments
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/call --tool-name echo --tool-arg '{"message": "Hello", "transform": "uppercase"}'
```
