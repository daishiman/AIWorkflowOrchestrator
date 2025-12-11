#!/usr/bin/env node
/**
 * N+1問題検出スクリプト
 *
 * クエリログを分析してN+1問題の可能性があるパターンを検出します。
 *
 * 使用方法:
 *   node detect-n-plus-one.mjs <query-log-file>
 *   node detect-n-plus-one.mjs --stdin < query.log
 *
 * 入力形式:
 *   各行がSQLクエリまたはクエリログ
 *
 * 検出パターン:
 *   - 同一テーブルへの連続SELECT
 *   - WHERE id = ? 形式の連続クエリ
 *   - SELECT COUNT が N 回以上連続
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// 設定
const CONFIG = {
  // N+1と判定するしきい値
  threshold: 3,
  // 同一パターンの時間間隔（ミリ秒）
  timeWindow: 1000,
};

// 結果の定数
const WARN = "⚠️";
const INFO = "ℹ️";
const ERROR = "❌";
const OK = "✅";

/**
 * クエリログを解析
 */
function parseQueryLog(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  const queries = [];

  for (const line of lines) {
    // 基本的なSELECT文を抽出
    const selectMatch = line.match(/SELECT\s+.*?\s+FROM\s+(\w+)/i);
    if (selectMatch) {
      const tableName = selectMatch[1].toLowerCase();
      const hasWhereId = /WHERE\s+\w*id\s*=\s*[?$\d'"]/i.test(line);
      const hasWhereIn = /WHERE\s+\w*id\s+IN\s*\(/i.test(line);

      queries.push({
        original: line.substring(0, 100) + (line.length > 100 ? "..." : ""),
        table: tableName,
        hasWhereId,
        hasWhereIn,
        type: "SELECT",
      });
    }
  }

  return queries;
}

/**
 * N+1パターンを検出
 */
function detectNPlusOnePatterns(queries) {
  const patterns = [];

  // 連続する同一テーブルへのSELECTを検出
  let currentTable = null;
  let currentCount = 0;
  let startIndex = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    if (query.table === currentTable && query.hasWhereId) {
      currentCount++;
    } else {
      // パターン終了、しきい値以上なら記録
      if (currentCount >= CONFIG.threshold) {
        patterns.push({
          type: "SEQUENTIAL_ID_QUERIES",
          table: currentTable,
          count: currentCount,
          startIndex,
          endIndex: i - 1,
          sample: queries[startIndex].original,
        });
      }

      // リセット
      currentTable = query.table;
      currentCount = query.hasWhereId ? 1 : 0;
      startIndex = i;
    }
  }

  // 最後のパターンをチェック
  if (currentCount >= CONFIG.threshold) {
    patterns.push({
      type: "SEQUENTIAL_ID_QUERIES",
      table: currentTable,
      count: currentCount,
      startIndex,
      endIndex: queries.length - 1,
      sample: queries[startIndex].original,
    });
  }

  // テーブル別のクエリ数を集計
  const tableQueryCounts = {};
  for (const query of queries) {
    if (query.hasWhereId) {
      tableQueryCounts[query.table] = (tableQueryCounts[query.table] || 0) + 1;
    }
  }

  // 高頻度テーブルを検出
  for (const [table, count] of Object.entries(tableQueryCounts)) {
    if (count >= CONFIG.threshold * 2) {
      // 既に検出済みでなければ追加
      const alreadyDetected = patterns.some(
        (p) => p.table === table && p.type === "HIGH_FREQUENCY_TABLE",
      );
      if (!alreadyDetected) {
        patterns.push({
          type: "HIGH_FREQUENCY_TABLE",
          table,
          count,
          suggestion: `IN句を使用したバッチフェッチを検討してください`,
        });
      }
    }
  }

  return patterns;
}

/**
 * レポートを生成
 */
function generateReport(queries, patterns) {
  console.log("\n📊 N+1問題検出レポート");
  console.log("=".repeat(60));

  console.log(`\n${INFO} 分析対象: ${queries.length} クエリ`);
  console.log(`${INFO} 検出しきい値: ${CONFIG.threshold} 回以上の連続クエリ\n`);

  if (patterns.length === 0) {
    console.log(`${OK} N+1問題のパターンは検出されませんでした。\n`);
    return;
  }

  console.log(`${WARN} ${patterns.length} 件の潜在的なN+1パターンを検出\n`);
  console.log("-".repeat(60));

  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    console.log(`\n【パターン ${i + 1}】`);
    console.log(`テーブル: ${pattern.table}`);
    console.log(`種類: ${pattern.type}`);
    console.log(`クエリ数: ${pattern.count}`);

    if (pattern.sample) {
      console.log(`サンプル: ${pattern.sample}`);
    }

    console.log(`\n推奨対応:`);
    switch (pattern.type) {
      case "SEQUENTIAL_ID_QUERIES":
        console.log(`  1. IN句を使用したバッチフェッチに変更`);
        console.log(`     例: WHERE id IN (?, ?, ...)`);
        console.log(`  2. または JOINを使用して1クエリで取得`);
        break;
      case "HIGH_FREQUENCY_TABLE":
        console.log(`  1. DataLoaderパターンの導入を検討`);
        console.log(`  2. キャッシュの導入を検討`);
        break;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n${ERROR} N+1問題の疑いがあります。修正を検討してください。\n`);
}

/**
 * メイン処理
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("使用方法: node detect-n-plus-one.mjs <query-log-file>");
    console.log("例: node detect-n-plus-one.mjs query.log");
    process.exit(1);
  }

  let content;

  if (args[0] === "--stdin") {
    // 標準入力から読み取り
    content = readFileSync(0, "utf-8");
  } else {
    const filePath = resolve(args[0]);
    try {
      content = readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`エラー: ファイルを読み取れません: ${filePath}`);
      process.exit(1);
    }
  }

  const queries = parseQueryLog(content);

  if (queries.length === 0) {
    console.log("警告: クエリが検出されませんでした。");
    console.log("入力形式を確認してください（SELECT文を含む行が必要です）。");
    process.exit(0);
  }

  const patterns = detectNPlusOnePatterns(queries);
  generateReport(queries, patterns);

  // N+1が検出された場合は終了コード1
  process.exit(patterns.length > 0 ? 1 : 0);
}

main();
