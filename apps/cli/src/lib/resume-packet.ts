// This file creates the resume message that you can paste into Claude Code, Codex, Cursor, or another agent.
import type { Episode } from "../types.js";

export function createResumePacket(input: {
  projectName: string;
  currentBranch: string;
  currentCommit: string;
  episode: Episode;
}): string {
  const { projectName, currentBranch, currentCommit, episode } = input;
  const repositoryChanged = currentCommit !== episode.commit;

  const lines = [
    `# nmemo Resume: ${projectName}`,
    "",
    `**Task:** ${episode.task}`,
    `**Saved branch:** ${episode.branch}`,
    `**Current branch:** ${currentBranch}`,
    `**Saved commit:** ${episode.commit.slice(0, 8)}`,
    `**Current commit:** ${currentCommit.slice(0, 8)}`,
    "",
    "## Work completed",
    episode.summary,
    "",
    "## Files changed",
    ...(episode.filesChanged.length > 0
      ? episode.filesChanged.map((file) => `- \`${file}\``)
      : ["- No uncommitted files detected when this episode was saved."]),
  ];

  if (episode.tests.length > 0) {
    lines.push("", "## Tests", ...episode.tests.map((test) => `- ${test}`));
  }

  if (episode.failures.length > 0) {
    lines.push(
      "",
      "## Unresolved issues",
      ...episode.failures.map((failure) => `- ${failure}`),
    );
  }

  if (episode.nextStep) {
    lines.push("", "## Next step", episode.nextStep);
  }

  if (repositoryChanged) {
    lines.push(
      "",
      "> Warning: the repository changed after this episode was saved. Validate this context against the current code before editing.",
    );
  }

  return `${lines.join("\n")}\n`;
}