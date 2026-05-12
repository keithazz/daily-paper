# ADR-001: Adopt plan-first, agent-codes workflow

> **Status**: accepted
> **Date**: 2026-05-12
> **Deciders**: keith

## Context

The project is a Next.js 15 application (TypeScript, Prisma, BullMQ, Auth.js). Implementation work will be executed by an AFK agent (Pi running locally inside Sandcastle) rather than written interactively. This means there needs to be a disciplined handoff surface: the agent must know exactly what to build without back-and-forth with the human.

Without a structured planning phase, agent runs tend to drift in scope, produce inconsistent interfaces, and write tests that pass but don't reflect user intent. The planning artefacts (PRDs, ADRs, interfaces, locked tests) act as a contract that constrains the agent's degrees of freedom to exactly what was decided.

## Decision

We will use the plan-first, agent-codes workflow. A frontier model (Claude Code) handles all planning interactively with the user. The AFK agent handles all implementation. The handoff surface is: one PRD, committed interfaces under `src/interfaces/`, failing tests under `tests/locked/`, and vertical GitHub issues labelled `ready-for-afk`.

The AFK agent is not permitted to edit files under `src/interfaces/**` or `tests/locked/**`. Its only job is to make the locked tests pass.

## Alternatives Considered

### Alternative A: Fully interactive development

Write production code interactively with Claude Code, no AFK agent. Rejected because the Pi's AFK loop is cheaper and faster for mechanical implementation once the design is settled — and the human's time is better spent on decisions, not keystrokes.

### Alternative B: Unstructured AFK runs

Give the AFK agent a description and let it decide its own structure. Rejected because unconstrained agents over-engineer, under-test, and regularly misinterpret intent. Locked tests and interfaces eliminate the interpretation gap.

## Consequences

**Positive:**
- Clear separation between design decisions (human + Claude Code) and implementation (AFK agent).
- Locked interfaces and tests make scope creep visible immediately — if the agent can't make a test pass without changing a locked file, that's a signal, not a workaround.
- ADRs accumulate institutional memory that survives context resets.

**Negative / accepted trade-offs:**
- Planning takes longer upfront; there's no "just write it" escape hatch.
- The workflow adds overhead for trivial changes — a one-line fix still nominally requires a branch and an issue.

**Follow-ups:**
- Wire up Sandcastle for the AFK loop (tracked separately).
- Seed GitHub labels via `scripts/setup-labels.sh` once the repo is public.
