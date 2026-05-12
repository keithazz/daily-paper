# AFK side of the planning workflow

This document describes the AFK execution side — the pieces under `.sandcastle/`, `scripts/`, and `docs/runbooks/` that consume the issues produced by the planning skills.

For the planning side, see `CLAUDE.md` and `.claude/skills/`.

## What's here

```
.sandcastle/
├── Dockerfile             # sandbox image (Pi + your toolchain)
├── main.mts               # the v1 orchestrator — six-step loop
├── prompt.md              # what Pi sees per issue
├── models.json.example    # Pi → LM Studio config
├── .env.example           # orchestrator config
└── .gitignore             # ignores logs/, worktrees/, .env, etc.

scripts/
├── hooks/
│   └── pre-push.sh        # git hook: refuse pushes that touch protected paths
├── protected-paths.sh     # diff check (used by hook + optionally orchestrator)
└── setup-labels.sh        # one-time gh label creation

docs/runbooks/             # operator runbooks (empty by design — write on failure)
```

## v1 scope (deliberately minimal)

The orchestrator does six things and only six:

1. **Claim** — pick one `ready-for-afk` issue with the lowest `priority-N`.
2. **Parse** — extract `Acceptance Tests`, `Constraints`, `Feature` from the issue body.
3. **Run** — single Sandcastle `run()` with Pi against `agent/issue-N` forked from the feature branch.
4. **Verify** — host-side: run the acceptance tests, check exit code.
5. **Land** — squash-merge to the feature branch, close the issue.
6. **Fail gracefully** — any error labels the issue `needs-human` with a comment.

Things deliberately **not** in v1: regression sweep, review agent, auto-PR, retry, notifications, crash recovery, host-side bypass-proof protected-paths check. See the comment header in `main.mts`.

## Setup (per-repo, one-time)

```bash
# 1. Authenticate gh.
gh auth login

# 2. Seed the canonical labels.
scripts/setup-labels.sh

# 3. Install the pre-push hook (or wire via Husky/lefthook).
ln -s ../../scripts/hooks/pre-push.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push

# 4. Configure Pi for LM Studio.
cp .sandcastle/models.json.example .sandcastle/models.json
# Edit models.json with your LM Studio model id.

# 5. Set up Sandcastle env.
cp .sandcastle/.env.example .sandcastle/.env
# Edit .env: at minimum FEATURE_BRANCH and PI_MODEL.

# 6. Build the sandbox image.
npx sandcastle docker build-image

# 7. Customise .sandcastle/Dockerfile for your toolchain (Python/Node/Go/etc.)
#    and rebuild.

# 8. Customise the TEST_COMMAND in main.mts for your test runner.
```

## Running

After planning has produced issues labelled `ready-for-afk` on a feature branch:

```bash
# Set the feature branch and kick off one run.
FEATURE_BRANCH=feat-user-auth npx tsx .sandcastle/main.mts
```

The orchestrator picks one issue, runs Pi, verifies, lands. To process all issues, run repeatedly (e.g. in a loop):

```bash
# Process every issue on the feature until none remain.
while FEATURE_BRANCH=feat-user-auth npx tsx .sandcastle/main.mts; do
  echo "Run completed; checking for next issue..."
done
```

(In v2 you'd add a wrapper script that handles this loop and a notification at the end.)

## What you do, what the agent does

You (next morning):

- Open the feature branch's PR yourself once all issues are closed.
- Review the squashed commits.
- Do the refactor pass.
- Resolve any `needs-human` issues by inspecting the agent branch and either re-running or fixing manually.

The agent (overnight):

- Picks issues, writes implementations, makes tests pass, commits, lands.
- Never opens PRs.
- Never modifies protected paths.
- Never auto-retries — failures stop the loop.

## When something goes wrong

The orchestrator's contract: **every failure ends in a `needs-human` label and a comment explaining why**. If you wake up to a stuck issue, the comment tells you what happened and where to look (log file path, agent branch).

Common failure modes:

- *"Pi did not emit completion signal within N iterations"* — the model got confused and never wrote `<promise>COMPLETE</promise>`. Inspect the log; consider rephrasing the issue body's `Watch Out For` section.
- *"Pi emitted BLOCKED"* — the agent identified a problem it couldn't resolve. The Pi log will contain its reasoning. Often: an interface mismatch, an ambiguous test, or a missing dependency.
- *"Acceptance tests failed when run on host"* — Pi *thought* it succeeded but the host disagrees. Usually means Pi's sandbox state diverged from host state (missing dep, wrong path, etc.). Inspect the agent branch.
- *"Issue has no forbidden-paths constraint — refusing to run unconstrained"* — the issue body wasn't produced by `to-issues` and is missing the structured Constraints section. Fix the issue body or close it.

When you've debugged a failure mode you'd like future-you to handle faster, write a runbook entry under `docs/runbooks/`. Do not write runbooks speculatively — write them when real failures earn them.

## Growing past v1

Each thing skipped in v1 earns its way back by a real failure or real friction:

| Add… | …when this happens |
| ---- | ------------------ |
| Regression sweep (full suite, baseline diff) | An issue lands successfully but breaks unrelated tests you discover later. |
| Host-side protected-paths check | You suspect Pi has bypassed the pre-push hook. |
| Notification webhook | You're tired of checking the issue tracker every morning. |
| Auto-PR creation | You're tired of opening PRs by hand once all issues are closed. |
| Review agent (Sonnet) | You've manually reviewed enough merged work to know the kinds of issues automated review could catch. |
| Retry on Pi failure | You have data on Pi's failure modes and know what's recoverable. |
| Crash recovery sweep | An interrupted orchestrator leaves an `in-progress` issue stranded. |

The order here is roughly priority order. Regression sweep is the most important v2 addition.
