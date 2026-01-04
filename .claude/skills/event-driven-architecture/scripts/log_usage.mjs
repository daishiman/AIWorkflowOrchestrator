#!/usr/bin/env node
/**
 * Event-Driven Architecture Skill Usage Logger
 * Usage: node log_usage.mjs --result <success|failure> [--phase <phase-name>] [--notes <notes>]
 */

import { readFile, writeFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_PATH = resolve(__dirname, "../LOGS.md");
const EVALS_PATH = resolve(__dirname, "../EVALS.json");

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--result" && args[i + 1]) {
      parsed.result = args[++i];
    } else if (args[i] === "--phase" && args[i + 1]) {
      parsed.phase = args[++i];
    } else if (args[i] === "--notes" && args[i + 1]) {
      parsed.notes = args[++i];
    } else if (args[i] === "-h" || args[i] === "--help") {
      parsed.help = true;
    }
  }
  return parsed;
}

function showHelp() {
  console.log(`
Event-Driven Architecture Skill Usage Logger

Usage:
  node log_usage.mjs --result <success|failure> [options]

Options:
  --result <value>  Required. 'success' or 'failure'
  --phase <name>    Optional. Phase name (event-modeling, architecture-design, implementation, testing)
  --notes <text>    Optional. Additional notes or feedback
  -h, --help        Show this help message

Examples:
  node log_usage.mjs --result success --phase implementation
  node log_usage.mjs --result failure --phase testing --notes "Event ordering issue"
`);
}

async function logUsage(result, phase, notes) {
  const timestamp = new Date().toISOString();
  const logEntry = `
## ${timestamp}
- **Result**: ${result}
- **Phase**: ${phase || "N/A"}
- **Notes**: ${notes || "N/A"}
`;

  try {
    let logs = "";
    try {
      logs = await readFile(LOGS_PATH, "utf-8");
    } catch {
      logs = "# Event-Driven Architecture Skill Usage Logs\n";
    }

    logs += logEntry;
    await writeFile(LOGS_PATH, logs);
    console.log(`✓ Logged usage to LOGS.md`);

    // Update EVALS.json
    let evals = { total: 0, success: 0, failure: 0, phases: {} };
    try {
      const evalsContent = await readFile(EVALS_PATH, "utf-8");
      evals = JSON.parse(evalsContent);
    } catch {
      // Use defaults
    }

    evals.total++;
    evals[result] = (evals[result] || 0) + 1;
    if (phase) {
      evals.phases[phase] = evals.phases[phase] || {
        total: 0,
        success: 0,
        failure: 0,
      };
      evals.phases[phase].total++;
      evals.phases[phase][result]++;
    }

    await writeFile(EVALS_PATH, JSON.stringify(evals, null, 2));
    console.log(`✓ Updated EVALS.json`);
  } catch (error) {
    console.error(`✗ Error logging usage: ${error.message}`);
    process.exit(1);
  }
}

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  showHelp();
  process.exit(0);
}

if (!args.result || !["success", "failure"].includes(args.result)) {
  console.error("Error: --result must be 'success' or 'failure'");
  showHelp();
  process.exit(2);
}

logUsage(args.result, args.phase, args.notes);
