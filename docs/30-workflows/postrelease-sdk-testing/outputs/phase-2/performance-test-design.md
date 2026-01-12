# Phase 2: パフォーマンステスト設計書

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | AGENT-005-POSTRELEASE |
| Phase    | 2                     |
| 作成日   | 2026-01-12            |

---

## 1. テスト概要

### 1.1 目的

実SDK接続でのストリーミング性能を計測し、パフォーマンス目標の達成を検証する。

### 1.2 計測対象

| 指標               | 目標値（P50） | 測定回数 |
| ------------------ | ------------- | -------- |
| 初回応答時間       | 500ms以下     | 10回     |
| メッセージ間遅延   | 100ms以下     | 10回     |
| セッション作成時間 | 200ms以下     | 10回     |
| SDK初期化時間      | 1000ms以下    | 10回     |

---

## 2. テストファイル構成

```
apps/desktop/e2e/agent-performance.spec.ts
├── describe('初回応答時間')
│   └── test('P50/P95/P99を計測')
├── describe('メッセージ間遅延')
│   └── test('ストリーミング遅延を計測')
├── describe('セッション作成時間')
│   └── test('セッション作成性能を計測')
└── describe('SDK初期化時間')
    └── test('初期化性能を計測')
```

---

## 3. 計測実装設計

### 3.1 初回応答時間計測

```typescript
test("初回応答時間 - P50 500ms以下", async ({ page }) => {
  const metrics: number[] = [];

  // ウォームアップ（計測対象外）
  await warmup(page, 3);

  // 本計測
  for (let i = 0; i < 10; i++) {
    await setupSession(page);

    const startTime = performance.now();
    await page.fill('[data-testid="prompt-input"]', "Hello");
    await page.click('[data-testid="send-button"]');

    // 最初のストリーミングチャンクを待つ
    await page.waitForSelector('[data-testid="response-chunk"]');
    const endTime = performance.now();

    metrics.push(endTime - startTime);
    await cleanup(page);
  }

  // 結果分析
  const summary = calculateMetrics(metrics);
  console.log(
    `First Response Time: P50=${summary.p50}ms, P95=${summary.p95}ms`,
  );

  // 閾値判定
  expect(summary.p50).toBeLessThanOrEqual(500);
});
```

**計測ポイント**:

- 開始: `query()`呼び出し時点
- 終了: 最初の`onMessage`コールバック実行時点

### 3.2 メッセージ間遅延計測

```typescript
test("メッセージ間遅延 - P50 100ms以下", async ({ page }) => {
  const delayMetrics: number[] = [];

  await setupSession(page);

  // ストリーミングイベントのタイムスタンプを収集
  const timestamps: number[] = [];
  await page.exposeFunction("recordTimestamp", (ts: number) => {
    timestamps.push(ts);
  });

  await page.evaluate(() => {
    window.agentAPI.onMessage(() => {
      window.recordTimestamp(performance.now());
    });
  });

  // クエリ実行
  await page.fill('[data-testid="prompt-input"]', "Count from 1 to 10");
  await page.click('[data-testid="send-button"]');
  await page.waitForSelector(
    '[data-testid="execution-status"][data-status="completed"]',
  );

  // 連続するタイムスタンプの差分を計算
  for (let i = 1; i < timestamps.length; i++) {
    delayMetrics.push(timestamps[i] - timestamps[i - 1]);
  }

  const summary = calculateMetrics(delayMetrics);
  console.log(
    `Inter-message Delay: P50=${summary.p50}ms, P95=${summary.p95}ms`,
  );

  expect(summary.p50).toBeLessThanOrEqual(100);
});
```

**計測ポイント**:

- 各`onMessage`コールバック間の時間差を計測

### 3.3 セッション作成時間計測

```typescript
test("セッション作成時間 - P50 200ms以下", async ({ page }) => {
  const metrics: number[] = [];

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

    // セッション破棄してリセット
    await page.click('[data-testid="destroy-session-button"]');
    await page.waitForTimeout(100);
  }

  const summary = calculateMetrics(metrics);
  console.log(
    `Session Creation Time: P50=${summary.p50}ms, P95=${summary.p95}ms`,
  );

  expect(summary.p50).toBeLessThanOrEqual(200);
});
```

### 3.4 SDK初期化時間計測

```typescript
test("SDK初期化時間 - P50 1000ms以下", async ({ page }) => {
  const metrics: number[] = [];

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
  console.log(`SDK Init Time: P50=${summary.p50}ms, P95=${summary.p95}ms`);

  expect(summary.p50).toBeLessThanOrEqual(1000);
});
```

---

## 4. 計測ユーティリティ

### 4.1 統計計算関数

```typescript
interface MetricsSummary {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
  count: number;
}

function calculateMetrics(values: number[]): MetricsSummary {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    p50: sorted[Math.floor(n * 0.5)],
    p95: sorted[Math.floor(n * 0.95)],
    p99: sorted[Math.floor(n * 0.99)],
    mean: values.reduce((a, b) => a + b, 0) / n,
    min: sorted[0],
    max: sorted[n - 1],
    count: n,
  };
}
```

### 4.2 ウォームアップ関数

```typescript
async function warmup(page: Page, iterations: number): Promise<void> {
  for (let i = 0; i < iterations; i++) {
    await setupSession(page);
    await page.fill('[data-testid="prompt-input"]', "warmup");
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector(
      '[data-testid="execution-status"][data-status="completed"]',
    );
    await cleanup(page);
  }
}
```

---

## 5. 結果レポート形式

### 5.1 JSON出力

```json
{
  "testDate": "2026-01-12T14:00:00Z",
  "sdkVersion": "0.2.5",
  "environment": {
    "os": "darwin",
    "nodeVersion": "20.x",
    "electronVersion": "28.x"
  },
  "metrics": {
    "firstResponseTime": {
      "p50": 450,
      "p95": 680,
      "p99": 890,
      "mean": 520,
      "min": 320,
      "max": 920,
      "count": 10,
      "threshold": 500,
      "passed": true
    },
    "interMessageDelay": {
      "p50": 85,
      "p95": 120,
      "p99": 150,
      "mean": 90,
      "min": 45,
      "max": 180,
      "count": 100,
      "threshold": 100,
      "passed": true
    },
    "sessionCreationTime": {
      "p50": 180,
      "p95": 250,
      "p99": 300,
      "mean": 190,
      "min": 120,
      "max": 320,
      "count": 10,
      "threshold": 200,
      "passed": true
    },
    "sdkInitTime": {
      "p50": 850,
      "p95": 1100,
      "p99": 1300,
      "mean": 900,
      "min": 600,
      "max": 1400,
      "count": 10,
      "threshold": 1000,
      "passed": true
    }
  },
  "overallPassed": true
}
```

### 5.2 Markdown出力

```markdown
# パフォーマンステスト結果

## 概要

- 実行日時: 2026-01-12 14:00:00
- SDKバージョン: 0.2.5
- 総合判定: **PASS**

## 結果詳細

| 指標               | P50   | P95    | P99    | 目標   | 判定 |
| ------------------ | ----- | ------ | ------ | ------ | ---- |
| 初回応答時間       | 450ms | 680ms  | 890ms  | 500ms  | ✅   |
| メッセージ間遅延   | 85ms  | 120ms  | 150ms  | 100ms  | ✅   |
| セッション作成時間 | 180ms | 250ms  | 300ms  | 200ms  | ✅   |
| SDK初期化時間      | 850ms | 1100ms | 1300ms | 1000ms | ✅   |
```

---

## 6. 閾値判定ロジック

### 6.1 判定基準

| レベル | 条件                   | アクション   |
| ------ | ---------------------- | ------------ |
| PASS   | P50が目標値以下        | 合格         |
| WARN   | P50が目標値の1.2倍以下 | 警告ログ出力 |
| FAIL   | P50が目標値の1.2倍超   | テスト失敗   |

### 6.2 判定関数

```typescript
type JudgmentLevel = "PASS" | "WARN" | "FAIL";

function judge(value: number, threshold: number): JudgmentLevel {
  if (value <= threshold) return "PASS";
  if (value <= threshold * 1.2) return "WARN";
  return "FAIL";
}
```

---

## 7. テスト実行条件

### 7.1 前提条件

| 条件                 | 目的                       |
| -------------------- | -------------------------- |
| 安定したネットワーク | 外部要因によるばらつき排除 |
| 他プロセス最小化     | CPU/メモリ競合回避         |
| ウォームアップ実施   | コールドスタート影響排除   |

### 7.2 除外条件

以下の場合は計測対象から除外:

- ネットワークエラー発生時
- 明らかな外れ値（平均の3σ超）

---

## 変更履歴

| 日付       | 変更者 | 内容     |
| ---------- | ------ | -------- |
| 2026-01-12 | Claude | 初版作成 |
