#!/usr/bin/env node

/**
 * generate-rollback.mjs
 *
 * マイグレーションSQLからロールバックSQLを生成するスクリプト。
 *
 * 使用方法:
 *   node generate-rollback.mjs <migration-file>
 *
 * 例:
 *   node generate-rollback.mjs migrations/0001_add_users.sql
 */

import { readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';

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
 * ロールバック生成ルール
 */
const rollbackRules = [
  {
    // CREATE TABLE → DROP TABLE
    pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    generate: (match, tableName) => `DROP TABLE IF EXISTS "${tableName}";`,
  },
  {
    // DROP TABLE → コメント（復元不可）
    pattern: /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    generate: (match, tableName) =>
      `-- WARNING: Cannot auto-rollback DROP TABLE "${tableName}"\n-- Restore from backup if needed`,
  },
  {
    // ADD COLUMN → DROP COLUMN
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ADD\s+(?:COLUMN\s+)?["']?(\w+)["']?/gi,
    generate: (match, tableName, columnName) =>
      `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}";`,
  },
  {
    // DROP COLUMN → コメント（復元不可）
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+DROP\s+(?:COLUMN\s+)?(?:IF\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    generate: (match, tableName, columnName) =>
      `-- WARNING: Cannot auto-rollback DROP COLUMN "${columnName}" on "${tableName}"\n-- Restore from backup if needed`,
  },
  {
    // RENAME COLUMN → RENAME back
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+RENAME\s+(?:COLUMN\s+)?["']?(\w+)["']?\s+TO\s+["']?(\w+)["']?/gi,
    generate: (match, tableName, oldName, newName) =>
      `ALTER TABLE "${tableName}" RENAME COLUMN "${newName}" TO "${oldName}";`,
  },
  {
    // CREATE INDEX → DROP INDEX
    pattern:
      /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    generate: (match, indexName) => `DROP INDEX IF EXISTS "${indexName}";`,
  },
  {
    // DROP INDEX → コメント
    pattern: /DROP\s+INDEX\s+(?:IF\s+EXISTS\s+)?["']?(\w+)["']?/gi,
    generate: (match, indexName) =>
      `-- WARNING: Cannot auto-rollback DROP INDEX "${indexName}"\n-- Recreate index manually if needed`,
  },
  {
    // ADD CONSTRAINT → DROP CONSTRAINT
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ADD\s+CONSTRAINT\s+["']?(\w+)["']?/gi,
    generate: (match, tableName, constraintName) =>
      `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}";`,
  },
  {
    // SET NOT NULL → DROP NOT NULL
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ALTER\s+(?:COLUMN\s+)?["']?(\w+)["']?\s+SET\s+NOT\s+NULL/gi,
    generate: (match, tableName, columnName) =>
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP NOT NULL;`,
  },
  {
    // DROP NOT NULL → SET NOT NULL
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ALTER\s+(?:COLUMN\s+)?["']?(\w+)["']?\s+DROP\s+NOT\s+NULL/gi,
    generate: (match, tableName, columnName) =>
      `-- WARNING: Setting NOT NULL may fail if NULL values exist\nALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET NOT NULL;`,
  },
  {
    // SET DEFAULT → DROP DEFAULT
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ALTER\s+(?:COLUMN\s+)?["']?(\w+)["']?\s+SET\s+DEFAULT/gi,
    generate: (match, tableName, columnName) =>
      `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT;`,
  },
  {
    // RENAME TABLE → RENAME back
    pattern:
      /ALTER\s+TABLE\s+["']?(\w+)["']?\s+RENAME\s+TO\s+["']?(\w+)["']?/gi,
    generate: (match, oldName, newName) =>
      `ALTER TABLE "${newName}" RENAME TO "${oldName}";`,
  },
];

/**
 * SQLをパースしてステートメントに分割
 */
function parseStatements(sql) {
  // コメントを保持しつつ、セミコロンで分割
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    // 文字列リテラル内の処理
    if (inString) {
      current += char;
      if (char === stringChar && sql[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    // 文字列リテラル開始
    if (char === "'" || char === '"') {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }

    // セミコロンでステートメント終了
    if (char === ';') {
      const stmt = current.trim();
      if (stmt) {
        statements.push(stmt);
      }
      current = '';
      continue;
    }

    current += char;
  }

  // 最後のステートメント
  const lastStmt = current.trim();
  if (lastStmt) {
    statements.push(lastStmt);
  }

  return statements;
}

/**
 * ステートメントのロールバックSQLを生成
 */
function generateRollbackForStatement(statement) {
  for (const rule of rollbackRules) {
    const match = rule.pattern.exec(statement);
    if (match) {
      // パターンをリセット
      rule.pattern.lastIndex = 0;
      return rule.generate(...match);
    }
    // パターンをリセット
    rule.pattern.lastIndex = 0;
  }

  // マッチしない場合はコメントとして返す
  return `-- WARNING: Cannot auto-generate rollback for:\n-- ${statement.replace(/\n/g, '\n-- ')}`;
}

/**
 * マイグレーションファイルからロールバックSQLを生成
 */
function generateRollback(migrationPath) {
  const content = readFileSync(migrationPath, 'utf-8');
  const statements = parseStatements(content);

  // ロールバックは逆順で実行
  const rollbackStatements = statements.reverse().map((stmt) => {
    return generateRollbackForStatement(stmt);
  });

  const header = `-- Rollback for: ${basename(migrationPath)}
-- Generated at: ${new Date().toISOString()}
-- WARNING: Review this file before executing!

`;

  return header + rollbackStatements.join('\n\n') + '\n';
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: node generate-rollback.mjs <migration-file>');
    console.log('例: node generate-rollback.mjs migrations/0001_add_users.sql');
    process.exit(1);
  }

  const migrationPath = args[0];

  try {
    console.log(`\n${colors.cyan}マイグレーションファイル:${colors.reset} ${migrationPath}\n`);

    const rollbackSql = generateRollback(migrationPath);

    // 出力ファイル名を生成
    const dir = dirname(migrationPath);
    const base = basename(migrationPath, '.sql');
    const outputPath = join(dir, `${base}_rollback.sql`);

    writeFileSync(outputPath, rollbackSql);

    console.log(`${colors.green}✅ ロールバックSQL生成完了${colors.reset}`);
    console.log(`${colors.blue}出力ファイル:${colors.reset} ${outputPath}\n`);

    // 内容をプレビュー
    console.log('='.repeat(60));
    console.log('生成されたロールバックSQL:');
    console.log('='.repeat(60));
    console.log(rollbackSql);

    console.log(`\n${colors.yellow}⚠️  注意: 実行前に必ず内容を確認してください${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}エラー: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
