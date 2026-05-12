# PRD: <feature-name>

> **Feature branch**: `feat-<name>`
> **Status**: draft | accepted | shipped | superseded
> **Author**: <you>
> **Date**: YYYY-MM-DD

## Problem

The problem this feature addresses, from the user's perspective. One or two paragraphs. State the user's pain or unmet need before any solution language.

## Solution

The solution, also from the user's perspective. What changes for the user when this ships? Stay above the implementation level — no file paths, no code, no library names. If you find yourself naming modules here, move that content to the Implementation Decisions section.

## User Stories

A long, numbered list. Each story in the form: *As a <role>, I want <capability>, so that <outcome>.*

The numbering is load-bearing — tests and issues reference stories by number. Be exhaustive; cover happy paths, error paths, edge cases, and admin/operator scenarios where relevant.

1. As a <role>, I want <capability>, so that <outcome>.
2. As a <role>, I want <capability>, so that <outcome>.
3. ...

## Implementation Decisions

Decisions made during planning that constrain how the work is done, but stop short of file-level detail. Reference ADRs for the rationale where relevant.

- Decision: <what was decided>. See `docs/adr/NNN-<title>.md` for rationale.
- Decision: <what was decided>.

Do **not** include specific file paths, module names, or code snippets here — they go stale fast. The interfaces and tests are the file-level contract.

## Testing Decisions

What good testing looks like for this feature. Cover:

- Which behaviours are covered by integration tests vs unit tests, and why.
- What's tested at the boundary of the system vs internally.
- Anything specifically *not* worth testing (and why).
- Test data conventions, fixtures, or testcontainers requirements.

## Out of Scope

Explicitly list things that might look like they belong but don't. Each item should reference a follow-up issue or PRD where applicable.

- <thing not in scope> — tracked in #<issue> / `docs/prds/<other>.md` / not yet tracked.
- <thing not in scope>.

## Open Questions

Things still unresolved that don't block opening issues but may need answering during implementation. Resolve and remove before marking the PRD `accepted`.

- <question>
