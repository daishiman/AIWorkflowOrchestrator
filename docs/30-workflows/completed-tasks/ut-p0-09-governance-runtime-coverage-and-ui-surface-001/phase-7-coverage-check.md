# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 7                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

テストカバレッジが目標値（Line 80%+, Branch 60%+, Function 80%+）を達成しているか確認する。

## 実行タスク

- タスク1: カバレッジ計測実行
- タスク2: 目標未達箇所の特定と対応
- タスク3: カバレッジレポート作成

## 参照資料

| 資料名             | パス                                        | 説明                   |
| ------------------ | ------------------------------------------- | ---------------------- |
| Phase 6 テスト拡充 | `outputs/phase-6/test-expansion-summary.md` | 追加テストの根拠       |
| Phase 5 実装記録   | `outputs/phase-5/implementation-record.md`  | 実装後の current facts |

## 実行手順

### ステップ1: カバレッジ計測

```bash
pnpm --filter @repo/desktop test -- --coverage --run
```

対象ファイル:

- `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`
- `apps/desktop/src/main/services/runtime/governance/`（既存ファイル）

### ステップ2: 目標値確認

| 対象                     | Line 目標 | Branch 目標 | Function 目標 |
| ------------------------ | --------- | ----------- | ------------- |
| GovernanceSummaryPanel   | 80%+      | 60%+        | 80%+          |
| GovernanceAllPhases 配線 | 80%+      | 60%+        | 80%+          |

### ステップ3: 未達箇所への対応

未達の場合は Phase 6 でテストを追加するか、実装を簡素化する。

## 統合テスト連携

- `pnpm --filter @repo/desktop test -- --coverage --run` の結果を `coverage-report.md` に反映する
- `GovernanceSummaryPanel` と `GovernanceAllPhases` の両方を対象にする

## 成果物

| 成果物             | パス                                 | 説明     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果 |

## 完了条件

- [ ] GovernanceSummaryPanel の Line 80%+ 達成
- [ ] GovernanceSummaryPanel の Branch 60%+ 達成
- [ ] GovernanceSummaryPanel の Function 80%+ 達成
- [ ] カバレッジレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
