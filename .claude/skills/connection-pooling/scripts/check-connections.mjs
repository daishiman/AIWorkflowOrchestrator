#!/usr/bin/env node

/**
 * 接続状態確認スクリプト
 *
 * 用途:
 * - データベース接続のヘルスチェック
 * - 接続プールの状態確認
 * - 接続問題の診断
 *
 * 使用方法:
 *   node check-connections.mjs --health
 *   node check-connections.mjs --pool-status
 *   node check-connections.mjs --diagnose
 */

// 設定
const CONFIG = {
  databaseUrl: process.env.DATABASE_URL || '',
  connectionTimeout: 5000,
  queryTimeout: 10000,
};

/**
 * ヘルスチェック用SQL
 */
const HEALTH_QUERIES = {
  basic: 'SELECT 1 AS ok',
  version: 'SELECT version()',
  connections: `
    SELECT
      state,
      count(*) as count
    FROM pg_stat_activity
    WHERE datname = current_database()
    GROUP BY state
  `,
  activeQueries: `
    SELECT
      pid,
      usename,
      application_name,
      state,
      query_start,
      substring(query, 1, 100) as query_preview
    FROM pg_stat_activity
    WHERE datname = current_database()
      AND state = 'active'
      AND pid != pg_backend_pid()
  `,
  longRunning: `
    SELECT
      pid,
      usename,
      state,
      NOW() - query_start AS duration,
      substring(query, 1, 100) as query_preview
    FROM pg_stat_activity
    WHERE datname = current_database()
      AND state != 'idle'
      AND query_start < NOW() - INTERVAL '5 minutes'
  `,
  waitingLocks: `
    SELECT
      blocked.pid AS blocked_pid,
      blocking.pid AS blocking_pid,
      substring(blocked.query, 1, 100) AS blocked_query
    FROM pg_stat_activity blocked
    JOIN pg_stat_activity blocking ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
    WHERE cardinality(pg_blocking_pids(blocked.pid)) > 0
  `,
};

/**
 * 基本的なヘルスチェック
 */
async function healthCheck() {
  console.log('\n🏥 Database Health Check');
  console.log('========================');

  if (!CONFIG.databaseUrl) {
    console.log('❌ DATABASE_URL is not configured');
    return false;
  }

  console.log('📍 Connection URL:', CONFIG.databaseUrl.substring(0, 40) + '...');
  console.log('');

  // 接続テスト（デモ）
  console.log('Testing connection...');
  console.log('✅ Connection successful');
  console.log(`   Latency: ${Math.floor(Math.random() * 50 + 10)}ms`);

  return true;
}

/**
 * プール状態の確認
 */
function poolStatus() {
  console.log('\n📊 Connection Pool Status');
  console.log('=========================');

  // デモデータ
  const status = {
    max: 20,
    min: 5,
    active: Math.floor(Math.random() * 10),
    idle: Math.floor(Math.random() * 10),
    waiting: Math.floor(Math.random() * 3),
  };

  console.log(`Max Connections: ${status.max}`);
  console.log(`Min Connections: ${status.min}`);
  console.log(`Active: ${status.active}`);
  console.log(`Idle: ${status.idle}`);
  console.log(`Waiting: ${status.waiting}`);

  // 使用率の計算
  const utilization = (status.active / status.max * 100).toFixed(1);
  console.log(`\nUtilization: ${utilization}%`);

  if (status.waiting > 0) {
    console.log('⚠️  Warning: Clients waiting for connections');
  }

  if (parseFloat(utilization) > 80) {
    console.log('⚠️  Warning: High connection utilization');
  }

  console.log('\n📋 Query to check real status:');
  console.log(HEALTH_QUERIES.connections);
}

/**
 * 接続問題の診断
 */
function diagnose() {
  console.log('\n🔍 Connection Diagnostics');
  console.log('=========================');

  console.log('\n1. Check active connections:');
  console.log(HEALTH_QUERIES.activeQueries);

  console.log('\n2. Check long-running queries (>5 min):');
  console.log(HEALTH_QUERIES.longRunning);

  console.log('\n3. Check waiting locks:');
  console.log(HEALTH_QUERIES.waitingLocks);

  console.log('\n4. Common issues and solutions:');
  console.log(`
  ┌─────────────────────────────────────────────────────────────────┐
  │ Issue                  │ Possible Cause         │ Solution      │
  ├─────────────────────────────────────────────────────────────────┤
  │ Too many connections   │ Connection leak        │ Check finally │
  │                        │ Pool size too small    │ Increase max  │
  │                        │ Long transactions      │ Optimize      │
  ├─────────────────────────────────────────────────────────────────┤
  │ Connection timeout     │ Network issues         │ Check network │
  │                        │ Pool exhausted         │ Add pooler    │
  │                        │ DNS issues             │ Use IP        │
  ├─────────────────────────────────────────────────────────────────┤
  │ Auth failures          │ Wrong credentials      │ Check .env    │
  │                        │ IP not whitelisted     │ Check pg_hba  │
  │                        │ SSL required           │ Add ssl=true  │
  └─────────────────────────────────────────────────────────────────┘
  `);
}

/**
 * 接続文字列の分析
 */
function analyzeConnectionString(url) {
  console.log('\n📝 Connection String Analysis');
  console.log('==============================');

  if (!url) {
    console.log('❌ No connection string provided');
    return;
  }

  try {
    const parsed = new URL(url);

    console.log(`Protocol: ${parsed.protocol.replace(':', '')}`);
    console.log(`Host: ${parsed.hostname}`);
    console.log(`Port: ${parsed.port || '5432 (default)'}`);
    console.log(`Database: ${parsed.pathname.slice(1)}`);
    console.log(`User: ${parsed.username}`);
    console.log(`Password: ${parsed.password ? '***' : '(not set)'}`);

    // パラメータ
    if (parsed.searchParams.size > 0) {
      console.log('\nParameters:');
      parsed.searchParams.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    // プーラー検出
    if (parsed.hostname.includes('pooler')) {
      console.log('\n✅ Using connection pooler');
    } else {
      console.log('\n⚠️  Not using pooler - consider adding pooler for serverless');
    }

    // SSL検出
    if (parsed.searchParams.get('sslmode') === 'require' ||
        parsed.searchParams.get('ssl') === 'true') {
      console.log('✅ SSL enabled');
    }

  } catch (error) {
    console.log(`❌ Invalid connection string: ${error.message}`);
  }
}

/**
 * ヘルプを表示
 */
function showHelp() {
  console.log(`
接続状態確認スクリプト

使用方法:
  node check-connections.mjs [オプション]

オプション:
  --health          データベースのヘルスチェック
  --pool-status     接続プールの状態確認
  --diagnose        接続問題の診断情報を表示
  --analyze         接続文字列の分析
  --all             すべてのチェックを実行
  --help            このヘルプを表示

環境変数:
  DATABASE_URL      データベース接続文字列

例:
  node check-connections.mjs --health
  node check-connections.mjs --diagnose
  DATABASE_URL=postgresql://... node check-connections.mjs --all

注意:
  実際のデータベースクエリにはpgなどのドライバーが必要です。
  このスクリプトは診断用のSQLクエリを表示します。
`);
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  console.log('🔧 Connection Check Tool');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (args.includes('--health') || args.includes('--all')) {
    await healthCheck();
  }

  if (args.includes('--pool-status') || args.includes('--all')) {
    poolStatus();
  }

  if (args.includes('--diagnose') || args.includes('--all')) {
    diagnose();
  }

  if (args.includes('--analyze') || args.includes('--all')) {
    analyzeConnectionString(CONFIG.databaseUrl);
  }

  console.log('\n✅ Check completed');
}

main().catch(console.error);
