#!/usr/bin/env node

import { statSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage: node validate-skill.mjs [options]

Options:
  --skill-dir <path>  Skill directory path (default: current skill dir)
  -h, --help          Show this help message
  `);
}

function fail(message, code) {
  console.error(message);
  process.exit(code);
}

function ensureExists(path, label) {
  try {
    statSync(path);
  } catch {
    fail(`Missing: ${label} (${path})`, EXIT_FILE_MISSING);
  }
}

function ensureSkillFile(path) {
  const content = readFileSync(path, "utf-8");
  if (!content.includes("Anchors:")) {
    fail("SKILL.md is missing Anchors section", EXIT_VALIDATION_ERROR);
  }
  if (!content.includes("Trigger:")) {
    fail("SKILL.md is missing Trigger section", EXIT_VALIDATION_ERROR);
  }
}

function parseArgs(args) {
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }
  const dirIndex = args.indexOf("--skill-dir");
  if (dirIndex !== -1) {
    const dir = args[dirIndex + 1];
    if (!dir || dir.startsWith("-")) {
      fail("Missing value for --skill-dir", EXIT_ARGS_ERROR);
    }
    return dir;
  }
  return DEFAULT_SKILL_DIR;
}

function main() {
  const skillDir = parseArgs(process.argv.slice(2));

  const requiredFiles = [
    "SKILL.md",
    "agents/requirements-analysis.md",
    "agents/consistency-checker.md",
    "agents/completeness-validator.md",
    "agents/feasibility-assessor.md",
    "agents/improvement-suggester.md",
    "assets/verification-checklist.md",
    "assets/verification-report-template.md",
    "references/Level1_basics.md",
    "references/Level2_intermediate.md",
    "references/Level3_advanced.md",
    "references/Level4_expert.md",
    "references/verification-techniques.md",
    "scripts/verify-requirements.mjs",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
  ];

  for (const file of requiredFiles) {
    ensureExists(join(skillDir, file), file);
  }

  ensureSkillFile(join(skillDir, "SKILL.md"));

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (error) {
  fail(error.message || "Unexpected error", EXIT_ERROR);
}
