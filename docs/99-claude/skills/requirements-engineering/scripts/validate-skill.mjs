#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 必須ファイル、ディレクトリ、行数制約を確認します。
 */

import { readFileSync, statSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const REQUIRED_DIRS = ["agents", "assets", "references", "scripts"];
const REQUIRED_FILES = [
  "SKILL.md",
  "EVALS.json",
  "LOGS.md",
  "CHANGELOG.md",
  "assets/requirements-document.md",
  "scripts/log_usage.mjs",
  "scripts/validate-requirements.mjs",
  "scripts/validate-skill.mjs",
  "references/Level1_basics.md",
  "references/Level2_intermediate.md",
  "references/Level3_advanced.md",
  "references/Level4_expert.md",
  "references/ambiguity-detection.md",
  "references/completeness-checklist.md",
  "references/quality-criteria.md",
  "references/triage-framework.md",
  "references/requirements-index.md",
];

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

function assertNonEmptyDir(path, label) {
  try {
    const entries = readdirSync(path).filter((entry) => entry !== ".DS_Store");
    if (entries.length === 0) {
      console.error(`Empty directory: ${label} (${path})`);
      process.exit(EXIT_VALIDATION_ERROR);
    }
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

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  for (const dir of REQUIRED_DIRS) {
    assertNonEmptyDir(join(SKILL_DIR, dir), dir);
  }

  for (const file of REQUIRED_FILES) {
    assertExists(join(SKILL_DIR, file), file);
  }

  const agentFiles = readdirSync(join(SKILL_DIR, "agents")).filter((file) =>
    file.endsWith(".md"),
  );
  if (agentFiles.length === 0) {
    console.error("No agent task files found in agents/");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  validateLineLimit(join(SKILL_DIR, "SKILL.md"), 500);

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
