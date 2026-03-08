#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const requiredFiles = [
  "SKILL.md",
  "agents/audit-task9-spec.md",
  "agents/patch-task9-spec.md",
  "agents/sync-system-spec.md",
  "references/spec-sync-checklist.md",
  "references/quick-recovery-playbook.md",
  "scripts/audit_task9_spec_sync.js",
];

let hasError = false;
for (const file of requiredFiles) {
  const path = resolve(`.claude/skills/ipc-preload-spec-sync-guardian/${file}`);
  if (!existsSync(path)) {
    console.error(`[missing] ${file}`);
    hasError = true;
  }
}

const skillMd = resolve(".claude/skills/ipc-preload-spec-sync-guardian/SKILL.md");
if (existsSync(skillMd)) {
  const text = readFileSync(skillMd, "utf-8");
  if (text.includes("TODO")) {
    console.error("[invalid] SKILL.md contains TODO");
    hasError = true;
  }
}

const audit = spawnSync(
  "node",
  [
    ".claude/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js",
    "--format",
    "json",
  ],
  { encoding: "utf-8" },
);

if (audit.stdout) {
  process.stdout.write(audit.stdout);
}
if (audit.status !== 0) {
  hasError = true;
}

if (hasError) {
  process.exit(4);
}
console.log("✓ validate_all: PASS");
