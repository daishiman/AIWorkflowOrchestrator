#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 必須ファイルの存在と SKILL.md の行数、参照リンクを確認します。
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

const requiredFiles = [
  "SKILL.md",
  "EVALS.json",
  "LOGS.md",
  "agents/naming-requirements.md",
  "agents/naming-pattern-design.md",
  "agents/naming-enforcement-review.md",
  "references/Level1_basics.md",
  "references/Level2_intermediate.md",
  "references/Level3_advanced.md",
  "references/Level4_expert.md",
  "references/naming-patterns.md",
  "references/describe-structure.md",
  "references/file-organization.md",
  "assets/naming-guide.md",
  "scripts/test-name-linter.mjs",
  "scripts/log_usage.mjs",
  "scripts/validate-skill.mjs",
];

const referenceFiles = [
  "references/Level1_basics.md",
  "references/Level2_intermediate.md",
  "references/Level3_advanced.md",
  "references/Level4_expert.md",
  "references/naming-patterns.md",
  "references/describe-structure.md",
  "references/file-organization.md",
];

function showHelp() {
  console.log(`\nUsage: node scripts/validate-skill.mjs [options]\n\nOptions:\n  -h, --help    Show this help message\n`);
}

function getLineCount(content) {
  return content.split("\n").length;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const errors = [];
  const warnings = [];

  for (const file of requiredFiles) {
    const fullPath = join(SKILL_DIR, file);
    if (!existsSync(fullPath)) {
      errors.push(`Missing: ${file}`);
    }
  }

  if (!existsSync(join(SKILL_DIR, "SKILL.md"))) {
    console.error(errors.join("\n"));
    process.exit(EXIT_FILE_MISSING);
  }

  const skillContent = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf-8");
  const lineCount = getLineCount(skillContent);
  if (lineCount > 500) {
    errors.push(`SKILL.md line count exceeds 500 (${lineCount})`);
  }

  for (const ref of referenceFiles) {
    if (!skillContent.includes(ref)) {
      warnings.push(`SKILL.md missing reference link: ${ref}`);
    }
  }

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (warnings.length > 0) {
    console.warn(warnings.join("\n"));
  }

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(EXIT_ERROR);
}
