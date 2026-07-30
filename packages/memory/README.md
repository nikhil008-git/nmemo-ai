# @repo/memory

Storage, extraction, recall, and validation. The memory layer of nmemo — everything the
product means by "remembering a project" lives here.

## Layout

```
src/
├── storage/      Persist and query episodes and facts (via @repo/database)
├── extraction/   Turn a session into structured memory
├── recall/       Retrieve what matters for a repository, branch, or task
└── validation/   Verify memory against current repository truth
```

## The four stages

**Storage.** The write and read surface for episodes and facts. Owns ids, timestamps, and
scoping by workspace / project / branch. This is the only place that touches Prisma.

**Extraction.** Takes a session — messages, diffs, commands run, decisions made — and emits
structured memory: what changed, why, what was ruled out, what is next. Extraction is
lossy on purpose; it keeps decisions and discards transcript.

**Recall.** Given a repository, branch, and optional task, returns the memory that should be
in context. Ranking and token budgeting come from `@repo/core` — recall decides *what is
eligible*, core decides *what fits*.

**Validation.** Memory goes stale the moment code moves. Validation checks a recalled fact
against the repository (file still exists, symbol still there, branch not rebased away) and
marks it stale rather than deleting it.

## Contract

- Memory is append-mostly. Corrections supersede; they do not overwrite history.
- Every fact carries provenance: which episode, which commit, which files.
- Recall never returns unvalidated facts as certain — a stale fact is returned labelled stale.
- No model calls outside `extraction/`. Storage and recall are deterministic.

## Depends on

`@repo/database`, `@repo/core`, `@repo/shared`. Never depends on `@repo/agent` or `apps/*`.
