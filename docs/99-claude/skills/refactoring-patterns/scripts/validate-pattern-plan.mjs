#!/usr/bin/env node
/**
 * Validate pattern refactor plan template.
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

const REQUIRED_HEADINGS = [
  "## 目的",
  "## 対象範囲",
  "## 現状の課題",
  "## 適用候補パターン",
  "## 変更ステップ",
  "## テスト/検証",
  "## ロールバック",
  "## 完了条件",
];

function showHelp() {
  console.log(`
Validate pattern refactor plan

Usage:
  node validate-pattern-plan.mjs --file <path>

Options:
  --file <path>   Target plan file (required)
  -h, --help      Show this help
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

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const fileArg = getArg(args, "--file");
  requireArg(fileArg, "--file");

  const filePath = resolve(process.cwd(), fileArg);
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const missing = REQUIRED_HEADINGS.filter(
      (heading) => !content.includes(heading),
    );

    if (missing.length > 0) {
      console.error(
        `Validation failed: missing headings: ${missing.join(", ")}`,
      );
      process.exit(EXIT_VALIDATION_FAILED);
    }

    if (content.includes("{{")) {
      console.error(
        "Validation failed: unresolved template placeholders found",
      );
      process.exit(EXIT_VALIDATION_FAILED);
    }

    console.log(
      "✓ Validation passed: required headings and placeholders checked",
    );
    process.exit(EXIT_SUCCESS);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
