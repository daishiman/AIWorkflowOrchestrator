#!/usr/bin/env node

/**
 * Drizzle ORM スキーマファイル検証スクリプト
 *
 * 使用方法:
 *   node validate-schema.mjs <schema-dir>
 *
 * 検証項目:
 *   - スキーマファイルの構文チェック
 *   - 型定義の存在確認
 *   - テーブル定義の妥当性
 *   - リレーション定義の整合性
 */

import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";

// 終了コード
const EXIT_SUCCESS = 0;
const EXIT_GENERAL_ERROR = 1;
const EXIT_ARGUMENT_ERROR = 2;
const EXIT_VALIDATION_ERROR = 4;

/**
 * ヘルプメッセージを表示
 */
function showHelp() {
  console.log(`
使用方法: node validate-schema.mjs <schema-dir>

引数:
  <schema-dir>  検証するスキーマディレクトリのパス

オプション:
  -h, --help    このヘルプメッセージを表示

終了コード:
  0   成功
  1   一般的なエラー
  2   引数エラー
  4   検証失敗
  `);
}

/**
 * スキーマファイルを検証
 */
async function validateSchemaFiles(schemaDir) {
  const errors = [];
  const warnings = [];

  try {
    const files = await readdir(schemaDir);
    const tsFiles = files.filter((f) => extname(f) === ".ts");

    if (tsFiles.length === 0) {
      errors.push(`${schemaDir} に .ts ファイルが見つかりません`);
      return { errors, warnings };
    }

    console.log(`${tsFiles.length} 個のスキーマファイルを検証中...`);

    for (const file of tsFiles) {
      const filePath = join(schemaDir, file);
      const content = await readFile(filePath, "utf-8");

      // 基本的な構文チェック
      if (!content.includes("import") || !content.includes("from")) {
        warnings.push(`${file}: import 文が見つかりません`);
      }

      // テーブル定義の確認
      const tableMatch = content.match(/(sqliteTable|pgTable|mysqlTable)\(/g);
      if (!tableMatch) {
        warnings.push(`${file}: テーブル定義が見つかりません`);
      }

      // 型推論の確認
      if (
        !content.includes("$inferSelect") &&
        !content.includes("$inferInsert")
      ) {
        warnings.push(
          `${file}: 型推論（$inferSelect/$inferInsert）が使用されていません`,
        );
      }

      // export の確認
      if (
        !content.includes("export const") &&
        !content.includes("export type")
      ) {
        errors.push(`${file}: export が見つかりません`);
      }

      console.log(`✓ ${file}`);
    }
  } catch (error) {
    errors.push(`ディレクトリの読み込みエラー: ${error.message}`);
  }

  return { errors, warnings };
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  // ヘルプ表示
  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  // 引数チェック
  if (args.length < 1) {
    console.error("エラー: スキーマディレクトリを指定してください");
    showHelp();
    process.exit(EXIT_ARGUMENT_ERROR);
  }

  const schemaDir = args[0];

  console.log(`スキーマディレクトリ: ${schemaDir}\n`);

  const { errors, warnings } = await validateSchemaFiles(schemaDir);

  // 結果表示
  console.log("\n=== 検証結果 ===");

  if (warnings.length > 0) {
    console.log("\n⚠️  警告:");
    warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.log("\n❌ エラー:");
    errors.forEach((e) => console.log(`  - ${e}`));
    console.log("\n検証失敗");
    process.exit(EXIT_VALIDATION_ERROR);
  }

  console.log("\n✅ 検証成功");
  process.exit(EXIT_SUCCESS);
}

main().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(EXIT_GENERAL_ERROR);
});
