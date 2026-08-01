import {
    findGitRoot,
    getCurrentBranch,
    getHeadCommit,
  } from "../lib/git.js";
  import { createResumePacket } from "../lib/resume-packet.js";
  import { loadState } from "../lib/storage.js";
  import { NmemoError } from "../lib/errors.js";
  
  export async function resumeCommand(): Promise<void> {
    const repoRoot = await findGitRoot();
    const [state, branch, commit] = await Promise.all([
      loadState(repoRoot),
      getCurrentBranch(repoRoot),
      getHeadCommit(repoRoot),
    ]);
  
    if (!state || state.episodes.length === 0) {
      throw new NmemoError("No saved nmemo episode found for this repository.");
    }
  
    const episode = state.episodes.at(-1);
  
    if (!episode) {
      throw new NmemoError("No resumable episode found.");
    }
  
    console.log(
      createResumePacket({
        projectName: state.project.name,
        currentBranch: branch,
        currentCommit: commit,
        episode,
      }),
    );
  }