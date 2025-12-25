import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * filesテーブル - ファイルメタデータ管理
 *
 * RAGパイプラインに投入されるファイルのメタデータを管理します。
 * ファイルの一意性はSHA-256ハッシュ値で保証され、重複排除に使用されます。
 *
 * @remarks
 * - 1つのファイルは複数の変換履歴（conversionsテーブル）を持つことができます（1:N）
 * - ファイルが削除されると、関連する変換履歴もCASCADE DELETEにより自動削除されます
 * - 論理削除（deletedAt）をサポートし、削除されたファイルも履歴として保持できます
 *
 * @example
 * ```typescript
 * // ファイルの新規登録
 * const newFile: NewFile = {
 *   id: ulid(),
 *   name: "document.md",
 *   path: "/path/to/document.md",
 *   mimeType: "text/markdown",
 *   category: "document",
 *   size: 1024,
 *   hash: "a1b2c3...", // SHA-256
 *   encoding: "utf-8",
 *   lastModified: new Date(),
 *   metadata: JSON.stringify({ tags: ["important"] }),
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 * ```
 */
export const files = sqliteTable(
  "files",
  {
    /** 主キー（ULID形式を推奨） */
    id: text("id").primaryKey(),

    /** ファイル名（拡張子を含む） */
    name: text("name").notNull(),

    /** ファイルの絶対パス */
    path: text("path").notNull(),

    /** MIMEタイプ（例: "text/markdown", "application/pdf"） */
    mimeType: text("mime_type").notNull(),

    /** ファイルカテゴリ（例: "document", "code", "data"） */
    category: text("category").notNull(),

    /** ファイルサイズ（バイト単位） */
    size: integer("size").notNull(),

    /** SHA-256ハッシュ値（64文字16進数文字列）- 重複排除に使用 */
    hash: text("hash").notNull(),

    /** 文字エンコーディング（デフォルト: "utf-8"） */
    encoding: text("encoding").notNull().default("utf-8"),

    /** ファイルシステム上の最終更新日時 */
    lastModified: integer("last_modified", { mode: "timestamp" }).notNull(),

    /** カスタムメタデータ（JSON形式） */
    metadata: text("metadata").notNull().default("{}"),

    /** レコード作成日時 */
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

    /** レコード更新日時 */
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

    /** 論理削除日時（NULLの場合は削除されていない） */
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => ({
    /** ハッシュ値の一意性インデックス - 重複ファイル検出に使用 */
    hashIdx: uniqueIndex("files_hash_idx").on(table.hash),

    /** パス検索用インデックス - ファイルパスでの検索を高速化 */
    pathIdx: index("files_path_idx").on(table.path),

    /** MIMEタイプ検索用インデックス - ファイルタイプでのフィルタリングを高速化 */
    mimeTypeIdx: index("files_mime_type_idx").on(table.mimeType),

    /** カテゴリ検索用インデックス - カテゴリ別のファイル一覧取得を高速化 */
    categoryIdx: index("files_category_idx").on(table.category),

    /** 作成日時検索用インデックス - 時系列でのソートを高速化 */
    createdAtIdx: index("files_created_at_idx").on(table.createdAt),
  }),
);

/**
 * filesテーブルのSELECT型
 *
 * データベースから取得したファイルレコードの型定義
 */
export type File = typeof files.$inferSelect;

/**
 * filesテーブルのINSERT型
 *
 * 新規ファイルレコード作成時に使用する型定義
 * デフォルト値を持つカラム（encoding, metadata, deletedAt）はオプショナル
 */
export type NewFile = typeof files.$inferInsert;
