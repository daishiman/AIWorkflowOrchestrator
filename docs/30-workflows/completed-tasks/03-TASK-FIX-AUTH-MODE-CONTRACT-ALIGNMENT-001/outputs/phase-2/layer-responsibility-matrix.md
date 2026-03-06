# Phase 2 層責務表

| 層       | 所有物                                                                                      | 禁止事項                                     | 実装ポイント                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| shared   | `AuthMode`, `AuthModeErrorCode`, `AuthModeStatus`, `AuthModeChangedEvent`, `IPCResponse<T>` | Renderer 都合の派生型追加                    | `packages/shared/src/types/auth-mode.ts`                                                        |
| main     | `AuthStatus`, `AuthModeStatusError`, provider state, adapter                                | shared transport 型の再定義                  | `apps/desktop/src/main/services/auth/types.ts`, `apps/desktop/src/main/ipc/authModeHandlers.ts` |
| preload  | `ElectronAPI.authMode` のシグネチャ                                                         | transport DTO の独自定義                     | `apps/desktop/src/preload/index.ts`, `apps/desktop/src/preload/types.ts`                        |
| renderer | state, selector, UI 表示、ローカルメッセージ変換                                            | transport DTO の再定義、合成 hook への逆戻り | `authModeSlice.ts`, `store/index.ts`, `SettingsView`, `AuthModeSelector`                        |

## データ流れ

1. shared が DTO を定義する。
2. main が internal status を shared DTO へ変換する。
3. preload が DTO をそのまま Renderer へ橋渡しする。
4. renderer が DTO を state と UI に反映する。

## Phase 12 更新順

1. `interfaces-auth.md`
2. `api-ipc-system.md`
3. `security-electron-ipc.md`
4. `arch-state-management.md`
5. `error-handling.md`
6. `development-guidelines.md`
7. `patterns.md`
8. `testing-component-patterns.md`
9. `task-workflow.md`
10. `lessons-learned.md`
11. `LOGS.md` 2ファイル
12. `topic-map.md`
