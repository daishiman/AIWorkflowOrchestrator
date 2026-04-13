# コンポーネントインターフェース定義

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 2 - 設計

---

## AnalyticsDashboardPanel

### Props インターフェース

```typescript
export interface AnalyticsDashboardPanelProps {
  className?: string;
}
```

最小限の Props 設計。データは `getAnalyticsAdapter()` から直接取得するため、
`isOptedOut` / `queueSize` を Props で受け取らない。

### data-testid 一覧

| testid                      | 要素                   | 表示条件                         |
| --------------------------- | ---------------------- | -------------------------------- |
| `analytics-dashboard-panel` | パネルルート `<div>`   | 常時                             |
| `analytics-opt-out-status`  | オプトアウト状態ラベル | 常時                             |
| `analytics-queue-size`      | キューサイズ数値       | 常時                             |
| `event-log-viewer`          | 診断ブロック           | `NODE_ENV !== "production"` のみ |

### 表示仕様

```
[Analytics ダッシュボード]
─────────────────────────────
収集状態: 有効 / オプトアウト中
キュー: 0 件

[開発モードのみ]
─────────────────────────────
診断情報
  アダプター初期化済み: はい
```

---

## モック境界（テスト設計）

### analyticsAdapter モック

```typescript
// AnalyticsDashboardPanel.test.tsx
import { vi } from "vitest";

vi.mock("../../utils/analyticsAdapter", () => ({
  getAnalyticsAdapter: vi.fn(),
}));

// 各テストで返り値を制御
import { getAnalyticsAdapter } from "../../utils/analyticsAdapter";

(getAnalyticsAdapter as ReturnType<typeof vi.fn>).mockReturnValue({
  isOptedOut: vi.fn(() => false),
  getQueueSize: vi.fn(() => 0),
});
```

### NODE_ENV モック

```typescript
// dev ブランチ確認
vi.stubEnv("NODE_ENV", "development");

// prod ブランチ確認
vi.stubEnv("NODE_ENV", "production");

// afterEach でリストア
afterEach(() => {
  vi.unstubAllEnvs();
});
```

---

## SettingsView への統合インターフェース

```typescript
// SettingsView/index.tsx への追加
import { AnalyticsDashboardPanel } from "../../components/analytics/AnalyticsDashboardPanel";

// JSX 内（RAG設定セクションの直後）
<section role="region" aria-labelledby="analytics-settings-heading">
  <SettingsCard
    title="Analytics ダッシュボード"
    description="分析データの収集状態を確認します"
    id="analytics-settings-heading"
  >
    <AnalyticsDashboardPanel />
  </SettingsCard>
</section>
```

---

## ファイルパス

| 役割               | パス                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| コンポーネント本体 | `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx`                |
| ユニットテスト     | `apps/desktop/src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx` |
| E2E テスト         | `apps/desktop/e2e/analytics-dashboard.spec.ts`                                              |
