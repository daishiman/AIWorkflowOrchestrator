# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 6                             |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 前提   | Phase 5（Green 確認済み）     |
| 後続   | Phase 7（カバレッジ確認）     |
| 作成日 | 2026-04-13                    |
| Issue  | #2098                         |

## 目的

fail path、エッジケース、回帰ガードのテストを追加する。
Phase 5 で実装した `AnalyticsDashboardPanel` と `SettingsView` の正常系以外を検証し、
将来の回帰リスクを低減する。

---

## 実行タスク

- **タスク1**: 追加テストケース設計（T6-01〜T6-06）
- **タスク2**: `AnalyticsDashboardPanel.test.tsx` への fail path テスト追加
- **タスク3**: `SettingsView.test.tsx` への回帰ガード追加
- **タスク4**: E2E テスト追加（analytics-dashboard.spec.ts の拡充）
- **タスク5**: 追加テスト Green 確認

---

## 参照資料

| 資料名                        | パス                                                                         | 説明                        |
| ----------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| Phase 5 実装結果              | `outputs/phase-5/implementation-result.md`                                   | Green 確認済み実装の把握    |
| AnalyticsDashboardPanel       | `apps/desktop/src/renderer/components/analytics/AnalyticsDashboardPanel.tsx` | テスト対象実装              |
| SettingsView                  | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                     | テスト対象実装              |
| analyticsAdapter 実装         | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`                        | `QUEUE_MAX_SIZE=500` の確認 |
| テストマトリクスT4-01〜T4-08  | `outputs/phase-4/test-matrix.md`                                             | Phase 4 成果物              |
| Red確認結果                   | `outputs/phase-4/red-confirmation.md`                                        | Phase 4 成果物              |
| Green確認結果（全テストPASS） | `outputs/phase-5/green-confirmation.md`                                      | Phase 5 成果物              |

---

## 追加テストケース

| テストID | カテゴリ     | テストケース                                           | 期待結果                                                    | テストファイル                     |
| -------- | ------------ | ------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------- |
| T6-01    | エッジケース | キューが空（0件）の表示                                | キューサイズ `0` が表示されること                           | `AnalyticsDashboardPanel.test.tsx` |
| T6-02    | エッジケース | キューが上限（500件）の表示                            | キューサイズ `500` が正しく表示されること                   | `AnalyticsDashboardPanel.test.tsx` |
| T6-03    | 状態変化     | `isOptedOut` の変化が再レンダリングで反映される        | 最新の `isOptedOut()` 値が表示されること                    | `AnalyticsDashboardPanel.test.tsx` |
| T6-04    | dev-only     | 開発モードで診断ブロックが表示される                   | `data-testid="event-log-viewer"` が visible                 | `AnalyticsDashboardPanel.test.tsx` |
| T6-05    | production   | production で診断ブロックが表示されない                | `data-testid="event-log-viewer"` が DOM に存在しない        | `AnalyticsDashboardPanel.test.tsx` |
| T6-06    | 回帰ガード   | `AnalyticsDashboardPanel` が `SettingsView` に含まれる | `analytics-dashboard-panel` が `settings-view` 内に存在する | `SettingsView.test.tsx`            |

---

## 実行手順

### ステップ0: Phase 5 Green 状態確認【必須】

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx
```

- [ ] T4-01〜T4-08 が全て GREEN であることを確認済み

### ステップ1: `AnalyticsDashboardPanel.test.tsx` への fail path テスト追加

- T6-01/T6-02: queue size の境界値を確認する
- T6-03: `isOptedOut()` の再レンダリング反映を確認する
- T6-04/T6-05: dev / production の分岐を確認する

### ステップ2: `SettingsView.test.tsx` への回帰ガード追加

- T6-06: `AnalyticsDashboardPanel` が `SettingsView` に含まれることを確認する
- `SettingsView` の既存セクションが壊れていないことも合わせて確認する

### ステップ3: E2E テスト追加

`apps/desktop/e2e/analytics-dashboard.spec.ts` に、
設定画面に `analytics-dashboard-panel` が visible であることを追加する。

### ステップ4: 追加テスト Green 確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx
```

---

## 統合テスト連携

- T6-06 は `SettingsView.test.tsx` の既存テストと同一ファイルに追加する
- E2E は Phase 9 の品質ゲートで CI 上確認する

---

## サブタスク管理

| ID     | タスク名                                 | ステータス |
| ------ | ---------------------------------------- | ---------- |
| T-06-1 | 追加テストケース設計                     | 未実施     |
| T-06-2 | `AnalyticsDashboardPanel` へのテスト追加 | 未実施     |
| T-06-3 | `SettingsView` 回帰ガード追加            | 未実施     |
| T-06-4 | E2E 追加                                 | 未実施     |

---

## 成果物

| 成果物         | 配置先                                     | 形式     |
| -------------- | ------------------------------------------ | -------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | Markdown |

---

## 完了条件

- [ ] T6-01〜T6-06 が追加されていること
- [ ] `AnalyticsDashboardPanel.test.tsx` に境界値・分岐・再レンダリングの確認があること
- [ ] `SettingsView.test.tsx` に回帰ガードが追加されていること
- [ ] `analytics-dashboard.spec.ts` が拡充されていること
- [ ] `outputs/phase-6/` に全成果物が生成されていること

---

## 次Phase

**Phase 7: カバレッジ確認** — 新規コンポーネントと SettingsView のカバレッジを確認する。

**Phase 6 開始条件**: Phase 5 の全テストが GREEN であること。
