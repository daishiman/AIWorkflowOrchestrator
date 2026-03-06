# Phase 1 契約ドリフト台帳

## チャネル別差分

| チャネル             | Main 現状                                                                 | Preload / Renderer 現状                                              | ドリフト内容                            | 到達点                                          |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| `auth-mode:get`      | `IPCResponse<AuthMode>` で `data: "subscription"`                         | `AuthModeGetResponse` は `data.mode` を期待                          | data shape 不一致                       | `IPCResponse<{ mode: AuthMode }>`               |
| `auth-mode:set`      | request は `{ mode }`、response は `{ success }`、成功時 event は旧 shape | UI は `set` 後に `status` / `changed` で整合済み前提                 | `set` 自体は近いが副作用 event が旧契約 | request は維持し、成功後 event を新契約へ揃える |
| `auth-mode:status`   | `AuthStatus`: `isAuthenticated`, `hasCredentials`, `error`, `details`     | `AuthModeStatus`: `isValid`, `message`, `errorCode`, `lastCheckedAt` | DTO の項目と意味が不一致                | transport DTO を shared へ統一                  |
| `auth-mode:validate` | `AuthModeValidationResult`: `isValid`, `mode`, `hasCredentials`, `error`  | Renderer は `message`, `errorCode` を期待                            | status と validate が別 DTO             | `status` と同一 transport DTO                   |
| `auth-mode:changed`  | `{ previousMode, currentMode, timestamp, isAuthenticated }`               | `{ mode, status? }` を期待                                           | event payload shape 不一致              | `{ previousMode, mode, status, changedAt }`     |

## 型正本ドリフト

| ファイル                                                  | 現状                                                      | 問題                                      |
| --------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| `packages/shared/src/types/auth-mode.ts`                  | AuthMode / provider / 旧 IPC 型が混在                     | transport DTO が旧 shape のまま           |
| `apps/desktop/src/main/services/auth/types.ts`            | internal type と transport に近い情報が混在               | Main 内部型が公開面へ漏れやすい           |
| `apps/desktop/src/preload/types.ts`                       | UI 向け auth-mode DTO を独自再定義                        | shared と二重定義                         |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | AuthMode / AuthModeStatus / ValidationResult を独自再定義 | shared と三重定義、event shape も独自期待 |

## P31 / UI 初期化ドリフト

| 対象                                | 現状コード                                           | 仕様ドリフト                                                        |
| ----------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| `SettingsView`                      | 個別 selector + `useEffect([initializeAuthMode])`    | system spec に旧 `useRef` guard 記述が残っている                    |
| `store/index.ts`                    | `useAuthModeStore` は deprecated、個別 selector あり | system spec に削除済み hook path や旧 selector 数の記述が残っている |
| `infinite-loop-prevention.test.tsx` | 個別 selector 前提の回帰防波堤あり                   | ドキュメント側が現実装を十分反映していない                          |

## 非ドリフトだが固定が必要な事項

| 項目               | 現状                                        | 固定方針                                     |
| ------------------ | ------------------------------------------- | -------------------------------------------- |
| channel 名         | `auth-mode:get/set/status/validate/changed` | 変更しない                                   |
| whitelist          | `channels.ts` の invoke / on 許可に登録済み | 変更しない                                   |
| `validate` request | Main は `request?.mode` を許容              | 新契約でも optional を維持して後方互換を保つ |
