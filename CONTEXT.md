# CONTEXT.md

The domain glossary for this project. Skills and agents read this to use consistent vocabulary; humans read it to onboard quickly.

> **Maintenance**: updated inline by `/update-context` during planning sessions. Add terms as they're introduced; refine definitions as they sharpen. Each term has a definition and an "Avoid" list of alternatives that should *not* be used to mean the same thing — ambiguity in vocabulary is a leading cause of bugs in agent-written code.

## Format

Each entry follows this shape:

```
**Term**: definition. Avoid: <alternative-1>, <alternative-2>.
```

Group related terms under headings if the glossary grows large enough that it helps.

## Terms

<!--
  Replace these placeholder examples with real domain terms during your
  first /grill-me session. The format and the discipline of "Avoid:" lists
  is the load-bearing part — keep it.
-->

**<Term>**: <definition>. Avoid: <alternative>, <alternative>.

**<Term>**: <definition>. Avoid: <alternative>.

## Cross-references

Terms here may be elaborated in ADRs or PRDs. Link them from the term's definition where useful:

> **Repository**: a collection-like abstraction over persistence. See ADR-003 for our chosen pattern. Avoid: DAO, store, manager.

## Resolved ambiguities

When a term has been used loosely in the past and now has a fixed meaning, record the resolution at the bottom so the team's history is preserved:

> "user" was previously used to mean both authenticated principals and unauthenticated visitors — resolved: authenticated principals are *Customers*; unauthenticated visitors are *Visitors*; "user" is no longer used as a domain term.
