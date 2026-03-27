# Phase 5 Implementation Order

## 実施順

1. `apps/desktop/src/main/ipc/index.ts`
2. `apps/desktop/src/main/ipc/agentHandlers.ts`
3. `apps/desktop/src/main/ipc/skillHandlers.ts`
4. `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`
5. `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`
6. targeted regression suites と `typecheck`

## 変更内容

| 順番 | 変更                                                                                                                    | 理由                                       |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1    | `AuthKeyService` と `StubSubscriptionAuthProvider` から `createAuthModeService()` と `RuntimePolicyResolver` を共通生成 | authority を 1 箇所で配線するため          |
| 2    | Agent handler が `resolveWithService(authModeService.getMode())` を参照                                                 | local resolver 依存を排除するため          |
| 3    | Skill handler が同じ decision path を参照                                                                               | Agent / Skill の vocabulary を合わせるため |
| 4    | runtime tests を `integrated_api` / `terminal_handoff` へ更新                                                           | central policy contract に合わせるため     |
| 5    | baseline suite と typecheck を通す                                                                                      | backward compatibility を確認するため      |

## no-op 実装

- public preload / shared 型は触っていない。
- `aiHandlers.ts` は cleanup 条件確定のみで、コード削除は行っていない。
