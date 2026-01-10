#!/usr/bin/env node
/**
 * JSON Schema validator (lightweight).
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
JSON Schema Validator

Usage:
  node validate-schema.mjs --schema <schema.json>

Options:
  --schema <path>   JSON Schema file (required)
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

function validateSchema(schema) {
  const errors = [];
  const warnings = [];

  if (!schema || typeof schema !== "object") {
    errors.push("Schema must be a JSON object");
    return { errors, warnings };
  }

  if (!schema.$schema) {
    warnings.push("$schema が未定義です (推奨: draft-07 以上)");
  }

  if (!schema.type) {
    errors.push("type が未定義です");
  }

  if (schema.type === "object") {
    if (!schema.properties) {
      warnings.push("properties が未定義です");
    }

    if (schema.additionalProperties === undefined) {
      warnings.push("additionalProperties が未定義です");
    }

    if (schema.properties && !schema.required) {
      warnings.push("required が未定義です");
    }

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (!prop.type && !prop.$ref && !prop.oneOf && !prop.anyOf) {
          warnings.push(`プロパティ ${key} に型がありません`);
        }
        if (!prop.description) {
          warnings.push(`プロパティ ${key} に description がありません`);
        }
      }
    }
  }

  if (schema.type === "array") {
    if (!schema.items) {
      errors.push("array 型には items が必要です");
    }
  }

  return { errors, warnings };
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const schemaArg = getArg(args, "--schema");
  requireArg(schemaArg, "--schema");

  const schemaPath = resolve(process.cwd(), schemaArg);
  if (!existsSync(schemaPath)) {
    console.error(`Error: file not found: ${schemaPath}`);
    process.exit(EXIT_FILE_NOT_FOUND);
  }

  let schema;
  try {
    schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  } catch (err) {
    console.error(`Error: failed to parse JSON: ${err.message}`);
    process.exit(EXIT_VALIDATION_FAILED);
  }

  const { errors, warnings } = validateSchema(schema);

  if (warnings.length > 0) {
    console.warn("Warnings:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(EXIT_VALIDATION_FAILED);
  }

  console.log("✓ Schema validation passed");
  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
}
