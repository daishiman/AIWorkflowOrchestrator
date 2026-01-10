#!/usr/bin/env node

/**
 * detect-anti-patterns.mjs
 *
 * Drizzle ORMスキーマファイルからSQLアンチパターンを検出するスクリプト。
 *
 * 使用方法:
 *   node detect-anti-patterns.mjs <schema-file.ts>
 *
 * 例:
 *   node detect-anti-patterns.mjs src/shared/infrastructure/database/schema.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// 色定義
const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
};

/**
 * アンチパターンの種類
 */
const AntiPatternType = {
  JAYWALKING: "jaywalking",
  EAV: "eav",
  POLYMORPHIC: "polymorphic",
  ROUNDING_ERROR: "rounding_error",
  KEYLESS_ENTRY: "keyless_entry",
  MULTICOLUMN_ATTRIBUTE: "multicolumn_attribute",
  ID_REQUIRED: "id_required",
  NULL_FEAR: "null_fear",
};

/**
 * アンチパターン検出結果
 */
class AntiPattern {
  constructor(type, severity, table, column, description, solution) {
    this.type = type;
    this.severity = severity; // critical, high, medium
    this.table = table;
    this.column = column;
    this.description = description;
    this.solution = solution;
  }
}

/**
 * スキーマファイルを解析
 */
function parseSchemaFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const tables = [];

  // テーブル定義を抽出（SQLite用）
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
    const columns = extractColumns(tableDefinition);
    const hasForeignKeys = tableDefinition.includes(".references(");
    const hasCompositePK = tableDefinition.includes("primaryKey(");

    tables.push({
      varName,
      tableName,
      definition: tableDefinition,
      columns,
      hasForeignKeys,
      hasCompositePK,
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
    // 各種カラム定義パターン
    const patterns = [
      { regex: /(\w+):\s*varchar\s*\(\s*['"]([^'"]+)['"]/, type: "varchar" },
      { regex: /(\w+):\s*text\s*\(/, type: "text" },
      { regex: /(\w+):\s*integer\s*\(/, type: "integer" },
      { regex: /(\w+):\s*bigint\s*\(/, type: "bigint" },
      { regex: /(\w+):\s*boolean\s*\(/, type: "boolean" },
      { regex: /(\w+):\s*timestamp\s*\(/, type: "timestamp" },
      { regex: /(\w+):\s*jsonb\s*\(/, type: "jsonb" },
      { regex: /(\w+):\s*json\s*\(/, type: "json" },
      { regex: /(\w+):\s*decimal\s*\(/, type: "decimal" },
      { regex: /(\w+):\s*real\s*\(/, type: "real" },
      { regex: /(\w+):\s*doublePrecision\s*\(/, type: "doublePrecision" },
      { regex: /(\w+):\s*uuid\s*\(/, type: "uuid" },
      { regex: /(\w+):\s*serial\s*\(/, type: "serial" },
    ];

    for (const { regex, type } of patterns) {
      const match = line.match(regex);
      if (match) {
        const columnName = match[1];
        const hasReferences = line.includes(".references(");
        const hasDefault = line.includes(".default(");
        const notNull = line.includes(".notNull()");

        columns.push({
          name: columnName,
          type,
          hasReferences,
          hasDefault,
          notNull,
          line,
        });
        break;
      }
    }
  }

  return columns;
}

/**
 * ジェイウォーク検出
 */
function detectJaywalking(tables) {
  const issues = [];

  const suspiciousNames = [
    /tags?$/i,
    /categories$/i,
    /items$/i,
    /list$/i,
    /values$/i,
    /ids$/i,
    /emails$/i,
    /phones$/i,
  ];

  for (const table of tables) {
    for (const col of table.columns) {
      // text/varchar で複数値を示唆する名前
      if (["varchar", "text"].includes(col.type)) {
        for (const pattern of suspiciousNames) {
          if (pattern.test(col.name)) {
            issues.push(
              new AntiPattern(
                AntiPatternType.JAYWALKING,
                "high",
                table.tableName,
                col.name,
                `カラム "${col.name}" はカンマ区切り値を格納している可能性があります`,
                "関連テーブルへの正規化を検討してください。",
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
 * EAV検出
 */
function detectEAV(tables) {
  const issues = [];

  const eavPatterns = [
    ["attribute_name", "attribute_value"],
    ["key", "value"],
    ["property_name", "property_value"],
    ["field_name", "field_value"],
    ["attr_key", "attr_value"],
  ];

  for (const table of tables) {
    const columnNames = table.columns.map((c) => c.name);

    for (const [nameCol, valueCol] of eavPatterns) {
      if (columnNames.includes(nameCol) && columnNames.includes(valueCol)) {
        issues.push(
          new AntiPattern(
            AntiPatternType.EAV,
            "high",
            table.tableName,
            `${nameCol}, ${valueCol}`,
            "EAV（Entity-Attribute-Value）パターンが検出されました",
            "JSONカラム（JSON1拡張）、継承パターン、または適切な正規化を検討してください。",
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * Polymorphic Associations検出
 */
function detectPolymorphic(tables) {
  const issues = [];

  for (const table of tables) {
    const columnNames = table.columns.map((c) => c.name);

    // *_type + *_id パターンを検出
    const typeColumns = columnNames.filter(
      (name) =>
        name.endsWith("_type") ||
        name.endsWith("able_type") ||
        name === "commentable_type",
    );

    for (const typeCol of typeColumns) {
      const prefix = typeCol
        .replace(/_type$/, "")
        .replace(/able_type$/, "able");
      const idCol = `${prefix}_id`;

      if (columnNames.includes(idCol)) {
        // 外部キー制約があるか確認
        const idColumn = table.columns.find((c) => c.name === idCol);
        if (idColumn && !idColumn.hasReferences) {
          issues.push(
            new AntiPattern(
              AntiPatternType.POLYMORPHIC,
              "critical",
              table.tableName,
              `${typeCol}, ${idCol}`,
              "Polymorphic Associations パターンが検出されました。外部キー制約がありません。",
              "共通親テーブル、個別外部キーカラム、または交差テーブルを検討してください。",
            ),
          );
        }
      }
    }
  }

  return issues;
}

/**
 * ラウンディングエラー検出
 */
function detectRoundingError(tables) {
  const issues = [];

  const moneyPatterns = [
    /price/i,
    /amount/i,
    /cost/i,
    /fee/i,
    /total/i,
    /balance/i,
    /salary/i,
    /budget/i,
  ];

  for (const table of tables) {
    for (const col of table.columns) {
      if (["real", "doublePrecision"].includes(col.type)) {
        for (const pattern of moneyPatterns) {
          if (pattern.test(col.name)) {
            issues.push(
              new AntiPattern(
                AntiPatternType.ROUNDING_ERROR,
                "critical",
                table.tableName,
                col.name,
                `金額カラム "${col.name}" に浮動小数点型が使用されています`,
                "DECIMAL(precision, scale) 型に変更してください。金額計算の精度が保証されます。",
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
 * キーレスエントリ検出
 */
function detectKeylessEntry(tables) {
  const issues = [];

  for (const table of tables) {
    // _id で終わるカラムで references がないものを検出
    for (const col of table.columns) {
      if (col.name.endsWith("_id") && col.name !== "id" && !col.hasReferences) {
        issues.push(
          new AntiPattern(
            AntiPatternType.KEYLESS_ENTRY,
            "high",
            table.tableName,
            col.name,
            `外部キーカラム "${col.name}" に参照制約がありません`,
            ".references() を追加して参照整合性を保証してください。",
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * マルチカラムアトリビュート検出
 */
function detectMulticolumnAttribute(tables) {
  const issues = [];

  for (const table of tables) {
    const columnNames = table.columns.map((c) => c.name);

    // 番号付きカラムパターンを検出
    const patterns = {};
    for (const name of columnNames) {
      const match = name.match(/^(.+?)(\d+)$/);
      if (match) {
        const base = match[1];
        if (!patterns[base]) patterns[base] = [];
        patterns[base].push(name);
      }
    }

    for (const [base, cols] of Object.entries(patterns)) {
      if (cols.length >= 2) {
        issues.push(
          new AntiPattern(
            AntiPatternType.MULTICOLUMN_ATTRIBUTE,
            "medium",
            table.tableName,
            cols.join(", "),
            `繰り返しカラムパターン "${base}N" が検出されました`,
            "関連テーブルへの正規化を検討してください。",
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * ID Required検出（交差テーブル）
 */
function detectIdRequired(tables) {
  const issues = [];

  for (const table of tables) {
    // 交差テーブルの可能性を検出
    const fkColumns = table.columns.filter(
      (c) => c.name.endsWith("_id") && c.hasReferences,
    );

    // 2つのFKがあり、IDカラムもある場合
    if (fkColumns.length === 2) {
      const hasSerialId = table.columns.some(
        (c) => c.name === "id" && ["serial", "uuid"].includes(c.type),
      );

      if (hasSerialId && !table.hasCompositePK) {
        issues.push(
          new AntiPattern(
            AntiPatternType.ID_REQUIRED,
            "medium",
            table.tableName,
            "id",
            "交差テーブルに不要なサロゲートキーがある可能性があります",
            "複合主キー (FK1, FK2) の使用を検討してください。",
          ),
        );
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
  console.log("SQL アンチパターン検出レポート");
  console.log("=".repeat(60) + "\n");

  console.log(`分析対象テーブル数: ${tables.length}`);
  console.log(`検出されたアンチパターン: ${issues.length}\n`);

  if (issues.length === 0) {
    console.log(
      `${colors.green}✅ SQLアンチパターンは検出されませんでした。${colors.reset}\n`,
    );
    return;
  }

  // 重要度別にグループ化
  const grouped = {
    critical: issues.filter((i) => i.severity === "critical"),
    high: issues.filter((i) => i.severity === "high"),
    medium: issues.filter((i) => i.severity === "medium"),
  };

  const severityLabels = {
    critical: { label: "クリティカル", color: colors.red, icon: "🔴" },
    high: { label: "高", color: colors.yellow, icon: "🟡" },
    medium: { label: "中", color: colors.blue, icon: "🟢" },
  };

  for (const [severity, severityIssues] of Object.entries(grouped)) {
    if (severityIssues.length === 0) continue;

    const { label, color, icon } = severityLabels[severity];

    console.log(`\n### ${icon} ${label} (${severityIssues.length}件) ###\n`);

    for (const issue of severityIssues) {
      console.log(
        `${color}[${issue.type.toUpperCase()}]${colors.reset} ${issue.table}.${issue.column}`,
      );
      console.log(`  📝 ${issue.description}`);
      console.log(`  💡 ${issue.solution}`);
      console.log();
    }
  }

  // サマリー
  console.log("=".repeat(60));
  console.log("サマリー");
  console.log("=".repeat(60));

  if (grouped.critical.length > 0) {
    console.log(
      `${colors.red}🔴 クリティカル: ${grouped.critical.length}${colors.reset} - 即時対応必須`,
    );
  }
  if (grouped.high.length > 0) {
    console.log(
      `${colors.yellow}🟡 高: ${grouped.high.length}${colors.reset} - 早期対応推奨`,
    );
  }
  if (grouped.medium.length > 0) {
    console.log(
      `${colors.blue}🟢 中: ${grouped.medium.length}${colors.reset} - 計画的改善`,
    );
  }

  console.log("\n");
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node detect-anti-patterns.mjs <schema-file.ts>");
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
      ...detectJaywalking(tables),
      ...detectEAV(tables),
      ...detectPolymorphic(tables),
      ...detectRoundingError(tables),
      ...detectKeylessEntry(tables),
      ...detectMulticolumnAttribute(tables),
      ...detectIdRequired(tables),
    ];

    printReport(tables, issues);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
