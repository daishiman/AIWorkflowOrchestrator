# Phase 4 統合テスト計画

## 統合対象

- Main: `registerAllIpcHandlers` / `unregisterAllIpcHandlers`
- Main(AuthKey): `registerAuthKeyHandlers` / `unregisterAuthKeyHandlers`
- Preload: `authKey.exists`
- Renderer: `preflightSkillExecutionAuth`

## シナリオ

1. 起動登録

- 手順: `registerAllIpcHandlers` 実行
- 期待: auth-key 4チャネルが使用可能

2. 再登録

- 手順: `unregisterAllIpcHandlers` -> `registerAllIpcHandlers`
- 期待: auth-key 4チャネルが再利用可能

3. preflight連携

- 手順: Renderer preflight から `authKey.exists` 呼び出し
- 期待: `No handler registered` が発生しない

## 実行順

- SubAgent-A/B/Cでケース設計を並列化
- SubAgent-Dで順序確定（1 -> 2 -> 3）

## Phase 5への入力

- Red失敗2件を Green 化する実装を Main IPC index に追加する
