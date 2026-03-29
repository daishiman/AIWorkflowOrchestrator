# System Spec Update Summary — TASK-RT-01

## 目的

TASK-RT-01 で追加された `plan()` エラー伝播契約（`LLMAdapterStatus` / `SkillCreatorErrorCode` / `RuntimeSkillCreatorPlanErrorResponse`）を、aiworkflow-requirements 正本へ反映する対象を特定する。

## 反映対象（exact path）

| 種別       | ファイル                                                                          | 反映内容                                                                                                                                                                   | ステータス |
| ---------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| IPC 契約   | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | `skill-creator:plan` の outer `IpcResult` と inner `RuntimeSkillCreatorPlanResponse` の二層契約、`LLM_ADAPTER_FAILED` / `LLM_ADAPTER_INITIALIZING`、`adapterStatus` を明記 | DONE       |
| アーキ概要 | `.agents/skills/aiworkflow-requirements/references/architecture-overview-core.md` | `RuntimeSkillCreatorFacade` の status/failure-reason surface と runtime degraded response 契約を追記                                                                       | DONE       |
| 変更台帳   | `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`    | TASK-RT-01 close-out 記録（error propagation 契約へ更新）を追加                                                                                                            | DONE       |

## 実装側エビデンス（反映根拠）

| ファイル                                                                   | 根拠                                                                                                                              |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                | `LLMAdapterStatus`, `SkillCreatorErrorCode`, `RuntimeSkillCreatorPlanErrorResponse`, `RuntimeSkillCreatorPlanResponse` union 拡張 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`      | `_llmAdapterStatus` / `_llmAdapterFailureReason` と `plan()` エラー分岐                                                           |
| `apps/desktop/src/main/ipc/index.ts`                                       | fire-and-forget 初期化失敗時の `setLLMAdapterFailed(reason)`                                                                      |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts` | outer/inner response 契約のテストケース                                                                                           |

## 判定

- Step 2（正本更新要否）: 必要
- 正本本文更新: 完了（3/3 DONE）
- 残課題: なし
