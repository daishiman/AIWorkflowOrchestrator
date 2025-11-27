#!/usr/bin/env node

/**
 * 遅いクエリ分析スクリプト
 *
 * 用途:
 * - pg_stat_statementsからスロークエリを抽出
 * - クエリパターンの分析
 * - 改善提案の生成
 *
 * 使用方法:
 *   node analyze-slow-queries.mjs --top 10
 *   node analyze-slow-queries.mjs --threshold 100
 *   node analyze-slow-queries.mjs --report
 */

// 設定
const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || '',
  defaultTop: 10,
  defaultThreshold: 100, // ms
};

/**
 * 分析クエリのテンプレート
 */
const QUERIES = {
  // 平均実行時間でソート
  topByAvgTime: (limit) => `
    SELECT
      queryid,
      substring(query, 1, 200) AS query_preview,
      calls,
      round(total_exec_time::numeric, 2) AS total_time_ms,
      round(mean_exec_time::numeric, 2) AS avg_time_ms,
      round(stddev_exec_time::numeric, 2) AS stddev_ms,
      rows,
      round((100.0 * total_exec_time / SUM(total_exec_time) OVER ())::numeric, 2) AS pct_total
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%'
    ORDER BY mean_exec_time DESC
    LIMIT ${limit};
  `,

  // 合計実行時間でソート
  topByTotalTime: (limit) => `
    SELECT
      queryid,
      substring(query, 1, 200) AS query_preview,
      calls,
      round(total_exec_time::numeric, 2) AS total_time_ms,
      round(mean_exec_time::numeric, 2) AS avg_time_ms,
      rows
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%'
    ORDER BY total_exec_time DESC
    LIMIT ${limit};
  `,

  // 閾値以上のクエリ
  aboveThreshold: (threshold) => `
    SELECT
      queryid,
      substring(query, 1, 200) AS query_preview,
      calls,
      round(mean_exec_time::numeric, 2) AS avg_time_ms
    FROM pg_stat_statements
    WHERE mean_exec_time > ${threshold}
      AND query NOT LIKE '%pg_stat%'
    ORDER BY mean_exec_time DESC;
  `,

  // 呼び出し回数でソート
  topByCalls: (limit) => `
    SELECT
      queryid,
      substring(query, 1, 200) AS query_preview,
      calls,
      round(mean_exec_time::numeric, 2) AS avg_time_ms,
      round(total_exec_time::numeric, 2) AS total_time_ms
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%'
    ORDER BY calls DESC
    LIMIT ${limit};
  `,
};

/**
 * クエリパターンを分析
 */
function analyzeQueryPattern(query) {
  const patterns = [];

  // SELECT *の検出
  if (/SELECT\s+\*/i.test(query)) {
    patterns.push({
      issue: 'SELECT * の使用',
      severity: 'warning',
      suggestion: '必要なカラムのみ指定してください',
    });
  }

  // LIKE '%...'の検出
  if (/LIKE\s+'%/i.test(query)) {
    patterns.push({
      issue: 'LIKE \'%...\' パターン',
      severity: 'warning',
      suggestion: '前方一致または全文検索の使用を検討してください',
    });
  }

  // OR条件の検出
  if (/\bOR\b/i.test(query)) {
    patterns.push({
      issue: 'OR条件の使用',
      severity: 'info',
      suggestion: 'UNIONへの書き換えを検討してください',
    });
  }

  // NOT INの検出
  if (/NOT\s+IN/i.test(query)) {
    patterns.push({
      issue: 'NOT IN の使用',
      severity: 'warning',
      suggestion: 'NOT EXISTS または LEFT JOIN + IS NULL を検討してください',
    });
  }

  // ORDER BY + OFFSET の検出
  if (/ORDER\s+BY.*OFFSET/i.test(query)) {
    patterns.push({
      issue: 'OFFSET ページネーション',
      severity: 'warning',
      suggestion: 'キーセットページネーションを検討してください',
    });
  }

  // サブクエリの検出
  if (/\(\s*SELECT/i.test(query)) {
    patterns.push({
      issue: 'サブクエリの使用',
      severity: 'info',
      suggestion: 'JOINへの書き換えを検討してください',
    });
  }

  // COUNT(*)の検出
  if (/COUNT\s*\(\s*\*\s*\)/i.test(query)) {
    patterns.push({
      issue: 'COUNT(*) の使用',
      severity: 'info',
      suggestion: '必要に応じて推定値の使用を検討してください',
    });
  }

  return patterns;
}

/**
 * 分析結果を表示
 */
function displayAnalysis(title, description) {
  console.log('\n' + '='.repeat(60));
  console.log(`📊 ${title}`);
  console.log('='.repeat(60));
  console.log(description);
}

/**
 * クエリ結果をフォーマット
 */
function formatQueryResults(results) {
  if (!results || results.length === 0) {
    return 'データがありません';
  }

  let output = '';
  results.forEach((row, index) => {
    output += `\n[${index + 1}] Query ID: ${row.queryid || 'N/A'}\n`;
    output += `    Query: ${row.query_preview}\n`;
    output += `    Calls: ${row.calls || 0}\n`;
    output += `    Avg Time: ${row.avg_time_ms || 0}ms\n`;
    if (row.total_time_ms) {
      output += `    Total Time: ${row.total_time_ms}ms\n`;
    }
    if (row.pct_total) {
      output += `    % of Total: ${row.pct_total}%\n`;
    }

    // パターン分析
    const patterns = analyzeQueryPattern(row.query_preview);
    if (patterns.length > 0) {
      output += '    Issues:\n';
      patterns.forEach(p => {
        const icon = p.severity === 'warning' ? '⚠️' : 'ℹ️';
        output += `      ${icon} ${p.issue}: ${p.suggestion}\n`;
      });
    }
  });

  return output;
}

/**
 * レポートを生成
 */
function generateReport() {
  console.log('\n📋 スロークエリ分析レポート');
  console.log('生成日時:', new Date().toISOString());
  console.log('\n注意: このスクリプトはデモ用です。');
  console.log('実際の使用にはデータベース接続ライブラリ（pg等）が必要です。\n');

  displayAnalysis(
    '実行に必要なクエリ（コピーして使用）',
    `
-- 1. pg_stat_statements が有効か確認
SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';

-- 2. 平均実行時間が長いクエリ Top 10
${QUERIES.topByAvgTime(10)}

-- 3. 合計実行時間が長いクエリ Top 10
${QUERIES.topByTotalTime(10)}

-- 4. 呼び出し回数が多いクエリ Top 10
${QUERIES.topByCalls(10)}

-- 5. 閾値（100ms）以上のクエリ
${QUERIES.aboveThreshold(100)}
    `
  );

  console.log('\n📝 分析のポイント:');
  console.log('  1. mean_exec_time が高いクエリから優先的に最適化');
  console.log('  2. calls × mean_exec_time（total_exec_time）で影響度を評価');
  console.log('  3. 各クエリに対して EXPLAIN ANALYZE を実行して詳細を確認');
  console.log('  4. インデックス追加やクエリ書き換えを検討');

  console.log('\n📚 参考リソース:');
  console.log('  - EXPLAIN ANALYZE ガイド: resources/explain-analyze-guide.md');
  console.log('  - インデックス戦略: resources/index-strategies.md');
  console.log('  - クエリパターン: resources/query-patterns.md');
}

/**
 * ヘルプを表示
 */
function showHelp() {
  console.log(`
スロークエリ分析スクリプト

使用方法:
  node analyze-slow-queries.mjs [オプション]

オプション:
  --top <n>         上位n件のクエリを分析（デフォルト: 10）
  --threshold <ms>  指定ミリ秒以上のクエリを抽出（デフォルト: 100）
  --report          分析レポートを生成
  --queries         使用可能なクエリテンプレートを表示
  --help            このヘルプを表示

環境変数:
  DATABASE_URL      データベース接続文字列

例:
  node analyze-slow-queries.mjs --report
  node analyze-slow-queries.mjs --top 20
  node analyze-slow-queries.mjs --threshold 500

注意:
  このスクリプトはデモ用です。実際のデータベース接続には
  pgなどのドライバーをインストールして実装を追加してください。
`);
}

/**
 * クエリテンプレートを表示
 */
function showQueries() {
  console.log('\n📋 使用可能なクエリテンプレート\n');

  console.log('=== 平均実行時間でソート ===');
  console.log(QUERIES.topByAvgTime(10));

  console.log('\n=== 合計実行時間でソート ===');
  console.log(QUERIES.topByTotalTime(10));

  console.log('\n=== 呼び出し回数でソート ===');
  console.log(QUERIES.topByCalls(10));

  console.log('\n=== 閾値以上のクエリ ===');
  console.log(QUERIES.aboveThreshold(100));
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--queries')) {
    showQueries();
    process.exit(0);
  }

  if (args.includes('--report')) {
    generateReport();
    process.exit(0);
  }

  // デフォルト動作
  console.log('🔍 スロークエリ分析を開始...\n');

  if (!CONFIG.databaseUrl) {
    console.log('⚠️  DATABASE_URL が設定されていません');
    console.log('   --report オプションでクエリテンプレートを確認できます\n');
  }

  generateReport();
}

main();
