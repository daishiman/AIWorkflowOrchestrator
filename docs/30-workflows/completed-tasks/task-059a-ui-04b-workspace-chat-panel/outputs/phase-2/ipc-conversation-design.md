# Phase 2 IPC / Conversation 設計

## 使用API

| API                                    | 用途                         |
| -------------------------------------- | ---------------------------- |
| `window.electronAPI.file.read`         | preview / context block 生成 |
| `window.electronAPI.llm.streamChat`    | stream 開始                  |
| `window.electronAPI.llm.cancelStream`  | stream 停止                  |
| `window.electronAPI.llm.onStreamChunk` | chunk 受信                   |
| `window.electronAPI.llm.onStreamEnd`   | end 受信                     |
| `window.electronAPI.llm.onStreamError` | error 受信                   |
| `window.conversationAPI.create`        | 会話作成                     |
| `window.conversationAPI.addMessage`    | user/assistant 永続化        |

## セキュリティ契約

- Renderer は preload API 経由のみ
- stream event は subscribe API のみ利用
- file context は明示選択ファイルに限定
