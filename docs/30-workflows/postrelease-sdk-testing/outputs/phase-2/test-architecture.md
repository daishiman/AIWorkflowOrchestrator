# Phase 2: テストアーキテクチャ設計書

## メタ情報

| 項目     | 内容                  |
| -------- | --------------------- |
| タスクID | AGENT-005-POSTRELEASE |
| Phase    | 2                     |
| 作成日   | 2026-01-12            |

---

## 1. テストアーキテクチャ概要

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────────────┐
│                     Test Orchestrator                            │
│                   (npm scripts / CI/CD)                          │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│   E2E       │ Performance │  Stability  │  Network    │ Utils   │
│   Tests     │   Tests     │   Tests     │  Resilience │         │
│ (Playwright)│ (Playwright)│  (Node.js)  │ (Playwright)│         │
├─────────────┴─────────────┴─────────────┴─────────────┴─────────┤
│                    Test Utilities Layer                          │
│        (Measurement, Reporting, Assertions, Mocking)             │
├─────────────────────────────────────────────────────────────────┤
│                    Real SDK Integration                          │
│              (@anthropic-ai/claude-agent-sdk v0.2.5)             │
├─────────────────────────────────────────────────────────────────┤
│                    Electron Application                          │
│          (Main Process + Renderer Process + Preload)             │
├─────────────────────────────────────────────────────────────────┤
│                    Agent Execution UI                            │
│     (AgentChatInterface, PermissionDialog, StreamOutput)         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 テスト種別と責務

| テスト種別       | フレームワーク | 責務                         | 実行頻度 |
| ---------------- | -------------- | ---------------------------- | -------- |
| E2Eテスト        | Playwright     | 機能統合検証                 | 毎PR     |
| パフォーマンス   | Playwright     | 応答時間・遅延測定           | 毎PR     |
| 安定性テスト     | Node.js Script | 長時間実行・メモリリーク検出 | 週次     |
| ネットワーク障害 | Playwright     | 障害耐性検証                 | 毎PR     |

---

## 2. ディレクトリ構造

```
apps/desktop/
├── e2e/
│   ├── agent-sdk-integration.spec.ts    # E2E統合テスト
│   ├── agent-performance.spec.ts        # パフォーマンステスト
│   └── agent-network-resilience.spec.ts # ネットワーク障害テスト
├── scripts/
│   └── long-running-test.mjs            # 安定性テスト
└── src/
    └── test/
        └── utils/
            ├── performance-metrics.ts   # パフォーマンス計測ユーティリティ
            └── test-helpers.ts          # テストヘルパー
```

---

## 3. テスト実行フロー

### 3.1 E2Eテスト実行フロー

```
1. Electronアプリビルド
   └── pnpm --filter @repo/desktop build

2. テスト環境準備
   ├── Claude Code認証確認
   └── SDK初期化確認

3. E2Eテスト実行
   └── pnpm --filter @repo/desktop test:e2e:sdk

4. 結果レポート生成
   └── playwright-report/
```

### 3.2 パフォーマンステスト実行フロー

```
1. 計測環境の安定化
   └── 不要プロセスの停止

2. ウォームアップ実行
   └── 3回の事前クエリ（計測対象外）

3. 本計測実行
   └── 10回の計測（統計収集）

4. 結果分析
   ├── P50/P95/P99算出
   └── 閾値判定
```

### 3.3 安定性テスト実行フロー

```
1. 初期状態記録
   └── メモリ使用量ベースライン

2. 長時間実行（1時間）
   ├── 30秒ごとにクエリ実行
   └── 1分ごとにメモリ記録

3. 結果分析
   ├── メモリ増加量計算
   ├── エラー率計算
   └── クラッシュ検出
```

---

## 4. SDK統合ポイント

### 4.1 APIインターフェース

| API              | テスト対象         | 検証内容           |
| ---------------- | ------------------ | ------------------ |
| query()          | E2E/パフォーマンス | 正常実行、応答時間 |
| createSession()  | E2E                | セッションID生成   |
| resumeSession()  | E2E                | セッション継続     |
| destroySession() | E2E                | セッション破棄     |
| abort()          | E2E                | クエリ中断         |
| onMessage()      | E2E/パフォーマンス | ストリーミング受信 |
| getStatus()      | E2E                | ステータス取得     |

### 4.2 エラーハンドリング

| エラー型                 | テストシナリオ             |
| ------------------------ | -------------------------- |
| AgentInitializationError | 認証エラーテスト           |
| AgentQueryError          | クエリ失敗テスト           |
| AgentTimeoutError        | タイムアウトテスト         |
| AgentAbortedError        | 中断テスト                 |
| AgentSessionError        | セッションエラーテスト     |
| AgentValidationError     | バリデーションエラーテスト |

---

## 5. テストユーティリティ設計

### 5.1 パフォーマンス計測ユーティリティ

```typescript
// performance-metrics.ts
interface PerformanceMetrics {
  firstResponseTime: number[]; // 初回応答時間の配列
  interMessageDelay: number[]; // メッセージ間遅延の配列
  sessionCreationTime: number[]; // セッション作成時間の配列
}

interface MetricsSummary {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  min: number;
  max: number;
}

function calculateMetrics(values: number[]): MetricsSummary;
function isWithinThreshold(summary: MetricsSummary, threshold: number): boolean;
```

### 5.2 メモリ監視ユーティリティ

```typescript
// memory-monitor.ts
interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

function takeMemorySnapshot(): MemorySnapshot;
function calculateMemoryGrowth(snapshots: MemorySnapshot[]): number;
function detectMemoryLeak(
  snapshots: MemorySnapshot[],
  threshold: number,
): boolean;
```

---

## 6. テスト間の依存関係

### 6.1 実行順序

```
1. E2Eテスト（基本機能検証）
   └── 前提: なし

2. パフォーマンステスト
   └── 前提: E2Eテスト成功

3. ネットワーク障害テスト
   └── 前提: E2Eテスト成功

4. 安定性テスト（オプション）
   └── 前提: 全テスト成功
```

### 6.2 テストスイート構成

| スイート    | 含まれるテスト           | 実行タイミング |
| ----------- | ------------------------ | -------------- |
| smoke       | E2E正常系のみ            | 毎コミット     |
| integration | E2E全件 + パフォーマンス | 毎PR           |
| full        | 全テスト + 安定性        | リリース前     |

---

## 7. CI/CD統合

### 7.1 GitHub Actions ワークフロー

```yaml
# .github/workflows/sdk-integration-test.yml
name: SDK Integration Tests

on:
  pull_request:
    paths:
      - "apps/desktop/src/main/services/agent/**"
      - "packages/shared/src/types/agent*.ts"

jobs:
  sdk-integration:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Run SDK Integration Tests
        run: pnpm --filter @repo/desktop test:e2e:sdk
        env:
          CLAUDE_AUTH_TOKEN: ${{ secrets.CLAUDE_AUTH_TOKEN }}
```

### 7.2 テストレポート

| レポート種別       | 出力先                    | 内容               |
| ------------------ | ------------------------- | ------------------ |
| Playwright HTML    | playwright-report/        | E2Eテスト結果      |
| パフォーマンスJSON | test-results/performance/ | 計測データ         |
| 安定性ログ         | test-results/stability/   | メモリ・エラーログ |

---

## 8. テスト環境要件

### 8.1 前提条件

| 条件                | 確認方法                                  |
| ------------------- | ----------------------------------------- |
| Claude Code認証済み | `claude auth status`                      |
| SDK v0.2.5以上      | `npm view @anthropic-ai/claude-agent-sdk` |
| Node.js v20以上     | `node --version`                          |
| Electron v28以上    | package.json確認                          |

### 8.2 環境変数

| 変数名            | 用途               | 必須 |
| ----------------- | ------------------ | ---- |
| CLAUDE_AUTH_TOKEN | CI環境での認証     | CI   |
| SDK_TEST_TIMEOUT  | テストタイムアウト | No   |
| SDK_TEST_VERBOSE  | 詳細ログ出力       | No   |

---

## 変更履歴

| 日付       | 変更者 | 内容     |
| ---------- | ------ | -------- |
| 2026-01-12 | Claude | 初版作成 |
