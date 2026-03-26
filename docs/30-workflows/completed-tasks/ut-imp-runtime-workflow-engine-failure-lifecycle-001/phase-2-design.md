# Phase 2: 設計

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 2                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系でも state owner が一貫する phase transition と artifact 戦略を定義する。

## 実行タスク

- `plan -> review -> execute -> verify/improve` に加えて `execute -> review` を設計に含める
- `verification_review` の prompt 生成責務を engine に置く
- phase artifacts を append 戦略で固定する

## 参照資料

| 資料名           | パス                                                                                                              | 説明                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| engine 実装      | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                            | phase owner の実装     |
| facade 実装      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                             | public entrypoint      |
| parent ownership | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | 親仕様との同期元       |
| Phase 1 output   | `outputs/phase-1/requirements-definition.md`                                                                      | failure lifecycle 要件 |

## 統合テスト連携

- Phase 4 の test specification はこの契約表を正本として参照する。
- Phase 6 の追加テスト結果は append 戦略と transition guard を直接検証する。

## 成果物

| 成果物                 | パス                                            | 説明                      |
| ---------------------- | ----------------------------------------------- | ------------------------- |
| failure lifecycle 契約 | `outputs/phase-2/failure-lifecycle-contract.md` | 3経路の state 保存契約    |
| ownership matrix       | `outputs/phase-2/ownership-matrix.md`           | owner と transition guard |

## 完了条件

- [x] `execute -> review` の遷移条件が定義されている
- [x] `verification_review` の payload owner が定義されている
- [x] artifact append 方針が定義されている
- [x] **本Phase内の全タスクを100%実行完了**
