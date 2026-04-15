# Phase 2 完了: 設計サマリー - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## Task 2-1: AnalyticsHttpProvider クラス設計

### インターフェース定義

- `AnalyticsEvent`: `{ eventName: string; payload: Record<string, unknown>; timestamp: number }`
- `AnalyticsSendResult`: `{ success: boolean; skipped?: boolean; error?: string; retryCount?: number }`
- `AnalyticsHttpProviderOptions`: `{ fetchFn?, timeoutMs?, maxRetries?, baseRetryDelayMs? }`
- `IAnalyticsHttpProvider`: `{ send(event): Promise<AnalyticsSendResult> }`

### 設計判断テーブル

| 判断項目               | 決定内容                                    | 理由                                |
| ---------------------- | ------------------------------------------- | ----------------------------------- |
| クラス配置パス         | `apps/desktop/src/main/services/analytics/` | Electron サービスアーキテクチャ準拠 |
| fetch の取得方法       | `options.fetchFn ?? globalThis.fetch`       | DI パターン（NFR-02）               |
| エンドポイント取得     | `process.env` のみ                          | electron-store 保存禁止（NFR-04）   |
| エンドポイント未設定時 | `{ success: true, skipped: true }`          | AC-5 準拠                           |
| エラー発生時           | `{ success: false, error: string }`         | FR-08、AC-2 準拠                    |

## Task 2-2: IPC 4層整合性設計

### analytics:get-stats レスポンス型

```typescript
interface AnalyticsStatsResponse {
  sentCount: number;
  failedCount: number;
  analyticsOptOut: boolean;
}
```

## Task 2-3: analyticsStore スキーマ拡張設計

```typescript
interface AnalyticsStoreSchema {
  analyticsOptOut?: boolean;
  sentCount?: number; // 送信成功累計
  failedCount?: number; // 送信失敗累計
  [key: string]: unknown;
}
```

## Task 2-4: リトライ・タイムアウト設計

| リトライ回数   | 待機時間             | 計算式                   |
| -------------- | -------------------- | ------------------------ |
| 1回目試行      | 即時実行             | -                        |
| 1回リトライ    | 1000ms               | `baseRetryDelayMs * 2^0` |
| 2回リトライ    | 2000ms               | `baseRetryDelayMs * 2^1` |
| 3回リトライ    | 4000ms               | `baseRetryDelayMs * 2^2` |
| 全リトライ失敗 | `{ success: false }` | -                        |

タイムアウト: AbortController で 5000ms

## Task 2-5: DI 境界設計

- 採用案: fetch DI 注入（`options.fetchFn ?? globalThis.fetch`）
- 不採用案: fetch をモジュールレベルでモック（型安全性・独立性が低い）
- analyticsHandler.ts での接続: `const analyticsProvider = new AnalyticsHttpProvider()` をスコープ外で生成（シングルトン）

_Phase 2 完了: 2026-04-14_
