import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * ユーザー設定テーブル (ローカルキャッシュ)
 *
 * Tursoに保存されるユーザー固有の設定データ
 * Supabaseの認証情報とは別に管理される
 */
export const userSettings = sqliteTable(
  "user_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    themeMode: text("theme_mode").notNull().default("system"),
    language: text("language").notNull().default("ja"),
    notificationsEnabled: integer("notifications_enabled", { mode: "boolean" })
      .notNull()
      .default(true),
    autoSyncEnabled: integer("auto_sync_enabled", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_user_settings_user_id").on(table.userId)],
);

export type UserSettingsRecord = typeof userSettings.$inferSelect;
export type NewUserSettingsRecord = typeof userSettings.$inferInsert;

/**
 * ユーザープロフィールキャッシュテーブル
 *
 * Supabaseから取得したプロフィールのオフラインキャッシュ
 */
export const userProfileCache = sqliteTable(
  "user_profile_cache",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    displayName: text("display_name").notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
    plan: text("plan").notNull().default("free"),
    cachedAt: text("cached_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    // Supabaseからのタイムスタンプ（同期判定用）
    supabaseUpdatedAt: text("supabase_updated_at"),
  },
  (table) => [index("idx_user_profile_cache_user_id").on(table.userId)],
);

export type UserProfileCacheRecord = typeof userProfileCache.$inferSelect;
export type NewUserProfileCacheRecord = typeof userProfileCache.$inferInsert;

/**
 * 連携プロバイダーキャッシュテーブル
 *
 * Supabaseから取得した連携プロバイダー情報のキャッシュ
 */
export const linkedProviderCache = sqliteTable(
  "linked_provider_cache",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    provider: text("provider").notNull(), // google, github, discord
    providerId: text("provider_id").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    linkedAt: text("linked_at").notNull(),
    cachedAt: text("cached_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_linked_provider_user_id").on(table.userId),
    index("idx_linked_provider_provider").on(table.provider),
  ],
);

export type LinkedProviderCacheRecord = typeof linkedProviderCache.$inferSelect;
export type NewLinkedProviderCacheRecord =
  typeof linkedProviderCache.$inferInsert;
