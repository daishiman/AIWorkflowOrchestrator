#!/usr/bin/env node

import { appendFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillDir = join(__dirname, "..");
const logsPath = join(skillDir, "LOGS.md");

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

if (args.includes("-h") || args.includes("--help")) {
  console.log(
    `Usage: node log_usage.mjs --result <success|failure> [--phase <name>] [--notes <text>]`,
  );
  process.exit(0);
}

const result = getArg("--result");
if (!result || !["success", "failure"].includes(result)) {
  console.error("Error: --result は success または failure を指定してください");
  process.exit(1);
}

const phase = getArg("--phase") || "unknown";
const notes = getArg("--notes") || "";
const timestamp = new Date().toISOString();

const entry = `\n## [実行日時: ${timestamp}]\n\n- Phase: ${phase}\n- 結果: ${result}\n- メモ: ${notes || "なし"}\n`;

if (!existsSync(logsPath)) {
  appendFileSync(logsPath, "# 使用ログ\n", "utf-8");
}

appendFileSync(logsPath, entry, "utf-8");
console.log("Usage log appended.");
