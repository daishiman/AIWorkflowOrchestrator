#!/usr/bin/env node
/**
 * output-formatting スキル使用記録スクリプト
 *
 * 使用方法:
 *   node scripts/log_usage.mjs --result success --format markdown --notes "レポート生成"
 */

import { appendFileSync, existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_PATH = join(__dirname, "..", "LOGS.md");

function parseArgs(args) {
  const result = { result: "success", format: "", notes: "" };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--result" && args[i + 1]) {
      result.result = args[i + 1];
    } else if (args[i] === "--format" && args[i + 1]) {
      result.format = args[i + 1];
    } else if (args[i] === "--notes" && args[i + 1]) {
      result.notes = args[i + 1];
    }
  }
  return result;
}

function logUsage(options) {
  const date = new Date().toISOString().split("T")[0];
  const entry = `
### ${date}

- **フェーズ**: スキル使用
- **結果**: ${options.result === "success" ? "成功" : "失敗"}
- **形式**: ${options.format || "未指定"}
- **備考**: ${options.notes || "なし"}
`;

  if (!existsSync(LOGS_PATH)) {
    console.error("LOGS.md not found");
    process.exit(1);
  }

  appendFileSync(LOGS_PATH, entry);
  console.log(`✓ 使用記録を追加しました: ${LOGS_PATH}`);
}

const args = process.argv.slice(2);
const options = parseArgs(args);
logUsage(options);
