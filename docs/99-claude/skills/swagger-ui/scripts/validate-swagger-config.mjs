#!/usr/bin/env node
/**
 * Swagger UI config validator.
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
Swagger UI Config Validator

Usage:
  node validate-swagger-config.mjs --file <config.json>

Options:
  --file <path>   Config file (required)
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

  const fileArg = getArg(args, "--file");
  requireArg(fileArg, "--file");

  const filePath = resolve(process.cwd(), fileArg);
  if (!existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  let config;
  try {
    config = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(`Error: failed to parse JSON: ${err.message}`);
    process.exit(EXIT_VALIDATION_FAILED);
  }

  const hasUrl = typeof config.url === "string" && config.url.length > 0;
  const hasUrls = Array.isArray(config.urls) && config.urls.length > 0;

  if (!hasUrl && !hasUrls) {
    console.error("Validation failed: config must include url or non-empty urls");
    process.exit(EXIT_VALIDATION_FAILED);
  }

  if (hasUrls) {
    const invalid = config.urls.filter(
      (entry) => !entry || typeof entry.url !== "string" || entry.url.length === 0,
    );
    if (invalid.length > 0) {
      console.error("Validation failed: each urls entry must include a string url");
      process.exit(EXIT_VALIDATION_FAILED);
    }
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
