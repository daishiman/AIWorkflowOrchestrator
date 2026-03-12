# LLM ストリーミングレスポンス仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-llm.md](./interfaces-llm.md)

---

> **実装**: `apps/desktop/src/main/adapters/llm/`, `apps/desktop/src/main/handlers/llm.ts`
> **Renderer**: `apps/desktop/src/renderer/store/slices/chatSlice.ts`, `apps/desktop/src/renderer/hooks/useStreamingChat.ts`
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

| フィールド | 型 | 説明 |
| ---------- | --- | ---- |
| id | string | メッセージID |
| role | `"user" \| "assistant" \| "system"` | メッセージ送信者 |
| content | string | メッセージ内容 |
| timestamp | Date | 送信日時 |
| isStreaming | boolean | placeholder assistant message かどうか |
| sessionId | string | 所属 session |
| mode | `ChatMode` | `general` / `workspace` / `skill-lifecycle` |
| errorCode | string | error 埋め込み時の code |
| retryable | boolean | ChatView の retry CTA 判定 |

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
| 状態保持 | `chatSlice.currentStreamId` | 現在の requestId を保存 |
| キャンセル実行 | `window.electronAPI.llm.cancelStream(requestId)` | Main 側 AbortController を abort する |
| UI 後処理 | `chatSlice.cancelStreaming()` | placeholder message を停止し、必要なら中断文言へ置換する |

### キャンセルトリガー

| トリガー | アクション |
| -------- | ---------- |
| ChatView の停止ボタン | `abortStreaming()` → `cancelStream(requestId)` |
| 別 request の手動開始 | 呼び出し側で明示停止後に新規 request を送る |
| Main 側 abort | `activeStreams.get(requestId)?.abort()` |

---

## UIコンポーネント

### 共通チャット基盤の Renderer 契約（TASK-SKILL-LIFECYCLE-02）

| 観点 | 契約 |
| --- | --- |
| placeholder | `sendMessage()` は user message の直後に空の assistant message を作り、`streamingMessageId` に紐付ける |
| chunk 累積 | `onStreamChunk()` で `delta.content` を `streamingContent` と placeholder 本文へ同時反映する |
| 正常終了 | `onStreamEnd()` で `isStreaming=false`、placeholder の `isStreaming=false`、`streamingError=null` に戻す |
| 異常終了 | `onStreamError()` で placeholder に error message と `retryable` を埋め、`lastError` に保持する |
| retry | ChatView は `streamingError.retryable===true` のとき `retryLastMessage()` CTA を表示する |

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
| v1.2.0     | 2026-03-11 | TASK-SKILL-LIFECYCLE-02反映: `LLMStreamChunk` の現行 shape、`llm:stream-end` / `llm:stream-cancel`、Renderer chatSlice の requestId 管理を追加 |
| v1.0.0     | 2025-01-20 | 初版作成                                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換         |
