---
name: to-issues
description: Slice a PRD plus committed interfaces plus failing tests into vertical-slice GitHub issues using the structured template (Description, Context, Acceptance Tests, Constraints, Watch Out For, Out of Scope, Priority, Feature). Each test ID must be referenced by exactly one issue. Opens issues via gh CLI with appropriate labels (ready-for-afk, feature:feat-X, priority-N). Use when the user has a PRD, interfaces, and tests in red on the feature branch and wants the work split into independently-grabbable issues for the AFK agent, mentions "create issues", "split into issues", "to issues".
---

# to-issues

Convert a PRD + interfaces + failing tests into a set of GitHub issues for the AFK agent to pick up.

## When to invoke

The feature branch is in red: PRD committed, interfaces committed, tests committed and failing. The user wants issues opened so the AFK loop can start.

## Preconditions — refuse if missing

1. **Current branch is `feat-<name>`.**
2. **PRD exists** at `docs/prds/feat-<name>.md`.
3. **Interfaces are committed** under the locked-interfaces path.
4. **Tests are committed** under the locked-tests path and currently fail (red state).
5. **Working tree is clean.**
6. **`gh` CLI is authenticated** for the repo. Refuse if `gh auth status` fails.

## What you do

The skill has four phases. Walk through them in order; do not skip ahead.

### Phase 1: Read everything

1. **`.claude/planning-config.md`** — for paths, label vocabulary, test ID format.
2. **`docs/prds/feat-<name>.md`** — the user-facing contract.
3. **`CONTEXT.md`** — domain vocabulary.
4. **All interfaces** under the locked-interfaces path, paying attention to user story comments.
5. **All test files** under the locked-tests path for the feature. Extract the full list of test IDs.
6. **Existing issues** with the `feature: feat-<name>` label via `gh issue list`. Refuse to proceed if any exist — the user should close or relabel them first to avoid duplication.

### Phase 2: Propose a slicing

Slice the work into vertical issues such that:

- Each issue is **independently grabbable** — it can be picked up without waiting for any other issue (within its priority tier).
- Each issue is **vertically scoped** — it delivers a complete behaviour through all relevant layers, not a horizontal slice of one layer.
- **Every test ID** from the locked-tests path is referenced by exactly one issue's *Acceptance Tests* section. No gaps. No duplicates.
- Each issue is **small enough for one Pi run** — rough heuristic: 3–8 acceptance tests per issue, max.
- Issues with dependencies are split into priority tiers (`priority-1`, `priority-2`, …) so the AFK orchestrator can sequence them.

Surface the proposed slicing as a short outline:

```
Issue 1 (priority-1): "Implement user creation"
  - Acceptance tests: 3 tests
  - Stories: #1, #2, #5
  - Touches: src/services/user_service.py

Issue 2 (priority-2): "Implement user lookup by email"
  - Acceptance tests: 2 tests
  - Stories: #3, #4
  - Touches: src/services/user_service.py
```

Wait for the user to accept, revise, or reject the slicing. The slicing is the most important judgement call in the workflow — do not bulldoze through it.

### Phase 3: Validate the slicing

Once the user accepts the proposed slices, verify mechanically:

- Every test ID under the locked-tests path appears in exactly one issue's *Acceptance Tests*. List any unmatched test IDs and stop if found.
- No test ID appears in two issues. List duplicates and stop if found.
- Every issue references at least one user story from the PRD.
- Every issue has a priority assigned.

If any check fails, surface the specific problem and ask the user to revise.

### Phase 4: Write the issues

For each accepted issue:

1. **Draft the issue body** following `docs/templates/issue.md` exactly. Section headings are load-bearing; do not rename or reorder.

2. **Populate each section thoughtfully**:
   - **Description** — one paragraph from the user-story content; reference the PRD path.
   - **Context** — domain knowledge from `CONTEXT.md` and ADRs that's relevant. Pointers to canonical examples in the codebase if any exist for similar work.
   - **Acceptance Tests** — the exact test IDs in the project's test runner format. One per line.
   - **Constraints** — at minimum: forbidden paths (locked-interfaces, locked-tests), no new dependencies unless listed.
   - **Watch Out For** — specific traps for *this* issue, drawn from the PRD, ADRs, or conversation. This is the highest-value section — fill it with care, not boilerplate.
   - **Out of Scope** — what looks related but isn't, with cross-references where applicable.
   - **Priority** — the integer assigned in Phase 2.
   - **Feature** — `feat-<name>`.

3. **Show all issue drafts to the user** before opening any. This is the last review point.

4. **Open issues via `gh issue create`** once approved, applying labels:
   - `ready-for-afk`
   - `feature: feat-<name>`
   - `priority-<N>`

   Use the canonical label strings from `planning-config.md` if they differ from defaults.

5. **Print the resulting issue numbers and URLs** so the user has a record.

## Issue title convention

Format: `feat: <short imperative summary>`

Examples:
- `feat: implement user creation service`
- `feat: validate email uniqueness on registration`

## Sequencing and dependencies

A simple integer priority is sufficient for solo, single-agent work. The AFK orchestrator picks `priority-1` first, then `priority-2`, etc. Within a priority tier, ordering is undefined — issues there must be genuinely independent.

If two issues *must* run in order, give them different priorities. Do not invent a `depends-on` mechanism; the priority integer is the contract.

## Hard rules

- **One test ID = one issue.** Violations break Stage 3 verification in the AFK loop.
- **Every test ID must be assigned.** Orphan tests will fail Stage 3 forever.
- **Issues never reference unwritten tests.** All test IDs must already exist on the feature branch.
- **No issue covers work outside the PRD's user stories.** If you find such work, the PRD is incomplete — surface it, do not paper over.

## What you do not do

- Do not open issues without showing the drafts first.
- Do not write to or modify the locked-tests or locked-interfaces paths.
- Do not invent test IDs that don't exist.
- Do not commit. Issues are external to git history.
- Do not invoke other skills.

## Output

After successful issue creation, summarise to the user:

```
Opened 5 issues for feat-<name>:
- #42 priority-1: feat: implement user creation service
- #43 priority-1: feat: implement password hashing
- #44 priority-2: feat: validate email uniqueness on registration
- #45 priority-2: feat: implement user lookup by email
- #46 priority-3: feat: support user deactivation

All test IDs from tests/locked/feat-<name>/ are covered.
The AFK loop can pick these up now.
```

## Edge cases

- **Tests that don't fit any user story.** Surface them; the PRD is incomplete or the tests are wrong. Resolve before opening issues.
- **A user story with no test coverage.** Surface it; either the story is out of scope or `/write-failing-tests` missed it. Resolve before opening issues.
- **Issues that would be too large.** Re-slice. Better to have eight small issues than four big ones; the AFK agent's success rate drops sharply with issue size.
- **Issues that would be too small.** Combine. Sub-trivial issues add overhead; one issue with 6 acceptance tests is usually better than three with 2 each.
