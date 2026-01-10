#!/usr/bin/env node

/**
 * スキル構造検証スクリプト (18-skills.md仕様準拠)
 *
 * 必須ファイル、行数制約、frontmatter、EVALS.json、agents、references を検証
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

let verbose = false;

function log(message) {
  if (verbose) console.log(message);
}

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help     Show this help message
  -v, --verbose  Show detailed output
  `);
}

function getLineCount(path) {
  const content = readFileSync(path, "utf-8");
  return content.split("\n").length;
}

function assertExists(path, label) {
  try {
    statSync(path);
    log(`  ✓ ${label}`);
    return true;
  } catch {
    console.error(`  ✗ Missing: ${label}`);
    return false;
  }
}

function validateFrontmatter(skillPath) {
  log("\n📝 Validating frontmatter...");
  const content = readFileSync(skillPath, "utf-8");

  if (!content.startsWith("---")) {
    console.error("  ✗ SKILL.md must start with YAML frontmatter (---)");
    return false;
  }

  const endIndex = content.indexOf("---", 3);
  if (endIndex === -1) {
    console.error("  ✗ SKILL.md frontmatter not properly closed");
    return false;
  }

  const frontmatter = content.substring(3, endIndex);

  const requiredFields = ["name:", "description:"];
  for (const field of requiredFields) {
    if (!frontmatter.includes(field)) {
      console.error(`  ✗ Frontmatter missing: ${field}`);
      return false;
    }
  }

  if (!frontmatter.includes("Anchors:")) {
    console.error("  ✗ Description should include Anchors section");
    return false;
  }

  if (!frontmatter.includes("Trigger:")) {
    console.error("  ✗ Description should include Trigger section");
    return false;
  }

  log("  ✓ Frontmatter structure valid");
  return true;
}

function validateEvals(path) {
  log("\n📊 Validating EVALS.json...");
  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));

    if (data.levels) {
      const expectedLevels = ["beginner", "intermediate", "advanced", "expert"];
      for (const level of expectedLevels) {
        if (!(level in data.levels)) {
          console.error(`  ✗ EVALS.json missing levels.${level}`);
          return false;
        }
      }
    }

    if (!data.metrics && !data.evaluationCriteria) {
      console.error("  ✗ EVALS.json missing metrics or evaluationCriteria");
      return false;
    }

    log("  ✓ EVALS.json structure valid");
    return true;
  } catch (err) {
    console.error(`  ✗ EVALS.json validation error: ${err.message}`);
    return false;
  }
}

function validateAgents(agentsDir) {
  log("\n🤖 Validating agents/...");

  if (!existsSync(agentsDir)) {
    log("  ⚠ agents/ directory not found (optional)");
    return true;
  }

  const files = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    log("  ⚠ No agent files found (optional)");
    return true;
  }

  log(`  ✓ Found ${files.length} agent(s)`);

  const requiredSections = [
    "## 1. メタ情報",
    "## 2. プロフィール",
    "## 3. 知識ベース",
    "## 4. 実行仕様",
    "## 5. インターフェース",
  ];

  for (const file of files) {
    const content = readFileSync(join(agentsDir, file), "utf-8");
    let missingSections = [];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        missingSections.push(section);
      }
    }

    if (missingSections.length > 0) {
      log(`  ⚠ ${file}: missing sections: ${missingSections.join(", ")}`);
    } else {
      log(`  ✓ ${file}: Task specification valid`);
    }
  }

  return true;
}

function validateReferences(referencesDir) {
  log("\n📚 Validating references/...");

  if (!existsSync(referencesDir)) {
    log("  ⚠ references/ directory not found (optional)");
    return true;
  }

  const files = readdirSync(referencesDir).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    log("  ⚠ No reference files found (optional)");
    return true;
  }

  log(`  ✓ Found ${files.length} reference(s)`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  if (args.includes("-v") || args.includes("--verbose")) {
    verbose = true;
  }

  console.log("🔍 Validating websocket-patterns skill structure...\n");

  let hasErrors = false;

  log("📁 Checking required files...");
  const requiredFiles = [
    "SKILL.md",
    "EVALS.json",
    "CHANGELOG.md",
    "LOGS.md",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
  ];

  for (const file of requiredFiles) {
    if (!assertExists(join(SKILL_DIR, file), file)) {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(EXIT_FILE_MISSING);
  }

  log("\n📏 Checking line limits...");
  const skillPath = join(SKILL_DIR, "SKILL.md");
  const lineCount = getLineCount(skillPath);
  if (lineCount > 500) {
    console.error(`  ✗ SKILL.md exceeds 500 lines (${lineCount})`);
    hasErrors = true;
  } else {
    log(`  ✓ SKILL.md: ${lineCount}/500 lines`);
  }

  if (!validateFrontmatter(skillPath)) {
    hasErrors = true;
  }

  if (!validateEvals(join(SKILL_DIR, "EVALS.json"))) {
    hasErrors = true;
  }

  validateAgents(join(SKILL_DIR, "agents"));
  validateReferences(join(SKILL_DIR, "references"));

  if (hasErrors) {
    console.error("\n✗ Validation failed");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n✓ Skill structure validated successfully");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
