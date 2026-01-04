#!/usr/bin/env node

/**
 * Approval gate skill validation script
 *
 * Checks required files and validates gate spec template usage.
 *
 * Usage:
 *   node scripts/validate-skill.mjs [--spec <path>] [--verbose]
 *
 * Exit codes:
 *   0: success
 *   1: general error
 *   2: argument error
 *   3: file missing
 *   4: validation failed
 */

import { readFileSync, existsSync, statSync } from "fs";
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
Approval Gates skill validation

Usage:
  node scripts/validate-skill.mjs [options]

Options:
  --spec <path>   Validate a gate spec file (optional)
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

function validateGateSpec(specPath, errors, passed) {
  if (!existsSync(specPath)) {
    errors.push(`Spec file not found: ${specPath}`);
    return;
  }

  const content = readFileSync(specPath, "utf-8");
  const requiredSections = [
    "Gate Overview",
    "Change Context",
    "Approval Roles",
    "Gate Conditions",
    "Automated Checks",
    "Manual Reviews",
    "Evidence Required",
    "Exceptions",
    "Rollback and Recovery",
    "Audit Trail",
  ];

  const missing = [];
  for (const section of requiredSections) {
    const pattern = new RegExp(`^#+\\s+${section}\\b`, "mi");
    if (!pattern.test(content)) {
      missing.push(section);
    }
  }

  if (missing.length > 0) {
    missing.forEach((section) =>
      errors.push(`Spec missing section: ${section}`),
    );
  } else {
    passed.push("Gate spec required sections present");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const verbose = args.includes("--verbose");
  const specIndex = args.indexOf("--spec");
  const specPath =
    specIndex !== -1 && args[specIndex + 1] ? args[specIndex + 1] : null;

  const errors = [];
  const warnings = [];
  const passed = [];

  const requiredFiles = [
    "SKILL.md",
    "assets/approval-gate-spec-template.md",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
    "references/Level1_basics.md",
    "references/Level2_intermediate.md",
    "references/Level3_advanced.md",
    "references/Level4_expert.md",
    "references/requirements-index.md",
    "agents/risk-assessment.md",
    "agents/gate-design.md",
    "agents/automation-check.md",
    "agents/implementation-review.md",
  ];

  for (const file of requiredFiles) {
    assertExists(join(SKILL_DIR, file), file, errors);
  }

  const skillPath = join(SKILL_DIR, "SKILL.md");
  if (existsSync(skillPath)) {
    validateLineLimit(skillPath, 500, errors, passed);
  }

  if (specPath) {
    validateGateSpec(specPath, errors, passed);
  } else {
    warnings.push("Spec file not provided; skip gate spec validation");
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
