#!/usr/bin/env node
/**
 * verify-unassigned-links.js
 *
 * task-workflow.md / phase-12 成果物内の unassigned-task 参照パス実在チェック。
 *
 * Usage:
 *   node verify-unassigned-links.js
 *   node verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { basename, dirname, join, resolve } from "path";

const args = process.argv.slice(2);
let source = ".claude/skills/aiworkflow-requirements/references/task-workflow.md";

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--source" && args[i + 1]) {
    source = args[i + 1];
    i += 1;
  }
}

const sourcePath = resolve(source);
if (!existsSync(sourcePath)) {
  console.error(`[verify-unassigned-links] source not found: ${source}`);
  process.exit(1);
}

const seen = new Set();
const refs = [];
const regex =
  /`(docs\/30-workflows\/(?:unassigned-task\/[^`]+\.md|completed-tasks\/(?:unassigned-task\/[^`]+\.md|[^`]+\/unassigned-task\/[^`]+\.md)))`/g;

function collectSourceFiles(entryPath) {
  if (basename(entryPath) !== "task-workflow.md") {
    return [entryPath];
  }

  const parentDir = dirname(entryPath);
  const siblings = readdirSync(parentDir)
    .filter((name) => /^task-workflow(?:-[a-z0-9-]+)?\.md$/i.test(name))
    .map((name) => join(parentDir, name))
    .sort();

  return [...new Set([entryPath, ...siblings])];
}

const sourceFiles = collectSourceFiles(sourcePath);

for (const filePath of sourceFiles) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    let match;
    while ((match = regex.exec(line)) !== null) {
      const path = match[1];
      const key = `${path}:${filePath}:${idx + 1}`;
      if (!seen.has(key)) {
        seen.add(key);
        refs.push({
          path,
          line: idx + 1,
          source: filePath,
        });
      }
    }
  });
}

if (refs.length === 0) {
  console.log(
    `[verify-unassigned-links] no unassigned-task links found in: ${source} (${sourceFiles.length} source files scanned)`,
  );
  process.exit(0);
}

const missing = refs.filter((ref) => !existsSync(resolve(ref.path)));
const existing = refs.length - missing.length;

console.log(`[verify-unassigned-links] source: ${source}`);
console.log(`[verify-unassigned-links] scanned sources: ${sourceFiles.length}`);
console.log(`[verify-unassigned-links] total: ${refs.length}, existing: ${existing}, missing: ${missing.length}`);

if (missing.length > 0) {
  console.error("[verify-unassigned-links] missing files:");
  for (const item of missing) {
    console.error(`  - ${item.path} (${item.source}: line ${item.line})`);
  }
  process.exit(1);
}

console.log("[verify-unassigned-links] ALL_LINKS_EXIST");
