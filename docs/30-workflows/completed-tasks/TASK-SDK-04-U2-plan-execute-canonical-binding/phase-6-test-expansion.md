# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| Phase名    | テスト拡充                                    |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 5: 実装                                 |
| 次Phase    | Phase 7: カバレッジ確認                       |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

最小修正で見落としやすい cancel、re-review、draft 再編集の境界条件を補強する。

## 実行タスク

### Task 1: 境界ケース追加

- review 後に複数回 draft を変更する
- cancel 後に再 plan したときの snapshot 差し替えを確認する

### Task 2: 既存機能保護

- terminal handoff path を再確認する
- skill review 周辺の state clear と競合しないことを確認する

## 参照資料

| 資料名   | パス                                                                                               | 説明           |
| -------- | -------------------------------------------------------------------------------------------------- | -------------- |
| 実装記録 | `phase-5-implementation.md`                                                                        | 実装後の観測点 |
| テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 追加先         |

## 統合テスト連携

- approved snapshot が stale にならないことを連続操作で確認する
- clear 系 hook と execute 系 hook の競合がないことを検証する

## 成果物

| 成果物         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md` | 境界ケース一覧 |

## 完了条件

- [ ] 境界ケースが追加されている
- [ ] 既存 handoff path の回帰がない
- [ ] stale snapshot の再発防止が確認されている
- [ ] 追加観点が成果物に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
