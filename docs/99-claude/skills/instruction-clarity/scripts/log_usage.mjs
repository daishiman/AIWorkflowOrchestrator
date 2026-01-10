#!/usr/bin/env node

/**
 * Skill Usage Logger
 *
 * スキルの使用履歴を記録
 *
 * Usage:
 *   node scripts/log_usage.mjs --result <success|failure> --phase <phase-name> [--notes <feedback>]
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = dirname(__dirname);
const LOGS_FILE = join(SKILL_DIR, "LOGS.md");

function parseArgs(args) {
  const parsed = { result: null, phase: null, notes: null, help: false };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--result":
        parsed.result = args[++i];
        break;
      case "--phase":
        parsed.phase = args[++i];
        break;
      case "--notes":
        parsed.notes = args[++i];
        break;
      case "--help":
        parsed.help = true;
        break;
    }
  }
  return parsed;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.result || !args.phase) {
    console.log(
      `Usage: node scripts/log_usage.mjs --result <success|failure> --phase <phase-name>`,
    );
    process.exit(args.help ? 0 : 1);
  }

  let content = existsSync(LOGS_FILE)
    ? readFileSync(LOGS_FILE, "utf-8")
    : "# Usage Logs\n\n";

  content += `\n### ${new Date().toISOString()}\n- Phase: ${args.phase}\n- Result: ${args.result}\n- Notes: ${args.notes || "N/A"}\n`;

  writeFileSync(LOGS_FILE, content);
  console.log(`Logged: ${args.result} for phase "${args.phase}"`);
}

main();
