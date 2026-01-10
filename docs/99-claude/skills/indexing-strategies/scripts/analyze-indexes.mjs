#!/usr/bin/env node

/**
 * analyze-indexes.mjs
 *
 * Drizzle ORM (SQLite) スキーマファイルからインデックス設計を分析し、
 * 潜在的な問題や最適化の機会を検出するスクリプト。
 *
 * 使用方法:
 *   node analyze-indexes.mjs <schema-file.ts>
 *
 * 例:
 *   node analyze-indexes.mjs src/shared/infrastructure/database/schema.ts
 *
 * 対応データベース: SQLite (sqliteTable)
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
 * インデックス問題の種類
 */
const IssueType = {
  MISSING_FK_INDEX: "missing_fk_index",
  JSON_WITHOUT_EXPR_INDEX: "json_without_expr_index",
  REDUNDANT_INDEX: "redundant_index",
  NAMING_CONVENTION: "naming_convention",
  COMPOSITE_ORDER: "composite_order",
};

/**
 * インデックス分析結果
 */
class IndexIssue {
  constructor(type, severity, table, details, suggestion) {
    this.type = type;
    this.severity = severity; // error, warning, info
    this.table = table;
    this.details = details;
    this.suggestion = suggestion;
  }
}

/**
 * スキーマファイルを解析
 */
function parseSchemaFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const tables = [];

  // テーブル定義を抽出（SQLite）
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

    // カラムとインデックスを抽出
    const columns = extractColumns(tableDefinition);
    const indexes = extractIndexes(tableDefinition);
    const foreignKeys = extractForeignKeys(tableDefinition);

    tables.push({
      varName,
      tableName,
      definition: tableDefinition,
      columns,
      indexes,
      foreignKeys,
    });
  }

  return tables;
}

/**
 * カラム情報を抽出
 */
function extractColumns(tableDefinition) {
  const columns = [];
  const lines = tableDefinition.split("\n");

  for (const line of lines) {
    // カラム定義パターン
    const colMatch = line.match(
      /(\w+):\s*(uuid|varchar|text|integer|bigint|boolean|timestamp|jsonb?|decimal)\s*\(/,
    );
    if (colMatch) {
      const [, name, type] = colMatch;
      columns.push({
        name,
        type,
        isJsonb: type === "jsonb",
        isForeignKey: name.endsWith("_id") && name !== "id",
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
    const onMatch = tableDefinition
      .slice(match.index)
      .match(/\.on\s*\(\s*([^)]+)\s*\)/);
    const columns = onMatch
      ? onMatch[1].split(",").map((c) => c.trim().replace(/table\.\s*/, ""))
      : [];

    // .using() でタイプを取得
    const usingMatch = tableDefinition
      .slice(match.index)
      .match(/\.using\s*\(\s*sql`(\w+)`\s*\)/);
    const type = usingMatch ? usingMatch[1] : "btree";

    indexes.push({
      varName,
      name: indexName,
      columns,
      type,
    });
  }

  return indexes;
}

/**
 * 外部キー情報を抽出
 */
function extractForeignKeys(tableDefinition) {
  const foreignKeys = [];

  // references() 呼び出しを検出
  const fkRegex =
    /(\w+):\s*\w+\([^)]*\)[^.]*\.references\s*\(\s*\(\s*\)\s*=>\s*(\w+)\.(\w+)\s*\)/g;
  let match;

  while ((match = fkRegex.exec(tableDefinition)) !== null) {
    const [, columnName, refTable, refColumn] = match;
    foreignKeys.push({
      column: columnName,
      referencedTable: refTable,
      referencedColumn: refColumn,
    });
  }

  return foreignKeys;
}

/**
 * 外部キーにインデックスがあるか確認
 */
function checkForeignKeyIndexes(tables) {
  const issues = [];

  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      // このカラムにインデックスがあるか確認
      const hasIndex = table.indexes.some(
        (idx) =>
          idx.columns.includes(fk.column) && idx.columns[0] === fk.column,
      );

      if (!hasIndex) {
        issues.push(
          new IndexIssue(
            IssueType.MISSING_FK_INDEX,
            "warning",
            table.tableName,
            `外部キー "${fk.column}" にインデックスがありません`,
            `インデックス "idx_${table.tableName}_${fk.column}" の追加を検討してください。JOINパフォーマンスが向上します。`,
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * JSONカラム（TEXT型）に式インデックスがあるか確認
 */
function checkJsonIndexes(tables) {
  const issues = [];

  for (const table of tables) {
    // TEXTカラムでJSON形式を含む可能性があるもの
    const jsonColumns = table.columns.filter(
      (col) =>
        col.type === "text" &&
        (col.name.includes("data") ||
          col.name.includes("payload") ||
          col.name.includes("metadata") ||
          col.name.includes("json")),
    );

    for (const col of jsonColumns) {
      // このカラムに式インデックス（json_extract）があるか確認
      const hasJsonIndex = table.indexes.some(
        (idx) =>
          idx.columns.some((c) => c.includes("json_extract")) &&
          idx.columns.some((c) => c.includes(col.name)),
      );

      if (!hasJsonIndex) {
        issues.push(
          new IndexIssue(
            IssueType.JSON_WITHOUT_EXPR_INDEX,
            "info",
            table.tableName,
            `JSONカラム "${col.name}" に式インデックスがありません`,
            `JSON検索が必要な場合は json_extract() を使用した式インデックスの追加を検討してください。例: CREATE INDEX idx_${table.tableName}_${col.name}_status ON ${table.tableName}(json_extract(${col.name}, '$.status'))`,
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * インデックス命名規則をチェック
 */
function checkNamingConventions(tables) {
  const issues = [];

  const validPrefixes = ["idx_", "uniq_"];
  const validSuffixes = ["_expr", "_partial", "_lower"];

  for (const table of tables) {
    for (const idx of table.indexes) {
      // プレフィックスまたはサフィックスチェック
      const hasValidPrefix = validPrefixes.some((prefix) =>
        idx.name.startsWith(prefix),
      );
      const hasValidSuffix = validSuffixes.some((suffix) =>
        idx.name.endsWith(suffix),
      );

      if (!hasValidPrefix && !hasValidSuffix) {
        issues.push(
          new IndexIssue(
            IssueType.NAMING_CONVENTION,
            "info",
            table.tableName,
            `インデックス "${idx.name}" が標準命名規則に従っていません`,
            `推奨フォーマット: idx_${table.tableName}_${idx.columns.join("_")} または式/部分インデックスの場合は _expr/_partial サフィックス`,
          ),
        );
      }

      // テーブル名が含まれているか
      if (!idx.name.includes(table.tableName)) {
        issues.push(
          new IndexIssue(
            IssueType.NAMING_CONVENTION,
            "info",
            table.tableName,
            `インデックス "${idx.name}" にテーブル名が含まれていません`,
            `保守性向上のため、テーブル名を含めることを推奨します`,
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * 重複インデックスをチェック
 */
function checkRedundantIndexes(tables) {
  const issues = [];

  for (const table of tables) {
    for (let i = 0; i < table.indexes.length; i++) {
      for (let j = i + 1; j < table.indexes.length; j++) {
        const idx1 = table.indexes[i];
        const idx2 = table.indexes[j];

        // 同じカラムで始まるインデックスを検出
        if (idx1.columns[0] === idx2.columns[0] && idx1.type === idx2.type) {
          // 一方が他方のプレフィックスか確認
          const cols1 = idx1.columns.join(",");
          const cols2 = idx2.columns.join(",");

          if (cols1.startsWith(cols2) || cols2.startsWith(cols1)) {
            issues.push(
              new IndexIssue(
                IssueType.REDUNDANT_INDEX,
                "warning",
                table.tableName,
                `インデックス "${idx1.name}" と "${idx2.name}" が冗長な可能性があります`,
                `カラムが重複しています: [${cols1}] と [${cols2}]。短い方を削除できる可能性があります。`,
              ),
            );
          }
        }
      }
    }
  }

  return issues;
}

/**
 * レポートを出力
 */
function printReport(tables, issues) {
  console.log("\n" + "=".repeat(60));
  console.log("インデックス分析レポート");
  console.log("=".repeat(60) + "\n");

  // サマリー
  const totalIndexes = tables.reduce((sum, t) => sum + t.indexes.length, 0);
  const totalForeignKeys = tables.reduce(
    (sum, t) => sum + t.foreignKeys.length,
    0,
  );
  const totalJsonColumns = tables.reduce(
    (sum, t) =>
      sum +
      t.columns.filter(
        (c) =>
          c.type === "text" &&
          (c.name.includes("data") ||
            c.name.includes("payload") ||
            c.name.includes("metadata") ||
            c.name.includes("json")),
      ).length,
    0,
  );

  console.log(`${colors.cyan}サマリー${colors.reset}`);
  console.log(`  テーブル数: ${tables.length}`);
  console.log(`  インデックス数: ${totalIndexes}`);
  console.log(`  外部キー数: ${totalForeignKeys}`);
  console.log(`  JSONカラム数（推定）: ${totalJsonColumns}`);
  console.log(`  検出された問題: ${issues.length}\n`);

  // テーブル別インデックス一覧
  console.log(`${colors.cyan}テーブル別インデックス一覧${colors.reset}\n`);

  for (const table of tables) {
    console.log(`📋 ${table.tableName}`);

    if (table.indexes.length === 0) {
      console.log(`   (インデックスなし)\n`);
      continue;
    }

    for (const idx of table.indexes) {
      const typeLabel =
        idx.type === "btree" ? "" : `[${idx.type.toUpperCase()}]`;
      console.log(`   • ${idx.name} ${typeLabel}`);
      console.log(`     カラム: ${idx.columns.join(", ")}`);
    }
    console.log();
  }

  // 問題レポート
  if (issues.length === 0) {
    console.log(
      `${colors.green}✅ インデックス設計に明らかな問題は見つかりませんでした。${colors.reset}\n`,
    );
    return;
  }

  console.log(`${colors.cyan}検出された問題${colors.reset}\n`);

  // 重要度別にグループ化
  const grouped = {
    error: issues.filter((i) => i.severity === "error"),
    warning: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
  };

  for (const [severity, severityIssues] of Object.entries(grouped)) {
    if (severityIssues.length === 0) continue;

    const color =
      severity === "error"
        ? colors.red
        : severity === "warning"
          ? colors.yellow
          : colors.blue;
    const label =
      severity === "error"
        ? "エラー"
        : severity === "warning"
          ? "警告"
          : "情報";

    console.log(`\n### ${label} (${severityIssues.length}件) ###\n`);

    for (const issue of severityIssues) {
      console.log(
        `${color}[${severity.toUpperCase()}]${colors.reset} ${issue.table}`,
      );
      console.log(`  📝 ${issue.details}`);
      console.log(`  💡 ${issue.suggestion}`);
      console.log();
    }
  }

  // 統計サマリー
  console.log("=".repeat(60));
  console.log("問題サマリー");
  console.log("=".repeat(60));

  if (grouped.error.length > 0) {
    console.log(`${colors.red}エラー: ${grouped.error.length}${colors.reset}`);
  }
  if (grouped.warning.length > 0) {
    console.log(
      `${colors.yellow}警告: ${grouped.warning.length}${colors.reset}`,
    );
  }
  if (grouped.info.length > 0) {
    console.log(`${colors.blue}情報: ${grouped.info.length}${colors.reset}`);
  }

  console.log("\n");
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node analyze-indexes.mjs <schema-file.ts>");
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
      ...checkForeignKeyIndexes(tables),
      ...checkJsonIndexes(tables),
      ...checkNamingConventions(tables),
      ...checkRedundantIndexes(tables),
    ];

    printReport(tables, issues);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
