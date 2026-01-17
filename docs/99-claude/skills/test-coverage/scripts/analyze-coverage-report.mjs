#!/usr/bin/env node

/**
 * カバレッジレポート解析
 */

import { readFileSync, statSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage: node scripts/analyze-coverage-report.mjs --file <path> [options]

Options:
  --file <path>          coverage-summary.json
  --min-lines <number>   Lineの閾値（既定: 0）
  --min-branches <number> Branchの閾値（既定: 0）
  --min-functions <number> Functionの閾値（既定: 0）
  --min-statements <number> Statementの閾値（既定: 0）
  -h, --help            ヘルプ表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 ? args[index + 1] : null;
}

function assertFile(path) {
  try {
    statSync(path);
  } catch {
    console.error(`Error: file not found: ${path}`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function toNumber(value, label) {
  if (value === null || value === undefined) return 0;
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    console.error(`Error: ${label} must be a number`);
    process.exit(EXIT_ARGS_ERROR);
  }
  return numberValue;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const filePath = getArg(args, "--file");
  if (!filePath) {
    console.error("Error: --file is required");
    process.exit(EXIT_ARGS_ERROR);
  }

  assertFile(filePath);

  const minLines = toNumber(getArg(args, "--min-lines"), "min-lines");
  const minBranches = toNumber(getArg(args, "--min-branches"), "min-branches");
  const minFunctions = toNumber(
    getArg(args, "--min-functions"),
    "min-functions",
  );
  const minStatements = toNumber(
    getArg(args, "--min-statements"),
    "min-statements",
  );

  let report;
  try {
    report = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    console.error("Error: invalid JSON");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const total = report.total || {};
  const metrics = {
    lines: total.lines?.pct ?? 0,
    branches: total.branches?.pct ?? 0,
    functions: total.functions?.pct ?? 0,
    statements: total.statements?.pct ?? 0,
  };

  console.log("Coverage summary:");
  console.log(`- Line: ${metrics.lines}`);
  console.log(`- Branch: ${metrics.branches}`);
  console.log(`- Function: ${metrics.functions}`);
  console.log(`- Statement: ${metrics.statements}`);

  const failures = [];
  if (metrics.lines < minLines) failures.push(`lines < ${minLines}`);
  if (metrics.branches < minBranches)
    failures.push(`branches < ${minBranches}`);
  if (metrics.functions < minFunctions)
    failures.push(`functions < ${minFunctions}`);
  if (metrics.statements < minStatements)
    failures.push(`statements < ${minStatements}`);

  if (failures.length > 0) {
    console.error(`Error: thresholds not met: ${failures.join(", ")}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("✓ coverage thresholds met");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err?.message || "Unknown error");
  process.exit(EXIT_ERROR);
});
