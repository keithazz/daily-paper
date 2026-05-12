---
name: design-interfaces
description: Read the PRD for the current feature and propose interface signatures (types, function shapes, module boundaries), iterate with the user, then write them to src/interfaces/ and stage for commit. Refuses to run without a PRD on the feature branch. Use when the user has a PRD and is ready to define the technical contract before writing tests, mentions "design interfaces", "write the interfaces", "interface design", or is starting the implementation phase of planning.
---

# design-interfaces

Translate the user-facing PRD into a technical contract under `src/interfaces/**`. This is where the user's architectural taste lives — propose, iterate, and only commit once the user is happy.

## When to invoke

The PRD is written and accepted. The user wants to commit the technical contract before any tests are written.

## Preconditions — refuse if missing

1. **Current branch is `feat-<name>`.** Detect via `git branch --show-current`. Refuse on `main`.
2. **PRD exists** at `docs/prds/feat-<name>.md`. If it doesn't, refuse and suggest `/to-prd`.
3. **Working tree is clean** (or only contains in-progress changes the user is aware of). Refuse if there are uncommitted changes that look like they should have been committed first; ask the user to commit or stash.

## What you do

1. **Read `.claude/planning-config.md`** for project paths, language, and conventions.
2. **Read the PRD** at `docs/prds/feat-<name>.md` in full.
3. **Read `CONTEXT.md`** to use the right vocabulary.
4. **Read relevant ADRs** referenced in the PRD's *Implementation Decisions*.
5. **Read existing interfaces** under `src/interfaces/**` to match style and avoid duplication.
6. **Read existing source code** at a high level — pattern, layering, naming conventions used elsewhere. Local models will follow patterns, so the interfaces should feel native to this codebase.
7. **Propose interfaces** as a draft for review:
   - Type definitions (entities, value objects, errors).
   - Function or method signatures the implementation will satisfy.
   - Module boundaries — which file each interface lives in.
   - Brief comments on each, referencing the user story or stories it serves.
8. **Iterate with the user.** They may push back on shapes, naming, granularity, file layout. This is the most important conversation in the planning phase — don't rush it.
9. **Write the interfaces** under `src/interfaces/**` once approved.
10. **Stage with `git add`** but do not commit. The user commits.

## What "interfaces" means in this codebase

Interpretation depends on the language. Read `.claude/planning-config.md` for the project's convention. Common cases:

- **TypeScript** — `interface`, `type`, abstract classes, possibly Zod schemas. Live under `src/interfaces/**` or wherever the project's convention puts them.
- **Python** — `Protocol`, `ABC`, dataclasses for value objects, or just typed function signatures.
- **Go** — `interface` declarations, struct definitions for value objects.
- **Rust** — `trait`, `struct`, `enum`.

The `src/interfaces/` directory is the *default* path; the actual path is whatever `planning-config.md` declares as the locked-interfaces pattern.

## Naming and shape principles

Surface these to the user for confirmation; don't impose them silently.

- **Errors are types, not strings.** Each failure mode the PRD describes gets a named error type the interface can reference.
- **Boundaries first, internals later.** The interface defines what crosses module boundaries. Implementation-internal helpers do not belong here.
- **Side effects in signatures.** If a method writes to disk, makes a network call, or mutates state, that should be visible in its name or return type (where the language supports it).
- **One interface per concept.** Resist combining multiple responsibilities into one type because they're "related."

## Reference user stories

Each interface should annotate which user stories it serves. A short comment is enough:

```ts
// Serves user stories #1, #2, #5
export interface UserService { ... }
```

This is what `to-issues` later uses to map issues to interfaces.

## What you do not do

- Do not write implementations. Only signatures, types, errors, and module boundaries.
- Do not write tests. That's `/write-failing-tests`.
- Do not write to files outside `src/interfaces/**` (or the project's equivalent locked-interfaces path).
- Do not commit. The user commits.
- Do not invoke other skills.
- Do not propose interfaces for things not covered by the PRD's user stories. If you want to add something, propose adding a story to the PRD first.

## Edge cases

- **The PRD is unclear about a behaviour.** Surface the ambiguity, propose your interpretation, ask the user to confirm or update the PRD before continuing. Do not silently fill the gap with an interface.
- **Multiple shapes are equally reasonable.** Present 2–3 alternatives concisely with trade-offs. Let the user pick. Do not pick silently.
- **Existing interfaces conflict with the new ones.** Surface the conflict. The user may want to refactor the existing interfaces (separate work) or align the new ones to match (less ideal but pragmatic).
