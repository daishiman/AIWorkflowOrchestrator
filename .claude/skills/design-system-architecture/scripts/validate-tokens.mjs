#!/usr/bin/env node

/**
 * デザイントークン検証スクリプト
 *
 * 使用方法:
 *   node validate-tokens.mjs <tokens.json>
 *
 * 検証内容:
 *   - JSON構文の妥当性
 *   - 必須カテゴリの存在
 *   - 参照の解決可能性
 *   - 値の形式チェック
 */

import fs from "fs";
import path from "path";

// 必須カテゴリ
const REQUIRED_CATEGORIES = ["color", "typography", "spacing"];

// 値の形式パターン
const VALUE_PATTERNS = {
  color: /^(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{8}|rgb\(|rgba\(|\{.*\})$/,
  dimension: /^(\d+(\.\d+)?(px|rem|em|%)|0|\{.*\})$/,
  fontFamily: /^.+$/,
  fontWeight: /^(\d{3}|\{.*\})$/,
  number: /^(\d+(\.\d+)?|\{.*\})$/,
};

/**
 * トークン参照を解決
 */
function resolveReference(ref, tokens) {
  // {category.subcategory.name} 形式の参照を解決
  const match = ref.match(/^\{(.+)\}$/);
  if (!match) return null;

  const path = match[1].split(".");
  let current = tokens;

  for (const key of path) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * トークンを再帰的に検証
 */
function validateTokens(tokens, path = [], errors = [], warnings = []) {
  for (const [key, value] of Object.entries(tokens)) {
    const currentPath = [...path, key];
    const pathStr = currentPath.join(".");

    if (typeof value === "object" && value !== null) {
      if ("value" in value && "type" in value) {
        // トークン定義
        const { value: tokenValue, type } = value;

        // 参照チェック
        if (typeof tokenValue === "string" && tokenValue.startsWith("{")) {
          const resolved = resolveReference(tokenValue, tokens);
          if (resolved === null) {
            errors.push(`[ERROR] ${pathStr}: 参照 "${tokenValue}" を解決できません`);
          }
        } else {
          // 値の形式チェック
          const pattern = VALUE_PATTERNS[type];
          if (pattern && !pattern.test(tokenValue)) {
            warnings.push(
              `[WARN] ${pathStr}: 値 "${tokenValue}" は ${type} の期待される形式と異なります`
            );
          }
        }
      } else {
        // ネストされたオブジェクト
        validateTokens(value, currentPath, errors, warnings);
      }
    }
  }

  return { errors, warnings };
}

/**
 * 必須カテゴリの存在チェック
 */
function checkRequiredCategories(tokens) {
  const missing = [];
  for (const category of REQUIRED_CATEGORIES) {
    if (!(category in tokens)) {
      missing.push(category);
    }
  }
  return missing;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node validate-tokens.mjs <tokens.json>");
    process.exit(1);
  }

  const filePath = args[0];

  // ファイル存在チェック
  if (!fs.existsSync(filePath)) {
    console.error(`エラー: ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  // JSON読み込み
  let tokens;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    tokens = JSON.parse(content);
    console.log("✅ JSON構文: 有効");
  } catch (error) {
    console.error(`❌ JSON構文エラー: ${error.message}`);
    process.exit(1);
  }

  // 必須カテゴリチェック
  const missingCategories = checkRequiredCategories(tokens);
  if (missingCategories.length > 0) {
    console.error(`❌ 必須カテゴリが不足: ${missingCategories.join(", ")}`);
  } else {
    console.log("✅ 必須カテゴリ: すべて存在");
  }

  // トークン検証
  const { errors, warnings } = validateTokens(tokens);

  // 結果出力
  console.log("\n--- 検証結果 ---");

  if (warnings.length > 0) {
    console.log("\n⚠️  警告:");
    warnings.forEach((w) => console.log(`  ${w}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ エラー:");
    errors.forEach((e) => console.log(`  ${e}`));
    process.exit(1);
  }

  console.log("\n✅ すべての検証に合格しました");
  process.exit(0);
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});
