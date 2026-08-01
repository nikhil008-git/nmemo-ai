import { randomUUID } from "node:crypto";
import {
  findGitRoot,
  getChangedFiles,
  getHeadCommit,
} from "../lib/git.js";
import { loadState, saveState } from "../lib/storage.js";
import type { Episode } from "../types.js";
import { NmemoError } from "../lib/errors.js";

type SaveOptions = {
  summary: string;
  failure?: string;
  next?: string;
  test?: string[];
};

export async function saveCommand(options: SaveOptions): Promise<void> {
  if (!options.summary?.trim()) {
    throw new NmemoError("Add a summary with --summary \"what you did\".");
  }

  const repoRoot = await findGitRoot();
  const state = await loadState(repoRoot);

  if (!state?.activeSession || state.activeSession.status !== "active") {
    throw new NmemoError("No active session. Start one with nmemo start \"task\".");
  }

  const [filesChanged, commit] = await Promise.all([
    getChangedFiles(repoRoot),
    getHeadCommit(repoRoot),
  ]);

  const episode: Episode = {
    id: randomUUID(),
    sessionId: state.activeSession.id,
    task: state.activeSession.task,
    summary: options.summary.trim(),
    filesChanged,
    tests: options.test ?? [],
    failures: options.failure ? [options.failure.trim()] : [],
    ...(options.next?.trim() ? { nextStep: options.next.trim() } : {}),
    branch: state.activeSession.branch,
    baseCommit: state.activeSession.baseCommit,
    commit,
    createdAt: new Date().toISOString(),
  };

  state.episodes.push(episode);
  state.activeSession = {
    ...state.activeSession,
    status: "paused",
    savedAt: episode.createdAt,
  };

  await saveState(repoRoot, state);

  console.log(`Saved episode for: ${episode.task}`);
  console.log(`Files recorded: ${episode.filesChanged.length}`);
}