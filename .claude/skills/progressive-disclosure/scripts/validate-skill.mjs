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
    // EVALS.jsonは有効なJSONであれば良い（構造は柔軟に）
    if (!data || typeof data !== "object") {
      throw new Error(`EVALS.json must be a valid JSON object`);
    }
    // メトリクスフィールドの存在確認（柔軟に）
    if (!data.metrics) {
      console.warn("Warning: EVALS.json missing metrics field");
    }
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

  for (const file of requiredFiles) {
    assertExists(join(SKILL_DIR, file), file);
  }

  validateLineLimit(join(SKILL_DIR, "SKILL.md"), 500);
  validateLineLimit(join(SKILL_DIR, "references/Level1_basics.md"), 200);
  validateLineLimit(join(SKILL_DIR, "references/Level2_intermediate.md"), 300);
  validateLineLimit(join(SKILL_DIR, "references/Level3_advanced.md"), 400);
  validateLineLimit(join(SKILL_DIR, "references/Level4_expert.md"), 500);

  validateEvals(join(SKILL_DIR, "EVALS.json"));

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
