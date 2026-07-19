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
  accountLogin?: string;
};

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "context-engine",
  };
}

/** Only explicit @login or github.com/login — never random words from the query. */
function extractExplicitLogins(query: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /\bgithub\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)/gi,
    /@([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)/g,
  ];
  for (const re of patterns) {
    for (const match of query.matchAll(re)) {
      const login = match[1];
      if (!login || login.length < 1) continue;
      found.add(login);
    }
  }
  return [...found].slice(0, 3);
}

function searchKeywords(query: string): string {
  return query
    .replace(/[?!.]+/g, " ")
    .replace(
      /\b(what'?s|what|is|are|on|my|the|a|an|open|github|issue|issues|repo|repos|pull|request|pr|prs|about|show|me|all|in|for|with|from)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Live GitHub: connected account repos + involved issues (PAT / OAuth). */
export class GitHubRetriever implements Retriever {
  readonly id = "github";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, _opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];

    const headers = ghHeaders(token);
    const items: ContextItem[] = [];
    const connectedLogin = this.config.accountLogin?.trim() || null;
    const explicit = extractExplicitLogins(query).filter(
      (l) => !connectedLogin || l.toLowerCase() !== connectedLogin.toLowerCase(),
    );

    // Resolve connected account if we only have a token (older connectors).
    let login = connectedLogin;
    if (!login) {
      const me = await fetch("https://api.github.com/user", { headers });
      if (me.ok) {
        const u = (await me.json()) as { login?: string };
        login = u.login ?? null;
      }
    }

    if (login) {
      items.push(
        ...(await fetchUserSummary(login, headers, 0.92)),
        ...(await fetchUserRepos(login, headers, 0.88, true)),
      );

      const keywords = searchKeywords(query);
      const issueQ = [
        `involves:${login}`,
        "is:open",
        keywords ? `${keywords} in:title,body` : null,
      ]
        .filter(Boolean)
        .join(" ");
      items.push(...(await searchIssues(issueQ, headers, 8)));
    }

    for (const other of explicit) {
      items.push(
        ...(await fetchUserSummary(other, headers, 0.8)),
        ...(await fetchUserRepos(other, headers, 0.75)),
      );
    }

    if (items.length === 0) {
      throw new Error(
        "GitHub returned no context for the connected account. Reconnect GitHub or check the PAT scopes (repo).",
      );
    }

    return items.slice(0, 12);
  }
}

async function fetchUserSummary(
  login: string,
  headers: Record<string, string>,
  score: number,
): Promise<ContextItem[]> {
  const userRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(login)}`,
    { headers },
  );
  if (!userRes.ok) return [];
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
  return [
    {
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
      score,
      metadata: { provider: "github", kind: "user" },
    },
  ];
}

async function fetchUserRepos(
  login: string,
  headers: Record<string, string>,
  score: number,
  /** When true, also pull private repos via /user/repos for the token holder. */
  includePrivate = false,
): Promise<ContextItem[]> {
  const urls = [
    ...(includePrivate
      ? [
          "https://api.github.com/user/repos?per_page=8&sort=updated&affiliation=owner,collaborator",
        ]
      : []),
    `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=8&sort=updated&type=all`,
  ];

  const seen = new Set<string>();
  const items: ContextItem[] = [];
  for (const url of urls) {
    const res = await fetch(url, { headers });
    if (!res.ok) continue;
    const repos = (await res.json()) as {
      name?: string;
      full_name?: string;
      description?: string | null;
      html_url?: string;
      language?: string | null;
      stargazers_count?: number;
      private?: boolean;
    }[];
    for (const repo of repos) {
      const key = repo.full_name ?? repo.name;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        id: id(),
        text: [
          `Repo: ${repo.full_name ?? repo.name}`,
          repo.description ? `Description: ${repo.description}` : null,
          repo.language ? `Language: ${repo.language}` : null,
          `Stars: ${repo.stargazers_count ?? 0}`,
          repo.private ? "Visibility: private" : "Visibility: public",
        ]
          .filter(Boolean)
          .join("\n"),
        source: repo.html_url ?? "github",
        title: repo.full_name ?? repo.name ?? "GitHub repo",
        score,
        metadata: { provider: "github", kind: "repo" },
      });
      if (items.length >= 8) return items;
    }
  }
  return items;
}

async function searchIssues(
  q: string,
  headers: Record<string, string>,
  limit: number,
): Promise<ContextItem[]> {
  const issueUrl = new URL("https://api.github.com/search/issues");
  issueUrl.searchParams.set("q", q);
  issueUrl.searchParams.set("per_page", String(limit));
  issueUrl.searchParams.set("sort", "updated");
  const issueRes = await fetch(issueUrl, { headers });
  if (!issueRes.ok) return [];
  const data = (await issueRes.json()) as {
    items?: {
      title?: string;
      body?: string;
      html_url?: string;
      score?: number;
      state?: string;
      repository_url?: string;
    }[];
  };
  return (data.items ?? []).map((item) => ({
    id: id(),
    text: `${item.title ?? ""}\n${(item.body ?? "").slice(0, 800)}`,
    source: item.html_url ?? "github",
    title: item.title ?? "GitHub issue",
    score: Math.min(1, (item.score ?? 50) / 100),
    metadata: { provider: "github", kind: "issue", state: item.state },
  }));
}

/** Slack search.messages (requires user token + search:read). */
export class SlackRetriever implements Retriever {
  readonly id = "slack";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, _opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];
    if (token.startsWith("xoxb-")) {
      throw new Error(
        "Slack bot token cannot search. Reconnect Slack (user scope search:read) or paste an xoxp- token.",
      );
    }
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
    if (!data.ok) {
      if (data.error === "missing_scope") {
        throw new Error(
          "Slack missing_scope: need a user token (xoxp-) with search:read. Reconnect Slack or paste a new token.",
        );
      }
      throw new Error(data.error || "Slack search failed");
    }
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
