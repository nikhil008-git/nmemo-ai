# evals

Resume, memory, and agent evaluations. Each step in `../BUILD.md` lands with evals here before
the next one starts.

## Layout

```
evals/
├── resume/       Does resume rebuild the right working context?
├── memory/       Does extraction keep what matters and recall find it?
├── agent/        Does the loop finish tasks without unsafe or wasted tool calls?
├── fixtures/     Recorded repositories, sessions, and model transcripts
└── runner/       Harness, scoring, reporting
```

## The three suites

**Resume.** The product claim. Given a recorded repository state and prior session, does
`resume` surface the decisions and next steps a developer would need — and not a wall of
irrelevant history? Scored on recall of known-required facts and on how much noise ships with
them.

**Memory.** Extraction: given a session transcript, are the decisions captured and the
transcript discarded? Recall: given a branch and task, is the right memory eligible? Validation:
is a fact about a deleted file correctly marked stale?

**Agent.** Task completion rate, turns used, tool calls per task, and — weighted heavily —
zero unapproved write or execute calls. A run that succeeds by escaping the repository root
counts as a failure.

## How it works

Fixtures are recorded, not live. Repository states are fixed trees, sessions are stored
transcripts, and model responses are replayed from `fixtures/` by default, so a run is
deterministic and free. Live-model runs are opt-in and reported separately, since they cost
money and vary between runs.

## Rules

- Every fixture records the expected outcome next to the input. An eval without a stated
  expectation is a demo.
- Ranking, extraction, and prompt changes are eval-gated: run the affected suite and report
  before/after in the PR.
- Report failures with the actual output. A suite that gets quietly skipped is worse than no
  suite.
- Fixtures hold no real user data and no secrets — synthesize repositories and sessions.
- Keep suites fast enough to run on every change; anything slower goes behind a flag.
