# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 4                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

failure lifecycle を固定する Red 観点をテスト仕様へ落とし込む。

## 実行タスク

- engine の `success:false`、verify fail review、invalid transition、artifact append を定義する
- facade の reject path と `success:false` path を定義する
- targeted vitest 実行コマンドを固定する

## 参照資料

| 資料名                    | パス                                                                                                        | 説明         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ |
| engine test               | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                       | engine suite |
| facade orchestration test | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | facade suite |
| parent test expansion     | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`     | 親観点       |
| Phase 1 output            | `outputs/phase-1/requirements-definition.md`                                                                | 要件         |
| Phase 2 output            | `outputs/phase-2/failure-lifecycle-contract.md`                                                             | 契約         |
| Phase 3 output            | `outputs/phase-3/design-review-result.md`                                                                   | 優先順位     |

## 統合テスト連携

- Phase 5 の Green 実行はこのコマンドを使う。
- Phase 6 の test expansion はここで定義したケース名を引き継ぐ。

## 成果物

| 成果物     | パス                                    | 説明           |
| ---------- | --------------------------------------- | -------------- |
| テスト仕様 | `outputs/phase-4/test-specification.md` | 追加テスト一覧 |
| Redログ    | `outputs/phase-4/red-test-log.txt`      | 失敗観点の記録 |

## 完了条件

- [x] engine 側テスト観点が定義されている
- [x] facade 側テスト観点が定義されている
- [x] 実行コマンドが固定されている
- [x] **本Phase内の全タスクを100%実行完了**
