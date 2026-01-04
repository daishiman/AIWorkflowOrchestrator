#!/usr/bin/env node

/**
 * スキル使用記録スクリプト
 *
 * 18-skills.md §7 フィードバックループ準拠
 *
 * 使用例:
 *   node log_usage.mjs --result success --phase "Phase 3"
 *   node log_usage.mjs --result failure --phase "Phase 2" --notes "権限設定に問題"
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般的なエラー
 *   2: 引数エラー
 */

import { appendFileSync, existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;

function showHelp() {
  console.log(`
スキル使用記録スクリプト (18-skills.md §7 準拠)

Usage:
  node log_usage.mjs --result <success|failure> --phase <phase> [options]

Required:
  --result        結果 (success または failure)
  --phase         フェーズ名 (例: "Phase 1", "Phase 2")

Options:
  --notes         追加メモ
  --agent         使用したエージェント名
  -h, --help      このヘルプを表示

Examples:
  node log_usage.mjs --result success --phase "Phase 3"
  node log_usage.mjs --result failure --phase "Phase 2" --notes "権限設定エラー"
  `);
}

function parseArgs(args) {
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--result" && args[i + 1]) {
      parsed.result = args[++i];
    } else if (args[i] === "--phase" && args[i + 1]) {
      parsed.phase = args[++i];
    } else if (args[i] === "--notes" && args[i + 1]) {
      parsed.notes = args[++i];
    } else if (args[i] === "--agent" && args[i + 1]) {
      parsed.agent = args[++i];
    }
  }

  return parsed;
}

function getLogsPath() {
  return join(__dirname, "..", "LOGS.md");
}

function formatLogEntry(data) {
  const timestamp = new Date().toISOString();
  const result = data.result === "success" ? "✓" : "✗";

  let entry = `\n## ${timestamp}\n\n`;
  entry += `- **結果**: ${result} ${data.result}\n`;
  entry += `- **フェーズ**: ${data.phase}\n`;

  if (data.agent) {
    entry += `- **エージェント**: ${data.agent}\n`;
  }

  if (data.notes) {
    entry += `- **メモ**: ${data.notes}\n`;
  }

  return entry;
}

function initLogsFile(logsPath) {
  const header = `# GitHub Actions Security スキル使用ログ

> 自動生成ファイル - 手動編集禁止
> 18-skills.md §7 フィードバックループ

---
`;
  writeFileSync(logsPath, header, "utf-8");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const parsed = parseArgs(args);

  if (!parsed.result || !parsed.phase) {
    console.error("Error: --result と --phase は必須です");
    showHelp();
    process.exit(EXIT_ARGS_ERROR);
  }

  if (parsed.result !== "success" && parsed.result !== "failure") {
    console.error(
      "Error: --result は success または failure である必要があります",
    );
    process.exit(EXIT_ARGS_ERROR);
  }

  const logsPath = getLogsPath();

  if (!existsSync(logsPath)) {
    initLogsFile(logsPath);
  }

  const entry = formatLogEntry(parsed);
  appendFileSync(logsPath, entry, "utf-8");

  console.log(`ログを記録しました: ${logsPath}`);
  console.log(`  結果: ${parsed.result}`);
  console.log(`  フェーズ: ${parsed.phase}`);

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
