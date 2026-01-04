#!/usr/bin/env node
/**
 * React Server Components スキル使用履歴の記録
 *
 * @usage node log_usage.mjs <action> [details]
 * @example node log_usage.mjs "architecture-analysis" "Next.js App Router migration"
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOGS_PATH = join(__dirname, "..", "LOGS.md");

function logUsage(action, details = "") {
  const timestamp = new Date().toISOString();
  const entry = `| ${timestamp} | ${action} | ${details} |\n`;

  if (!existsSync(LOGS_PATH)) {
    const header = `# React Server Components Skill Usage Logs

| Timestamp | Action | Details |
| --------- | ------ | ------- |
`;
    mkdirSync(dirname(LOGS_PATH), { recursive: true });
    appendFileSync(LOGS_PATH, header);
  }

  appendFileSync(LOGS_PATH, entry);
  console.log(`✓ Logged: ${action} - ${details || "(no details)"}`);
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node log_usage.mjs <action> [details]");
  console.log(
    "Example: node log_usage.mjs 'architecture-analysis' 'Next.js migration'",
  );
  process.exit(1);
}

logUsage(args[0], args[1] || "");
