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
 *   DATABASE_URL: PostgreSQL接続文字列
 */

import pg from "pg";
const { Client } = pg;

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
  const result = await client.query(`
    SELECT
      state,
      usename,
      application_name,
      client_addr,
      COUNT(*) AS count,
      MAX(EXTRACT(EPOCH FROM (NOW() - backend_start))) AS max_connection_age_sec,
      MAX(EXTRACT(EPOCH FROM (NOW() - query_start))) AS max_query_duration_sec
    FROM pg_stat_activity
    WHERE pid != pg_backend_pid()
    GROUP BY state, usename, application_name, client_addr
    ORDER BY count DESC
  `);

  const summary = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE state = 'active') AS active,
      COUNT(*) FILTER (WHERE state = 'idle') AS idle,
      COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_tx,
      COUNT(*) FILTER (WHERE state = 'idle in transaction (aborted)') AS idle_in_tx_aborted,
      COUNT(*) AS total,
      (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_conn
    FROM pg_stat_activity
    WHERE pid != pg_backend_pid()
  `);

  return {
    timestamp: new Date().toISOString(),
    summary: summary.rows[0],
    byStateUserApp: result.rows,
  };
}

async function collectWaitingConnections(client) {
  const result = await client.query(`
    SELECT
      blocked.pid AS blocked_pid,
      blocked.usename AS blocked_user,
      substring(blocked.query, 1, 50) AS blocked_query,
      blocking.pid AS blocking_pid,
      blocking.usename AS blocking_user,
      EXTRACT(EPOCH FROM (NOW() - blocked.query_start)) AS wait_duration_sec
    FROM pg_stat_activity blocked
    JOIN pg_stat_activity blocking
      ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
    WHERE blocked.pid != blocked.pid
    LIMIT 10
  `);

  return result.rows;
}

function printStats(stats, waitingConnections) {
  const s = stats.summary;
  const usagePct = ((s.total / s.max_conn) * 100).toFixed(1);

  console.clear();
  console.log("═".repeat(60));
  console.log(" PostgreSQL 接続統計モニター");
  console.log("═".repeat(60));
  console.log(`\n時刻: ${stats.timestamp}\n`);

  // サマリー
  console.log("【接続サマリー】");
  console.log(`  アクティブ:              ${s.active}`);
  console.log(`  アイドル:                ${s.idle}`);
  console.log(`  トランザクション内アイドル: ${s.idle_in_tx}`);
  console.log(`  中断トランザクション:     ${s.idle_in_tx_aborted}`);
  console.log(`  ─────────────────────────`);
  console.log(`  合計:                    ${s.total} / ${s.max_conn} (${usagePct}%)`);

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
    const app = row.application_name || "(unknown)";
    byApp[app] = (byApp[app] || 0) + parseInt(row.count);
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
          `PID ${wc.blocking_pid} (${wc.blocking_user})`
      );
    });
  }

  console.log("\n" + "─".repeat(60));
  console.log("Ctrl+C で終了");
}

async function main() {
  const options = parseArgs();
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("データベースに接続しました...\n");

    let count = 0;
    while (count < options.count) {
      const stats = await collectConnectionStats(client);
      const waiting = await collectWaitingConnections(client);
      printStats(stats, waiting);

      count++;
      if (count < options.count) {
        await new Promise((resolve) =>
          setTimeout(resolve, options.interval * 1000)
        );
      }
    }
  } catch (err) {
    console.error("❌ エラー:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// シグナルハンドリング
process.on("SIGINT", () => {
  console.log("\n\n監視を終了します。");
  process.exit(0);
});

main();
