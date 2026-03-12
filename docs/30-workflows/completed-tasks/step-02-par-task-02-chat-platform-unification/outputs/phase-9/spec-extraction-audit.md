# 仕様抽出監査

## 参照した正本

- `interfaces-chat-history.md`
- `llm-workspace-chat-edit.md`
- `arch-state-management.md`
- `llm-ipc-types.md`
- `llm-streaming.md`

## 抽出と実装の対応

- history/session 粒度 -> `ChatSessionRecord`
- workspace 文脈注入 -> `buildWorkspaceChatContext`
- stream IPC -> `ensureStreamListeners`, `abortStreaming`
- state/persist -> `store/index.ts`

## 監査判定

- PASS
- 根拠追跡不能な実装差分はなし
