# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 8                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

guard と append 戦略を既存正常系と両立する構造へ整える。

## 実行タスク

- `ensureReviewReadyState` で既存の plan 起点フローとの互換を確保する
- append helper と transition guard を分離する
- test で壊れた既存経路を再成立させる

## 参照資料

| 資料名         | パス                                                                                                        | 説明           |
| -------------- | ----------------------------------------------------------------------------------------------------------- | -------------- |
| engine 実装    | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                      | リファクタ対象 |
| facade test    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | 互換確認       |
| Phase 1 output | `outputs/phase-1/requirements-definition.md`                                                                | 要件           |
| Phase 2 output | `outputs/phase-2/failure-lifecycle-contract.md`                                                             | 契約           |
| Phase 5 output | `outputs/phase-5/implementation-log.md`                                                                     | 実装内容       |
| Phase 6 output | `outputs/phase-6/test-expansion-result.md`                                                                  | 追加ケース     |
| Phase 7 output | `outputs/phase-7/coverage-report.md`                                                                        | coverage 判定  |

## 統合テスト連携

- リファクタ後も Phase 5 の targeted command を再利用する。
- Phase 10 はこの互換性記録を review 根拠にする。

## 成果物

| 成果物               | パス                                 | 説明             |
| -------------------- | ------------------------------------ | ---------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 互換性対応の記録 |

## 完了条件

- [x] transition guard と互換処理が分離されている
- [x] append 戦略が helper に集約されている
- [x] 既存 plan 起点フローが再成立している
- [x] **本Phase内の全タスクを100%実行完了**
