# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 11                                                   |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

非視覚の state transition を、手動読解と snapshot 確認で追跡できる状態にする。

## 実行タスク

- `execute()` reject の state 保存を手順化する
- `success:false` で review に戻ることを手順化する
- verify fail review の prompt 保持を手順化する

## 参照資料

| 資料名          | パス                                                                                                        | 説明          |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ------------- |
| Phase 2 output  | `outputs/phase-2/failure-lifecycle-contract.md`                                                             | state 契約    |
| Phase 5 output  | `outputs/phase-5/implementation-log.md`                                                                     | 実装内容      |
| Phase 6 output  | `outputs/phase-6/test-expansion-result.md`                                                                  | ケース名      |
| Phase 7 output  | `outputs/phase-7/coverage-report.md`                                                                        | coverage 判定 |
| Phase 8 output  | `outputs/phase-8/refactoring-log.md`                                                                        | 互換性記録    |
| Phase 9 output  | `outputs/phase-9/quality-report.md`                                                                         | 品質判定      |
| engine test     | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                       | state 期待値  |
| facade test     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | facade 期待値 |
| Phase 10 output | `outputs/phase-10/final-review-summary.md`                                                                  | レビュー結果  |

## 統合テスト連携

- 手動確認は test snapshot の期待値をトレースして行う。
- Phase 12 はこの結果を implementation guide に反映する。

## 成果物

| 成果物                 | パス                                        | 説明           |
| ---------------------- | ------------------------------------------- | -------------- |
| 手動確認チェックリスト | `outputs/phase-11/manual-test-checklist.md` | 非視覚確認手順 |
| 手動確認結果           | `outputs/phase-11/manual-test-result.md`    | 確認結果       |

## 完了条件

- [x] reject path の確認手順が残っている
- [x] `success:false` path の確認手順が残っている
- [x] verify fail review path の確認手順が残っている
- [x] **本Phase内の全タスクを100%実行完了**
