#!/usr/bin/env node

/**
 * analyze-jsonb-usage.mjs
 *
 * Drizzle ORMスキーマファイルからJSONBカラムの使用状況を分析し、
 * 最適化の機会を検出するスクリプト。
 *
 * 使用方法:
 *   node analyze-jsonb-usage.mjs <schema-file.ts>
 *
 * 例:
 *   node analyze-jsonb-usage.mjs src/shared/infrastructure/database/schema.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// 色定義
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * 問題の種類
 */
const IssueType = {
  NO_GIN_INDEX: 'no_gin_index',
  WRONG_GIN_TYPE: 'wrong_gin_type',
  NO_VALIDATION: 'no_validation',
  FREQUENT_SEARCH: 'frequent_search',
};

/**
 * JSONB分析結果
 */
class JsonbIssue {
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
  const content = readFileSync(filePath, 'utf-8');
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
      if (content[i] === '(') {
        braceCount++;
        inDefinition = true;
      } else if (content[i] === ')') {
        braceCount--;
        if (inDefinition && braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    const tableDefinition = content.slice(startIndex, endIndex + 1);

    // JSONBカラムを抽出
    const jsonbColumns = extractJsonbColumns(tableDefinition);

    // インデックス情報を抽出
    const indexes = extractIndexes(tableDefinition);

    tables.push({
      varName,
      tableName,
      definition: tableDefinition,
      jsonbColumns,
      indexes,
    });
  }

  return tables;
}

/**
 * JSONBカラムを抽出
 */
function extractJsonbColumns(tableDefinition) {
  const columns = [];
  const lines = tableDefinition.split('\n');

  for (const line of lines) {
    // jsonb カラム定義
    const match = line.match(/(\w+):\s*jsonb\s*\(['"]([^'"]+)['"]\)/);
    if (match) {
      const [, varName, columnName] = match;
      columns.push({
        varName,
        columnName,
        hasNotNull: line.includes('.notNull()'),
        hasDefault: line.includes('.default('),
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
    const columns = onMatch ? onMatch[1].split(',').map((c) => c.trim().replace(/table\.\s*/, '')) : [];

    // .using() でタイプを取得
    const usingMatch = restOfDef.match(/\.using\s*\(\s*sql`([^`]+)`\s*\)/);
    const using = usingMatch ? usingMatch[1] : 'btree';

    // jsonb_path_ops の検出
    const isPathOps = restOfDef.includes('jsonb_path_ops');

    indexes.push({
      varName,
      name: indexName,
      columns,
      using,
      isGin: using.toLowerCase().includes('gin'),
      isPathOps,
    });
  }

  return indexes;
}

/**
 * GINインデックスの有無をチェック
 */
function checkGinIndexes(tables) {
  const issues = [];

  for (const table of tables) {
    for (const jsonbCol of table.jsonbColumns) {
      // このJSONBカラムにGINインデックスがあるか
      const hasGinIndex = table.indexes.some(
        (idx) => idx.isGin && idx.columns.includes(jsonbCol.varName)
      );

      if (!hasGinIndex) {
        issues.push(
          new JsonbIssue(
            IssueType.NO_GIN_INDEX,
            'warning',
            table.tableName,
            jsonbCol.columnName,
            'JSONBカラムにGINインデックスがありません',
            `検索が必要な場合は "gin_${table.tableName}_${jsonbCol.columnName}" の追加を検討してください。`
          )
        );
      }
    }
  }

  return issues;
}

/**
 * GINインデックスタイプの最適性をチェック
 */
function checkGinIndexType(tables) {
  const issues = [];

  for (const table of tables) {
    for (const idx of table.indexes) {
      if (idx.isGin) {
        // jsonb_path_ops の使用可否をアドバイス
        if (!idx.isPathOps) {
          issues.push(
            new JsonbIssue(
              IssueType.WRONG_GIN_TYPE,
              'info',
              table.tableName,
              idx.name,
              'デフォルトGINインデックスを使用しています',
              '@>演算子のみ使用する場合は jsonb_path_ops の使用でサイズ削減と速度向上が見込めます。'
            )
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
    for (const jsonbCol of table.jsonbColumns) {
      // CHECK制約の存在を確認（スキーマ定義からは検出困難なのでアドバイスのみ）
      issues.push(
        new JsonbIssue(
          IssueType.NO_VALIDATION,
          'info',
          table.tableName,
          jsonbCol.columnName,
          'JSONBカラムの検証を確認してください',
          'CHECK制約（型検証、必須フィールド）とZodスキーマによる二重検証を推奨します。'
        )
      );
    }
  }

  return issues;
}

/**
 * レポートを出力
 */
function printReport(tables, issues) {
  console.log('\n' + '='.repeat(60));
  console.log('JSONB 使用分析レポート');
  console.log('='.repeat(60) + '\n');

  // サマリー
  const totalJsonbColumns = tables.reduce((sum, t) => sum + t.jsonbColumns.length, 0);
  const totalGinIndexes = tables.reduce(
    (sum, t) => sum + t.indexes.filter((i) => i.isGin).length,
    0
  );

  console.log(`${colors.cyan}サマリー${colors.reset}`);
  console.log(`  分析テーブル数: ${tables.length}`);
  console.log(`  JSONBカラム数: ${totalJsonbColumns}`);
  console.log(`  GINインデックス数: ${totalGinIndexes}`);
  console.log(`  検出された問題/提案: ${issues.length}\n`);

  // JSONBカラム一覧
  console.log(`${colors.cyan}JSONBカラム一覧${colors.reset}\n`);

  for (const table of tables) {
    if (table.jsonbColumns.length === 0) continue;

    console.log(`📋 ${table.tableName}`);

    for (const col of table.jsonbColumns) {
      const hasGin = table.indexes.some(
        (idx) => idx.isGin && idx.columns.includes(col.varName)
      );
      const ginStatus = hasGin ? `${colors.green}✓ GIN${colors.reset}` : `${colors.yellow}✗ No GIN${colors.reset}`;

      console.log(`   • ${col.columnName} ${ginStatus}`);
    }
    console.log();
  }

  // 問題レポート
  if (issues.length === 0) {
    console.log(`${colors.green}✅ 問題は検出されませんでした。${colors.reset}\n`);
    return;
  }

  console.log(`${colors.cyan}検出された問題と提案${colors.reset}\n`);

  // 重要度別にグループ化
  const grouped = {
    warning: issues.filter((i) => i.severity === 'warning'),
    info: issues.filter((i) => i.severity === 'info'),
    suggestion: issues.filter((i) => i.severity === 'suggestion'),
  };

  const severityLabels = {
    warning: { label: '警告', color: colors.yellow },
    info: { label: '情報', color: colors.blue },
    suggestion: { label: '提案', color: colors.green },
  };

  for (const [severity, severityIssues] of Object.entries(grouped)) {
    if (severityIssues.length === 0) continue;

    const { label, color } = severityLabels[severity];

    console.log(`\n### ${label} (${severityIssues.length}件) ###\n`);

    for (const issue of severityIssues) {
      console.log(`${color}[${issue.type.toUpperCase()}]${colors.reset} ${issue.table}.${issue.column}`);
      console.log(`  📝 ${issue.description}`);
      console.log(`  💡 ${issue.suggestion}`);
      console.log();
    }
  }

  // 推奨事項
  console.log('='.repeat(60));
  console.log('推奨事項');
  console.log('='.repeat(60));
  console.log(`
1. 検索が必要なJSONBカラムにはGINインデックスを追加
2. @>演算子のみ使用する場合は jsonb_path_ops を検討
3. CHECK制約で基本型検証を実装
4. Zodスキーマでアプリケーション層の検証を実装
5. 頻繁に検索する属性は通常カラムへの分離を検討
`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('使用方法: node analyze-jsonb-usage.mjs <schema-file.ts>');
    process.exit(1);
  }

  const filePath = resolve(args[0]);

  try {
    console.log(`\n分析中: ${filePath}\n`);

    const tables = parseSchemaFile(filePath);

    if (tables.length === 0) {
      console.log('テーブル定義が見つかりませんでした。');
      process.exit(0);
    }

    const issues = [
      ...checkGinIndexes(tables),
      ...checkGinIndexType(tables),
      ...checkValidation(tables),
    ];

    printReport(tables, issues);
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exit(1);
  }
}

main();
