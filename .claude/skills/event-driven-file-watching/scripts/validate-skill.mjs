#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 必須ファイル、行数制約、EVALS.json の構造を確認します。
 */

import { readFileSync, statSync } from "fs";
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
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help    Show this help message
  `);
}

function getLineCount(path) {
  const content = readFileSync(path, "utf-8");
  return content.split("\n").length;
}

function assertExists(path, label) {
  try {
    statSync(path);
  } catch (err) {
    console.error(`Missing: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function validateLineLimit(path, limit) {
  const count = getLineCount(path);
  if (count > limit) {
    console.error(`Line limit exceeded: ${path} (${count}/${limit})`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

function validateEvals(path) {
  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));

    // Validate top-level structure
    if (
      !data.metadata ||
      !data.usage_stats ||
      !data.performance_metrics ||
      !data.level_progression
    ) {
      throw new Error("EVALS.json missing required top-level fields");
    }

    // Validate metadata
    if (!data.metadata.skill_name || !data.metadata.version) {
      throw new Error("EVALS.json metadata incomplete");
    }

    // Validate usage_stats
    const usageFields = [
      "total_invocations",
      "successful_executions",
      "failed_executions",
    ];
    for (const field of usageFields) {
      if (!(field in data.usage_stats)) {
        throw new Error(`EVALS.json usage_stats missing ${field}`);
      }
    }

    // Validate level_progression
    if (
      !data.level_progression.current_level ||
      !data.level_progression.level_history
    ) {
      throw new Error("EVALS.json level_progression incomplete");
    }

    console.log("✓ EVALS.json structure valid");
  } catch (err) {
    console.error(`EVALS.json validation error: ${err.message}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 18-skills specification required files
  const requiredFiles = [
    "SKILL.md",
    "EVALS.json",
    "LOGS.md",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
    "references/Level1_basics.md",
    "references/Level2_intermediate.md",
    "references/Level3_advanced.md",
    "references/Level4_expert.md",
  ];

  console.log("Validating required files...");
  for (const file of requiredFiles) {
    assertExists(join(SKILL_DIR, file), file);
  }
  console.log("✓ All required files present");

  console.log("\nValidating line limits...");
  validateLineLimit(join(SKILL_DIR, "SKILL.md"), 500);
  console.log("✓ SKILL.md within limit");

  // References can be longer for detailed knowledge
  validateLineLimit(join(SKILL_DIR, "references/Level1_basics.md"), 300);
  validateLineLimit(join(SKILL_DIR, "references/Level2_intermediate.md"), 500);
  validateLineLimit(join(SKILL_DIR, "references/Level3_advanced.md"), 700);
  validateLineLimit(join(SKILL_DIR, "references/Level4_expert.md"), 1000);
  console.log("✓ All reference files within limits");

  validateEvals(join(SKILL_DIR, "EVALS.json"));

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
