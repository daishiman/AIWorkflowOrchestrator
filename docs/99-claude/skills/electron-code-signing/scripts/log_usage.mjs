#!/usr/bin/env node

/**
 * electron-code-signing スキル使用記録スクリプト
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
  const platform =
    args.find((a) => a.startsWith("--platform="))?.split("=")[1] || "unknown";
  const notes = args.find((a) => a.startsWith("--notes="))?.split("=")[1] || "";

  const timestamp = new Date().toISOString();
  const logEntry = `| ${timestamp} | ${result} | ${phase} | ${platform} | ${notes} |\n`;

  if (!existsSync(LOGS_PATH)) {
    const header = `# electron-code-signing 使用ログ

| Timestamp | Result | Phase | Platform | Notes |
| --------- | ------ | ----- | -------- | ----- |
`;
    const dir = dirname(LOGS_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(LOGS_PATH, header);
  }

  appendFileSync(LOGS_PATH, logEntry);
  console.log(`✓ Usage logged: ${result} - ${phase} (${platform})`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(
    "Usage: log_usage.mjs --result=<success|failure> --phase=<phase> --platform=<platform> [--notes=<notes>]",
  );
  console.log("");
  console.log("Phases:");
  console.log("  - certificate-setup: 証明書セットアップ");
  console.log("  - configuration: 署名設定");
  console.log("  - signing: 署名実行");
  console.log("  - verification: 署名検証");
  console.log("");
  console.log("Platforms:");
  console.log("  - macos / windows / linux");
  process.exit(1);
}

logUsage(args);
