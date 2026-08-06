# nmemo roadmap

## The product promise

nmemo is a **context package, not another black box**. It gathers the relevant
working context, preserves its provenance, fits it to a chosen token budget, and
hands it back to the model or agent the developer already uses.

Keep your model. Keep your framework. Resume work with the same trusted context
in Claude Code, Codex CLI, Cursor, Gemini CLI, Grok CLI, or nmemo's own local
TUI.

```text
nmemo resume --print
```

The output should be a portable, inspectable resume packet: task state,
decisions, failed attempts, active files, memories, source receipts, and a
bounded token count. For example:

```text
carries 5,412 tokens of context · 18 memories · receipts intact
```

## Principles

- **Portable by default.** Context is plain, pasteable, and usable outside nmemo.
- **Receipts intact.** Every material claim can point back to a source, file,
  conversation, or connector record.
- **User-controlled memory.** People can inspect, correct, pin, export, and
  delete what nmemo remembers.
- **Local first for coding work.** The CLI/TUI can operate on a local project;
  hosted services and connectors enrich it rather than lock it in.
- **Model and framework neutral.** nmemo prepares context; it does not replace
  the developer's preferred agent, provider, or workflow.
- **Observable context assembly.** Show what was selected, omitted, compressed,
  contradicted, and why.

## Roadmap

### Now — make the context package real

- Stabilize the context response as a versioned package: prompt, token usage,
  memories, sources, citations, diagnostics, and receipts.
- Finish a polished **live Playground** that streams an answer while showing the
  exact context package that was sent to the model.
- Make context diagnostics useful: source latency, ranking reasons, discarded
  items, conflicts, and token-budget allocation.
- Harden the existing document/RAG, workspace, API-key, and connector flows;
  make source health and failed syncs visible.
- Define success with reproducible retrieval evaluations, latency budgets, and
  human-readable receipts—not only chat quality.

### Next — local agent memory that actually works

Start with a transparent, file-backed system. No embeddings, vector database, or
hosted memory service is required for a useful first release.

```text
.agent-memory/
├── episodes.jsonl       # append-only task/session summaries
├── procedures.md        # project instructions and repeatable workflows
└── state.json            # optional durable state: schema version, pins, settings
```

| Module | Responsibility | Persistence |
| --- | --- | --- |
| `working.ts` | Hold the current task, plan, files touched, open questions, and the last few useful tool results. | Process/session memory; optionally checkpoint to `state.json`. |
| `episodic.ts` | At task completion or handoff, append a concise summary of the goal, work done, decisions, failed attempts, validation, and next step. | `.agent-memory/episodes.jsonl` |
| `procedural.ts` | Load repo-specific instructions, conventions, and repeatable workflows before an agent acts. | `.agent-memory/procedures.md` |
| `semantic.ts` | Keyword-score saved episodes to find durable project facts and relevant past work. | Reads `episodes.jsonl`; no embeddings or database. |
| `manager.ts` | Assemble a token-bounded prompt package from procedures, working state, relevant episodes, and live repository receipts; save the final episode on completion. | Coordinates all layers. |

The manager should prefer live repository evidence—current files, Git status,
tests, and configs—over a memory claim. Memory is a helpful record, never the
source of truth for code that can be checked locally.

#### What a memory record needs

Every episode should include enough information for a future agent to decide
whether it is relevant and trustworthy:

- stable ID, schema version, repository/project scope, branch or worktree, and timestamps;
- task/goal, short summary, decisions and their reasons;
- files changed, commands/tests run, results, and unresolved follow-ups;
- failed approaches and why they failed, so the next agent does not repeat them;
- receipts: file paths, commit/PR/issue references, command output excerpts, or connector URLs;
- keywords/tags, recency, and an optional pinned flag for deterministic local ranking;
- a compact token estimate so prompt assembly can stay inside budget.

For v1, use deterministic ranking: exact task and keyword matches first, then
recency, pinned items, shared file paths, and project scope. Keep the chosen and
omitted memory IDs in diagnostics. Introduce embeddings only after this simple
path is measured and shown to be insufficient.

#### Memory lifecycle and controls

- Capture working state during a task; write an episode only at a meaningful
  boundary: completion, pause, handoff, or explicit save.
- Keep the append-only original episode; add later corrections or supersession
  records rather than silently rewriting history.
- Support `show`, `pin`, `forget`, `export`, and `doctor` commands from the CLI
  before building any automatic cleanup.
- Scope memory to a repo/worktree by default. Never mix personal, project, or
  workspace memories without explicit user intent.
- Redact secrets from tool results and require confirmation before saving content
  that looks sensitive. Respect `.gitignore`-style exclusions for local memory.
- Evaluate continuity: can a new agent resume the task, avoid known failed work,
  and verify every important claim from its receipts?

### Next — expand connectors with a reliable foundation

- Create one connector contract for OAuth, API-key, local, and MCP-backed
  sources: capability metadata, scoped access, sync status, incremental sync,
  retries, and receipts.
- Prioritize the sources that make an engineering resume packet valuable:
  GitHub, Linear/Jira, Slack, Notion, Google Drive, and local Git/worktree.
- Add generic MCP and custom retriever support so teams can bring their own
  systems without waiting for a first-party integration.
- Support selective, query-time retrieval where it is fresher than syncing, with
  clear latency and permission boundaries.
- Keep connector credentials encrypted and scoped per workspace; make disconnect
  and data removal straightforward.

### Then — nmemo CLI and local TUI

- Ship a local `nmemo` CLI that initializes a project, captures a work session,
  and prints a portable resume packet.
- Build `nmemo resume --print` first. Its output must paste cleanly into:

  | Destination | Suggested target |
  | --- | --- |
  | Claude Code | `opus` |
  | Codex CLI | GPT-5.x |
  | Cursor | `composer` |
  | Gemini CLI | `cli` |
  | Grok | `cli` |
  | nmemo TUI | built-in agent |

- Add adapters only for small destination-specific instructions; the underlying
  package stays model-neutral and exportable.
- Build a local-first TUI for viewing the current task, timeline, memories,
  receipts, connector health, and token-budget preview.
- Let the TUI use external agents (Claude, Codex, and others) as the execution
  layer while nmemo owns context assembly and continuity.
- Support offline/local storage first, then optional workspace sync with explicit
  consent and conflict handling.

### Later — context orchestration at production scale

- Add fast and full retrieval paths, prefetching, cache invalidation, and
  background connector synchronization.
- Improve routing, deduplication, contradiction resolution, compression, and
  adaptive token allocation across memories, project files, and connected tools.
- Provide team controls: shared/project memory, private memory boundaries,
  audit trails, retention policies, and usage limits.
- Release an SDK and stable package schema so applications and agent frameworks
  can request, inspect, and store context programmatically.
- Publish benchmark fixtures for resume quality, receipt accuracy, retrieval
  relevance, and token efficiency.

## Milestones

| Milestone | User-visible proof |
| --- | --- |
| Context package v1 | A developer can inspect exactly what an agent received and why. |
| Local memory v1 | A later session resumes from `.agent-memory` using working, episodic, procedural, and keyword-ranked semantic memory—with receipts. |
| Connector platform v1 | A workspace connects core engineering tools with dependable sync status and removal controls. |
| `nmemo resume` v1 | One command prints a bounded, portable handoff that works in the major coding agents. |
| Local TUI v1 | A developer can manage and resume local work without depending on a web dashboard. |
| Production orchestration | Teams can run observable, secure, multi-source context assembly at scale. |

## Explicit non-goals

- Building a new foundation model or forcing users onto one provider.
- Hiding retrieval and memory behavior behind opaque “AI magic.”
- Replacing developer tools such as Claude Code, Codex, Cursor, or Gemini CLI.
- Treating every saved chat message as permanent, unquestionable memory.

## Near-term build order

1. Context-package schema and receipt/diagnostics viewer in the live Playground.
2. File-backed memory manager: working state, JSONL episodes, procedures, deterministic semantic retrieval, and receipts.
3. Local CLI with `nmemo resume --print` and paste-ready adapters.
4. Connector platform foundation and the highest-value engineering connectors.
5. Local TUI, then optional shared sync and production orchestration features.
