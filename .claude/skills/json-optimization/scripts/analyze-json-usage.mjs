#!/usr/bin/env node

/**
 * analyze-json-usage.mjs
 *
 * Drizzle ORMスキーマファイルからJSONカラムの使用状況を分析し、
 * 最適化の機会を検出するスクリプト（SQLite版）。
 *
 * 使用方法:
 *   node analyze-json-usage.mjs <schema-file.ts>
 *
 * 例:
 *   node analyze-json-usage.mjs src/shared/infrastructure/database/schema.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// 色定義
const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

/**
 * 問題の種類
 */
const IssueType = {
  NO_EXPRESSION_INDEX: "no_expression_index",
  NO_VALIDATION: "no_validation",
  FREQUENT_SEARCH: "frequent_search",
  GENERATED_COLUMN_OPPORTUNITY: "generated_column_opportunity",
};

/**
 * JSON分析結果
 */
class JsonIssue {
  constructor(type, severity, table, column, description, suggestion) {
    this.type = type;
    this.severity = severity; // warning, info, suggestion
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

  // テーブル定義を抽出（SQLite版）
  const tableRegex =
    /export const (\w+)\s*=\s*sqliteTable\s*\(\s*['"](\w+)['"]/g;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    const [, varName, tableName] = match;
    const startIndex = match.index;

    // テーブル定義の終了位置を見つける
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

    // JSONカラムを抽出
    const jsonColumns = extractJsonColumns(tableDefinition);

    // インデックス情報を抽出
    const indexes = extractIndexes(tableDefinition);

    // 生成カラムを抽出
    const generatedColumns = extractGeneratedColumns(tableDefinition);

    tables.push({
      varName,
      tableName,
      definition: tableDefinition,
      jsonColumns,
      indexes,
      generatedColumns,
    });
  }

  return tables;
}

/**
 * JSONカラムを抽出
 */
function extractJsonColumns(tableDefinition) {
  const columns = [];
  const lines = tableDefinition.split("\n");

  for (const line of lines) {
    // text() with { mode: "json" } のカラム定義
    const match = line.match(
      /(\w+):\s*text\s*\(['"]([^'"]+)['"]\s*,\s*\{\s*mode:\s*['"]json['"]\s*\}\)/,
    );
    if (match) {
      const [, varName, columnName] = match;
      columns.push({
        varName,
        columnName,
        hasNotNull: line.includes(".notNull()"),
        hasDefault: line.includes(".default("),
      });
    }
  }

  return columns;
}

/**
 * インデックス情報を抽出
 */
function extractIndexes(tableDefinition) {
  const indexes = [];

  // index() 呼び出しを検出
  const indexRegex = /(\w+):\s*index\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  let match;

  while ((match = indexRegex.exec(tableDefinition)) !== null) {
    const [fullMatch, varName, indexName] = match;

    // .on() でカラムを取得
    const restOfDef = tableDefinition.slice(match.index);
    const onMatch = restOfDef.match(/\.on\s*\(\s*([^)]+)\s*\)/);

    let isExpressionIndex = false;
    let extractedPaths = [];

    if (onMatch) {
      const onContent = onMatch[1];
      // sql`json_extract(...)` パターンを検出
      if (onContent.includes("json_extract")) {
        isExpressionIndex = true;
        // パスを抽出
        const pathMatches = onContent.matchAll(
          /json_extract\([^,]+,\s*['"](\$[^'"]+)['"]\)/g,
        );
        for (const pathMatch of pathMatches) {
          extractedPaths.push(pathMatch[1]);
        }
      }
    }

    indexes.push({
      varName,
      name: indexName,
      isExpressionIndex,
      extractedPaths,
    });
  }

  return indexes;
}

/**
 * 生成カラムを抽出
 */
function extractGeneratedColumns(tableDefinition) {
  const generatedColumns = [];
  const lines = tableDefinition.split("\n");

  for (const line of lines) {
    // .generatedAlwaysAs() パターンを検出
    if (line.includes(".generatedAlwaysAs(")) {
      const varMatch = line.match(/(\w+):\s*text\s*\(['"]([^'"]+)['"]\)/);
      if (varMatch) {
        const [, varName, columnName] = varMatch;
        generatedColumns.push({
          varName,
          columnName,
        });
      }
    }
  }

  return generatedColumns;
}

/**
 * 式インデックスの有無をチェック
 */
function checkExpressionIndexes(tables) {
  const issues = [];

  for (const table of tables) {
    for (const jsonCol of table.jsonColumns) {
      // このJSONカラムに式インデックスがあるか
      const hasExpressionIndex = table.indexes.some(
        (idx) => idx.isExpressionIndex,
      );

      if (!hasExpressionIndex && table.jsonColumns.length > 0) {
        issues.push(
          new JsonIssue(
            IssueType.NO_EXPRESSION_INDEX,
            "warning",
            table.tableName,
            jsonCol.columnName,
            "JSONカラムに式インデックスがありません",
            `検索が必要な場合は "idx_${table.tableName}_${jsonCol.columnName}_<field>" の追加を検討してください。\n` +
              `   例: CREATE INDEX idx ON ${table.tableName} (json_extract(${jsonCol.columnName}, '$.field'));`,
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * 生成カラムの使用機会をチェック
 */
function checkGeneratedColumnOpportunity(tables) {
  const issues = [];

  for (const table of tables) {
    // 式インデックスがあるが生成カラムがない場合
    const hasExpressionIndex = table.indexes.some(
      (idx) => idx.isExpressionIndex,
    );
    const hasGeneratedColumns = table.generatedColumns.length > 0;

    if (hasExpressionIndex && !hasGeneratedColumns) {
      for (const idx of table.indexes) {
        if (idx.isExpressionIndex && idx.extractedPaths.length > 0) {
          issues.push(
            new JsonIssue(
              IssueType.GENERATED_COLUMN_OPPORTUNITY,
              "info",
              table.tableName,
              idx.name,
              "式インデックスが使用されています",
              `頻繁に検索するプロパティ（${idx.extractedPaths.join(", ")}）は生成カラムへの分離を検討してください。\n` +
                `   生成カラムはパフォーマンスが向上し、クエリが簡潔になります。`,
            ),
          );
        }
      }
    }
  }

  return issues;
}

/**
 * 検証制約の有無をチェック
 */
function checkValidation(tables) {
  const issues = [];

  for (const table of tables) {
    for (const jsonCol of table.jsonColumns) {
      // CHECK制約の存在を確認（スキーマ定義からは検出困難なのでアドバイスのみ）
      issues.push(
        new JsonIssue(
          IssueType.NO_VALIDATION,
          "info",
          table.tableName,
          jsonCol.columnName,
          "JSONカラムの検証を確認してください",
          "CHECK制約（json_valid、json_type、必須フィールド）とZodスキーマによる二重検証を推奨します。",
        ),
      );
    }
  }

  return issues;
}

/**
 * レポートを出力
 */
function printReport(tables, issues) {
  console.log("\n" + "=".repeat(60));
  console.log("JSON 使用分析レポート (SQLite)");
  console.log("=".repeat(60) + "\n");

  // サマリー
  const totalJsonColumns = tables.reduce(
    (sum, t) => sum + t.jsonColumns.length,
    0,
  );
  const totalExpressionIndexes = tables.reduce(
    (sum, t) => sum + t.indexes.filter((i) => i.isExpressionIndex).length,
    0,
  );
  const totalGeneratedColumns = tables.reduce(
    (sum, t) => sum + t.generatedColumns.length,
    0,
  );

  console.log(`${colors.cyan}サマリー${colors.reset}`);
  console.log(`  分析テーブル数: ${tables.length}`);
  console.log(`  JSONカラム数: ${totalJsonColumns}`);
  console.log(`  式インデックス数: ${totalExpressionIndexes}`);
  console.log(`  生成カラム数: ${totalGeneratedColumns}`);
  console.log(`  検出された問題/提案: ${issues.length}\n`);

  // JSONカラム一覧
  console.log(`${colors.cyan}JSONカラム一覧${colors.reset}\n`);

  for (const table of tables) {
    if (table.jsonColumns.length === 0) continue;

    console.log(`📋 ${table.tableName}`);

    for (const col of table.jsonColumns) {
      const hasExprIndex = table.indexes.some((idx) => idx.isExpressionIndex);
      const hasGenCol = table.generatedColumns.some((gen) =>
        gen.columnName.includes(col.columnName),
      );

      const exprStatus = hasExprIndex
        ? `${colors.green}✓ 式IDX${colors.reset}`
        : `${colors.yellow}✗ No IDX${colors.reset}`;
      const genStatus = hasGenCol
        ? ` ${colors.blue}+ 生成Col${colors.reset}`
        : "";

      console.log(`   • ${col.columnName} ${exprStatus}${genStatus}`);
    }
    console.log();
  }

  // 問題レポート
  if (issues.length === 0) {
    console.log(
      `${colors.green}✅ 問題は検出されませんでした。${colors.reset}\n`,
    );
    return;
  }

  console.log(`${colors.cyan}検出された問題と提案${colors.reset}\n`);

  // 重要度別にグループ化
  const grouped = {
    warning: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
    suggestion: issues.filter((i) => i.severity === "suggestion"),
  };

  const severityLabels = {
    warning: { label: "警告", color: colors.yellow },
    info: { label: "情報", color: colors.blue },
    suggestion: { label: "提案", color: colors.green },
  };

  for (const [severity, severityIssues] of Object.entries(grouped)) {
    if (severityIssues.length === 0) continue;

    const { label, color } = severityLabels[severity];

    console.log(`\n### ${label} (${severityIssues.length}件) ###\n`);

    for (const issue of severityIssues) {
      console.log(
        `${color}[${issue.type.toUpperCase()}]${colors.reset} ${issue.table}.${issue.column}`,
      );
      console.log(`  📝 ${issue.description}`);
      console.log(`  💡 ${issue.suggestion}`);
      console.log();
    }
  }

  // 推奨事項
  console.log("=".repeat(60));
  console.log("推奨事項");
  console.log("=".repeat(60));
  console.log(`
1. 検索が必要なJSONカラムには式インデックスを追加
   CREATE INDEX idx ON table (json_extract(column, '\$.field'));

2. 頻繁に検索するプロパティは生成カラムへの分離を検討
   ALTER TABLE table ADD COLUMN field_gen TEXT
   GENERATED ALWAYS AS (json_extract(column, '\$.field')) STORED;

3. CHECK制約で基本検証を実装
   CHECK (json_valid(column) = 1)
   CHECK (json_type(column) = 'object')

4. Zodスキーマでアプリケーション層の検証を実装

5. SQLite 3.38.0+ では -> および ->> 演算子が使用可能
`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node analyze-json-usage.mjs <schema-file.ts>");
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
      ...checkExpressionIndexes(tables),
      ...checkGeneratedColumnOpportunity(tables),
      ...checkValidation(tables),
    ];

    printReport(tables, issues);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
