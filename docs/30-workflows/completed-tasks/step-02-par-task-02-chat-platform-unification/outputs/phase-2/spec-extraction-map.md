# 仕様抽出マップ

| 参照仕様                     | 抽出した契約                              | 実装反映                                          |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `interfaces-chat-history.md` | session/message DTO 粒度                  | `ChatSessionRecord`, `ChatMessage`                |
| `llm-workspace-chat-edit.md` | Workspace 文脈注入                        | `buildWorkspaceChatContext`                       |
| `arch-state-management.md`   | slice 境界 / persist                      | `chatSlice`, `store/index.ts`                     |
| `llm-ipc-types.md`           | `streamChat`, `cancelStream`, error shape | `sendMessage`, `abortStreaming`, `StreamingError` |
| `llm-streaming.md`           | chunk/end/error の listener contract      | `ensureStreamListeners()`                         |

## 実装に使わなかったもの

- 履歴 API 側の conversation persistence は Task02 の外へ残した。
