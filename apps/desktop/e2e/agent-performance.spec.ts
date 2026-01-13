/**
 * Agent SDK パフォーマンステスト
 *
 * Claude Agent SDKとの接続時のパフォーマンスを計測します。
 * - 初回応答時間（目標: P50 500ms以下）
 * - メッセージ間遅延（目標: P50 100ms以下）
 * - セッション作成時間（目標: P50 200ms以下）
 * - SDK初期化時間（目標: P50 1000ms以下）
 *
 * @see docs/30-workflows/postrelease-sdk-testing/outputs/phase-2/performance-test-design.md
 */

import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ============================================
// 型定義
// ============================================

interface MetricsSummary {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  count: number;
}

interface MetricResult extends MetricsSummary {
  threshold: number;
  passed: boolean;
}

interface PerformanceReport {
  testDate: string;
  sdkVersion: string;
  environment: {
    os: string;
    nodeVersion: string;
    electronVersion: string;
  };
  metrics: {
    firstResponseTime: MetricResult;
    interMessageDelay: MetricResult;
    sessionCreationTime: MetricResult;
    sdkInitTime: MetricResult;
  };
  overallPassed: boolean;
}

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 統計値を計算
 */
function calculateMetrics(values: number[]): MetricsSummary {
  if (values.length === 0) {
    return { p50: 0, p95: 0, p99: 0, mean: 0, min: 0, max: 0, count: 0 };
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
    count: n,
  };
}

/**
 * セッションをセットアップ
 */
async function setupSession(page: Page): Promise<string> {
  await page.goto("/agent");
  await page.waitForSelector(
    '[data-testid="agent-status"][data-status="initialized"]',
    { timeout: 10000 },
  );
  await page.click('[data-testid="new-session-button"]');
  const sessionId = await page
    .locator('[data-testid="session-id"]')
    .textContent();
  return sessionId!;
}

/**
 * セッションをクリーンアップ
 */
async function cleanup(page: Page): Promise<void> {
  try {
    await page.click('[data-testid="destroy-session-button"]');
    await page.waitForTimeout(100);
  } catch {
    // セッションが既に破棄されている場合は無視
  }
}

/**
 * ウォームアップ実行
 */
async function warmup(page: Page, iterations: number): Promise<void> {
  for (let i = 0; i < iterations; i++) {
    try {
      await setupSession(page);
      await page.fill('[data-testid="prompt-input"]', "warmup");
      await page.click('[data-testid="send-button"]');
      await page.waitForSelector(
        '[data-testid="execution-status"][data-status="completed"]',
        { timeout: 30000 },
      );
      await cleanup(page);
    } catch {
      // ウォームアップ中のエラーは無視
    }
  }
}

/**
 * レポートを出力
 */
function outputReport(report: PerformanceReport): void {
  const outputDir = path.join(process.cwd(), "test-results", "performance");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().getTime();
  const jsonPath = path.join(outputDir, "performance-" + timestamp + ".json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  console.log("Report saved to: " + outputDir);
}

// ============================================
// テストスイート
// ============================================

test.describe("Agent SDK パフォーマンステスト", () => {
  // レポート用のグローバル変数
  const reportData: Partial<PerformanceReport> = {
    testDate: new Date().toISOString(),
    sdkVersion: "0.2.5",
    environment: {
      os: process.platform,
      nodeVersion: process.version,
      electronVersion: "28.x",
    },
    metrics: {} as PerformanceReport["metrics"],
    overallPassed: true,
  };

  // ============================================
  // SDK初期化時間テスト
  // ============================================

  test.describe("SDK初期化時間", () => {
    test("PERF-01: P50 1000ms以下", async ({ page }) => {
      const metrics: number[] = [];
      const threshold = 1000;

      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await page.goto("/agent");
        await page.waitForSelector(
          '[data-testid="agent-status"][data-status="initialized"]',
        );
        const endTime = performance.now();

        metrics.push(endTime - startTime);
      }

      const summary = calculateMetrics(metrics);
      const result: MetricResult = {
        ...summary,
        threshold,
        passed: summary.p50 <= threshold,
      };

      console.log(
        "SDK Init Time: P50=" + summary.p50 + "ms, P95=" + summary.p95 + "ms",
      );

      if (reportData.metrics) {
        reportData.metrics.sdkInitTime = result;
      }
      if (!result.passed) {
        reportData.overallPassed = false;
      }

      expect(summary.p50).toBeLessThanOrEqual(threshold);
    });
  });

  // ============================================
  // セッション作成時間テスト
  // ============================================

  test.describe("セッション作成時間", () => {
    test("PERF-02: P50 200ms以下", async ({ page }) => {
      const metrics: number[] = [];
      const threshold = 200;

      await page.goto("/agent");
      await page.waitForSelector(
        '[data-testid="agent-status"][data-status="initialized"]',
      );

      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        await page.click('[data-testid="new-session-button"]');
        await page.waitForSelector('[data-testid="session-id"]');
        const endTime = performance.now();

        metrics.push(endTime - startTime);

        await page.click('[data-testid="destroy-session-button"]');
        await page.waitForTimeout(100);
      }

      const summary = calculateMetrics(metrics);
      const result: MetricResult = {
        ...summary,
        threshold,
        passed: summary.p50 <= threshold,
      };

      console.log(
        "Session Creation Time: P50=" +
          summary.p50 +
          "ms, P95=" +
          summary.p95 +
          "ms",
      );

      if (reportData.metrics) {
        reportData.metrics.sessionCreationTime = result;
      }
      if (!result.passed) {
        reportData.overallPassed = false;
      }

      expect(summary.p50).toBeLessThanOrEqual(threshold);
    });
  });

  // ============================================
  // 初回応答時間テスト
  // ============================================

  test.describe("初回応答時間", () => {
    test("PERF-03: P50 500ms以下", async ({ page }) => {
      const metrics: number[] = [];
      const threshold = 500;

      await warmup(page, 3);

      for (let i = 0; i < 10; i++) {
        await setupSession(page);

        const startTime = performance.now();
        await page.fill('[data-testid="prompt-input"]', "Hello");
        await page.click('[data-testid="send-button"]');

        await page.waitForSelector('[data-testid="response-chunk"]', {
          timeout: 30000,
        });
        const endTime = performance.now();

        metrics.push(endTime - startTime);
        await cleanup(page);
      }

      const summary = calculateMetrics(metrics);
      const result: MetricResult = {
        ...summary,
        threshold,
        passed: summary.p50 <= threshold,
      };

      console.log(
        "First Response Time: P50=" +
          summary.p50 +
          "ms, P95=" +
          summary.p95 +
          "ms",
      );

      if (reportData.metrics) {
        reportData.metrics.firstResponseTime = result;
      }
      if (!result.passed) {
        reportData.overallPassed = false;
      }

      expect(summary.p50).toBeLessThanOrEqual(threshold);
    });
  });

  // ============================================
  // メッセージ間遅延テスト
  // ============================================

  test.describe("メッセージ間遅延", () => {
    test("PERF-04: P50 100ms以下", async ({ page }) => {
      const delayMetrics: number[] = [];
      const threshold = 100;

      await setupSession(page);

      const timestamps: number[] = [];
      await page.exposeFunction("recordTimestamp", (ts: number) => {
        timestamps.push(ts);
      });

      await page.evaluate(() => {
        // @ts-expect-error - テスト用のグローバルAPI
        window.agentAPI?.onMessage?.(() => {
          // @ts-expect-error - exposeFunction で追加
          window.recordTimestamp(performance.now());
        });
      });

      await page.fill('[data-testid="prompt-input"]', "Count from 1 to 10");
      await page.click('[data-testid="send-button"]');
      await page.waitForSelector(
        '[data-testid="execution-status"][data-status="completed"]',
        { timeout: 60000 },
      );

      for (let i = 1; i < timestamps.length; i++) {
        delayMetrics.push(timestamps[i] - timestamps[i - 1]);
      }

      const summary = calculateMetrics(delayMetrics);
      const result: MetricResult = {
        ...summary,
        threshold,
        passed: summary.p50 <= threshold,
      };

      console.log(
        "Inter-message Delay: P50=" +
          summary.p50 +
          "ms, P95=" +
          summary.p95 +
          "ms",
      );

      if (reportData.metrics) {
        reportData.metrics.interMessageDelay = result;
      }
      if (!result.passed) {
        reportData.overallPassed = false;
      }

      expect(summary.p50).toBeLessThanOrEqual(threshold);
    });
  });

  test.afterAll(() => {
    if (
      reportData.metrics &&
      reportData.metrics.sdkInitTime &&
      reportData.metrics.sessionCreationTime &&
      reportData.metrics.firstResponseTime &&
      reportData.metrics.interMessageDelay
    ) {
      outputReport(reportData as PerformanceReport);
    }
  });
});
