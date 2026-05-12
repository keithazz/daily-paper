#!/usr/bin/env bash
#
# setup-labels.sh — create the canonical AFK labels on the current GitHub repo.
#
# Run once per repo, after `gh auth login`. Idempotent: existing labels with
# the same name are left alone (gh exits non-zero, which we swallow).
#
# Usage:
#   scripts/setup-labels.sh

set -uo pipefail

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"
  if gh label create "${name}" --color "${color}" --description "${description}" 2>/dev/null; then
    echo "created: ${name}"
  else
    echo "exists:  ${name} (skipped)"
  fi
}

# Workflow-state labels.
create_label "ready-for-afk" "0e8a16" "Ready for AFK agent pickup"
create_label "in-progress"   "fbca04" "Claimed by an AFK run"
create_label "needs-human"   "d93f4c" "Blocked, requires human attention"

# Priority labels (1–5 default range; extend if you need finer ordering).
create_label "priority-1" "5319e7" "AFK priority 1 (runs first)"
create_label "priority-2" "5319e7" "AFK priority 2"
create_label "priority-3" "5319e7" "AFK priority 3"
create_label "priority-4" "5319e7" "AFK priority 4"
create_label "priority-5" "5319e7" "AFK priority 5"

echo
echo "Done. Per-feature labels (feature: feat-X) are created on demand by the"
echo "to-issues skill — no need to seed them here."
