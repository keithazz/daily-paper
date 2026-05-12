/**
 * AFK orchestrator — v1 minimal.
 *
 * Goal: claim one issue, run Pi against it, verify acceptance tests pass on
 * the host, land the work on the feature branch. Every failure ends in a
 * `needs-human` label with a comment.
 *
 * Six steps:
 *   1. Claim   — pick one ready-for-afk issue, swap label to in-progress.
 *   2. Parse   — extract acceptance tests, forbidden paths, feature from body.
 *   3. Run     — single Sandcastle run() with Pi against per-issue branch.
 *   4. Verify  — host-side: run acceptance tests, check exit code.
 *   5. Land    — squash-merge to feature branch, close issue.
 *   6. Fail    — any error: label needs-human, comment with reason, exit non-zero.
 *
 * Deliberately not in v1: regression sweep, review agent, auto-PR, retry,
 * notification, crash recovery, host-side protected-paths check.
 *
 * Run:  npx tsx .sandcastle/main.mts
 *
 * NOTE: Verify the Sandcastle import surface against your installed version
 * (`@ai-hero/sandcastle` API has evolved; agent factories `pi()` and the
 * `branchStrategy`/`baseBranch` shape may differ across releases).
 */

import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { run, pi } from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";

// ---------------------------------------------------------------------------
// Configuration — adjust for your project.
// ---------------------------------------------------------------------------

const FEATURE_BRANCH = process.env.FEATURE_BRANCH ?? requireFeatureBranchArg();
const MAX_ITERATIONS = Number(process.env.MAX_ITERATIONS ?? 6);
const RUN_TIMEOUT_SECONDS = Number(process.env.RUN_TIMEOUT_SECONDS ?? 1800);
const PI_MODEL = process.env.PI_MODEL ?? "qwen-coder-local";

// TODO: set this to the command that runs a single test by ID for your
// runner. Examples:
//   pytest:  (id) => `pytest ${id}`
//   vitest:  (id) => `npx vitest run ${id}`
const TEST_COMMAND = (testIds: string[]) => `pytest ${testIds.join(" ")}`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Issue = {
  number: number;
  title: string;
  body: string;
  labels: string[];
  priority: number;
};

type ParsedIssue = {
  acceptanceTests: string[];
  forbiddenPaths: string[];
  feature: string;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const RUN_ID = randomUUID().slice(0, 8);
const log = (msg: string) => console.log(`[${RUN_ID}] ${msg}`);

main().catch((err) => {
  console.error(`[${RUN_ID}] FATAL:`, err);
  process.exit(1);
});

async function main(): Promise<void> {
  log(`AFK orchestrator starting on feature branch ${FEATURE_BRANCH}`);

  // STAGE 1 — Claim.
  const issue = await claimIssue(FEATURE_BRANCH);
  if (!issue) {
    log("No eligible issues. Exiting cleanly.");
    return;
  }
  log(`Claimed issue #${issue.number}: ${issue.title}`);

  // Wrap stages 2–5 so any failure routes to Stage 6 (graceful fail).
  try {
    // STAGE 2 — Parse.
    const parsed = parseIssueBody(issue);
    log(`Parsed ${parsed.acceptanceTests.length} acceptance tests, ${parsed.forbiddenPaths.length} forbidden paths`);

    // STAGE 3 — Run Pi.
    log(`Running Pi (max ${MAX_ITERATIONS} iterations)...`);
    const result = await runPi(issue, parsed);

    if (!result.wasCompletionSignalDetected) {
      throw new Error(`Pi did not emit completion signal within ${MAX_ITERATIONS} iterations`);
    }

    // Detect BLOCKED — Pi's stdout contains the signal text.
    if (result.stdout.includes("<promise>BLOCKED</promise>")) {
      throw new Error("Pi emitted BLOCKED — see Pi log for reason");
    }

    if (result.commits.length === 0) {
      throw new Error("Pi completed but produced no commits");
    }

    log(`Pi completed in ${result.iterationsRun} iterations with ${result.commits.length} commits`);

    // STAGE 4 — Verify acceptance tests host-side.
    log(`Verifying acceptance tests host-side: ${parsed.acceptanceTests.join(", ")}`);
    verifyAcceptanceTests(parsed.acceptanceTests, result.branch);

    // STAGE 5 — Land.
    log(`Landing on ${FEATURE_BRANCH}`);
    landWork(issue, result.branch);

    log(`SUCCESS: issue #${issue.number} merged to ${FEATURE_BRANCH}`);
  } catch (err) {
    // STAGE 6 — Fail gracefully.
    const reason = err instanceof Error ? err.message : String(err);
    log(`FAILURE: ${reason}`);
    routeIssueToHuman(issue, reason);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Stage 1: claim
// ---------------------------------------------------------------------------

async function claimIssue(featureBranch: string): Promise<Issue | null> {
  const raw = sh(
    `gh issue list ` +
      `--label ready-for-afk ` +
      `--label "feature: ${featureBranch}" ` +
      `--state open ` +
      `--json number,title,body,labels ` +
      `--limit 50`,
  );
  const all = JSON.parse(raw) as Array<{
    number: number;
    title: string;
    body: string;
    labels: { name: string }[];
  }>;

  // Sort by priority ascending. Issues without priority go last.
  const withPriority = all.map((i) => ({
    number: i.number,
    title: i.title,
    body: i.body,
    labels: i.labels.map((l) => l.name),
    priority: parsePriority(i.labels.map((l) => l.name)),
  }));
  withPriority.sort((a, b) => a.priority - b.priority);

  const next = withPriority[0];
  if (!next) return null;

  // Claim: swap ready-for-afk → in-progress, comment with run id.
  sh(`gh issue edit ${next.number} --remove-label ready-for-afk --add-label in-progress`);
  sh(`gh issue comment ${next.number} --body ${shq(`Claimed by AFK run ${RUN_ID}`)}`);

  return next;
}

function parsePriority(labels: string[]): number {
  for (const l of labels) {
    const m = l.match(/^priority-(\d+)$/);
    if (m) return Number(m[1]);
  }
  return Number.MAX_SAFE_INTEGER;
}

// ---------------------------------------------------------------------------
// Stage 2: parse
// ---------------------------------------------------------------------------

function parseIssueBody(issue: Issue): ParsedIssue {
  const body = issue.body;

  const acceptanceTests = extractListSection(body, "Acceptance Tests");
  const constraintsSection = extractSection(body, "Constraints") ?? "";
  const featureSection = extractSection(body, "Feature") ?? "";

  // Forbidden paths come from the Constraints section as glob patterns.
  // The issue template canonically lists them as: "Do not modify files matching: pattern1, pattern2"
  const forbiddenPaths = extractForbiddenPaths(constraintsSection);

  const feature = featureSection.trim().replace(/^`|`$/g, "") || FEATURE_BRANCH;

  if (acceptanceTests.length === 0) {
    throw new Error("Issue has no Acceptance Tests section or it is empty");
  }
  if (forbiddenPaths.length === 0) {
    throw new Error("Issue has no forbidden-paths constraint — refusing to run unconstrained");
  }

  return { acceptanceTests, forbiddenPaths, feature };
}

function extractSection(body: string, heading: string): string | null {
  // Match `## <heading>` to the next `##` or end of string.
  const re = new RegExp(`^## ${escapeRegex(heading)}\\s*$([\\s\\S]*?)(?=^## |\\Z)`, "m");
  const m = body.match(re);
  return m ? m[1].trim() : null;
}

function extractListSection(body: string, heading: string): string[] {
  const section = extractSection(body, heading);
  if (!section) return [];
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim().replace(/^`|`$/g, ""));
}

function extractForbiddenPaths(constraintsText: string): string[] {
  // Look for the canonical line "Do not modify files matching: a, b, c"
  const m = constraintsText.match(/Do not modify files matching:\s*(.+)/i);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((p) => p.trim().replace(/^`|`$/g, ""))
    .filter(Boolean);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Stage 3: run Pi
// ---------------------------------------------------------------------------

async function runPi(issue: Issue, parsed: ParsedIssue) {
  return run({
    agent: pi(PI_MODEL),
    sandbox: docker({
      branchStrategy: { type: "branch", branch: `agent/issue-${issue.number}` },
      baseBranch: parsed.feature,
    }),
    promptFile: ".sandcastle/prompt.md",
    promptArgs: {
      ISSUE_NUMBER: String(issue.number),
      ISSUE_BODY: issue.body,
      FEATURE: parsed.feature,
      ACCEPTANCE_TESTS: parsed.acceptanceTests.join("\n"),
      FORBIDDEN_PATHS: parsed.forbiddenPaths.join("\n"),
    },
    maxIterations: MAX_ITERATIONS,
    completionSignal: ["<promise>COMPLETE</promise>", "<promise>BLOCKED</promise>"],
    timeoutSeconds: RUN_TIMEOUT_SECONDS,
    name: `issue-${issue.number}-${RUN_ID}`,
    logging: {
      type: "file",
      path: `.sandcastle/logs/issue-${issue.number}-${RUN_ID}.log`,
    },
  });
}

// ---------------------------------------------------------------------------
// Stage 4: verify
// ---------------------------------------------------------------------------

function verifyAcceptanceTests(testIds: string[], agentBranch: string): void {
  // Check out the agent branch on the host worktree.
  sh(`git checkout ${agentBranch}`);

  try {
    sh(TEST_COMMAND(testIds), { stdio: "inherit" });
  } catch {
    throw new Error(`Acceptance tests failed when run on host: ${testIds.join(", ")}`);
  }
}

// ---------------------------------------------------------------------------
// Stage 5: land
// ---------------------------------------------------------------------------

function landWork(issue: Issue, agentBranch: string): void {
  sh(`git checkout ${FEATURE_BRANCH}`);
  sh(`git merge --squash ${agentBranch}`);
  sh(`git commit -m ${shq(`feat: ${issue.title} (#${issue.number})`)}`);
  sh(`git branch -D ${agentBranch}`);

  sh(`gh issue close ${issue.number} --comment ${shq(`Completed by AFK run ${RUN_ID}`)}`);
  sh(`gh issue edit ${issue.number} --remove-label in-progress`);
}

// ---------------------------------------------------------------------------
// Stage 6: fail gracefully
// ---------------------------------------------------------------------------

function routeIssueToHuman(issue: Issue, reason: string): void {
  try {
    sh(`gh issue edit ${issue.number} --remove-label in-progress --add-label needs-human`);
    const comment = `AFK run ${RUN_ID} blocked on this issue.\n\n**Reason**: ${reason}\n\nLog: \`.sandcastle/logs/issue-${issue.number}-${RUN_ID}.log\`\nAgent branch (left intact for inspection): \`agent/issue-${issue.number}\``;
    sh(`gh issue comment ${issue.number} --body ${shq(comment)}`);
  } catch (e) {
    // If even relabel/comment fails, log loudly. The user can reconcile manually.
    console.error(`[${RUN_ID}] Could not route issue to human:`, e);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sh(cmd: string, opts?: { stdio?: "inherit" | "pipe" }): string {
  return execSync(cmd, {
    stdio: opts?.stdio === "inherit" ? "inherit" : ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }) as unknown as string;
}

function shq(s: string): string {
  // Shell-quote a string for safe interpolation into a command line.
  return `'${s.replace(/'/g, "'\\''")}'`;
}

function requireFeatureBranchArg(): string {
  console.error("FEATURE_BRANCH env var is required (e.g. FEATURE_BRANCH=feat-user-auth).");
  process.exit(64);
}
