/*  
This file is nmemo’s local storage system. It creates and manages:
your-project/
└── .nmemo/
    ├── state.json
    └── .gitignore
     */
 import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { NmemoState } from "../types.js";
import { NmemoError } from "./errors.js";

function nmemoDirectory(repoRoot: string): string {
  return join(repoRoot, ".nmemo");
}

function statePath(repoRoot: string): string {
  return join(nmemoDirectory(repoRoot), "state.json");
}

export async function ensureNmemoDirectory(repoRoot: string): Promise<void> {
  await mkdir(nmemoDirectory(repoRoot), { recursive: true });

  const ignorePath = join(nmemoDirectory(repoRoot), ".gitignore");
  await writeFile(ignorePath, "*\n!.gitignore\n", "utf8");
}

export async function loadState(
  repoRoot: string,
): Promise<NmemoState | undefined> {
  try {
    const raw = await readFile(statePath(repoRoot), "utf8");
    const state = JSON.parse(raw) as NmemoState;

    if (state.version !== 1 || !state.project || !Array.isArray(state.episodes)) {
      throw new NmemoError("Invalid .nmemo/state.json format.");
    }

    return state;
  } catch (error) {
    if (error instanceof NmemoError) {
      throw error;
    }

    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") {
      return undefined;
    }

    throw new NmemoError("Could not read .nmemo/state.json.");
  }
}

export async function saveState(
  repoRoot: string,
  state: NmemoState,
): Promise<void> {
  await ensureNmemoDirectory(repoRoot);

  const destination = statePath(repoRoot);
  const temporary = `${destination}.tmp`;

  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(temporary, destination);
}