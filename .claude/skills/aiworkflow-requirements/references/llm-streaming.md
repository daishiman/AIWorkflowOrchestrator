# LLM ストリーミングレスポンス仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-llm.md](./interfaces-llm.md)

---

> **実装**: `apps/desktop/src/main/adapters/llm/`
> **UIコンポーネント**: `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`
> **テスト**: `apps/desktop/src/main/adapters/llm/__tests__/streaming.test.ts`
> **詳細ガイド**: `docs/30-workflows/llm-streaming-response/outputs/phase-12/implementation-guide.md`

## 概要

LLMからの応答をServer-Sent Events (SSE) 形式でリアルタイムに受信・表示する機能。従来の一括レスポンスと比較して、ユーザー体験を大幅に向上させる。

---

## 型定義

### StreamChunk

ストリーミングチャンクの型定義。

| フィールド | 型                              | 必須 | 説明                           |
| ---------- | ------------------------------- | ---- | ------------------------------ |
| type       | "content" \| "error" \| "done"  | ✓    | チャンクタイプ                 |
| content    | string                          | -    | テキストコンテンツ（type=content時） |
| error      | LLMError                        | -    | エラー情報（type=error時）     |

### StreamingState

ストリーミング状態の型定義。

| フィールド    | 型      | 説明                       |
| ------------- | ------- | -------------------------- |
| isStreaming   | boolean | ストリーミング中フラグ     |
| streamId      | string  | ストリームID               |
| accumulatedContent | string | 累積コンテンツ        |
| abortController | AbortController | キャンセル用コントローラー |

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

ストリーミング通信は、Renderer Process → Main Process → Provider API の順で要求が送信され、応答は逆方向にSSE形式で返却される。

| ステップ | 送信元           | 送信先           | イベント/メソッド              | 説明                       |
| -------- | ---------------- | ---------------- | ------------------------------ | -------------------------- |
| 1        | Renderer Process | Main Process     | llm:stream-chat (request)      | ストリーミングチャット要求 |
| 2        | Main Process     | Provider API     | HTTP POST (stream=true)        | SSEストリーム接続開始      |
| 3        | Provider API     | Main Process     | SSE: data: {"delta":...}       | チャンク受信（1回目）      |
| 4        | Main Process     | Renderer Process | llm:stream-chunk (chunk)       | チャンク転送（1回目）      |
| 5        | Provider API     | Main Process     | SSE: data: {"delta":...}       | チャンク受信（2回目以降）  |
| 6        | Main Process     | Renderer Process | llm:stream-chunk (chunk)       | チャンク転送（2回目以降）  |
| 7        | Provider API     | Main Process     | SSE: data: [DONE]              | ストリーム終了シグナル     |
| 8        | Main Process     | Renderer Process | llm:stream-done                | ストリーミング完了通知     |

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

### AbortController統合

Renderer側でキャンセル機構を実装する際は、AbortControllerを使用する。

| 処理                 | メソッド/プロパティ                                      | 説明                                     |
| -------------------- | -------------------------------------------------------- | ---------------------------------------- |
| AbortController生成  | new AbortController()                                    | キャンセル制御用インスタンスを生成       |
| ストリーミング開始   | window.api.llm.streamChat(request, { signal: controller.signal }) | signalオプションでAbortSignalを渡す |
| キャンセル実行       | controller.abort()                                       | ストリーミングを中断しリソースを解放     |

### キャンセルトリガー

| トリガー           | アクション                     |
| ------------------ | ------------------------------ |
| キャンセルボタン   | `onCancel()` → `abort()`       |
| Escapeキー         | キーイベント → `abort()`       |
| コンポーネント破棄 | useEffect cleanup → `abort()`  |
| 新規メッセージ送信 | 前のストリームを自動キャンセル |

---

## UIコンポーネント

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

## 完了タスク記録

### TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001（2026-03-18）

WorkspaceChatPanel から llm-streaming の SSEフローへの連携が確立。

| 観点 | 内容 |
| --- | --- |
| streaming 連携 | `useWorkspaceChatController` から `llm:stream-chat` を呼び出し、chunk/done/error を WorkspaceChatPanel の状態へ反映 |
| キャンセルフロー | `cancelStream → AbortController.abort() → streamContent クリア` で llm-streaming の AbortController統合パターンを採用 |
| エラーハンドリング | streaming エラー時は `useWorkspaceChatController.streamingError` を正本にし、`errorMessage` は legacy fallback として `WorkspaceChatInput` へ渡す |

---

### Task 01 との責務境界（2026-03-20 再監査）

- ChatView の `chatError` は non-streaming `sendMessage()` 失敗用の一過性 UI state であり、本仕様の `streamingError` と混在させない
- Workspace Chat の error UX は `useWorkspaceChatController.streamingError` を正本とし、`errorMessage` は raw message fallback に限定する。Task 01 の alert banner は参照パターンとしてのみ扱う
- `API_KEY_MISSING` など共通 error code は許容するが、保持場所と auto clear 条件は surface ごとに分離する

### TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR 同期メモ（2026-03-22）

| 観点 | 内容 |
| --- | --- |
| structured error | `StreamingErrorState` を `useWorkspaceChatController` で管理し、`StreamingErrorDisplay` が primary surface を担当する |
| fallback | `errorMessage` は `streamingError` が無いときのみ inline に出す |
| recover | `dismissStreamingError()` で structured/raw を同時に clear し、`retryLastMessage()` は retryable のみ再送する |

## 変更履歴

| バージョン | 日付       | 変更内容                                                           |
| ---------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0     | 2025-01-20 | 初版作成                                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換         |
| v1.2.0     | 2026-03-18 | WorkspaceChatPanel streaming 連携確立記録を追加（TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001） |
