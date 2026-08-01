
import {
    findGitRoot,
    getChangedFiles,
    getCurrentBranch,
  } from "../lib/git.js";
  import { loadState } from "../lib/storage.js";
  import { NmemoError } from "../lib/errors.js";
  
  export async function statusCommand(): Promise<void> {
    const repoRoot = await findGitRoot();
    const [state, branch, changedFiles] = await Promise.all([
      loadState(repoRoot),
      getCurrentBranch(repoRoot),
      getChangedFiles(repoRoot),
    ]);
  
    if (!state) {
      throw new NmemoError("No nmemo project found. Run nmemo start \"your task\".");
    }
  
    const session = state.activeSession;
  
    console.log(`Project: ${state.project.name}`);
    console.log(`Branch: ${branch || "detached HEAD"}`);
    console.log(`Changed files: ${changedFiles.length}`);
  
    if (!session) {
      console.log("Session: none");
      return;
    }
  
    console.log(`Task: ${session.task}`);
    console.log(`Status: ${session.status}`);
    console.log(`Started: ${session.startedAt}`);
  }