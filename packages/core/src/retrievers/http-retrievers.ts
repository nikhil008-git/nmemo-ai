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

const GITHUB_API = "https://api.github.com";
const MAX_REPOSITORIES = 2;
const MAX_ACTIVITY_ITEMS = 6;

type GitHubRepo = {
  name?: string;
  full_name?: string;
  description?: string | null;
  html_url?: string;
  language?: string | null;
  stargazers_count?: number;
  private?: boolean;
  default_branch?: string;
  updated_at?: string;
  fork?: boolean;
  archived?: boolean;
  license?: { spdx_id?: string | null; name?: string | null } | null;
};

type GitHubQueryIntent = {
  activity: boolean;
  commits: boolean;
  pulls: boolean;
  issues: boolean;
  discussions: boolean;
  releases: boolean;
  branches: boolean;
  documentation: boolean;
  code: boolean;
  fileDetails: boolean;
};

export type GitHubQueryTargets = {
  fullNames: string[];
  names: string[];
};

/**
 * Extract explicit repository references without treating ordinary prose as a
 * repository. Bare names are only accepted after a repository-style preposition
 * ("for cal.diy", "repo cal.diy") and are resolved against accessible repos.
 */
export function extractGitHubRepositoryTargets(
  query: string,
): GitHubQueryTargets {
  const fullNames = new Set<string>();
  const names = new Set<string>();
  const addFullName = (owner: string, repo: string) => {
    const cleanOwner = owner.replace(/[).,!?]+$/, "");
    const cleanRepo = repo.replace(/[).,!?]+$/, "");
    if (!cleanOwner || !cleanRepo || cleanOwner.toLowerCase() === "github.com")
      return;
    fullNames.add(`${cleanOwner}/${cleanRepo}`);
  };

  for (const match of query.matchAll(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/gi,
  )) {
    if (match[1] && match[2]) addFullName(match[1], match[2]);
  }
  const withoutGitHubUrls = query.replace(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[^\s?#]*)?(?:\?[^\s#]*)?/gi,
    " ",
  );
  for (const match of withoutGitHubUrls.matchAll(
    /\b([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\b/g,
  )) {
    if (match[1] && match[2]) addFullName(match[1], match[2]);
  }
  for (const match of withoutGitHubUrls.matchAll(
    /\b(?:repo(?:sitory)?|for|in|on)\s+([A-Za-z0-9][A-Za-z0-9_.-]*)\b(?!\/)/gi,
  )) {
    const name = match[1]?.replace(/[).,!?]+$/, "");
    if (name && !name.includes("/")) names.add(name);
  }

  return { fullNames: [...fullNames], names: [...names] };
}

function githubIntent(query: string): GitHubQueryIntent {
  const has = (pattern: RegExp) => pattern.test(query);
  const commits = has(/\b(commit|commits|commit history|changelog|changed)\b/i);
  const pulls = has(
    /\b(pr|prs|pull request|pull requests|merged|review|reviews)\b/i,
  );
  const issues = has(/\b(issue|issues|ticket|tickets|bug|bugs)\b/i);
  const discussions = has(
    /\b(discussion|discussions|decision|decisions|comment|comments|thread|threads)\b/i,
  );
  const releases = has(/\b(release|releases|version|versions|changelog)\b/i);
  const branches = has(/\b(branch|branches|tag|tags)\b/i);
  const documentation = has(
    /\b(readme|docs?|documentation|spec|specification)\b/i,
  );
  const code = has(
    /\b(code|source|function|class|component|implementation|file|files)\b/i,
  );
  const fileDetails = has(
    /\b(diff|diffs|changed files?|files? changed|file list)\b/i,
  );
  const activity =
    commits ||
    pulls ||
    issues ||
    discussions ||
    has(
      /\b(contribution|contributions|contributed|activity|worked|work|history)\b/i,
    );
  return {
    activity,
    commits,
    pulls,
    issues,
    discussions,
    releases,
    branches,
    documentation,
    code,
    fileDetails,
  };
}

async function githubJson<T>(
  path: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<T | null> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers,
    ...(signal ? { signal } : {}),
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

async function githubText(
  path: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<string | null> {
  const res = await fetch(
    path.startsWith("http") ? path : `${GITHUB_API}${path}`,
    {
      headers: { ...headers, Accept: "application/vnd.github.raw+json" },
      ...(signal ? { signal } : {}),
    },
  );
  if (!res.ok) return null;
  return res.text();
}

/** Only explicit @login or a GitHub profile URL — never random words from the query. */
function extractExplicitLogins(query: string): string[] {
  const found = new Set<string>();
  const patterns = [
    /\bgithub\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)(?=\/?(?:[?#\s]|$))/gi,
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
      /\b(can|what'?s|what|is|are|on|my|the|a|an|open|github|issue|issues|repo|repos|pull|request|pr|prs|about|show|me|all|in|for|with|from|does|did|contribution|contributions|contributed|activity|history|work|worked|by|who|which|tell|give|please|their|this|that)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Live GitHub: repository activity, documentation, and evidence receipts. */
export class GitHubRetriever implements Retriever {
  readonly id = "github";
  constructor(private config: TokenConfig) {}

  async retrieve(query: string, opts: RetrieveOpts): Promise<ContextItem[]> {
    const token = this.config.accessToken;
    if (!token) return [];

    const headers = ghHeaders(token);
    const items: ContextItem[] = [];
    const connectedLogin = this.config.accountLogin?.trim() || null;
    const explicit = extractExplicitLogins(query).filter(
      (l) =>
        !connectedLogin || l.toLowerCase() !== connectedLogin.toLowerCase(),
    );

    // Resolve connected account if we only have a token (older connectors).
    let login = connectedLogin;
    if (!login) {
      const me = await fetch(`${GITHUB_API}/user`, {
        headers,
        ...(opts.signal ? { signal: opts.signal } : {}),
      });
      if (me.ok) {
        const u = (await me.json()) as { login?: string };
        login = u.login ?? null;
      }
    }

    const intent = githubIntent(query);
    const targets = extractGitHubRepositoryTargets(query);
    let resolvedRepos: GitHubRepo[] = [];

    if (login) {
      items.push(
        ...(await fetchUserSummary(login, headers, 0.92, opts.signal)),
        ...(await fetchUserRepos(login, headers, 0.88, true, opts.signal)),
      );
      resolvedRepos = await resolveRepositories(targets, headers, opts.signal);

      if (resolvedRepos.length === 0) {
        const keywords = searchKeywords(query);
        const issueQ = [
          `involves:${login}`,
          "is:open",
          keywords ? `${keywords} in:title,body` : null,
        ]
          .filter(Boolean)
          .join(" ");
        items.push(...(await searchIssues(issueQ, headers, 8, opts.signal)));
      }
    }

    for (const other of explicit) {
      items.push(
        ...(await fetchUserSummary(other, headers, 0.8, opts.signal)),
        ...(await fetchUserRepos(other, headers, 0.75, false, opts.signal)),
      );
    }

    if (resolvedRepos.length > 0) {
      const actors =
        explicit.length > 0
          ? explicit
          : intent.activity && login
            ? [login]
            : [];
      const repoItems = await Promise.all(
        resolvedRepos
          .slice(0, MAX_REPOSITORIES)
          .map((repo) =>
            retrieveRepositoryContext(
              repo,
              query,
              intent,
              actors,
              headers,
              opts.signal,
            ),
          ),
      );
      // Repository evidence is more useful than generic profile cards for an
      // explicitly targeted question, so keep it at the front of the prompt.
      items.unshift(...repoItems.flat());
    }

    if (items.length === 0) {
      throw new Error(
        "GitHub returned no context for the connected account. Reconnect GitHub or check the PAT scopes (repo).",
      );
    }

    return items.slice(0, 16);
  }
}

async function fetchUserSummary(
  login: string,
  headers: Record<string, string>,
  score: number,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const u = await githubJson<{
    login?: string;
    name?: string | null;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    blog?: string | null;
    public_repos?: number;
    followers?: number;
    html_url?: string;
  }>(`/users/${encodeURIComponent(login)}`, headers, signal);
  if (!u) return [];
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
  signal?: AbortSignal,
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
    const res = await fetch(url, {
      headers,
      ...(signal ? { signal } : {}),
    });
    if (!res.ok) continue;
    const repos = (await res.json()) as GitHubRepo[];
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

async function resolveRepositories(
  targets: GitHubQueryTargets,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<GitHubRepo[]> {
  if (targets.fullNames.length === 0 && targets.names.length === 0) return [];

  const accessible =
    (await githubJson<GitHubRepo[]>(
      "/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization",
      headers,
      signal,
    )) ?? [];
  const seen = new Set<string>();
  const matches: GitHubRepo[] = [];
  const add = (repo: GitHubRepo | null | undefined) => {
    const key = repo?.full_name?.toLowerCase();
    if (!repo || !key || seen.has(key)) return;
    seen.add(key);
    matches.push(repo);
  };

  for (const fullName of targets.fullNames) {
    add(
      accessible.find(
        (repo) => repo.full_name?.toLowerCase() === fullName.toLowerCase(),
      ),
    );
    if (!seen.has(fullName.toLowerCase())) {
      add(await githubJson<GitHubRepo>(`/repos/${fullName}`, headers, signal));
    }
  }
  for (const name of targets.names) {
    add(
      accessible.find(
        (repo) => repo.name?.toLowerCase() === name.toLowerCase(),
      ),
    );
  }

  // A public repository mentioned only by its short name may not be visible in
  // /user/repos (for example, a repository the user contributes to). Resolve
  // only exact name matches so a short natural-language word never selects an
  // arbitrary repository.
  for (const name of targets.names) {
    if (matches.some((repo) => repo.name?.toLowerCase() === name.toLowerCase()))
      continue;
    const search = await githubJson<{ items?: GitHubRepo[] }>(
      `/search/repositories?q=${encodeURIComponent(`${name} in:name`)}&per_page=5`,
      headers,
      signal,
    );
    const exact =
      search?.items?.filter(
        (repo) => repo.name?.toLowerCase() === name.toLowerCase(),
      ) ?? [];
    if (exact.length === 1) add(exact[0]);
  }

  return matches.slice(0, MAX_REPOSITORIES);
}

async function retrieveRepositoryContext(
  repo: GitHubRepo,
  query: string,
  intent: GitHubQueryIntent,
  actors: string[],
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const fullName = repo.full_name;
  if (!fullName) return [];
  const [owner, name] = fullName.split("/");
  if (!owner || !name) return [];
  const items: ContextItem[] = [toRepositoryItem(repo, 0.93)];
  const primaryActor = actors[0];
  const shouldGetActivity = intent.activity || actors.length > 0;

  const groups = await Promise.all([
    fetchRepositoryReadme(fullName, repo.html_url, headers, signal),
    shouldGetActivity || intent.commits
      ? fetchCommits(
          fullName,
          primaryActor,
          headers,
          signal,
          intent.fileDetails,
        )
      : Promise.resolve([]),
    shouldGetActivity || intent.pulls
      ? fetchPullRequests(
          fullName,
          primaryActor,
          headers,
          signal,
          intent.fileDetails || intent.discussions,
        )
      : Promise.resolve([]),
    shouldGetActivity || intent.issues
      ? fetchRepositoryIssues(
          fullName,
          primaryActor,
          query,
          headers,
          signal,
          intent.discussions,
        )
      : Promise.resolve([]),
    intent.discussions
      ? fetchRepositoryDiscussions(owner, name, headers, signal)
      : Promise.resolve([]),
    intent.releases
      ? fetchReleases(fullName, headers, signal)
      : Promise.resolve([]),
    intent.branches
      ? fetchBranchesAndTags(fullName, headers, signal)
      : Promise.resolve([]),
    intent.documentation
      ? fetchDocumentation(fullName, headers, signal)
      : Promise.resolve([]),
    intent.code
      ? fetchCodeMatches(fullName, query, headers, signal)
      : Promise.resolve([]),
  ]);
  items.push(...groups.flat());
  return items.slice(0, 14);
}

function toRepositoryItem(repo: GitHubRepo, score: number): ContextItem {
  return {
    id: id(),
    text: [
      `Repository: ${repo.full_name ?? repo.name ?? "GitHub repository"}`,
      repo.description ? `Description: ${repo.description}` : null,
      repo.language ? `Primary language: ${repo.language}` : null,
      repo.default_branch ? `Default branch: ${repo.default_branch}` : null,
      repo.updated_at ? `Last updated: ${repo.updated_at}` : null,
      repo.license?.spdx_id || repo.license?.name
        ? `License: ${repo.license.spdx_id ?? repo.license.name}`
        : null,
      `Stars: ${repo.stargazers_count ?? 0}`,
      repo.private ? "Visibility: private" : "Visibility: public",
      repo.archived ? "Repository is archived" : null,
      repo.fork ? "Repository is a fork" : null,
      repo.html_url ? `Receipt: ${repo.html_url}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    source: repo.html_url ?? "github",
    title: repo.full_name ?? repo.name ?? "GitHub repository",
    score,
    metadata: { provider: "github", kind: "repository" },
  };
}

async function fetchRepositoryReadme(
  fullName: string,
  repoUrl: string | undefined,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const text = await githubText(`/repos/${fullName}/readme`, headers, signal);
  if (!text?.trim()) return [];
  return [
    {
      id: id(),
      text: text.slice(0, 4_000),
      source: `${repoUrl ?? `https://github.com/${fullName}`}#readme`,
      title: `${fullName} · README`,
      score: 0.86,
      metadata: { provider: "github", kind: "readme", repository: fullName },
    },
  ];
}

type GitHubCommit = {
  sha?: string;
  html_url?: string;
  commit?: {
    message?: string;
    author?: { name?: string; date?: string };
    committer?: { date?: string };
  };
  author?: { login?: string } | null;
  files?: {
    filename?: string;
    status?: string;
    additions?: number;
    deletions?: number;
  }[];
};

async function fetchCommits(
  fullName: string,
  author: string | undefined,
  headers: Record<string, string>,
  signal: AbortSignal | undefined,
  includeFiles: boolean,
): Promise<ContextItem[]> {
  const params = new URLSearchParams({ per_page: String(MAX_ACTIVITY_ITEMS) });
  if (author) params.set("author", author);
  const commits = await githubJson<GitHubCommit[]>(
    `/repos/${fullName}/commits?${params}`,
    headers,
    signal,
  );
  if (!commits) return [];
  const detailed = includeFiles
    ? await Promise.all(
        commits.slice(0, 3).map(async (commit) => {
          if (!commit.sha) return commit;
          return (
            (await githubJson<GitHubCommit>(
              `/repos/${fullName}/commits/${commit.sha}`,
              headers,
              signal,
            )) ?? commit
          );
        }),
      )
    : commits;
  return detailed.map((commit) => ({
    id: id(),
    text: [
      `Commit: ${commit.sha?.slice(0, 12) ?? "unknown"}`,
      commit.commit?.message
        ? `Message: ${commit.commit.message.slice(0, 700)}`
        : null,
      `Author: ${commit.author?.login ?? commit.commit?.author?.name ?? author ?? "unknown"}`,
      commit.commit?.author?.date
        ? `Authored: ${commit.commit.author.date}`
        : null,
      commit.files?.length
        ? `Changed files: ${commit.files
            .slice(0, 12)
            .map(
              (file) =>
                `${file.filename ?? "file"}${file.status ? ` (${file.status})` : ""}`,
            )
            .join(", ")}`
        : null,
      commit.html_url ? `Receipt: ${commit.html_url}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    source: commit.html_url ?? `https://github.com/${fullName}/commits`,
    title: `Commit · ${commit.sha?.slice(0, 12) ?? fullName}`,
    score: 0.94,
    metadata: {
      provider: "github",
      kind: "commit",
      repository: fullName,
      author: commit.author?.login,
    },
  }));
}

type GitHubPull = {
  number?: number;
  title?: string;
  body?: string | null;
  html_url?: string;
  state?: string;
  merged_at?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: { login?: string } | null;
  requested_reviewers?: { login?: string }[];
  changed_files?: number;
  additions?: number;
  deletions?: number;
  files?: { filename?: string; status?: string }[];
  reviews?: {
    user?: { login?: string } | null;
    state?: string;
    submitted_at?: string;
  }[];
};

async function fetchPullRequests(
  fullName: string,
  actor: string | undefined,
  headers: Record<string, string>,
  signal: AbortSignal | undefined,
  includeDetails: boolean,
): Promise<ContextItem[]> {
  const pulls = await githubJson<GitHubPull[]>(
    `/repos/${fullName}/pulls?state=all&sort=updated&direction=desc&per_page=30`,
    headers,
    signal,
  );
  if (!pulls) return [];
  const filtered = actor
    ? pulls.filter(
        (pull) => pull.user?.login?.toLowerCase() === actor.toLowerCase(),
      )
    : pulls;
  const selected = filtered.slice(0, MAX_ACTIVITY_ITEMS);
  const detailed = includeDetails
    ? await Promise.all(
        selected.slice(0, 3).map(async (pull) => {
          if (!pull.number) return pull;
          const [detail, files, reviews] = await Promise.all([
            githubJson<GitHubPull>(
              `/repos/${fullName}/pulls/${pull.number}`,
              headers,
              signal,
            ),
            githubJson<{ filename?: string; status?: string }[]>(
              `/repos/${fullName}/pulls/${pull.number}/files?per_page=20`,
              headers,
              signal,
            ),
            githubJson<GitHubPull["reviews"]>(
              `/repos/${fullName}/pulls/${pull.number}/reviews?per_page=20`,
              headers,
              signal,
            ),
          ]);
          return {
            ...pull,
            ...detail,
            files: files ?? [],
            reviews: reviews ?? [],
          };
        }),
      )
    : selected;
  return detailed.map((pull) => ({
    id: id(),
    text: [
      `Pull request #${pull.number ?? "?"}: ${pull.title ?? "Untitled"}`,
      `Status: ${pull.merged_at ? `merged on ${pull.merged_at}` : (pull.state ?? "unknown")}`,
      `Author: ${pull.user?.login ?? "unknown"}`,
      pull.created_at ? `Created: ${pull.created_at}` : null,
      pull.updated_at ? `Updated: ${pull.updated_at}` : null,
      pull.body ? `Description: ${pull.body.slice(0, 900)}` : null,
      pull.changed_files !== undefined
        ? `Files changed: ${pull.changed_files}; additions: ${pull.additions ?? 0}; deletions: ${pull.deletions ?? 0}`
        : null,
      pull.files?.length
        ? `Changed files: ${pull.files
            .slice(0, 12)
            .map(
              (file) =>
                `${file.filename ?? "file"}${file.status ? ` (${file.status})` : ""}`,
            )
            .join(", ")}`
        : null,
      pull.reviews?.length
        ? `Reviews: ${pull.reviews
            .slice(0, 8)
            .map(
              (review) =>
                `${review.user?.login ?? "unknown"} (${review.state ?? "commented"})`,
            )
            .join(", ")}`
        : null,
      pull.html_url ? `Receipt: ${pull.html_url}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    source: pull.html_url ?? `https://github.com/${fullName}/pulls`,
    title: `PR #${pull.number ?? "?"} · ${pull.title ?? fullName}`,
    score: pull.merged_at ? 0.95 : 0.9,
    metadata: {
      provider: "github",
      kind: "pull-request",
      repository: fullName,
      state: pull.state,
      merged: Boolean(pull.merged_at),
    },
  }));
}

type GitHubIssue = {
  number?: number;
  title?: string;
  body?: string | null;
  html_url?: string;
  comments_url?: string;
  state?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string | null;
  user?: { login?: string } | null;
  assignee?: { login?: string } | null;
  assignees?: { login?: string }[];
  labels?: { name?: string; color?: string }[];
  comments?: number;
  score?: number;
  pull_request?: unknown;
  discussionComments?:
    | {
        user?: { login?: string };
        body?: string;
        created_at?: string;
        html_url?: string;
      }[]
    | null;
};

async function fetchRepositoryIssues(
  fullName: string,
  actor: string | undefined,
  query: string,
  headers: Record<string, string>,
  signal: AbortSignal | undefined,
  includeComments: boolean,
): Promise<ContextItem[]> {
  const terms = searchKeywords(query);
  const issueQuery = [
    `repo:${fullName}`,
    "is:issue",
    actor ? `involves:${actor}` : null,
    terms ? `${terms} in:title,body` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const issues = await searchGitHubIssues(
    issueQuery,
    headers,
    MAX_ACTIVITY_ITEMS,
    signal,
  );
  const withComments = includeComments
    ? await Promise.all(
        issues.slice(0, 3).map(async (issue) => ({
          ...issue,
          discussionComments: issue.comments_url
            ? await githubJson<
                {
                  user?: { login?: string };
                  body?: string;
                  created_at?: string;
                  html_url?: string;
                }[]
              >(
                issue.comments_url.replace(GITHUB_API, "") + "?per_page=3",
                headers,
                signal,
              )
            : [],
        })),
      )
    : issues;
  return withComments.map((issue) => ({
    id: id(),
    text: [
      `Issue #${issue.number ?? "?"}: ${issue.title ?? "Untitled"}`,
      `Status: ${issue.state ?? "unknown"}${issue.closed_at ? `; closed ${issue.closed_at}` : ""}`,
      `Author: ${issue.user?.login ?? "unknown"}`,
      issue.assignee?.login ? `Assignee: ${issue.assignee.login}` : null,
      issue.assignees?.length
        ? `Assignees: ${issue.assignees
            .map((assignee) => assignee.login)
            .filter(Boolean)
            .join(", ")}`
        : null,
      issue.labels?.length
        ? `Labels: ${issue.labels
            .map((label) => label.name)
            .filter(Boolean)
            .join(", ")}`
        : null,
      issue.comments !== undefined ? `Comments: ${issue.comments}` : null,
      issue.body ? `Description: ${issue.body.slice(0, 900)}` : null,
      issue.discussionComments?.length
        ? `Recent comments: ${issue.discussionComments.map((comment) => `${comment.user?.login ?? "unknown"}: ${(comment.body ?? "").slice(0, 240)}`).join(" | ")}`
        : null,
      issue.html_url ? `Receipt: ${issue.html_url}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    source: issue.html_url ?? `https://github.com/${fullName}/issues`,
    title: `Issue #${issue.number ?? "?"} · ${issue.title ?? fullName}`,
    score: 0.9,
    metadata: {
      provider: "github",
      kind: "issue",
      repository: fullName,
      state: issue.state,
    },
  }));
}

async function fetchRepositoryDiscussions(
  owner: string,
  name: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    ...(signal ? { signal } : {}),
    body: JSON.stringify({
      query: `query RepositoryDiscussions($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          discussions(first: 6, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes { title url bodyText createdAt updatedAt comments { totalCount } author { login } category { name } }
          }
        }
      }`,
      variables: { owner, name },
    }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    data?: {
      repository?: {
        discussions?: {
          nodes?: {
            title?: string;
            url?: string;
            bodyText?: string;
            createdAt?: string;
            updatedAt?: string;
            comments?: { totalCount?: number };
            author?: { login?: string } | null;
            category?: { name?: string } | null;
          }[];
        };
      };
    };
    errors?: unknown[];
  };
  if (data.errors?.length) return [];
  return (data.data?.repository?.discussions?.nodes ?? []).map(
    (discussion) => ({
      id: id(),
      text: [
        `Discussion: ${discussion.title ?? "Untitled"}`,
        discussion.category?.name
          ? `Category: ${discussion.category.name}`
          : null,
        `Author: ${discussion.author?.login ?? "unknown"}`,
        discussion.createdAt ? `Created: ${discussion.createdAt}` : null,
        discussion.updatedAt ? `Updated: ${discussion.updatedAt}` : null,
        discussion.comments?.totalCount !== undefined
          ? `Comments: ${discussion.comments.totalCount}`
          : null,
        discussion.bodyText
          ? `Body: ${discussion.bodyText.slice(0, 900)}`
          : null,
        discussion.url ? `Receipt: ${discussion.url}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      source:
        discussion.url ?? `https://github.com/${owner}/${name}/discussions`,
      title: `Discussion · ${discussion.title ?? `${owner}/${name}`}`,
      score: 0.88,
      metadata: {
        provider: "github",
        kind: "discussion",
        repository: `${owner}/${name}`,
      },
    }),
  );
}

async function fetchReleases(
  fullName: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const releases = await githubJson<
    {
      name?: string | null;
      tag_name?: string;
      body?: string | null;
      html_url?: string;
      published_at?: string | null;
      prerelease?: boolean;
      draft?: boolean;
    }[]
  >(`/repos/${fullName}/releases?per_page=6`, headers, signal);
  return (releases ?? []).map((release) => ({
    id: id(),
    text: [
      `Release: ${release.name ?? release.tag_name ?? "Untitled"}`,
      release.tag_name ? `Tag: ${release.tag_name}` : null,
      release.published_at ? `Published: ${release.published_at}` : null,
      release.prerelease ? "Prerelease" : null,
      release.draft ? "Draft" : null,
      release.body ? `Notes: ${release.body.slice(0, 1_000)}` : null,
      release.html_url ? `Receipt: ${release.html_url}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    source: release.html_url ?? `https://github.com/${fullName}/releases`,
    title: `Release · ${release.name ?? release.tag_name ?? fullName}`,
    score: 0.87,
    metadata: { provider: "github", kind: "release", repository: fullName },
  }));
}

async function fetchBranchesAndTags(
  fullName: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const [branches, tags] = await Promise.all([
    githubJson<{ name?: string; commit?: { sha?: string } }[]>(
      `/repos/${fullName}/branches?per_page=10`,
      headers,
      signal,
    ),
    githubJson<{ name?: string; commit?: { sha?: string } }[]>(
      `/repos/${fullName}/tags?per_page=10`,
      headers,
      signal,
    ),
  ]);
  return [
    {
      id: id(),
      text: [
        `Repository refs: ${fullName}`,
        branches?.length
          ? `Branches: ${branches.map((branch) => `${branch.name ?? "unknown"}${branch.commit?.sha ? ` (${branch.commit.sha.slice(0, 8)})` : ""}`).join(", ")}`
          : "Branches: none returned",
        tags?.length
          ? `Tags: ${tags.map((tag) => `${tag.name ?? "unknown"}${tag.commit?.sha ? ` (${tag.commit.sha.slice(0, 8)})` : ""}`).join(", ")}`
          : "Tags: none returned",
        `Receipt: https://github.com/${fullName}/branches`,
      ].join("\n"),
      source: `https://github.com/${fullName}/branches`,
      title: `${fullName} · branches and tags`,
      score: 0.86,
      metadata: { provider: "github", kind: "refs", repository: fullName },
    },
  ];
}

type GitHubContent = {
  type?: string;
  name?: string;
  path?: string;
  html_url?: string;
  download_url?: string;
};

async function fetchDocumentation(
  fullName: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const entries = await githubJson<GitHubContent[]>(
    `/repos/${fullName}/contents/docs`,
    headers,
    signal,
  );
  if (!entries?.length) return [];
  const docs = entries
    .filter(
      (entry) =>
        entry.type === "file" && /\.(md|mdx|txt)$/i.test(entry.name ?? ""),
    )
    .slice(0, 3);
  const content: (ContextItem | null)[] = await Promise.all(
    docs.map(async (entry) => {
      if (!entry.path) return null;
      const text = await githubText(
        `/repos/${fullName}/contents/${entry.path}`,
        headers,
        signal,
      );
      if (!text) return null;
      return {
        id: id(),
        text: text.slice(0, 2_500),
        source:
          entry.html_url ??
          `https://github.com/${fullName}/blob/HEAD/${entry.path}`,
        title: `${fullName} · ${entry.path}`,
        score: 0.84,
        metadata: {
          provider: "github",
          kind: "documentation",
          repository: fullName,
          path: entry.path,
        },
      } satisfies ContextItem;
    }),
  );
  return content.filter((item): item is ContextItem => item !== null);
}

async function fetchCodeMatches(
  fullName: string,
  query: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const keywords = searchKeywords(query)
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 4)
    .join(" ");
  if (!keywords) return [];
  const result = await githubJson<{
    items?: { name?: string; path?: string; html_url?: string; url?: string }[];
  }>(
    `/search/code?q=${encodeURIComponent(`${keywords} repo:${fullName}`)}&per_page=5`,
    headers,
    signal,
  );
  const matches = (result?.items ?? []).slice(0, 3);
  return Promise.all(
    matches.map(async (file) => {
      const snippet = file.url
        ? await githubText(file.url, headers, signal)
        : null;
      return {
        id: id(),
        text: [
          `Code match: ${file.path ?? file.name ?? "file"}`,
          `Repository: ${fullName}`,
          snippet ? `Source:\n${snippet.slice(0, 1_500)}` : null,
          file.html_url ? `Receipt: ${file.html_url}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        source: file.html_url ?? `https://github.com/${fullName}`,
        title: `${fullName} · ${file.path ?? file.name ?? "code"}`,
        score: 0.83,
        metadata: {
          provider: "github",
          kind: "code",
          repository: fullName,
          path: file.path,
        },
      } satisfies ContextItem;
    }),
  );
}

async function searchGitHubIssues(
  q: string,
  headers: Record<string, string>,
  limit: number,
  signal?: AbortSignal,
): Promise<GitHubIssue[]> {
  const issueUrl = new URL("https://api.github.com/search/issues");
  issueUrl.searchParams.set("q", q);
  issueUrl.searchParams.set("per_page", String(limit));
  issueUrl.searchParams.set("sort", "updated");
  const issueRes = await fetch(issueUrl, {
    headers,
    ...(signal ? { signal } : {}),
  });
  if (!issueRes.ok) return [];
  const data = (await issueRes.json()) as { items?: GitHubIssue[] };
  return data.items ?? [];
}

async function searchIssues(
  q: string,
  headers: Record<string, string>,
  limit: number,
  signal?: AbortSignal,
): Promise<ContextItem[]> {
  const items = await searchGitHubIssues(q, headers, limit, signal);
  return items.map((item) => ({
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
      throw new Error(
        `mem0 search failed (${res.status}): ${text.slice(0, 200)}`,
      );
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
