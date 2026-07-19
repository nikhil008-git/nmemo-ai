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

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "context-engine",
  };
}

/** Pull likely GitHub logins out of a natural-language query. */
function extractLogins(query: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /\bgithub\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)/gi,
    /@([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)/g,
    /\b([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\b/g,
  ];
  for (const re of patterns) {
    for (const match of query.matchAll(re)) {
      const login = match[1];
      if (!login) continue;
      if (login.length < 3) continue;
      if (
        /^(who|what|where|when|why|how|the|and|for|with|from|about|this|that|have|does|did|is|are|was|were|you|your|me|my|we|our|they|them|his|her|its|can|could|would|should|will|just|also|into|over|under|github|issue|issues|repo|repos|user|users|profile|resume|document|documents)$/i.test(
          login,
        )
      ) {
        continue;
      }
      found.add(login);
    }
  }
  return [...found].slice(0, 3);
}

/** Live GitHub: users + repos + issues (PAT). */
export class GitHubRetriever implements Retriever {
  readonly id = "github";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, _opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];

    const headers = ghHeaders(token);
    const items: ContextItem[] = [];
    const logins = extractLogins(query);

    for (const login of logins) {
      const userRes = await fetch(`https://api.github.com/users/${login}`, {
        headers,
      });
      if (userRes.ok) {
        const u = (await userRes.json()) as {
          login?: string;
          name?: string | null;
          bio?: string | null;
          company?: string | null;
          location?: string | null;
          blog?: string | null;
          public_repos?: number;
          followers?: number;
          html_url?: string;
        };
        items.push({
          id: id(),
          text: [
            `GitHub user: ${u.login ?? login}`,
            u.name ? `Name: ${u.name}` : null,
            u.bio ? `Bio: ${u.bio}` : null,
            u.company ? `Company: ${u.company}` : null,
            u.location ? `Location: ${u.location}` : null,
            u.blog ? `Blog: ${u.blog}` : null,
            `Public repos: ${u.public_repos ?? 0}`,
            `Followers: ${u.followers ?? 0}`,
            u.html_url ? `Profile: ${u.html_url}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          source: u.html_url ?? `https://github.com/${login}`,
          title: `GitHub · ${u.login ?? login}`,
          score: 0.95,
          metadata: { provider: "github", kind: "user" },
        });
      }

      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=5&sort=updated`,
        { headers },
      );
      if (reposRes.ok) {
        const repos = (await reposRes.json()) as {
          name?: string;
          full_name?: string;
          description?: string | null;
          html_url?: string;
          language?: string | null;
          stargazers_count?: number;
        }[];
        for (const repo of repos.slice(0, 5)) {
          items.push({
            id: id(),
            text: [
              `Repo: ${repo.full_name ?? repo.name}`,
              repo.description ? `Description: ${repo.description}` : null,
              repo.language ? `Language: ${repo.language}` : null,
              `Stars: ${repo.stargazers_count ?? 0}`,
            ]
              .filter(Boolean)
              .join("\n"),
            source: repo.html_url ?? "github",
            title: repo.full_name ?? repo.name ?? "GitHub repo",
            score: 0.85,
            metadata: { provider: "github", kind: "repo" },
          });
        }
      }
    }

    // Broader fallbacks when we didn't resolve a concrete user
    if (items.length === 0) {
      const userSearch = new URL("https://api.github.com/search/users");
      userSearch.searchParams.set("q", query);
      userSearch.searchParams.set("per_page", "3");
      const us = await fetch(userSearch, { headers });
      if (us.ok) {
        const data = (await us.json()) as {
          items?: { login?: string; html_url?: string; score?: number }[];
        };
        for (const u of data.items ?? []) {
          if (!u.login) continue;
          items.push({
            id: id(),
            text: `GitHub user search hit: ${u.login}`,
            source: u.html_url ?? `https://github.com/${u.login}`,
            title: `GitHub · ${u.login}`,
            score: Math.min(1, (u.score ?? 50) / 100),
            metadata: { provider: "github", kind: "user-search" },
          });
        }
      }
    }

    const issueUrl = new URL("https://api.github.com/search/issues");
    const cleaned = query.replace(/[?!.]+/g, " ").trim();
    issueUrl.searchParams.set("q", `${cleaned} in:title,body`);
    issueUrl.searchParams.set("per_page", "5");
    const issueRes = await fetch(issueUrl, { headers });
    if (issueRes.ok) {
      const data = (await issueRes.json()) as {
        items?: {
          title?: string;
          body?: string;
          html_url?: string;
          score?: number;
        }[];
      };
      for (const item of data.items ?? []) {
        items.push({
          id: id(),
          text: `${item.title ?? ""}\n${(item.body ?? "").slice(0, 800)}`,
          source: item.html_url ?? "github",
          title: item.title ?? "GitHub issue",
          score: Math.min(1, (item.score ?? 1) / 100),
          metadata: { provider: "github", kind: "issue" },
        });
      }
    } else if (items.length === 0) {
      throw new Error(`GitHub search failed (${issueRes.status})`);
    }

    return items.slice(0, 12);
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
