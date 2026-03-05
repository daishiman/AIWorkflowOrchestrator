# Phase 2 アーキテクチャ設計

## 目的

`auth-key:*` の IPC 契約を Main/Preload/Renderer で一貫動作させ、activate 再登録時も欠落しないライフサイクルにする。

## SubAgent設計分担（並列実施）

### SubAgent-A: Main/IPC責務

- `registerAllIpcHandlers` で AuthKey ハンドラを明示登録する。
- `unregisterAllIpcHandlers` で AuthKey ハンドラ状態を明示解除し、内部 `handlersRegistered` と整合させる。
- 既存の全チャネル一括 remove は継続し、冪等解除を維持する。

### SubAgent-B: Preload/API契約

- `authKey` API公開契約は変更しない（後方互換維持）。
- `ALLOWED_INVOKE_CHANNELS` の auth-key 4チャネルを維持する。

### SubAgent-C: Renderer/UX契約

- preflight の判定ロジックは据え置き。
- Main登録欠落の解消により、不要な `AUTHENTICATION_ERROR` を防止する。

### SubAgent-D: 統合監査

- Mainに登録責務、Preloadに公開責務、Rendererに利用責務を固定。
- 責務重複なし、依存方向 `Renderer -> Preload -> Main` を維持。

## コンポーネント設計

### 変更点

- `apps/desktop/src/main/ipc/index.ts`
  - import: `registerAuthKeyHandlers`, `unregisterAuthKeyHandlers`
  - 登録処理: `registerAuthModeHandlers` の前に `registerAuthKeyHandlers`
  - 解除処理: 一括解除前に `unregisterAuthKeyHandlers`

### 不変点

- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`
- `apps/desktop/src/main/ipc/authKeyHandlers.ts` のAPI契約

## ライフサイクルシーケンス

1. app ready
2. `registerAllIpcHandlers(mainWindow)`
3. `registerAuthKeyHandlers(mainWindow, authKeyService)`
4. Renderer preflight が `auth-key:exists` を呼び出し可能
5. macOS activate（window 0）時
6. `unregisterAllIpcHandlers()` -> `unregisterAuthKeyHandlers()` + 全チャンネル解除
7. `registerAllIpcHandlers(mainWindow)` で再登録
