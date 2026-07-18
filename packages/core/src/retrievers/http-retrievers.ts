import type {
  ContextItem,
  RetrieveOpts,
  Retriever,
} from "@contextengine/retriever-interface";

function id() {
  return globalThis.crypto.randomUUID();
}

type TokenConfig = {
  accessToken?: string;
  apiKey?: string;
};

/** Minimal live search against connected GitHub. */
export class GitHubRetriever implements Retriever {
  readonly id = "github";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, _opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];
    const url = new URL("https://api.github.com/search/issues");
    url.searchParams.set("q", `${query} in:title,body`);
    url.searchParams.set("per_page", "5");
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "context-engine",
      },
    });
    if (!res.ok) throw new Error(`GitHub search failed (${res.status})`);
    const data = (await res.json()) as {
      items?: { title?: string; body?: string; html_url?: string; score?: number }[];
    };
    return (data.items ?? []).map((item) => ({
      id: id(),
      text: `${item.title ?? ""}\n${(item.body ?? "").slice(0, 800)}`,
      source: item.html_url ?? "github",
      title: item.title ?? "GitHub issue",
      score: Math.min(1, (item.score ?? 1) / 100),
      metadata: { provider: "github" },
    }));
  }
}

/** Slack search.messages (requires search:read). */
export class SlackRetriever implements Retriever {
  readonly id = "slack";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, _opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];
    const url = new URL("https://slack.com/api/search.messages");
    url.searchParams.set("query", query);
    url.searchParams.set("count", "5");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      messages?: {
        matches?: {
          text?: string;
          permalink?: string;
          username?: string;
          score?: number;
        }[];
      };
    };
    if (!data.ok) throw new Error(data.error || "Slack search failed");
    return (data.messages?.matches ?? []).map((m) => ({
      id: id(),
      text: m.text ?? "",
      source: m.permalink ?? "slack",
      title: m.username ? `Slack · ${m.username}` : "Slack message",
      score: Math.min(1, (m.score ?? 50) / 100),
      metadata: { provider: "slack" },
    }));
  }
}

/** Notion search. */
export class NotionRetriever implements Retriever {
  readonly id = "notion";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, _opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];
    const res = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ query, page_size: 5 }),
    });
    if (!res.ok) throw new Error(`Notion search failed (${res.status})`);
    const data = (await res.json()) as {
      results?: {
        id?: string;
        url?: string;
        object?: string;
        properties?: Record<string, unknown>;
      }[];
    };
    return (data.results ?? []).map((page) => {
      const title = extractNotionTitle(page.properties) || "Notion page";
      return {
        id: id(),
        text: title,
        source: page.url ?? `notion://${page.id}`,
        title,
        score: 0.7,
        metadata: { provider: "notion", object: page.object },
      };
    });
  }
}

/** mem0 v1 memories search. */
export class Mem0Retriever implements Retriever {
  readonly id = "mem0";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, opts: RetrieveOpts): Promise<ContextItem[]> {
    const apiKey = this.config.apiKey;
    if (!apiKey) return [];
    const res = await fetch("https://api.mem0.ai/v1/memories/search/", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        user_id: opts.userId,
        limit: 5,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`mem0 search failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as
      | { results?: { id?: string; memory?: string; score?: number }[] }
      | { id?: string; memory?: string; score?: number }[];
    const results = Array.isArray(data) ? data : (data.results ?? []);
    return results.map((m) => ({
      id: m.id ?? id(),
      text: m.memory ?? "",
      source: "mem0",
      title: "Memory",
      score: m.score ?? 0.8,
      metadata: { provider: "mem0" },
    }));
  }
}

function extractNotionTitle(properties: Record<string, unknown> | undefined) {
  if (!properties) return "";
  for (const value of Object.values(properties)) {
    if (
      value &&
      typeof value === "object" &&
      (value as { type?: string }).type === "title"
    ) {
      const title = (value as { title?: { plain_text?: string }[] }).title;
      return title?.map((t) => t.plain_text ?? "").join("") ?? "";
    }
  }
  return "";
}
