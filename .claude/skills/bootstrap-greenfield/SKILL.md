---
name: bootstrap-greenfield
description: Initialise a new repository with the planning workflow structure — write planning-config.md, set up empty docs/adr and docs/prds directories, src/interfaces and tests/locked placeholder directories, the .gitignore additions, and optionally a Dockerfile.sandcastle skeleton. Assumes the workflow files (CLAUDE.md, AGENTS.md, CONTEXT.md, templates, skills) already exist from cloning the starter. Use when starting a new repo from scratch and the user wants to fill in project-specific configuration, mentions "bootstrap", "init", "new project setup", or asks to scaffold the project-specific workflow files.
---

# bootstrap-greenfield

Fill in project-specific configuration for a freshly-cloned starter. Idempotent: if a target file already exists, skip it with a notice rather than overwrite.

## When to invoke

The user has cloned the planning-workflow starter into a new project directory and wants to fill in the project-specific bits. The starter's invariant files (`CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`, `docs/templates/`, `.claude/skills/`) already exist.

## Preconditions

1. **Working tree is clean** — refuse if there are uncommitted changes.
2. **Current branch is `main`** (or the project's default branch). If on a feature branch, suggest switching to `main` first.
3. **The starter files are present.** Verify `CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`, `docs/templates/prd.md`, `docs/templates/adr.md`, `docs/templates/issue.md`, and `.claude/skills/` all exist. If any are missing, refuse and tell the user the starter looks incomplete.

## What you do

### Phase 1: Interview (small)

Ask the user, one at a time, only the questions you can't answer from the repo itself:

1. **Language** — what language is this project in? (Python, TypeScript, Rust, Go, …)
2. **Test runner** — which one? (pytest, vitest, jest, go test, cargo test, …)
3. **Package manager** — only if relevant (npm/pnpm/yarn for JS, pip/poetry/uv for Python, …).
4. **Issue tracker** — GitHub Issues by default. Ask if otherwise.
5. **Label vocabulary** — confirm defaults or override:
   - `ready-for-afk` (the AFK pickup label)
   - `in-progress`
   - `needs-human`
   - `feature: feat-*` (per-feature label)
   - `priority-N` (priority labels)

Each question gets a sensible default; only ask if the default isn't obviously right.

### Phase 2: Show the plan

Before writing anything, show the user:

- The list of files to create.
- The list of files that already exist and will be left alone.
- The proposed contents of `.claude/planning-config.md` (the most consequential output).

Wait for confirmation.

### Phase 3: Write

Once confirmed, create:

1. **`.claude/planning-config.md`** — repo-specific values. See template below.
2. **`docs/adr/.gitkeep`** — ensures the directory is tracked.
3. **`docs/prds/.gitkeep`** — same.
4. **Locked directories** with `.gitkeep`:
   - `<locked-interfaces-path>/.gitkeep`
   - `<locked-tests-path>/.gitkeep`
   The paths come from `planning-config.md`. Defaults: `src/interfaces/` and `tests/locked/`.
5. **`.gitignore` additions** (append, don't overwrite):
   ```
   # Sandcastle
   .sandcastle/logs/
   .sandcastle/worktrees/
   .sandcastle/.env
   .sandcastle/baseline.txt
   ```
   If `.gitignore` doesn't exist, create one with these entries.
6. **An initial ADR**: `docs/adr/001-adopt-planning-workflow.md` recording the decision to use this workflow. This gives future-you the reason and serves as a worked example of the ADR format.

### Phase 4: Optional extras

Ask the user whether they want any of:

- **Pre-push hook stub** — `scripts/hooks/pre-push.sh` with the protected-paths check (commented-out, ready to enable when the AFK loop is wired up). Wire-up happens later via `package.json prepare` or equivalent.
- **Sandcastle skeleton** — `.sandcastle/main.mts` and `.sandcastle/prompt.md` placeholders. Keep these minimal — full Sandcastle setup is out of scope for the planning side.
- **GitHub label seed script** — `scripts/setup-labels.sh` that calls `gh label create` for each canonical label.

Do each only if requested.

### Phase 5: Commit suggestion

Stage all created files with `git add` but do *not* commit. Suggest a commit message:

```
chore: bootstrap planning workflow

- planning-config.md with project-specific values
- empty docs/adr, docs/prds, src/interfaces, tests/locked
- ADR-001 recording the workflow adoption
- gitignore additions for .sandcastle/
```

Let the user commit when ready.

## planning-config.md template

```markdown
# Planning skills configuration

This file is the source of truth for project-specific values that the planning skills read. Edit it directly when conventions change.

## Project structure

- Language: <language>
- Test runner: <runner>
- Test ID format: <e.g. pytest `path::test_name`, vitest `path -t "name"`>
- Package manager: <if relevant>

## Locked paths

- Locked tests: `tests/locked/**`
- Locked interfaces: `src/interfaces/**`

## Documentation paths

- ADRs: `docs/adr/`
- PRDs: `docs/prds/`
- Domain glossary: `CONTEXT.md`

## Issue tracker

- Type: GitHub Issues
- CLI: `gh`
- Labels:
  - `ready-for-afk` — issue ready for AFK pickup
  - `in-progress` — claimed by an AFK run
  - `needs-human` — blocked, requires human attention
  - `feature: feat-*` — per-feature grouping
  - `priority-N` — sequencing within a feature

## Branching

- Default branch: `main`
- Feature branches: `feat-*`
- Per-issue branches (created by AFK orchestrator): `agent/issue-N`

## Conventions

- One ADR per decision; filename `docs/adr/NNN-<slug>.md` (zero-padded 3-digit number).
- One PRD per feature; filename `docs/prds/<feature-name>.md` matching branch.
- Issue title format: `feat: <summary>` / `fix: <summary>` / `chore: <summary>`.
- Commit format: `<type>(<scope>): <summary>` (or project-local equivalent).
```

## Idempotency

Re-running this skill on a partially-bootstrapped repo:

- Already-present files are left alone with a notice.
- Missing files are added.
- The interview only asks about values that aren't already in `planning-config.md`.

If `planning-config.md` already exists, ask the user whether to merge new values or skip — never overwrite.

## What you do not do

- Do not modify `CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`, `docs/templates/`, or `.claude/skills/`. Those come from the starter and are the user's to edit.
- Do not initialise git or create the first commit — the user does this.
- Do not install dependencies or generate language-specific files (`package.json`, `pyproject.toml`, etc.) — that's outside this skill's scope.
- Do not invoke other skills.
- Do not commit.
