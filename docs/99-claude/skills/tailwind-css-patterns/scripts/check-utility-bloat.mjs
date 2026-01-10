#!/usr/bin/env node
/**
 * Utility bloat checker.
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: file not found
 *   4: validation failed
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_NOT_FOUND = 3;
const EXIT_VALIDATION_FAILED = 4;

function showHelp() {
  console.log(`
Utility Bloat Checker

Usage:
  node check-utility-bloat.mjs --file <tsx|html> [--threshold <n>]

Options:
  --file <path>        Target file (required)
  --threshold <count>  Class count threshold (default: 24)
  -h, --help           Show this help
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function requireArg(value, name) {
  if (!value) {
    console.error(`Error: ${name} is required`);
    process.exit(EXIT_ARGS_ERROR);
  }
}

function parseThreshold(value) {
  if (!value) return 24;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    console.error("Error: --threshold must be a positive integer");
    process.exit(EXIT_ARGS_ERROR);
  }
  return parsed;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const fileArg = getArg(args, "--file");
  const threshold = parseThreshold(getArg(args, "--threshold"));

  requireArg(fileArg, "--file");

  const filePath = resolve(process.cwd(), fileArg);
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`Error: failed to read file: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  const regexes = [
    /className\s*=\s*"([^"]+)"/g,
    /className\s*=\s*'([^']+)'/g,
    /class\s*=\s*"([^"]+)"/g,
    /class\s*=\s*'([^']+)'/g,
  ];

  const findings = [];

  for (const regex of regexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const classes = match[1].trim().split(/\s+/).filter(Boolean);
      if (classes.length >= threshold) {
        findings.push({
          count: classes.length,
          sample: classes.slice(0, 6).join(" "),
        });
      }
    }
  }

  if (findings.length === 0) {
    console.log("No oversized class lists found.");
    process.exit(EXIT_SUCCESS);
  }

  console.error(
    `Found ${findings.length} oversized class lists (>= ${threshold}).`,
  );
  findings.forEach((item, index) => {
    console.error(`- [${index + 1}] count=${item.count} sample="${item.sample}..."`);
  });
  process.exit(EXIT_VALIDATION_FAILED);
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
}
