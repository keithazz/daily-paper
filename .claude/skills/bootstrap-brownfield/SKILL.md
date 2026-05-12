---
name: bootstrap-brownfield
description: Adopt the planning workflow on an existing repository through discovery and negotiation. Reads what's already in the repo (test runner, file layout, docs, hooks, labels), asks targeted questions only about gaps and ambiguities, writes a bootstrap plan for review, and only creates missing files after explicit confirmation. Never modifies existing content without asking. Use when adding the workflow to an existing codebase, retrofitting the planning structure onto a project that already has files, or when the user mentions "bootstrap existing repo", "adopt workflow", "retrofit the workflow".
---

# bootstrap-brownfield

Adopt the planning workflow on a repo that already has structure, opinions, and conventions. The cardinal rule: **discover, propose, confirm, then write**. Never silently overwrite.

## When to invoke

The user has copied or cloned the workflow files (`CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`, `docs/templates/`, `.claude/skills/`) into an existing repo and wants to adopt the workflow without disrupting what's already there.

## Preconditions

1. **Working tree is clean.** Refuse if there are uncommitted changes the user might lose.
2. **A separate setup branch is in use.** Create one with `git checkout -b setup/planning-workflow` if not already on one. This way the user can discard the bootstrap entirely with `git checkout main && git branch -D setup/planning-workflow`.
3. **The starter files are present.** Verify `CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`, `docs/templates/*`, and `.claude/skills/` exist. If any are missing, refuse and tell the user the starter is incomplete.

## Phase 1: Discovery (read-only)

Investigate the repo and form hypotheses. Do not write anything yet.

### Test runner detection

Look for, in order:

- `package.json` → check `devDependencies` for vitest, jest, mocha; check `scripts.test` for invocation.
- `pyproject.toml` / `pytest.ini` / `setup.cfg` → pytest, sometimes unittest.
- `Cargo.toml` → cargo test.
- `go.mod` → go test.
- `Gemfile` → rspec.
- `*.csproj` / `*.fsproj` → dotnet test.
- Other language signals as relevant.

Note the test ID format implied by the runner.

### Existing test layout

Glob for:

- `tests/**`, `test/**`
- `**/*.test.{ts,tsx,js,jsx}`, `**/*.spec.{ts,tsx,js,jsx}` (JS conventions)
- `**/test_*.py`, `**/*_test.py` (Python conventions)
- `**/__tests__/**`
- `**/*_test.go` (Go convention)

Report what you find. The locked-tests path needs to coexist with the existing convention, not fight it.

### Existing interfaces convention

Look for:

- A `src/interfaces/` directory (already matches our convention).
- TypeScript files matching `*.interface.ts`, `*.types.ts`, `types/`.
- Python `Protocol` definitions, `abstract` classes.
- Go `interface` declarations.

If interfaces aren't a clear pattern in this codebase, surface that — your locked-interfaces path may need to be different (e.g., a list of specific files, or a `*.interface.ts` glob).

### Existing docs

Look for:

- `docs/`, `documentation/`, `wiki/`.
- `ARCHITECTURE.md`, `DESIGN.md`, `CONTRIBUTING.md` at repo root.
- ADR-like files anywhere (`docs/adr/`, `docs/architecture/decisions/`, `adr/`).
- Existing `CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`. **Read these in full** if present.

### Hooks already in place

Look for:

- `.git/hooks/` — existing custom hooks.
- `.husky/` — Husky setup.
- `.pre-commit-config.yaml` — pre-commit framework.
- `lefthook.yml` — Lefthook.

Your test-protection mechanism must coexist with these, not replace them.

### Issue tracker and labels

- `gh repo view` succeeds → GitHub. `git remote -v` shows GitLab → propose GitLab. Other → ask the user.
- `gh label list` (or equivalent) → enumerate existing labels. Match canonical roles to existing labels where possible.

### Build a discovery report

Produce a short markdown report listing:

```
## Discovery report

### Detected
- Language: <X>
- Test runner: <X>
- Test layout: <description>
- Interfaces convention: <description or "no clear pattern">
- Existing docs: <list>
- Hooks: <list or "none">
- Issue tracker: <X>
- Existing labels matching workflow roles: <list>

### Files already present (will not modify)
- <file>: <reason — e.g., "user-authored CLAUDE.md, will be merged into rather than replaced">

### Gaps (will need values from you)
- <gap>: <why we need this>

### Conflicts (will ask before resolving)
- <conflict>: <e.g., "tests/ exists with conventions that don't fit tests/locked/ — three options...">
```

Surface this to the user.

## Phase 2: Targeted negotiation

Only ask about gaps and conflicts. Each question takes one line, has 2–4 options or a default, and waits for an answer.

Examples of the right kind of question:

- *"Your repo has tests under `__tests__/` directories. Three options for the locked-tests path: (a) `__tests__/locked/` co-located, (b) top-level `tests/locked/`, (c) skip locked-tests, just protect by name pattern. Which?"*
- *"You have an existing `CLAUDE.md`. Three options: (a) merge new content into it, showing you the diff first, (b) move it to `CLAUDE.local.md` and replace with the workflow version, (c) skip — keep yours, don't add ours. Which?"*
- *"Your repo has `docs/adr/` already with 3 ADRs. The next number would be 004. Confirm?"*
- *"`gh label list` doesn't show `ready-for-afk`. Create it now, or use a different label name you already have?"*

The principle: every question has stakes the user understands and a default the skill is willing to take if the user doesn't care.

## Phase 3: Write the plan

After discovery and negotiation, write a *plan file* at `.claude/bootstrap-plan.md`:

```markdown
# Bootstrap plan

Run on: <date>
Branch: setup/planning-workflow

## Files to create
- `<path>` — <reason>

## Files to merge (with proposed diff)
- `<path>` — show the diff explicitly

## Files to leave alone
- `<path>` — <reason>

## Decisions made
- Test runner: <X>
- Locked-tests path: <X>
- ...

## Outstanding TODOs
- <thing the user needs to do manually>
```

Show this plan to the user. **Do not write any other files yet.** Wait for explicit confirmation.

## Phase 4: Execute

Once confirmed:

1. Write each new file as planned.
2. For merges, apply the diff and show the result.
3. Append `.gitignore` entries (do not overwrite an existing `.gitignore`).
4. Stage everything with `git add`.
5. Leave `.claude/bootstrap-plan.md` in place as a record.
6. **Do not commit.** Suggest a commit message and let the user commit on the setup branch.

## Conservative defaults

When in doubt, *do less*:

- If you can't determine a value confidently, write a placeholder in `planning-config.md` with a `TODO:` comment rather than guessing.
- If a file exists with content that looks important and unrelated to the workflow, skip it and tell the user.
- If a file exists with content that overlaps the workflow's intent, prefer merging over replacing — and show the merge diff before applying.

It is **always better** to leave a config field marked `TODO` than to guess and silently get it wrong. The user will fill in TODOs in 30 seconds. They cannot un-clobber a corrupted file as easily.

## Idempotency

Re-running this skill on a partially-bootstrapped repo:

- Discovery still runs in full (the repo state may have changed).
- The plan only includes the gaps that remain.
- Files already correct are left alone with a notice.

If interrupted mid-Phase-4, re-running picks up from where it stopped without redoing already-applied changes.

## Hard rules

- **Never modify a non-empty file without showing the diff first.**
- **Never delete user files.**
- **Never run `git commit` or `git push`.**
- **Never overwrite `CLAUDE.md`, `AGENTS.md`, or `CONTEXT.md` if they already exist** — propose merges instead.

## What you do not do

- Do not invoke other skills.
- Do not initialise git or change the default branch.
- Do not install dependencies.
- Do not configure CI.
- Do not commit.
