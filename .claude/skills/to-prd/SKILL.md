---
name: to-prd
description: Synthesise the current planning conversation into a Product Requirements Document at docs/prds/feat-X.md using the canonical template (Problem, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope). No interview — uses what has already been discussed in the conversation context. Stays above the implementation level — no file paths, no code, no library names. Use when the user has finished discussing a feature and wants the conversation captured as a PRD, mentions "write the PRD", "capture as PRD", "PRD this", or after a grilling session is complete.
---

# to-prd

Synthesise the current conversation into a PRD at `docs/prds/feat-<name>.md`.

## When to invoke

The user has discussed a feature thoroughly (often with `/grill-me`) and wants the result committed as a durable artefact. The PRD captures *user-facing intent*, not technical details.

## Preconditions — refuse if missing

1. **The current branch must be a feature branch** named `feat-<name>`. Detect via `git branch --show-current`. If on `main`, refuse and ask the user to `git checkout -b feat-<name>` first.
2. **The conversation must contain enough substance to synthesise.** If the conversation is thin (e.g. one or two messages), refuse and suggest `/grill-me` first.
3. **The PRD must not already exist** at `docs/prds/feat-<name>.md`. If it exists, ask the user whether to revise the existing file or start over (and which sections they want updated).

## What you do

1. **Identify the feature name** from the current branch (`feat-<name>` → `<name>`).
2. **Read `docs/templates/prd.md`** for the canonical structure.
3. **Read `CONTEXT.md`** so the PRD uses the project's vocabulary correctly.
4. **Read existing ADRs** under `docs/adr/` whose subjects came up in the conversation. Reference them in *Implementation Decisions* rather than restating their content.
5. **Synthesise** — do not interview. Use only what has already been discussed.
6. **Show the draft.** Wait for the user to revise.
7. **Write to `docs/prds/feat-<name>.md`** once approved.
8. **Stage the file** with `git add` but do not commit.

## What goes where in the PRD

- **Problem** — the user's pain or unmet need. From the user's perspective. One or two paragraphs.
- **Solution** — what changes for the user when this ships. Still from the user's perspective. No file paths, no module names.
- **User Stories** — exhaustive numbered list. Format: *As a <role>, I want <capability>, so that <outcome>.* Cover happy paths, error paths, edge cases, admin/operator scenarios. The numbering is load-bearing — tests and issues will reference stories by number.
- **Implementation Decisions** — choices made during planning that constrain the work. Reference ADRs for rationale; do not restate it. No file paths or code.
- **Testing Decisions** — which behaviours go in integration tests vs unit tests, what's tested at the boundary, anything explicitly not worth testing.
- **Out of Scope** — what could look related but isn't. Each item references a follow-up where applicable.
- **Open Questions** — things still unresolved that don't block opening issues but need answering during implementation.

## Hard rules on content

- **No file paths** in the PRD. Not `src/services/foo.ts`, not even `services/foo`.
- **No code** in the PRD. Not snippets, not pseudocode, not type signatures.
- **No library or framework names** unless they're foundational architectural decisions captured in ADRs (in which case reference the ADR rather than naming the library).
- **No "the agent will…"** — the PRD describes the *system*, not how it gets built.

If you find yourself wanting to violate these rules, the content belongs in interfaces, tests, or an ADR — not the PRD.

## User stories must be exhaustive

The single most common failure mode for PRDs is a short user-stories list. The agents downstream will only know to handle cases that appear here. Aim for 10–30 stories for a meaningful feature.

Cover:

- Happy paths for each user role.
- Validation and rejection paths ("As a system, I want to reject invalid X, so that data integrity is preserved").
- Error and timeout paths.
- Admin/operator scenarios (logging, debugging, configuration).
- Cross-cutting concerns relevant to the feature (rate limiting, audit, etc., where in scope).

If the conversation didn't cover enough cases to populate the list, surface the gaps to the user and suggest a follow-up `/grill-me` before writing the PRD.

## What you do not do

- Do not interview. If the conversation is too thin, refuse and suggest `/grill-me`.
- Do not invoke other skills.
- Do not write to ADR or CONTEXT.md from this skill — those have their own skills.
- Do not commit. The user commits.
- Do not produce the PRD without showing a draft for review first.
