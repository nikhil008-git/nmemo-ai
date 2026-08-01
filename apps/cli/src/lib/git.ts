/**
 This file is nmemo’s Git adapter. It lets nmemo understand the repository where the user is working.
The flow is:
nmemo command
  → find Git repository
  → read branch
  → read commit
  → read changed files
  → save this information in nmemo memory
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NmemoError } from "./errors.js";

const execFileAsync = promisify(execFile);

async function runGit(args: string[], cwd: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: 1024 * 1024,
    });

    return stdout.trim();
  } catch {
    throw new NmemoError(
      "nmemo must be run inside a Git repository. Run it from a project folder.",
    );
  }
}

export async function findGitRoot(cwd = process.cwd()): Promise<string> {
  return runGit(["rev-parse", "--show-toplevel"], cwd);
}

export async function getCurrentBranch(repoRoot: string): Promise<string> {
  return runGit(["branch", "--show-current"], repoRoot);
}

export async function getHeadCommit(repoRoot: string): Promise<string> {
  return runGit(["rev-parse", "HEAD"], repoRoot);
}

export async function getChangedFiles(repoRoot: string): Promise<string[]> {
  const output = await runGit(["status", "--short"], repoRoot);

  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

export async function getRemoteUrl(
  repoRoot: string,
): Promise<string | undefined> {
  try {
    return await runGit(["config", "--get", "remote.origin.url"], repoRoot);
  } catch {
    return undefined;
  }
}