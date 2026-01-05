#!/usr/bin/env node
/**
 * log_usage.mjs - インシデント対応記録スクリプト
 *
 * Usage:
 *   node scripts/log_usage.mjs --result <success|failure> [--phase <phase>] [--notes <notes>]
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
log_usage.mjs - インシデント対応記録

Usage:
  node scripts/log_usage.mjs --result <success|failure> [options]

Options:
  --result   対応結果 (success/failure) [必須]
  --phase    対応フェーズ (Phase1-4)
  --notes    補足メモ
  -h, --help このヘルプを表示

Examples:
  node scripts/log_usage.mjs --result success --phase "Phase3" --notes "API復旧完了"
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
  const { result, phase = "N/A", notes = "" } = options;

  const logEntry = `| ${timestamp} | ${result} | ${phase} | ${notes} |`;

  let content;
  try {
    content = await fs.readFile(LOG_FILE, "utf-8");
  } catch {
    content = `# incident-response 使用ログ

| Timestamp | Result | Phase | Notes |
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

  try {
    await logUsage(args);
    process.exit(0);
  } catch (error) {
    console.error("エラー:", error.message);
    process.exit(1);
  }
}

main();
