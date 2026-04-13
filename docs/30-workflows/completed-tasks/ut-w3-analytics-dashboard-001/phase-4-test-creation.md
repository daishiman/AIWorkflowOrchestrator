# Phase 4: テスト作成（Red段階）

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 4                             |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 前提   | Phase 3（設計レビュー完了）   |
| 後続   | Phase 5（実装）               |
| 作成日 | 2026-04-13                    |
| Issue  | #2098                         |

## 目的

TDD の Red フェーズ。AC-1〜AC-5 を検証するテストコードを先に作成し、
現時点では失敗することを確認する。

- AC-1: 設定画面に `AnalyticsDashboardPanel` が統合されていること
- AC-2: オプトアウト状態の現在値（ON/OFF）が UI で確認できること
- AC-3: 開発モード（`NODE_ENV !== 'production'`）で dev-only 診断ブロックが表示されること
- AC-4: Playwright E2E テストが PASS すること
- AC-5: `pnpm typecheck && pnpm lint && pnpm test` が PASS すること

---

## 重要注意事項

- `window.analyticsAPI` のモックは不要。`AnalyticsDashboardPanel` は renderer-local の `analyticsAdapter` だけを使う。
- `vi.stubEnv("NODE_ENV", ...)` で dev / production を切り替える。
- `AnalyticsDashboardPanel` の dev-only 診断ブロックは `data-testid="event-log-viewer"` で確認する。
- renderer で node-only パッケージを直接 import しない。

---

## 実行タスク

- **タスク1**: 事前確認 — 既存テストユーティリティ重複検出・analyticsAdapter API 確認
- **タスク2**: テストマトリクス設計（T4-01〜T4-08）
- **タスク3**: `AnalyticsDashboardPanel.test.tsx` 新規作成（T4-01〜T4-06）
- **タスク4**: `SettingsView.test.tsx` への統合テスト追加（T4-07）
- **タスク5**: E2E テストファイル `analytics-dashboard.spec.ts` 新規作成（T4-08）
- **タスク6**: Red 確認（実装前の FAIL 確認）

---

## 参照資料

| 資料名                             | パス                                                  | 説明           |
| ---------------------------------- | ----------------------------------------------------- | -------------- |
| analyticsAdapter 実装              | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | `getQueueSi    |
| 受入基準AC-1〜AC-5定義             | `outputs/phase-1/acceptance-criteria.md`              | Phase 1 成果物 |
| P50チェック結果                    | `outputs/phase-1/p50-check-result.md`                 | Phase 1 成果物 |
| スコープ定義                       | `outputs/phase-1/scope-definition.md`                 | Phase 1 成果物 |
| 設計判断記録                       | `outputs/phase-2/design-decisions.md`                 | Phase 2 成果物 |
| コンポーネントインターフェース定義 | `outputs/phase-2/component-interface.md`              | Phase 2 成果物 |
| 設計レビュー結果（PASS）           | `outputs/phase-3/design-review-result.md`             | Phase 3 成果物 |
| MINOR指摘追跡テーブル（0件）       | `outputs/phase-3/minor-tracking.md`                   | Phase 3 成果物 |

ze`, `isOptedOut`API 確認  |
| SettingsView 実装         |`apps/desktop/src/renderer/views/SettingsView/index.tsx`              | 統合先コンポーネント                   |
| SettingsView テスト       |`apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`  | 既存テスト構造把握・モックパターン参照 |
| E2E settings テスト       |`apps/desktop/e2e/settings-integration-regression-screenshots.spec.ts` | E2E テスト構造参照 |

---

## テストマトリクス

| テストID | テスト対象              | テストケース                                                     | 期待結果                                                    | テストファイル                                 |
| -------- | ----------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| T4-01    | AnalyticsDashboardPanel | コンポーネントが設定画面にレンダリングされること                 | `data-testid="analytics-dashboard-panel"` が DOM に存在する | `AnalyticsDashboardPanel.test.tsx`             |
| T4-02    | AnalyticsDashboardPanel | `isOptedOut=true` のとき「オプトアウト中」ラベルが表示されること | テキスト「オプトアウト中」が visible                        | `AnalyticsDashboardPanel.test.tsx`             |
| T4-03    | AnalyticsDashboardPanel | `isOptedOut=false` のとき「有効」ラベルが表示されること          | テキスト「有効」が visible                                  | `AnalyticsDashboardPanel.test.tsx`             |
| T4-04    | AnalyticsDashboardPanel | `queuedEventCount` が表示されること                              | キューサイズ数値がレンダリング内に含まれる                  | `AnalyticsDashboardPanel.test.tsx`             |
| T4-05    | AnalyticsDashboardPanel | `NODE_ENV=development` のとき診断ブロックが表示されること        | `data-testid="event-log-viewer"` が visible                 | `AnalyticsDashboardPanel.test.tsx`             |
| T4-06    | AnalyticsDashboardPanel | `NODE_ENV=production` のとき診断ブロックが非表示であること       | `data-testid="event-log-viewer"` が DOM に存在しない        | `AnalyticsDashboardPanel.test.tsx`             |
| T4-07    | SettingsView            | analytics パネルが設定画面に含まれること                         | `analytics-dashboard-panel` が settings-view 内に存在する   | `SettingsView.test.tsx`                        |
| T4-08    | E2E（Playwright）       | 設定画面に analytics パネルが存在すること                        | `[data-testid="analytics-dashboard-panel"]` が visible      | `apps/desktop/e2e/analytics-dashboard.spec.ts` |

---

## 実行手順

### ステップ0: Phase 4 事前確認【必須】

```bash
# 1. 既存 analyticsAdapter テストのモックパターン確認
grep -n "vi.mock\|beforeEach\|describe" \
  apps/desktop/src/renderer/utils/__tests__/analyticsAdapter.test.ts | head -20

# 2. SettingsView テストのモックパターン確認
grep -n "vi.mock\|beforeEach\|describe" \
  apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx | head -30

# 3. SettingsView の既存 data-testid 一覧確認
grep -n "data-testid" \
  apps/desktop/src/renderer/views/SettingsView/index.tsx

# 4. AnalyticsDashboardPanel が既に存在するか確認
find apps/desktop/src/renderer -name "AnalyticsDashboardPanel*" 2>/dev/null
```

**事前確認チェックリスト**:

- [ ] `analyticsAdapter.ts` が `getAnalyticsAdapter()` 経由で状態を返す構造を確認済み
- [ ] `SettingsView` の `vi.mock` パターンを確認済み
- [ ] `AnalyticsDashboardPanel` が未実装であること（Red 前提）を確認済み

### ステップ1: `AnalyticsDashboardPanel.test.tsx` の作成

- 配置先: `apps/desktop/src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx`
- `vi.mock("../../utils/analyticsAdapter")` で `getAnalyticsAdapter()` をモックする
- `vi.stubEnv("NODE_ENV", "development")` / `vi.stubEnv("NODE_ENV", "production")` で分岐を検証する
- `data-testid="event-log-viewer"` は内部診断ブロックの有無だけを確認する

### ステップ2: `SettingsView.test.tsx` への統合テスト追加

- `AnalyticsDashboardPanel` を vi.mock でスタブ化する
- `settings-view` 内に `analytics-dashboard-panel` が入ることを確認する
- 既存の SettingsView ケースが壊れないことを確認する

### ステップ3: E2E テストファイル `analytics-dashboard.spec.ts`

- 設定画面遷移後に `data-testid="analytics-dashboard-panel"` が visible であることを確認する
- dev mode でのみ表示される診断ブロックは unit test 側で検証する

### ステップ4: Red 確認

```bash
# 追加したテストが Red であることを確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx

pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/SettingsView/SettingsView.test.tsx
```

---

## サブタスク管理

| ID     | タスク名                             | ステータス |
| ------ | ------------------------------------ | ---------- |
| T-04-1 | 事前確認                             | 未実施     |
| T-04-2 | テストマトリクス設計                 | 未実施     |
| T-04-3 | `AnalyticsDashboardPanel` テスト作成 | 未実施     |
| T-04-4 | `SettingsView` 統合テスト追加        | 未実施     |
| T-04-5 | E2E テスト作成                       | 未実施     |
| T-04-6 | Red 確認                             | 未実施     |

---

## 成果物

| 成果物           | 配置先                                | 形式     |
| ---------------- | ------------------------------------- | -------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`      | Markdown |
| Red 確認結果     | `outputs/phase-4/red-confirmation.md` | Markdown |

---

## 完了条件

- [ ] `AnalyticsDashboardPanel.test.tsx` に T4-01〜T4-06 が作成されていること
- [ ] `SettingsView.test.tsx` に T4-07 が作成されていること
- [ ] `analytics-dashboard.spec.ts` に T4-08 が作成されていること
- [ ] 追加テストが Red であることを確認済みであること
- [ ] `outputs/phase-4/` に全成果物が生成されていること

---

## 次Phase

**Phase 5: 実装** — `AnalyticsDashboardPanel` を実装し、SettingsView に統合して Phase 4 の Red テストを Green にする。

**Phase 4 開始条件**: 本 Phase の Red テストが準備済みであること。
