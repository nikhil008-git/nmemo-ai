export type RoadmapItem = {
  id: string;
  name: string;
  short: string;
  tone: string;
};

/** Capabilities still shipping — surfaced in UI as Coming soon. */
export const pipelineRoadmap: RoadmapItem[] = [
  {
    id: "conflict",
    name: "Smarter answers",
    short: "When sources disagree, keep the version that should win.",
    tone: "bg-rose-400",
  },
  {
    id: "compression",
    name: "Tighter prompts",
    short: "Fit more signal into the same token budget.",
    tone: "bg-amber-400",
  },
  {
    id: "query-planning",
    name: "Smarter routing",
    short: "Hit the right sources first for each question.",
    tone: "bg-sky-400",
  },
  {
    id: "fast-voice",
    name: "Voice-ready path",
    short: "Low-latency context for live voice agents.",
    tone: "bg-violet-400",
  },
  {
    id: "eval",
    name: "Quality checks",
    short: "Score context quality before you ship.",
    tone: "bg-teal-400",
  },
  {
    id: "adapters",
    name: "Framework helpers",
    short: "Drop-in support for popular agent frameworks.",
    tone: "bg-indigo-400",
  },
];

export const retrieverRoadmap: RoadmapItem[] = [
  {
    id: "mcp",
    name: "MCP",
    short: "Connect many tools through one standard.",
    tone: "bg-violet-400",
  },
  {
    id: "gmail",
    name: "Gmail / Drive",
    short: "Email and Drive context for workspace agents.",
    tone: "bg-red-400",
  },
  {
    id: "linear",
    name: "Linear / Jira",
    short: "Ticket and project context alongside your code.",
    tone: "bg-blue-400",
  },
  {
    id: "sql",
    name: "SQL",
    short: "Ask questions against your company database.",
    tone: "bg-cyan-400",
  },
  {
    id: "crm",
    name: "CRM",
    short: "Customer context from the CRM you already use.",
    tone: "bg-fuchsia-400",
  },
];

export const allRoadmapItems: RoadmapItem[] = [
  ...pipelineRoadmap,
  ...retrieverRoadmap,
];
