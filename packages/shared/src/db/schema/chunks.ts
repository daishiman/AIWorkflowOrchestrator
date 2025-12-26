import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { files } from "./files";

/**
 * チャンキング戦略のEnum定義
 *
 * @see docs/30-workflows/rag-conversion-system/design-chunks-schema.md
 */
export const chunkStrategies = [
  "fixed_size", // 固定トークン数分割
  "semantic", // セマンティックチャンキング
  "recursive", // 再帰的分割
  "sentence", // 文単位分割
  "paragraph", // 段落単位分割
  "markdown_header", // Markdown見出し基準
  "code_block", // コードブロック単位
] as const;

export type ChunkStrategy = (typeof chunkStrategies)[number];

/**
 * metadata カラムの型定義
 *
 * @description
 * チャンク生成に関するメタデータを格納する JSON 構造
 * 将来的な拡張性を確保するため、追加プロパティを許可
 */
export interface ChunkMetadata {
  /**
   * 言語識別子
   * @example 'typescript', 'python', 'ja', 'en'
   */
  language?: string;

  /**
   * 関数/クラス名
   */
  functionName?: string;

  /**
   * 重要度
   */
  importance?: "low" | "medium" | "high";

  /**
   * カスタムメタデータ
   * @description プロジェクト固有のメタデータを格納可能
   */
  [key: string]: unknown;
}

/**
 * chunksテーブル - RAGシステムのファイルチャンク管理
 *
 * @description
 * - 各チャンクは1つのファイルに属し、位置情報を持つ
 * - FTS5 インデックスと同期し、全文検索を提供
 * - オーバーラップ情報で隣接チャンク間の連続性を管理
 * - ハッシュベースの重複検出をサポート
 *
 * @remarks
 * - 1つのファイルは複数のチャンクを持つことができます（1:N）
 * - ファイルが削除されると、関連するチャンクもCASCADE DELETEにより自動削除されます
 * - FTS5仮想テーブル（chunks_fts）とトリガーにより全文検索インデックスと同期
 *
 * @see docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md
 * @see docs/30-workflows/rag-conversion-system/design-chunks-schema.md
 */
export const chunks = sqliteTable(
  "chunks",
  {
    // ============================================
    // 基本情報
    // ============================================

    /**
     * 主キー（UUID）
     * @default crypto.randomUUID()
     */
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    /**
     * 親ファイルID（外部キー）
     * @references files.id
     * @onDelete CASCADE - ファイル削除時にチャンクも削除
     */
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),

    /**
     * チャンク本文
     * @description FTS5 インデックスに同期される
     */
    content: text("content").notNull(),

    /**
     * コンテキスト付きテキスト
     * @description 親見出し等を含む拡張テキスト（LLM埋め込み用）
     * @nullable チャンク作成時は NULL、後続処理で設定
     */
    contextualContent: text("contextual_content"),

    // ============================================
    // 位置情報
    // ============================================

    /**
     * ファイル内のチャンク順序
     * @description 0始まり、連続する整数
     * @constraint >= 0
     */
    chunkIndex: integer("chunk_index").notNull(),

    /**
     * 開始行番号
     * @description 1始まり（行番号が取得できない場合NULL）
     * @constraint > 0
     */
    startLine: integer("start_line"),

    /**
     * 終了行番号
     * @constraint >= startLine
     */
    endLine: integer("end_line"),

    /**
     * 開始文字位置
     * @description バイトオフセット（0始まり）
     * @constraint >= 0
     */
    startChar: integer("start_char"),

    /**
     * 終了文字位置
     * @constraint >= startChar
     */
    endChar: integer("end_char"),

    /**
     * 親見出しテキスト
     * @description Markdown等の階層構造における親要素
     * @example "## Installation > ### Prerequisites"
     */
    parentHeader: text("parent_header"),

    // ============================================
    // チャンキング情報
    // ============================================

    /**
     * チャンキング戦略
     * @see ChunkStrategy
     * @constraint IN (chunkStrategies)
     */
    strategy: text("strategy").notNull(),

    /**
     * トークン数
     * @description OpenAI tiktoken（cl100k_base）基準
     *
     * ## 意図的非正規化
     * - 理由: tiktoken計算コスト削減（1チャンクあたり5-10ms）
     * - 整合性: INSERT時のみ計算
     */
    tokenCount: integer("token_count"),

    /**
     * チャンクコンテンツのSHA-256ハッシュ
     * @description 重複チャンク検出用（64文字のHEX文字列）
     * @constraint UNIQUE（インデックスで保証）
     */
    hash: text("hash").notNull(),

    // ============================================
    // オーバーラップ情報
    // ============================================

    /**
     * 前のチャンクID
     * @description 自己参照外部キー
     * @nullable 最初のチャンクの場合NULL
     */
    prevChunkId: text("prev_chunk_id"),

    /**
     * 次のチャンクID
     * @description 自己参照外部キー
     * @nullable 最後のチャンクの場合NULL
     */
    nextChunkId: text("next_chunk_id"),

    /**
     * オーバーラップトークン数
     * @description 隣接チャンク間で共有するトークン数
     * @default 0
     * @constraint >= 0
     */
    overlapTokens: integer("overlap_tokens").notNull().default(0),

    // ============================================
    // メタデータ・監査
    // ============================================

    /**
     * JSONメタデータ
     * @description 追加情報（言語、関数名、重要度など）
     */
    metadata: text("metadata", { mode: "json" }).$type<ChunkMetadata>(),

    /**
     * 作成日時（UNIX時刻）
     * @default unixepoch()
     */
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),

    /**
     * 更新日時（UNIX時刻）
     * @default unixepoch()
     */
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // ============================================
    // インデックス定義
    // ============================================

    /**
     * ファイルID インデックス
     * @description ファイル単位の全チャンク取得
     * @query SELECT * FROM chunks WHERE fileId = ?
     */
    fileIdIdx: index("idx_chunks_file_id").on(table.fileId),

    /**
     * ハッシュ インデックス（UNIQUE）
     * @description 重複チャンク検出
     * @query SELECT * FROM chunks WHERE hash = ? LIMIT 1
     */
    hashIdx: uniqueIndex("idx_chunks_hash").on(table.hash),

    /**
     * チャンク順序 複合インデックス
     * @description ファイル内の順序付きチャンク取得
     * @query SELECT * FROM chunks WHERE fileId = ? ORDER BY chunkIndex
     */
    chunkIndexIdx: index("idx_chunks_chunk_index").on(
      table.fileId,
      table.chunkIndex,
    ),

    /**
     * 戦略 インデックス
     * @description 戦略別チャンク統計
     * @query SELECT strategy, COUNT(*) FROM chunks GROUP BY strategy
     */
    strategyIdx: index("idx_chunks_strategy").on(table.strategy),
  }),
);

/**
 * chunksテーブルのSELECT型
 *
 * データベースから取得したチャンクレコードの型定義
 */
export type Chunk = typeof chunks.$inferSelect;

/**
 * chunksテーブルのINSERT型
 *
 * 新規チャンクレコード作成時に使用する型定義
 * デフォルト値を持つカラム（id, createdAt, updatedAt, overlapTokens）はオプショナル
 */
export type NewChunk = typeof chunks.$inferInsert;

/**
 * FTS5 仮想テーブル: chunks_fts
 *
 * @description
 * Drizzle ORM は FTS5 仮想テーブルを直接サポートしないため、
 * マイグレーション SQL で手動作成が必要
 *
 * @see docs/30-workflows/rag-conversion-system/design-chunks-schema.md Section 4
 *
 * @example マイグレーション SQL
 * ```sql
 * CREATE VIRTUAL TABLE chunks_fts USING fts5(
 *   content,
 *   contextual_content,
 *   content='chunks',
 *   content_rowid='rowid',
 *   tokenize='porter unicode61 remove_diacritics 1'
 * );
 *
 * CREATE TRIGGER chunks_fts_insert AFTER INSERT ON chunks BEGIN
 *   INSERT INTO chunks_fts(rowid, content, contextual_content)
 *   VALUES (new.rowid, new.content, new.contextual_content);
 * END;
 *
 * CREATE TRIGGER chunks_fts_update AFTER UPDATE ON chunks BEGIN
 *   UPDATE chunks_fts SET
 *     content = new.content,
 *     contextual_content = new.contextual_content
 *   WHERE rowid = old.rowid;
 * END;
 *
 * CREATE TRIGGER chunks_fts_delete AFTER DELETE ON chunks BEGIN
 *   DELETE FROM chunks_fts WHERE rowid = old.rowid;
 * END;
 * ```
 */
