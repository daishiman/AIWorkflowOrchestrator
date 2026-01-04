#!/usr/bin/env node

/**
 * Skill Usage Logger
 *
 * スキルの使用履歴とメトリクスを記録
 *
 * Usage:
 *   node scripts/log_usage.mjs --result <success|failure> --phase <phase-name> [--notes <feedback>]
 *
 * Options:
 *   --result   結果: success | failure | partial（必須）
 *   --phase    フェーズ名（必須）
 *   --notes    追加のフィードバック（任意）
 *   --help     ヘルプを表示
 *
 * Exit codes:
 *   0 - 正常終了
 *   1 - 引数エラー
 *   2 - 実行エラー
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(__dirname);
const LOGS_FILE = join(SKILL_DIR, "LOGS.md");
const EVALS_FILE = join(SKILL_DIR, "EVALS.json");

// 引数パーサー
function parseArgs(args) {
  const parsed = {
    result: null,
    phase: null,
    notes: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--result":
        parsed.result = args[++i];
        break;
      case "--phase":
        parsed.phase = args[++i];
        break;
      case "--notes":
        parsed.notes = args[++i];
        break;
      case "--help":
        parsed.help = true;
        break;
    }
  }

  return parsed;
}

// LOGS.md を更新
function updateLogs(entry) {
  let content = "";

  if (existsSync(LOGS_FILE)) {
    content = readFileSync(LOGS_FILE, "utf-8");
  } else {
    content = `# Input Validation Security - Usage Logs

This file tracks skill usage for continuous improvement.

---

## Usage History

`;
  }

  const timestamp = new Date().toISOString();
  const logEntry = `
### ${timestamp}

- **Phase**: ${entry.phase}
- **Result**: ${entry.result}
- **Notes**: ${entry.notes || "N/A"}

---
`;

  content += logEntry;
  writeFileSync(LOGS_FILE, content);
  console.log(`Updated ${LOGS_FILE}`);
}

// EVALS.json を更新
function updateEvals(entry) {
  let evals = {
    skillName: "input-validation-security",
    version: "1.0.0",
    metrics: {
      totalUsages: 0,
      successCount: 0,
      failureCount: 0,
      partialCount: 0,
      successRate: 0,
    },
    phaseMetrics: {},
    recentUsages: [],
  };

  if (existsSync(EVALS_FILE)) {
    try {
      evals = JSON.parse(readFileSync(EVALS_FILE, "utf-8"));
    } catch (e) {
      console.warn("Could not parse existing EVALS.json, creating new one");
    }
  }

  // メトリクス更新
  evals.metrics.totalUsages++;
  if (entry.result === "success") {
    evals.metrics.successCount++;
  } else if (entry.result === "failure") {
    evals.metrics.failureCount++;
  } else {
    evals.metrics.partialCount++;
  }
  evals.metrics.successRate = (
    (evals.metrics.successCount / evals.metrics.totalUsages) *
    100
  ).toFixed(1);

  // フェーズ別メトリクス更新
  if (!evals.phaseMetrics[entry.phase]) {
    evals.phaseMetrics[entry.phase] = {
      totalUsages: 0,
      successCount: 0,
      failureCount: 0,
    };
  }
  evals.phaseMetrics[entry.phase].totalUsages++;
  if (entry.result === "success") {
    evals.phaseMetrics[entry.phase].successCount++;
  } else if (entry.result === "failure") {
    evals.phaseMetrics[entry.phase].failureCount++;
  }

  // 最近の使用履歴を更新（最大20件）
  evals.recentUsages.unshift({
    timestamp: new Date().toISOString(),
    phase: entry.phase,
    result: entry.result,
    notes: entry.notes,
  });
  if (evals.recentUsages.length > 20) {
    evals.recentUsages = evals.recentUsages.slice(0, 20);
  }

  writeFileSync(EVALS_FILE, JSON.stringify(evals, null, 2));
  console.log(`Updated ${EVALS_FILE}`);
}

// メイン処理
function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Skill Usage Logger

Usage:
  node scripts/log_usage.mjs --result <success|failure> --phase <phase-name> [options]

Options:
  --result   Result: success | failure | partial (required)
  --phase    Phase name (required)
  --notes    Additional feedback (optional)
  --help     Show this help message

Exit codes:
  0 - Success
  1 - Argument error
  2 - Execution error
    `);
    process.exit(0);
  }

  // 引数検証
  if (
    !args.result ||
    !["success", "failure", "partial"].includes(args.result)
  ) {
    console.error("Error: --result must be 'success', 'failure', or 'partial'");
    process.exit(1);
  }

  if (!args.phase) {
    console.error("Error: --phase is required");
    process.exit(1);
  }

  try {
    const entry = {
      result: args.result,
      phase: args.phase,
      notes: args.notes,
    };

    updateLogs(entry);
    updateEvals(entry);

    console.log(`\nLogged usage: ${args.result} for phase "${args.phase}"`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(2);
  }
}

main();
