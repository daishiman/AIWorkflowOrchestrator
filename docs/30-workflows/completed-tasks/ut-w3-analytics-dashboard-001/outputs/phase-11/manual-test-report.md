# 手動テストレポート

**タスクID**: UT-W3-ANALYTICS-DASHBOARD-001
**作成日**: 2026-04-13
**フェーズ**: Phase 11 - 手動テスト検証（VISUAL）

---

## 検証サマリー

| 検証区分           | 方法                                                                      | 結果       |
| ------------------ | ------------------------------------------------------------------------- | ---------- |
| Semantic（意味論） | ユニットテスト 46 件                                                      | ✅ 全 PASS |
| Visual（視覚）     | Playwright E2E + スクリーンショット 5 枚                                  | ✅ PASS    |
| AI UX              | 設定画面の情報優先度・補助情報の格下げをレビュー                          | ✅ PASS    |
| E2E 実行           | `analytics-dashboard.spec.ts` / `analytics-dashboard-screenshots.spec.ts` | ✅ PASS    |

---

## 3 層評価詳細

### Layer 1: Semantic（意味論的検証）

- `data-testid` は `analytics-dashboard-panel`, `analytics-opt-out-status`, `analytics-queue-size`, `event-log-viewer` を検証済み
- `<dl>/<dt>/<dd>` の構造で状態と数値を分離
- `SettingsView` 内への統合は `SettingsView.test.tsx` で回帰確認済み

### Layer 2: Visual（視覚的検証）

- 設定画面の既存カードパターンと整合
- オプトアウト状態は色で区別し、数値は `tabular-nums` で安定表示
- dev-only 診断ブロックは破線ボーダーで補助情報として格下げ

### Layer 3: AI UX（Apple HIG 観点）

- 主要情報を上、診断情報を下に置き、視線誘導を乱さない
- 設定画面に自然に溶け込む控えめなパネルとして表現
- 5 枚のスクリーンショットで dev/prod と opt-out の差分を確認済み

---

## 補足

- onboarding モーダルは `injectOnboardingStoreMock()` で事前完了扱いにして、設定画面の操作を安定化した
- `window.__analyticsDashboardDevMode` はスクリーンショット用の表示フックとしてのみ使用
