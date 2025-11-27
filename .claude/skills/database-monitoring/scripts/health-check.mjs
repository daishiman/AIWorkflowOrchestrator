#!/usr/bin/env node
/**
 * データベース健全性チェックスクリプト
 *
 * 使用方法:
 *   node health-check.mjs
 *
 * 環境変数:
 *   DATABASE_URL: PostgreSQL接続文字列
 *
 * 出力:
 *   - 接続数統計
 *   - キャッシュヒット率
 *   - スロークエリ数
 *   - ディスク使用量
 *   - デッド行比率
 */

import pg from "pg";
const { Client } = pg;

const THRESHOLDS = {
  connectionWarning: 0.8,
  connectionCritical: 0.95,
  cacheHitWarning: 0.95,
  cacheHitCritical: 0.9,
  deadTuplesWarning: 0.1,
  deadTuplesCritical: 0.3,
  slowQueryThresholdSec: 5,
};

async function runHealthCheck() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("🔍 データベース健全性チェック開始\n");

    const results = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: [],
    };

    // 1. 接続数チェック
    const connectionCheck = await checkConnections(client);
    results.checks.push(connectionCheck);

    // 2. キャッシュヒット率チェック
    const cacheCheck = await checkCacheHitRatio(client);
    results.checks.push(cacheCheck);

    // 3. スロークエリチェック
    const slowQueryCheck = await checkSlowQueries(client);
    results.checks.push(slowQueryCheck);

    // 4. ディスク使用量チェック
    const diskCheck = await checkDiskUsage(client);
    results.checks.push(diskCheck);

    // 5. デッド行チェック
    const deadTuplesCheck = await checkDeadTuples(client);
    results.checks.push(deadTuplesCheck);

    // 全体ステータス判定
    if (results.checks.some((c) => c.status === "critical")) {
      results.status = "critical";
    } else if (results.checks.some((c) => c.status === "warning")) {
      results.status = "warning";
    }

    // 結果出力
    printResults(results);

    return results;
  } finally {
    await client.end();
  }
}

async function checkConnections(client) {
  const result = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE state = 'active') AS active,
      COUNT(*) FILTER (WHERE state = 'idle') AS idle,
      COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_tx,
      COUNT(*) AS total,
      (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_conn
    FROM pg_stat_activity
  `);

  const row = result.rows[0];
  const ratio = row.total / row.max_conn;

  let status = "healthy";
  if (ratio >= THRESHOLDS.connectionCritical) {
    status = "critical";
  } else if (ratio >= THRESHOLDS.connectionWarning) {
    status = "warning";
  }

  return {
    name: "接続数",
    status,
    details: {
      active: parseInt(row.active),
      idle: parseInt(row.idle),
      idleInTransaction: parseInt(row.idle_in_tx),
      total: parseInt(row.total),
      maxConnections: parseInt(row.max_conn),
      usagePercent: (ratio * 100).toFixed(1),
    },
  };
}

async function checkCacheHitRatio(client) {
  const result = await client.query(`
    SELECT
      ROUND(100.0 * SUM(heap_blks_hit) /
        NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2) AS cache_hit_pct
    FROM pg_statio_user_tables
  `);

  const cacheHitPct = parseFloat(result.rows[0].cache_hit_pct) || 100;
  const ratio = cacheHitPct / 100;

  let status = "healthy";
  if (ratio < THRESHOLDS.cacheHitCritical) {
    status = "critical";
  } else if (ratio < THRESHOLDS.cacheHitWarning) {
    status = "warning";
  }

  return {
    name: "キャッシュヒット率",
    status,
    details: {
      cacheHitPercent: cacheHitPct,
      target: "99%以上推奨",
    },
  };
}

async function checkSlowQueries(client) {
  const result = await client.query(
    `
    SELECT COUNT(*) AS count
    FROM pg_stat_activity
    WHERE state = 'active'
      AND query_start < NOW() - INTERVAL '${THRESHOLDS.slowQueryThresholdSec} seconds'
      AND query NOT LIKE '%pg_stat_activity%'
  `
  );

  const count = parseInt(result.rows[0].count);

  let status = "healthy";
  if (count > 5) {
    status = "critical";
  } else if (count > 0) {
    status = "warning";
  }

  return {
    name: "スロークエリ",
    status,
    details: {
      currentSlowQueries: count,
      thresholdSeconds: THRESHOLDS.slowQueryThresholdSec,
    },
  };
}

async function checkDiskUsage(client) {
  const result = await client.query(`
    SELECT
      pg_size_pretty(pg_database_size(current_database())) AS db_size,
      pg_database_size(current_database()) AS db_size_bytes
  `);

  const row = result.rows[0];

  return {
    name: "ディスク使用量",
    status: "healthy", // 閾値判定にはシステム全体の情報が必要
    details: {
      databaseSize: row.db_size,
      databaseSizeBytes: parseInt(row.db_size_bytes),
    },
  };
}

async function checkDeadTuples(client) {
  const result = await client.query(`
    SELECT
      relname,
      n_dead_tup,
      n_live_tup,
      CASE
        WHEN n_live_tup + n_dead_tup > 0
        THEN round(100.0 * n_dead_tup / (n_live_tup + n_dead_tup), 2)
        ELSE 0
      END AS dead_pct
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 1000
    ORDER BY n_dead_tup DESC
    LIMIT 5
  `);

  const tablesWithHighDeadTuples = result.rows.filter(
    (r) => r.dead_pct > THRESHOLDS.deadTuplesWarning * 100
  );

  let status = "healthy";
  if (
    tablesWithHighDeadTuples.some(
      (t) => t.dead_pct > THRESHOLDS.deadTuplesCritical * 100
    )
  ) {
    status = "critical";
  } else if (tablesWithHighDeadTuples.length > 0) {
    status = "warning";
  }

  return {
    name: "デッド行",
    status,
    details: {
      tablesNeedingVacuum: result.rows.map((r) => ({
        table: r.relname,
        deadTuples: parseInt(r.n_dead_tup),
        deadPercent: parseFloat(r.dead_pct),
      })),
    },
  };
}

function printResults(results) {
  const statusEmoji = {
    healthy: "✅",
    warning: "⚠️",
    critical: "🚨",
  };

  console.log(`全体ステータス: ${statusEmoji[results.status]} ${results.status.toUpperCase()}\n`);
  console.log("─".repeat(50));

  for (const check of results.checks) {
    console.log(`\n${statusEmoji[check.status]} ${check.name}`);
    console.log(`   ステータス: ${check.status}`);

    for (const [key, value] of Object.entries(check.details)) {
      if (Array.isArray(value)) {
        console.log(`   ${key}:`);
        value.forEach((item) => {
          console.log(`     - ${JSON.stringify(item)}`);
        });
      } else {
        console.log(`   ${key}: ${value}`);
      }
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`チェック完了: ${results.timestamp}`);
}

// 実行
runHealthCheck().catch((err) => {
  console.error("❌ 健全性チェック失敗:", err.message);
  process.exit(1);
});
