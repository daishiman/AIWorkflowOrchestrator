#!/usr/bin/env node

/**
 * workflow-templates スキル構造検証スクリプト
 *
 * 18-skills.md仕様に準拠したスキル構造を検証します。
 * - YAML frontmatter (Anchors, Trigger)
 * - agents/ ディレクトリ構造
 * - references/ ディレクトリ構造
 * - EVALS.json 形式
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_VALIDATION_ERROR = 4;

let verbose = false;

function log(msg) {
  if (verbose) console.log(msg);
}

function showHelp() {
  console.log(`
Usage: node scripts/validate-skill.mjs [options]

Options:
  -h, --help     Show this help message
  -v, --verbose  Show detailed validation output
  `);
}

function validateFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error("SKILL.md: YAML frontmatter not found");
  }

  const frontmatter = frontmatterMatch[1];

  // Check for Anchors
  if (!frontmatter.includes("Anchors:") && !content.includes("Anchors:")) {
    throw new Error("SKILL.md: Anchors section not found");
  }

  // Check for Trigger
  if (!frontmatter.includes("Trigger:") && !content.includes("Trigger:")) {
    throw new Error("SKILL.md: Trigger section not found");
  }

  log("  ✓ YAML frontmatter valid (Anchors, Trigger found)");
  return true;
}

function validateAgents(agentsDir) {
  if (!existsSync(agentsDir)) {
    throw new Error("agents/ directory not found");
  }

  const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  if (agents.length === 0) {
    throw new Error("No agent files found in agents/");
  }

  const requiredSections = [
    "## 1. メタ情報",
    "## 2. プロフィール",
    "## 3. 知識ベース",
    "## 4. 実行仕様",
    "## 5. インターフェース",
  ];

  for (const agent of agents) {
    const content = readFileSync(join(agentsDir, agent), "utf-8");
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        throw new Error(`${agent}: Missing section "${section}"`);
      }
    }
    log(`  ✓ ${agent}: All required sections present`);
  }

  log(`  ✓ ${agents.length} agents validated`);
  return agents.length;
}

function validateReferences(referencesDir) {
  if (!existsSync(referencesDir)) {
    throw new Error("references/ directory not found");
  }

  const refs = readdirSync(referencesDir).filter((f) => f.endsWith(".md"));
  log(`  ✓ ${refs.length} reference files found`);
  return refs.length;
}

function validateEvals(evalsPath) {
  if (!existsSync(evalsPath)) {
    throw new Error("EVALS.json not found");
  }

  const data = JSON.parse(readFileSync(evalsPath, "utf-8"));

  // 18-skills.md spec: skillName, version, levels, metrics
  const required = ["skillName", "version", "levels"];
  for (const key of required) {
    if (!(key in data)) {
      throw new Error(`EVALS.json: missing "${key}"`);
    }
  }

  // Check levels structure
  const expectedLevels = ["beginner", "intermediate", "advanced", "expert"];
  for (const level of expectedLevels) {
    if (!(level in data.levels)) {
      throw new Error(`EVALS.json: missing level "${level}"`);
    }
  }

  log("  ✓ EVALS.json structure valid");
  return true;
}

function validateRequiredFiles() {
  const requiredFiles = [
    "SKILL.md",
    "EVALS.json",
    "CHANGELOG.md",
    "LOGS.md",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
  ];

  for (const file of requiredFiles) {
    const path = join(SKILL_DIR, file);
    if (!existsSync(path)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }

  log("  ✓ All required files present");
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

  console.log("Validating workflow-templates skill...\n");

  try {
    // 1. Required files
    log("Checking required files...");
    validateRequiredFiles();

    // 2. SKILL.md frontmatter
    log("\nValidating SKILL.md frontmatter...");
    const skillContent = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf-8");
    validateFrontmatter(skillContent);

    // 3. Agents
    log("\nValidating agents/...");
    const agentCount = validateAgents(join(SKILL_DIR, "agents"));

    // 4. References
    log("\nValidating references/...");
    const refCount = validateReferences(join(SKILL_DIR, "references"));

    // 5. EVALS.json
    log("\nValidating EVALS.json...");
    validateEvals(join(SKILL_DIR, "EVALS.json"));

    console.log("\n" + "=".repeat(50));
    console.log("✓ Skill structure validated successfully");
    console.log(`  - Agents: ${agentCount}`);
    console.log(`  - References: ${refCount}`);
    console.log("=".repeat(50));

    process.exit(EXIT_SUCCESS);
  } catch (err) {
    console.error(`\n✗ Validation failed: ${err.message}`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
