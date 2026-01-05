import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { conversions } from "./conversions";

/**
 * extractedMetadataテーブル - 変換時に抽出されたメタデータ管理
 *
 * ファイル変換時に抽出された構造化メタデータを保存します。
 * RAG検索のフィルタリング、統計分析、コンテンツ分類に使用されます。
 *
 * @remarks
 * - 1つの変換履歴に対して1つのメタデータレコードが存在します（1:1でconversionsテーブルに紐づく）
 * - conversionIdにUNIQUE制約があり、1つの変換に対して複数のメタデータは作成できません
 * - 変換履歴が削除されると、CASCADE DELETEによりメタデータも自動削除されます
 * - JSON型のカラム（headers, links, custom）は柔軟な構造のデータを保存できます
 *
 * カウント情報の用途:
 * - wordCount: 文書の規模把握、読了時間推定
 * - lineCount: ファイルサイズの目安
 * - charCount: 文字数制限チェック、トークン数推定
 * - codeBlocks: コード含有率の判定
 *
 * @example
 * ```typescript
 * // Markdownファイルのメタデータ抽出
 * const metadata: NewExtractedMetadata = {
 *   id: ulid(),
 *   conversionId: "01H...",
 *   title: "RAGパイプライン設計",
 *   author: "AI Team",
 *   language: "ja", // ISO 639-1
 *   wordCount: 1500,
 *   lineCount: 200,
 *   charCount: 4500,
 *   codeBlocks: 5,
 *   headers: ["# はじめに", "## システム構成", "## データフロー"],
 *   links: ["https://example.com/doc", "https://github.com/repo"],
 *   custom: {
 *     tags: ["RAG", "database", "design"],
 *     priority: "high",
 *     estimatedTokens: 2000,
 *   },
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 * ```
 */
export const extractedMetadata = sqliteTable(
  "extracted_metadata",
  {
    /** 主キー（ULID形式を推奨） */
    id: text("id").primaryKey(),

    /**
     * 外部キー: conversionsテーブルへの参照（UNIQUE制約付き）
     * 1つの変換に対して1つのメタデータのみ存在可能（1:1リレーション）
     * 変換履歴が削除されると、CASCADE DELETEによりメタデータも自動削除される
     */
    conversionId: text("conversion_id")
      .notNull()
      .references(() => conversions.id, { onDelete: "cascade" }),

    /** 文書タイトル（抽出できない場合はNULL） */
    title: text("title"),

    /** 著者名（抽出できない場合はNULL） */
    author: text("author"),

    /**
     * 文書の言語コード（ISO 639-1形式）
     * 例: "en"（英語）, "ja"（日本語）, "zh"（中国語）
     */
    language: text("language"),

    /** 単語数 - 文書の規模把握、読了時間推定に使用 */
    wordCount: integer("word_count").notNull().default(0),

    /** 行数 - ファイルサイズの目安として使用 */
    lineCount: integer("line_count").notNull().default(0),

    /** 文字数 - 文字数制限チェック、トークン数推定に使用 */
    charCount: integer("char_count").notNull().default(0),

    /** コードブロック数 - コード含有率の判定に使用 */
    codeBlocks: integer("code_blocks").notNull().default(0),

    /**
     * 見出し一覧（JSON配列形式）
     * Markdownの# 見出しやHTMLのh1-h6タグを抽出
     * @example ["# Chapter 1", "## Section 1.1", "### Subsection 1.1.1"]
     */
    headers: text("headers", { mode: "json" }).$type<string[]>().default([]),

    /**
     * リンクURL一覧（JSON配列形式）
     * 文書内の外部リンクを抽出
     * @example ["https://example.com", "https://github.com/repo"]
     */
    links: text("links", { mode: "json" }).$type<string[]>().default([]),

    /**
     * カスタムメタデータ（JSON形式）
     * ファイル形式固有のメタデータや拡張情報を自由に保存
     * @example { tags: ["important"], priority: "high", version: "1.0" }
     */
    custom: text("custom", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default({}),

    /** レコード作成日時 */
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

    /** レコード更新日時 */
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    /**
     * 変換ID一意性インデックス
     * 1つの変換に対して1つのメタデータのみ存在することを保証（1:1リレーション）
     */
    conversionIdIdx: uniqueIndex("extracted_metadata_conversion_id_idx").on(
      table.conversionId,
    ),

    /** 言語インデックス - 言語別のフィルタリングを高速化 */
    languageIdx: index("extracted_metadata_language_idx").on(table.language),
  }),
);

/**
 * extractedMetadataテーブルのSELECT型
 *
 * データベースから取得したメタデータレコードの型定義
 */
export type ExtractedMetadata = typeof extractedMetadata.$inferSelect;

/**
 * extractedMetadataテーブルのINSERT型
 *
 * 新規メタデータレコード作成時に使用する型定義
 * デフォルト値を持つカラム（各カウント値、headers, links, custom）はオプショナル
 */
export type NewExtractedMetadata = typeof extractedMetadata.$inferInsert;
