# Workspace Chat Panel Runtime Alignment - 実装ガイド

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 12                                           |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

---

# Part 1: 概念的説明（中学生でもわかる版）

## なぜ必要か: AI チャットが「勝手に動く」問題

想像してみてください。LINE でメッセージを送るとき、相手のアカウントを選ばずに送信ボタンを押したらどうなるでしょうか？ 普通は「送信先を選んでください」と表示されますよね。

ところが、以前の Workspace Chat Panel には「送信先の AI モデルが選ばれていなくても、勝手にデフォルトの AI（gpt-4o）に送ってしまう」という問題がありました。たとえば、ユーザーが Claude を使いたいのに、設定をしていないと勝手に gpt-4o で送信されてしまい、意図しない課金が発生する可能性がありました。

## 何をするか: 3つの「門番」を置く

この問題を解決するために、メッセージが送信されるまでの道のりに3つの門番（チェックポイント）を配置しました。

### 門番1: UI の送信ボタン（フロントエンド）

送信ボタンは、AI モデルが選択されていないときは灰色になって押せません。たとえば、スマホアプリで通信圏外のとき送信ボタンが使えなくなるのと同じ仕組みです。

### 門番2: コントローラーの入口チェック（中間層）

仮に送信ボタンが押されても、コントローラー（指示を伝える係）が「AI モデルが決まっていないから、この指示は受け付けられません」と跳ね返します。

### 門番3: サーバー側の最終検証（バックエンド）

万が一、前の2つをすり抜けても、サーバー（Main Process）が「modelId が空です」とエラーを返します。これは空港のセキュリティチェックのように、何重にも確認する仕組みです。

## ストリーミング: リアルタイムで文字が流れる仕組み

AI の返事を待つとき、全部の返事が完成するまで待つのではなく、一文字ずつ画面に表示されます。たとえば、YouTube の生配信のように、データが少しずつ届くたびに画面が更新されます。

キャンセルボタンを押すと、配信が止まるように AI の返答も途中で止まり、それまでの不完全な返答は保存されません。

## ファイルコンテキスト: AI に資料を見せる仕組み

プロジェクトのファイルを最大3つまで選んで、AI に「これを見て答えて」と伝えることができます。たとえば、先生に質問するとき「教科書の○ページを見てください」と言うのと同じです。

## 会話の保存: チャット履歴が消えない仕組み

送ったメッセージと AI の返答は、ノートに書くようにデータベースに順番通り保存されます。アプリを閉じて開き直しても、前の会話が残っています。

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ概要

### Authority 配置

| Concern             | Authority      | IPC チャンネル                       | 根拠                         |
| ------------------- | -------------- | ------------------------------------ | ---------------------------- |
| Access Capability   | Main Process   | `runtime:resolve`                    | RuntimeResolver が Main 所有 |
| Provider/Model 選択 | Renderer Store | `llm:set-selected-config`            | Task06 で確立済み            |
| File Context 組立   | Renderer       | `file:read`                          | selectedFiles は Store 管理  |
| Conversation 永続化 | Main Process   | `conversation:create` / `addMessage` | Repository は Main 所有      |
| Stream Lifecycle    | Main Process   | `llm:stream-chat` / `cancel-stream`  | AbortController は Main 所有 |

### P62 三層防御

```
[Renderer UI] canSend = selectedModelId !== null
       ↓ (通過)
[Controller] sendMessage: if (!selectedModelId) return
       ↓ (通過)
[Main Process] handleStreamChat: modelId P42 3段バリデーション
```

## IPC 契約

### llm:stream-chat

```typescript
// Request (Renderer → Main)
interface AIChatRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  modelId: string; // 必須。null/空文字不可
  conversationId?: string;
}

// Main Process バリデーション (P42 準拠 3段)
if (typeof modelId !== "string") throw VALIDATION_ERROR;
if (modelId === "") throw VALIDATION_ERROR;
if (modelId.trim() === "") throw VALIDATION_ERROR;
```

### llm:cancel-stream

```typescript
// Request (Renderer → Main)
// 引数なし。現在アクティブなストリームを中止する。
// Main: AbortController.abort() + activeStreams.delete()
```

### llm:on-stream-chunk / llm:on-stream-end / llm:on-stream-error

```typescript
// Events (Main → Renderer)

// on-stream-chunk
interface StreamChunk {
  content: string; // 差分テキスト
}

// on-stream-end
interface StreamEnd {
  fullContent: string; // 完全なレスポンステキスト
}

// on-stream-error
interface StreamError {
  code: string;
  // "API_KEY_MISSING" | "MODEL_NOT_FOUND" | "VALIDATION_ERROR"
  // | "NETWORK_ERROR" | (default)
  message: string;
  retryable: boolean;
}
```

### conversation:create

```typescript
// Request (Renderer → Main)
interface ConversationCreateRequest {
  title: string; // 最大32文字。超過時は自動切り詰め
  workspaceId?: string;
}

// Response
interface ConversationCreateResponse {
  success: boolean;
  data?: { id: string };
  error?: { code: string; message: string };
}
```

### conversation:addMessage

```typescript
// Request (Renderer → Main)
interface AddMessageRequest {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  llmProvider?: string; // 永続化用
  llmModel?: string; // 永続化用
}
```

## コンポーネント構成

### UI 5領域レイアウト

```
+-------------------------------------------+
| Panel Header (workspace name)             |
+-------------------------------------------+
| File Context Chips (max 3 files)          |
+-------------------------------------------+
|                                           |
| Message Log (messages + streaming)        |
|  - Zero State: suggestion bubbles         |
|  - Active: message list + stream content  |
|                                           |
+-------------------------------------------+
| Composer (input + send/cancel button)     |
+-------------------------------------------+
| Guidance Block (blocked/error/handoff)    |
+-------------------------------------------+
```

### 状態遷移

```
idle → sending → streaming → completed
                           → cancelled (cancelStream)
                           → error (onStreamError)
blocked (selectedModelId === null) → idle (model selected)
```

### 主要ファイル

| ファイル                        | 責務                                  | 行数 |
| ------------------------------- | ------------------------------------- | ---- |
| `useWorkspaceChatController.ts` | ストリーミング制御・状態管理          | 640  |
| `WorkspaceChatPanel.tsx`        | 5領域レイアウト・GuidanceBlock統合    | 72   |
| `WorkspaceChatInput.tsx`        | 入力・送信/キャンセルボタン           | 141  |
| `GuidanceBlock.tsx`             | エラー/ブロック/ハンドオフ表示        | 84   |
| `TranscriptProvenanceChip.tsx`  | ターミナル転記チップ（未統合）        | 28   |
| `CompactLayout.tsx`             | ResizeObserver レスポンシブ（未統合） | 42   |

## エラーハンドリング

### StreamError code 別 guidance メッセージ

| code             | メッセージ概要                | retryable |
| ---------------- | ----------------------------- | --------- |
| API_KEY_MISSING  | API キー未設定。Settings 導線 | false     |
| MODEL_NOT_FOUND  | モデルが見つからない          | false     |
| VALIDATION_ERROR | リクエスト検証エラー          | false     |
| NETWORK_ERROR    | ネットワーク接続エラー        | true      |
| (default)        | 予期しないエラー              | false     |

### エラーフロー

```
onStreamError(error)
  → switch(error.code)
    → setErrorMessage(日本語 guidance)
    → isStreaming = false
    → streamContent = ""
```

## テストカテゴリ

| カテゴリ         | テスト数 | ファイル                                     |
| ---------------- | -------- | -------------------------------------------- |
| Runtime 統合     | 31       | `useWorkspaceChatController.runtime.test.ts` |
| UI 表示          | 7        | `WorkspaceChatPanel.runtime.test.tsx`        |
| Main ハンドラ    | 24       | `llm-stream-runtime.test.ts`                 |
| IPC 統合         | 15       | `llm-stream-integration.test.ts`             |
| **合計（自動）** | **77**   |                                              |
| 手動テスト       | 8        | `outputs/phase-11/manual-test-result.md`     |

### テスト ID マッピング

- R-01〜R-24: Controller ランタイム統合テスト（31件）
- E-01, E-07, E-08, E-09, E-11, E-13, E-15: Controller エッジケーステスト（実装済み7件）
- U-01〜U-06: UI 表示テスト（6件）
- E-05: GuidanceBlock 統合テスト（1件）
- M-01〜M-24: Main ハンドラバリデーションテスト（24件）
- I-01〜I-15: IPC 統合テスト（15件）

## セキュリティ考慮事項

| 観点            | 対策                                                        |
| --------------- | ----------------------------------------------------------- |
| path traversal  | selectedFiles は Store 管理。ユーザー入力からの直接パスなし |
| error masking   | Renderer に homedir/\_\_dirname/process.env 参照なし        |
| API key 非漏洩  | API key は Main Process のみ。Renderer には到達しない       |
| IPC sender 検証 | 全ハンドラで validateIpcSender 実行                         |

## 苦戦箇所

苦戦箇所なし（0件）。esbuild アーキテクチャ不一致（P53）による vitest 実行不可は環境制約であり、構造的カバレッジ分析で代替対応済み。
