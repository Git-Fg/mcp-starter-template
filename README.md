# MCP Starter Template (2026 Edition)

A performance-oriented, structured template for building **Autonomous-First** Model Context Protocol (MCP) servers in TypeScript.

This template is designed for the modern 2026 landscape where **Autonomous AI Agents** (like Antigravity or Claude Code) are the primary consumers. It prioritizes a **Tools-First** architecture, optimized for agentic orchestration without human intervention.

## 🚀 The 2026 Philosophy

In 2026, MCP servers are no longer just "integrations"—they are the capabilities of an autonomous workforce.

- **Tools-First Architecture**: We prioritize robust, well-described **Tools** over complex primitives like Resources, Prompts, or Sampling. In 99% of autonomous workflows, a set of efficient tools is all an agent needs.
- **Pure Autonomy**: Designed for agents that work, understand, and solve problems independently while the user observes the progress. No default human-in-the-loop interaction is required.
- **Orchestration-Ready**: Every description is crafted not for humans, but for **Agent Orchestration**. Clear schemas and instruction-rich metadata allow agents to navigate the server's capabilities with zero ambiguity.
- **Progressive Async**: Long-running tasks use streamlined progress logging (`server.sendLoggingMessage`) rather than blocking the protocol, ensuring safe and observable execution.

## ✨ Features

- **Native SDK Registration**: Uses the state-of-the-art `registerTool`, `registerResource`, and `registerPrompt` methods for strict type safety and runtime flexibility.
- **Strict Typing & Zod**: Zero `any` policy. Runtime validation ensures agent inputs match exactly what your logic expects.
- **Stdio Optimized**: Exclusively uses `stdio` for maximum compatibility with all modern IDEs and CLI agents.
- **Dynamic Capabilities**: Demonstrates runtime enabling/disabling of tools (e.g., restricted access features).
- **Proactive Verification**: Comprehensive integration test suite using the MCP Inspector CLI for black-box protocol validation.

## 📁 Project Structure

```text
src/
├── index.ts           # Protocol entry point (stdio)
├── server.ts          # McpServer orchestration & capability registration
├── tools/             # PRIMARY: Autonomous tool definitions
├── resources/         # SPECIALIZED: Data/binary exposure (e.g. logs, images)
└── prompts/           # SPECIALIZED: Contextual templates/few-shot samples
```

## 🛠️ Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Build the Server**
   ```bash
   pnpm run build
   ```

3. **Verify with Tests**
   ```bash
   npm test
   ```

## 🏗️ Adding Capabilities

### 1. Adding a Tool (Preferred)
Define your tool in `src/tools/`. Tools should have optimal descriptions for agent orchestration.
```typescript
server.registerTool(
    'my_autonomous_tool',
    {
        description: 'Provide a mission-critical description for agent orchestration.',
        inputSchema: { ... }
    },
    async (args) => { ... }
);
```

### 2. Specialized Primitives (Discouraged if not required)
Resources and Prompts should only be implemented when a tool-based workflow is insufficient (e.g., exposing binary image data or providing complex few-shotting context).

## 🧪 Testing

The primary verification tool is the **MCP Inspector CLI**:

```bash
npx @modelcontextprotocol/inspector --cli node dist/index.js
```

Adapt `tests/integration/cli.test.ts` for every new capability to ensure non-breaking changes.

## 📚 References
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Agent-First Best Practices (2026)](./CLAUDE.md)
