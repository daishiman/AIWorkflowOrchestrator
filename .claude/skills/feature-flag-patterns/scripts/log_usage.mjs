#!/usr/bin/env node
/**
 * log_usage.mjs
 * フィードバック記録スクリプト
 */

import { appendFileSync, existsSync, writeFileSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_PATH = join(dirname(__dirname), "LOGS.md");

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
使用方法: node scripts/log_usage.mjs --result <success|failure> --phase "<phase>" --notes "<notes>"

例:
  node scripts/log_usage.mjs --result success --phase "Phase 1" --notes "フラグ設計完了"
`);
  process.exit(0);
}

// 引数をパース
function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      parsed[key] = args[i + 1] || "";
      i++;
    }
  }
  return parsed;
}

const params = parseArgs(args);
const date = new Date().toISOString().split("T")[0];
const time = new Date().toLocaleTimeString("ja-JP");

const entry = `
## ${date} ${time}

- **Result**: ${params.result || "unknown"}
- **Phase**: ${params.phase || "N/A"}
- **Notes**: ${params.notes || ""}
`;

if (!existsSync(LOGS_PATH)) {
  writeFileSync(LOGS_PATH, "# Feature Flag Patterns - ログ\n");
}

appendFileSync(LOGS_PATH, entry);
console.log("✅ ログを記録しました: " + LOGS_PATH);
