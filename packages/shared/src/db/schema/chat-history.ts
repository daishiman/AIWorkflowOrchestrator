/**
 * チャット履歴スキーマ定義
 *
 * @description
 * チャットセッションとメッセージを保存するためのDrizzle ORMスキーマ定義。
 * Turso（libSQL/SQLite）+ Drizzle ORMに最適化されたスキーマ設計。
 *
 * @see docs/30-workflows/chat-history-persistence/metadata-specification.md
 * @see docs/30-workflows/chat-history-persistence/task-chat-history-persistence.md
 */

import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================
// chat_sessions テーブル
// ============================================================

/**
 * チャットセッションテーブル
 *
 * ユーザーとAIアシスタント間の会話セッションを管理する。
 * 1つのセッションは複数のメッセージを含む最上位エンティティ。
 */
export const chatSessions = sqliteTable(
  "chat_sessions",
  {
    /**
     * セッション一意識別子（UUID v4）
     */
    id: text("id").primaryKey(),

    /**
     * ユーザーID
     * 将来の認証機能との連携用
     */
    userId: text("user_id").notNull(),

    /**
     * セッションタイトル（3〜100文字）
     * 空の場合は自動生成: "新しいチャット - YYYY-MM-DD HH:mm"
     */
    title: text("title").notNull(),

    /**
     * 作成日時（ISO 8601形式、UTC）
     */
    createdAt: text("created_at").notNull(),

    /**
     * 最終更新日時（ISO 8601形式、UTC）
     * メッセージ追加時に更新
     */
    updatedAt: text("updated_at").notNull(),

    /**
     * セッション内のメッセージ総数
     * 非正規化フィールド（検索・表示最適化用）
     */
    messageCount: integer("message_count").notNull().default(0),

    /**
     * お気に入りフラグ（0: false, 1: true）
     * SQLiteはBOOLEAN型をネイティブサポートしないため INTEGER を使用
     */
    isFavorite: integer("is_favorite").notNull().default(0),

    /**
     * ピン留めフラグ（0: false, 1: true）
     * 最大10件まで（BR-SESSION-002）
     */
    isPinned: integer("is_pinned").notNull().default(0),

    /**
     * ピン留め時の表示順序（1〜10）
     * isPinned = 1 の場合のみ使用
     */
    pinOrder: integer("pin_order"),

    /**
     * 最終メッセージのプレビュー（最大50文字）
     * メッセージ追加時に更新（BR-SESSION-003）
     */
    lastMessagePreview: text("last_message_preview"),

    /**
     * 拡張メタデータ（JSON形式）
     * 将来の拡張用
     */
    metadata: text("metadata").notNull().default("{}"),

    /**
     * 削除日時（ISO 8601形式、UTC）
     * ソフトデリート用。NULLの場合は有効なセッション
     */
    deletedAt: text("deleted_at"),
  },
  (table) => [
    // ユーザーIDでの検索最適化
    index("idx_chat_sessions_user_id").on(table.userId),

    // 作成日時の降順ソート最適化
    index("idx_chat_sessions_created_at").on(table.createdAt),

    // ピン留めセッションの取得最適化
    index("idx_chat_sessions_is_pinned").on(
      table.userId,
      table.isPinned,
      table.pinOrder,
    ),

    // ソフトデリート対応（有効セッション取得最適化）
    index("idx_chat_sessions_deleted_at").on(table.deletedAt),
  ],
);

/**
 * チャットセッションのリレーション定義
 */
export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

// ============================================================
// chat_messages テーブル
// ============================================================

/**
 * チャットメッセージテーブル
 *
 * セッション内の個別の発言（ユーザーまたはアシスタント）を管理する。
 */
export const chatMessages = sqliteTable(
  "chat_messages",
  {
    /**
     * メッセージ一意識別子（UUID v4）
     */
    id: text("id").primaryKey(),

    /**
     * 親セッションID
     * 外部キー制約: ON DELETE CASCADE
     */
    sessionId: text("session_id").notNull(),

    /**
     * メッセージロール
     * "user": ユーザーからの発言
     * "assistant": AIアシスタントからの応答
     */
    role: text("role").notNull(),

    /**
     * メッセージ本文（1〜100,000文字）
     */
    content: text("content").notNull(),

    /**
     * セッション内の順序（0から連番）
     * UNIQUE(session_id, message_index) で一意性を保証
     */
    messageIndex: integer("message_index").notNull(),

    /**
     * メッセージ送信日時（ISO 8601形式、UTC）
     */
    timestamp: text("timestamp").notNull(),

    /**
     * LLMプロバイダー名（アシスタント応答のみ）
     * 例: "openai", "anthropic", "google", "xai"
     */
    llmProvider: text("llm_provider"),

    /**
     * LLMモデル名（アシスタント応答のみ）
     * 例: "gpt-4", "claude-3-5-sonnet-20241022"
     */
    llmModel: text("llm_model"),

    /**
     * LLMメタデータ（JSON形式）
     * トークン使用量、応答時間、モデルパラメータ等
     *
     * @see LlmMetadata 型定義
     */
    llmMetadata: text("llm_metadata"),

    /**
     * 添付ファイル情報（JSON配列形式）
     *
     * @see Attachment[] 型定義
     */
    attachments: text("attachments").notNull().default("[]"),

    /**
     * システムプロンプト（将来対応）
     * アシスタント応答に使用されたシステムプロンプト
     */
    systemPrompt: text("system_prompt"),

    /**
     * 拡張メタデータ（JSON形式）
     * 将来の拡張用
     */
    metadata: text("metadata").notNull().default("{}"),
  },
  (table) => [
    // セッションIDでの検索最適化
    index("idx_chat_messages_session_id").on(table.sessionId),

    // タイムスタンプでの検索最適化
    index("idx_chat_messages_timestamp").on(table.timestamp),

    // ロール別フィルタリング最適化
    index("idx_chat_messages_role").on(table.role),

    // カバリングインデックス（セッション内メッセージの日時降順取得最適化）
    index("idx_chat_messages_session_timestamp").on(
      table.sessionId,
      table.timestamp,
    ),

    // セッション内のメッセージ順序の一意性保証
    uniqueIndex("idx_chat_messages_session_message").on(
      table.sessionId,
      table.messageIndex,
    ),
  ],
);

/**
 * チャットメッセージのリレーション定義
 */
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

// ============================================================
// 型定義（Drizzle推論）
// ============================================================

/**
 * チャットセッションレコード型（SELECT結果）
 */
export type ChatSessionRecord = typeof chatSessions.$inferSelect;

/**
 * 新規チャットセッションレコード型（INSERT用）
 */
export type NewChatSessionRecord = typeof chatSessions.$inferInsert;

/**
 * チャットメッセージレコード型（SELECT結果）
 */
export type ChatMessageRecord = typeof chatMessages.$inferSelect;

/**
 * 新規チャットメッセージレコード型（INSERT用）
 */
export type NewChatMessageRecord = typeof chatMessages.$inferInsert;
