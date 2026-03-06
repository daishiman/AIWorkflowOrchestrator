# Phase 5 変更対象ファイル表

## code

| ファイル                                                                   | 目的                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `packages/shared/src/types/auth-mode.ts`                                   | transport DTO 正本化                                         |
| `apps/desktop/src/main/services/auth/types.ts`                             | `AuthMode` / error code の shared 参照化                     |
| `apps/desktop/src/main/ipc/authModeHandlers.ts`                            | internal-to-transport adapter 実装                           |
| `apps/desktop/src/main/services/auth/SubscriptionAuthProvider.ts`          | guidance 根拠確認対象。今回は原則 non-functional change なし |
| `apps/desktop/src/preload/types.ts`                                        | auth-mode 型再定義削除                                       |
| `apps/desktop/src/preload/index.ts`                                        | `validate(request?)` と `onModeChanged` の契約整合           |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                  | shared DTO 適用、listener 更新                               |
| `apps/desktop/src/renderer/store/index.ts`                                 | selector export 維持確認                                     |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | message / errorCode / guidance 表示                          |
| `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | shared `AuthMode` 参照化                                     |

## test

| ファイル                                                                       | 目的                              |
| ------------------------------------------------------------------------------ | --------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                 | new transport DTO 固定            |
| `apps/desktop/src/preload/__tests__/authModeApi.contract.test.ts`              | preload 公開面固定                |
| `apps/desktop/src/preload/channels.test.ts`                                    | whitelist 維持確認                |
| `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`       | status / validate / listener 更新 |
| `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.error.test.ts` | fallback DTO 更新                 |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`           | errorCode / guidance 表示更新     |
| `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`        | no-loop 維持確認                  |
