# Phase 2 アーキテクチャ設計

## 設計方針

- 認証キーの判定主体を `AuthKeyService` に一本化し、`preflight` と `skill execution` の参照元を一致させる。
- Main の Composition Root（`registerAllIpcHandlers`）で依存を生成し、各ハンドラへ DI する。
- 既存IPC契約は変更しない（内部配線のみ修正）。

## 責務境界（SubAgent別）

### SubAgent-A: Main/IPC

- `ipc/index.ts`
  - `AuthKeyService` 単一生成
  - `registerSkillHandlers(..., authKeyService)` へ注入
  - `registerAuthKeyHandlers` / `registerAuthModeHandlers` へ同一インスタンス注入

### SubAgent-B: Preload/API契約

- `safeInvokeUnwrap` による `errorCode -> Error.code` 転写契約維持
- `skill:execute` の Request/Response 形状維持

### SubAgent-C: Renderer/UX

- `auth-key:exists` preflight 呼び出しの既存挙動維持
- 事前判定と実行判定が同一キーソースを参照することで false negative を排除

### SubAgent-D: 統合監査

- Main 初期化順序の矛盾解消
- DI注入あり/なし経路の分裂解消

## 依存グラフ（修正後）

`registerAllIpcHandlers`
-> `AuthKeyService` (singleton)
-> `registerSkillHandlers(mainWindow, skillService, authKeyService)`
-> `SkillExecutor(mainWindow, permissionStore?, authKeyService)`
-> `SkillExecutor.getApiKey()`
-> `AuthKeyService.getKey()`

同時に:
`registerAuthKeyHandlers(mainWindow, authKeyService)`
`createAuthModeService(authKeyService)`

## シーケンス（要約）

1. Renderer が `auth-key:exists` を実行
2. AuthKeyService が store->env 順で判定
3. `exists=true` なら Renderer が `skill:execute` を実行
4. Main 側 SkillExecutor も同一 AuthKeyService で `getKey()`
5. 鍵未設定時のみ `AUTHENTICATION_ERROR`

## リスクと対策

- リスク: 既存2引数呼び出しが壊れる
- 対策: `authKeyService` を optional にする

- リスク: 初期化順変更で他ハンドラへ影響
- 対策: 既存テスト（ipc registration系）で回帰確認

- リスク: 契約破壊
- 対策: `skill:execute` の返却形状を変更しない
