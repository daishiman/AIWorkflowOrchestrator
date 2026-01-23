/**
 * システムプロンプトテンプレートスキーマ定義
 *
 * @description
 * システムプロンプトテンプレートを保存するためのDrizzle ORMスキーマ定義。
 * Turso（libSQL/SQLite）+ Drizzle ORMに最適化されたスキーマ設計。
 *
 * @see docs/30-workflows/system-prompt-db/phase-2-design.md
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/database-schema-design.md
 */

import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ============================================================
// system_prompt_templates テーブル
// ============================================================

/**
 * システムプロンプトテンプレートテーブル
 *
 * ユーザーが作成したカスタムシステムプロンプトテンプレートを管理する。
 * プリセットテンプレートは isPreset=true かつ userId="__SYSTEM__" で識別される。
 */
export const systemPromptTemplates = sqliteTable(
  "system_prompt_templates",
  {
    /**
     * テンプレート一意識別子（UUID v4）
     */
    id: text("id").primaryKey(),

    /**
     * ユーザーID
     * プリセットテンプレートの場合は "__SYSTEM__"
     */
    userId: text("user_id").notNull(),

    /**
     * テンプレート名（1〜50文字）
     * ユーザーIDごとに一意
     */
    name: text("name").notNull(),

    /**
     * テンプレート本文（1〜4000文字）
     */
    content: text("content").notNull(),

    /**
     * プリセットフラグ（0: false, 1: true）
     * SQLiteはBOOLEAN型をネイティブサポートしないため INTEGER を使用
     */
    isPreset: integer("is_preset", { mode: "boolean" })
      .notNull()
      .default(false),

    /**
     * 作成日時（Unix timestamp in milliseconds）
     */
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),

    /**
     * 最終更新日時（Unix timestamp in milliseconds）
     */
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    // ユーザーIDでの検索最適化
    index("idx_system_prompt_templates_user_id").on(table.userId),

    // テンプレート名での検索最適化
    index("idx_system_prompt_templates_name").on(table.name),

    // プリセットフラグでの検索最適化
    index("idx_system_prompt_templates_is_preset").on(table.isPreset),

    // ユーザーごとのテンプレート名の一意性保証
    uniqueIndex("idx_system_prompt_templates_user_name").on(
      table.userId,
      table.name,
    ),
  ],
);

// ============================================================
// 型定義（Drizzle推論）
// ============================================================

/**
 * システムプロンプトテンプレートレコード型（SELECT結果）
 */
export type SystemPromptTemplateRecord =
  typeof systemPromptTemplates.$inferSelect;

/**
 * 新規システムプロンプトテンプレートレコード型（INSERT用）
 */
export type NewSystemPromptTemplateRecord =
  typeof systemPromptTemplates.$inferInsert;

// ============================================================
// プリセット用定数
// ============================================================

/**
 * プリセットテンプレートのシステムユーザーID
 */
export const SYSTEM_USER_ID = "__SYSTEM__";
