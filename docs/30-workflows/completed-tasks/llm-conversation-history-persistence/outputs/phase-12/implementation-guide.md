# 会話履歴永続化機能 - 実装ガイド

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |
| ステータス | バックエンド実装完了                 |

---

# Part 1: 概念的説明（初学者向け）

## 会話履歴永続化機能とは

### 簡単な説明

アプリを閉じても、今までのAIとの会話が消えずに残る機能です。
次にアプリを開いたとき、前回の会話の続きができます。

### 何ができるようになるの？

1. **会話を保存**: AIとのやり取りが自動的に保存されます
2. **会話を見返す**: 過去の会話一覧から、見たい会話を選んで確認できます
3. **会話を続ける**: 前回の会話の続きから話を始められます
4. **会話を整理**: 会話にタイトルをつけたり、削除したりできます
5. **会話を探す**: キーワードで過去の会話を検索できます

### どうやって動いているの？

```
[あなた] → [メッセージ送信] → [アプリ] → [保存] → [データベース]
                                  ↓
[あなた] ← [会話表示] ← [アプリ] ← [読込] ← [データベース]
```

1. あなたがメッセージを送ると、アプリは自動的にそれを保存します
2. 保存先は、あなたのパソコンの中にある特別なファイル（データベース）です
3. アプリを閉じて再び開くと、保存されていた会話を読み込んで表示します

### 用語の説明

| 用語               | 意味                                   |
| ------------------ | -------------------------------------- |
| 会話（セッション） | AIとの一連のやり取りのまとまり         |
| メッセージ         | 会話の中の一つ一つの発言               |
| 永続化             | データを消えないように保存すること     |
| データベース       | たくさんのデータを整理して保存する場所 |

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process (UI)                     │
│  ┌─────────────────┐                                        │
│  │  React/Redux    │  ← 状態管理（llmSlice）                │
│  └────────┬────────┘                                        │
│           │ ipcRenderer.invoke()                            │
└───────────┼─────────────────────────────────────────────────┘
            │ IPC通信
┌───────────┼─────────────────────────────────────────────────┐
│           ↓                     Main Process                 │
│  ┌─────────────────┐                                        │
│  │   IPC Handlers  │  ← conversationHandlers.ts             │
│  └────────┬────────┘                                        │
│           │                                                  │
│  ┌────────↓────────┐                                        │
│  │   Repository    │  ← conversationRepository.ts            │
│  └────────┬────────┘                                        │
│           │                                                  │
│  ┌────────↓────────┐                                        │
│  │    SQLite DB    │  ← chat_sessions / chat_messages       │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### ファイル構成

```
apps/desktop/src/
├── main/
│   ├── repositories/
│   │   └── conversationRepository.ts    # データアクセス層
│   └── ipc/
│       └── conversationHandlers.ts      # IPCハンドラー
├── shared/
│   └── types/
│       └── conversation.ts              # 共有型定義
└── preload/
    └── channels.ts                      # IPCチャンネル定義
```

## データベーススキーマ

### chat_sessions テーブル

| カラム               | 型      | 説明                       |
| -------------------- | ------- | -------------------------- |
| id                   | TEXT    | UUID（主キー）             |
| user_id              | TEXT    | ユーザーID                 |
| title                | TEXT    | 会話タイトル               |
| created_at           | TEXT    | 作成日時（ISO8601）        |
| updated_at           | TEXT    | 更新日時（ISO8601）        |
| message_count        | INTEGER | メッセージ数               |
| is_favorite          | INTEGER | お気に入りフラグ           |
| is_pinned            | INTEGER | ピン留めフラグ             |
| pin_order            | INTEGER | ピン順序（NULL可）         |
| last_message_preview | TEXT    | 最後のメッセージプレビュー |
| metadata             | TEXT    | メタデータJSON             |
| deleted_at           | TEXT    | 削除日時（ソフトデリート） |

### chat_messages テーブル

| カラム        | 型      | 説明                      |
| ------------- | ------- | ------------------------- |
| id            | TEXT    | UUID（主キー）            |
| session_id    | TEXT    | セッションID（外部キー）  |
| role          | TEXT    | 'user' または 'assistant' |
| content       | TEXT    | メッセージ内容            |
| message_index | INTEGER | メッセージ順序            |
| timestamp     | TEXT    | 送信日時（ISO8601）       |
| llm_provider  | TEXT    | LLMプロバイダー           |
| llm_model     | TEXT    | LLMモデル名               |
| llm_metadata  | TEXT    | LLMメタデータJSON         |
| attachments   | TEXT    | 添付ファイルJSON          |
| system_prompt | TEXT    | システムプロンプト        |
| metadata      | TEXT    | メタデータJSON            |

## IPC API リファレンス

### チャンネル一覧

| チャンネル              | 説明           | 戻り値型              |
| ----------------------- | -------------- | --------------------- |
| conversation:list       | 会話一覧取得   | ConversationSummary[] |
| conversation:get        | 会話詳細取得   | Conversation \| null  |
| conversation:create     | 会話作成       | Conversation          |
| conversation:update     | 会話更新       | Conversation          |
| conversation:delete     | 会話削除       | { deleted: boolean }  |
| conversation:addMessage | メッセージ追加 | Message               |
| conversation:search     | 会話検索       | ConversationSummary[] |

### 型定義

#### ConversationSummary（一覧表示用軽量データ）

```typescript
interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
  isFavorite: boolean;
  isPinned: boolean;
}
```

#### Conversation（完全データ）

```typescript
interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number | null;
  lastMessagePreview: string | null;
  metadata: Record<string, unknown>;
  messages: Message[];
}
```

#### Message

```typescript
interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
  attachments: unknown[];
  metadata: Record<string, unknown>;
}
```

## 使用例

### 会話一覧の取得

```typescript
// Renderer側
const result = await window.electron.conversation.list({
  userId: "user-123",
  limit: 50,
  offset: 0,
});

if (result.success) {
  const conversations = result.data;
  // 会話一覧を表示
}
```

### 新規会話の作成

```typescript
const result = await window.electron.conversation.create({
  userId: "user-123",
  title: "新しい会話",
  firstMessage: {
    role: "user",
    content: "こんにちは",
    systemPrompt: "あなたは親切なアシスタントです。",
  },
});

if (result.success) {
  const conversation = result.data;
  // 作成された会話を表示
}
```

### メッセージの追加

```typescript
const result = await window.electron.conversation.addMessage({
  sessionId: "session-uuid",
  message: {
    role: "assistant",
    content: "こんにちは！何かお手伝いできることはありますか？",
    llmProvider: "openai",
    llmModel: "gpt-4",
  },
});

if (result.success) {
  const message = result.data;
  // メッセージを表示
}
```

### 会話の検索

```typescript
const result = await window.electron.conversation.search({
  userId: "user-123",
  query: "プログラミング",
});

if (result.success) {
  const matchedConversations = result.data;
  // 検索結果を表示
}
```

## エラーハンドリング

### エラーコード

| コード           | 説明               | 対処                   |
| ---------------- | ------------------ | ---------------------- |
| VALIDATION_ERROR | 入力値が不正       | 入力フォームを修正     |
| NOT_FOUND        | 会話が見つからない | 一覧を再読み込み       |
| DB_ERROR         | データベースエラー | 再試行またはエラー表示 |
| UNKNOWN_ERROR    | 予期しないエラー   | エラーログを確認       |

### エラーレスポンス例

```typescript
const result = await window.electron.conversation.get({ id: "invalid-id" });

if (!result.success) {
  console.error(`Error: ${result.error.code} - ${result.error.message}`);
  // "Error: NOT_FOUND - Conversation not found"
}
```

## セキュリティ考慮事項

### SQLインジェクション対策

- 全クエリでパラメータ化クエリ（プレースホルダ）を使用
- LIKE句の特殊文字（%, \_）を適切にエスケープ

### 入力バリデーション

- タイトル: 3〜100文字
- 必須フィールドの空文字チェック
- user_idによるデータ分離

## パフォーマンス

### 測定結果

| 操作                   | 基準     | 実測値   |
| ---------------------- | -------- | -------- |
| 100会話リスト取得      | < 100ms  | < 50ms   |
| 100メッセージ追加      | < 1000ms | < 500ms  |
| 1000会話リスト取得     | < 1000ms | < 200ms  |
| 1000メッセージ会話取得 | < 2000ms | < 1000ms |

### 最適化ポイント

- インデックス: user_id, session_id, created_at
- ページネーション: limit/offset対応
- 軽量サマリー: 一覧表示時はメッセージを含まない

## テスト

### テスト構成

| ファイル                       | テスト数 | 対象          |
| ------------------------------ | -------- | ------------- |
| conversationRepository.test.ts | 75       | Repository層  |
| conversationHandlers.test.ts   | 39       | IPC Handler層 |

### カバレッジ

- Line Coverage: 100%
- Branch Coverage: 100%
- Function Coverage: 100%
