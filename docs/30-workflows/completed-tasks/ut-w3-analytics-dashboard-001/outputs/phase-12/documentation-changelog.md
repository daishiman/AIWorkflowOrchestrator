# Documentation Changelog

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 12

---

## 変更記録

| 変更                                      | Before                                 | After                                                             | 根拠                              |
| ----------------------------------------- | -------------------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| `ui-ux-settings-core.md`                  | Analytics Dashboard sectionなし        | `AnalyticsDashboardPanel` の表示契約を追加                        | Settings 正本への機能反映         |
| `AnalyticsDashboardPanel.tsx`             | `process.env.NODE_ENV` のみ            | `window.__analyticsDashboardDevMode` で visual capture 切替を追加 | Phase 11 の prod-hidden 証跡取得  |
| `AnalyticsDashboardPanel.test.tsx`        | T6-03 が unmount + render              | `rerender()` で同一マウント更新を検証                             | 状態変化の回帰検証強化            |
| `SettingsView/index.tsx`                  | Analytics セクションなし               | `AnalyticsDashboardPanel` を統合                                  | AC-1 の実装                       |
| `SettingsView.test.tsx`                   | analytics panel の統合確認なし         | `analytics-dashboard-panel` の回帰テスト追加                      | SettingsView への統合保証         |
| `wizard-tracking-stub.ts`                 | onboarding 専用 store モック           | `storeValues` で analytics opt-out も上書き可能に拡張             | E2E オーバーレイ解除と state 切替 |
| `analytics-dashboard.spec.ts`             | onboarding 未完了で overlay に阻まれる | onboarding 完了を事前注入して settings へ遷移                     | T4-08 の安定化                    |
| `analytics-dashboard-screenshots.spec.ts` | 2 枚のみ / 保存先ズレ                  | 5 枚撮影 + root `docs/` 配下へ保存                                | Phase 11 証跡の完全化             |

---

## 変更対象外

- `analyticsAdapter.ts` — 変更なし
- `trackEvent.ts` — 変更なし
- `analyticsHandler.ts` — 変更なし
- Preload API — 変更なし
- Zustand store — 変更なし
