# データベーススキーマ設計書

## 1. 概要

### 1.1 データベース構成

| データベース            | 用途                 | テクノロジー        |
| ----------------------- | -------------------- | ------------------- |
| **Supabase PostgreSQL** | 認証・プロフィール   | PostgreSQL + RLS    |
| **Turso**               | ビジネスデータ       | libSQL (SQLite互換) |
| **ローカルSQLite**      | オフラインキャッシュ | better-sqlite3      |

### 1.2 データ配置方針

```
┌─────────────────────────────────────────────────────────────────────┐
│                        データ配置方針                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Supabase (認証・プロフィール)                                       │
│  ├── auth.users (Supabase管理)                                      │
│  └── public.user_profiles (プロフィール)                            │
│                                                                      │
│  Turso (ビジネスデータ - user_idで紐づけ)                           │
│  ├── user_settings (ユーザー設定)                                   │
│  ├── workflows (ワークフロー定義)                                   │
│  ├── executions (実行履歴)                                          │
│  ├── logs (実行ログ)                                                │
│  ├── chat_messages (チャット履歴)                                   │
│  └── rag_documents (RAGドキュメント)                                │
│                                                                      │
│  ローカルSQLite (キャッシュ)                                        │
│  └── Tursoテーブルのレプリカ (Embedded Replicas)                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Supabase スキーマ

### 2.1 user_profiles テーブル

```sql
-- Supabase PostgreSQL
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみ参照可能
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 新規ユーザー作成時に自動でプロフィール作成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.2 Supabase Storage 設定

```sql
-- avatars バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- アバターアップロードポリシー（認証済みユーザーのみ）
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- アバター更新ポリシー
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- アバター削除ポリシー
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 公開読み取りポリシー
CREATE POLICY "Public avatar access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
```

---

## 3. Turso スキーマ (Drizzle ORM)

### 3.1 user_settings テーブル

```typescript
// packages/shared/infrastructure/database/schema/user-settings.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const userSettings = sqliteTable("user_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  themeMode: text("theme_mode", { enum: ["light", "dark", "system"] }).default(
    "system",
  ),
  language: text("language", { enum: ["ja", "en"] }).default("ja"),
  notificationsEnabled: integer("notifications_enabled", {
    mode: "boolean",
  }).default(true),
  autoSyncEnabled: integer("auto_sync_enabled", { mode: "boolean" }).default(
    true,
  ),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 型推論
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
```

### 3.2 workflows テーブル（既存拡張）

```typescript
// packages/shared/infrastructure/database/schema/workflows.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const workflows = sqliteTable("workflows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(), // 追加: Supabase user_id
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", {
    enum: ["file_trigger", "schedule", "manual", "api"],
  }).notNull(),
  triggerPath: text("trigger_path"),
  config: text("config", { mode: "json" }).$type<WorkflowConfig>(),
  status: text("status", { enum: ["active", "inactive", "error"] }).default(
    "inactive",
  ),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// インデックス
export const workflowsIndexes = {
  userIdIdx: index("idx_workflows_user_id").on(workflows.userId),
  statusIdx: index("idx_workflows_status").on(workflows.status),
};

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
```

### 3.3 chat_messages テーブル

```typescript
// packages/shared/infrastructure/database/schema/chat-messages.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  conversationId: text("conversation_id").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  model: text("model"), // 'gpt-4', 'claude-3', etc.
  tokenCount: integer("token_count"),
  metadata: text("metadata", { mode: "json" }).$type<ChatMetadata>(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// インデックス
export const chatMessagesIndexes = {
  userIdIdx: index("idx_chat_messages_user_id").on(chatMessages.userId),
  conversationIdIdx: index("idx_chat_messages_conversation_id").on(
    chatMessages.conversationId,
  ),
  createdAtIdx: index("idx_chat_messages_created_at").on(
    chatMessages.createdAt,
  ),
};

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

interface ChatMetadata {
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
  finishReason?: string;
}
```

### 3.4 rag_documents テーブル

```typescript
// packages/shared/infrastructure/database/schema/rag-documents.ts
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const ragDocuments = sqliteTable("rag_documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull(), // 重複検出用
  source: text("source"), // ファイルパス or URL
  sourceType: text("source_type", { enum: ["file", "url", "manual"] }).default(
    "manual",
  ),
  embedding: blob("embedding", { mode: "buffer" }), // ベクトル埋め込み
  chunkIndex: integer("chunk_index").default(0),
  metadata: text("metadata", { mode: "json" }).$type<RagMetadata>(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// インデックス
export const ragDocumentsIndexes = {
  userIdIdx: index("idx_rag_documents_user_id").on(ragDocuments.userId),
  contentHashIdx: index("idx_rag_documents_content_hash").on(
    ragDocuments.contentHash,
  ),
};

export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;

interface RagMetadata {
  fileType?: string;
  fileSize?: number;
  lastModified?: string;
  tags?: string[];
}
```

### 3.5 スキーマ統合エクスポート

```typescript
// packages/shared/infrastructure/database/schema/index.ts
export * from "./user-settings";
export * from "./workflows";
export * from "./executions";
export * from "./logs";
export * from "./chat-messages";
export * from "./rag-documents";
```

---

## 4. マイグレーション

### 4.1 Drizzle マイグレーション設定

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/shared/infrastructure/database/schema/index.ts",
  out: "./packages/shared/infrastructure/database/migrations",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

### 4.2 マイグレーション生成・実行

```bash
# マイグレーション生成
pnpm drizzle-kit generate:sqlite

# マイグレーション適用
pnpm drizzle-kit push:sqlite

# マイグレーション状態確認
pnpm drizzle-kit check:sqlite
```

### 4.3 user_settings 追加マイグレーション

```sql
-- migrations/0002_add_user_settings.sql
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  theme_mode TEXT DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'ja' CHECK (language IN ('ja', 'en')),
  notifications_enabled INTEGER DEFAULT 1,
  auto_sync_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
```

### 4.4 既存テーブルへの user_id 追加

```sql
-- migrations/0003_add_user_id_to_workflows.sql
-- 既存の workflows テーブルに user_id を追加

-- 一時テーブル作成
CREATE TABLE workflows_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'legacy', -- 既存データ用
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('file_trigger', 'schedule', 'manual', 'api')),
  trigger_path TEXT,
  config TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- データ移行
INSERT INTO workflows_new (id, name, description, type, trigger_path, config, status, created_at, updated_at)
SELECT id, name, description, type, trigger_path, config, status, created_at, updated_at
FROM workflows;

-- テーブル入れ替え
DROP TABLE workflows;
ALTER TABLE workflows_new RENAME TO workflows;

-- インデックス再作成
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);
```

---

## 5. ER図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Entity Relationship                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Supabase                                  │   │
│  │                                                                  │   │
│  │  ┌────────────────┐        1:1        ┌────────────────┐        │   │
│  │  │  auth.users    │◄─────────────────►│ user_profiles  │        │   │
│  │  │                │                   │                │        │   │
│  │  │  id (PK)       │                   │  id (PK, FK)   │        │   │
│  │  │  email         │                   │  display_name  │        │   │
│  │  │  created_at    │                   │  email         │        │   │
│  │  └────────────────┘                   │  avatar_url    │        │   │
│  │                                       │  plan          │        │   │
│  │                                       └────────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              │ user_id (FK via application logic)       │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                          Turso                                   │   │
│  │                                                                  │   │
│  │  ┌────────────────┐       ┌────────────────┐                    │   │
│  │  │ user_settings  │       │   workflows    │                    │   │
│  │  │                │       │                │                    │   │
│  │  │ id (PK)        │       │ id (PK)        │                    │   │
│  │  │ user_id (UQ)   │       │ user_id        │◄──┐                │   │
│  │  │ theme_mode     │       │ name           │   │                │   │
│  │  │ language       │       │ type           │   │                │   │
│  │  │ ...            │       │ status         │   │                │   │
│  │  └────────────────┘       └────────┬───────┘   │                │   │
│  │                                    │           │                │   │
│  │                               1:N  │           │                │   │
│  │                                    ▼           │                │   │
│  │                           ┌────────────────┐   │                │   │
│  │                           │  executions    │   │                │   │
│  │                           │                │   │                │   │
│  │                           │ id (PK)        │   │                │   │
│  │                           │ workflow_id(FK)│   │                │   │
│  │                           │ status         │   │                │   │
│  │                           └────────┬───────┘   │                │   │
│  │                                    │           │                │   │
│  │                               1:N  │           │                │   │
│  │                                    ▼           │                │   │
│  │                           ┌────────────────┐   │                │   │
│  │                           │     logs       │   │                │   │
│  │                           │                │   │                │   │
│  │                           │ id (PK)        │   │                │   │
│  │                           │ execution_id   │   │                │   │
│  │                           │ level          │   │                │   │
│  │                           │ message        │   │                │   │
│  │                           └────────────────┘   │                │   │
│  │                                                │                │   │
│  │  ┌────────────────┐       ┌────────────────┐   │                │   │
│  │  │ chat_messages  │       │ rag_documents  │   │                │   │
│  │  │                │       │                │   │                │   │
│  │  │ id (PK)        │       │ id (PK)        │   │                │   │
│  │  │ user_id ───────┼───────┼─► user_id ─────┼───┘                │   │
│  │  │ conversation_id│       │ title          │                    │   │
│  │  │ role           │       │ content        │                    │   │
│  │  │ content        │       │ embedding      │                    │   │
│  │  └────────────────┘       └────────────────┘                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. インデックス設計

### 6.1 Supabase インデックス

| テーブル      | インデックス名          | カラム | 用途           |
| ------------- | ----------------------- | ------ | -------------- |
| user_profiles | idx_user_profiles_email | email  | メール検索     |
| user_profiles | (PK)                    | id     | ユーザーID検索 |

### 6.2 Turso インデックス

| テーブル      | インデックス名                    | カラム          | 用途                       |
| ------------- | --------------------------------- | --------------- | -------------------------- |
| user_settings | idx_user_settings_user_id         | user_id         | ユーザー別設定取得         |
| workflows     | idx_workflows_user_id             | user_id         | ユーザー別ワークフロー取得 |
| workflows     | idx_workflows_status              | status          | ステータス別フィルタ       |
| executions    | idx_executions_workflow_id        | workflow_id     | ワークフロー別実行履歴     |
| executions    | idx_executions_started_at         | started_at      | 時系列検索                 |
| logs          | idx_logs_execution_id             | execution_id    | 実行別ログ取得             |
| chat_messages | idx_chat_messages_user_id         | user_id         | ユーザー別チャット取得     |
| chat_messages | idx_chat_messages_conversation_id | conversation_id | 会話別メッセージ取得       |
| chat_messages | idx_chat_messages_created_at      | created_at      | 時系列検索                 |
| rag_documents | idx_rag_documents_user_id         | user_id         | ユーザー別ドキュメント取得 |
| rag_documents | idx_rag_documents_content_hash    | content_hash    | 重複検出                   |

---

## 7. データアクセスパターン

### 7.1 認証時のデータ取得

```typescript
// 認証成功後のデータ取得フロー
async function onAuthSuccess(userId: string) {
  // 1. Supabase からプロフィール取得
  const profile = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // 2. Turso から設定取得（なければ作成）
  let settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .get();

  if (!settings) {
    settings = await db
      .insert(userSettings)
      .values({ userId })
      .returning()
      .get();
  }

  return { profile: profile.data, settings };
}
```

### 7.2 ワークフロー取得（ユーザー別）

```typescript
// ユーザーのワークフロー一覧取得
async function getUserWorkflows(userId: string) {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.userId, userId))
    .orderBy(desc(workflows.updatedAt));
}
```

### 7.3 チャット履歴取得

```typescript
// 会話のメッセージ取得
async function getConversationMessages(
  userId: string,
  conversationId: string,
  limit = 50,
) {
  return db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.conversationId, conversationId),
      ),
    )
    .orderBy(asc(chatMessages.createdAt))
    .limit(limit);
}
```

---

## 8. バックアップ・リカバリ

### 8.1 Supabase

- 自動バックアップ（Pro プラン: 7日間保持）
- Point-in-Time Recovery（Pro プラン）
- 手動バックアップ: `pg_dump`

### 8.2 Turso

- 自動バックアップ（14日間保持）
- ブランチ機能による開発環境分離
- 手動バックアップ: CLI経由でエクスポート

```bash
# Turso バックアップ
turso db shell <db-name> .dump > backup.sql
```

### 8.3 ローカルSQLite

- Embedded Replicas により自動同期
- アプリ終了時に自動保存
- 手動バックアップは不要（Tursoが正本）

---

## 9. セキュリティ考慮事項

### 9.1 Supabase RLS

- すべてのテーブルでRLS有効化
- `auth.uid()` を使用したアクセス制御
- サービスロールキーはバックエンドのみで使用

### 9.2 Turso アクセス制御

- アプリケーション層で `user_id` フィルタを必須化
- Turso Auth Token は SafeStorage で暗号化保存
- 環境変数での認証情報管理

### 9.3 データ暗号化

- 通信: TLS 1.3
- Supabase: サーバーサイド暗号化
- Turso: サーバーサイド暗号化
- ローカル: SQLite暗号化は不要（Tursoが正本）

---

## 10. 参考資料

- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Turso Documentation](https://docs.turso.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
