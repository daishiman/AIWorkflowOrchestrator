#!/usr/bin/env node
/**
 * 例示テンプレート検証スクリプト
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
  "## リクエスト例",
  "## 成功レスポンス例",
  "## エラーレスポンス例",
];

const REQUIRED_ERROR_FIELDS = ["type", "title", "status", "detail"];

function showHelp() {
  console.log(`
例示テンプレート検証

Usage:
  node scripts/validate-examples.mjs --file <path>

Options:
  --file <path>   対象ファイル（必須）
  -h, --help      ヘルプを表示
`);
}

function getArg(args, name) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
}

function requireArg(value, name) {
  if (!value) {
    console.error(`Error: ${name} が必要です`);
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

    const missingHeadings = REQUIRED_HEADINGS.filter(
      (heading) => !content.includes(heading),
    );
    if (missingHeadings.length > 0) {
      console.error(
        `Validation failed: missing headings: ${missingHeadings.join(", ")}`,
      );
      process.exit(EXIT_VALIDATION_FAILED);
    }

    if (content.includes("{{")) {
      console.error(
        "Validation failed: unresolved template placeholders found",
      );
      process.exit(EXIT_VALIDATION_FAILED);
    }

    const missingFields = REQUIRED_ERROR_FIELDS.filter(
      (field) =>
        !content.includes(`"${field}"`) && !content.includes(`${field}:`),
    );
    if (missingFields.length > 0) {
      console.error(
        `Validation failed: missing error fields: ${missingFields.join(", ")}`,
      );
      process.exit(EXIT_VALIDATION_FAILED);
    }

    console.log("Validation passed: required sections and fields are present");
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
