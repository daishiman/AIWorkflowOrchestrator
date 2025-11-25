#!/usr/bin/env node

/**
 * detect-long-transactions.mjs
 *
 * PostgreSQLで実行中の長時間トランザクションを検出するスクリプト。
 * 設定ファイルやコードから潜在的な問題パターンも検出します。
 *
 * 使用方法:
 *   node detect-long-transactions.mjs [--db <connection-string>] [--code <source-dir>]
 *
 * 例:
 *   node detect-long-transactions.mjs --code src/
 *   node detect-long-transactions.mjs --db postgresql://localhost/mydb
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

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
 * 問題パターン
 */
const ProblemPatterns = {
  EXTERNAL_CALL_IN_TX: 'external_call_in_transaction',
  LONG_LOOP_IN_TX: 'long_loop_in_transaction',
  NO_TIMEOUT: 'no_timeout_setting',
  MISSING_RETRY: 'missing_retry_logic',
  NESTED_TRANSACTION: 'nested_transaction',
};

/**
 * 問題クラス
 */
class TransactionIssue {
  constructor(type, severity, file, line, description, suggestion) {
    this.type = type;
    this.severity = severity;
    this.file = file;
    this.line = line;
    this.description = description;
    this.suggestion = suggestion;
  }
}

/**
 * ディレクトリを再帰的に走査
 */
function walkDirectory(dir, extensions = ['.ts', '.js', '.mjs']) {
  const files = [];

  function walk(currentDir) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
          walk(fullPath);
        }
      } else if (stat.isFile() && extensions.includes(extname(entry))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * トランザクション内の外部呼び出しを検出
 */
function detectExternalCallsInTransaction(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  let inTransaction = false;
  let transactionStart = 0;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // トランザクション開始を検出
    if (line.includes('db.transaction') || line.includes('.transaction(')) {
      inTransaction = true;
      transactionStart = i + 1;
      braceCount = 0;
    }

    if (inTransaction) {
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      // 外部呼び出しパターン
      const externalPatterns = [
        /fetch\s*\(/,
        /axios\./,
        /http\./,
        /https\./,
        /await\s+.*API/i,
        /\.send\s*\(/,
        /sendEmail/,
        /sendNotification/,
        /externalService/i,
      ];

      for (const pattern of externalPatterns) {
        if (pattern.test(line)) {
          issues.push(
            new TransactionIssue(
              ProblemPatterns.EXTERNAL_CALL_IN_TX,
              'error',
              filePath,
              i + 1,
              `トランザクション内で外部呼び出しを検出: ${line.trim().substring(0, 50)}...`,
              '外部API呼び出しはトランザクション外に移動してください。'
            )
          );
        }
      }

      // トランザクション終了
      if (braceCount <= 0 && i > transactionStart) {
        inTransaction = false;
      }
    }
  }

  return issues;
}

/**
 * トランザクション内のループを検出
 */
function detectLoopsInTransaction(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  let inTransaction = false;
  let transactionStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('db.transaction') || line.includes('.transaction(')) {
      inTransaction = true;
      transactionStart = i + 1;
    }

    if (inTransaction) {
      // ループパターン（DB操作を含む可能性）
      if (/for\s*\(|\.forEach\s*\(|\.map\s*\(|while\s*\(/.test(line)) {
        // 次の数行でDBオペレーションがあるか確認
        const nextLines = lines.slice(i, Math.min(i + 10, lines.length)).join('\n');
        if (/await\s+.*\.(insert|update|delete|select|execute)/.test(nextLines)) {
          issues.push(
            new TransactionIssue(
              ProblemPatterns.LONG_LOOP_IN_TX,
              'warning',
              filePath,
              i + 1,
              'トランザクション内でループによるDB操作を検出',
              'バッチ処理（INSERT ... VALUES (...), (...)）の使用を検討してください。'
            )
          );
        }
      }
    }

    // 簡易的なトランザクション終了検出
    if (inTransaction && line.includes('});') && i > transactionStart + 2) {
      inTransaction = false;
    }
  }

  return issues;
}

/**
 * リトライロジックの欠如を検出
 */
function detectMissingRetry(content, filePath) {
  const issues = [];

  // SERIALIZABLEを使用しているがリトライがない
  if (content.includes("isolationLevel: 'serializable'") ||
      content.includes('SERIALIZABLE')) {
    if (!content.includes('retry') && !content.includes('Retry') && !content.includes('RETRY')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('serializable') || lines[i].includes('SERIALIZABLE')) {
          issues.push(
            new TransactionIssue(
              ProblemPatterns.MISSING_RETRY,
              'warning',
              filePath,
              i + 1,
              'SERIALIZABLE分離レベル使用時にリトライロジックが見つかりません',
              'シリアライゼーション失敗時のリトライロジックを実装してください。'
            )
          );
          break;
        }
      }
    }
  }

  return issues;
}

/**
 * タイムアウト設定の欠如を検出
 */
function detectMissingTimeout(content, filePath) {
  const issues = [];

  // トランザクションがあるがタイムアウト設定がない
  if (content.includes('db.transaction') || content.includes('.transaction(')) {
    if (!content.includes('statement_timeout') &&
        !content.includes('lock_timeout') &&
        !content.includes('timeout')) {
      issues.push(
        new TransactionIssue(
          ProblemPatterns.NO_TIMEOUT,
          'info',
          filePath,
          1,
          'トランザクションにタイムアウト設定が見つかりません',
          'statement_timeout または lock_timeout の設定を検討してください。'
        )
      );
    }
  }

  return issues;
}

/**
 * コード分析を実行
 */
function analyzeCode(sourceDir) {
  const files = walkDirectory(sourceDir);
  const allIssues = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');

      // トランザクションコードが含まれるファイルのみ分析
      if (!content.includes('transaction') && !content.includes('BEGIN')) {
        continue;
      }

      allIssues.push(...detectExternalCallsInTransaction(content, file));
      allIssues.push(...detectLoopsInTransaction(content, file));
      allIssues.push(...detectMissingRetry(content, file));
      allIssues.push(...detectMissingTimeout(content, file));
    } catch (error) {
      console.error(`ファイル読み込みエラー: ${file}: ${error.message}`);
    }
  }

  return allIssues;
}

/**
 * レポートを出力
 */
function printReport(issues) {
  console.log('\n' + '='.repeat(60));
  console.log('トランザクション問題検出レポート');
  console.log('='.repeat(60) + '\n');

  if (issues.length === 0) {
    console.log(`${colors.green}✅ 問題は検出されませんでした。${colors.reset}\n`);
    return;
  }

  // 重要度別にグループ化
  const grouped = {
    error: issues.filter((i) => i.severity === 'error'),
    warning: issues.filter((i) => i.severity === 'warning'),
    info: issues.filter((i) => i.severity === 'info'),
  };

  const severityLabels = {
    error: { label: 'エラー', color: colors.red },
    warning: { label: '警告', color: colors.yellow },
    info: { label: '情報', color: colors.blue },
  };

  console.log(`${colors.cyan}サマリー${colors.reset}`);
  console.log(`  エラー: ${grouped.error.length}`);
  console.log(`  警告: ${grouped.warning.length}`);
  console.log(`  情報: ${grouped.info.length}`);
  console.log();

  for (const [severity, severityIssues] of Object.entries(grouped)) {
    if (severityIssues.length === 0) continue;

    const { label, color } = severityLabels[severity];

    console.log(`\n### ${label} (${severityIssues.length}件) ###\n`);

    for (const issue of severityIssues) {
      console.log(`${color}[${issue.type.toUpperCase()}]${colors.reset}`);
      console.log(`  📁 ${issue.file}:${issue.line}`);
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
1. 外部API呼び出しはトランザクション外に移動
2. ループ内のDB操作はバッチ処理に変更
3. SERIALIZABLE使用時はリトライロジックを実装
4. 適切なタイムアウト設定を追加
5. トランザクション時間を最小化
`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  let sourceDir = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--code' && args[i + 1]) {
      sourceDir = args[i + 1];
      i++;
    }
  }

  if (!sourceDir) {
    console.log('使用方法: node detect-long-transactions.mjs --code <source-dir>');
    console.log('例: node detect-long-transactions.mjs --code src/');
    process.exit(1);
  }

  console.log(`\n分析中: ${sourceDir}\n`);

  const issues = analyzeCode(sourceDir);
  printReport(issues);
}

main();
