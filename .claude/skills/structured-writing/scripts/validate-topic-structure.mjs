#!/usr/bin/env node
/**
 * Topic structure validator.
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

const REQUIRED_MAP = {
  concept: ["概要", "背景", "重要ポイント"],
  task: ["目的", "前提条件", "手順", "期待結果"],
  reference: ["概要", "仕様", "例"],
};

function showHelp() {
  console.log(`
Topic Structure Validator

Usage:
  node validate-topic-structure.mjs --type <concept|task|reference> --file <doc.md>

Options:
  --type <type>   Topic type (required)
  --file <path>   Markdown file (required)
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

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const typeArg = getArg(args, "--type");
  const fileArg = getArg(args, "--file");

  requireArg(typeArg, "--type");
  requireArg(fileArg, "--file");

  const required = REQUIRED_MAP[typeArg];
  if (!required) {
    console.error("Error: unknown type. Use concept, task, or reference.");
    process.exit(EXIT_ARGS_ERROR);
  }

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

  const missing = required.filter(
    (heading) => !content.includes(`## ${heading}`),
  );

  if (missing.length > 0) {
    console.error("Validation failed: missing required headings");
    missing.forEach((heading) => console.error(`- ${heading}`));
    process.exit(EXIT_VALIDATION_FAILED);
  }

  console.log("✓ Validation passed");
  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
}
