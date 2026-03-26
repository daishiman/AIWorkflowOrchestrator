# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 6                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

Phase 4 のテスト仕様を実際の追加ケースまで拡張したことを固定する。

## 実行タスク

- engine の追加4ケースを結果へ反映する
- facade の追加2ケースを結果へ反映する
- parent workflow の test expansion 文書を実装結果へ同期する

## 参照資料

| 資料名                    | パス                                                                                                                    | 説明           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine test               | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                                   | 実装済みケース |
| facade orchestration test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`             | 実装済みケース |
| parent summary            | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-6/test-expansion-summary.md` | 親成果物       |
| Phase 5 output            | `outputs/phase-5/implementation-log.md`                                                                                 | 実装結果       |

## 統合テスト連携

- Phase 7 はここで整理した追加ケースを requirement と突合する。
- Phase 9 は PASS / FAIL の切り分けにこの結果を使う。

## 成果物

| 成果物         | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | 追加ケース一覧 |

## 完了条件

- [x] engine と facade の追加ケースが記録されている
- [x] 親 workflow の test expansion 文書が同期されている
- [x] 回帰ケースが整理されている
- [x] **本Phase内の全タスクを100%実行完了**
