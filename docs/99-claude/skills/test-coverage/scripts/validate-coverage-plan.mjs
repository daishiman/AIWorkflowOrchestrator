#!/usr/bin/env node

/**
 * 改善計画テンプレート検証
 */

import { readFileSync, statSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const REQUIRED_HEADINGS = [
  "## 目的",
  "## 優先順位",
  "## 実施ステップ",
  "## 検証",
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-coverage-plan.mjs --file <path>

Options:
  --file <path>  検証対象のMarkdownファイル
  -h, --help     ヘルプ表示
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

function extractSection(lines, heading) {
  const startIndex = lines.findIndex((line) => line.trim() === heading);
  if (startIndex === -1) return [];
  const nextIndex = lines.findIndex(
    (line, idx) => idx > startIndex && line.startsWith("## "),
  );
  const endIndex = nextIndex === -1 ? lines.length : nextIndex;
  return lines.slice(startIndex + 1, endIndex);
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
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  const missing = REQUIRED_HEADINGS.filter(
    (heading) => !content.includes(heading),
  );
  if (missing.length > 0) {
    console.error(`Error: missing headings: ${missing.join(", ")}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const steps = extractSection(lines, "## 実施ステップ");
  const stepCount = steps.filter((line) => /^\d+\./.test(line.trim())).length;
  if (stepCount === 0) {
    console.error("Error: no steps found in 実施ステップ");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("✓ coverage plan looks valid");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err?.message || "Unknown error");
  process.exit(EXIT_ERROR);
});
