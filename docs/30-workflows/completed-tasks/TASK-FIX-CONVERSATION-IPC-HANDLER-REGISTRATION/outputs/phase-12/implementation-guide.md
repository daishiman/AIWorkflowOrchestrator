# 実装ガイド: Conversation IPC ハンドラ登録修正

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 作成日       | 2026-03-16                                     |
| 対象ファイル | `apps/desktop/src/main/ipc/index.ts`           |

---

## Part 1: 概念説明（中学生レベル）

### conversation IPC ハンドラとは？

たとえば、あなたが図書館に行ったとき、受付の人に「この本を借りたい」「この本を返したい」と
お願いしますよね。受付の人はそのお願いを聞いて、作業を代わりにやってくれます。

conversation IPC ハンドラは、**アプリの受付係** のようなものです。

画面（Renderer）から「会話を作りたい」「会話の一覧を見せて」というお願いが届いたとき、
受付係（IPC ハンドラ）がそのお願いを聞いて、裏側のデータベースに記録したり、
記録された情報を取り出したりします。

今回の修正では、この受付係の登録が漏れていて、お願いが届いても誰も応答できない状態に
なっていました。`registerAllIpcHandlers()` という「受付係を全員配置する処理」に、
conversation の受付係（`registerConversationHandlers()`）を追加したのがこの修正です。

### なぜ必要なのか？

お店の受付がいないと、お客さんのお願いが宙ぶらりんになってしまいます。
同じように、IPC ハンドラが登録されていないと、画面からの操作が永遠に応答を
待ち続けてしまいます。正しく受付係を配置することで、会話の作成・表示・削除などが
スムーズに動くようになります。

### もし受付係が来られない（DB 故障）ときは？

DB（データの倉庫）が壊れていて受付係が来られないときでも、代わりの人（フォールバックハンドラ）が
「今は対応できません（DB_NOT_AVAILABLE）」と丁寧に答えるようになっています。

---

## Part 2: 技術詳細（開発者向け）

### 修正概要

`registerAllIpcHandlers()` に Section 13 として conversation ハンドラの登録処理を追加した。
既存の `safeRegister` + `track` パターンに従い、DB 初期化失敗時には
フォールバックハンドラを登録する Graceful Degradation パターン（S30）を採用している。

### Section 13 の追加パターン

```typescript
// apps/desktop/src/main/ipc/index.ts -- Section 13
import Database from "better-sqlite3";
import { registerConversationHandlers } from "./conversationHandlers";
import { ConversationRepository } from "../repositories/conversationRepository";

// Section 13: Conversation IPC ハンドラ登録
const CONVERSATION_DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS chat_sessions (...);
  CREATE TABLE IF NOT EXISTS chat_messages (...);
`;

let conversationRegistered = false;
try {
  const conversationDb = new Database(conversationDbPath);
  conversationDb.exec(CONVERSATION_DB_SCHEMA);
  const conversationRepository = new ConversationRepository(conversationDb);
  registerConversationHandlers(conversationRepository);
  conversationRegistered = true;
  successCount++;
} catch (error) {
  failures.push({ section: 13, handler: "conversationHandlers", error });
  registerConversationFallbackHandlers();
}
```

### CONVERSATION_DB_SCHEMA: テーブル定義

2つのテーブルで会話データを管理する。

#### chat_sessions テーブル

会話セッションのメタデータを格納する。

| カラム               | 型      | 説明                     |
| -------------------- | ------- | ------------------------ |
| id                   | TEXT PK | セッション ID            |
| user_id              | TEXT    | ユーザー ID              |
| title                | TEXT    | 会話タイトル             |
| created_at           | TEXT    | 作成日時                 |
| updated_at           | TEXT    | 更新日時                 |
| message_count        | INTEGER | メッセージ数             |
| is_favorite          | INTEGER | お気に入りフラグ         |
| is_pinned            | INTEGER | ピン留めフラグ           |
| pin_order            | INTEGER | ピン順序                 |
| last_message_preview | TEXT    | 最終メッセージプレビュー |
| metadata             | JSON    | 拡張メタデータ           |
| deleted_at           | TEXT    | 論理削除日時             |

#### chat_messages テーブル

各会話内のメッセージを格納する。

| カラム        | 型      | 説明               |
| ------------- | ------- | ------------------ |
| id            | TEXT PK | メッセージ ID      |
| session_id    | TEXT FK | セッション ID      |
| role          | TEXT    | 発言者ロール       |
| content       | TEXT    | メッセージ内容     |
| message_index | INTEGER | メッセージ順序     |
| timestamp     | TEXT    | タイムスタンプ     |
| llm_provider  | TEXT    | LLM プロバイダ名   |
| llm_model     | TEXT    | LLM モデル名       |
| llm_metadata  | JSON    | LLM メタデータ     |
| attachments   | JSON    | 添付ファイル       |
| system_prompt | TEXT    | システムプロンプト |
| metadata      | JSON    | 拡張メタデータ     |

インデックス:

- `idx_chat_sessions_user_id`: user_id による検索最適化
- `idx_chat_sessions_created_at`: 作成日時の降順ソート最適化
- `idx_chat_messages_session_id`: セッション内メッセージ検索最適化
- `idx_chat_messages_session_message`: セッション + メッセージ順序のユニーク制約

### registerConversationFallbackHandlers: DB 障害時のフォールバック

DB 初期化が失敗した場合、7 つの conversation チャンネル全てにフォールバックハンドラを登録する。
各ハンドラは `DB_NOT_AVAILABLE` エラーレスポンスを返す。

```typescript
function registerConversationFallbackHandlers(): void {
  const channels = [
    IPC_CHANNELS.CONVERSATION_CREATE,
    IPC_CHANNELS.CONVERSATION_LIST,
    IPC_CHANNELS.CONVERSATION_GET,
    IPC_CHANNELS.CONVERSATION_UPDATE,
    IPC_CHANNELS.CONVERSATION_DELETE,
    IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
    IPC_CHANNELS.CONVERSATION_SEARCH,
  ];
  for (const channel of channels) {
    safeRegister(channel, async () => ({
      success: false,
      error: {
        code: "DB_NOT_AVAILABLE",
        message: "Conversation database is not available",
      },
    }));
  }
}
```

フォールバックにより、Renderer 側は「No handler registered」エラーではなく
構造化されたエラーレスポンスを受け取れるため、UI でエラーメッセージを表示できる。

### ConversationRepository のインターフェース

```typescript
interface IConversationRepository {
  create(params: { title: string; userId: string }): Promise<Conversation>;
  list(params: {
    userId: string;
  }): Promise<{ conversations: Conversation[]; total: number }>;
  get(params: { id: string }): Promise<Conversation | null>;
  update(params: {
    id: string;
    data: Partial<Conversation>;
  }): Promise<Conversation>;
  delete(params: { id: string }): Promise<void>;
  addMessage(params: { sessionId: string; message: Message }): Promise<Message>;
  search(params: { userId: string; query: string }): Promise<Conversation[]>;
}
```

### 依存関係図

```
[registerAllIpcHandlers(mainWindow)]
          |
          |- better-sqlite3 require (try-catch)
          |           |
          |    成功   |   失敗
          |     v     |     v
          |  DB生成   |  フォールバックハンドラ登録
          |  DDL実行  |  (7チャンネル x DB_NOT_AVAILABLE)
          |  WAL設定  |
          |     v
          |  ConversationRepository(db)
          |     v
          |  registerConversationHandlers(repository)
          |     v
          |  7チャンネル登録完了
```

### 既存パターンとの整合性

| 確認項目                   | 既存パターン                           | 本実装での対応                       |
| -------------------------- | -------------------------------------- | ------------------------------------ |
| ハンドラ登録               | `safeRegister` + `track`               | safeRegister + 条件分岐で採用        |
| ファイルパス生成           | `path.join(homeDir, ".claude", "...")` | 同じパターンを使用                   |
| フォールバック             | `registerFallbackHandlers()`           | 同じ関数を再利用                     |
| エラーサニタイズ           | `sanitizeRegistrationErrorMessage()`   | safeRegister 内で自動適用            |
| 二重登録防止（P5）         | `unregisterAllIpcHandlers()` 全解除    | IPC_CHANNELS に含まれるため自動対応  |
| safeRegister 適合（P54）   | 戻り値不要なハンドラに使用             | registerConversationHandlers は void |
| trim バリデーション（P42） | 3段バリデーション                      | conversationHandlers.ts 内で実装済み |
