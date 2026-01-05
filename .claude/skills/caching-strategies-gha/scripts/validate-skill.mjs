#!/usr/bin/env node

/**
 * Caching strategies GHA skill validation script
 *
 * Usage:
 *   node scripts/validate-skill.mjs [--verbose]
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: file missing
 *   4: validation failed
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Caching Strategies GHA skill validation

Usage:
  node scripts/validate-skill.mjs [options]

Options:
  --verbose       Show details
  -h, --help      Show this help message
  `);
}

function assertExists(path, label, errors) {
  if (!existsSync(path)) {
    errors.push(`Missing: ${label} (${path})`);
  }
}

function validateLineLimit(path, limit, errors, passed) {
  const content = readFileSync(path, "utf-8");
  const count = content.split("\n").length;
  if (count > limit) {
    errors.push(`Line limit exceeded: ${path} (${count}/${limit})`);
  } else {
    passed.push(`Line count OK: ${path} (${count}/${limit})`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const verbose = args.includes("--verbose");
  const unknownArgs = args.filter(
    (arg) => arg.startsWith("-") && arg !== "--verbose",
  );
  if (unknownArgs.length > 0) {
    console.error(`Error: Unknown options: ${unknownArgs.join(", ")}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  const errors = [];
  const warnings = [];
  const passed = [];

  const requiredFiles = [
    "SKILL.md",
    "assets/cache-examples.yaml",
    "scripts/estimate-cache-size.mjs",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
    "references/Level1_basics.md",
    "references/Level2_intermediate.md",
    "references/Level3_advanced.md",
    "references/Level4_expert.md",
    "references/cache-action.md",
    "references/cache-patterns.md",
    "references/cache-optimization.md",
    "references/legacy-skill.md",
    "agents/analyze-cache-requirements.md",
    "agents/design-cache-keys.md",
    "agents/optimize-cache-strategy.md",
    "agents/validate-cache-impact.md",
  ];

  for (const file of requiredFiles) {
    assertExists(join(SKILL_DIR, file), file, errors);
  }

  const skillPath = join(SKILL_DIR, "SKILL.md");
  if (existsSync(skillPath)) {
    validateLineLimit(skillPath, 500, errors, passed);
  }

  if (verbose) {
    if (passed.length > 0) {
      console.log("\n✓ Passed:");
      passed.forEach((item) => console.log(`  - ${item}`));
    }
    if (warnings.length > 0) {
      console.log("\n⚠ Warnings:");
      warnings.forEach((item) => console.log(`  - ${item}`));
    }
  }

  if (errors.length > 0) {
    console.error("\n✗ Errors:");
    errors.forEach((item) => console.error(`  - ${item}`));
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n✓ Validation completed");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
