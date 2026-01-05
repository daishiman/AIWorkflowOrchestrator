#!/usr/bin/env node

/**
 * log_usage.mjs
 * スキル使用ログ記録スクリプト
 *
 * 用途: スキル使用のフィードバックをLOGS.mdに記録
 * 終了コード: 0=成功, 1=一般エラー, 2=引数エラー
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOGS_PATH = resolve(__dirname, "..", "LOGS.md");

function showHelp() {
  console.log(`
log_usage.mjs - スキル使用ログ記録

使用法:
  node log_usage.mjs --result <success|failure|partial> --phase <フェーズ名>
  node log_usage.mjs -r success -p "runbook-creation"

オプション:
  --result, -r    実行結果（success/failure/partial）（必須）
  --phase, -p     実行フェーズ（必須）
  --notes, -n     追加メモ（任意）
  --runbook       対象ランブック名（任意）
  --help, -h      このヘルプを表示

終了コード:
  0  記録成功
  1  一般エラー
  2  引数エラー

例:
  node log_usage.mjs --result success --phase "runbook-creation" --notes "DB failover completed"
  node log_usage.mjs -r failure -p validation -n "Missing escalation section"
`);
}

function parseArgs(args) {
  const result = {
    result: null,
    phase: null,
    notes: "",
    runbook: "",
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--result" || arg === "-r") {
      result.result = args[++i];
    } else if (arg === "--phase" || arg === "-p") {
      result.phase = args[++i];
    } else if (arg === "--notes" || arg === "-n") {
      result.notes = args[++i];
    } else if (arg === "--runbook") {
      result.runbook = args[++i];
    }
  }

  return result;
}

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
}

function getDateOnly() {
  return new Date().toISOString().substring(0, 10);
}

function getResultEmoji(result) {
  switch (result) {
    case "success":
      return "✅";
    case "failure":
      return "❌";
    case "partial":
      return "⚠️";
    default:
      return "❓";
  }
}

function initLogsFile() {
  const initialContent = `# runbook-documentation 使用ログ

## 概要

このファイルはrunbook-documentationスキルの使用ログを記録します。

---

## ログエントリ

`;
  writeFileSync(LOGS_PATH, initialContent, "utf-8");
  return initialContent;
}

function appendLog(args) {
  let content;

  if (existsSync(LOGS_PATH)) {
    content = readFileSync(LOGS_PATH, "utf-8");
  } else {
    content = initLogsFile();
  }

  const emoji = getResultEmoji(args.result);
  const timestamp = getTimestamp();
  const date = getDateOnly();

  let logEntry = `### ${date} - ${args.phase}

| 項目 | 値 |
|------|-----|
| 日時 | ${timestamp} |
| フェーズ | ${args.phase} |
| 結果 | ${emoji} ${args.result} |`;

  if (args.runbook) {
    logEntry += `\n| 対象ランブック | ${args.runbook} |`;
  }

  if (args.notes) {
    logEntry += `\n| メモ | ${args.notes} |`;
  }

  logEntry += "\n\n---\n\n";

  // ログエントリを追加
  const insertPosition =
    content.indexOf("## ログエントリ\n") + "## ログエントリ\n".length;
  const newContent =
    content.slice(0, insertPosition) +
    "\n" +
    logEntry +
    content.slice(insertPosition);

  writeFileSync(LOGS_PATH, newContent, "utf-8");

  return logEntry;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.result) {
    console.error("エラー: --result オプションは必須です");
    showHelp();
    process.exit(2);
  }

  if (!["success", "failure", "partial"].includes(args.result)) {
    console.error(
      "エラー: --result は success, failure, partial のいずれかである必要があります",
    );
    process.exit(2);
  }

  if (!args.phase) {
    console.error("エラー: --phase オプションは必須です");
    showHelp();
    process.exit(2);
  }

  try {
    const logEntry = appendLog(args);

    console.log("✅ ログを記録しました");
    console.log("=".repeat(40));
    console.log(logEntry.trim());
    console.log("=".repeat(40));
    console.log(`ログファイル: ${LOGS_PATH}`);

    process.exit(0);
  } catch (error) {
    console.error(`エラー: ログの記録に失敗しました: ${error.message}`);
    process.exit(1);
  }
}

main();
