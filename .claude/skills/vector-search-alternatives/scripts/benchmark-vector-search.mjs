#!/usr/bin/env node

/**
 * ベクトル検索ベンチマークスクリプト
 *
 * 用途:
 * - ベクトル検索のパフォーマンス測定
 * - インデックスの効果測定
 * - 精度（Recall）の評価
 *
 * 使用方法:
 *   node benchmark-vector-search.mjs --latency
 *   node benchmark-vector-search.mjs --recall
 *   node benchmark-vector-search.mjs --full
 */

// 設定
const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || '',
  dimensions: 1536,
  testQueries: 100,
  topK: 10,
};

/**
 * ベンチマーク用SQL
 */
const BENCHMARK_QUERIES = {
  // レイテンシ測定用
  latencyTest: `
    EXPLAIN ANALYZE
    SELECT id, content
    FROM documents
    ORDER BY embedding <=> $1::vector
    LIMIT 10;
  `,

  // インデックス情報
  indexInfo: `
    SELECT
      indexname,
      indexdef,
      pg_size_pretty(pg_relation_size(indexrelid)) AS size
    FROM pg_indexes
    JOIN pg_stat_user_indexes USING (indexrelname)
    WHERE tablename = 'documents';
  `,

  // テーブル統計
  tableStats: `
    SELECT
      relname,
      n_live_tup AS row_count,
      pg_size_pretty(pg_total_relation_size(relid)) AS total_size
    FROM pg_stat_user_tables
    WHERE relname = 'documents';
  `,

  // インデックス使用状況
  indexUsage: `
    SELECT
      indexrelname,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch
    FROM pg_stat_user_indexes
    WHERE relname = 'documents';
  `,
};

/**
 * ランダムなベクトルを生成
 */
function generateRandomVector(dimensions) {
  const vector = Array.from({ length: dimensions }, () => Math.random() * 2 - 1);
  // 正規化
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / magnitude);
}

/**
 * レイテンシベンチマーク
 */
function benchmarkLatency() {
  console.log('\n⏱️  Latency Benchmark');
  console.log('====================');

  console.log('\n📋 Test Configuration:');
  console.log(`   Dimensions: ${CONFIG.dimensions}`);
  console.log(`   Queries: ${CONFIG.testQueries}`);
  console.log(`   Top K: ${CONFIG.topK}`);

  console.log('\n📊 Expected Results (based on typical performance):');
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │ Index Type    │ Latency (ms)  │ Note                        │
  ├─────────────────────────────────────────────────────────────┤
  │ No Index      │ 1000-5000     │ Full table scan             │
  │ IVFFlat       │ 10-100        │ Depends on probes           │
  │ HNSW          │ 1-20          │ Depends on ef_search        │
  └─────────────────────────────────────────────────────────────┘
  `);

  console.log('\n📝 SQL to run benchmark:');
  console.log(BENCHMARK_QUERIES.latencyTest);

  console.log('\n💡 Tips:');
  console.log('   - Run multiple times to warm up cache');
  console.log('   - Compare with and without index');
  console.log('   - Adjust ef_search/probes for speed vs accuracy');
}

/**
 * Recall（精度）ベンチマーク
 */
function benchmarkRecall() {
  console.log('\n🎯 Recall Benchmark');
  console.log('===================');

  console.log('\n📋 What is Recall@K:');
  console.log('   The percentage of true nearest neighbors found in top K results');
  console.log('   Recall@10 = 95% means 9.5 out of 10 true neighbors are found');

  console.log('\n📊 Typical Recall Values:');
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │ Index Type    │ Recall@10     │ Configuration               │
  ├─────────────────────────────────────────────────────────────┤
  │ No Index      │ 100%          │ Exact search (ground truth) │
  │ IVFFlat       │ 85-95%        │ probes=10-50                │
  │ HNSW          │ 95-99%        │ ef_search=100-400           │
  └─────────────────────────────────────────────────────────────┘
  `);

  console.log('\n📝 How to measure Recall:');
  console.log(`
  1. Run exact search (no index) to get ground truth:
     SELECT id FROM documents
     ORDER BY embedding <=> query_vector
     LIMIT 10;

  2. Run approximate search (with index):
     SET hnsw.ef_search = 100;
     SELECT id FROM documents
     ORDER BY embedding <=> query_vector
     LIMIT 10;

  3. Calculate: Recall = (matching IDs) / 10 * 100%
  `);
}

/**
 * インデックス情報の表示
 */
function showIndexInfo() {
  console.log('\n📊 Index Information');
  console.log('====================');

  console.log('\n📝 Query to check indexes:');
  console.log(BENCHMARK_QUERIES.indexInfo);

  console.log('\n📝 Query to check table stats:');
  console.log(BENCHMARK_QUERIES.tableStats);

  console.log('\n📝 Query to check index usage:');
  console.log(BENCHMARK_QUERIES.indexUsage);
}

/**
 * 推奨設定
 */
function showRecommendations() {
  console.log('\n💡 Recommendations');
  console.log('==================');

  console.log('\n📊 Index Selection:');
  console.log(`
  Data Size        │ Recommended Index │ Parameters
  ─────────────────┼───────────────────┼─────────────────────
  < 10K rows       │ No index          │ -
  10K - 100K rows  │ IVFFlat           │ lists = sqrt(rows)
  100K - 1M rows   │ HNSW              │ m=16, ef_construction=64
  > 1M rows        │ HNSW + Partition  │ m=32, ef_construction=128
  `);

  console.log('\n📊 Search Parameter Tuning:');
  console.log(`
  Use Case         │ ef_search/probes │ Latency vs Recall
  ─────────────────┼──────────────────┼───────────────────
  Real-time search │ 40-100           │ Fast, 90-95% recall
  Batch processing │ 200-400          │ Slow, 98-99% recall
  Interactive UI   │ 100-200          │ Balanced
  `);
}

/**
 * 完全なベンチマーク
 */
function fullBenchmark() {
  console.log('\n🔬 Full Benchmark Report');
  console.log('========================');
  console.log(`Generated at: ${new Date().toISOString()}`);
  console.log(`Database: ${CONFIG.databaseUrl ? '(configured)' : '(not configured)'}`);

  benchmarkLatency();
  benchmarkRecall();
  showIndexInfo();
  showRecommendations();
}

/**
 * ヘルプを表示
 */
function showHelp() {
  console.log(`
ベクトル検索ベンチマークスクリプト

使用方法:
  node benchmark-vector-search.mjs [オプション]

オプション:
  --latency     レイテンシベンチマーク情報を表示
  --recall      Recall（精度）ベンチマーク情報を表示
  --indexes     インデックス情報クエリを表示
  --recommend   推奨設定を表示
  --full        すべての情報を表示
  --help        このヘルプを表示

環境変数:
  DATABASE_URL  データベース接続文字列

例:
  node benchmark-vector-search.mjs --full
  node benchmark-vector-search.mjs --latency --recall

注意:
  このスクリプトはベンチマーク用のSQLクエリと
  推奨設定を表示します。
  実際のベンチマークにはデータベース接続が必要です。
`);
}

// メイン処理
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  console.log('📊 Vector Search Benchmark Tool');
  console.log(`Dimensions: ${CONFIG.dimensions}`);

  if (args.includes('--full')) {
    fullBenchmark();
    process.exit(0);
  }

  if (args.includes('--latency')) {
    benchmarkLatency();
  }

  if (args.includes('--recall')) {
    benchmarkRecall();
  }

  if (args.includes('--indexes')) {
    showIndexInfo();
  }

  if (args.includes('--recommend')) {
    showRecommendations();
  }

  console.log('\n✅ Benchmark information generated');
}

main();
