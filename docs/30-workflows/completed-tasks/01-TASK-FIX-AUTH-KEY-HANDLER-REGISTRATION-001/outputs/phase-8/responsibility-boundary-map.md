# Phase 8 責務境界マップ

## コンテキスト

- 対象不具合: `auth-key:exists` 実行時 `No handler registered`
- 本修正: Main登録ライフサイクルへの `authKeyHandlers` 接続

## 境界定義

| レイヤー                                    | 主要責務                                 | 変更有無                    | 根拠                                                           |
| ------------------------------------------- | ---------------------------------------- | --------------------------- | -------------------------------------------------------------- |
| Main IPC統合 (`ipc/index.ts`)               | ハンドラ登録/解除順序の統括              | あり                        | `registerAuthKeyHandlers` / `unregisterAuthKeyHandlers` を接続 |
| Main個別ハンドラ (`authKeyHandlers.ts`)     | `auth-key:*` 4チャネル処理と内部状態管理 | なし（Phase 6でテスト補強） | `handlersRegistered` の冪等制御を維持                          |
| Preload (`preload/index.ts`, `channels.ts`) | Renderer公開APIとチャネル制御            | なし                        | 契約変更なし                                                   |
| Renderer preflight                          | 実行前認証判定                           | なし                        | `authKey.exists()` 呼び出し契約維持                            |

## 依存関係

| 依存元   | 依存先         | 契約                                                |
| -------- | -------------- | --------------------------------------------------- |
| Renderer | Preload        | `authKey.exists(): Promise<{ exists: boolean }>`    |
| Preload  | Main IPC       | `auth-key:exists` invoke                            |
| Main IPC | AuthKeyService | `hasKey() / setKey() / validateKey() / deleteKey()` |

## 境界整合判定

- 矛盾: なし
- 漏れ: なし
- 整合性: あり
- 依存関係: あり（循環依存なし）
