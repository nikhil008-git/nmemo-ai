import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import {
  findGitRoot,
  getCurrentBranch,
  getHeadCommit,
  getRemoteUrl,
} from "../lib/git.js";
import { ensureNmemoDirectory, loadState, saveState } from "../lib/storage.js";
import type { NmemoState, TaskSession } from "../types.js";
import { NmemoError } from "../lib/errors.js";

export async function startCommand(task: string): Promise<void> {
  const cleanTask = task.trim(); // "  fix auth  " => "fix auth"

  if (!cleanTask) {
    throw new NmemoError("Provide a task. Example: nmemo start \"fix OAuth\"");
  }

  const repoRoot = await findGitRoot();
  const [branch, baseCommit, remote, existing] = await Promise.all([
    getCurrentBranch(repoRoot),
    getHeadCommit(repoRoot),
    getRemoteUrl(repoRoot),
    loadState(repoRoot),
  ]);

  if (existing?.activeSession?.status === "active") {
    throw new NmemoError(
      `An active session already exists: "${existing.activeSession.task}". Run nmemo save first.`,
    );
  }

  await ensureNmemoDirectory(repoRoot);

  const session: TaskSession = {
    id: randomUUID(),
    task: cleanTask,
    status: "active",
    branch,
    baseCommit,
    startedAt: new Date().toISOString(),
  };

  const state: NmemoState = {
    version: 1,
    project: existing?.project ?? {
      id: randomUUID(),
      name: basename(repoRoot),
      root: repoRoot,
      ...(remote ? { remote } : {}),
    },
    activeSession: session,
    episodes: existing?.episodes ?? [],
  };

  await saveState(repoRoot, state);

  console.log(`Started: ${session.task}`);
  console.log(`Repository: ${state.project.name}`);
  console.log(`Branch: ${session.branch || "detached HEAD"}`);
}