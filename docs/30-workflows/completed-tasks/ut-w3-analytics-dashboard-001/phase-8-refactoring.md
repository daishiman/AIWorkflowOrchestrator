# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 8                             |
| 機能名 | UT-W3-ANALYTICS-DASHBOARD-001 |
| 作成日 | 2026-04-13                    |

## 目的

コードの重複排除、命名一貫性の確保、責務分離を行う。
ただし本タスクでは、`AnalyticsDashboardPanel` が十分に小さいなら追加のフック抽出やファイル分割は行わない。

---

## 実行タスク

- **タスク1**: コンポーネントの責務確認
- **タスク2**: 必要最小限のヘルパー抽出の検討
- **タスク3**: 型定義の整理
- **タスク4**: リファクタ後のテスト継続成功を確認

---

## 参照資料

| 資料名                        | パス                                                  | 説明                                |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------- |
| Phase 7 カバレッジレポート    | `outputs/phase-7/coverage-report.md`                  | PASS 判定確認                       |
| Phase 2 設計決定記録          | `outputs/phase-2/design-decisions.md`                 | 設計意図の確認                      |
| analyticsAdapter 実装         | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | renderer-local analytics アダプター |
| 実装結果                      | `outputs/phase-5/implementation-result.md`            | Phase 5 成果物                      |
| Green確認結果（全テストPASS） | `outputs/phase-5/green-confirmation.md`               | Phase 5 成果物                      |

---

## リファクタリング候補

| 対象                  | Before                     | After                                          | 理由                           |
| --------------------- | -------------------------- | ---------------------------------------------- | ------------------------------ |
| コンポーネントの責務  | 設定画面にロジックが混在   | `AnalyticsDashboardPanel` に集約               | 単一責務原則・読みやすさの向上 |
| 型定義の整理          | インラインで型が散在       | 必要なら `AnalyticsDashboardPanelProps` に集約 | 変更影響範囲の限定             |
| NODE_ENV 分岐ロジック | コンポーネント内に直接記述 | 必要なら小さなローカル定数に整理               | テスト容易性と可読性の両立     |

---

## 実行手順

### ステップ1: リファクタリング対象の特定

```bash
grep -rn "getQueueSize\|isOptedOut\|event-log-viewer" \
  apps/desktop/src/renderer/components/analytics/

grep -rn "AnalyticsDashboardPanel" \
  apps/desktop/src/renderer/views/SettingsView/
```

### ステップ2: 必要最小限の整理

- 余計なロジックを `AnalyticsDashboardPanel` から外に出しすぎない
- `NODE_ENV` 分岐が 1 箇所にまとまっているか確認する
- もし重複がなければ、この Phase は「不要」と記録して終える

### ステップ3: リファクタ後の統合テスト確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/analytics/__tests__/AnalyticsDashboardPanel.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx

pnpm --filter @repo/desktop typecheck
```

---

## サブタスク管理

| ID     | タスク名                     | ステータス |
| ------ | ---------------------------- | ---------- |
| T-08-1 | リファクタ対象の特定         | 未実施     |
| T-08-2 | 必要最小限の整理             | 未実施     |
| T-08-3 | リファクタ後の統合テスト確認 | 未実施     |

---

## 成果物

| 成果物         | 配置先                                  | 形式     |
| -------------- | --------------------------------------- | -------- |
| リファクタ結果 | `outputs/phase-8/refactoring-result.md` | Markdown |

---

## 完了条件

- [ ] `AnalyticsDashboardPanel` が不必要に分割されていないこと
- [ ] `NODE_ENV` 分岐が 1 箇所にまとまっていること
- [ ] リファクタ後も全テストが GREEN であること
- [ ] リファクタ後も `pnpm --filter @repo/desktop typecheck` が PASS であること
- [ ] `outputs/phase-8/refactoring-result.md` に作業内容が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-08-1: リファクタ対象を特定し記録済み
- [ ] T-08-2: 必要最小限の整理を完了済み（または不要と判断記録済み）
- [ ] T-08-3: リファクタ後の統合テスト（全 GREEN・typecheck PASS）を確認済み

---

## 次Phase

**Phase 9: 品質保証** — typecheck / lint / 全テスト実行の最終品質チェックを行う。

**Phase 9 開始条件**: Phase 8 の全完了条件を満たすこと。
