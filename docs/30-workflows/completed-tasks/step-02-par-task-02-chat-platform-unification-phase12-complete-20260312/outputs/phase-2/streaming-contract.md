# Streaming Contract

## request 生成

- helper: `buildChatPlatformRequest()`
- 共通条件:
  - `stream: true`
  - input は trim + collapse whitespace
  - context block があれば `ユーザーの依頼:` を付けて結合
  - `general` の default temperature は `0.4`
  - `workspace` / `skill-lifecycle` の default temperature は `0.2`

## overlay reset 契約

| タイミング            | 期待状態                                                              |
| --------------------- | --------------------------------------------------------------------- |
| `startStreaming()`    | `isStreaming=true`, `currentStreamId` と placeholder message をセット |
| `appendStreamChunk()` | `streamingContent` と placeholder message を同期                      |
| `endStreaming()`      | `createEmptyChatStreamOverlayState()` 相当へ戻す                      |
| `cancelStreaming()`   | `createEmptyChatStreamOverlayState()` 相当へ戻す                      |
| `setStreamingError()` | error を保持しつつ stream ids / content を空にする                    |

## revive との境界

`currentStreamId` `streamingMessageId` `streamingContent` `streamingError` は session restore の入力に使わない。
