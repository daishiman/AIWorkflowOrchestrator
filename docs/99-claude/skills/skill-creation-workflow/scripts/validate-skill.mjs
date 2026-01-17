#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 必須ファイル、必須ディレクトリ、frontmatterの要素を確認します。
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");
const SKILLS_DIR = join(SKILL_DIR, "..");
const SKILL_LIST = join(SKILLS_DIR, "skill_list.md");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

const REQUIRED_FILES = ["SKILL.md"];
const REQUIRED_DIRS = ["agents", "assets", "references", "scripts"];
const REQUIRED_SKILL_LIST_ENTRY =
  ".claude/skills/skill-creation-workflow/SKILL.md";

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help    Show this help message
  `);
}

function assertExists(path, label) {
  try {
    statSync(path);
  } catch (err) {
    console.error(`Missing: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function listFiles(dir) {
  return readdirSync(dir).filter((entry) => {
    if (entry.startsWith(".")) {
      return false;
    }
    const fullPath = join(dir, entry);
    return statSync(fullPath).isFile();
  });
}

function validateNonEmptyDir(dir, label) {
  const files = listFiles(dir);
  if (files.length === 0) {
    console.error(`Directory is empty: ${label} (${dir})`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

function validateSkillMd() {
  const path = join(SKILL_DIR, "SKILL.md");
  const content = readFileSync(path, "utf-8");
  const lineCount = content.split("\n").length;

  if (lineCount > 500) {
    console.error(`Line limit exceeded: SKILL.md (${lineCount}/500)`);
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (!content.includes("Anchors:")) {
    console.error("SKILL.md missing Anchors in description");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  if (!content.includes("Trigger:")) {
    console.error("SKILL.md missing Trigger in description");
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

function validateSkillList() {
  try {
    const content = readFileSync(SKILL_LIST, "utf-8");
    if (!content.includes(REQUIRED_SKILL_LIST_ENTRY)) {
      console.error("skill_list.md missing skill-creation-workflow entry");
      process.exit(EXIT_VALIDATION_ERROR);
    }
  } catch (err) {
    console.error(`Failed to read skill_list.md: ${err.message}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  for (const file of REQUIRED_FILES) {
    assertExists(join(SKILL_DIR, file), file);
  }

  for (const dir of REQUIRED_DIRS) {
    assertExists(join(SKILL_DIR, dir), dir);
    validateNonEmptyDir(join(SKILL_DIR, dir), dir);
  }

  validateSkillMd();
  validateSkillList();

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
