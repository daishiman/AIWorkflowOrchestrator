#!/usr/bin/env node

/**
 * スキル構造検証スクリプト（18-skills.md仕様準拠）
 *
 * 必須ファイル、行数制約、EVALS.json の構造を確認します。
 *
 * 終了コード:
 *   0: 成功
 *   1: 一般エラー
 *   2: 引数エラー
 *   3: ファイル不在
 *   4: 検証失敗
 */

import { readFileSync, statSync, existsSync, readdirSync } from "fs";
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
  -v, --verbose Show detailed validation results
  `);
}

function getLineCount(path) {
  const content = readFileSync(path, "utf-8");
  return content.split("\n").length;
}

function assertExists(path, label, required = true) {
  const exists = existsSync(path);
  if (!exists && required) {
    console.error(`Missing required: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
  return exists;
}

function validateLineLimit(path, limit, label) {
  if (!existsSync(path)) return true;
  const count = getLineCount(path);
  if (count > limit) {
    console.error(`Line limit exceeded: ${label} (${count}/${limit})`);
    return false;
  }
  return true;
}

function validateFrontmatter(skillPath) {
  const content = readFileSync(skillPath, "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    console.error("SKILL.md: Missing YAML frontmatter");
    return false;
  }

  const frontmatter = frontmatterMatch[1];

  // 必須フィールドのチェック
  if (!frontmatter.includes("name:")) {
    console.error("SKILL.md: Missing 'name' in frontmatter");
    return false;
  }

  if (!frontmatter.includes("description:")) {
    console.error("SKILL.md: Missing 'description' in frontmatter");
    return false;
  }

  // descriptionにAnchorsとTriggerが含まれているか
  if (!frontmatter.includes("Anchors:")) {
    console.warn("Warning: description should contain 'Anchors:'");
  }

  if (!frontmatter.includes("Trigger:")) {
    console.warn("Warning: description should contain 'Trigger:'");
  }

  return true;
}

function validateEvals(path) {
  if (!existsSync(path)) {
    console.error("Missing: EVALS.json");
    return false;
  }

  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));
    const required = ["skill_name", "current_level", "levels", "metrics"];
    for (const key of required) {
      if (!(key in data)) {
        throw new Error(`EVALS.json missing ${key}`);
      }
    }
    for (const lvl of ["1", "2", "3", "4"]) {
      if (!(lvl in data.levels)) {
        throw new Error(`EVALS.json missing levels.${lvl}`);
      }
    }
    const metrics = [
      "total_usage_count",
      "success_count",
      "failure_count",
      "average_satisfaction",
      "last_evaluated",
    ];
    for (const key of metrics) {
      if (!(key in data.metrics)) {
        throw new Error(`EVALS.json metrics missing ${key}`);
      }
    }
    return true;
  } catch (err) {
    console.error(`EVALS.json validation error: ${err.message}`);
    return false;
  }
}

function validateAgents(agentsDir) {
  if (!existsSync(agentsDir)) {
    return true; // agents/は任意
  }

  const files = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  let valid = true;

  for (const file of files) {
    const filePath = join(agentsDir, file);
    const content = readFileSync(filePath, "utf-8");

    // Task仕様書の必須セクション
    const requiredSections = [
      "## 1. メタ情報",
      "## 2. プロフィール",
      "## 3. 知識ベース",
      "## 4. 実行仕様",
      "## 5. インターフェース",
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        console.warn(`Warning: agents/${file} missing section "${section}"`);
      }
    }
  }

  return valid;
}

function validateReferences(referencesDir) {
  if (!existsSync(referencesDir)) {
    return true; // references/は任意
  }

  const files = readdirSync(referencesDir).filter((f) => f.endsWith(".md"));

  // SKILL.mdから参照されているかチェック
  const skillContent = readFileSync(join(SKILL_DIR, "SKILL.md"), "utf-8");

  for (const file of files) {
    if (!skillContent.includes(`references/${file}`)) {
      console.warn(`Warning: references/${file} is not referenced in SKILL.md`);
    }
  }

  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("-v") || args.includes("--verbose");

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  let hasErrors = false;

  // 必須ファイル
  const requiredFiles = [
    "SKILL.md",
    "EVALS.json",
    "CHANGELOG.md",
    "LOGS.md",
    "scripts/log_usage.mjs",
    "scripts/validate-skill.mjs",
  ];

  if (verbose) console.log("\n📁 Checking required files...");
  for (const file of requiredFiles) {
    const exists = assertExists(join(SKILL_DIR, file), file);
    if (verbose && exists) console.log(`  ✓ ${file}`);
  }

  // SKILL.md行数制限（500行以内）
  if (verbose) console.log("\n📏 Checking line limits...");
  if (!validateLineLimit(join(SKILL_DIR, "SKILL.md"), 500, "SKILL.md")) {
    hasErrors = true;
  } else if (verbose) {
    const lines = getLineCount(join(SKILL_DIR, "SKILL.md"));
    console.log(`  ✓ SKILL.md: ${lines}/500 lines`);
  }

  // Frontmatter検証
  if (verbose) console.log("\n📝 Validating frontmatter...");
  if (!validateFrontmatter(join(SKILL_DIR, "SKILL.md"))) {
    hasErrors = true;
  } else if (verbose) {
    console.log("  ✓ Frontmatter structure valid");
  }

  // EVALS.json検証
  if (verbose) console.log("\n📊 Validating EVALS.json...");
  if (!validateEvals(join(SKILL_DIR, "EVALS.json"))) {
    hasErrors = true;
  } else if (verbose) {
    console.log("  ✓ EVALS.json structure valid");
  }

  // agents/検証
  if (verbose) console.log("\n🤖 Validating agents/...");
  validateAgents(join(SKILL_DIR, "agents"));
  if (verbose && existsSync(join(SKILL_DIR, "agents"))) {
    const agentFiles = readdirSync(join(SKILL_DIR, "agents")).filter((f) =>
      f.endsWith(".md"),
    );
    console.log(`  ✓ Found ${agentFiles.length} agent(s)`);
  }

  // references/検証
  if (verbose) console.log("\n📚 Validating references/...");
  validateReferences(join(SKILL_DIR, "references"));
  if (verbose && existsSync(join(SKILL_DIR, "references"))) {
    const refFiles = readdirSync(join(SKILL_DIR, "references")).filter((f) =>
      f.endsWith(".md"),
    );
    console.log(`  ✓ Found ${refFiles.length} reference(s)`);
  }

  if (hasErrors) {
    console.error("\n❌ Skill validation failed");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n✓ Skill structure validated successfully");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
