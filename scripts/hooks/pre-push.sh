#!/usr/bin/env bash
#
# pre-push hook — installed at .git/hooks/pre-push.
#
# Symlink or copy this file into .git/hooks/pre-push to enable, e.g.:
#
#   ln -s ../../scripts/hooks/pre-push.sh .git/hooks/pre-push
#   chmod +x .git/hooks/pre-push
#
# Or wire it via package.json `prepare` / Husky / lefthook to keep it
# in sync across clones.
#
# What this hook does:
# Fails the push if HEAD contains commits that modify protected paths
# (tests/locked, src/interfaces, by default). Honest mistakes only —
# inside a YOLO container the agent could bypass this; the orchestrator's
# Stage 3 host-side check is the bypass-proof gate.
#
# Inputs (from git):
#   stdin: lines of "<local-ref> <local-sha> <remote-ref> <remote-sha>"
#   $1: name of remote
#   $2: URL of remote

set -euo pipefail

# Determine the base branch to diff against.
# Convention: the AFK orchestrator pushes per-issue branches (agent/issue-N)
# forked from a feature branch. The base for those is the feature branch.
# For other branches, fall back to main.
CURRENT=$(git rev-parse --abbrev-ref HEAD)
case "${CURRENT}" in
  agent/issue-*)
    # Strip the "agent/issue-N" prefix. We don't know the feature name from
    # the branch name alone, so fall back to "feat-*" branch we forked from.
    # The orchestrator sets the FEATURE_BRANCH env var; re-read it here if
    # invoked from inside the orchestrator. Otherwise, default to main.
    BASE="${SANDCASTLE_BASE_BRANCH:-main}"
    ;;
  *)
    BASE="main"
    ;;
esac

# Locate the project root and the protected-paths script.
ROOT=$(git rev-parse --show-toplevel)
SCRIPT="${ROOT}/scripts/protected-paths.sh"

if [ ! -x "${SCRIPT}" ]; then
  echo "pre-push: ${SCRIPT} not found or not executable; skipping protection check." >&2
  exit 0
fi

"${SCRIPT}" "${BASE}"
