# <issue title>

<!--
  This template is what `to-issues` produces and what the AFK orchestrator parses.
  All section headings are load-bearing — do not rename them. Order is fixed.
-->

## Description

One paragraph: what this issue accomplishes within the feature, in plain language. State the work, not the implementation. Reference the PRD by path: see `docs/prds/feat-X.md`.

## Context

Domain knowledge the agent cannot reliably infer from the codebase alone. Include:

- Relevant terms from `CONTEXT.md` and how they apply here.
- Pointers to canonical examples in the codebase: "Follow the pattern in `src/services/order_service.py`."
- Any non-obvious facts about the existing system that affect this work.

Keep this focused — every line should pay rent.

## Acceptance Tests

The tests that must pass for this issue to be considered complete. Each entry is a fully-qualified test ID in the project's test runner format. The agent uses this list as its target; the orchestrator uses it to verify completion.

- `<test-id-1>`
- `<test-id-2>`

Every test ID must already exist (in red) under `tests/locked/**` on the feature branch before the issue is opened. Do not include tests the agent is expected to write — the agent does not write tests.

## Constraints

Hard rules. Violations are blocking failures.

- Do not modify files matching: `tests/locked/**`, `src/interfaces/**`.
- Do not introduce new dependencies (or, if necessary, list them here).
- <other constraints specific to this issue>

## Watch Out For

Subtle traps and gotchas. This is the highest-leverage section for local-model agents.

- <trap or gotcha>
- <trap or gotcha>

Examples of what belongs here:
- "X and Y both exist; Y is legacy — use X."
- "The repository's `save()` returns the persisted entity; don't reuse the input object."
- "This will be called in a loop over ~10k items — use the bulk variant."
- "Do not add a caching layer; we tried this and reverted it."

## Out of Scope

What the agent should *not* do, even if it looks related.

- <out-of-scope item> — tracked in #<issue> if relevant.

## Priority

A single integer. Lower numbers run first. Default `5` if there's no specific ordering need.

`<integer>`

## Feature

The feature branch this issue belongs to.

`feat-<name>`
