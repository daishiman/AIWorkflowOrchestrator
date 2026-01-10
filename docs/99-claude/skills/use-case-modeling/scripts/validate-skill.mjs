#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 18-skills.md仕様に準拠したスキル構造を検証します。
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

function fileExists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function assertExists(path, label) {
  if (!fileExists(path)) {
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
  return count;
}

function validateSkillMd(path) {
  const content = readFileSync(path, "utf-8");

  // frontmatterの存在確認
  if (!content.startsWith("---")) {
    console.error("SKILL.md: frontmatter not found");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  // nameフィールドの確認
  if (!/^name:\s*[\w-]+/m.test(content)) {
    console.error("SKILL.md: name field not found");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  // descriptionフィールドの確認
  if (!/^description:\s*\|?/m.test(content)) {
    console.error("SKILL.md: description field not found");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  // Anchorsの確認
  if (!/Anchors:/m.test(content)) {
    console.warn("Warning: Anchors: not found in description");
  }

  // Triggerの確認
  if (!/Trigger:/m.test(content)) {
    console.warn("Warning: Trigger: not found in description");
  }

  console.log("  ✓ SKILL.md structure valid");
}

function validateAgents(agentsDir) {
  if (!fileExists(agentsDir)) {
    console.log("  - agents/ directory not present (optional)");
    return;
  }

  const files = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    console.warn("  Warning: agents/ directory is empty");
    return;
  }

  for (const file of files) {
    const content = readFileSync(join(agentsDir, file), "utf-8");

    // Task仕様書の5セクション確認
    const requiredSections = [
      "## 1. メタ情報",
      "## 2. プロフィール",
      "## 3. 知識ベース",
      "## 4. 実行仕様",
      "## 5. インターフェース",
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        console.warn(`  Warning: ${file} missing section: ${section}`);
      }
    }
  }

  console.log(`  ✓ agents/ validated (${files.length} files)`);
}

function validateScripts(scriptsDir) {
  if (!fileExists(scriptsDir)) {
    console.log("  - scripts/ directory not present (optional)");
    return;
  }

  const files = readdirSync(scriptsDir).filter((f) => f.endsWith(".mjs"));
  console.log(`  ✓ scripts/ validated (${files.length} files)`);
}

function validateReferences(referencesDir) {
  if (!fileExists(referencesDir)) {
    console.log("  - references/ directory not present (optional)");
    return;
  }

  const files = readdirSync(referencesDir).filter((f) => f.endsWith(".md"));
  console.log(`  ✓ references/ validated (${files.length} files)`);
}

function validateAssets(assetsDir) {
  if (!fileExists(assetsDir)) {
    console.log("  - assets/ directory not present (optional)");
    return;
  }

  const files = readdirSync(assetsDir);
  console.log(`  ✓ assets/ validated (${files.length} files)`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  console.log("Validating skill structure...\n");

  // SKILL.md必須
  const skillMdPath = join(SKILL_DIR, "SKILL.md");
  assertExists(skillMdPath, "SKILL.md");

  // SKILL.md行数制限（500行以内）
  const lineCount = validateLineLimit(skillMdPath, 500);
  console.log(`  ✓ SKILL.md line count: ${lineCount}/500`);

  // SKILL.md構造検証
  validateSkillMd(skillMdPath);

  // オプショナルディレクトリの検証
  validateAgents(join(SKILL_DIR, "agents"));
  validateScripts(join(SKILL_DIR, "scripts"));
  validateReferences(join(SKILL_DIR, "references"));
  validateAssets(join(SKILL_DIR, "assets"));

  console.log("\n✓ Skill structure validated successfully");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
