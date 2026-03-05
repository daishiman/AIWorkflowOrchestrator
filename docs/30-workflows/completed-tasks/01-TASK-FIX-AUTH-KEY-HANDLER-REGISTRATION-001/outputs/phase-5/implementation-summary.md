# Phase 5 実装サマリー

## 実装方針

- Redで失敗した2点（登録漏れ/解除漏れ）を最小差分で解消する。
- 既存契約（Preload/Renderer）には手を入れず、Main側ライフサイクルのみ修正する。

## 実装内容

1. `apps/desktop/src/main/ipc/index.ts`

- `registerAuthKeyHandlers` / `unregisterAuthKeyHandlers` をimport。
- `unregisterAllIpcHandlers()` の先頭で `unregisterAuthKeyHandlers()` を実行。
- `registerAllIpcHandlers()` 内で `AuthKeyService` 作成後に `registerAuthKeyHandlers(mainWindow, authKeyService)` を実行。

2. `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

- auth-key ライフサイクル検証テストを追加（Phase 4 Red -> Phase 5 Green）。

## Green結果

- `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/ipc-double-registration.test.ts`
- 結果: 13 passed / 0 failed

## 再発防止

- index統合テストに auth-key 登録/解除ライフサイクルの明示アサーションを保持。
