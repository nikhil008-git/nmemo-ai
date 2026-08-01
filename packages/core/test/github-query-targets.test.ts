import assert from "node:assert/strict";
import test from "node:test";

import {
  extractGitHubRepositoryTargets,
  GitHubRetriever,
} from "../src/retrievers/http-retrievers.js";

test("finds an owner/repository reference", () => {
  assert.deepEqual(
    extractGitHubRepositoryTargets("Summarize work in acme/cal.diy"),
    { fullNames: ["acme/cal.diy"], names: [] },
  );
});

test("finds a GitHub URL without treating URL segments as repositories", () => {
  assert.deepEqual(
    extractGitHubRepositoryTargets(
      "What changed in https://github.com/acme/cal.diy/pull/42?",
    ),
    { fullNames: ["acme/cal.diy"], names: [] },
  );
});

test("does not interpret a repository owner in a GitHub URL as a contributor", async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("/user/repos")) return Response.json([]);
    if (url.includes("/users/contributor/repos")) return Response.json([]);
    if (url.includes("/commits?")) return Response.json([]);
    if (url.includes("/pulls?")) return Response.json([]);
    if (url.includes("/search/issues")) return Response.json({ items: [] });
    if (url.endsWith("/readme")) return new Response("# cal.diy");
    if (url.includes("/repos/acme/cal.diy")) {
      return Response.json({
        name: "cal.diy",
        full_name: "acme/cal.diy",
        html_url: "https://github.com/acme/cal.diy",
      });
    }
    if (url.endsWith("/users/contributor"))
      return Response.json({ login: "contributor" });
    return new Response(null, { status: 404 });
  };
  try {
    const retriever = new GitHubRetriever({
      accessToken: "test-token",
      accountLogin: "contributor",
    });
    await retriever.retrieve(
      "What changed in https://github.com/acme/cal.diy?",
      {
        userId: "user",
        workspaceId: "workspace",
      },
    );
    assert.equal(
      calls.some((url) => url.endsWith("/users/acme")),
      false,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("finds a short repository name only in an explicit repository phrase", () => {
  assert.deepEqual(
    extractGitHubRepositoryTargets("What did Avery contribute for cal.diy?"),
    { fullNames: [], names: ["cal.diy"] },
  );
  assert.deepEqual(extractGitHubRepositoryTargets("How are we doing today?"), {
    fullNames: [],
    names: [],
  });
});

test("retrieves contribution evidence with GitHub receipt links", async () => {
  const originalFetch = globalThis.fetch;
  const repo = {
    name: "cal.diy",
    full_name: "acme/cal.diy",
    html_url: "https://github.com/acme/cal.diy",
    description: "Scheduling",
    private: true,
  };
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/users/contributor")) {
      return Response.json({
        login: "contributor",
        html_url: "https://github.com/contributor",
      });
    }
    if (url.includes("/user/repos")) return Response.json([repo]);
    if (url.includes("/users/contributor/repos")) return Response.json([repo]);
    if (url.endsWith("/readme")) return new Response("# cal.diy");
    if (url.includes("/commits?")) {
      return Response.json([
        {
          sha: "abc123def456",
          html_url: "https://github.com/acme/cal.diy/commit/abc123def456",
          author: { login: "contributor" },
          commit: {
            message: "Add booking flow",
            author: { date: "2026-07-01T00:00:00Z" },
          },
        },
      ]);
    }
    if (url.includes("/pulls?")) {
      return Response.json([
        {
          number: 12,
          title: "Add booking flow",
          html_url: "https://github.com/acme/cal.diy/pull/12",
          state: "closed",
          merged_at: "2026-07-02T00:00:00Z",
          user: { login: "contributor" },
        },
      ]);
    }
    if (url.includes("/search/issues")) {
      return Response.json({
        items: [
          {
            number: 7,
            title: "Booking bug",
            html_url: "https://github.com/acme/cal.diy/issues/7",
            state: "closed",
            user: { login: "contributor" },
          },
        ],
      });
    }
    return new Response(null, { status: 404 });
  };

  try {
    const retriever = new GitHubRetriever({
      accessToken: "test-token",
      accountLogin: "contributor",
    });
    const items = await retriever.retrieve(
      "What contributions did Avery make for cal.diy?",
      { userId: "user", workspaceId: "workspace" },
    );
    assert.ok(items.some((item) => item.metadata?.kind === "commit"));
    assert.ok(items.some((item) => item.metadata?.kind === "pull-request"));
    assert.ok(items.some((item) => item.metadata?.kind === "issue"));
    assert.ok(
      items.some(
        (item) => item.source === "https://github.com/acme/cal.diy/pull/12",
      ),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
