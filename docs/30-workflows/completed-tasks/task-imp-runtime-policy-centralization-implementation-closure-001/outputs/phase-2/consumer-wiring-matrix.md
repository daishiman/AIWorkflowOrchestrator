# Phase 2 Consumer Wiring Matrix

| 対象                                                | authority input                                                                                      | 出力                                       | 変更有無  | テスト証跡                                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                | `AuthKeyService`, `StubSubscriptionAuthProvider`, `createAuthModeService()`, `RuntimePolicyResolver` | handler 登録引数                           | 変更あり  | runtime tests / typecheck                                                                          |
| `apps/desktop/src/main/ipc/agentHandlers.ts`        | `IRuntimePolicyResolver`, `IAuthModeService`                                                         | `AgentStartResult`                         | 変更あり  | `agentHandlers.runtime.test.ts`, `agentHandlers.test.ts`                                           |
| `apps/desktop/src/main/ipc/skillHandlers.ts`        | `IRuntimePolicyResolver`, `IAuthModeService`                                                         | `SkillExecutionResponse`                   | 変更あり  | `skillHandlers.runtime.test.ts`, `skillHandlers.execute.test.ts`, `skillHandlers.contract.test.ts` |
| `apps/desktop/src/main/ipc/aiHandlers.ts`           | legacy route のまま                                                                                  | `ai:check-connection` / `llm:check-health` | no change | existing tests のまま、cleanup task 管轄                                                           |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | existing public surface                                                                              | runtime skill creator responses            | no change | existing runtime / preload tests を根拠に no-op                                                    |
| `packages/shared/src/types/*`                       | existing handoff / skill runtime transport                                                           | shared types                               | no change | Step 2 no-op 判定                                                                                  |
| `apps/desktop/src/preload/*`                        | existing IPC channel / API exposure                                                                  | renderer bridge                            | no change | Step 2 no-op 判定                                                                                  |

## authority 逆流防止ルール

- consumer は auth mode を自前推論しない。
- consumer は `manualRetryRule` を文字列正本として扱い、独自文言を生成しない。
- internal DI change を public IPC 更新済みと誤記しない。
