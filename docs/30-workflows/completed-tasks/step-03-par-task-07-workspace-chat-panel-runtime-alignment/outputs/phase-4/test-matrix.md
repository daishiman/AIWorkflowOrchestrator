# Phase 4: テストマトリクス

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 4                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## テストファイル配置

| テストファイル                                               | テスト対象                 | ケース数 |
| ------------------------------------------------------------ | -------------------------- | -------- |
| `hooks/__tests__/useWorkspaceChatController.runtime.test.ts` | useWorkspaceChatController | 24       |
| `__tests__/WorkspaceChatPanel.runtime.test.tsx`              | WorkspaceChatPanel         | 6        |
| `handlers/__tests__/llm-stream-runtime.test.ts`              | handleStreamChat/Cancel    | 10       |
| `handlers/__tests__/llm-stream-integration.test.ts`          | IPC 統合                   | 5        |

## Renderer 層テストケース（R-01〜R-24）

| ID   | テストケース                                    | 検証対象              | 期待結果                                   | 分類    |
| ---- | ----------------------------------------------- | --------------------- | ------------------------------------------ | ------- |
| R-01 | 初期状態で messages が空配列                    | 初期 state            | messages=[], input="", isStreaming=false   | 正常系  |
| R-02 | input 入力で state 更新                         | setInputValue         | input と cursorPosition が更新される       | 正常系  |
| R-03 | suggestion 選択で input 反映                    | applySuggestion       | input=選択テキスト                         | 正常系  |
| R-04 | sendMessage で user message 追加                | sendMessage           | messages に userMessage 追加、input クリア | 正常系  |
| R-05 | sendMessage で streaming 開始                   | sendMessage           | isStreaming=true, isSending=true -> false  | 正常系  |
| R-06 | onStreamChunk で streamContent 蓄積             | stream chunk listener | streamContent に delta 追加                | 正常系  |
| R-07 | onStreamEnd で assistant message 追加           | stream end listener   | messages に assistantMessage 追加          | 正常系  |
| R-08 | cancelStream で streaming 中断                  | cancelStream          | isStreaming=false, streamContent=""        | 正常系  |
| R-09 | 空入力で sendMessage が no-op                   | sendMessage guard     | messages 変化なし                          | 境界値  |
| R-10 | isSending 中に sendMessage が no-op             | 二重送信防止          | 2回目が無視される                          | 境界値  |
| R-11 | isStreaming 中に sendMessage が no-op           | streaming 中送信防止  | sendMessage が無視される                   | 境界値  |
| R-12 | file read failure で errorMessage 設定          | attachContextFile     | errorMessage に失敗パスが含まれる          | 異常系  |
| R-13 | stream error で errorMessage 設定               | onStreamError         | errorMessage に失敗メッセージが含まれる    | 異常系  |
| R-14 | conversation create failure で errorMessage     | ensureConversation    | errorMessage に失敗メッセージが含まれる    | 異常系  |
| R-15 | mention '@' 入力で候補表示                      | mentionQuery          | mention.isOpen=true                        | 正常系  |
| R-16 | mention 候補選択で file attach                  | insertMention         | selectedFiles に追加                       | 正常系  |
| R-17 | mention 範囲外で候補非表示                      | mentionQuery          | mention.isOpen=false                       | 境界値  |
| R-18 | attachSelectedFile で file 追加                 | attachSelectedFile    | selectedFiles に追加                       | 正常系  |
| R-19 | selectedModelId=null で sendMessage 実行不可    | P62 対策              | 送信ボタン非活性                           | 異常系  |
| R-20 | unmount 時に active stream を cancel            | cleanup effect        | cancelStream が呼ばれる                    | cleanup |
| R-21 | conversation addMessage failure で errorMessage | persistAssistant      | errorMessage に保存失敗メッセージ          | 異常系  |
| R-22 | Enter で sendMessage 呼出                       | keyboard handler      | sendMessage が呼ばれる                     | 正常系  |
| R-23 | Shift+Enter で改行                              | keyboard handler      | sendMessage が呼ばれない                   | 境界値  |
| R-24 | ArrowDown で mention 移動                       | keyboard handler      | mention.moveHighlight(1) が呼ばれる        | 正常系  |

## Main 層テストケース（M-01〜M-10）

| ID   | テストケース                         | 検証対象           | 期待結果                                | 分類   |
| ---- | ------------------------------------ | ------------------ | --------------------------------------- | ------ |
| M-01 | 正常な streamChat リクエスト         | handleStreamChat   | requestId 返却、chunk 送信開始          | 正常系 |
| M-02 | messages 空配列で VALIDATION_ERROR   | handleStreamChat   | VALIDATION_ERROR                        | 異常系 |
| M-03 | provider 不明で MODEL_NOT_FOUND      | handleStreamChat   | MODEL_NOT_FOUND                         | 異常系 |
| M-04 | API key 未設定で API_KEY_MISSING     | handleStreamChat   | API_KEY_MISSING                         | 異常系 |
| M-05 | cancel で AbortController.abort()    | handleStreamCancel | success: true                           | 正常系 |
| M-06 | 存在しない requestId で cancel       | handleStreamCancel | success: false                          | 境界値 |
| M-07 | sender destroyed で chunk スキップ   | safeSend           | chunk 送信をスキップ                    | 異常系 |
| M-08 | network error で NETWORK_ERROR       | handleStreamChat   | NETWORK_ERROR, retryable=true           | 異常系 |
| M-09 | setSelectedConfig の providerId 検証 | handleSetConfig    | invalid providerId で success=false     | 異常系 |
| M-10 | setSelectedConfig の modelId trim    | handleSetConfig    | 空文字列 modelId で success=false (P42) | 異常系 |

## IPC 統合テストケース（I-01〜I-05）

| ID   | テストケース                                 | 検証観点                             | 分類   |
| ---- | -------------------------------------------- | ------------------------------------ | ------ |
| I-01 | stream-chat -> chunk -> end の完全フロー     | Renderer <-> Main 契約一致           | 正常系 |
| I-02 | stream-chat -> cancel の中断フロー           | cancel 後に chunk が来ないことを検証 | 正常系 |
| I-03 | conversation create -> addMessage の永続化   | conversationId の引き継ぎ            | 正常系 |
| I-04 | stream-chat の request 形式が IPC 契約に一致 | StreamChatRequest 型との整合         | 契約   |
| I-05 | stream error のレスポンス形式が契約に一致    | StreamError 型との整合               | 契約   |

## UI コンポーネントテストケース（U-01〜U-06）

| ID   | テストケース                                | 検証対象              | 期待結果                       | 分類   |
| ---- | ------------------------------------------- | --------------------- | ------------------------------ | ------ |
| U-01 | zero state で suggestion bubbles 表示       | showSuggestionBubbles | zero-state 要素存在            | 正常系 |
| U-02 | messages 存在時に suggestion bubbles 非表示 | showSuggestionBubbles | zero-state 要素なし            | 正常系 |
| U-03 | streaming 中に streaming indicator 表示     | isStreaming=true      | StreamingMessage 表示          | 正常系 |
| U-04 | file context chips に selectedFiles 表示    | selectedFiles         | chip 数 = selectedFiles.length | 正常系 |
| U-05 | errorMessage 存在時にエラー表示             | errorMessage          | エラーメッセージ表示           | 正常系 |
| U-06 | selectedModelId=null で送信ボタン非活性     | P62 CTA guard         | 送信ボタン disabled            | 異常系 |

## テスト環境制約

| 項目               | 内容                                             |
| ------------------ | ------------------------------------------------ |
| テストランナー     | Vitest                                           |
| DOM 環境           | happy-dom（P39 準拠: fireEvent 使用）            |
| 非同期ハンドラ     | `await act(async () => { fireEvent.click(el) })` |
| 実行ディレクトリ   | `cd apps/desktop && pnpm vitest run`（P40 準拠） |
| state リセット     | beforeEach で全 mock を reset（P9 準拠）         |
| IPC レスポンス形式 | P60 準拠（上記テーブル参照）                     |

## カバレッジ対象

| カテゴリ          | ケース数 |
| ----------------- | -------- |
| Renderer 層       | 24       |
| Main 層           | 10       |
| IPC 統合          | 5        |
| UI コンポーネント | 6        |
| **合計**          | **45**   |
