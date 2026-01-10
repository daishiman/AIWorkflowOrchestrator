#!/usr/bin/env node

/**
 * スキル構造検証スクリプト（18-skills.md仕様準拠）
 *
 * 必須ファイル（SKILL.md）の存在と行数制約を確認します。
 */

import { readFileSync, statSync, existsSync } from "fs";
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
    console.error(`❌ Missing: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function validateLineLimit(path, limit) {
  const count = getLineCount(path);
  if (count > limit) {
    console.error(
      `❌ Line limit exceeded: ${path} (${count} lines / ${limit} limit)`,
    );
    process.exit(EXIT_VALIDATION_ERROR);
  } else {
    console.log(`✅ ${path}: ${count} lines (within ${limit} limit)`);
  }
}

function checkOptionalDirectory(dirName) {
  const path = join(SKILL_DIR, dirName);
  if (existsSync(path)) {
    console.log(`✅ Optional directory exists: ${dirName}/`);
  } else {
    console.log(`ℹ️  Optional directory not found: ${dirName}/`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  console.log("🔍 Validating pre-commit-security skill structure...\n");

  // 必須ファイル
  console.log("1. Checking required files:");
  assertExists(join(SKILL_DIR, "SKILL.md"), "SKILL.md");
  console.log("   ✅ SKILL.md exists");

  // SKILL.md行数制限（500行以内）
  console.log("\n2. Checking line limits:");
  validateLineLimit(join(SKILL_DIR, "SKILL.md"), 500);

  // 任意ディレクトリの確認
  console.log("\n3. Checking optional directories:");
  checkOptionalDirectory("agents");
  checkOptionalDirectory("scripts");
  checkOptionalDirectory("references");
  checkOptionalDirectory("assets");

  console.log("\n✅ Skill structure validation passed!");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error("❌ Validation error:", err.message);
  process.exit(EXIT_ERROR);
});
