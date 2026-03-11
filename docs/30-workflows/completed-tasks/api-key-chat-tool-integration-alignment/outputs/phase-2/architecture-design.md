# Phase 2 設計書

## 設計方針

1. キー保存契約の単一正本化
2. チャット実行経路の選択値統一
3. AuthKey状態の明示化

## 層別変更

| 層       | 変更                                                          |
| -------- | ------------------------------------------------------------- |
| Main     | `secureStorage` を `api-keys` 参照Facade化                    |
| IPC      | `llm:set-selected-config` 追加、`auth-key:exists` 拡張        |
| Preload  | 新チャネル公開、request/response型更新                        |
| Renderer | `llmSlice` で選択状態をMainへ同期、`chatSlice` が選択値を送信 |
| UI       | Settings で `auth-mode=api-key` 時に `AuthKeySection` 表示    |
