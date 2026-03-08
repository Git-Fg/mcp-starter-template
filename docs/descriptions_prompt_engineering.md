# Tool Description Prompt Engineering (2026 Reference)

In the 2026 autonomous-first landscape, the success of an MCP server depends heavily on its **metadata**. High-quality descriptions allow agents to discover, select, and orchestrate tools with minimal "reasoning overhead."

---

## The "Golden Pattern" for Descriptions

A high-performance description should answer three questions for the agent:
1. **Context**: What specific problem does this solve?
2. **Heuristics**: When should I choose *this* tool over another?
3. **Expectations**: What will I get back, and how should I treat the result?

---

## 1. The "Heuristic-Heavy" Style (Brave Search Examples)
Best for tools with overlapping functionality or specific environmental/tier-based requirements.

### `brave_web_search`
Performs web searches using the Brave Search API and returns comprehensive search results with rich metadata.
**When to use**:
- General web searches for information, facts, or current topics.
- Location-based queries (restaurants, businesses, points of interest).
- News searches for recent events or breaking stories.
- Finding videos, discussions, or FAQ content.
- Research requiring diverse result types (web pages, images, reviews, etc.).
**Returns**: A JSON list of web results with title, description, and URL. If the "results_filter" parameter is empty, JSON results may also contain FAQ, Discussions, News, and Video results.

### `brave_local_search`
Searches for local businesses and places using Brave's Local Search API. Best for queries related to physical locations, businesses, restaurants, services, etc.
**IMPORTANT**: Access to this API is available only through the Brave Search API Pro plans; confirm the user's plan before using this tool (if the user does not have a Pro plan, use the brave_web_search tool).
**When to use**:
- When the query implies 'near me', 'in my area', or mentions specific locations (e.g., 'in San Francisco').
**Returns**: Detailed information including business names, addresses, ratings, phone numbers, and opening hours. Automatically falls back to brave_web_search if no local results are found.

### `brave_video_search`
Searches for videos using Brave's Video Search API and returns structured video results with metadata.
**When to use**:
- When you need to find videos related to a specific topic, keyword, or query.
- Useful for discovering video content, getting video metadata, or finding videos from specific creators/publishers.
**Returns**: A JSON list of video-related results with title, url, description, duration, and thumbnail_url.

### `brave_image_search`
Performs an image search using the Brave Search API. Helpful for when you need pictures of people, places, things, graphic design ideas, art inspiration, and more.
**Assistant Tip**: When relaying results in a markdown environment, it may be helpful to include images in the results (e.g., `![image.title](image.url)`).

### `brave_news_search`
Searches for news articles using Brave's News Search API based on the user's query. Use it when you need current news information, breaking news updates, or articles about specific topics, events, or entities.
**When to use**:
- Finding recent news articles on specific topics.
- Getting breaking news updates.
- Researching current events or trending stories.
- Gathering news sources and headlines for analysis.
**Returns**: A JSON list of news-related results with title, url, and description.
**Assistant Guideline**: Always cite sources with hyperlinks in markdown. Example: "According to [Reuters](url)..."

### `brave_summarizer`
Retrieves AI-generated summaries of web search results using Brave's Summarizer API. This tool processes search results to create concise, coherent summaries of information gathered from multiple sources.
**When to use**:
- When you need a concise overview of complex topics from multiple sources.
- For quick fact-checking or getting key points without reading full articles.
- For research tasks requiring distilled information from web searches.
**Requirements**: Must first perform a web search using `brave_web_search` with `summary=true` parameter. Requires a Pro AI subscription.
**Returns**: A text summary that consolidates information from the search results.

---

## 2. The "Instructional/Constraint" Style (Nova Examples)
Best for creative tools or utilities requiring specific prompting structures from the assistant.

### `generate_image`
Generate an image using Amazon Nova Canvas with text prompt.
**IMPORTANT FOR ASSISTANT**: Always send the current workspace directory! Images must be saved to a location accessible to the user.
**Prompt Best Practices**:
1. The subject / The environment.
2. The position/pose of the subject.
3. Lighting / Camera framing / Visual style.
**Constraints**: Do not use negation words ("no", "not"). Use the `negative_prompt` parameter for exclusions (e.g., "anatomy, hands, low quality").
**Returns**: A response containing the generated image paths.

### `generate_image_with_colors`
Generate an image using Amazon Nova Canvas with color guidance.
**IMPORTANT FOR Assistant**: Always send the current workspace directory!
**Example Colors**: `["#FF5733", "#33FF57"]` (Vibrant), `["#000000", "#FFFFFF"]` (High contrast).
**Returns**: A response containing the generated image paths.

---

## 3. The "Workflow-Aware" Style (Context7 Examples)
Best for tools that are part of a self-contained automation loop.

### `get-library-docs`
Retrieves up-to-date documentation and code examples for any library. This tool automatically searches for the library by name and fetches its documentation.
**The tool will**:
1. Automatically find and select the most relevant library based on the provided name.
2. Fetch comprehensive documentation sections.
3. Return relevant content focused on the specified topic (e.g., "routing", "auth").
**Usage**: Provide the author and library name pair (e.g., "vercel/next.js") and specify a topic.
**Returns**: Library selection explanation + code examples.

---

## 4. Agentic Flow & Minimalist Architecture

In 2026, the most effective MCP servers are those that **trust the agent**. Over-engineering your toolset leads to "Context Bloat," which increases latency and reduces an agent's reasoning precision.

### Principle A: Stop the Context Bloat
- **Minimize the Toolset**: Prefer 5 high-impact, versatile tools over 25 niche ones. 
- **High-Trust Design**: Assume the agent is smart. Don't build "guardrail" tools that only exist to validate other tools. 
- **Intent > Primitives**: Define tools based on what the agent *wants to accomplish*, not just raw API endpoints.

### Principle B: The "Golden Path" Mental Model
When designing a suite, visualize the **Golden Path**—the most natural and efficient sequence of calls an agent would take.
1. **Discovery**: A broad tool to understand the environment (e.g., `list_files`).
2. **Analysis**: A tool to dive deep into a specific item (e.g., `read_file_content`).
3. **Action**: A tool to commit the change (e.g., `write_to_file`).

If your Golden Path requires more than 3-4 steps for a common use case, your primitives are likely too granular.

### Principle C: Leveraging Dynamic Registration
Dynamic tool registration (`server.sendToolListChanged()`) is your surgical instrument to fight bloat.
- **Contextual Visibility**: Only expose "Write" tools after a "Read" tool has confirmed the target exists.
- **Tiered Access**: Hide advanced/risky tools until the agent has "unlocked" the session context.
- **Trust Factor**: If there is any doubt about whether a tool should be visible, **prefer trusting the agent** to choose the right one from the full set. Dynamic registration should help, not hinder.

---

## 2026 Best Practices Recap

- **Minimalism Wins**: A lean context is a fast, accurate context.
- **Trust the Agent**: Build for high-intelligence autonomous agents.
- **Intent-Driven Metadata**: Use descriptions to hint at the Golden Path and expected orchestration.
- **Dynamic Optimization**: Use runtime registration to prune irrelevant tools.
