# Runbooks

Operator runbooks for the AFK loop live here. **This directory is intentionally empty in the starter.**

Write a runbook when:

- A real failure happens and you'd like future-you to debug it faster.
- You've discovered a recovery procedure worth recording.
- An operational question has come up more than once.

Do **not** write runbooks speculatively. Speculative documentation rots; reactive documentation doesn't.

## Suggested format

One file per topic, named after the failure mode or task:

- `pi-stuck-no-completion-signal.md`
- `acceptance-test-host-failure.md`
- `crash-recovery-stuck-in-progress.md`
- `rebuilding-the-sandbox-image.md`
- `triaging-needs-human-issues.md`

Each should answer:

- **Symptom**: how do you know you're hitting this?
- **First check**: the cheapest way to confirm.
- **Resolution**: the steps that fix it.
- **Prevention**: anything to add to a config, prompt, or skill so it doesn't recur.

The runbook is for the operator (you), not the agent. Keep it terse.
