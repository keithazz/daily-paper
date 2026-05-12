---
name: grill-me
description: Interview the user relentlessly about a feature plan or design decision until every branch of the decision tree is resolved, providing a recommended answer for each question. Use this whenever the user wants to stress-test a plan, get grilled on their design, pressure-test an idea, mentions "grill me", "grill this plan", "interrogate the plan", or expresses uncertainty about whether they've thought through a feature thoroughly enough before writing it down.
---

# grill-me

Interview the user about their feature idea until shared understanding is reached and every meaningful branch of the decision tree has a resolved answer.

## When to invoke

The user has a rough feature idea or partially-formed plan. They want it pressure-tested before committing it to a PRD. They may have just finished an exploratory chat and want gaps surfaced.

## What you do

Walk down the decision tree one branch at a time. For each branch:

1. Identify the most important unresolved question on this branch.
2. State your recommended answer with one or two sentences of reasoning.
3. Ask the user the question.
4. Wait for the answer. Do not batch multiple questions.
5. When the answer is given, recurse: does this answer open new sub-questions?

Continue until the user says they are satisfied or you cannot find any further unresolved questions of substance.

## What to grill on

Order roughly by importance. Skip what's already settled.

- **User value**: who is this for, what problem does it solve, what does success look like for them?
- **Scope boundary**: what's in, what's out, what's tempting-but-out?
- **Failure modes**: what happens when input is malformed, when a dependency is down, when concurrent operations race?
- **Data model**: what entities are involved, what invariants must hold, what state transitions are valid?
- **Domain vocabulary**: are there terms here that aren't yet in `CONTEXT.md`? Terms being used inconsistently?
- **Technical decisions of consequence**: choices that would warrant an ADR (database, framework, sync vs async, library selection).
- **Testing approach**: what's testable at the boundary, what needs unit-level coverage, what testcontainers are needed?
- **Reversibility**: how hard would it be to change this decision later?
- **Out-of-scope follow-ups**: things that came up but should be tracked separately.

## How to phrase questions

Make recommendations explicit, not hedged. The user can always disagree — but a question with no proposed answer wastes their time.

Bad: "How should we handle authentication?"
Good: "I'd recommend session cookies over JWT for this — server-side revocation is trivial and we don't need cross-domain. Do you agree, or is there a constraint I'm missing?"

Bad: "What about errors?"
Good: "On a downstream timeout, my recommendation is to fail fast with a 503 and let the client retry rather than queue internally — keeps state simple. Does that match your thinking?"

## What to surface as you go

While grilling, note (mentally or out loud) anything that looks like:

- A new domain term → suggest invoking `/update-context` after the session.
- A non-obvious architectural decision being resolved → suggest invoking `/write-adr` for it.
- A scope boundary worth recording → flag it for the PRD's "Out of Scope" section.

Do **not** invoke those skills yourself. The user invokes skills. You surface candidates.

## When to stop

Stop when one of:

- The user says they're satisfied.
- You cannot identify any further question of substance — every branch has a recommendation the user has accepted or revised.
- The conversation has clearly drifted into implementation detail (which belongs in interface design, not planning).

## What you do not do

- Do not write the PRD. That's `/to-prd`.
- Do not write ADRs inline. That's `/write-adr` after the grilling is over.
- Do not propose code, file paths, or module names. Stay above the implementation level.
- Do not ask multiple questions at once. One at a time.
