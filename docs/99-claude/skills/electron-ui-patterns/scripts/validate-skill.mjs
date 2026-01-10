#!/usr/bin/env node

/**
 * スキル構造検証スクリプト
 *
 * 必須ファイル、行数制約、EVALS.json の構造を確認します。
 */

import { readFileSync, statSync, existsSync } from "fs";
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
  --verbose     Show detailed output
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

function validateLineLimit(path, limit) {
  const count = getLineCount(path);
  if (count > limit) {
    console.error(`Line limit exceeded: ${path} (${count}/${limit})`);
    return false;
  }
  return true;
}

function validateEvals(path) {
  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));

    // スキーマv1.0形式（新形式）
    if (data.schemaVersion === "1.0") {
      const required = ["skillName", "metrics", "level"];
      for (const key of required) {
        if (!(key in data)) {
          throw new Error(`EVALS.json missing ${key}`);
        }
      }
      return true;
    }

    // 標準形式
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

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose");

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  let hasErrors = false;
  let warnings = [];

  // 必須ファイル
  const requiredFiles = ["SKILL.md", "LOGS.md"];

  // 推奨ファイル
  const recommendedFiles = ["EVALS.json", "scripts/log_usage.mjs"];

  for (const file of requiredFiles) {
    if (!assertExists(join(SKILL_DIR, file), file)) {
      hasErrors = true;
    }
  }

  for (const file of recommendedFiles) {
    if (!existsSync(join(SKILL_DIR, file))) {
      warnings.push(`推奨ファイルがありません: ${file}`);
    }
  }

  // 行数制限チェック
  const skillPath = join(SKILL_DIR, "SKILL.md");
  if (existsSync(skillPath)) {
    if (!validateLineLimit(skillPath, 500)) {
      hasErrors = true;
    } else if (verbose) {
      console.log(`✓ SKILL.md: ${getLineCount(skillPath)} 行`);
    }
  }

  // EVALS.json検証
  const evalsPath = join(SKILL_DIR, "EVALS.json");
  if (existsSync(evalsPath)) {
    if (!validateEvals(evalsPath)) {
      hasErrors = true;
    } else if (verbose) {
      console.log("✓ EVALS.json: 構造OK");
    }
  }

  // agents/ ディレクトリ確認
  const agentsDir = join(SKILL_DIR, "agents");
  if (existsSync(agentsDir)) {
    if (verbose) {
      console.log("✓ agents/ ディレクトリあり");
    }
  } else {
    warnings.push("agents/ ディレクトリがありません");
  }

  // references/ ディレクトリ確認
  const referencesDir = join(SKILL_DIR, "references");
  if (existsSync(referencesDir)) {
    if (verbose) {
      console.log("✓ references/ ディレクトリあり");
    }
  } else {
    warnings.push("references/ ディレクトリがありません");
  }

  // 結果出力
  if (warnings.length > 0 && verbose) {
    console.log("\n⚠ 警告:");
    for (const w of warnings) {
      console.log(`  - ${w}`);
    }
  }

  if (hasErrors) {
    console.error("\n✗ スキル構造検証に失敗しました");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("✓ Skill structure validated");
  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(EXIT_ERROR);
});
