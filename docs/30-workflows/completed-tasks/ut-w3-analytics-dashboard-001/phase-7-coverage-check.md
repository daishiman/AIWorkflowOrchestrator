# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 7                             |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 前提   | Phase 6（テスト拡充完了）     |
| 後続   | Phase 8（リファクタリング）   |
| 作成日 | 2026-04-13                    |
| Issue  | #2098                         |

## 目的

新規実装した `AnalyticsDashboardPanel` と、修正した `SettingsView` の行カバレッジ・ブランチカバレッジを計測し、
目標値を達成していることを確認する。
未達の場合は Phase 6 に戻り、テストを補完する。

---

## 実行タスク

- **タスク1**: カバレッジ計測コマンドの実行
- **タスク2**: `AnalyticsDashboardPanel` のカバレッジ確認
- **タスク3**: `SettingsView` のカバレッジ確認
- **タスク4**: 未カバーブランチの特定
- **タスク5**: 目標達成判定とゲート判断

---

## 参照資料

| 資料名                       | パス                                                                         | 説明                       |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 6 テスト拡充結果       | `outputs/phase-6/test-expansion-result.md`                                   | 全テスト GREEN 確認        |
| AnalyticsDashboardPanel 実装 | `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx` | カバレッジ計測対象（新規） |
| SettingsView 実装            | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                     | カバレッジ計測対象（修正） |

---

## 実行手順

### ステップ1: カバレッジ計測

```bash
# 新規コンポーネントのカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx \
  --coverage \
  --coverage.include="src/renderer/components/analytics/AnalyticsDashboardPanel.tsx"

# SettingsView のカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  --coverage \
  --coverage.include="src/renderer/views/SettingsView/index.tsx"
```

### ステップ2: カバレッジ目標の確認

| 対象ファイル                                                    | 行カバレッジ目標 | ブランチカバレッジ目標 | 計測結果 |
| --------------------------------------------------------------- | ---------------- | ---------------------- | -------- |
| `src/renderer/components/analytics/AnalyticsDashboardPanel.tsx` | 80% 以上         | 70% 以上               | TBD      |
| `src/renderer/views/SettingsView/index.tsx`                     | 既存水準維持     | 既存水準維持           | TBD      |

### ステップ3: 重点確認ブランチ

| ブランチ                                | 対応テスト  | カバー済み |
| --------------------------------------- | ----------- | ---------- |
| `isOptedOut()` が `true` の場合         | T4-02       | TBD        |
| `isOptedOut()` が `false` の場合        | T4-03       | TBD        |
| `getQueueSize()` が `0` の場合          | T6-01       | TBD        |
| `getQueueSize()` が `500`（上限）の場合 | T6-02       | TBD        |
| `NODE_ENV !== "production"` の場合      | T4-05/T6-04 | TBD        |
| `NODE_ENV === "production"` の場合      | T4-06/T6-05 | TBD        |

### ステップ4: 未達の場合の対応

1. Phase 6 に戻り、未カバーブランチをカバーするテストを追加する
2. 追加後に再度カバレッジを計測する
3. 最大 2 回の反復で目標達成を目指す

### ステップ5: ゲート判定

| 状態                             | 判定 | 次のアクション             |
| -------------------------------- | ---- | -------------------------- |
| 全指標が最低基準以上             | PASS | Phase 8 へ進む             |
| SettingsView が既存水準を下回る  | FAIL | Phase 5/6 に戻り修正       |
| 新規コンポーネントが最低基準未満 | FAIL | Phase 6 に戻りテストを補完 |

---

## カバレッジ計測コマンド（全対象一括）

```bash
pnpm --filter @repo/desktop test --coverage --run
```

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-07-1 | カバレッジ計測実行                 | 未実施     |
| T-07-2 | 新規コンポーネントのカバレッジ分析 | 未実施     |
| T-07-3 | 修正コンポーネントのカバレッジ分析 | 未実施     |
| T-07-4 | 未カバーブランチの特定             | 未実施     |
| T-07-5 | ゲート判定                         | 未実施     |

---

## 成果物

| 成果物             | 配置先                               | 形式     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Markdown |

---

## 完了条件

- [ ] カバレッジ計測を実行済みであること
- [ ] `AnalyticsDashboardPanel.tsx` の行カバレッジが 80% 以上であること
- [ ] `AnalyticsDashboardPanel.tsx` のブランチカバレッジが 70% 以上であること
- [ ] `SettingsView/index.tsx` のカバレッジが既存水準を下回っていないこと
- [ ] 計測結果が `outputs/phase-7/coverage-report.md` に記録されていること
- [ ] ゲート判定（PASS/FAIL）が確定していること

---

## タスク100%実行確認【必須】

- [ ] T-07-1: カバレッジ計測を実行済み
- [ ] T-07-2: 新規コンポーネントのカバレッジを分析し `outputs/phase-7/coverage-report.md` に記録済み
- [ ] T-07-3: 修正コンポーネントのカバレッジを分析し既存水準との比較を記録済み
- [ ] T-07-4: 未カバーブランチを特定済み（なし or 一覧記録）
- [ ] T-07-5: ゲート判定を記録済み（PASS → Phase 8 へ）

---

## 次Phase

**Phase 8: リファクタリング** — 余計な抽象を増やさず、必要最小限の整理だけを行う。

**Phase 7 開始条件**: カバレッジゲートが PASS であること。
