export type SessionStatus = "active" | "paused" | "done"

export type Project = {
    id: string;
  name: string;
  root: string; // root directory of the repo
  remote?: string; // remote url 

}

export type TaskSession = { // session for a task
    id: string;
  task: string;
  status: SessionStatus;
  branch: string;
  baseCommit: string;
  startedAt: string;
  savedAt?: string;


}

export type Episode = { // episodic means a single task session is broken down into multiple episodes
    id: string;
    sessionId: string;
    task: string;
    summary: string;
    filesChanged: string[];
    tests: string[];
    failures: string[];
    nextStep?: string;
    branch: string;
    baseCommit: string;
    commit: string;
    createdAt: string;
    
}
export type NmemoState ={ // 1 version for now
    version: 1;
  project: Project;
  activeSession?: TaskSession;
  episodes: Episode[];
} 

// eg.. for this NmemoState
/* 
{
  "version": 1,
  "project": {
    "id": "project-123",
    "name": "nmemo-ai",
    "root": "/Users/nikhil/nmemo-ai"
  },
  "activeSession": {
    "id": "session-456",
    "task": "Fix OAuth validation",
    "status": "active",
    "branch": "feat/oauth",
    "baseCommit": "abc123",
    "startedAt": "2026-07-31T12:00:00.000Z"
  },
  "episodes": [
    {
      "id": "episode-789",
      "task": "Add CLI continuation",
      "summary": "Created start, save, and resume commands.",
      "filesChanged": ["apps/cli/src/bin.ts"],
      "tests": ["npm run check-types"],
      "failures": [],
      "nextStep": "Build the TUI",
      "branch": "feat/cli",
      "baseCommit": "abc123",
      "commit": "def456",
      "createdAt": "2026-07-31T11:00:00.000Z"
    },
    {
          "id": "episode-101",
      "task": "Add TUI for CLI",
      "summary": "Created a basic TUI for the CLI.",
      "filesChanged": ["apps/cli/src/tui.ts"],
      "tests": ["npm run check-types"],
      "failures": [],
      "nextStep": "Add more features to the TUI",
      "branch": "feat/tui",
      "baseCommit": "abc123",
      "commit": "ghi789",
      "createdAt": "2026-07-31T10:00:00.000Z"
    }
  ]
}*/
export type Memory = "fact" | "decision";

export type MemeoryStatus = "active" | "stale" | "superseded"  // active can be used |  stale old |  Replaced by a newer decision
  