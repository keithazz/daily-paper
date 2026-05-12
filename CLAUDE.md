# CLAUDE.md

Audience: **Claude Code during interactive planning sessions.**
Not for: the AFK agent inside Sandcastle (see `AGENTS.md` instead).

## What this repo is doing

This repo uses a *plan-first, agent-codes* workflow. A frontier model (Claude Code) handles planning interactively with the user. An AFK agent (Pi running locally) handles implementation in a sandbox.

The planning phase produces durable artefacts:

- `docs/prds/feat-X.md` — user-facing contract for a feature.
- `docs/adr/NNN-<title>.md` — architectural decisions, one per file.
- `CONTEXT.md` — domain glossary, updated inline.
- `src/interfaces/**` — technical contract as type signatures.
- `tests/locked/**` — integration tests (and selective unit tests) in red.
- GitHub issues with the structured template, labelled `ready-for-afk`.

The AFK agent then picks up issues and makes the locked tests pass. It never edits files under `src/interfaces/**` or `tests/locked/**`.

## What you (Claude Code) do during planning

- **Discuss, propose, push back.** The user is a senior engineer; argue your position when you disagree.
- **Run skills when invoked, not preemptively.** The user calls skills by name. Don't auto-invoke `to-prd` because you sense the conversation is winding down.
- **Refuse skills with missing preconditions.** If `design-interfaces` is invoked but no PRD exists, refuse and say what's missing. Don't paper over the gap.
- **Read existing artefacts before adding new ones.** Before proposing changes to `CONTEXT.md`, read it. Before writing an ADR, check `docs/adr/` for related decisions.
- **Stay above implementation level in PRDs.** No file paths, no code, no library names in `docs/prds/`. That detail belongs in interfaces and tests.

## What you do **not** do during planning

- Do **not** write production code. Implementation is the AFK agent's job.
- Do **not** write tests inside source directories — tests live under `tests/locked/**` only, and only via `write-failing-tests`.
- Do **not** modify files outside `docs/`, `CONTEXT.md`, `src/interfaces/**`, `tests/locked/**`, and `.claude/` during planning.
- Do **not** open issues outside the `to-issues` skill — the structured template is load-bearing.
- Do **not** push, force-push, or commit to `main` without explicit confirmation each time.
- Do **not** auto-invoke skills. The user invokes them when they're ready.

## Skills

All skills live under `.claude/skills/<skill-name>/SKILL.md`. They are flat and ad-hoc — the user invokes them in whatever order makes sense. There is no orchestration, no chaining, no hooks.

| Skill                  | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `bootstrap-greenfield` | Scaffold a new project's planning-config and empty directories.    |
| `bootstrap-brownfield` | Discover an existing repo and adopt the workflow without clobber.  |
| `grill-me`             | Stress-test a feature idea with relentless interview.              |
| `update-context`       | Add or refine domain terms in `CONTEXT.md`.                        |
| `write-adr`            | Capture one architectural decision as a numbered ADR.              |
| `to-prd`               | Synthesise the conversation into `docs/prds/feat-X.md`.            |
| `design-interfaces`    | Propose and commit interfaces under `src/interfaces/`.             |
| `write-failing-tests`  | Propose and commit failing tests under `tests/locked/`.            |
| `to-issues`            | Slice PRD + interfaces + tests into vertical issues via `gh`.      |

## Branching during planning

Planning happens on a feature branch named `feat-X`. The first action of any planning session for a new feature should be `git checkout -b feat-X` from `main`. Skills detect the current branch with `git branch --show-current` and use that as the implicit feature name; they refuse to run on `main`.

## Where project-specific values live

`.claude/planning-config.md` holds repo-specific paths, label vocabulary, test-runner conventions. Skills read it. The bootstrap skills create it. Edit it directly if a value changes.

## When in doubt

If a request looks like it should produce production code, implementation files outside the locked directories, or actions outside the planning surface, stop and ask. The discipline of *plan completely, then hand off* is what makes the AFK side viable.
