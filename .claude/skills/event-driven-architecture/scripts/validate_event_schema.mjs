#!/usr/bin/env node
/**
 * Event Schema Validator
 * Validates event schemas against EDA best practices
 * Usage: node validate_event_schema.mjs <schema-file>
 */

import { readFile } from "fs/promises";
import { resolve } from "path";

const REQUIRED_FIELDS = ["eventType", "version", "timestamp", "correlationId"];
const RECOMMENDED_FIELDS = ["source", "eventId", "data"];

async function validateSchema(schemaPath) {
  try {
    const content = await readFile(resolve(schemaPath), "utf-8");
    let schema;

    try {
      schema = JSON.parse(content);
    } catch {
      console.error("❌ Invalid JSON syntax");
      process.exit(1);
    }

    const errors = [];
    const warnings = [];

    // Check required fields in properties
    const properties = schema.properties || {};

    for (const field of REQUIRED_FIELDS) {
      if (!properties[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    for (const field of RECOMMENDED_FIELDS) {
      if (!properties[field]) {
        warnings.push(`Missing recommended field: ${field}`);
      }
    }

    // Check version format
    if (properties.version && properties.version.type !== "string") {
      warnings.push("version should be a string (e.g., '1.0.0')");
    }

    // Check timestamp format
    if (properties.timestamp && !properties.timestamp.format) {
      warnings.push("timestamp should have format: 'date-time'");
    }

    // Check eventType enum
    if (
      properties.eventType &&
      !properties.eventType.enum &&
      !properties.eventType.const
    ) {
      warnings.push("eventType should have enum or const constraint");
    }

    // Output results
    console.log(`\nValidating: ${schemaPath}\n`);

    if (errors.length === 0) {
      console.log("✅ Schema is valid");
    } else {
      console.log("❌ Validation failed:");
      errors.forEach((e) => console.log(`  - ${e}`));
    }

    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach((w) => console.log(`  - ${w}`));
    }

    // Summary
    console.log("\n📊 Summary:");
    console.log(`  Properties defined: ${Object.keys(properties).length}`);
    console.log(`  Required fields: ${(schema.required || []).length}`);

    process.exit(errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
}

const schemaPath = process.argv[2];

if (!schemaPath || schemaPath === "-h" || schemaPath === "--help") {
  console.log(`
Event Schema Validator

Usage:
  node validate_event_schema.mjs <schema-file>

Arguments:
  schema-file    Path to JSON Schema file

Examples:
  node validate_event_schema.mjs events/user-created.schema.json
`);
  process.exit(schemaPath ? 0 : 2);
}

validateSchema(schemaPath);
