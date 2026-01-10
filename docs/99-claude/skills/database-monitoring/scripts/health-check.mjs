#!/usr/bin/env node
/**
 * データベース健全性チェックスクリプト
 *
 * 使用方法:
 *   node health-check.mjs
 *
 * 環境変数:
 *   DATABASE_URL: libSQL/Turso接続文字列
 *
 * 出力:
 *   - 接続プール統計
 *   - キャッシュ使用率
 *   - スロークエリ数
 *   - データベースサイズ
 *   - WAL統計
 */

import { createClient } from "@libsql/client";

const THRESHOLDS = {
  connectionWarning: 0.8,
  connectionCritical: 0.95,
  cacheHitWarning: 0.95,
  cacheHitCritical: 0.9,
  walPagesWarning: 1000,
  walPagesCritical: 5000,
  slowQueryThresholdSec: 5,
};

async function runHealthCheck() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log("🔍 データベース健全性チェック開始\n");

    const results = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: [],
    };

    // 1. 接続プールチェック
    const connectionCheck = await checkConnectionPool(client);
    results.checks.push(connectionCheck);

    // 2. キャッシュ使用率チェック
    const cacheCheck = await checkCacheUsage(client);
    results.checks.push(cacheCheck);

    // 3. スロークエリチェック
    const slowQueryCheck = await checkSlowQueries(client);
    results.checks.push(slowQueryCheck);

    // 4. データベースサイズチェック
    const sizeCheck = await checkDatabaseSize(client);
    results.checks.push(sizeCheck);

    // 5. WAL統計チェック
    const walCheck = await checkWALStats(client);
    results.checks.push(walCheck);

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
    client.close();
  }
}

async function checkConnectionPool(client) {
  // Note: libSQLではアプリケーションレベルで接続プールを管理
  // ここでは仮のメトリクスチェックを示す
  const result = await client.execute(`
    SELECT
      COUNT(*) AS connection_count
    FROM connection_metrics
    WHERE timestamp >= datetime('now', '-1 minute')
  `);

  // デフォルト最大接続数（環境に応じて調整）
  const maxConnections = parseInt(process.env.MAX_CONNECTIONS || "100");
  const currentConnections = result.rows[0]?.connection_count || 0;
  const ratio = currentConnections / maxConnections;

  let status = "healthy";
  if (ratio >= THRESHOLDS.connectionCritical) {
    status = "critical";
  } else if (ratio >= THRESHOLDS.connectionWarning) {
    status = "warning";
  }

  return {
    name: "接続プール",
    status,
    details: {
      currentConnections,
      maxConnections,
      usagePercent: (ratio * 100).toFixed(1),
      note: "アプリケーションレベルで追跡",
    },
  };
}

async function checkCacheUsage(client) {
  // PRAGMA cache_sizeを取得
  const cacheResult = await client.execute("PRAGMA cache_size");
  const cacheSize = cacheResult.rows[0]?.cache_size || 0;

  // アプリケーションメトリクスからキャッシュヒット率を取得
  const metricsResult = await client.execute(`
    SELECT
      ROUND(100.0 * cache_hits / NULLIF(cache_hits + cache_misses, 0), 2) AS cache_hit_pct
    FROM cache_metrics
    WHERE timestamp >= datetime('now', '-5 minutes')
    LIMIT 1
  `);

  const cacheHitPct = parseFloat(metricsResult.rows[0]?.cache_hit_pct) || 100;
  const ratio = cacheHitPct / 100;

  let status = "healthy";
  if (ratio < THRESHOLDS.cacheHitCritical) {
    status = "critical";
  } else if (ratio < THRESHOLDS.cacheHitWarning) {
    status = "warning";
  }

  return {
    name: "キャッシュ使用率",
    status,
    details: {
      cacheSize,
      cacheHitPercent: cacheHitPct,
      target: "99%以上推奨",
    },
  };
}

async function checkSlowQueries(client) {
  // アプリケーションメトリクスから追跡
  const result = await client.execute(`
    SELECT COUNT(*) AS count
    FROM query_metrics
    WHERE execution_time_ms > ${THRESHOLDS.slowQueryThresholdSec * 1000}
      AND timestamp >= datetime('now', '-5 minutes')
  `);

  const count = parseInt(result.rows[0]?.count || 0);

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
      note: "アプリケーションレベルで追跡",
    },
  };
}

async function checkDatabaseSize(client) {
  // PRAGMA page_countとpage_sizeからサイズを計算
  const pageCountResult = await client.execute("PRAGMA page_count");
  const pageSizeResult = await client.execute("PRAGMA page_size");

  const pageCount = pageCountResult.rows[0]?.page_count || 0;
  const pageSize = pageSizeResult.rows[0]?.page_size || 0;
  const sizeBytes = pageCount * pageSize;
  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

  return {
    name: "データベースサイズ",
    status: "healthy",
    details: {
      databaseSize: `${sizeMB} MB`,
      databaseSizeBytes: sizeBytes,
      pageCount,
      pageSize,
    },
  };
}

async function checkWALStats(client) {
  // PRAGMA wal_checkpointでWAL統計を取得
  const walResult = await client.execute("PRAGMA wal_checkpoint(PASSIVE)");

  // アプリケーションメトリクスからWAL統計を取得
  const metricsResult = await client.execute(`
    SELECT
      wal_pages,
      wal_size_bytes
    FROM wal_metrics
    WHERE timestamp >= datetime('now', '-1 minute')
    ORDER BY timestamp DESC
    LIMIT 1
  `);

  const walPages = metricsResult.rows[0]?.wal_pages || 0;
  const walSizeBytes = metricsResult.rows[0]?.wal_size_bytes || 0;

  let status = "healthy";
  if (walPages > THRESHOLDS.walPagesCritical) {
    status = "critical";
  } else if (walPages > THRESHOLDS.walPagesWarning) {
    status = "warning";
  }

  return {
    name: "WAL統計",
    status,
    details: {
      walPages,
      walSizeBytes,
      walSizeMB: (walSizeBytes / 1024 / 1024).toFixed(2),
      note: "定期的なチェックポイントを推奨",
    },
  };
}

function printResults(results) {
  const statusEmoji = {
    healthy: "✅",
    warning: "⚠️",
    critical: "🚨",
  };

  console.log(
    `全体ステータス: ${statusEmoji[results.status]} ${results.status.toUpperCase()}\n`,
  );
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
