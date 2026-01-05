#!/usr/bin/env node
/**
 * @fileoverview event-sourcing スキル使用ログ記録
 * Usage: node log_usage.mjs --result <success|failure> [--phase <phase-name>] [--notes <notes>]
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_FILE = join(__dirname, "..", "LOGS.md");

function showHelp() {
  console.log(`
event-sourcing スキル使用ログ記録

Usage:
  node log_usage.mjs --result <success|failure> [options]

Options:
  --result   必須。success または failure
  --phase    オプション。実行フェーズ名
  --notes    オプション。追加メモ
  --help     このヘルプを表示

Examples:
  node log_usage.mjs --result success --phase "analyze-events"
  node log_usage.mjs --result failure --phase "implement-cqrs" --notes "projection遅延問題"
`);
}

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help" || args[i] === "-h") {
      result.help = true;
    } else if (args[i] === "--result" && args[i + 1]) {
      result.result = args[++i];
    } else if (args[i] === "--phase" && args[i + 1]) {
      result.phase = args[++i];
    } else if (args[i] === "--notes" && args[i + 1]) {
      result.notes = args[++i];
    }
  }
  return result;
}

function logUsage(options) {
  const timestamp = new Date().toISOString();
  const { result, phase, notes } = options;

  if (!result || !["success", "failure"].includes(result)) {
    console.error("Error: --result must be 'success' or 'failure'");
    process.exit(1);
  }

  const emoji = result === "success" ? "✅" : "❌";
  const phaseStr = phase ? ` (${phase})` : "";
  const notesStr = notes ? ` - ${notes}` : "";

  const logEntry = `| ${timestamp} | ${emoji} ${result}${phaseStr}${notesStr} |\n`;

  // Ensure LOGS.md exists with header
  if (!existsSync(LOGS_FILE)) {
    const header = `# event-sourcing Usage Logs

| Timestamp | Result |
| --------- | ------ |
`;
    const dir = dirname(LOGS_FILE);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(LOGS_FILE, header);
  }

  appendFileSync(LOGS_FILE, logEntry);
  console.log(`Logged: ${emoji} ${result}${phaseStr}${notesStr}`);
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  showHelp();
  process.exit(0);
}

logUsage(args);
