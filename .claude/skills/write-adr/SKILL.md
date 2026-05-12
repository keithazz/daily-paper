---
name: write-adr
description: Capture a single architectural decision from the current conversation as docs/adr/NNN-title.md using the standard ADR template (Status, Context, Decision, Alternatives Considered, Consequences). One ADR per decision — refuses to combine multiple decisions into one file. Use when a non-obvious technical choice has been resolved during planning, when the user mentions "write an ADR", "ADR this decision", "capture this as an ADR", or after a grilling session that resolved a meaningful architectural tradeoff.
---

# write-adr

Capture exactly one architectural decision as a numbered ADR file at `docs/adr/NNN-<slug>.md`.

## When to invoke

A non-obvious technical decision has been made during the conversation. Indicators:

- Alternatives were weighed and one was chosen.
- The decision will be hard to reverse later.
- Future-you (or another agent) might re-litigate it without context.
- The reasoning won't be obvious from looking at the resulting code.

If a decision is *obvious* (e.g. "we'll use the language's standard library JSON parser"), it doesn't need an ADR.

## What you do

1. **Read the existing `docs/adr/` directory** to:
   - Determine the next number (highest existing N + 1; pad to 3 digits: `001`, `002`, `042`).
   - Check whether this decision has already been recorded — if so, propose updating the existing ADR instead of creating a new one.
   - Check for related decisions to cross-reference.

2. **Read `docs/templates/adr.md`** for the canonical format.

3. **Identify the decision precisely.** A single ADR records *one* decision. If the conversation resolved several distinct decisions, refuse to combine them — propose writing them as separate ADRs and ask the user which to start with.

4. **Draft the ADR** by extracting from the conversation:
   - **Title** — declarative, present tense ("Use Postgres for persistence", not "Persistence layer").
   - **Status** — `proposed` unless the user says otherwise.
   - **Context** — the forces and constraints that shaped the decision. Two or three paragraphs.
   - **Decision** — clear declarative sentence, then elaboration.
   - **Alternatives Considered** — the options weighed. For each: what it was, why rejected. *This is the highest-value section.*
   - **Consequences** — positive outcomes and accepted trade-offs.

5. **Show the draft to the user.** Wait for revisions.

6. **Write to `docs/adr/NNN-<slug>.md`.** The slug is kebab-case, derived from the title.

7. **Stage the file** with `git add` but do not commit — the user controls commits during planning.

## Filename convention

`docs/adr/NNN-<slug>.md` where `NNN` is zero-padded to 3 digits and `<slug>` is the kebab-case title.

Examples:
- `docs/adr/001-use-postgres-for-persistence.md`
- `docs/adr/014-adopt-repository-pattern-over-active-record.md`

## Refusing to combine decisions

If the user asks "ADR for the Postgres + repository-pattern + queue choices we made," respond:

> Those are three separate decisions. I'll write three ADRs — one each. Which would you like first?

Combined ADRs lose the value of the *Alternatives Considered* section because each decision had different alternatives.

## Cross-references

If the new ADR relates to existing ones — supersedes, refines, depends on, or constrains them — add a *Related* line in the front matter and a sentence in the Context section pointing at the related ADR. If the new ADR *supersedes* an existing one, also update the old ADR's status to `superseded by ADR-NNN`.

## What you do not do

- Do not write more than one ADR per invocation.
- Do not invent alternatives the conversation didn't actually consider.
- Do not commit. The user commits.
- Do not invoke other skills.
- Do not include code or file paths in the ADR — keep it at the architectural level. (Ground-level technical contract goes in interfaces and tests.)
