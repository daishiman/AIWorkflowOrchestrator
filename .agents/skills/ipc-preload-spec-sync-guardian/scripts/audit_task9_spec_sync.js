#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const TARGETS = [
  { id: "9D", domain: "chain", file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md" },
  { id: "9E", domain: "fork", file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md" },
  { id: "9F", domain: "share", file: "docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-022-task-9f-skill-share.md" },
  { id: "9G", domain: "schedule", file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md" },
  { id: "9H", domain: "debug", file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md" },
  { id: "9I", domain: "docs", file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md" },
  { id: "9J", domain: "analytics", file: "docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md" },
];

const REQUIRED_MODIFIES = [
  "apps/desktop/src/preload/channels.ts",
  "apps/desktop/src/preload/skill-api.ts",
  "apps/desktop/src/preload/types.ts",
  "packages/shared/src/types/index.ts",
];

const LEGACY_PATTERNS = [
  "apps/desktop/src/preload/skillAPI.ts",
  "apps/desktop/src/main/ipc/channels.ts",
  "packages/shared/src/types/skillChain.ts",
  "packages/shared/src/types/skillSchedule.ts",
  "packages/shared/src/types/skillDebug.ts",
  "packages/shared/src/types/skillDocs.ts",
  "packages/shared/src/types/skillAnalytics.ts",
];

function parseArgs(argv) {
  const formatIndex = argv.indexOf("--format");
  const format = formatIndex >= 0 ? argv[formatIndex + 1] : "json";
  return { format: format || "json" };
}

function auditFile(target) {
  const path = resolve(target.file);
  if (!existsSync(path)) {
    return {
      id: target.id,
      file: target.file,
      ok: false,
      missingFile: true,
      oldPathHits: ["FILE_NOT_FOUND"],
      missingArtifacts: [],
    };
  }

  const text = readFileSync(path, "utf-8");
  const oldPathHits = LEGACY_PATTERNS.filter((s) => text.includes(s));

  const missingArtifacts = [];
  for (const item of REQUIRED_MODIFIES) {
    if (!text.includes(item)) {
      missingArtifacts.push(item);
    }
  }

  const requiredDomainType =
    target.domain === "share"
      ? "packages/shared/src/types/skill-share.ts"
      : `packages/shared/src/types/skill-${target.domain}.ts`;
  if (!text.includes(requiredDomainType)) {
    missingArtifacts.push(requiredDomainType);
  }

  return {
    id: target.id,
    file: target.file,
    ok: oldPathHits.length === 0 && missingArtifacts.length === 0,
    missingFile: false,
    oldPathHits,
    missingArtifacts,
  };
}

function renderMarkdown(results) {
  const lines = [];
  lines.push("# task-9D〜9J 仕様同期監査レポート");
  lines.push("");
  lines.push("| Task | Status | oldPaths | missingArtifacts |");
  lines.push("| --- | --- | --- | --- |");
  for (const r of results) {
    const status = r.ok ? "PASS" : "FAIL";
    lines.push(
      `| ${r.id} | ${status} | ${r.oldPathHits.length} | ${r.missingArtifacts.length} |`,
    );
  }

  const detailRows = results.filter((r) => !r.ok);
  if (detailRows.length > 0) {
    lines.push("");
    lines.push("## Fail Details");
    for (const r of detailRows) {
      lines.push("");
      lines.push(`### ${r.id} - ${r.file}`);
      if (r.oldPathHits.length > 0) {
        lines.push(`- oldPaths: ${r.oldPathHits.join(", ")}`);
      }
      if (r.missingArtifacts.length > 0) {
        lines.push(`- missingArtifacts: ${r.missingArtifacts.join(", ")}`);
      }
    }
  }

  return lines.join("\n");
}

function main() {
  const { format } = parseArgs(process.argv.slice(2));
  const results = TARGETS.map(auditFile);
  const summary = {
    total: results.length,
    pass: results.filter((r) => r.ok).length,
    fail: results.filter((r) => !r.ok).length,
  };

  if (format === "markdown") {
    console.log(renderMarkdown(results));
  } else {
    console.log(JSON.stringify({ summary, results }, null, 2));
  }

  process.exit(summary.fail === 0 ? 0 : 4);
}

main();
