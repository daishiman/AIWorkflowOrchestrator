#!/usr/bin/env node

/**
 * Usage logging script for error-handling-patterns skill
 *
 * Usage:
 *   node log_usage.mjs --result success --phase "Phase 1" --agent "analyze-errors"
 *   node log_usage.mjs --result failure --phase "Phase 2" --notes "Missing error codes"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_DIR = path.resolve(__dirname, "..");
const LOGS_PATH = path.join(SKILL_DIR, "LOGS.md");
const EVALS_PATH = path.join(SKILL_DIR, "EVALS.json");

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    result: null,
    phase: null,
    agent: null,
    notes: null,
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];
    if (key in parsed) {
      parsed[key] = value;
    }
  }

  return parsed;
}

function validateArgs(args) {
  if (!args.result || !["success", "failure"].includes(args.result)) {
    console.error('Error: --result must be "success" or "failure"');
    process.exit(2);
  }
}

function logUsage(args) {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
  const logEntry = `
## ${timestamp}
- **結果**: ${args.result}
${args.phase ? `- **Phase**: ${args.phase}` : ""}
${args.agent ? `- **エージェント**: ${args.agent}` : ""}
${args.notes ? `- **ノート**: ${args.notes}` : ""}
`;

  try {
    let logs = fs.readFileSync(LOGS_PATH, "utf-8");
    logs = logs.replace(
      "<!-- ここに使用記録が追記されます -->",
      `${logEntry}\n<!-- ここに使用記録が追記されます -->`,
    );
    fs.writeFileSync(LOGS_PATH, logs, "utf-8");
    console.log("Usage logged successfully");
  } catch (error) {
    console.error("Failed to write logs:", error.message);
    process.exit(1);
  }
}

function updateEvals(args) {
  try {
    const evals = JSON.parse(fs.readFileSync(EVALS_PATH, "utf-8"));

    evals.metrics.usageCount += 1;
    if (args.result === "success") {
      evals.metrics.successCount += 1;
    } else {
      evals.metrics.failureCount += 1;
    }
    evals.metrics.successRate =
      evals.metrics.successCount / evals.metrics.usageCount;

    // Check level thresholds
    if (
      evals.metrics.usageCount >= evals.thresholds.level4.usageCount &&
      evals.metrics.successRate >= evals.thresholds.level4.successRate
    ) {
      evals.level.current = 4;
      evals.level.maxAchieved = Math.max(evals.level.maxAchieved, 4);
    } else if (
      evals.metrics.usageCount >= evals.thresholds.level3.usageCount &&
      evals.metrics.successRate >= evals.thresholds.level3.successRate
    ) {
      evals.level.current = 3;
      evals.level.maxAchieved = Math.max(evals.level.maxAchieved, 3);
    } else if (
      evals.metrics.usageCount >= evals.thresholds.level2.usageCount &&
      evals.metrics.successRate >= evals.thresholds.level2.successRate
    ) {
      evals.level.current = 2;
      evals.level.maxAchieved = Math.max(evals.level.maxAchieved, 2);
    }

    evals.lastEvaluation = new Date().toISOString();

    fs.writeFileSync(EVALS_PATH, JSON.stringify(evals, null, 2), "utf-8");
    console.log("Evals updated successfully");
    console.log(`Current level: ${evals.level.current}`);
    console.log(
      `Success rate: ${(evals.metrics.successRate * 100).toFixed(1)}%`,
    );
  } catch (error) {
    console.error("Failed to update evals:", error.message);
    process.exit(1);
  }
}

// Main
const args = parseArgs();
validateArgs(args);
logUsage(args);
updateEvals(args);
