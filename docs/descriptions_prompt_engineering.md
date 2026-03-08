# Tool Description Prompt Engineering (2026 Reference)

In the 2026 autonomous-first landscape, the success of an MCP server depends heavily on its **metadata**. High-quality descriptions allow agents to discover, select, and orchestrate tools with minimal "reasoning overhead."

---

## The "Golden Pattern" for Descriptions

A high-performance description should answer three questions for the agent:
1. **Context**: What specific problem does this solve?
2. **Heuristics**: When should I choose *this* tool over another?
3. **Expectations**: What will I get back, and how should I treat the result?

### Schema Synergy: Complementary Metadata
In modern MCP (2026), the **Main Description** and the **Zod Argument Descriptions** work as a unified interface. They must be complementary, never redundant.

| Layer | What goes here | Example |
|---|---|---|
| **Main Description** | Intent, strategy, "When to use", orchestration hints, natural-language examples | "Searches for local businesses. Best used when a query implies 'near me'." |
| **Argument Descriptions (Zod `.describe()`)** | Per-parameter constraints, types, defaults, format expectations | `query: z.string().describe('The search query. Keep it concise.')` |

### The Example Rule: Natural Language Only
Examples are **critical** — include them in 95% of cases, both in main descriptions and argument descriptions. However, always use **Natural Language**. **NEVER** provide JSON call samples or literal code invocations.

- ❌ **WRONG**: `Example: brave_web_search({ query: "mcp sdk" })`
- ✅ **RIGHT**: "For example, if the user asks about the latest MCP SDK version, use this with the query 'mcp sdk documentation'."
- ❌ **WRONG**: `Input: { "host": "google.com" }`
- ✅ **RIGHT** (in Zod `.describe()`): `'The hostname or IP to ping, for example google.com or 192.168.1.1'`

**Why?** The Zod schema and argument descriptions are already provided to the agent alongside the main description. Forcing duplicate JSON/code examples creates **instruction drift** — the agent ignores the real schema in favor of a potentially stale or simplified example.

### Zod Schema Optimization: The Other Steering Mechanism
The Zod schema is **not just validation** — it is a primary mechanism to steer agent behavior and prevent hallucinated arguments. An optimally constrained schema is as important as an optimally written description.

**Core Rules**:
1. **Always `.describe()`** — Every parameter must have a `.describe()` with clear intent and a natural-language example. No exceptions.
2. **Enum over String** — If there are a known set of valid values, always use `z.enum()`. This eliminates agent guesswork entirely.
3. **Constrain Numerics** — Always use `.min()`, `.max()`, `.int()`, `.positive()` to define valid ranges.
4. **Generous Defaults** — Use `.default()` so agents can call tools with minimal arguments and get reasonable behavior.
5. **Typed Formats** — Prefer `.url()`, `.email()`, `.uuid()` over raw `z.string()` when the format is known.
6. **Optional with Intent** — Use `.optional()` for truly optional params, but always pair it with `.describe()` to explain *when* to use it.

**Comparison**:

```typescript
// ❌ BAD: vague, unconstrained, no descriptions
inputSchema: {
    query: z.string(),
    count: z.number(),
    format: z.string(),
}

// ✅ GOOD: constrained, described, agent-friendly
inputSchema: z.object({
    query: z.string()
        .describe('The search query, for example "react hooks best practices"'),
    count: z.number().int().min(1).max(50).default(10)
        .describe('Number of results to return.'),
    format: z.enum(['json', 'markdown', 'plain']).default('json')
        .describe('Output format. Use markdown when results will be shown to the user.'),
}),
outputSchema: {
    results: z.array(z.string()).describe('List of search result titles.')
}

### The 90/10 Rule for `outputSchema`
In the 2026 landscape, `outputSchema` is a specialized orchestration tool.
- **90% of Tools**: Do not need it. Standard `content` (text/image) is sufficient for most tasks.
- **10% High-Impact Tools**: Use for search, analysis, or state-toggles where the agent needs to "pipe" data into another tool or make a logic-based decision based on a specific field (e.g., a `confidence` score or `status` flag).
- **Agentic Planning**: While `inputSchema` steers the **call**, `outputSchema` steers the **post-call strategy** by explicitly defining the machine-readable contract of the result.

```

**Why it matters**: The Zod schema is serialized into JSON Schema and sent to the agent alongside the description. A `z.enum()` tells the agent exactly what's valid. A `z.number().min(1).max(50)` prevents out-of-range values before they happen. Together with `.describe()`, the schema becomes a self-documenting, self-validating contract.

---

## 1. The "Heuristic-Heavy" Style (Brave Search)
Best for tools with overlapping functionality where the agent must decide *which* tool fits.

### `brave_web_search`

#### [Main Description]
Performs web searches using the Brave Search API and returns comprehensive results with rich metadata.
**When to use**:
- General web searches for information, facts, or current topics.
- News searches for recent events (e.g., 'What happened in Tokyo today?').
- Research requiring diverse result types (web pages, images, reviews).
**Returns**: A list of web results with title, description, and URL.

#### [Argument Descriptions (Zod)]
- `query`: The search text. Keep it concise and direct.
- `count`: (Optional) Number of results to return. Default is 5.

---

### `brave_local_search`

#### [Main Description]
Searches for local businesses and places using Brave's Local Search API.
**When to use**:
- When the query implies 'near me', 'in [city]', or physical locations (e.g., 'coffee shops in San Francisco').
**IMPORTANT**: Requires a Brave Search API Pro plan. If unavailable, fall back to `brave_web_search`.
**Returns**: Business names, addresses, ratings, phone numbers, and opening hours. Falls back to `brave_web_search` if no local results found.

#### [Argument Descriptions (Zod)]
- `query`: The location-based search query.

---

### `brave_video_search`

#### [Main Description]
Searches for videos using Brave's Video Search API.
**When to use**:
- Finding video content or metadata (e.g., 'Next.js routing tutorials').
- Discovering content from specific creators or publishers.
**Returns**: Video results with title, URL, duration, and thumbnail.

#### [Argument Descriptions (Zod)]
- `query`: The topic or creator to find videos for.

---

### `brave_news_search`

#### [Main Description]
Searches for news articles using Brave's News Search API.
**When to use**:
- Finding recent news articles on specific topics.
- Getting breaking news updates or trending stories.
**Returns**: News results with title, URL, and description.
**Orchestration hint**: Always cite sources with hyperlinks when relaying results (e.g., "According to [Reuters](url)...").

#### [Argument Descriptions (Zod)]
- `query`: The news topic to search for.

---

### `brave_summarizer`

#### [Main Description]
Retrieves AI-generated summaries from Brave's Summarizer API.
**When to use**:
- Concise overviews of complex topics from multiple sources.
- Quick fact-checking or distilling key points from web searches.
**Requirements**: Must first call `brave_web_search` with `summary=true`. Requires Pro AI subscription.
**Returns**: A consolidated text summary.

---

## 2. The "Instructional/Constraint" Style (Nova Canvas)
Best for creative tools requiring specific prompting structures.

### `generate_image`

#### [Main Description]
Generate an image using Amazon Nova Canvas with a text prompt.
**IMPORTANT**: Always specify the workspace directory so images are saved to an accessible location.
**Prompt best practices**: Describe the subject, environment, position/pose, then lighting and visual style.
**Constraints**: Do not use negation words ("no", "not"). Use the `negative_prompt` parameter for exclusions (e.g., "low quality, extra limbs").
**Returns**: The generated image paths.

#### [Argument Descriptions (Zod)]
- `prompt`: A descriptive visual subject, for example 'A futuristic city skyline at sunset with neon lights'.
- `negative_prompt`: (Optional) Elements to exclude from generation, for example 'blurry, low resolution'.
- `output_directory`: The absolute path where the image should be saved.

---

### `generate_image_with_colors`

#### [Main Description]
Generate an image using Amazon Nova Canvas with color palette guidance.
**When to use**:
- When a specific color palette is needed (e.g., 'vibrant neon' or 'soft earth tones').
- Useful for branding consistency or establishing visual mood.
**Returns**: The generated image paths.

#### [Argument Descriptions (Zod)]
- `prompt`: A descriptive visual subject.
- `colors`: Hex color codes for guidance, for example `["#FF5733", "#33FF57"]` for a vibrant palette.
- `output_directory`: The absolute path where the image should be saved.

---

## 3. The "Workflow-Aware" Style (Context7)
Best for tools that are part of a self-contained automation loop.

### `get-library-docs`

#### [Main Description]
Retrieves up-to-date documentation and code examples for any library.
**When to use**:
- Learning a library's API (e.g., 'How do I use Next.js server components?').
- Retrieving current best practices or troubleshooting specific module errors.
**Returns**: Library selection explanation + relevant code snippets.

#### [Argument Descriptions (Zod)]
- `library`: The library identifier, for example "vercel/next.js" or "supabase/supabase".
- `topic`: The specific feature or concept to retrieve docs for, for example "authentication" or "routing".

---

## 4. Agentic Flow & Minimalist Architecture

In 2026, the most effective MCP servers **trust the agent**. Over-engineering your toolset leads to "Context Bloat," which increases latency and reduces reasoning precision.

### Principle A: Stop the Context Bloat
- **Minimize the Toolset**: Prefer 5 high-impact, versatile tools over 25 niche ones.
- **High-Trust Design**: Assume the agent is smart. Don't build "guardrail" tools that only exist to validate other tools.
- **Intent > Primitives**: Define tools based on what the agent *wants to accomplish*, not just raw API endpoints.

### Principle B: The "Golden Path" Mental Model
When designing a suite, visualize the **Golden Path** — the most natural sequence of calls an agent would take.
1. **Discovery**: A broad tool to understand the environment (e.g., `list_files`).
2. **Analysis**: A tool to dive deep into a specific item (e.g., `read_file_content`).
3. **Action**: A tool to commit the change (e.g., `write_to_file`).

If your Golden Path requires more than 3–4 steps for a common use case, your primitives are likely too granular.

### Principle C: Leveraging Dynamic Registration
Dynamic tool registration (`server.sendToolListChanged()`) is your surgical instrument to fight bloat.
- **Contextual Visibility**: Only expose "Write" tools after a "Read" tool has confirmed the target exists.
- **Tiered Access**: Hide advanced/risky tools until the agent has "unlocked" the session context.
- **Trust Factor**: If there is any doubt about whether a tool should be visible, **prefer trusting the agent** to choose the right one from the full set.

---

## 2026 Best Practices Recap

- **Minimalism Wins**: A lean context is a fast, accurate context.
- **Trust the Agent**: Build for high-intelligence autonomous agents.
- **Schema Synergy**: Main descriptions for *why* and *when*; Zod descriptions for *what* and *how*.
- **Zod as Steering**: Constrain everything — enums, min/max, defaults, typed formats. The schema is your first line of defense against hallucinated arguments.
- **Natural Language Examples**: Always include examples, always in natural language, never as JSON/code.
- **Intent-Driven Metadata**: Use descriptions to hint at the Golden Path and expected orchestration.
- **Dynamic Optimization**: Use runtime registration to prune irrelevant tools.
