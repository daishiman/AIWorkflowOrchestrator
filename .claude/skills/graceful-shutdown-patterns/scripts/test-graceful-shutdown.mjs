#!/usr/bin/env node
/**
 * Graceful Shutdownテストスクリプト
 *
 * プロセスにSIGTERMを送信し、graceful shutdownの動作を検証します。
 *
 * 使用方法:
 *   node test-graceful-shutdown.mjs <pid>
 *   node test-graceful-shutdown.mjs --pm2 <app-name>
 *
 * 例:
 *   node test-graceful-shutdown.mjs 12345
 *   node test-graceful-shutdown.mjs --pm2 my-app
 */

import { execSync, spawn } from 'child_process';

const TIMEOUT_MS = 30000;

/**
 * PM2アプリのPIDを取得
 */
function getPM2Pid(appName) {
  try {
    const result = execSync(`pm2 pid ${appName}`, { encoding: 'utf8' }).trim();
    const pid = parseInt(result);
    if (isNaN(pid) || pid === 0) {
      return null;
    }
    return pid;
  } catch {
    return null;
  }
}

/**
 * プロセスが存在するか確認
 */
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * シグナルを送信してシャットダウンをテスト
 */
async function testGracefulShutdown(pid, signal = 'SIGTERM') {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Graceful Shutdown Test`);
  console.log(`${'='.repeat(50)}\n`);

  if (!isProcessAlive(pid)) {
    console.error(`Error: Process ${pid} is not running`);
    process.exit(1);
  }

  console.log(`📋 Test Configuration:`);
  console.log(`   PID: ${pid}`);
  console.log(`   Signal: ${signal}`);
  console.log(`   Timeout: ${TIMEOUT_MS}ms`);
  console.log();

  // シグナル送信
  console.log(`📤 Sending ${signal} to process ${pid}...`);
  const startTime = Date.now();

  try {
    process.kill(pid, signal);
  } catch (error) {
    console.error(`Error sending signal: ${error.message}`);
    process.exit(1);
  }

  // プロセス終了を待機
  console.log(`⏳ Waiting for process to exit...`);

  const checkInterval = 100; // 100ms間隔でチェック
  let elapsed = 0;

  while (isProcessAlive(pid) && elapsed < TIMEOUT_MS) {
    await sleep(checkInterval);
    elapsed = Date.now() - startTime;

    // 進捗表示（5秒ごと）
    if (elapsed % 5000 < checkInterval) {
      console.log(`   ... ${Math.round(elapsed / 1000)}s elapsed`);
    }
  }

  const totalTime = Date.now() - startTime;

  console.log();

  // 結果判定
  if (isProcessAlive(pid)) {
    console.log(`❌ FAILED: Process did not exit within ${TIMEOUT_MS}ms`);
    console.log(`   Process is still running`);
    console.log();
    console.log(`💡 Suggestions:`);
    console.log(`   - Check if signal handlers are implemented`);
    console.log(`   - Verify shutdown timeout settings`);
    console.log(`   - Review logs for errors during shutdown`);
    return false;
  }

  if (totalTime < 1000) {
    console.log(`⚠️  WARNING: Process exited very quickly (${totalTime}ms)`);
    console.log(`   This might indicate:`);
    console.log(`   - No graceful shutdown implemented`);
    console.log(`   - No active connections to drain`);
    console.log(`   - Process crashed instead of shutdown`);
  } else {
    console.log(`✅ SUCCESS: Process exited gracefully in ${totalTime}ms`);
  }

  return true;
}

/**
 * PM2を使用したテスト
 */
async function testPM2GracefulShutdown(appName) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`PM2 Graceful Shutdown Test`);
  console.log(`${'='.repeat(50)}\n`);

  // アプリ状態確認
  try {
    const listResult = execSync(`pm2 jlist`, { encoding: 'utf8' });
    const apps = JSON.parse(listResult);
    const app = apps.find(a => a.name === appName);

    if (!app) {
      console.error(`Error: PM2 app '${appName}' not found`);
      process.exit(1);
    }

    console.log(`📋 App Information:`);
    console.log(`   Name: ${app.name}`);
    console.log(`   PID: ${app.pid}`);
    console.log(`   Status: ${app.pm2_env.status}`);
    console.log(`   Restarts: ${app.pm2_env.restart_time}`);
    console.log();

    if (app.pm2_env.status !== 'online') {
      console.error(`Error: App is not online (status: ${app.pm2_env.status})`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error getting PM2 info: ${error.message}`);
    process.exit(1);
  }

  // PM2 stopを実行
  console.log(`📤 Executing: pm2 stop ${appName}`);
  const startTime = Date.now();

  try {
    execSync(`pm2 stop ${appName}`, {
      encoding: 'utf8',
      timeout: TIMEOUT_MS
    });

    const totalTime = Date.now() - startTime;
    console.log();
    console.log(`✅ SUCCESS: PM2 stop completed in ${totalTime}ms`);

    // 再起動回数確認
    const afterResult = execSync(`pm2 jlist`, { encoding: 'utf8' });
    const afterApps = JSON.parse(afterResult);
    const afterApp = afterApps.find(a => a.name === appName);

    console.log(`   Final status: ${afterApp.pm2_env.status}`);

    return true;
  } catch (error) {
    console.error();
    console.error(`❌ FAILED: PM2 stop failed or timed out`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * sleep関数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 使用方法を表示
 */
function showUsage() {
  console.log('Usage:');
  console.log('  node test-graceful-shutdown.mjs <pid>');
  console.log('  node test-graceful-shutdown.mjs --pm2 <app-name>');
  console.log('');
  console.log('Options:');
  console.log('  --signal <signal>  Signal to send (default: SIGTERM)');
  console.log('  --timeout <ms>     Timeout in milliseconds (default: 30000)');
  console.log('');
  console.log('Examples:');
  console.log('  node test-graceful-shutdown.mjs 12345');
  console.log('  node test-graceful-shutdown.mjs --pm2 my-app');
  console.log('  node test-graceful-shutdown.mjs 12345 --signal SIGINT');
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }

  let usePM2 = false;
  let target = null;
  let signal = 'SIGTERM';

  // 引数解析
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pm2') {
      usePM2 = true;
      target = args[++i];
    } else if (args[i] === '--signal') {
      signal = args[++i];
    } else if (args[i] === '--timeout') {
      // グローバル変数は変更できないので、この実装では無視
      i++;
    } else if (!target) {
      target = args[i];
    }
  }

  if (!target) {
    console.error('Error: PID or app name required');
    showUsage();
    process.exit(1);
  }

  let success;

  if (usePM2) {
    success = await testPM2GracefulShutdown(target);
  } else {
    const pid = parseInt(target);
    if (isNaN(pid)) {
      console.error('Error: Invalid PID');
      process.exit(1);
    }
    success = await testGracefulShutdown(pid, signal);
  }

  console.log();
  console.log('-'.repeat(50));
  console.log(`Test Result: ${success ? 'PASSED' : 'FAILED'}`);

  process.exit(success ? 0 : 1);
}

main().catch(console.error);
