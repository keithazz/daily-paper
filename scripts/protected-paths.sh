#!/usr/bin/env bash
#
# protected-paths.sh — fail if any commit in HEAD..<base> touches a protected
# path. Used by the pre-push hook to give Pi fast feedback when it accidentally
# modifies a forbidden file, and (optionally) by the orchestrator's Stage 3
# verification on the host as a bypass-proof check.
#
# Usage:
#   scripts/protected-paths.sh <base-branch>
#
# Reads the protected-path globs from .claude/planning-config.md if present,
# otherwise falls back to the canonical defaults.
#
# Exit codes:
#   0 — no protected paths modified.
#   1 — at least one protected path was modified; offending paths printed.
#   64 — usage error.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <base-branch>" >&2
  exit 64
fi

BASE="$1"

# Default protected globs. Extend by adding patterns to a project-specific
# list under .claude/planning-config.md (parsing left as TODO; v1 uses the
# defaults below).
PROTECTED_PATTERNS=(
  '^tests/locked/'
  '^src/interfaces/'
)

# Compute changed files between base and HEAD.
if ! git rev-parse --verify "${BASE}" >/dev/null 2>&1; then
  echo "protected-paths.sh: base branch '${BASE}' does not exist" >&2
  exit 64
fi

CHANGED=$(git diff --name-only "${BASE}"...HEAD || true)
if [ -z "${CHANGED}" ]; then
  exit 0
fi

VIOLATIONS=""
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  match=$(printf '%s\n' "${CHANGED}" | grep -E "${pattern}" || true)
  if [ -n "${match}" ]; then
    VIOLATIONS="${VIOLATIONS}${match}"$'\n'
  fi
done

if [ -n "${VIOLATIONS}" ]; then
  echo "ERROR: commits touch protected paths:" >&2
  echo "${VIOLATIONS}" >&2
  echo "These paths must not be modified by the AFK agent. Emit <promise>BLOCKED</promise> instead." >&2
  exit 1
fi

exit 0
