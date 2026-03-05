# Phase 5 契約差分

## IPC外部契約差分

- なし（チャネル名・引数・戻り値は変更なし）

## 実行時契約差分（挙動）

| 項目                     | 変更前                | 変更後                                       |
| ------------------------ | --------------------- | -------------------------------------------- |
| 起動時 `auth-key:*` 登録 | index経由で未保証     | `registerAllIpcHandlers` で明示登録          |
| 解除時の状態同期         | 全チャンネル解除のみ  | `unregisterAuthKeyHandlers` で内部フラグ同期 |
| activate再登録           | auth-key 再登録未保証 | 再登録保証                                   |

## 互換性評価

- Preload API: 互換
- Renderer preflight: 互換（失敗原因のみ解消）
- AuthKeyService型: 互換
