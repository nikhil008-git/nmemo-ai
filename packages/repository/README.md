# @repo/repository

Git facts about the working directory: root, branch, commit, changed files. The single source
of repository truth for the whole monorepo — if two packages disagree about what branch we're
on, they were both wrong to look it up themselves.

## Surface

```ts
findRoot(cwd: string): Promise<string | null>
currentBranch(root: string): Promise<string>
headCommit(root: string): Promise<Commit>
changedFiles(root: string, opts?: { staged?: boolean; base?: string }): Promise<FileChange[]>
diff(root: string, opts?: DiffOptions): Promise<string>
isDirty(root: string): Promise<boolean>
```

## Rules

- Read-only. This package never commits, stages, checks out, or rewrites history. Mutating
  git operations belong to `@repo/tools` where they pass through approvals.
- Shell out to `git`; do not reimplement plumbing and do not add a git library dependency.
- Never trust the process `cwd`. Every function takes an explicit root.
- Detached HEAD, no commits yet, worktrees, and submodules are normal cases — return a
  well-typed result, don't throw.
- Path values returned are repository-relative and POSIX-separated, always.
- Cache within a call, never across calls. The repository changes underneath us.

## Why it exists

Memory is scoped by repository and branch, so a wrong branch means recalling the wrong
project state. Keeping this in one package makes that failure mode fixable in one place.

## Depends on

`@repo/shared` only.
