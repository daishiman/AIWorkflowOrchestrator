#!/usr/bin/env node

/**
 * Agent SDK 安定性テストスクリプト
 *
 * 長時間実行による安定性を検証します。
 * - 1時間の連続クエリ実行
 * - メモリ使用量のモニタリング
 * - エラー発生率の追跡
 * - セッション再開の検証
 *
 * @see docs/30-workflows/postrelease-sdk-testing/outputs/phase-2/stability-test-design.md
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ESMでの__dirname相当
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 設定
// ============================================

const CONFIG = {
  // テスト設定
  testDurationMs: 60 * 60 * 1000, // 1時間
  queryIntervalMs: 30 * 1000, // 30秒間隔
  sessionRotationInterval: 10, // 10クエリごとにセッション再作成
  memoryCheckIntervalMs: 60 * 1000, // 1分間隔

  // 閾値
  maxMemoryGrowthMb: 100, // 100MB以上の増加は警告
  maxErrorRate: 0.05, // 5%以上のエラー率は失敗
  minSuccessRate: 0.95, // 95%以上の成功率が必要

  // アプリケーション
  appUrl: "http://localhost:3000/agent",
  headless: true,
};

// ============================================
// 型定義
// ============================================

/**
 * @typedef {Object} TestMetrics
 * @property {number} totalQueries - 総クエリ数
 * @property {number} successfulQueries - 成功クエリ数
 * @property {number} failedQueries - 失敗クエリ数
 * @property {number} abortedQueries - 中断クエリ数
 * @property {number[]} responseTimes - 応答時間配列
 * @property {number[]} memoryUsage - メモリ使用量配列
 * @property {string[]} errors - エラーメッセージ配列
 * @property {number} sessionResets - セッションリセット回数
 */

/**
 * @typedef {Object} TestReport
 * @property {string} testStartTime - テスト開始時刻
 * @property {string} testEndTime - テスト終了時刻
 * @property {number} testDurationMs - テスト実行時間
 * @property {TestMetrics} metrics - メトリクス
 * @property {Object} analysis - 分析結果
 * @property {boolean} passed - テスト結果
 */

// ============================================
// グローバル変数
// ============================================

/** @type {TestMetrics} */
const metrics = {
  totalQueries: 0,
  successfulQueries: 0,
  failedQueries: 0,
  abortedQueries: 0,
  responseTimes: [],
  memoryUsage: [],
  errors: [],
  sessionResets: 0,
};

let isRunning = true;
let startTime = 0;

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 統計値を計算
 * @param {number[]} values
 * @returns {Object}
 */
function calculateStats(values) {
  if (values.length === 0) {
    return { p50: 0, p95: 0, p99: 0, mean: 0, min: 0, max: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    p50: sorted[Math.floor(n * 0.5)] ?? 0,
    p95: sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0,
    p99: sorted[Math.floor(n * 0.99)] ?? sorted[n - 1] ?? 0,
    mean: values.reduce((a, b) => a + b, 0) / n,
    min: sorted[0] ?? 0,
    max: sorted[n - 1] ?? 0,
  };
}

/**
 * メモリ使用量を取得（MB）
 * @param {import('playwright').Page} page
 * @returns {Promise<number>}
 */
async function getMemoryUsage(page) {
  try {
    const metrics = await page.evaluate(() => {
      // @ts-expect-error - performance.memory is a Chrome extension
      if (performance.memory) {
        // @ts-expect-error
        return performance.memory.usedJSHeapSize / 1024 / 1024;
      }
      return 0;
    });
    return metrics;
  } catch {
    return 0;
  }
}

/**
 * 経過時間を取得（秒）
 * @returns {number}
 */
function getElapsedSeconds() {
  return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * ログ出力
 * @param {string} message
 */
function log(message) {
  const elapsed = getElapsedSeconds();
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  console.log(
    "[" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0") +
      "] " +
      message,
  );
}

/**
 * プログレス表示
 */
function showProgress() {
  const elapsed = Date.now() - startTime;
  const progress = Math.min(100, (elapsed / CONFIG.testDurationMs) * 100);
  const successRate =
    metrics.totalQueries > 0
      ? (metrics.successfulQueries / metrics.totalQueries) * 100
      : 100;

  log(
    "Progress: " +
      progress.toFixed(1) +
      "% | " +
      "Queries: " +
      metrics.totalQueries +
      " | " +
      "Success: " +
      successRate.toFixed(1) +
      "% | " +
      "Memory: " +
      (metrics.memoryUsage[metrics.memoryUsage.length - 1]?.toFixed(1) ??
        "N/A") +
      "MB",
  );
}

// ============================================
// テスト実行
// ============================================

/**
 * セッションをセットアップ
 * @param {import('playwright').Page} page
 * @returns {Promise<string>}
 */
async function setupSession(page) {
  await page.goto(CONFIG.appUrl);
  await page.waitForSelector(
    '[data-testid="agent-status"][data-status="initialized"]',
    { timeout: 30000 },
  );
  await page.click('[data-testid="new-session-button"]');
  const sessionId = await page
    .locator('[data-testid="session-id"]')
    .textContent();

  metrics.sessionResets++;
  return sessionId ?? "";
}

/**
 * クエリを実行
 * @param {import('playwright').Page} page
 * @param {string} prompt
 * @returns {Promise<{ success: boolean; time: number; error?: string }>}
 */
async function executeQuery(page, prompt) {
  const queryStart = performance.now();

  try {
    await page.fill('[data-testid="prompt-input"]', prompt);
    await page.click('[data-testid="send-button"]');

    await page.waitForSelector(
      '[data-testid="execution-status"][data-status="completed"]',
      { timeout: 120000 },
    );

    const queryEnd = performance.now();
    return {
      success: true,
      time: queryEnd - queryStart,
    };
  } catch (error) {
    const queryEnd = performance.now();
    return {
      success: false,
      time: queryEnd - queryStart,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * セッションをクリーンアップ
 * @param {import('playwright').Page} page
 */
async function cleanupSession(page) {
  try {
    await page.click('[data-testid="destroy-session-button"]');
    await page.waitForTimeout(100);
  } catch {
    // セッションが既に破棄されている場合は無視
  }
}

/**
 * メモリモニタリングを開始
 * @param {import('playwright').Page} page
 * @returns {NodeJS.Timeout}
 */
function startMemoryMonitoring(page) {
  return setInterval(async () => {
    const memory = await getMemoryUsage(page);
    if (memory > 0) {
      metrics.memoryUsage.push(memory);
    }
  }, CONFIG.memoryCheckIntervalMs);
}

/**
 * メインテストループ
 * @param {import('playwright').Page} page
 */
async function runTestLoop(page) {
  let queryCount = 0;

  // 初期セッション作成
  await setupSession(page);

  while (isRunning && Date.now() - startTime < CONFIG.testDurationMs) {
    const prompts = [
      "Hello, how are you?",
      "What is the capital of France?",
      "Explain quantum computing in simple terms.",
      "Write a haiku about programming.",
      "What are the benefits of TypeScript?",
    ];

    const prompt = prompts[queryCount % prompts.length];
    metrics.totalQueries++;

    const result = await executeQuery(page, prompt);

    if (result.success) {
      metrics.successfulQueries++;
      metrics.responseTimes.push(result.time);
      log(
        "Query #" +
          metrics.totalQueries +
          " completed in " +
          result.time.toFixed(0) +
          "ms",
      );
    } else {
      metrics.failedQueries++;
      if (result.error) {
        metrics.errors.push(result.error);
      }
      log(
        "Query #" +
          metrics.totalQueries +
          " failed: " +
          (result.error || "Unknown error"),
      );
    }

    queryCount++;

    // セッションローテーション
    if (queryCount % CONFIG.sessionRotationInterval === 0) {
      log("Rotating session...");
      await cleanupSession(page);
      await setupSession(page);
    }

    // プログレス表示
    if (queryCount % 5 === 0) {
      showProgress();
    }

    // 次のクエリまで待機
    await page.waitForTimeout(CONFIG.queryIntervalMs);
  }

  // クリーンアップ
  await cleanupSession(page);
}

/**
 * レポートを生成
 * @returns {TestReport}
 */
function generateReport() {
  const endTime = Date.now();
  const responseTimeStats = calculateStats(metrics.responseTimes);
  const memoryStats = calculateStats(metrics.memoryUsage);

  const successRate =
    metrics.totalQueries > 0
      ? metrics.successfulQueries / metrics.totalQueries
      : 0;

  const errorRate =
    metrics.totalQueries > 0 ? metrics.failedQueries / metrics.totalQueries : 0;

  const memoryGrowth =
    metrics.memoryUsage.length >= 2
      ? metrics.memoryUsage[metrics.memoryUsage.length - 1] -
        metrics.memoryUsage[0]
      : 0;

  const passed =
    successRate >= CONFIG.minSuccessRate &&
    errorRate <= CONFIG.maxErrorRate &&
    memoryGrowth <= CONFIG.maxMemoryGrowthMb;

  return {
    testStartTime: new Date(startTime).toISOString(),
    testEndTime: new Date(endTime).toISOString(),
    testDurationMs: endTime - startTime,
    metrics: { ...metrics },
    analysis: {
      successRate,
      errorRate,
      responseTime: responseTimeStats,
      memory: {
        ...memoryStats,
        growth: memoryGrowth,
      },
      sessionResets: metrics.sessionResets,
      uniqueErrors: [...new Set(metrics.errors)],
    },
    passed,
  };
}

/**
 * レポートを出力
 * @param {TestReport} report
 */
function outputReport(report) {
  const outputDir = path.join(__dirname, "..", "test-results", "stability");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const jsonPath = path.join(outputDir, "stability-" + timestamp + ".json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  log("Report saved to: " + jsonPath);

  // コンソール出力
  console.log("\n" + "=".repeat(60));
  console.log("STABILITY TEST REPORT");
  console.log("=".repeat(60));
  console.log(
    "Duration: " + (report.testDurationMs / 1000 / 60).toFixed(1) + " minutes",
  );
  console.log("Total Queries: " + report.metrics.totalQueries);
  console.log(
    "Success Rate: " + (report.analysis.successRate * 100).toFixed(2) + "%",
  );
  console.log(
    "Error Rate: " + (report.analysis.errorRate * 100).toFixed(2) + "%",
  );
  console.log(
    "Response Time (P50): " +
      report.analysis.responseTime.p50.toFixed(0) +
      "ms",
  );
  console.log(
    "Response Time (P95): " +
      report.analysis.responseTime.p95.toFixed(0) +
      "ms",
  );
  console.log(
    "Memory Growth: " + report.analysis.memory.growth.toFixed(1) + "MB",
  );
  console.log("Session Resets: " + report.analysis.sessionResets);
  console.log("=".repeat(60));
  console.log("RESULT: " + (report.passed ? "PASSED" : "FAILED"));
  console.log("=".repeat(60) + "\n");
}

// ============================================
// メインエントリポイント
// ============================================

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("Agent SDK Stability Test");
  console.log("=".repeat(60));
  console.log("Duration: " + CONFIG.testDurationMs / 1000 / 60 + " minutes");
  console.log("Query Interval: " + CONFIG.queryIntervalMs / 1000 + " seconds");
  console.log(
    "Session Rotation: Every " + CONFIG.sessionRotationInterval + " queries",
  );
  console.log("=".repeat(60) + "\n");

  // シグナルハンドラ（graceful shutdown）
  process.on("SIGINT", () => {
    log("Received SIGINT, stopping test...");
    isRunning = false;
  });

  process.on("SIGTERM", () => {
    log("Received SIGTERM, stopping test...");
    isRunning = false;
  });

  // ブラウザ起動
  const browser = await chromium.launch({
    headless: CONFIG.headless,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // メモリモニタリング開始
  const memoryMonitor = startMemoryMonitoring(page);

  try {
    startTime = Date.now();
    log("Starting test...");

    await runTestLoop(page);

    log("Test completed.");
  } catch (error) {
    log(
      "Test error: " + (error instanceof Error ? error.message : String(error)),
    );
    metrics.errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    // クリーンアップ
    clearInterval(memoryMonitor);
    await browser.close();

    // レポート生成・出力
    const report = generateReport();
    outputReport(report);

    // 終了コード
    process.exit(report.passed ? 0 : 1);
  }
}

// 実行
main().catch(console.error);
