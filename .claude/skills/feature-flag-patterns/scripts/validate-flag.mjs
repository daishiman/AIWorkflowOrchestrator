#!/usr/bin/env node
/**
 * validate-flag.mjs
 * フラグ定義の検証スクリプト
 *
 * 使用方法:
 *   node scripts/validate-flag.mjs <flag-config>
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const REQUIRED_FIELDS = ["name", "type", "defaultValue", "owner"];

const VALID_TYPES = ["release", "experiment", "ops", "permission"];

function validateFlag(configPath) {
  const absolutePath = resolve(configPath);

  if (!existsSync(absolutePath)) {
    console.error(`❌ ファイルが見つかりません: ${absolutePath}`);
    process.exit(1);
  }

  const content = readFileSync(absolutePath, "utf-8");
  let config;

  try {
    config = JSON.parse(content);
  } catch {
    console.error("❌ JSONパースエラー");
    process.exit(1);
  }

  console.log(`\nフラグ検証: ${configPath}\n`);
  console.log("─".repeat(50));

  const errors = [];
  const warnings = [];

  // 必須フィールドチェック
  for (const field of REQUIRED_FIELDS) {
    if (!config[field]) {
      errors.push(`必須フィールド '${field}' が未定義`);
    }
  }

  // タイプ検証
  if (config.type && !VALID_TYPES.includes(config.type)) {
    errors.push(
      `無効なタイプ '${config.type}'（有効: ${VALID_TYPES.join(", ")}）`,
    );
  }

  // 有効期限チェック
  if (!config.expiresAt) {
    warnings.push("有効期限（expiresAt）が未設定です");
  }

  // 結果出力
  if (errors.length > 0) {
    console.log("\n❌ エラー:");
    errors.forEach((e) => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️ 警告:");
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  console.log("\n" + "─".repeat(50));
  console.log(
    errors.length === 0
      ? "\n✅ 検証成功"
      : `\n❌ 検証失敗 (${errors.length}エラー)`,
  );

  process.exit(errors.length > 0 ? 1 : 0);
}

// メイン処理
const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
使用方法: node scripts/validate-flag.mjs <flag-config.json>

例:
  node scripts/validate-flag.mjs flags/new-feature.json
`);
  process.exit(0);
}

validateFlag(args[0]);
