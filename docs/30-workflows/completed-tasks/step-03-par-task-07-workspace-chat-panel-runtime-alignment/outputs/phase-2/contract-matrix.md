# Phase 2: 契約マトリクス

## IPC 契約テーブル

| チャンネル              | 方向            | 引数型                        | 戻り値型                   | エラー型          | P42 対象引数        |
| ----------------------- | --------------- | ----------------------------- | -------------------------- | ----------------- | ------------------- |
| llm:stream-chat         | Renderer → Main | StreamChatRequest             | StreamChatResponse         | throw StreamError | modelId, providerId |
| llm:cancel-stream       | Renderer → Main | { requestId: string }         | { success: boolean }       | -                 | requestId           |
| llm:on-stream-chunk     | Main → Renderer | StreamChunk                   | -                          | -                 | -                   |
| llm:on-stream-end       | Main → Renderer | { requestId: string }         | -                          | -                 | -                   |
| llm:on-stream-error     | Main → Renderer | StreamError                   | -                          | -                 | -                   |
| conversation:create     | Renderer → Main | ConversationCreateRequest     | { success, data?, error? } | -                 | userId, title       |
| conversation:addMessage | Renderer → Main | ConversationAddMessageRequest | { success, error? }        | -                 | sessionId, content  |
| file:read               | Renderer → Main | { filePath: string }          | FileContent                | -                 | filePath            |

## State 契約テーブル

| State              | 配置先                       | 型                     | 初期値                 | 更新トリガー                |
| ------------------ | ---------------------------- | ---------------------- | ---------------------- | --------------------------- |
| messages           | local useState               | WorkspaceChatMessage[] | []                     | sendMessage, onStreamEnd    |
| conversationId     | local useState               | string or null         | null                   | ensureConversation          |
| input              | local useState               | string                 | ""                     | ユーザー入力                |
| isSending          | local useState               | boolean                | false                  | sendMessage開始/完了        |
| isStreaming        | local useState               | boolean                | false                  | stream開始/end/error/cancel |
| streamContent      | local useState               | string                 | ""                     | onStreamChunk               |
| errorMessage       | local useState               | string or null         | null                   | エラー発生/クリア           |
| selectedFiles      | Zustand (fileSelectionSlice) | SelectedFile[]         | []                     | addFiles/removeFile         |
| selectedProviderId | Zustand (llmSlice)           | string or null         | null                   | llm:set-selected-config     |
| selectedModelId    | Zustand (llmSlice)           | string or null         | null                   | llm:set-selected-config     |
| accessCapability   | Zustand (新規)               | RuntimeResolution      | { type: "integrated" } | runtime:resolve             |

## Runtime 契約テーブル

| authMode     | hasApiKey | RuntimeResolution                                     | UI状態   | CTA              |
| ------------ | --------- | ----------------------------------------------------- | -------- | ---------------- |
| subscription | any       | { type: "handoff", reason: "subscription mode" }      | guidance | terminal handoff |
| api-key      | true      | { type: "integrated" }                                | ready    | 送信可能         |
| api-key      | false     | { type: "handoff", reason: "API key not configured" } | guidance | Settings誘導     |

## CTA 活性/非活性 契約

| CTA               | 活性条件                                                                          | 非活性条件                               |
| ----------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| 送信する          | input.trim().length > 0 && !isSending && !isStreaming && selectedModelId !== null | いずれか false                           |
| キャンセル        | isStreaming === true                                                              | isStreaming === false                    |
| ファイルを追加    | selectedFilePath !== null && !isStreaming                                         | selectedFilePath === null or isStreaming |
| mention を開く    | !isStreaming                                                                      | isStreaming === true                     |
| terminal で続ける | capability が terminal-handoff or terminal-only                                   | capability が integrated-api             |
| Terminal ボタン   | 常時活性                                                                          | なし                                     |
