# テストマトリクス

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 4 - テスト作成（Red段階）

---

## テストマトリクス（T4-01〜T4-08）

| ID    | 対象                    | テストケース                 | 期待結果                                            | ファイル                         |
| ----- | ----------------------- | ---------------------------- | --------------------------------------------------- | -------------------------------- |
| T4-01 | AnalyticsDashboardPanel | コンポーネントがレンダリング | `data-testid="analytics-dashboard-panel"` 存在      | AnalyticsDashboardPanel.test.tsx |
| T4-02 | AnalyticsDashboardPanel | `isOptedOut=true`            | 「オプトアウト中」ラベル visible                    | AnalyticsDashboardPanel.test.tsx |
| T4-03 | AnalyticsDashboardPanel | `isOptedOut=false`           | 「有効」ラベル visible                              | AnalyticsDashboardPanel.test.tsx |
| T4-04 | AnalyticsDashboardPanel | `queueSize=5`                | キューサイズ数値 `5` がレンダリング                 | AnalyticsDashboardPanel.test.tsx |
| T4-05 | AnalyticsDashboardPanel | `NODE_ENV=development`       | `data-testid="event-log-viewer"` visible            | AnalyticsDashboardPanel.test.tsx |
| T4-06 | AnalyticsDashboardPanel | `NODE_ENV=production`        | `data-testid="event-log-viewer"` 非表示             | AnalyticsDashboardPanel.test.tsx |
| T4-07 | SettingsView            | analytics パネル統合         | `analytics-dashboard-panel` in `settings-view`      | SettingsView.test.tsx            |
| T4-08 | E2E（Playwright）       | 設定画面にパネル存在         | `[data-testid="analytics-dashboard-panel"]` visible | analytics-dashboard.spec.ts      |

---

## 作成対象ファイル

| ファイル                                                                                    | 種別                        | 対象テスト   |
| ------------------------------------------------------------------------------------------- | --------------------------- | ------------ |
| `apps/desktop/src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx` | 新規                        | T4-01〜T4-06 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                        | 修正（mock追加・T4-07追加） | T4-07        |
| `apps/desktop/e2e/analytics-dashboard.spec.ts`                                              | 新規                        | T4-08        |

---

## モック設計

```typescript
// analyticsAdapter モック
vi.mock("../../../utils/analyticsAdapter", () => ({
  getAnalyticsAdapter: vi.fn(),
}));

// NODE_ENV 制御
vi.stubEnv("NODE_ENV", "development"); // または "production"
afterEach(() => vi.unstubAllEnvs());
```
