#!/usr/bin/env node

/**
 * check-fk-integrity.mjs
 *
 * Drizzle ORMスキーマファイルから外部キー制約の設計を分析し、
 * ベストプラクティスに基づいた改善提案を行うスクリプト。
 *
 * 使用方法:
 *   node check-fk-integrity.mjs <schema-file.ts>
 *
 * 例:
 *   node check-fk-integrity.mjs src/shared/infrastructure/database/schema.ts
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
  magenta: "\x1b[35m",
  reset: "\x1b[0m",
};

/**
 * 問題の種類
 */
const IssueType = {
  NO_INDEX: "no_index",
  CASCADE_WITH_SOFT_DELETE: "cascade_soft_delete",
  CIRCULAR_REFERENCE: "circular_reference",
  MISSING_ON_DELETE: "missing_on_delete",
  NULLABLE_CASCADE: "nullable_cascade",
  DEEP_CASCADE: "deep_cascade",
};

/**
 * 問題クラス
 */
class FkIssue {
  constructor(type, severity, table, column, description, suggestion) {
    this.type = type;
    this.severity = severity; // error, warning, info
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

  // テーブル定義を抽出
  const tableRegex = /export const (\w+)\s*=\s*pgTable\s*\(\s*['"](\w+)['"]/g;
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

    // 外部キーを抽出
    const foreignKeys = extractForeignKeys(tableDefinition, varName);

    // インデックス情報を抽出
    const indexes = extractIndexes(tableDefinition);

    // ソフトデリートカラムの有無
    const hasSoftDelete =
      tableDefinition.includes("deleted_at") ||
      tableDefinition.includes("deletedAt");

    tables.push({
      varName,
      tableName,
      definition: tableDefinition,
      foreignKeys,
      indexes,
      hasSoftDelete,
    });
  }

  return tables;
}

/**
 * 外部キーを抽出
 */
function extractForeignKeys(tableDefinition, tableName) {
  const fks = [];
  const lines = tableDefinition.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // .references() パターンを検出
    const refMatch = line.match(
      /(\w+):\s*uuid\s*\(['"]([\w_]+)['"]\)([^,]*\.references\s*\(\s*\(\)\s*=>\s*(\w+)\.id)/,
    );
    if (refMatch) {
      const [, varName, columnName, modifiers, referencedTable] = refMatch;

      // ON DELETE 動作を抽出
      const onDeleteMatch = line.match(/onDelete:\s*['"](\w+)['"]/);
      const onDelete = onDeleteMatch ? onDeleteMatch[1] : "restrict";

      // ON UPDATE 動作を抽出
      const onUpdateMatch = line.match(/onUpdate:\s*['"](\w+)['"]/);
      const onUpdate = onUpdateMatch ? onUpdateMatch[1] : "cascade";

      // NOT NULL かどうか
      const isNotNull = modifiers.includes(".notNull()");

      fks.push({
        varName,
        columnName,
        referencedTable,
        onDelete,
        onUpdate,
        isNotNull,
        sourceTable: tableName,
      });
    }
  }

  return fks;
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
    const [, varName, indexName] = match;

    // .on() でカラムを取得
    const restOfDef = tableDefinition.slice(match.index);
    const onMatch = restOfDef.match(/\.on\s*\(\s*([^)]+)\s*\)/);
    const columns = onMatch
      ? onMatch[1].split(",").map((c) => c.trim().replace(/table\.\s*/, ""))
      : [];

    indexes.push({
      varName,
      name: indexName,
      columns,
    });
  }

  return indexes;
}

/**
 * 外部キーインデックスの有無をチェック
 */
function checkFkIndexes(tables) {
  const issues = [];

  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      // この外部キーカラムにインデックスがあるか
      const hasIndex = table.indexes.some((idx) =>
        idx.columns.some(
          (col) => col === fk.varName || col === `table.${fk.varName}`,
        ),
      );

      if (!hasIndex) {
        issues.push(
          new FkIssue(
            IssueType.NO_INDEX,
            "warning",
            table.tableName,
            fk.columnName,
            "外部キーカラムにインデックスがありません",
            `CREATE INDEX idx_${table.tableName}_${fk.columnName} ON ${table.tableName}(${fk.columnName}); を追加してください。`,
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * CASCADEとソフトデリートの矛盾をチェック
 */
function checkCascadeSoftDelete(tables) {
  const issues = [];

  for (const table of tables) {
    if (table.hasSoftDelete) {
      for (const fk of table.foreignKeys) {
        if (fk.onDelete === "cascade") {
          issues.push(
            new FkIssue(
              IssueType.CASCADE_WITH_SOFT_DELETE,
              "error",
              table.tableName,
              fk.columnName,
              "ソフトデリートカラムがあるテーブルでON DELETE CASCADEを使用しています",
              "ON DELETE RESTRICTに変更し、アプリケーション層でソフトデリートを伝播させてください。",
            ),
          );
        }
      }
    }
  }

  return issues;
}

/**
 * 循環参照をチェック
 */
function checkCircularReferences(tables) {
  const issues = [];
  const graph = new Map();

  // 依存関係グラフを構築
  for (const table of tables) {
    const deps = table.foreignKeys.map((fk) => fk.referencedTable);
    graph.set(table.varName, deps);
  }

  // 循環検出（DFS）
  function hasCycle(node, visited, recStack, path) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const result = hasCycle(neighbor, visited, recStack, path);
        if (result) return result;
      } else if (recStack.has(neighbor)) {
        // 循環を発見
        const cycleStart = path.indexOf(neighbor);
        return path.slice(cycleStart).concat(neighbor);
      }
    }

    path.pop();
    recStack.delete(node);
    return null;
  }

  const visited = new Set();
  for (const table of tables) {
    if (!visited.has(table.varName)) {
      const cycle = hasCycle(table.varName, visited, new Set(), []);
      if (cycle) {
        issues.push(
          new FkIssue(
            IssueType.CIRCULAR_REFERENCE,
            "warning",
            cycle.join(" → "),
            "-",
            `循環参照が検出されました: ${cycle.join(" → ")}`,
            "NULL許可による打破、関係テーブルへの分離、または設計の見直しを検討してください。",
          ),
        );
        break; // 1つの循環を報告すれば十分
      }
    }
  }

  return issues;
}

/**
 * ON DELETE未指定をチェック
 */
function checkMissingOnDelete(tables) {
  const issues = [];

  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      // デフォルトのrestrict以外が明示的に指定されていない場合
      // 実際にはDrizzleのデフォルトを使用しているかどうかを確認
      if (
        !table.definition.includes(`onDelete:`) &&
        table.definition.includes(`.references(`)
      ) {
        // 明示的なonDelete指定がない場合（最初の1回のみ報告）
        const hasExplicitOnDelete = table.foreignKeys.some((f) =>
          table.definition.includes(`onDelete:`),
        );

        if (!hasExplicitOnDelete) {
          issues.push(
            new FkIssue(
              IssueType.MISSING_ON_DELETE,
              "info",
              table.tableName,
              fk.columnName,
              "ON DELETE動作が明示的に指定されていません（デフォルト: RESTRICT）",
              "明示的にonDelete動作を指定することで、設計意図を明確にすることを推奨します。",
            ),
          );
          break; // テーブルごとに1回のみ報告
        }
      }
    }
  }

  return issues;
}

/**
 * NULL許可カラムでのCASCADE使用をチェック
 */
function checkNullableCascade(tables) {
  const issues = [];

  for (const table of tables) {
    for (const fk of table.foreignKeys) {
      if (!fk.isNotNull && fk.onDelete === "cascade") {
        issues.push(
          new FkIssue(
            IssueType.NULLABLE_CASCADE,
            "info",
            table.tableName,
            fk.columnName,
            "NULL許可の外部キーでON DELETE CASCADEを使用しています",
            "関連がオプショナルな場合、ON DELETE SET NULLの方が適切かもしれません。",
          ),
        );
      }
    }
  }

  return issues;
}

/**
 * CASCADE削除の深さをチェック
 */
function checkDeepCascade(tables) {
  const issues = [];
  const cascadeGraph = new Map();

  // CASCADE関係のグラフを構築
  for (const table of tables) {
    const cascadeDeps = table.foreignKeys
      .filter((fk) => fk.onDelete === "cascade")
      .map((fk) => fk.referencedTable);
    cascadeGraph.set(table.varName, cascadeDeps);
  }

  // 各テーブルからのCASCADE深さを計算
  function getCascadeDepth(node, visited = new Set()) {
    if (visited.has(node)) return 0;
    visited.add(node);

    const deps = cascadeGraph.get(node) || [];
    if (deps.length === 0) return 0;

    return 1 + Math.max(...deps.map((d) => getCascadeDepth(d, visited)));
  }

  // 深いCASCADE連鎖を検出
  for (const table of tables) {
    const depth = getCascadeDepth(table.varName);
    if (depth >= 3) {
      issues.push(
        new FkIssue(
          IssueType.DEEP_CASCADE,
          "warning",
          table.tableName,
          "-",
          `深いCASCADE削除連鎖（${depth}レベル）が検出されました`,
          "大量削除によるパフォーマンス影響を考慮し、バッチ処理またはソフトデリートを検討してください。",
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
  console.log("外部キー整合性チェックレポート");
  console.log("=".repeat(60) + "\n");

  // サマリー
  const totalFks = tables.reduce((sum, t) => sum + t.foreignKeys.length, 0);
  const tablesWithSoftDelete = tables.filter((t) => t.hasSoftDelete).length;

  console.log(`${colors.cyan}サマリー${colors.reset}`);
  console.log(`  分析テーブル数: ${tables.length}`);
  console.log(`  外部キー数: ${totalFks}`);
  console.log(`  ソフトデリート使用テーブル: ${tablesWithSoftDelete}`);
  console.log(`  検出された問題/提案: ${issues.length}\n`);

  // 外部キー一覧
  console.log(`${colors.cyan}外部キー一覧${colors.reset}\n`);

  for (const table of tables) {
    if (table.foreignKeys.length === 0) continue;

    const softDeleteMark = table.hasSoftDelete
      ? ` ${colors.magenta}[soft-delete]${colors.reset}`
      : "";
    console.log(`📋 ${table.tableName}${softDeleteMark}`);

    for (const fk of table.foreignKeys) {
      const nullMark = fk.isNotNull ? "NOT NULL" : "NULL OK";
      const onDeleteColor =
        fk.onDelete === "cascade"
          ? colors.yellow
          : fk.onDelete === "restrict"
            ? colors.green
            : colors.blue;

      console.log(
        `   • ${fk.columnName} → ${fk.referencedTable}.id ` +
          `[${nullMark}] ` +
          `${onDeleteColor}ON DELETE ${fk.onDelete.toUpperCase()}${colors.reset}`,
      );
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
    error: issues.filter((i) => i.severity === "error"),
    warning: issues.filter((i) => i.severity === "warning"),
    info: issues.filter((i) => i.severity === "info"),
  };

  const severityLabels = {
    error: { label: "エラー", color: colors.red },
    warning: { label: "警告", color: colors.yellow },
    info: { label: "情報", color: colors.blue },
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
1. すべての外部キーカラムにインデックスを設定
2. ソフトデリートテーブルではON DELETE RESTRICTを使用
3. CASCADE動作を明示的に指定して設計意図を明確化
4. 深いCASCADE連鎖ではパフォーマンス影響を考慮
5. 循環参照がある場合は設計を見直し
`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使用方法: node check-fk-integrity.mjs <schema-file.ts>");
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
      ...checkFkIndexes(tables),
      ...checkCascadeSoftDelete(tables),
      ...checkCircularReferences(tables),
      ...checkMissingOnDelete(tables),
      ...checkNullableCascade(tables),
      ...checkDeepCascade(tables),
    ];

    printReport(tables, issues);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
