# MCP Starter Template (2026 Edition)

A performance-oriented, structured template for building **Autonomous-First** Model Context Protocol (MCP) servers in TypeScript.

**Dual Purpose**:
- **Editable Boilerplate** — Fork this to scaffold new MCP servers rapidly.
- **Reference Library** — Keep this alongside your other MCP servers. It acts as a 2026 "Gold Standard" that AI agents can read anytime they need to build, edit, or improve tool orchestration and metadata.

## 🚀 The 2026 Philosophy

In 2026, MCP servers are the capabilities of an autonomous workforce.

- **Tools-First Architecture**: Robust, well-described **Tools** over complex primitives like Resources, Prompts, or Sampling. In 99% of autonomous workflows, a set of efficient tools is all an agent needs.
- **Pure Autonomy**: Designed for agents that work and solve problems independently. No default human-in-the-loop interaction required.
- **Orchestration-Ready Metadata**: Every description is crafted for **Agent Orchestration** — clear schemas and instruction-rich metadata allow agents to navigate capabilities with zero ambiguity.
- **Schema Synergy**: Main descriptions handle *intent* and *strategy*; Zod argument descriptions handle *constraints* and *format*. They are complementary, never redundant.

## ✨ Features

- **Native SDK Registration**: Uses `registerTool`, `registerResource`, and `registerPrompt` for strict type safety and runtime flexibility.
- **Strict Typing & Zod**: Zero `any` policy. Runtime validation ensures agent inputs match schema expectations.
- **Stdio Optimized**: Exclusively uses `stdio` for maximum compatibility with all modern IDEs and CLI agents.
- **Dynamic Capabilities**: Runtime enabling/disabling of tools for precision orchestration and context rot prevention.
- **Comprehensive Testing**: Integration test suite using the MCP Inspector CLI for black-box protocol validation.

## 📁 Project Structure

```text
src/
├── index.ts           # Protocol entry point (stdio)
├── server.ts          # McpServer orchestration & capability registration
├── tools/             # PRIMARY: Autonomous tool definitions
├── resources/         # SPECIALIZED: Data/binary exposure (e.g. logs, images)
└── prompts/           # SPECIALIZED: Contextual templates/few-shot samples
docs/
└── descriptions_prompt_engineering.md  # Canonical guide for tool metadata
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
   pnpm test
   ```

## 🏗️ Adding Capabilities

### 1. Adding a Tool (Preferred)
Define your tool in `src/tools/`. Read [CLAUDE.md](./CLAUDE.md) and the [Description Prompt Engineering Guide](./docs/descriptions_prompt_engineering.md) first.

```typescript
server.registerTool(
    'my_tool',
    {
        description: `Perform a specific action on the target resource.
When to use:
- When the agent needs to accomplish X after discovering Y.
Returns: A confirmation message with the result.`,
        inputSchema: z.object({
            target: z.string().describe('The resource identifier, for example "project-alpha" or "user/repo".')
        }),
        outputSchema: {
            status: z.string().describe('The result of the action, for example "Success".')
        }
    },
    async ({ target }) => { ... }
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
- [Agent-First Best Practices (CLAUDE.md)](./CLAUDE.md)
- [Tool Description Prompt Engineering](./docs/descriptions_prompt_engineering.md)
