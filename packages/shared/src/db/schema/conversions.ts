import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { files } from "./files";

/**
 * conversionsテーブル - ファイル変換履歴管理
 *
 * ファイルをMarkdownやプレーンテキストに変換した履歴を記録します。
 * 変換結果のキャッシング、エラー追跡、パフォーマンス分析に使用されます。
 *
 * @remarks
 * - 1つのファイルは複数の変換履歴を持つことができます（N:1でfilesテーブルに紐づく）
 * - 1つの変換履歴は1つのメタデータレコードを持ちます（1:1でextractedMetadataテーブルに紐づく）
 * - ファイルが削除されると、CASCADE DELETEにより変換履歴も自動削除されます
 * - inputHashを使用して同一入力の変換をスキップするキャッシング機能を実装できます
 *
 * ステータス遷移:
 * - pending: 変換待ち（初期状態）
 * - processing: 変換処理中
 * - completed: 変換成功
 * - failed: 変換失敗（errorとerrorDetailsに詳細を記録）
 *
 * @example
 * ```typescript
 * // 変換の新規登録
 * const newConversion: NewConversion = {
 *   id: ulid(),
 *   fileId: "01H...",
 *   status: "pending",
 *   converterId: "markdown-converter-v1",
 *   inputHash: "abc123...", // 入力ファイルのハッシュ
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * };
 *
 * // 変換完了時の更新
 * const completed: Partial<Conversion> = {
 *   status: "completed",
 *   outputHash: "def456...",
 *   duration: 1250, // ミリ秒
 *   inputSize: 10240,
 *   outputSize: 8192,
 *   updatedAt: new Date(),
 * };
 * ```
 */
export const conversions = sqliteTable(
  "conversions",
  {
    /** 主キー（ULID形式を推奨） */
    id: text("id").primaryKey(),

    /**
     * 外部キー: filesテーブルへの参照
     * ファイルが削除されると、この変換履歴もCASCADE DELETEにより自動削除される
     */
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),

    /**
     * 変換ステータス
     * - pending: 変換待ち（初期状態）
     * - processing: 変換処理中
     * - completed: 変換成功
     * - failed: 変換失敗
     */
    status: text("status", {
      enum: ["pending", "processing", "completed", "failed"],
    })
      .notNull()
      .default("pending"),

    /** 変換エンジンの識別子（例: "markdown-converter-v1", "plaintext-extractor-v2"） */
    converterId: text("converter_id").notNull(),

    /** 入力ファイルのハッシュ値 - キャッシュヒット判定に使用 */
    inputHash: text("input_hash").notNull(),

    /** 出力結果のハッシュ値 - 変換完了時に設定 */
    outputHash: text("output_hash"),

    /** 変換処理時間（ミリ秒単位） - パフォーマンス分析に使用 */
    duration: integer("duration"),

    /** 入力ファイルサイズ（バイト単位） */
    inputSize: integer("input_size"),

    /** 出力ファイルサイズ（バイト単位） */
    outputSize: integer("output_size"),

    /** エラーメッセージ（statusがfailedの場合に設定） */
    error: text("error"),

    /**
     * エラー詳細情報（JSON形式）
     * スタックトレース、エラーコード、コンテキスト情報などを格納
     */
    errorDetails: text("error_details", { mode: "json" }).$type<
      Record<string, unknown>
    >(),

    /** レコード作成日時 */
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),

    /** レコード更新日時（ステータス変更時に更新） */
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    /** ファイルIDインデックス - 特定ファイルの変換履歴検索を高速化 */
    fileIdIdx: index("conversions_file_id_idx").on(table.fileId),

    /** ステータスインデックス - ステータス別の一覧取得を高速化 */
    statusIdx: index("conversions_status_idx").on(table.status),

    /** 入力ハッシュインデックス - キャッシュヒット判定を高速化 */
    inputHashIdx: index("conversions_input_hash_idx").on(table.inputHash),

    /** 作成日時インデックス - 時系列でのソートを高速化 */
    createdAtIdx: index("conversions_created_at_idx").on(table.createdAt),

    /** 複合インデックス - 特定ファイルの特定ステータスの変換履歴検索を高速化 */
    fileStatusIdx: index("conversions_file_status_idx").on(
      table.fileId,
      table.status,
    ),
  }),
);

/**
 * conversionsテーブルのSELECT型
 *
 * データベースから取得した変換履歴レコードの型定義
 */
export type Conversion = typeof conversions.$inferSelect;

/**
 * conversionsテーブルのINSERT型
 *
 * 新規変換履歴レコード作成時に使用する型定義
 * デフォルト値を持つカラム（status）およびNULL許容カラムはオプショナル
 */
export type NewConversion = typeof conversions.$inferInsert;
