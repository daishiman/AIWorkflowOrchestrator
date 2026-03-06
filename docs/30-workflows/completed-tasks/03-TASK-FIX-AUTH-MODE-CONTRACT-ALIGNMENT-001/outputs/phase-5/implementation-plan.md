# Phase 5 実装計画

## 実装順序

1. shared: `packages/shared/src/types/auth-mode.ts`
2. main: `apps/desktop/src/main/services/auth/types.ts`, `apps/desktop/src/main/ipc/authModeHandlers.ts`
3. preload: `apps/desktop/src/preload/types.ts`, `apps/desktop/src/preload/index.ts`
4. renderer: `authModeSlice.ts`, `SettingsView`, `AuthModeSelector`, `store/index.ts`
5. tests: Main / Preload / Renderer / no-loop

## SubAgent 別作業

| SubAgent                | 作業                                                  |
| ----------------------- | ----------------------------------------------------- |
| SubAgent-Contract-Main  | shared DTO 正本化、main adapter 実装、sender 順序維持 |
| SubAgent-Bridge-Preload | preload 型再定義削除、`validate(request?)` 公開面更新 |
| SubAgent-Renderer-State | slice / SettingsView / selector / UI 表示更新         |
| SubAgent-Spec-Sync      | 実装証跡、coverage、Phase 12 同期準備                 |

## 実装判断

- `status` と `validate` は同一 DTO を返す。
- `changed` event は `status` を内包し、listener 側で旧フィールド依存をやめる。
- `SettingsView` は status の `message` に加えて `errorCode` / `guidance` を表示できるようにする。
