# Mode 状態遷移

| イベント                              | 現在状態       | 次状態                         | 備考                          |
| ------------------------------------- | -------------- | ------------------------------ | ----------------------------- |
| 初期化                                | なし           | general session 作成           | welcome message 付き          |
| `activateChatMode("workspace")`       | any            | workspace session active       | 既存 session があれば再利用   |
| `activateChatMode("skill-lifecycle")` | any            | skill-lifecycle session active | context merge                 |
| `resumeChatSession(id)`               | any            | `id` の mode                   | recent rail から復帰          |
| `sendMessage()`                       | active session | streaming 中                   | placeholder assistant を追加  |
| `appendStreamChunk()`                 | streaming 中   | streaming 継続                 | placeholder content 更新      |
| `endStreaming()`                      | streaming 中   | idle                           | error/null, placeholder fix   |
| `abortStreaming()`                    | streaming 中   | idle                           | cancel IPC + partial text確定 |
| `setStreamingError()`                 | streaming 中   | idle + error                   | retryable metadata 付与       |

## 不変条件

- active session があるとき `chatMessages` はその session の clone と一致する。
- placeholder message は 1 stream request につき 1 件。
- `modeSessionIds` は mode ごとに 1 session を保持する。
