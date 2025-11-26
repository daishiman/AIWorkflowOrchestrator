#!/usr/bin/env node
/**
 * JSON Schema検証スクリプト
 *
 * 使用方法:
 *   node validate-schema.mjs <schema.json> [data.json]
 *
 * 引数:
 *   schema.json - 検証するJSON Schemaファイル
 *   data.json   - (オプション) スキーマに対して検証するデータ
 *
 * 例:
 *   node validate-schema.mjs ./my-schema.json
 *   node validate-schema.mjs ./my-schema.json ./test-data.json
 */

import fs from "fs";
import path from "path";

// ANSI カラーコード
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateJsonSchema(schema) {
  const errors = [];
  const warnings = [];

  // 必須プロパティのチェック
  if (!schema.$schema) {
    warnings.push("$schemaプロパティがありません（推奨: draft-07）");
  }

  if (!schema.type) {
    errors.push("typeプロパティは必須です");
  }

  // オブジェクト型の検証
  if (schema.type === "object") {
    if (!schema.properties) {
      warnings.push("propertiesが定義されていません");
    }

    // additionalPropertiesの推奨
    if (schema.additionalProperties === undefined) {
      warnings.push(
        "additionalPropertiesが未定義です（厳密な検証にはfalseを推奨）"
      );
    }

    // requiredの確認
    if (schema.properties && !schema.required) {
      warnings.push("requiredフィールドが定義されていません");
    }

    // プロパティの検証
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (!prop.type && !prop.$ref && !prop.oneOf && !prop.anyOf) {
          warnings.push(`プロパティ "${key}" に型が定義されていません`);
        }

        if (!prop.description) {
          warnings.push(`プロパティ "${key}" にdescriptionがありません`);
        }
      }
    }
  }

  // 配列型の検証
  if (schema.type === "array") {
    if (!schema.items) {
      errors.push("配列型にはitemsの定義が必要です");
    }

    if (schema.maxItems === undefined) {
      warnings.push("maxItemsが未定義です（無制限の配列は危険です）");
    }
  }

  return { errors, warnings };
}

function analyzeSchema(schema, depth = 0, path = "") {
  const analysis = {
    totalProperties: 0,
    requiredProperties: 0,
    optionalProperties: 0,
    nestedObjects: 0,
    arrays: 0,
    enums: 0,
    maxDepth: depth,
  };

  if (schema.type === "object" && schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      analysis.totalProperties++;

      if (schema.required?.includes(key)) {
        analysis.requiredProperties++;
      } else {
        analysis.optionalProperties++;
      }

      if (prop.type === "object") {
        analysis.nestedObjects++;
        const nested = analyzeSchema(prop, depth + 1, `${path}.${key}`);
        analysis.totalProperties += nested.totalProperties;
        analysis.nestedObjects += nested.nestedObjects;
        analysis.arrays += nested.arrays;
        analysis.enums += nested.enums;
        analysis.maxDepth = Math.max(analysis.maxDepth, nested.maxDepth);
      }

      if (prop.type === "array") {
        analysis.arrays++;
        if (prop.items?.type === "object") {
          const nested = analyzeSchema(
            prop.items,
            depth + 1,
            `${path}.${key}[]`
          );
          analysis.totalProperties += nested.totalProperties;
          analysis.nestedObjects += nested.nestedObjects;
          analysis.arrays += nested.arrays;
          analysis.enums += nested.enums;
          analysis.maxDepth = Math.max(analysis.maxDepth, nested.maxDepth);
        }
      }

      if (prop.enum) {
        analysis.enums++;
      }
    }
  }

  return analysis;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    log("使用方法: node validate-schema.mjs <schema.json> [data.json]", "cyan");
    process.exit(1);
  }

  const schemaPath = path.resolve(args[0]);

  // スキーマファイルの読み込み
  if (!fs.existsSync(schemaPath)) {
    log(`エラー: ファイルが見つかりません: ${schemaPath}`, "red");
    process.exit(1);
  }

  let schema;
  try {
    const content = fs.readFileSync(schemaPath, "utf-8");
    schema = JSON.parse(content);
  } catch (e) {
    log(`エラー: JSONのパースに失敗しました: ${e.message}`, "red");
    process.exit(1);
  }

  log("\n=== JSON Schema 検証結果 ===\n", "blue");
  log(`ファイル: ${schemaPath}`, "cyan");

  // スキーマの検証
  const { errors, warnings } = validateJsonSchema(schema);

  // エラー出力
  if (errors.length > 0) {
    log("\n❌ エラー:", "red");
    errors.forEach((e) => log(`  - ${e}`, "red"));
  }

  // 警告出力
  if (warnings.length > 0) {
    log("\n⚠️  警告:", "yellow");
    warnings.forEach((w) => log(`  - ${w}`, "yellow"));
  }

  // 分析結果
  const analysis = analyzeSchema(schema);
  log("\n📊 スキーマ分析:", "blue");
  log(`  - 総プロパティ数: ${analysis.totalProperties}`);
  log(`  - 必須プロパティ: ${analysis.requiredProperties}`);
  log(`  - オプショナル: ${analysis.optionalProperties}`);
  log(`  - ネストオブジェクト: ${analysis.nestedObjects}`);
  log(`  - 配列: ${analysis.arrays}`);
  log(`  - Enum: ${analysis.enums}`);
  log(`  - 最大深度: ${analysis.maxDepth}`);

  // 深度の警告
  if (analysis.maxDepth > 3) {
    log("\n⚠️  ネストが深すぎます（推奨: 3階層以内）", "yellow");
  }

  // 最終結果
  if (errors.length === 0) {
    log("\n✅ スキーマは有効です", "green");
    process.exit(0);
  } else {
    log("\n❌ スキーマに問題があります", "red");
    process.exit(1);
  }
}

main();
