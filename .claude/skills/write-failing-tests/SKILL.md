---
name: write-failing-tests
description: Read the PRD and committed interfaces, propose integration tests (and unit tests for tricky logic) in red that map to user stories, iterate with the user, then write them under tests/locked/ and stage for commit. Each test references a user story by number. Refuses to run if interfaces don't exist for the current feature. Use when interfaces are committed and the user wants to set up the red state of red-green-refactor, mentions "write failing tests", "set up tests in red", "TDD setup", or is about to hand off to the AFK agent.
---

# write-failing-tests

Put the feature branch into a clean red state. Tests live under `tests/locked/**` (or the project's locked-tests path) and the AFK agent is forbidden from modifying them.

## When to invoke

Interfaces have been committed. The user wants the test contract written next, before opening issues for the AFK agent.

## Preconditions — refuse if missing

1. **Current branch is `feat-<name>`.**
2. **PRD exists** at `docs/prds/feat-<name>.md`.
3. **Interfaces exist** under the locked-interfaces path (per `planning-config.md`) and are committed. If they're staged but not committed, ask the user to commit first — tests against uncommitted interfaces are fragile.
4. **Working tree is clean.**

## What you do

1. **Read `.claude/planning-config.md`** for the test runner, locked-tests path, and test ID format.
2. **Read the PRD** in full, paying particular attention to *User Stories*, *Testing Decisions*, and *Out of Scope*.
3. **Read the committed interfaces.**
4. **Read existing tests** to match style: how setup is done, how fixtures live, how testcontainers are used (if applicable), how assertions are phrased.
5. **Plan the test set** before writing anything. Surface the plan to the user as a brief outline:
   - Integration tests grouped by user story or capability.
   - Unit tests *only* for genuinely tricky pure logic (per the policy below).
   - Notes on testcontainers, fixtures, or test-data setup.
6. **Iterate on the plan.** The user may add cases, remove redundant ones, or rebalance integration vs unit coverage.
7. **Write the tests** under the locked-tests path once the plan is approved. Each test must:
   - Be in red (fail when run, but for the right reason — i.e. missing implementation, not syntax error).
   - Reference the user story number in a comment or name.
   - Use the project's existing fixture and setup conventions.
8. **Run the tests** to confirm they're red. Show the output to the user.
9. **Stage with `git add`.** Do not commit.

## Integration vs unit test policy

This is the part you must get right. The user has strong opinions; respect them.

**Integration tests** verify end-to-end behaviour through real boundaries. Database writes happen against a testcontainer; HTTP calls hit a real local server. They test the *system*, not its parts.

- *Default*: every user story gets at least one integration test.
- *Coverage*: integration tests must assert on persisted data, not just request/response shapes.

**Unit tests** verify gnarly logic in isolation. They are *not* per-issue verification scaffolding — they exist only when:

- The logic is pure (no I/O) and combinatorially complex (many input cases worth enumerating), OR
- The logic has error paths that integration tests cannot cheaply trigger.

If neither applies, do *not* write a unit test. Resist the temptation to add unit tests "for symmetry" or "for coverage." Bloat is the failure mode here.

When you do write unit tests, prefer parameterised tables over many separate test functions — one named test with 30 cases is cleaner than 30 tests with one case each.

## Test naming and structure

- Test name must clearly describe the behaviour, not the implementation. Bad: `test_user_service_save_calls_repository`. Good: `test_creates_user_with_valid_email`.
- Group tests by user story or capability, not by interface or class.
- Reference user story numbers in test comments or docstrings:

```python
def test_creates_user_with_valid_email():
    """Serves user story #1."""
    ...
```

## Tests must be red for the right reason

Before staging, run the suite. Acceptable red states:

- Test fails because the implementation function returns a default/stub value.
- Test fails because the function raises `NotImplementedError` or equivalent.

Unacceptable red states:

- Test fails because of a syntax error in the test.
- Test fails because of a missing import.
- Test fails because of a typo in an interface reference.

Fix anything in the second category before considering the work done.

## What goes where

- **`tests/locked/integration/<feature>/`** — integration tests, one or more files per feature, organised by capability.
- **`tests/locked/unit/<area>/`** — unit tests for tricky pure logic, only when warranted.
- The exact path comes from `planning-config.md`. Use it; do not invent.

## What you do not do

- Do not write implementations. The agent does that.
- Do not modify interfaces. If an interface is wrong, surface it; the user fixes it via `/design-interfaces`.
- Do not write tests outside the locked-tests path. The lock is structural; tests outside it are not protected.
- Do not commit. The user commits.
- Do not invoke other skills.
- Do not write tests for behaviours not in the PRD's user stories. If a test seems necessary but no story covers it, ask the user to update the PRD first.

## Edge cases

- **PRD describes behaviour that's hard to test at the integration level.** Surface this — it's usually a sign the PRD is over-specified or the architecture isn't testable at that boundary. Discuss before writing the test.
- **Existing tests already cover some of the new stories.** Reference the existing tests in the issue mapping later (during `/to-issues`) but do not duplicate.
- **Testcontainers dependency.** If integration tests need a database or service via testcontainers, set up the fixture once and reuse. Do not spawn containers per test.
