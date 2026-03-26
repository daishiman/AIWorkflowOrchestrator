# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 1                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

`RuntimeSkillCreatorFacade.execute()` と `SkillCreatorWorkflowEngine` の失敗系 state lifecycle を、実装・テスト・成果物の3点で固定する。

## 実行タスク

- reject、`success:false`、verify fail review の3経路を要件として分解する
- `currentPhase`、`awaitingUserInput`、`verifyResult`、artifact 履歴の期待値を固定する
- 変更範囲を `apps/desktop` と親 workflow 文書に限定する

## 参照資料

| 資料名                | パス                                                                                                              | 説明                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------- |
| unassigned task       | `docs/30-workflows/completed-tasks/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md`     | 是正要求の正本       |
| parent ownership      | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md` | 親仕様の state owner |
| parent test expansion | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-6-test-expansion.md`           | 親仕様の test focus  |

## 統合テスト連携

- Phase 4 で FR-1〜FR-5 を test case に落とし込む。
- Phase 7 で requirement と test case の対応を再確認する。

## 成果物

| 成果物     | パス                                         | 説明                     |
| ---------- | -------------------------------------------- | ------------------------ |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | failure lifecycle の要件 |

## 完了条件

- [x] 3経路の failure lifecycle 要件が明記されている
- [x] 実装範囲と非対象範囲が明記されている
- [x] 親仕様との同期対象が明記されている
- [x] **本Phase内の全タスクを100%実行完了**
