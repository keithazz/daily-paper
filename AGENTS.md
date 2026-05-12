# AGENTS.md

Audience: **the AFK coding agent (Pi) running inside the Sandcastle sandbox.**
Not for: Claude Code during planning (see `CLAUDE.md` instead).

## Your job

You are picking up a single GitHub issue with the `ready-for-afk` label and turning failing tests into passing tests. You commit your work to a per-issue branch (`agent/issue-N`) forked from the feature branch (`feat-X`).

You do not decide what to build. The interfaces and tests already specify it. Your job is to fill in implementations such that the listed acceptance tests pass without breaking anything else.

## Reading the issue

Each issue body has fixed sections. Read them all, in order:

- **Description** — one-paragraph context.
- **Context** — domain knowledge you cannot infer from the code.
- **Acceptance Tests** — the test IDs you must make pass.
- **Constraints** — hard rules. Do not violate.
- **Watch Out For** — subtle traps. Read this carefully; these are the things that have caused mistakes before.
- **Out of Scope** — what *not* to do, even if it looks related.

If anything in the issue contradicts what you find in the codebase, stop and emit `TASK_BLOCKED` rather than choosing.

## Forbidden modifications

You must **never** modify files matching:

- `tests/locked/**` — the contract you are implementing against.
- `src/interfaces/**` — the technical contract.

If you find yourself wanting to change either, the correct action is to emit `TASK_BLOCKED: <reason>` as your completion signal. The orchestrator will route the issue to a human.

This is a hard rule. There are no exceptions, including:

- "The test seems wrong" — emit `TASK_BLOCKED`.
- "The interface is awkward" — emit `TASK_BLOCKED`.
- "It would be cleaner if I added a method to the interface" — emit `TASK_BLOCKED`.

## Tests you can and cannot write

You may add or edit tests **outside** `tests/locked/**` — for example, scratch tests under `tests/scratch/` to verify your own work during development. You may delete those before committing.

You may **not** add tests anywhere that would cause the locked acceptance tests to pass via the test rather than the code. If you find yourself doing this, you are working around a real problem; emit `TASK_BLOCKED`.

## Workflow

1. Read the issue body in full.
2. Read `CONTEXT.md` and any ADRs referenced from it.
3. Read the relevant interfaces under `src/interfaces/**`.
4. Read the acceptance tests under `tests/locked/**` to understand the contract.
5. Plan the implementation in a few sentences before writing code.
6. Implement.
7. Run the acceptance tests listed in the issue. They must all pass.
8. Run the full unit test suite. No previously-passing test should now fail.
9. Commit with a clear message referencing the issue: `feat: <summary> (#<issue-number>)`.
10. Emit `TASK_COMPLETE` as your final output.

## Completion signals

Your final message must contain exactly one of:

- `TASK_COMPLETE` — acceptance tests pass, no regressions, work is committed.
- `TASK_BLOCKED: <one-paragraph reason>` — you cannot proceed and need a human.

The orchestrator parses this. Do not output anything after the signal.

## Commits

- One logical commit per issue is preferred; multiple small commits are acceptable.
- Format: `feat: <summary> (#N)` for features, `fix: <summary> (#N)` for fixes.
- Do not commit changes to `tests/locked/**` or `src/interfaces/**`. The pre-push hook will reject them; the orchestrator will reject them; you will lose your work.

## Running tests

The project's test runner and commands are documented in `.claude/planning-config.md` under "Test runner" and in this file's project-specific section below.

When in doubt about how to run a specific test, look at the project's CI configuration or the test runner's documentation. Do not guess.

## When stuck

If you cannot make progress on the acceptance tests within a reasonable number of iterations:

1. Re-read the issue body, especially **Watch Out For** and **Constraints**.
2. Re-read the relevant interfaces and tests.
3. Re-read the PRD at `docs/prds/feat-<name>.md` for higher-level context.
4. If still stuck, emit `TASK_BLOCKED: <reason>` and stop.

Do not silently work around a hard problem by relaxing tests, modifying interfaces, or changing scope. Blocking gracefully is a successful outcome; corrupting the contract is not.

## Project-specific notes

<!--
  This section is populated by the bootstrap skill or by hand.
  Include: test runner commands, package manager, language version,
  how to run a single test, how to run the full suite, any local
  setup the agent needs to do before running tests.
-->

- Test runner: <to-be-filled>
- Run a single test: `<command>`
- Run the full suite: `<command>`
- Lint: `<command>`
- Type check: `<command>`
