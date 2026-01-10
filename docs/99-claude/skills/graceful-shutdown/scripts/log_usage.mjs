#!/usr/bin/env node
/**
 * log_usage.mjs - スキル使用ログ記録スクリプト
 *
 * 18-skills.md §3.6 準拠
 *
 * Usage:
 *   node scripts/log_usage.mjs --result <success|failure> [--phase <phase>] [--agent <agent>]
 *
 * Arguments:
 *   --result   使用結果 (success/failure) [必須]
 *   --phase    実行フェーズ (Phase 1/2/3)
 *   --agent    実行したエージェント名
 *   -h, --help ヘルプを表示
 *
 * Exit Codes:
 *   0 - 成功
 *   1 - エラー
 *   2 - 引数エラー
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.dirname(__dirname);
const LOG_FILE = path.join(SKILL_DIR, "LOGS.md");

function showHelp() {
  console.log(`
log_usage.mjs - スキル使用ログ記録

Usage:
  node scripts/log_usage.mjs --result <success|failure> [options]

Options:
  --result   使用結果 (success/failure) [必須]
  --phase    実行フェーズ (Phase 1/2/3)
  --agent    実行したエージェント名
  -h, --help このヘルプを表示

Examples:
  node scripts/log_usage.mjs --result success --phase "Phase 3" --agent "implement-validate"
  node scripts/log_usage.mjs --result failure --phase "Phase 1"
  `);
}

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      return { help: true };
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        result[key] = value;
        i++;
      }
    }
  }
  return result;
}

async function logUsage(options) {
  const timestamp = new Date().toISOString();
  const { result, phase = "N/A", agent = "N/A" } = options;

  const logEntry = `| ${timestamp} | ${result} | ${phase} | ${agent} |`;

  let content;
  try {
    content = await fs.readFile(LOG_FILE, "utf-8");
  } catch {
    // ファイルが存在しない場合は新規作成
    content = `# graceful-shutdown 使用ログ

| Timestamp | Result | Phase | Agent |
| --------- | ------ | ----- | ----- |
`;
  }

  const lines = content.split("\n");
  const tableEndIndex = lines.findIndex(
    (line, i) => i > 2 && !line.startsWith("|"),
  );
  const insertIndex = tableEndIndex === -1 ? lines.length : tableEndIndex;

  lines.splice(insertIndex, 0, logEntry);

  await fs.writeFile(LOG_FILE, lines.join("\n"));
  console.log(`✓ ログを記録しました: ${LOG_FILE}`);
  console.log(`  Result: ${result}, Phase: ${phase}, Agent: ${agent}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.result) {
    console.error("エラー: --result は必須です");
    showHelp();
    process.exit(2);
  }

  if (!["success", "failure"].includes(args.result)) {
    console.error(
      'エラー: --result は "success" または "failure" である必要があります',
    );
    process.exit(2);
  }

  try {
    await logUsage(args);
    process.exit(0);
  } catch (error) {
    console.error("エラー:", error.message);
    process.exit(1);
  }
}

main();
