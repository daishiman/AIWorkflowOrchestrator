# スコープ定義

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 1 - 要件定義

---

## 変更ファイル一覧

### 新規作成

| ファイルパス                                                                                | 説明                               |
| ------------------------------------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx`                | Analytics ダッシュボードパネル本体 |
| `apps/desktop/src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx` | ユニットテスト（T4-01〜T4-08）     |
| `apps/desktop/e2e/analytics-dashboard.spec.ts`                                              | Playwright E2E テスト              |

### 修正

| ファイルパス                                                         | 変更内容                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`             | `AnalyticsDashboardPanel` を import し、RAG設定の直後に追加 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx` | `AnalyticsDashboardPanel` の `vi.mock` を追加               |

---

## スコープ外（変更しないファイル）

| ファイルパス                                          | 理由                                    |
| ----------------------------------------------------- | --------------------------------------- |
| `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | 既存 API で要件を全て満たすため変更不要 |
| `apps/desktop/src/renderer/utils/trackEvent.ts`       | 本タスクの変更対象外                    |
| `apps/desktop/src/main/ipc/analyticsHandler.ts`       | Main プロセス側は変更不要               |
| `apps/desktop/src/preload/*`                          | Preload API の追加不要                  |
| アプリの状態ストア (`store/`)                         | renderer-local で完結するため不要       |

---

## 依存関係

### 前提タスク（完了済み）

- **UT-W3-ANALYTICS-ADAPTER-001**: Analytics パイプライン基盤
  - `analyticsAdapter.ts` の実装完了
  - `getQueueSize()` / `isOptedOut()` / `getAnalyticsAdapter()` が利用可能

### 関連タスク（本タスク非依存）

- **UT-W3-ANALYTICS-HTTP-PROVIDER-001**: HTTP外部送信実装
  - 本タスクはキューサイズ表示のみで、実際の HTTP 送信は扱わない

---

## 設計制約

1. **IPC 追加禁止**: `analyticsAdapter.ts` を直接参照するため IPC チャネル追加不要
2. **Store 追加禁止**: Renderer-local で完結させる
3. **Preload 追加禁止**: 既存 `window.analyticsAPI` を間接利用（アダプター経由）
4. **NODE_ENV 分岐**: `AnalyticsDashboardPanel` コンポーネント内に閉じ込める
