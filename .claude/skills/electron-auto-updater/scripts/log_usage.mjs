#!/usr/bin/env node

/**
 * electron-auto-updater スキル使用記録スクリプト
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_PATH = join(__dirname, "..", "LOGS.md");

function logUsage(args) {
  const result =
    args.find((a) => a.startsWith("--result="))?.split("=")[1] || "unknown";
  const phase =
    args.find((a) => a.startsWith("--phase="))?.split("=")[1] || "unknown";
  const notes = args.find((a) => a.startsWith("--notes="))?.split("=")[1] || "";

  const timestamp = new Date().toISOString();
  const logEntry = `| ${timestamp} | ${result} | ${phase} | ${notes} |\n`;

  // LOGSファイルが存在しない場合は作成
  if (!existsSync(LOGS_PATH)) {
    const header = `# electron-auto-updater 使用ログ

| Timestamp | Result | Phase | Notes |
| --------- | ------ | ----- | ----- |
`;
    const dir = dirname(LOGS_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(LOGS_PATH, header);
  }

  appendFileSync(LOGS_PATH, logEntry);
  console.log(`✓ Usage logged: ${result} - ${phase}`);
}

// メイン実行
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(
    "Usage: log_usage.mjs --result=<success|failure> --phase=<phase> [--notes=<notes>]",
  );
  console.log("");
  console.log("Phases:");
  console.log("  - design: 要件定義と設計");
  console.log("  - implementation: 基本実装");
  console.log("  - security: 署名とセキュリティ設定");
  console.log("  - server: 更新サーバー構築");
  console.log("  - testing: テストと検証");
  console.log("  - deployment: デプロイとモニタリング");
  process.exit(1);
}

logUsage(args);
