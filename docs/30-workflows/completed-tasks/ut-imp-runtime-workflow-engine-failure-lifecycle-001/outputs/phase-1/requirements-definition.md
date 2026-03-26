# Phase 1 Requirements Definition

## 目的

`RuntimeSkillCreatorFacade.execute()` と `SkillCreatorWorkflowEngine` の失敗系 lifecycle を、review 再突入まで含めて固定する。

## 要件

| ID   | 要件               | 期待値                                                                                            |
| ---- | ------------------ | ------------------------------------------------------------------------------------------------- |
| FR-1 | executor reject    | `currentPhase=review`、`verifyResult.status=fail`、`awaitingUserInput.reason=verification_review` |
| FR-2 | `success:false`    | `verify/pending` へ進めず `review` に戻る                                                         |
| FR-3 | verify fail review | `verification_review` prompt を保持する                                                           |
| FR-4 | invalid transition | 例外で拒否する                                                                                    |
| FR-5 | artifact history   | 同一 kind でも append で履歴を残す                                                                |

## 非対象

- `apps/backend` 実装
- `packages/shared` 実装
- PR 作成
