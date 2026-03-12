# LLM ストリーミングレスポンス仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-llm.md](./interfaces-llm.md)

---

> **実装**: `apps/desktop/src/main/adapters/llm/`, `apps/desktop/src/main/handlers/llm.ts`
> **Renderer**: `apps/desktop/src/renderer/hooks/useStreamingChat.ts`, `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`
> **テスト**: `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`
> **詳細ガイド**: `docs/30-workflows/llm-streaming-response/outputs/phase-12/implementation-guide.md`

## 概要

LLMからの応答をServer-Sent Events (SSE) 形式でリアルタイムに受信・表示する機能。従来の一括レスポンスと比較して、ユーザー体験を大幅に向上させる。

---

## 型定義

### LLMStreamChunk

ストリーミングチャンクの型定義。

| フィールド | 型 | 必須 | 説明 |
| ---------- | --- | ---- | ---- |
| id | string | ✓ | provider chunk または stream 内イベント識別子 |
| delta | `{ content?: string; role?: string }` | - | 部分テキスト。Renderer は `delta.content` を累積する |
| done | boolean | ✓ | この chunk 時点で完了したか |
| metadata | `{ model?: string; finishReason?: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }` | - | provider metadata |

### StreamingState

ストリーミング状態の型定義。

| フィールド | 型 | 説明 |
| ---------- | --- | ---- |
| isStreaming | boolean | streaming 中フラグ |
| currentStreamId | string \| null | `streamChat()` が返した `requestId` |
| streamingMessageId | string \| null | placeholder assistant message の ID |
| streamingContent | string | 現在までに累積した本文 |
| streamingError | `LLMError \| { code: string; message: string; retryable: boolean } \| null` | retry / stop UI 用の最新 error |

### ChatMessage

チャットメッセージ型。

| フィールド  | 型                    | 説明                           |
| ----------- | --------------------- | ------------------------------ |
| id          | string                | メッセージID                   |
| role        | "user" \| "assistant" | メッセージ送信者               |
| content     | string                | メッセージ内容                 |
| timestamp   | Date                  | 送信日時                       |
| isStreaming | boolean               | ストリーミング中フラグ（任意） |

---

## SSEフロー

ストリーミング通信は、Renderer Process → Main Process → Provider API の順で要求が送信され、応答は逆方向に chunk event として返却される。

| ステップ | 送信元           | 送信先           | イベント/メソッド              | 説明                       |
| -------- | ---------------- | ---------------- | ------------------------------ | -------------------------- |
| 1        | Renderer Process | Main Process     | `llm:stream-chat` (invoke)     | ストリーミング要求。戻り値は `requestId` |
| 2        | Main Process     | Provider API     | HTTP POST (stream=true)        | SSEストリーム接続開始      |
| 3        | Provider API     | Main Process     | SSE: data: {"delta":...}       | チャンク受信（1回目）      |
| 4        | Main Process     | Renderer Process | `llm:stream-chunk`             | chunk 転送（1回目）        |
| 5        | Provider API     | Main Process     | SSE: data: {"delta":...}       | チャンク受信（2回目以降）  |
| 6        | Main Process     | Renderer Process | `llm:stream-chunk`             | chunk 転送（2回目以降）    |
| 7        | Provider API     | Main Process     | SSE: data: [DONE]              | ストリーム終了シグナル     |
| 8        | Main Process     | Renderer Process | `llm:stream-end`               | ストリーミング完了通知     |

---

## プロバイダー別SSE解析

| プロバイダー | 形式                                           | 終了シグナル |
| ------------ | ---------------------------------------------- | ------------ |
| OpenAI       | `data: {"choices":[{"delta":{"content":"..."}}]}` | `data: [DONE]` |
| Anthropic    | `event: content_block_delta\ndata: {"delta":{"text":"..."}}` | `event: message_stop` |
| Google       | `data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}` | 接続終了 |
| xAI          | OpenAI互換形式                                 | `data: [DONE]` |

---

## キャンセル機構

### requestId ベース cancel

Renderer は `AbortController` を直接持たず、`streamChat()` が返した `requestId` を `cancelStream(requestId)` へ渡す。AbortController は Main Process の `handleStreamChat()` 内で保持される。

| 処理 | メソッド/プロパティ | 説明 |
| ---- | -------------------- | ---- |
| ストリーミング開始 | `window.electronAPI.llm.streamChat(request)` | `{ requestId }` を受け取る |
| 状態保持 | `chatSlice.currentStreamId` / `streamRequestIdRef` | 現在の requestId を保存 |
| キャンセル実行 | `window.electronAPI.llm.cancelStream(requestId)` | Main 側 AbortController を abort する |
| UI 後処理 | `cancelStreaming()` / local reset | placeholder message や stream state を停止する |

### キャンセルトリガー

| トリガー | アクション |
| -------- | ---------- |
| ChatView の停止ボタン | `cancelStream()` → `cancelStream(requestId)` |
| Workspace chat の停止ボタン | `cancelStream()` → `cancelStream(requestId)` |
| Main 側 abort | `activeStreams.get(requestId)?.abort()` |
| コンポーネント破棄 | cleanup で `cancelStream(requestId)` |

---

## UIコンポーネント

### current HEAD の二重実装と Task02 設計ギャップ

| surface | 現在の実装 | Task02 で揃える対象 |
| --- | --- | --- |
| `ChatView` / `useStreamingChat` | `chatSlice` に placeholder / `streamingContent` / `currentStreamId` を保持する general chat | 共通 general mode 契約 |
| `WorkspaceChatPanel` / `useWorkspaceChatController` | local state + ref で stream を管理し、`conversationAPI` で永続化する workspace 専用 chat | workspace mode 契約 |
| 設計ギャップ | current HEAD | `skill-lifecycle` mode、共通 recent rail、mode/session overlay、handoff summary の統一 |

### StreamingMessage

ストリーミングメッセージ表示コンポーネント。

| Props        | 型         | 必須 | 説明                     |
| ------------ | ---------- | ---- | ------------------------ |
| content      | string     | ✓    | 表示コンテンツ           |
| isStreaming  | boolean    | ✓    | ストリーミング状態       |
| onCancel     | () => void | -    | キャンセルコールバック   |

### アクセシビリティ

| 属性               | 値               | 目的                       |
| ------------------ | ---------------- | -------------------------- |
| role               | "status"         | 動的コンテンツの通知       |
| aria-live          | "polite"         | スクリーンリーダー対応     |
| aria-busy          | {isStreaming}    | 処理中状態の明示           |
| cursor aria-label  | "入力中"         | カーソルの意味を伝達       |
| button aria-label  | "応答をキャンセル" | キャンセルボタンの説明   |

---

## エラーハンドリング

| エラーコード          | ストリーミング時の動作       | リトライ |
| --------------------- | ---------------------------- | -------- |
| NETWORK_ERROR         | 接続切断、累積コンテンツ保持 | 可能     |
| TIMEOUT               | タイムアウト表示             | 可能     |
| RATE_LIMIT            | 待機時間表示、自動リトライ   | 可能     |
| API_KEY_INVALID       | エラー表示、設定画面誘導     | 不可     |
| CONTENT_FILTER        | フィルター通知               | 不可     |
| SERVICE_UNAVAILABLE   | サービス状態確認誘導         | 可能     |

---

## テストカバレッジ

| カテゴリ              | テスト数 | カバレッジ |
| --------------------- | -------- | ---------- |
| SSE解析               | 23       | Branch ~77% |
| キャンセル処理        | 21       | Branch ~80% |
| UIコンポーネント      | 31       | Branch ~75% |
| 統合テスト            | 54       | - |
| **合計**              | **129**  | **全PASS** |

---

## 型安全性の保証

- すべての型はTypeScriptで厳密に定義
- IPC通信時の型チェックはPreload層で実施
- ランタイムバリデーションは不要（型システムで保証）

---

## 関連ドキュメント

- [LLMインターフェース概要](./interfaces-llm.md)
- [LLM IPC型定義](./llm-ipc-types.md)
- [Embedding Generation仕様](./llm-embedding.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                           |
| ---------- | ---------- | ------------------------------------------------------------------ |
| v1.2.0     | 2026-03-12 | current HEAD 準拠へ更新。`LLMStreamChunk`、`llm:stream-end`、`llm:stream-cancel`、ChatView/Workspace の二重実装と Task02 設計ギャップを追記 |
| v1.0.0     | 2025-01-20 | 初版作成                                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換         |
