#!/usr/bin/env node
/**
 * 接続数統計収集スクリプト
 *
 * 使用方法:
 *   node connection-stats.mjs [--interval <秒>] [--count <回数>]
 *
 * オプション:
 *   --interval: 収集間隔（秒）、デフォルト: 5
 *   --count: 収集回数、デフォルト: 無限（Ctrl+Cで停止）
 *
 * 環境変数:
 *   DATABASE_URL: libSQL/Turso接続文字列
 *   DATABASE_AUTH_TOKEN: Turso認証トークン（必要な場合）
 */

import { createClient } from "@libsql/client";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    interval: 5,
    count: Infinity,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--interval" && args[i + 1]) {
      options.interval = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--count" && args[i + 1]) {
      options.count = parseInt(args[i + 1]);
      i++;
    }
  }

  return options;
}

async function collectConnectionStats(client) {
  // アプリケーションレベルで追跡された接続メトリクス
  const result = await client.execute(`
    SELECT
      state,
      app_name,
      COUNT(*) AS count,
      MAX((julianday('now') - julianday(connected_at)) * 86400) AS max_connection_age_sec,
      MAX((julianday('now') - julianday(query_start)) * 86400) AS max_query_duration_sec
    FROM connection_metrics
    WHERE timestamp >= datetime('now', '-1 minute')
    GROUP BY state, app_name
    ORDER BY count DESC
  `);

  const summary = await client.execute(`
    SELECT
      COUNT(*) FILTER (WHERE state = 'active') AS active,
      COUNT(*) FILTER (WHERE state = 'idle') AS idle,
      COUNT(*) FILTER (WHERE state = 'in_transaction') AS idle_in_tx,
      COUNT(*) FILTER (WHERE state = 'error') AS idle_in_tx_aborted,
      COUNT(*) AS total,
      ${parseInt(process.env.MAX_CONNECTIONS || "100")} AS max_conn
    FROM connection_metrics
    WHERE timestamp >= datetime('now', '-1 minute')
  `);

  return {
    timestamp: new Date().toISOString(),
    summary: summary.rows[0] || {
      active: 0,
      idle: 0,
      idle_in_tx: 0,
      idle_in_tx_aborted: 0,
      total: 0,
      max_conn: parseInt(process.env.MAX_CONNECTIONS || "100"),
    },
    byStateUserApp: result.rows,
  };
}

async function collectWaitingConnections(client) {
  // アプリケーションレベルで追跡されたロック待機情報
  const result = await client.execute(`
    SELECT
      query_id AS blocked_pid,
      user_name AS blocked_user,
      substr(query_text, 1, 50) AS blocked_query,
      blocking_query_id AS blocking_pid,
      blocking_user AS blocking_user,
      (julianday('now') - julianday(wait_start)) * 86400 AS wait_duration_sec
    FROM lock_wait_metrics
    WHERE status = 'waiting'
      AND timestamp >= datetime('now', '-5 minutes')
    ORDER BY wait_duration_sec DESC
    LIMIT 10
  `);

  return result.rows;
}

function printStats(stats, waitingConnections) {
  const s = stats.summary;
  const usagePct = ((s.total / s.max_conn) * 100).toFixed(1);

  console.clear();
  console.log("═".repeat(60));
  console.log(" SQLite/Turso 接続統計モニター");
  console.log("═".repeat(60));
  console.log(`\n時刻: ${stats.timestamp}\n`);

  // サマリー
  console.log("【接続サマリー】");
  console.log(`  アクティブ:              ${s.active}`);
  console.log(`  アイドル:                ${s.idle}`);
  console.log(`  トランザクション内アイドル: ${s.idle_in_tx}`);
  console.log(`  中断トランザクション:     ${s.idle_in_tx_aborted}`);
  console.log(`  ─────────────────────────`);
  console.log(
    `  合計:                    ${s.total} / ${s.max_conn} (${usagePct}%)`,
  );

  // 使用率バー
  const barWidth = 40;
  const filledWidth = Math.round((s.total / s.max_conn) * barWidth);
  const bar = "█".repeat(filledWidth) + "░".repeat(barWidth - filledWidth);
  console.log(`\n  [${bar}]`);

  // ステータスインジケータ
  let statusEmoji = "✅";
  if (usagePct >= 95) {
    statusEmoji = "🚨 CRITICAL";
  } else if (usagePct >= 80) {
    statusEmoji = "⚠️ WARNING";
  }
  console.log(`  ステータス: ${statusEmoji}`);

  // アプリケーション別
  console.log("\n【アプリケーション別接続数】");
  const byApp = {};
  for (const row of stats.byStateUserApp) {
    const app = row.app_name || "(unknown)";
    byApp[app] = (byApp[app] || 0) + parseInt(row.count || 0);
  }
  Object.entries(byApp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([app, count]) => {
      console.log(`  ${app}: ${count}`);
    });

  // 待機中の接続
  if (waitingConnections.length > 0) {
    console.log("\n【⚠️ ロック待機中の接続】");
    waitingConnections.forEach((wc) => {
      console.log(
        `  PID ${wc.blocked_pid} (${wc.blocked_user}) → ` +
          `待機 ${wc.wait_duration_sec?.toFixed(1)}秒 ← ` +
          `PID ${wc.blocking_pid} (${wc.blocking_user})`,
      );
    });
  }

  console.log("\n" + "─".repeat(60));
  console.log("Ctrl+C で終了");
  console.log("注: SQLiteではアプリケーションレベルで接続を追跡");
}

async function main() {
  const options = parseArgs();
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log("データベースに接続しました...\n");

    let count = 0;
    while (count < options.count) {
      const stats = await collectConnectionStats(client);
      const waiting = await collectWaitingConnections(client);
      printStats(stats, waiting);

      count++;
      if (count < options.count) {
        await new Promise((resolve) =>
          setTimeout(resolve, options.interval * 1000),
        );
      }
    }
  } catch (err) {
    console.error("❌ エラー:", err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

// シグナルハンドリング
process.on("SIGINT", () => {
  console.log("\n\n監視を終了します。");
  process.exit(0);
});

main();
