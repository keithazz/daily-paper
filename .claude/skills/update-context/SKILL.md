---
name: update-context
description: Surface domain terms from the current conversation that need adding to or refining in CONTEXT.md, propose changes, and update the file inline. Idempotent and safe to run multiple times during a long planning session. Use whenever the user has been discussing domain concepts and wants the glossary updated, mentions "update context", "add this to the glossary", "CONTEXT.md update", or when domain vocabulary has shifted during a grilling session.
---

# update-context

Update `CONTEXT.md` with domain terms that have surfaced or sharpened during the conversation.

## When to invoke

After a grilling session, after a domain discussion, or any time the user notices vocabulary drift. This is intentionally a small, focused skill — run it often rather than letting `CONTEXT.md` go stale.

## What you do

1. **Read the current `CONTEXT.md`** to know what's already defined and in what shape.
2. **Scan the recent conversation** for:
   - New terms that have been used with specific meaning.
   - Existing terms whose definition has been refined or contested.
   - "Avoid" candidates — alternative words that were rejected in favour of a canonical one.
   - Resolved ambiguities — cases where a term used to be ambiguous and the conversation resolved it.
3. **Propose a diff to the user**: list the additions, refinements, and "Avoid" entries you'd make. State each as a short bullet. Do not write to the file yet.
4. **Wait for confirmation or edits.** The user may accept all, accept some, or rewrite the proposed entries.
5. **Update `CONTEXT.md`** with the agreed changes, preserving the existing format (term in bold, definition, "Avoid" list).

## Format reminder

The format `CONTEXT.md` uses:

```
**Term**: definition. Avoid: <alternative>, <alternative>.
```

For terms with cross-references:

```
**Term**: definition. See ADR-NNN for rationale. Avoid: <alternative>.
```

For resolved ambiguities, add a line under the "Resolved ambiguities" section at the bottom.

## What you do not do

- Do not invent terms the user hasn't actually used or implied.
- Do not rewrite definitions that haven't been challenged.
- Do not remove existing terms without explicit instruction.
- Do not move terms into new groupings without asking.
- Do not invoke other skills (`write-adr`, `to-prd`) — flag candidates and let the user decide.

## Edge cases

- **No new terms found.** Tell the user the glossary already covers what's been discussed; suggest `/grill-me` if they think something's missing but unnamed.
- **Conflicting definitions.** A term in `CONTEXT.md` doesn't match how it's been used in the conversation. Surface the conflict explicitly: "The conversation has been using *Customer* to mean X, but `CONTEXT.md` defines it as Y. Which is right?"
- **Term that should really be an ADR.** If a term's definition encodes a non-trivial architectural decision (e.g. "Repository: our chosen persistence pattern…"), suggest the user run `/write-adr` for the decision and reference it from the term.

## Idempotency

Re-running this skill mid-session is safe. If nothing has changed, the proposed diff is empty and you say so.
