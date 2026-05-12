# Planning skills configuration

This file is the source of truth for project-specific values that the planning skills read. Edit it directly when conventions change.

## Project structure

- Language: TypeScript
- Test runner: Jest (unit/integration), Playwright (e2e)
- Test ID format: Jest — `<path> -t "<test name>"`; Playwright — `<path>:<line>`
- Package manager: npm

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
- Commit format: `<type>(<scope>): <summary>`.
