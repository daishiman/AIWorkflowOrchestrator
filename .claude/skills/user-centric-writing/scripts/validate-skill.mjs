#!/usr/bin/env node

/**
 * スキル構造検証スクリプト（18-skills.md仕様準拠）
 *
 * SKILL.md、agents/、references/の構造を確認します。
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
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

function validateSkillMd(path) {
  const errors = [];

  if (!existsSync(path)) {
    errors.push("SKILL.md not found");
    return errors;
  }

  const lineCount = getLineCount(path);
  if (lineCount > 500) {
    errors.push(`SKILL.md exceeds 500 lines (${lineCount} lines)`);
  }

  const content = readFileSync(path, "utf-8");

  // Frontmatter validation
  if (!content.startsWith("---")) {
    errors.push("SKILL.md missing frontmatter");
  } else {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      if (!frontmatter.includes("name:")) {
        errors.push("SKILL.md frontmatter missing 'name'");
      }
      if (!frontmatter.includes("description:")) {
        errors.push("SKILL.md frontmatter missing 'description'");
      }
      if (!frontmatter.includes("Anchors:")) {
        errors.push("SKILL.md description missing 'Anchors'");
      }
      if (!frontmatter.includes("Trigger:")) {
        errors.push("SKILL.md description missing 'Trigger'");
      }
    }
  }

  return errors;
}

function validateAgents(agentsDir) {
  const errors = [];

  if (!existsSync(agentsDir)) {
    errors.push("agents/ directory not found");
    return errors;
  }

  const files = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    errors.push("agents/ directory is empty");
    return errors;
  }

  for (const file of files) {
    const filePath = join(agentsDir, file);
    const content = readFileSync(filePath, "utf-8");

    const requiredSections = [
      "## 1. メタ情報",
      "## 2. プロフィール",
      "## 3. 知識ベース",
      "## 4. 実行仕様",
      "## 5. インターフェース",
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        errors.push(`${file}: missing section '${section}'`);
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

  let allErrors = [];

  // Validate SKILL.md
  const skillMdErrors = validateSkillMd(join(SKILL_DIR, "SKILL.md"));
  allErrors = allErrors.concat(skillMdErrors);

  // Validate agents/
  const agentsErrors = validateAgents(join(SKILL_DIR, "agents"));
  allErrors = allErrors.concat(agentsErrors);

  if (allErrors.length > 0) {
    console.error("Validation errors:");
    for (const error of allErrors) {
      console.error(`  - ${error}`);
    }
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("✓ Skill structure validated (18-skills.md spec)");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
