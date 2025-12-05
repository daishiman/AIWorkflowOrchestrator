#!/usr/bin/env node

/**
 * analyze-normalization.mjs
 *
 * Drizzle ORMスキーマファイルを分析し、正規化レベルの潜在的な問題を検出するスクリプト。
 *
 * 使用方法:
 *   node analyze-normalization.mjs <schema-file.ts>
 *
 * 例:
 *   node analyze-normalization.mjs src/shared/infrastructure/database/schema.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// 色定義
const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

/**
 * 正規化問題の検出結果
 */
class NormalizationIssue {
  constructor(level, type, table, column, description, suggestion) {
    this.level = level; // 1NF, 2NF, 3NF, etc.
    this.type = type; // warning, error
    this.table = table;
    this.column = column;
    this.description = description;
    this.suggestion = suggestion;
  }
}

/**
 * スキーマファイルを解析
 */
function parseSchemaFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const tables = [];

  // テーブル定義を抽出（簡易パーサー）
  const tableRegex =
    /export const (\w+)\s*=\s*sqlite(?:Table|Enum)\s*\(\s*['"](\w+)['"]/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const [, varName, tableName] = match;

    // テーブル定義の範囲を取得
    const startIndex = match.index;
    let braceCount = 0;
    let endIndex = startIndex;
    let inDefinition = false;

    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === "(") {
        braceCount++;
        inDefinition = true;
      } else if (content[i] === ")") {
        braceCount--;
        if (inDefinition && braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    const tableDefinition = content.slice(startIndex, endIndex + 1);

    // カラム情報を抽出
    const columns = extractColumns(tableDefinition);

    tables.push({
      varName,
      tableName,
      definition: tableDefinition,
      columns,
    });
  }

  return tables;
}

/**
 * カラム情報を抽出
 */
function extractColumns(tableDefinition) {
  const columns = [];

  // カラム定義パターン（SQLite用）
  const columnPatterns = [
    /(\w+):\s*(?:text)\s*\(/g,
    /(\w+):\s*(?:integer)\s*\(/g,
    /(\w+):\s*(?:real)\s*\(/g,
    /(\w+):\s*(?:blob)\s*\(/g,
  ];

  for (const pattern of columnPatterns) {
    let match;
    while ((match = pattern.exec(tableDefinition)) !== null) {
      const columnName = match[1];
      const isJson =
        tableDefinition.includes(`${columnName}: text`) &&
        tableDefinition.includes(`mode: 'json'`);
      // SQLiteには配列型がないため、JSON配列として保存される
      const isArray = false;

      columns.push({
        name: columnName,
        isJson,
        isArray,
        definition: match[0],
      });
    }
  }

  return columns;
}

/**
 * 1NF違反を検出
 */
function detect1NFViolations(tables) {
  const issues = [];

  for (const table of tables) {
    // カンマ区切り値を示唆するカラム名パターン
    const multiValuePatterns = [
      /tags?$/i,
      /categories$/i,
      /items$/i,
      /list$/i,
      /values$/i,
    ];

    for (const column of table.columns) {
      // 複数値を示唆するカラム名
      for (const pattern of multiValuePatterns) {
        if (pattern.test(column.name) && !column.isJson) {
          issues.push(
            new NormalizationIssue(
              "1NF",
              "info",
              table.tableName,
              column.name,
              `カラム名 "${column.name}" は複数値を保存している可能性があります。`,
              "カンマ区切り値ではなく、関連テーブルまたはJSON配列の使用を検討してください。SQLiteには配列型がないため、複数値は関連テーブルに分離することを推奨します。",
            ),
          );
        }
      }
    }
  }

  return issues;
}

/**
 * 2NF違反の可能性を検出
 */
function detect2NFViolations(tables) {
  const issues = [];

  for (const table of tables) {
    // 複合キーを持つテーブルを検出（簡易判定）
    const hasCompositeKey = table.definition.includes("primaryKey(");

    if (hasCompositeKey) {
      // 部分従属の可能性があるカラム名パターン
      const potentialPartialDependencies = table.columns.filter(
        (col) =>
          col.name.endsWith("_name") ||
          col.name.endsWith("_title") ||
          col.name.endsWith("_description"),
      );

      if (potentialPartialDependencies.length > 0) {
        issues.push(
          new NormalizationIssue(
            "2NF",
            "warning",
            table.tableName,
            potentialPartialDependencies.map((c) => c.name).join(", "),
            "複合主キーを持つテーブルに記述的カラムがあります。部分関数従属の可能性があります。",
            "これらのカラムが複合キーの一部だけに依存していないか確認してください。依存している場合は別テーブルに分離してください。",
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * 3NF違反の可能性を検出
 */
function detect3NFViolations(tables) {
  const issues = [];

  for (const table of tables) {
    // 推移従属を示唆するカラムペアを検出
    const idColumns = table.columns.filter((col) => col.name.endsWith("_id"));
    const nameColumns = table.columns.filter((col) =>
      col.name.endsWith("_name"),
    );

    for (const idCol of idColumns) {
      const prefix = idCol.name.replace("_id", "");
      const matchingNameCol = nameColumns.find(
        (nc) => nc.name === `${prefix}_name`,
      );

      if (matchingNameCol) {
        issues.push(
          new NormalizationIssue(
            "3NF",
            "warning",
            table.tableName,
            `${idCol.name}, ${matchingNameCol.name}`,
            `"${idCol.name}" と "${matchingNameCol.name}" の組み合わせは推移関数従属を示唆しています。`,
            `"${prefix}" を別テーブルに分離し、外部キー参照のみを保持することを検討してください。`,
          ),
        );
      }
    }

    // 冗長なデータを示唆するカラム名パターン
    const redundantPatterns = [
      {
        pattern: /total$/i,
        suggestion:
          "計算済みカラムの可能性。意図的な非正規化なら文書化してください。",
      },
      {
        pattern: /count$/i,
        suggestion:
          "集計カラムの可能性。意図的な非正規化なら文書化してください。",
      },
      {
        pattern: /sum$/i,
        suggestion:
          "合計カラムの可能性。意図的な非正規化なら文書化してください。",
      },
    ];

    for (const column of table.columns) {
      for (const { pattern, suggestion } of redundantPatterns) {
        if (pattern.test(column.name)) {
          issues.push(
            new NormalizationIssue(
              "3NF",
              "info",
              table.tableName,
              column.name,
              `"${column.name}" は計算済み/集計カラムの可能性があります。`,
              suggestion,
            ),
          );
        }
      }
    }
  }

  return issues;
}

/**
 * JSON使用に関する注意を検出
 */
function detectJSONConsiderations(tables) {
  const issues = [];

  for (const table of tables) {
    const jsonColumns = table.columns.filter((col) => col.isJson);

    for (const column of jsonColumns) {
      issues.push(
        new NormalizationIssue(
          "JSON",
          "info",
          table.tableName,
          column.name,
          "JSONカラムが検出されました。",
          "Zodスキーマによる検証を確認してください。頻繁に検索される属性は通常カラムへの分離を検討してください。SQLiteではJSONへのインデックスは制限されています。",
        ),
      );
    }
  }

  return issues;
}

/**
 * レポートを出力
 */
function printReport(issues, tables) {
  console.log("\n" + "=".repeat(60));
  console.log("正規化分析レポート");
  console.log("=".repeat(60) + "\n");

  console.log(`分析対象テーブル数: ${tables.length}`);
  console.log(`検出された問題/注意点: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log(
      `${colors.green}✅ 明らかな正規化問題は検出されませんでした。${colors.reset}\n`,
    );
    return;
  }

  // レベル別にグループ化
  const groupedIssues = {};
  for (const issue of issues) {
    if (!groupedIssues[issue.level]) {
      groupedIssues[issue.level] = [];
    }
    groupedIssues[issue.level].push(issue);
  }

  // 各レベルの問題を出力
  for (const [level, levelIssues] of Object.entries(groupedIssues)) {
    console.log(`\n### ${level} 関連 (${levelIssues.length}件) ###\n`);

    for (const issue of levelIssues) {
      const color =
        issue.type === "error"
          ? colors.red
          : issue.type === "warning"
            ? colors.yellow
            : colors.blue;

      console.log(
        `${color}[${issue.type.toUpperCase()}]${colors.reset} ${issue.table}.${issue.column}`,
      );
      console.log(`  📝 ${issue.description}`);
      console.log(`  💡 ${issue.suggestion}`);
      console.log();
    }
  }

  // サマリー
  console.log("=".repeat(60));
  console.log("サマリー");
  console.log("=".repeat(60));

  const errorCount = issues.filter((i) => i.type === "error").length;
  const warningCount = issues.filter((i) => i.type === "warning").length;
  const infoCount = issues.filter((i) => i.type === "info").length;

  if (errorCount > 0) {
    console.log(`${colors.red}エラー: ${errorCount}${colors.reset}`);
  }
  if (warningCount > 0) {
    console.log(`${colors.yellow}警告: ${warningCount}${colors.reset}`);
  }
  if (infoCount > 0) {
    console.log(`${colors.blue}情報: ${infoCount}${colors.reset}`);
  }

  console.log("\n");
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node analyze-normalization.mjs <schema-file.ts>");
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  try {
    console.log(`\n分析中: ${filePath}\n`);

    const tables = parseSchemaFile(filePath);

    if (tables.length === 0) {
      console.log("テーブル定義が見つかりませんでした。");
      process.exit(0);
    }

    const issues = [
      ...detect1NFViolations(tables),
      ...detect2NFViolations(tables),
      ...detect3NFViolations(tables),
      ...detectJSONConsiderations(tables),
    ];

    printReport(issues, tables);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
