# チャット履歴永続化機能 - 実装ガイド

このドキュメントは、チャット履歴永続化機能の実装について、**概念的な説明**と**技術的な詳細**の両方を解説します。

---

## 目次

1. [この機能でできること（概念編）](#1-この機能でできること概念編)
2. [全体アーキテクチャ](#2-全体アーキテクチャ)
3. [データベース設計](#3-データベース設計)
4. [リポジトリ層](#4-リポジトリ層)
5. [サービス層](#5-サービス層)
6. [用語集](#6-用語集)

---

## 1. この機能でできること（概念編）

### 1.1 中学生にもわかる説明

この機能は「**AIとの会話を保存して、後から見返せるようにする仕組み**」です。

LINEやメッセージアプリを想像してください。友達との会話履歴が保存されていて、過去のやり取りをスクロールして見返せますよね。この機能はそれと同じことをAIとの会話でできるようにします。

**できること**:

- 💬 AIとの会話を保存する
- 📂 過去の会話を一覧で見る
- 🔍 キーワードで会話を検索する
- ⭐ 大事な会話にお気に入りをつける
- 📌 よく使う会話をピン留めして上に固定する
- 📤 会話をファイルとして書き出す（バックアップ用）

### 1.2 なぜこの機能が必要か

| 課題                                 | この機能による解決                       |
| ------------------------------------ | ---------------------------------------- |
| AIとの会話がブラウザを閉じると消える | データベースに保存されるので永続的に残る |
| 以前聞いた内容を思い出せない         | 検索機能で過去の会話を探せる             |
| 大事な会話がどこにあるかわからない   | お気に入り・ピン留めで整理できる         |
| 会話をバックアップしたい             | Markdown/JSON形式で書き出せる            |

---

## 2. 全体アーキテクチャ

### 2.1 レイヤー構造（3層アーキテクチャ）

```
┌─────────────────────────────────────────────────────┐
│                   アプリケーション                    │
│          （ユーザーが触るUI・画面）                   │
└─────────────────────┬───────────────────────────────┘
                      │ 機能を呼び出す
                      ▼
┌─────────────────────────────────────────────────────┐
│              サービス層（Service Layer）             │
│        ChatHistoryService                           │
│  ・ビジネスロジック（業務のルール）を担当            │
│  ・例: セッション作成、メッセージ追加、検索          │
└─────────────────────┬───────────────────────────────┘
                      │ データ操作を依頼
                      ▼
┌─────────────────────────────────────────────────────┐
│           リポジトリ層（Repository Layer）           │
│   ChatSessionRepository / ChatMessageRepository     │
│  ・データベース操作を担当                           │
│  ・例: 保存、検索、更新、削除                       │
└─────────────────────┬───────────────────────────────┘
                      │ SQLを実行
                      ▼
┌─────────────────────────────────────────────────────┐
│              データベース層（Database）              │
│                    SQLite (Turso)                   │
│  ・データを実際に保存する場所                       │
└─────────────────────────────────────────────────────┘
```

### 2.2 なぜ3層に分けるのか

**理由**: **単一責務の原則（Single Responsibility Principle）**

各層が1つの責任だけを持つことで:

- **変更が楽**: データベースを変えてもサービス層は変わらない
- **テストが楽**: 各層を独立してテストできる
- **理解が楽**: どこで何をしているか明確

```
❌ 悪い例（全部1つのファイル）
┌─────────────────────────────────────┐
│  UI + ビジネスロジック + SQL       │
│  → 1箇所変えると全部壊れるリスク   │
└─────────────────────────────────────┘

✅ 良い例（層に分離）
┌────────┐  ┌────────┐  ┌────────┐
│ Service │→│  Repo  │→│  DB    │
│  変更   │  │ そのまま│  │ そのまま│
└────────┘  └────────┘  └────────┘
→ サービスだけ変えてもリポジトリ・DBは影響なし
```

---

## 3. データベース設計

### 3.1 テーブル構造（概念）

```
┌──────────────────┐         ┌──────────────────┐
│  chat_sessions   │         │  chat_messages   │
│  (会話の箱)      │ 1     N │  (個々の発言)    │
│                  │─────────│                  │
│ ・タイトル       │         │ ・誰が言ったか   │
│ ・作成日時       │         │ ・内容           │
│ ・お気に入り     │         │ ・AIモデル情報   │
│ ・ピン留め       │         │ ・送信日時       │
└──────────────────┘         └──────────────────┘

1つのセッション（会話の箱）に
複数のメッセージ（発言）が入る
→ これを「1対多（1:N）リレーション」と呼ぶ
```

### 3.2 chat_sessionsテーブル（技術詳細）

```typescript
// ファイル: packages/shared/src/db/schema/chat-history.ts

export const chatSessions = sqliteTable("chat_sessions", {
  // 主キー: 各レコードを一意に識別するID
  id: text("id").primaryKey(),

  // ユーザーID: 誰の会話かを識別（将来の認証機能用）
  userId: text("user_id").notNull(),

  // タイトル: 会話の名前（3〜100文字）
  title: text("title").notNull(),

  // 日時フィールド（ISO 8601形式）
  createdAt: text("created_at").notNull(), // 作成日時
  updatedAt: text("updated_at").notNull(), // 最終更新日時

  // 非正規化フィールド（検索・表示の高速化用）
  messageCount: integer("message_count").notNull().default(0),
  lastMessagePreview: text("last_message_preview"),

  // フラグ（SQLiteはBOOLがないのでINTEGER: 0=false, 1=true）
  isFavorite: integer("is_favorite").notNull().default(0),
  isPinned: integer("is_pinned").notNull().default(0),
  pinOrder: integer("pin_order"),

  // ソフトデリート用（削除日時がNULL=有効、値あり=削除済み）
  deletedAt: text("deleted_at"),
});
```

#### なぜこのように設計したか

| フィールド               | 設計意図                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| `id` (UUID)              | 自動採番のINTEGERではなく**UUID**を使用。理由: 分散環境でID衝突を防ぐ、URLに含めても推測されにくい |
| `messageCount`           | **非正規化**: 毎回メッセージ数をカウントするのは遅いので、あらかじめ数えておく                     |
| `lastMessagePreview`     | **非正規化**: 一覧表示時にメッセージテーブルを参照しなくて済む                                     |
| `isFavorite`, `isPinned` | **INTEGER型**: SQLiteにはBOOLEAN型がないため、0/1で代用                                            |
| `deletedAt`              | **ソフトデリート**: 物理削除せず削除日時を記録。復元可能＆監査証跡を残せる                         |

### 3.3 インデックス設計

```typescript
// インデックス = データベースの「索引」
// 本の索引のように、検索を高速化する

(table) => [
  // ユーザーIDで検索するときに高速化
  index("idx_chat_sessions_user_id").on(table.userId),

  // 作成日時の降順ソート（新しい順）を高速化
  index("idx_chat_sessions_created_at").on(table.createdAt),

  // 複合インデックス: ピン留めセッションを順序付きで取得
  index("idx_chat_sessions_is_pinned").on(
    table.userId, // まずユーザーで絞り込み
    table.isPinned, // 次にピン留め状態で絞り込み
    table.pinOrder, // 最後に順序でソート
  ),
];
```

#### なぜインデックスが必要か

```
インデックスなし:
┌─────────────────────────────────┐
│ 全データを1行ずつ確認          │
│ 10万件あれば10万回チェック     │
│ → 遅い（フルスキャン）         │
└─────────────────────────────────┘

インデックスあり:
┌─────────────────────────────────┐
│ 索引で該当ページを特定         │
│ 直接そのデータにアクセス       │
│ → 速い（O(log n)）             │
└─────────────────────────────────┘
```

### 3.4 chat_messagesテーブル（技術詳細）

```typescript
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),

  // 外部キー: どのセッションに属するか
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  // ↑ セッション削除時にメッセージも自動削除

  // メッセージの送信者（"user" or "assistant"）
  role: text("role").notNull(),

  // メッセージ本文（1〜100,000文字）
  content: text("content").notNull(),

  // セッション内の順序（0から連番）
  messageIndex: integer("message_index").notNull(),

  // 送信日時
  timestamp: text("timestamp").notNull(),

  // LLM情報（アシスタント応答のみ）
  llmProvider: text("llm_provider"), // 例: "anthropic"
  llmModel: text("llm_model"), // 例: "claude-3-5-sonnet"
  llmMetadata: text("llm_metadata"), // JSON形式（トークン数等）
});
```

#### 外部キー制約と CASCADE DELETE

```
外部キー制約 = 「親子関係」を強制するルール

chat_sessions（親）────────┐
    id = "session-123"    │
                          │ 外部キー制約
                          ▼
chat_messages（子）───────────────
    session_id = "session-123"  ←必ず存在するセッションを参照

CASCADE DELETE = 「親が消えたら子も消す」
  セッション削除 → そのセッションのメッセージも自動削除
  → 孤児データ（親のいないメッセージ）を防ぐ
```

---

## 4. リポジトリ層

### 4.1 リポジトリパターンとは

```
リポジトリ = データベース操作を隠蔽する層

アプリケーション側
┌─────────────────────────────────────┐
│  sessionRepository.save(session)    │ ← SQLを知らなくても使える
│  sessionRepository.findById(id)     │
└─────────────────────────────────────┘
            │
            ▼ 内部でSQLに変換
リポジトリ内部
┌─────────────────────────────────────┐
│  INSERT INTO chat_sessions ...      │
│  SELECT * FROM chat_sessions ...    │
└─────────────────────────────────────┘
```

### 4.2 ChatSessionRepository（技術詳細）

```typescript
// ファイル: packages/shared/src/repositories/chat-session-repository.ts

export class ChatSessionRepository {
  constructor(private db: BetterSQLite3Database) {}

  /**
   * セッションを保存する
   *
   * ビジネスルールの実装:
   * - BR-SESSION-001: タイトルが空なら自動生成
   * - BR-SESSION-002: ピン留めは最大10件
   */
  async save(session: ChatSession): Promise<void> {
    // タイトル自動生成（BR-SESSION-001）
    let title = session.title;
    if (!title || title.trim() === "") {
      title = `新しいチャット ${formatDateTime(new Date())}`;
    }

    // ピン留め上限チェック（BR-SESSION-002）
    if (session.isPinned) {
      const pinnedCount = await this.countPinned(session.userId);
      if (pinnedCount >= 10) {
        throw new Error("ピン留めは最大10件までです");
      }
    }

    // データベースに挿入
    this.db.run(sql`
      INSERT INTO chat_sessions (...) VALUES (...)
    `);
  }

  /**
   * 論理削除（ソフトデリート）
   *
   * 実際には削除せず、削除日時を記録する
   * → 復元可能、監査証跡として残る
   */
  async delete(id: string): Promise<boolean> {
    const deletedAt = new Date().toISOString();
    // UPDATE で deleted_at を設定（DELETEではない）
    const result = this.db.run(sql`
      UPDATE chat_sessions
      SET deleted_at = ${deletedAt}
      WHERE id = ${id} AND deleted_at IS NULL
    `);
    return result.changes > 0;
  }
}
```

#### なぜ論理削除（ソフトデリート）を使うのか

| 物理削除 (DELETE)    | 論理削除 (UPDATE deleted_at)           |
| -------------------- | -------------------------------------- |
| データが完全に消える | データは残る（deleted_atに日時が入る） |
| 復元不可能           | 復元可能                               |
| 監査証跡が残らない   | いつ削除されたか記録が残る             |
| ストレージ効率が良い | ストレージを消費し続ける               |

**このプロジェクトでは論理削除を採用**: ユーザーが誤って削除した会話を復元できるようにするため。

---

## 5. サービス層

### 5.1 サービス層の役割

```
サービス層 = ビジネスロジック（業務のルール）を実装する場所

リポジトリ = 「データをどう保存するか」
サービス  = 「何をするか、どんなルールがあるか」

例: メッセージを追加する場合
┌─────────────────────────────────────────────────┐
│ ChatHistoryService.addUserMessage()             │
│                                                 │
│ 1. メッセージを作成                             │
│ 2. リポジトリに保存を依頼                       │
│ 3. セッションのmessageCountを更新               │
│ 4. セッションのlastMessagePreviewを更新         │
│                                                 │
│ → 「メッセージ追加」という1つの操作で           │
│   複数のデータ更新が必要。これを統合管理。     │
└─────────────────────────────────────────────────┘
```

### 5.2 ChatHistoryService（技術詳細）

```typescript
// ファイル: packages/shared/src/features/chat-history/chat-history-service.ts

export class ChatHistoryService {
  constructor(
    // 依存性注入: 外部からリポジトリを受け取る
    private sessionRepository: ChatSessionRepository,
    private messageRepository: ChatMessageRepository,
  ) {}

  /**
   * ユーザーメッセージを追加する（FR-004）
   *
   * 単純な保存だけでなく、関連するデータも更新する
   */
  async addUserMessage(
    sessionId: string,
    content: string,
  ): Promise<ChatMessage> {
    // 1. メッセージを作成・保存
    const message = await this.createMessage(sessionId, "user", content);

    // 2. セッションのメタデータを更新
    await this.updateSessionAfterMessage(sessionId, content);

    return message;
  }

  /**
   * メッセージ追加後のセッション更新
   *
   * - messageCount: メッセージ総数を更新
   * - lastMessagePreview: 最新メッセージの冒頭50文字
   * - updatedAt: 最終更新日時
   */
  private async updateSessionAfterMessage(
    sessionId: string,
    content: string,
  ): Promise<void> {
    const messageCount = await this.messageRepository.count(sessionId);
    const preview = this.truncatePreview(content); // 50文字に切り詰め

    await this.sessionRepository.update(sessionId, {
      messageCount,
      lastMessagePreview: preview,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Markdownエクスポート（FR-010）
   *
   * 会話をMarkdown形式で書き出す
   * → テキストエディタやGitHubで読める形式
   */
  async exportToMarkdown(
    sessionId: string,
    options?: ExportOptions,
  ): Promise<string> {
    const session = await this.validateSession(sessionId);
    const messages = await this.messageRepository.findBySessionId(sessionId);

    const lines: string[] = [];

    // ヘッダー: タイトル、作成日、メッセージ数
    lines.push(`# ${session.title}`);
    lines.push(`**作成日**: ${formatDateTime(session.createdAt)}`);

    // 各メッセージを変換
    for (const message of messages) {
      lines.push(`## ${message.role === "user" ? "ユーザー" : "アシスタント"}`);
      lines.push(message.content);
    }

    return lines.join("\n");
  }
}
```

#### 依存性注入（Dependency Injection）とは

```
依存性注入 = クラスが使う部品を外から渡す仕組み

❌ 悪い例（内部で直接作成）
class ChatHistoryService {
  constructor() {
    // 内部でリポジトリを直接作成
    this.repo = new ChatSessionRepository(new Database());
  }
}
→ テスト時に本物のDBが必要、モックに差し替えられない

✅ 良い例（外部から注入）
class ChatHistoryService {
  constructor(
    private sessionRepository: ChatSessionRepository, // 外から渡す
  ) {}
}
→ テスト時はモック（偽物）を渡せる、DBなしでテスト可能
```

---

## 6. 用語集

### データベース関連

| 用語               | 読み方             | 意味                                                   |
| ------------------ | ------------------ | ------------------------------------------------------ |
| **スキーマ**       | Schema             | データベースの構造定義（テーブル、カラム、型など）     |
| **テーブル**       | Table              | データを格納する表。行（レコード）と列（カラム）で構成 |
| **主キー**         | Primary Key        | 各行を一意に識別するカラム。重複不可                   |
| **外部キー**       | Foreign Key        | 他のテーブルの主キーを参照するカラム。リレーション用   |
| **インデックス**   | Index              | 検索を高速化するための索引構造                         |
| **UUID**           | ユーユーアイディー | 世界で一意になる128ビットの識別子                      |
| **非正規化**       | Denormalization    | 検索速度のためにデータを冗長に持つ設計手法             |
| **ソフトデリート** | Soft Delete        | 物理削除せず削除フラグを立てる手法                     |

### アーキテクチャ関連

| 用語                   | 読み方                    | 意味                                       |
| ---------------------- | ------------------------- | ------------------------------------------ |
| **リポジトリパターン** | Repository Pattern        | データアクセスを抽象化するデザインパターン |
| **サービス層**         | Service Layer             | ビジネスロジックを実装する層               |
| **依存性注入**         | Dependency Injection      | クラスの依存関係を外部から渡す設計手法     |
| **単一責務の原則**     | SRP                       | 1つのクラス/関数は1つの責任だけを持つべき  |
| **ORM**                | Object-Relational Mapping | オブジェクトとDBの橋渡しツール             |
| **Drizzle ORM**        | ドリズル                  | TypeScript向けの軽量ORM                    |

### コード関連

| 用語         | 読み方       | 意味                                           |
| ------------ | ------------ | ---------------------------------------------- |
| **ISO 8601** | アイエスオー | 日時の国際標準形式（例: 2026-01-05T12:30:00Z） |
| **JSON**     | ジェイソン   | データ交換用のテキスト形式                     |
| **Markdown** | マークダウン | 軽量なテキスト整形言語                         |
| **CASCADE**  | カスケード   | 親データ削除時に子データも連動削除             |
| **CRUD**     | クラッド     | Create/Read/Update/Delete（基本操作の頭文字）  |

---

## まとめ

この実装では以下の設計原則を採用しています:

1. **3層アーキテクチャ**: サービス層・リポジトリ層・データベース層の分離
2. **リポジトリパターン**: データアクセスの抽象化
3. **依存性注入**: テスト容易性と柔軟性の確保
4. **ソフトデリート**: データ復元可能性と監査証跡の確保
5. **非正規化**: 検索・表示性能の最適化
6. **インデックス設計**: クエリ性能の最適化

これらにより、**保守性**・**テスト容易性**・**性能**のバランスを取った実装を実現しています。
