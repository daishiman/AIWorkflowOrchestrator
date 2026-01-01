#!/usr/bin/env node

/**
 * スキル構造検証スクリプト（18-skills.md準拠）
 *
 * 必須ファイル、行数制約、エージェント構造を確認します。
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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
  `);
}

function getLineCount(path) {
  const content = readFileSync(path, "utf-8");
  return content.split("\n").length;
}

function assertExists(path, label) {
  try {
    statSync(path);
    return true;
  } catch {
    console.error(`Missing: ${label} (${path})`);
    return false;
  }
}

function validateLineLimit(path, limit, label) {
  const count = getLineCount(path);
  if (count > limit) {
    console.error(`Line limit exceeded: ${label} (${count}/${limit})`);
    return false;
  }
  return true;
}

function validateSkillMd(path) {
  const content = readFileSync(path, "utf-8");
  const errors = [];

  // Check YAML frontmatter
  if (!content.startsWith("---")) {
    errors.push("SKILL.md must start with YAML frontmatter (---)");
  }

  // Check for required frontmatter fields
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    if (!frontmatter.includes("name:")) {
      errors.push("SKILL.md frontmatter missing 'name' field");
    }
    if (!frontmatter.includes("description:")) {
      errors.push("SKILL.md frontmatter missing 'description' field");
    }
    // Check for Anchors and Trigger in description
    if (!frontmatter.includes("Anchors:")) {
      errors.push("SKILL.md description should include 'Anchors:'");
    }
    if (!frontmatter.includes("Trigger:")) {
      errors.push("SKILL.md description should include 'Trigger:'");
    }
  }

  return errors;
}

function validateAgents(agentsDir) {
  const errors = [];
  if (!existsSync(agentsDir)) {
    return errors; // agents/ is optional
  }

  const files = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    errors.push("agents/ directory exists but contains no .md files");
    return errors;
  }

  for (const file of files) {
    const path = join(agentsDir, file);
    const content = readFileSync(path, "utf-8");

    // Check for Task specification structure
    const requiredSections = [
      "## 1. メタ情報",
      "## 2. プロフィール",
      "## 3. 知識ベース",
      "## 4. 実行仕様",
      "## 5. インターフェース",
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        errors.push(`${file}: Missing section '${section}'`);
      }
    }
  }

  return errors;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  let hasErrors = false;

  // Check SKILL.md exists
  const skillMdPath = join(SKILL_DIR, "SKILL.md");
  if (!assertExists(skillMdPath, "SKILL.md")) {
    process.exit(EXIT_FILE_MISSING);
  }

  // Validate SKILL.md line limit (500 lines max)
  if (!validateLineLimit(skillMdPath, 500, "SKILL.md")) {
    hasErrors = true;
  }

  // Validate SKILL.md structure
  const skillErrors = validateSkillMd(skillMdPath);
  for (const err of skillErrors) {
    console.error(`SKILL.md: ${err}`);
    hasErrors = true;
  }

  // Validate agents/
  const agentsDir = join(SKILL_DIR, "agents");
  const agentErrors = validateAgents(agentsDir);
  for (const err of agentErrors) {
    console.error(`agents/: ${err}`);
    hasErrors = true;
  }

  // Check scripts exist
  const scriptsDir = join(SKILL_DIR, "scripts");
  if (existsSync(scriptsDir)) {
    const scripts = readdirSync(scriptsDir).filter((f) => f.endsWith(".mjs"));
    console.log(`  scripts/: ${scripts.length} files`);
  }

  // Check references exist
  const refsDir = join(SKILL_DIR, "references");
  if (existsSync(refsDir)) {
    const refs = readdirSync(refsDir).filter((f) => f.endsWith(".md"));
    console.log(`  references/: ${refs.length} files`);
  }

  // Check assets exist
  const assetsDir = join(SKILL_DIR, "assets");
  if (existsSync(assetsDir)) {
    const assets = readdirSync(assetsDir);
    console.log(`  assets/: ${assets.length} files`);
  }

  // Count agents
  if (existsSync(agentsDir)) {
    const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    console.log(`  agents/: ${agents.length} files`);
  }

  if (hasErrors) {
    console.error("\n✗ Validation failed");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n✓ Skill structure validated (18-skills.md compliant)");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
