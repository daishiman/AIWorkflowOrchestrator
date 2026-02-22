#!/usr/bin/env node
/**
 * audit-unassigned-tasks.js
 *
 * 未タスク指示書の配置・フォーマット監査を実行する。
 *
 * Usage:
 *   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js
 *   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
 */

import { readdirSync, readFileSync, existsSync } from "fs";
import { join, basename } from "path";

const REQUIRED_HEADINGS = [
  "## メタ情報",
  "## 1. なぜこのタスクが必要か（Why）",
  "## 2. 何を達成するか（What）",
  "## 3. どのように実行するか（How）",
  "## 4. 実行手順",
  "## 5. 完了条件チェックリスト",
  "## 6. 検証方法",
  "## 7. リスクと対策",
  "## 8. 参照情報",
  "## 9. 備考",
];

const STATUS_PENDING_REGEX =
  /\|\s*ステータス\s*\|\s*(未実施|未着手|進行中|未対応)\s*\|/;

const STATUS_PENDING_TEXT_REGEX = /(ステータス\s*[:：]\s*)(未実施|未着手|進行中|未対応)/;

function parseArgs(argv) {
  const args = {
    unassignedDir: "docs/30-workflows/unassigned-task",
    completedUnassignedDir: "docs/30-workflows/completed-tasks/unassigned-task",
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") {
      args.json = true;
    } else if (token === "--unassigned-dir" && argv[i + 1]) {
      args.unassignedDir = argv[i + 1];
      i += 1;
    } else if (token === "--completed-unassigned-dir" && argv[i + 1]) {
      args.completedUnassignedDir = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function listMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => join(dir, name))
    .sort();
}

function checkFormat(filePath) {
  const content = readFileSync(filePath, "utf8");
  const missingHeadings = REQUIRED_HEADINGS.filter((heading) => !content.includes(heading));
  const filename = basename(filePath);

  // 命名規則（最小限）: 英小文字/数字/ハイフン。* を含むファイル名を検出。
  const hasIllegalChar = /[A-Z*]/.test(filename);

  return {
    filePath,
    missingHeadings,
    hasIllegalChar,
  };
}

function checkMisplaced(filePath) {
  const content = readFileSync(filePath, "utf8");
  return STATUS_PENDING_REGEX.test(content) || STATUS_PENDING_TEXT_REGEX.test(content);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const unassignedFiles = listMarkdownFiles(args.unassignedDir);
  const completedUnassignedFiles = listMarkdownFiles(args.completedUnassignedDir);

  const formatViolations = [];
  const namingViolations = [];

  for (const filePath of unassignedFiles) {
    const result = checkFormat(filePath);
    if (result.missingHeadings.length > 0) {
      formatViolations.push({
        filePath,
        missingHeadings: result.missingHeadings,
      });
    }
    if (result.hasIllegalChar) {
      namingViolations.push(filePath);
    }
  }

  const misplacedFiles = completedUnassignedFiles.filter((filePath) => checkMisplaced(filePath));

  const summary = {
    checkedAt: new Date().toISOString(),
    unassignedDir: args.unassignedDir,
    completedUnassignedDir: args.completedUnassignedDir,
    totals: {
      unassignedFiles: unassignedFiles.length,
      completedUnassignedFiles: completedUnassignedFiles.length,
      formatViolations: formatViolations.length,
      namingViolations: namingViolations.length,
      misplacedFiles: misplacedFiles.length,
    },
    formatViolations,
    namingViolations,
    misplacedFiles,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("[audit-unassigned-tasks] summary");
    console.log(`- unassigned files: ${summary.totals.unassignedFiles}`);
    console.log(`- format violations: ${summary.totals.formatViolations}`);
    console.log(`- naming violations: ${summary.totals.namingViolations}`);
    console.log(`- misplaced files (completed-tasks/unassigned-task): ${summary.totals.misplacedFiles}`);

    if (misplacedFiles.length > 0) {
      console.log("\n[audit-unassigned-tasks] misplaced files");
      for (const filePath of misplacedFiles) {
        console.log(`- ${filePath}`);
      }
    }

    if (formatViolations.length > 0) {
      console.log("\n[audit-unassigned-tasks] format violations");
      for (const violation of formatViolations.slice(0, 30)) {
        console.log(`- ${violation.filePath} (missing: ${violation.missingHeadings.length})`);
      }
      if (formatViolations.length > 30) {
        console.log(`- ... and ${formatViolations.length - 30} more`);
      }
    }

    if (namingViolations.length > 0) {
      console.log("\n[audit-unassigned-tasks] naming violations");
      for (const filePath of namingViolations) {
        console.log(`- ${filePath}`);
      }
    }
  }

  const hasIssue =
    summary.totals.formatViolations > 0 ||
    summary.totals.namingViolations > 0 ||
    summary.totals.misplacedFiles > 0;

  process.exit(hasIssue ? 1 : 0);
}

main();
