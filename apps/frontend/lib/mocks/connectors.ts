import type { Connector } from "./types";

export const initialConnectors: Connector[] = [
  {
    id: "mem0",
    name: "mem0",
    description: "Long-term memory — preferences, facts, and user profile.",
    connected: true,
  },
  {
    id: "qdrant",
    name: "Qdrant",
    description: "Document RAG — embeddings and vector retrieval.",
    connected: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Communication context from channels and threads.",
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Workspace pages and knowledge bases.",
    connected: false,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Issues, PRs, and repository context.",
    connected: false,
  },
  {
    id: "mcp",
    name: "MCP",
    description: "Generic MCP server connector for custom tools.",
    connected: false,
  },
];
