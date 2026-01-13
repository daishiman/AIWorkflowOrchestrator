# Phase 2: 安定性テスト設計書

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | AGENT-005-POSTRELEASE |
| Phase    | 2                     |
| 作成日   | 2026-01-12            |

---

## 1. テスト概要

### 1.1 目的

1時間の連続実行でメモリリーク、クラッシュ、エラー蓄積がないことを検証する。

### 1.2 目標値

| 指標                 | 目標値    | 測定方法                   |
| -------------------- | --------- | -------------------------- |
| メモリ増加量         | 100MB以下 | 開始時と終了時の差分       |
| クラッシュ回数       | 0回       | プロセス異常終了のカウント |
| エラーリカバリ成功率 | 100%      | エラー後の正常復帰率       |
| クエリ成功率         | 95%以上   | 成功クエリ/総クエリ        |

---

## 2. テストスクリプト構成

```
apps/desktop/scripts/long-running-test.mjs
├── main()
│   ├── initialize()         # 初期化とベースライン取得
│   ├── runTestLoop()        # メインテストループ
│   ├── monitor()            # 定期モニタリング
│   └── generateReport()     # 結果レポート生成
└── utils/
    ├── memorySnapshot()     # メモリスナップショット
    ├── executeQuery()       # クエリ実行
    └── checkHealth()        # ヘルスチェック
```

---

## 3. 実装設計

### 3.1 メインスクリプト

```javascript
// long-running-test.mjs
import { chromium } from "@playwright/test";
import { writeFileSync } from "fs";

const CONFIG = {
  duration: 60 * 60 * 1000, // 1時間
  queryInterval: 30 * 1000, // 30秒
  monitorInterval: 60 * 1000, // 1分
  memoryThreshold: 100 * 1024 * 1024, // 100MB
};

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const results = {
    startTime: Date.now(),
    endTime: null,
    memorySnapshots: [],
    queryResults: [],
    errors: [],
    crashes: 0,
  };

  // 初期化
  await page.goto("http://localhost:3000/agent");
  await page.waitForSelector(
    '[data-testid="agent-status"][data-status="initialized"]',
  );

  // ベースラインメモリ取得
  const baselineMemory = await getMemoryUsage(page);
  results.memorySnapshots.push({
    timestamp: Date.now(),
    ...baselineMemory,
    type: "baseline",
  });

  // メインループ
  const startTime = Date.now();
  let queryCount = 0;

  while (Date.now() - startTime < CONFIG.duration) {
    try {
      // クエリ実行
      const queryResult = await executeQuery(
        page,
        `Test query ${queryCount++}`,
      );
      results.queryResults.push(queryResult);

      // モニタリング（1分ごと）
      if (queryCount % 2 === 0) {
        const memory = await getMemoryUsage(page);
        results.memorySnapshots.push({
          timestamp: Date.now(),
          ...memory,
          type: "periodic",
        });
      }
    } catch (error) {
      results.errors.push({
        timestamp: Date.now(),
        message: error.message,
        queryCount,
      });

      // リカバリ試行
      await attemptRecovery(page);
    }

    await sleep(CONFIG.queryInterval);
  }

  // 最終メモリ取得
  const finalMemory = await getMemoryUsage(page);
  results.memorySnapshots.push({
    timestamp: Date.now(),
    ...finalMemory,
    type: "final",
  });

  results.endTime = Date.now();

  // レポート生成
  const report = generateReport(results, baselineMemory, finalMemory);
  writeFileSync(
    "test-results/stability/report.json",
    JSON.stringify(report, null, 2),
  );

  await browser.close();

  // 判定
  const passed = evaluateResults(report);
  process.exit(passed ? 0 : 1);
}

main().catch(console.error);
```

### 3.2 メモリ監視

```javascript
async function getMemoryUsage(page) {
  return await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  });
}

function calculateMemoryGrowth(baseline, final) {
  if (!baseline || !final) return null;
  return final.usedJSHeapSize - baseline.usedJSHeapSize;
}

function detectMemoryLeak(snapshots, threshold) {
  if (snapshots.length < 10) return false;

  // 線形回帰でメモリ増加傾向を検出
  const times = snapshots.map((s) => s.timestamp);
  const memories = snapshots.map((s) => s.usedJSHeapSize);

  const slope = linearRegression(times, memories).slope;

  // 1時間あたりの増加量を計算
  const hourlyGrowth = slope * 3600000;

  return hourlyGrowth > threshold;
}
```

### 3.3 クエリ実行

```javascript
async function executeQuery(page, prompt) {
  const startTime = Date.now();

  try {
    await page.fill('[data-testid="prompt-input"]', prompt);
    await page.click('[data-testid="send-button"]');

    await page.waitForSelector(
      '[data-testid="execution-status"][data-status="completed"]',
      { timeout: 60000 },
    );

    return {
      timestamp: startTime,
      duration: Date.now() - startTime,
      success: true,
      prompt,
    };
  } catch (error) {
    return {
      timestamp: startTime,
      duration: Date.now() - startTime,
      success: false,
      prompt,
      error: error.message,
    };
  }
}
```

### 3.4 リカバリ処理

```javascript
async function attemptRecovery(page) {
  try {
    // 中断ボタンがあればクリック
    const abortButton = page.locator('[data-testid="abort-button"]');
    if (await abortButton.isVisible()) {
      await abortButton.click();
      await page.waitForTimeout(1000);
    }

    // ページリロード
    await page.reload();
    await page.waitForSelector(
      '[data-testid="agent-status"][data-status="initialized"]',
    );

    return true;
  } catch (error) {
    console.error("Recovery failed:", error);
    return false;
  }
}
```

---

## 4. レポート生成

### 4.1 レポート構造

```javascript
function generateReport(results, baselineMemory, finalMemory) {
  const memoryGrowth = calculateMemoryGrowth(baselineMemory, finalMemory);
  const successfulQueries = results.queryResults.filter(
    (q) => q.success,
  ).length;
  const totalQueries = results.queryResults.length;

  return {
    summary: {
      testDate: new Date(results.startTime).toISOString(),
      duration: results.endTime - results.startTime,
      totalQueries,
      successfulQueries,
      failedQueries: totalQueries - successfulQueries,
      successRate: ((successfulQueries / totalQueries) * 100).toFixed(2) + "%",
      memoryGrowthMB: (memoryGrowth / 1024 / 1024).toFixed(2),
      crashes: results.crashes,
      errors: results.errors.length,
    },
    thresholds: {
      memoryGrowth: {
        value: memoryGrowth,
        threshold: CONFIG.memoryThreshold,
        passed: memoryGrowth <= CONFIG.memoryThreshold,
      },
      crashes: {
        value: results.crashes,
        threshold: 0,
        passed: results.crashes === 0,
      },
      successRate: {
        value: successfulQueries / totalQueries,
        threshold: 0.95,
        passed: successfulQueries / totalQueries >= 0.95,
      },
    },
    details: {
      memorySnapshots: results.memorySnapshots,
      queryResults: results.queryResults,
      errors: results.errors,
    },
    passed: false, // evaluateResults で設定
  };
}
```

### 4.2 判定関数

```javascript
function evaluateResults(report) {
  const { thresholds } = report;

  const allPassed = Object.values(thresholds).every((t) => t.passed);
  report.passed = allPassed;

  console.log("\n=== Stability Test Results ===");
  console.log(
    `Memory Growth: ${report.summary.memoryGrowthMB}MB (threshold: 100MB) - ${thresholds.memoryGrowth.passed ? "PASS" : "FAIL"}`,
  );
  console.log(
    `Crashes: ${report.summary.crashes} (threshold: 0) - ${thresholds.crashes.passed ? "PASS" : "FAIL"}`,
  );
  console.log(
    `Success Rate: ${report.summary.successRate} (threshold: 95%) - ${thresholds.successRate.passed ? "PASS" : "FAIL"}`,
  );
  console.log(`Overall: ${allPassed ? "PASS" : "FAIL"}\n`);

  return allPassed;
}
```

---

## 5. 出力形式

### 5.1 JSON形式

```json
{
  "summary": {
    "testDate": "2026-01-12T14:00:00Z",
    "duration": 3600000,
    "totalQueries": 120,
    "successfulQueries": 118,
    "failedQueries": 2,
    "successRate": "98.33%",
    "memoryGrowthMB": "45.23",
    "crashes": 0,
    "errors": 2
  },
  "thresholds": {
    "memoryGrowth": {
      "value": 47423488,
      "threshold": 104857600,
      "passed": true
    },
    "crashes": {
      "value": 0,
      "threshold": 0,
      "passed": true
    },
    "successRate": {
      "value": 0.9833,
      "threshold": 0.95,
      "passed": true
    }
  },
  "passed": true
}
```

### 5.2 ログ出力

```
[00:00:00] Starting stability test (duration: 1h)
[00:00:00] Baseline memory: 120.5MB
[00:00:30] Query #1 completed (success)
[00:01:00] Memory snapshot: 122.3MB (+1.8MB)
...
[00:59:30] Query #120 completed (success)
[01:00:00] Final memory: 165.7MB (+45.2MB)

=== Stability Test Results ===
Memory Growth: 45.2MB (threshold: 100MB) - PASS
Crashes: 0 (threshold: 0) - PASS
Success Rate: 98.33% (threshold: 95%) - PASS
Overall: PASS
```

---

## 6. 実行方法

### 6.1 コマンド

```bash
# 安定性テスト実行
node apps/desktop/scripts/long-running-test.mjs

# 短縮版（テスト用、10分）
NODE_ENV=test node apps/desktop/scripts/long-running-test.mjs --duration=600000
```

### 6.2 CI/CD統合

```yaml
# .github/workflows/stability-test.yml
name: Stability Test

on:
  schedule:
    - cron: "0 3 * * 0" # 毎週日曜3:00 UTC

jobs:
  stability:
    runs-on: macos-latest
    timeout-minutes: 90
    steps:
      - uses: actions/checkout@v4
      - name: Run Stability Test
        run: node apps/desktop/scripts/long-running-test.mjs
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: stability-report
          path: test-results/stability/
```

---

## 変更履歴

| 日付       | 変更者 | 内容     |
| ---------- | ------ | -------- |
| 2026-01-12 | Claude | 初版作成 |
