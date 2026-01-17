#!/usr/bin/env node

/**
 * スキル構造検証スクリプト（risk-management 用）
 *
 * 必須ファイル、SKILL.md の行数、agents の基本構造を確認します。
 */

import { readFileSync, existsSync, statSync, readdirSync } from "fs";
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
  "agents/risk-identification.md",
  "agents/risk-analysis.md",
  "agents/risk-mitigation.md",
  "agents/risk-monitoring.md",
  "assets/risk-register-template.md",
  "assets/risk-register.md",
  "references/Level1_basics.md",
  "references/Level2_intermediate.md",
  "references/Level3_advanced.md",
  "references/Level4_expert.md",
  "references/risk-identification.md",
  "references/risk-identification-guide.md",
  "references/risk-analysis.md",
  "references/risk-analysis-framework.md",
  "scripts/calculate-risk-score.mjs",
  "scripts/log_usage.mjs",
  "scripts/validate-skill.mjs",
];

const requiredAgentSections = [
  "## 1. メタ情報",
  "## 2. プロフィール",
  "## 3. 知識ベース",
  "## 4. 実行仕様",
  "## 5. インターフェース",
];

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help    Show this help message
  --verbose     Show pass details
  `);
}

function assertExists(relPath, errors) {
  const absolutePath = join(SKILL_DIR, relPath);
  if (!existsSync(absolutePath)) {
    errors.push(`Missing: ${relPath}`);
    return null;
  }
  return absolutePath;
}

function countLines(content) {
  return content.split("\n").length;
}

function validateSkillMd(errors, passes) {
  const skillPath = assertExists("SKILL.md", errors);
  if (!skillPath) return;

  const content = readFileSync(skillPath, "utf-8");
  const lineCount = countLines(content);
  if (lineCount > 500) {
    errors.push(`SKILL.md exceeds 500 lines (${lineCount})`);
  } else {
    passes.push(`SKILL.md line count OK (${lineCount})`);
  }

  if (!content.includes("Anchors:")) {
    errors.push("SKILL.md is missing Anchors section in description");
  }
  if (!content.includes("Trigger:")) {
    errors.push("SKILL.md is missing Trigger section in description");
  }
  if (!content.includes("Use when")) {
    errors.push("Trigger line does not include 'Use when'");
  }
}

function validateAgents(errors, passes) {
  const agentsPath = join(SKILL_DIR, "agents");
  if (!existsSync(agentsPath) || !statSync(agentsPath).isDirectory()) {
    errors.push("agents/ directory is missing");
    return;
  }

  const agentFiles = readdirSync(agentsPath).filter((file) =>
    file.endsWith(".md"),
  );
  if (agentFiles.length === 0) {
    errors.push("agents/ has no task files");
    return;
  }

  for (const file of agentFiles) {
    const content = readFileSync(join(agentsPath, file), "utf-8");
    const missing = requiredAgentSections.filter(
      (section) => !content.includes(section),
    );
    if (missing.length > 0) {
      errors.push(`agents/${file} missing sections: ${missing.join(", ")}`);
    } else {
      passes.push(`agents/${file} sections OK`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose");

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const errors = [];
  const passes = [];

  for (const file of requiredFiles) {
    const absolutePath = assertExists(file, errors);
    if (absolutePath) {
      passes.push(`Found: ${file}`);
    }
  }

  validateSkillMd(errors, passes);
  validateAgents(errors, passes);

  if (verbose && passes.length > 0) {
    console.log("\nPassed checks:");
    passes.forEach((msg) => console.log(`  - ${msg}`));
  }

  if (errors.length > 0) {
    console.error("\nValidation errors:");
    errors.forEach((msg) => console.error(`  - ${msg}`));
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n✓ risk-management skill structure validated");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
