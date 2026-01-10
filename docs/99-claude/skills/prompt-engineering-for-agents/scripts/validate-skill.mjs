#!/usr/bin/env node

/**
 * スキル構造検証スクリプト（18-skills.md仕様準拠）
 *
 * 検証項目:
 *   - 必須ファイル（SKILL.md）の存在確認
 *   - SKILL.mdの行数制約（500行以内）
 *   - frontmatterの必須項目確認
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

検証内容:
  - SKILL.mdの存在確認
  - SKILL.mdの行数制約（500行以内）
  - frontmatterの必須項目（name, description, allowed-tools）
  - descriptionにAnchorsとTriggerが含まれているか
  `);
}

function getLineCount(path) {
  const content = readFileSync(path, "utf-8");
  return content.split("\n").length;
}

function assertExists(path, label) {
  if (!existsSync(path)) {
    console.error(`❌ Missing: ${label} (${path})`);
    process.exit(EXIT_FILE_MISSING);
  }
}

function validateLineLimit(path, limit) {
  const count = getLineCount(path);
  if (count > limit) {
    console.error(`❌ Line limit exceeded: ${path} (${count}/${limit})`);
    process.exit(EXIT_VALIDATION_ERROR);
  }
  console.log(`✓ SKILL.md line count: ${count}/${limit}`);
}

function validateFrontmatter(path) {
  const content = readFileSync(path, "utf-8");

  // frontmatterの抽出
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.error("❌ frontmatterが見つかりません");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const frontmatter = frontmatterMatch[1];

  // 必須項目の確認
  const requiredFields = ["name", "description", "allowed-tools"];
  for (const field of requiredFields) {
    if (!frontmatter.includes(`${field}:`)) {
      console.error(`❌ frontmatterに必須項目が不足: ${field}`);
      process.exit(EXIT_VALIDATION_ERROR);
    }
  }
  console.log("✓ frontmatter必須項目: OK");

  // descriptionにAnchorsとTriggerが含まれているか確認
  const descriptionMatch = frontmatter.match(
    /description:\s*\|\s*\n([\s\S]*?)(?=\n\w+:|$)/,
  );
  if (!descriptionMatch) {
    console.error("❌ descriptionが見つかりません");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  const description = descriptionMatch[1];

  if (!description.includes("Anchors:")) {
    console.error("❌ descriptionにAnchorsが含まれていません");
    process.exit(EXIT_VALIDATION_ERROR);
  }
  console.log("✓ Anchors: 含まれています");

  if (!description.includes("Trigger:")) {
    console.error("❌ descriptionにTriggerが含まれていません");
    process.exit(EXIT_VALIDATION_ERROR);
  }
  console.log("✓ Trigger: 含まれています");

  // Triggerが英語で記述されているか確認（簡易チェック: "Use when"で始まるか）
  const triggerMatch = description.match(/Trigger:\s*\n\s*(.+)/);
  if (triggerMatch) {
    const triggerText = triggerMatch[1];
    if (!triggerText.toLowerCase().startsWith("use when")) {
      console.warn('⚠️  Triggerは "Use when" で始まることが推奨されます');
    }
  }
}

function validateStructure() {
  console.log("\n=== スキル構造検証 ===\n");

  // 必須ファイルの確認
  const skillMdPath = join(SKILL_DIR, "SKILL.md");
  assertExists(skillMdPath, "SKILL.md");
  console.log("✓ SKILL.md: 存在します");

  // 行数制約の確認
  validateLineLimit(skillMdPath, 500);

  // frontmatterの確認
  validateFrontmatter(skillMdPath);

  // オプションファイルの確認（警告のみ）
  const optionalDirs = ["agents", "references", "scripts", "assets"];
  console.log("\n--- オプションディレクトリの確認 ---");
  for (const dir of optionalDirs) {
    const dirPath = join(SKILL_DIR, dir);
    if (existsSync(dirPath)) {
      console.log(`✓ ${dir}/: 存在します`);
    } else {
      console.log(`  ${dir}/: なし`);
    }
  }

  console.log("\n✅ スキル構造検証: 成功");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  try {
    validateStructure();
    process.exit(EXIT_SUCCESS);
  } catch (err) {
    console.error(`\n❌ エラー: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
}

main();
