#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 18-skills.md仕様に基づいてスキル構造を検証します。
 */

import { readFileSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_FILE_MISSING = 3;
const EXIT_VALIDATION_ERROR = 4;

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help    Show this help message

18-skills.md仕様に基づいてスキル構造を検証します。

必須ファイル:
  - SKILL.md (500行以内)
  - SKILL.mdにYAML frontmatterが含まれる
  - frontmatterに name, description (Anchors, Trigger含む) が存在

推奨ファイル:
  - agents/ (Task仕様書)
  - references/ (詳細知識)
  - scripts/ (検証・自動化スクリプト)
  - assets/ (テンプレート)
  - LOGS.md (使用記録)
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
  console.log(`✓ ${path}: ${count}/${limit} lines`);
}

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error("No YAML frontmatter found");
  }
  return parse(match[1]);
}

function validateFrontmatter(path) {
  const content = readFileSync(path, "utf-8");
  const frontmatter = extractFrontmatter(content);

  const required = ["name", "description"];
  for (const key of required) {
    if (!(key in frontmatter)) {
      throw new Error(`SKILL.md frontmatter missing ${key}`);
    }
  }

  // descriptionにAnchorsとTriggerが含まれているか確認
  const desc = frontmatter.description;
  if (!desc.includes("Anchors:")) {
    throw new Error("SKILL.md description missing 'Anchors:'");
  }
  if (!desc.includes("Trigger:")) {
    throw new Error("SKILL.md description missing 'Trigger:'");
  }

  console.log(`✓ SKILL.md frontmatter valid`);
  console.log(`  - name: ${frontmatter.name}`);
  console.log(`  - version: ${frontmatter.version || "N/A"}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  console.log("Validating skill structure...\n");

  // 必須ファイルの確認
  const requiredFiles = ["SKILL.md"];

  for (const file of requiredFiles) {
    assertExists(join(SKILL_DIR, file), file);
  }

  // SKILL.mdの行数制限とfrontmatter検証
  const skillMdPath = join(SKILL_DIR, "SKILL.md");
  validateLineLimit(skillMdPath, 500);
  validateFrontmatter(skillMdPath);

  // 推奨ファイル/ディレクトリの確認（存在確認のみ、必須ではない）
  const recommendedDirs = ["agents", "references", "scripts"];
  const recommendedFiles = ["LOGS.md"];

  console.log("\nRecommended structure:");
  for (const dir of recommendedDirs) {
    const path = join(SKILL_DIR, dir);
    if (existsSync(path)) {
      console.log(`✓ ${dir}/ exists`);
    } else {
      console.log(`⚠ ${dir}/ not found (optional)`);
    }
  }

  for (const file of recommendedFiles) {
    const path = join(SKILL_DIR, file);
    if (existsSync(path)) {
      console.log(`✓ ${file} exists`);
    } else {
      console.log(`⚠ ${file} not found (optional)`);
    }
  }

  console.log("\n✓ Skill structure validated successfully");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`\n✗ Validation error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
