#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般エラー
 *   2: 引数エラー
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_PATH = resolve(__dirname, "..", "LOGS.md");
const EVALS_PATH = resolve(__dirname, "..", "EVALS.json");

const HELP = `
Usage: node log_usage.mjs [options]

Options:
  --result <success|failure>   結果ステータス
  --phase <phase-name>         実行フェーズ
  --notes <notes>              追加メモ（オプション）
  -h, --help                   このヘルプを表示

Examples:
  node log_usage.mjs --result success --phase "Phase 4"
  node log_usage.mjs --result failure --phase "Phase 2" --notes "型エラー発生"
`;

function parseArgs(args) {
  const result = { result: null, phase: null, notes: "" };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "-h":
      case "--help":
        console.log(HELP);
        process.exit(0);
      case "--result":
        result.result = args[++i];
        break;
      case "--phase":
        result.phase = args[++i];
        break;
      case "--notes":
        result.notes = args[++i];
        break;
    }
  }

  return result;
}

function updateLogs(entry) {
  let content = "";

  if (existsSync(LOGS_PATH)) {
    content = readFileSync(LOGS_PATH, "utf-8");
  } else {
    content = "# 使用ログ\n\n";
  }

  const logEntry = `\n## ${entry.timestamp}\n\n- **Result**: ${entry.result}\n- **Phase**: ${entry.phase}\n- **Notes**: ${entry.notes || "N/A"}\n`;

  content += logEntry;
  writeFileSync(LOGS_PATH, content);
}

function updateEvals(entry) {
  let evals = { evaluations: [] };

  if (existsSync(EVALS_PATH)) {
    try {
      evals = JSON.parse(readFileSync(EVALS_PATH, "utf-8"));
    } catch {
      evals = { evaluations: [] };
    }
  }

  evals.evaluations.push({
    timestamp: entry.timestamp,
    result: entry.result,
    phase: entry.phase,
    notes: entry.notes,
  });

  writeFileSync(EVALS_PATH, JSON.stringify(evals, null, 2));
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.result || !args.phase) {
    console.error("エラー: --result と --phase は必須です");
    console.log(HELP);
    process.exit(2);
  }

  if (!["success", "failure"].includes(args.result)) {
    console.error(
      "エラー: --result は success または failure である必要があります",
    );
    process.exit(2);
  }

  const entry = {
    timestamp: new Date().toISOString(),
    result: args.result,
    phase: args.phase,
    notes: args.notes,
  };

  try {
    updateLogs(entry);
    updateEvals(entry);
    console.log(`✅ 記録完了: ${entry.result} @ ${entry.phase}`);
    process.exit(0);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
