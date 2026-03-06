# Phase 2 shared 型移行計画

## 実装順序

1. `shared`
2. `main`
3. `preload`
4. `renderer`
5. `tests`

## 手順別入口 / 出口条件

| 手順     | 入口条件                   | 出口条件                                                     |
| -------- | -------------------------- | ------------------------------------------------------------ |
| shared   | Phase 1 の正本候補確定済み | `auth-mode` transport DTO が shared に揃う                   |
| main     | shared export が確定       | handler adapter が shared DTO を返す                         |
| preload  | main contract が確定       | `preload/types.ts` の重複型が shared import に置換される     |
| renderer | preload contract が確定    | slice / SettingsView / selector が shared DTO 前提へ切替完了 |
| tests    | renderer contract が確定   | Main / Preload / Renderer / no-loop 回帰が green             |

## 置換順

| 順  | 置換内容                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------- |
| 1   | `packages/shared/src/types/auth-mode.ts` に transport DTO と error union を追加                         |
| 2   | `apps/desktop/src/main/services/auth/types.ts` で `AuthMode` と error code の重複を shared 参照へ寄せる |
| 3   | `apps/desktop/src/main/ipc/authModeHandlers.ts` に adapter helper を追加                                |
| 4   | `apps/desktop/src/preload/types.ts` の auth-mode 型再定義を shared import に置換                        |
| 5   | `apps/desktop/src/preload/index.ts` の `validate(request?)` と `onModeChanged` を shared DTO へ揃える   |
| 6   | `apps/desktop/src/renderer/store/slices/authModeSlice.ts` の重複型を削除                                |
| 7   | `SettingsView` と `AuthModeSelector` の型 import と表示契約を更新                                       |
| 8   | 関連テストを shared DTO 期待値へ更新                                                                    |
