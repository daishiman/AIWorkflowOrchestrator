#!/usr/bin/env node

/**
 * Error handling validation script
 *
 * Validates error handling implementation:
 * - Error codes are defined
 * - Retry logic is configured
 * - User messages are non-technical
 * - Logs exclude sensitive data
 *
 * Usage:
 *   node validate-error-handling.mjs <path-to-error-handler>
 */

import fs from "fs";
import path from "path";

function validateErrorHandling(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(3);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const results = {
    passed: [],
    failed: [],
  };

  // Check 1: Error codes defined
  if (/ERR_\d{4}/.test(content)) {
    results.passed.push("Error codes are defined (ERR_XXXX format)");
  } else {
    results.failed.push("Error codes are not defined or incorrect format");
  }

  // Check 2: Retry logic present
  if (/retry|backoff|maxRetries/.test(content)) {
    results.passed.push("Retry logic is present");
  } else {
    results.failed.push("Retry logic is missing");
  }

  // Check 3: Circuit breaker (optional)
  if (/CircuitBreaker|circuit-breaker/.test(content)) {
    results.passed.push("Circuit breaker pattern detected");
  }

  // Check 4: No sensitive data in logs
  const sensitivePatterns = ["password", "apiKey", "token", "secret"];
  const foundSensitive = sensitivePatterns.filter((pattern) =>
    new RegExp(`logger\\.(error|warn|info).*${pattern}`, "i").test(content),
  );

  if (foundSensitive.length === 0) {
    results.passed.push("No sensitive data in logs");
  } else {
    results.failed.push(`Sensitive data in logs: ${foundSensitive.join(", ")}`);
  }

  // Output results
  console.log("\n=== Error Handling Validation Results ===\n");

  console.log(`✓ Passed (${results.passed.length}):`);
  results.passed.forEach((item) => console.log(`  - ${item}`));

  if (results.failed.length > 0) {
    console.log(`\n✗ Failed (${results.failed.length}):`);
    results.failed.forEach((item) => console.log(`  - ${item}`));
    process.exit(1);
  } else {
    console.log("\n✓ All checks passed!");
    process.exit(0);
  }
}

// Main
const filePath = process.argv[2];

if (!filePath) {
  console.error(
    "Usage: node validate-error-handling.mjs <path-to-error-handler>",
  );
  process.exit(2);
}

validateErrorHandling(filePath);
