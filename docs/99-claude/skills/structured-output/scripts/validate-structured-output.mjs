#!/usr/bin/env node
/**
 * Structured output validator.
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
Structured Output Validator

Usage:
  node validate-structured-output.mjs --schema <schema.json> --output <output.json>

Options:
  --schema <path>   Schema file (required)
  --output <path>   Output file to validate (required)
  -h, --help        Show this help
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

function readJson(path) {
  const content = readFileSync(path, "utf-8");
  return JSON.parse(content);
}

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const schemaArg = getArg(args, "--schema");
  const outputArg = getArg(args, "--output");

  requireArg(schemaArg, "--schema");
  requireArg(outputArg, "--output");

  const schemaPath = resolve(process.cwd(), schemaArg);
  const outputPath = resolve(process.cwd(), outputArg);

  if (!existsSync(schemaPath)) {
    console.error(`Error: schema not found: ${schemaPath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  if (!existsSync(outputPath)) {
    console.error(`Error: output not found: ${outputPath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  let schema;
  let output;
  try {
    schema = readJson(schemaPath);
  } catch (err) {
    console.error(`Error: failed to parse schema JSON: ${err.message}`);
    process.exit(EXIT_VALIDATION_FAILED);
  }

  try {
    output = readJson(outputPath);
  } catch (err) {
    console.error(`Error: failed to parse output JSON: ${err.message}`);
    process.exit(EXIT_VALIDATION_FAILED);
  }

  if (typeOf(output) !== "object") {
    console.error("Validation failed: output must be a JSON object");
    process.exit(EXIT_VALIDATION_FAILED);
  }

  const errors = [];
  const required = Array.isArray(schema.required) ? schema.required : [];
  const allowedKeys = Array.isArray(schema.allowedKeys)
    ? schema.allowedKeys
    : null;
  const types =
    schema.types && typeof schema.types === "object" ? schema.types : {};

  for (const key of required) {
    if (!(key in output)) {
      errors.push(`Missing required key: ${key}`);
    }
  }

  if (allowedKeys) {
    for (const key of Object.keys(output)) {
      if (!allowedKeys.includes(key)) {
        errors.push(`Unexpected key: ${key}`);
      }
    }
  }

  for (const [key, expectedType] of Object.entries(types)) {
    if (!(key in output)) continue;
    const actualType = typeOf(output[key]);
    if (actualType !== expectedType) {
      errors.push(
        `Type mismatch for ${key}: expected ${expectedType}, got ${actualType}`,
      );
    }
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    errors.forEach((message) => console.error(`- ${message}`));
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
