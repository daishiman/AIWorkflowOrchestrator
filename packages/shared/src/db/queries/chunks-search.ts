/**
 * FTS5検索クエリビルダー
 *
 * chunks_fts FTS5仮想テーブルに対する検索クエリを構築し、
 * 結果を整形する関数群を提供。
 *
 * @see docs/30-workflows/rag-conversion-system/design-chunks-search.md
 */

import { z } from "zod";
import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

// ============================================
// Zod スキーマ定義
// ============================================

/**
 * 検索オプションのスキーマ
 */
export const SearchOptionsSchema = z.object({
  /**
   * 検索クエリ文字列
   */
  query: z.string().min(1, "検索クエリは必須です"),

  /**
   * 最大返却件数
   * @default 10
   */
  limit: z.number().int().positive().max(100).default(10),

  /**
   * オフセット（ページネーション）
   * @default 0
   */
  offset: z.number().int().nonnegative().default(0),

  /**
   * 特定ファイルに検索を限定
   */
  fileId: z.string().uuid().optional(),

  /**
   * ハイライトタグ
   * @default ["<mark>", "</mark>"]
   */
  highlightTags: z
    .tuple([z.string(), z.string()])
    .default(["<mark>", "</mark>"]),

  /**
   * BM25スケールファクター（スコア正規化用）
   * @default 0.5
   */
  bm25ScaleFactor: z.number().positive().default(0.5),
});

export type SearchOptions = z.infer<typeof SearchOptionsSchema>;

/**
 * NEAR検索オプションのスキーマ
 */
export const NearSearchOptionsSchema = SearchOptionsSchema.omit({
  query: true,
}).extend({
  /**
   * NEAR演算子の距離
   * @description 単語間の最大距離（トークン数）
   * @default 5
   */
  nearDistance: z.number().int().positive().max(50).default(5),
});

export type NearSearchOptions = z.infer<typeof NearSearchOptionsSchema>;

/**
 * FTS5検索結果の型
 */
export const FtsSearchResultSchema = z.object({
  /**
   * チャンクID
   */
  id: z.string().uuid(),

  /**
   * ファイルID
   */
  fileId: z.string().uuid(),

  /**
   * チャンク本文
   */
  content: z.string(),

  /**
   * コンテキスト付きテキスト
   */
  contextualContent: z.string().nullable(),

  /**
   * 親見出し
   */
  parentHeader: z.string().nullable(),

  /**
   * 正規化されたBM25スコア（0-1）
   */
  score: z.number().min(0).max(1),

  /**
   * ハイライト付きコンテンツ
   */
  highlightedContent: z.string(),

  /**
   * チャンク順序
   */
  chunkIndex: z.number().int().nonnegative(),
});

export type FtsSearchResult = z.infer<typeof FtsSearchResultSchema>;

/**
 * 検索レスポンスの型
 */
export const SearchResponseSchema = z.object({
  /**
   * 検索結果の配列
   */
  results: z.array(FtsSearchResultSchema),

  /**
   * 総件数
   */
  totalCount: z.number().int().nonnegative(),

  /**
   * 検索に使用したクエリ
   */
  query: z.string(),

  /**
   * ページネーション情報
   */
  pagination: z.object({
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ============================================
// ユーティリティ関数
// ============================================

/**
 * FTS5予約語リスト
 * @description 将来のクエリ検証に使用予定
 */
const _RESERVED_KEYWORDS = ["AND", "OR", "NOT", "NEAR"];

/**
 * FTS5テーブルのcontentカラムインデックス
 * @description highlight()関数で使用される0番目のカラム
 */
const CONTENT_COLUMN_INDEX = 0;

/**
 * FTS5クエリの特殊文字をエスケープ
 *
 * @description
 * FTS5インジェクション攻撃を防ぐため、以下の処理を実行:
 * 1. FTS5特殊文字のエスケープ
 * 2. FTS5予約語のクォート
 *
 * @param query - ユーザー入力文字列
 * @returns エスケープ済みクエリ
 *
 * @example
 * ```typescript
 * escapeFts5Query('hello "world"')
 * // => 'hello \\"world\\"'
 *
 * escapeFts5Query('TypeScript AND React')
 * // => 'TypeScript "AND" React'
 * ```
 */
export function escapeFts5Query(query: string): string {
  if (!query) return "";

  // 1. 特殊文字をエスケープ
  // エスケープ対象: " * ^ ( ) - + : { }
  let escaped = query.replace(/["*^()\-+:{}]/g, "\\$&");

  // 2. 予約語をクォート（大文字小文字不問）
  const reservedPattern = /\b(AND|OR|NOT|NEAR)\b/gi;
  escaped = escaped.replace(reservedPattern, '"$1"');

  return escaped;
}

/**
 * BM25スコアをシグモイド関数で0-1範囲に正規化
 *
 * @description
 * FTS5の`bm25()`関数は負の値を返す（小さいほど関連性が高い）
 * シグモイド関数で0-1に変換し、1が最も関連性が高いスコアとする
 *
 * @param rawScore - FTS5の`bm25()`生スコア（負の値）
 * @param scaleFactor - スケールファクター（デフォルト: 0.5）
 * @returns 正規化されたスコア（0-1、1が最高）
 *
 * @example
 * ```typescript
 * normalizeBm25Score(-2.5, 0.5)
 * // => 0.7773 (sigmoid変換後)
 *
 * normalizeBm25Score(-10.0, 0.5)
 * // => 0.9933 (非常に関連性が高い)
 * ```
 */
export function normalizeBm25Score(
  rawScore: number,
  scaleFactor: number = 0.5,
): number {
  // rawScoreは負の値（小さいほど関連性が高い）
  // シグモイド関数で0-1に変換
  const normalizedScore = 1 / (1 + Math.exp(rawScore * scaleFactor));

  // 小数点4桁で丸める
  return Math.round(normalizedScore * 10000) / 10000;
}

/**
 * SQLiteのhighlight()関数を使用してハイライトSQL生成
 *
 * @param tags - [開始タグ, 終了タグ]
 * @returns SQLite highlight()関数呼び出し文字列
 *
 * @example
 * ```typescript
 * extractHighlights(["<mark>", "</mark>"])
 * // => "highlight(chunks_fts, 0, '<mark>', '</mark>')"
 * ```
 */
export function extractHighlights(tags: [string, string]): string {
  const [startTag, endTag] = tags;
  // SQLiteのhighlight()関数
  // highlight(table, column_index, start_tag, end_tag)
  return `highlight(chunks_fts, ${CONTENT_COLUMN_INDEX}, '${startTag}', '${endTag}')`;
}

// ============================================
// 検索関数
// ============================================

/**
 * 検索結果の生データ型
 */
interface RawSearchResult {
  id: string;
  file_id: string;
  content: string;
  contextual_content: string | null;
  parent_header: string | null;
  chunk_index: number;
  raw_score: number;
  highlighted_content: string;
}

/**
 * キーワード検索（OR検索）
 *
 * @description
 * 複数のキーワードをスペース区切りで指定し、いずれかに一致するチャンクを取得
 *
 * @param db - Drizzle ORMデータベースインスタンス
 * @param options - 検索オプション
 * @returns 検索結果
 *
 * @throws {ZodError} 入力検証エラー
 *
 * @example
 * ```typescript
 * const results = await searchChunksByKeyword(db, {
 *   query: "TypeScript React",
 *   limit: 20,
 *   fileId: "abc-123",
 * });
 * ```
 */
export async function searchChunksByKeyword(
  db: LibSQLDatabase<Record<string, never>>,
  options: SearchOptions,
): Promise<SearchResponse> {
  // 入力検証
  const validated = SearchOptionsSchema.parse(options);
  const { query, limit, offset, fileId, highlightTags, bm25ScaleFactor } =
    validated;

  // クエリエスケープ
  const escapedQuery = escapeFts5Query(query);

  // ハイライト関数
  const highlightSql = extractHighlights(highlightTags);

  // 総件数取得クエリ
  const countQuery = fileId
    ? sql`
        SELECT COUNT(*) as count
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${escapedQuery}
        AND chunks.file_id = ${fileId}
      `
    : sql`
        SELECT COUNT(*) as count
        FROM chunks_fts
        WHERE chunks_fts MATCH ${escapedQuery}
      `;

  const countResult = await db.all<{ count: number }>(countQuery);
  const totalCount = countResult[0]?.count ?? 0;

  // 検索実行
  const searchQuery = fileId
    ? sql`
        SELECT
          chunks.id as id,
          chunks.file_id as file_id,
          chunks.content as content,
          chunks.contextual_content as contextual_content,
          chunks.parent_header as parent_header,
          chunks.chunk_index as chunk_index,
          bm25(chunks_fts) as raw_score,
          ${sql.raw(highlightSql)} as highlighted_content
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${escapedQuery}
        AND chunks.file_id = ${fileId}
        ORDER BY bm25(chunks_fts)
        LIMIT ${limit}
        OFFSET ${offset}
      `
    : sql`
        SELECT
          chunks.id as id,
          chunks.file_id as file_id,
          chunks.content as content,
          chunks.contextual_content as contextual_content,
          chunks.parent_header as parent_header,
          chunks.chunk_index as chunk_index,
          bm25(chunks_fts) as raw_score,
          ${sql.raw(highlightSql)} as highlighted_content
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${escapedQuery}
        ORDER BY bm25(chunks_fts)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

  const rawResults = await db.all<RawSearchResult>(searchQuery);

  // スコア正規化と結果整形
  const results: FtsSearchResult[] = rawResults.map((row) => ({
    id: row.id,
    fileId: row.file_id,
    content: row.content,
    contextualContent: row.contextual_content,
    parentHeader: row.parent_header,
    chunkIndex: row.chunk_index,
    score: normalizeBm25Score(row.raw_score, bm25ScaleFactor),
    highlightedContent: row.highlighted_content,
  }));

  return {
    results,
    totalCount,
    query: escapedQuery,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    },
  };
}

/**
 * フレーズ検索（完全一致）
 *
 * @description
 * クエリ文字列を完全一致で検索（単語の順序も一致）
 *
 * @param db - Drizzle ORMデータベースインスタンス
 * @param options - 検索オプション
 * @returns 検索結果
 *
 * @example
 * ```typescript
 * const results = await searchChunksByPhrase(db, {
 *   query: "full text search",
 *   limit: 10,
 * });
 * ```
 */
export async function searchChunksByPhrase(
  db: LibSQLDatabase<Record<string, never>>,
  options: SearchOptions,
): Promise<SearchResponse> {
  // 入力検証
  const validated = SearchOptionsSchema.parse(options);
  const { query, limit, offset, fileId, highlightTags, bm25ScaleFactor } =
    validated;

  // 内部のダブルクォートを削除（フレーズ検索では使用不可）
  const cleanedQuery = query.replace(/"/g, "");

  // フレーズ検索：二重引用符で囲む（escapeFts5Queryは使用しない）
  const phraseQuery = `"${cleanedQuery}"`;

  // ハイライト関数
  const highlightSql = extractHighlights(highlightTags);

  // 総件数取得クエリ
  const countQuery = fileId
    ? sql`
        SELECT COUNT(*) as count
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${phraseQuery}
        AND chunks.file_id = ${fileId}
      `
    : sql`
        SELECT COUNT(*) as count
        FROM chunks_fts
        WHERE chunks_fts MATCH ${phraseQuery}
      `;

  const countResult = await db.all<{ count: number }>(countQuery);
  const totalCount = countResult[0]?.count ?? 0;

  // 検索実行
  const searchQuery = fileId
    ? sql`
        SELECT
          chunks.id as id,
          chunks.file_id as file_id,
          chunks.content as content,
          chunks.contextual_content as contextual_content,
          chunks.parent_header as parent_header,
          chunks.chunk_index as chunk_index,
          bm25(chunks_fts) as raw_score,
          ${sql.raw(highlightSql)} as highlighted_content
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${phraseQuery}
        AND chunks.file_id = ${fileId}
        ORDER BY bm25(chunks_fts)
        LIMIT ${limit}
        OFFSET ${offset}
      `
    : sql`
        SELECT
          chunks.id as id,
          chunks.file_id as file_id,
          chunks.content as content,
          chunks.contextual_content as contextual_content,
          chunks.parent_header as parent_header,
          chunks.chunk_index as chunk_index,
          bm25(chunks_fts) as raw_score,
          ${sql.raw(highlightSql)} as highlighted_content
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${phraseQuery}
        ORDER BY bm25(chunks_fts)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

  const rawResults = await db.all<RawSearchResult>(searchQuery);

  // スコア正規化と結果整形
  const results: FtsSearchResult[] = rawResults.map((row) => ({
    id: row.id,
    fileId: row.file_id,
    content: row.content,
    contextualContent: row.contextual_content,
    parentHeader: row.parent_header,
    chunkIndex: row.chunk_index,
    score: normalizeBm25Score(row.raw_score, bm25ScaleFactor),
    highlightedContent: row.highlighted_content,
  }));

  return {
    results,
    totalCount,
    query: phraseQuery,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    },
  };
}

/**
 * NEAR検索（近接検索）
 *
 * @description
 * 複数のキーワードが指定された距離内に出現するチャンクを検索
 *
 * @param db - Drizzle ORMデータベースインスタンス
 * @param terms - 検索キーワードの配列（2つ以上）
 * @param options - 検索オプション（nearDistance含む）
 * @returns 検索結果
 *
 * @throws {Error} キーワードが2つ未満の場合
 *
 * @example
 * ```typescript
 * const results = await searchChunksByNear(db, ["TypeScript", "interface"], {
 *   nearDistance: 5,
 *   limit: 10,
 * });
 * ```
 */
export async function searchChunksByNear(
  db: LibSQLDatabase<Record<string, never>>,
  terms: string[],
  options: NearSearchOptions,
): Promise<SearchResponse> {
  // 入力検証
  if (terms.length < 2) {
    throw new Error("NEAR検索には2つ以上のキーワードが必要です");
  }

  const validated = NearSearchOptionsSchema.parse(options);
  const {
    nearDistance,
    limit,
    offset,
    fileId,
    highlightTags,
    bm25ScaleFactor,
  } = validated;

  // 各キーワードから特殊文字を削除して二重引用符で囲む
  // FTS5のNEAR構文では、エスケープではなくクリーンな文字列が必要
  const cleanedTerms = terms.map((term) => {
    const cleaned = term.replace(/["*^()\-+:{}]/g, "");
    return `"${cleaned}"`;
  });

  // NEAR演算子クエリ構築
  const nearQuery = `NEAR(${cleanedTerms.join(" ")}, ${nearDistance})`;

  // ハイライト関数
  const highlightSql = extractHighlights(highlightTags);

  // 総件数取得クエリ
  const countQuery = fileId
    ? sql`
        SELECT COUNT(*) as count
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${nearQuery}
        AND chunks.file_id = ${fileId}
      `
    : sql`
        SELECT COUNT(*) as count
        FROM chunks_fts
        WHERE chunks_fts MATCH ${nearQuery}
      `;

  const countResult = await db.all<{ count: number }>(countQuery);
  const totalCount = countResult[0]?.count ?? 0;

  // 検索実行
  const searchQuery = fileId
    ? sql`
        SELECT
          chunks.id as id,
          chunks.file_id as file_id,
          chunks.content as content,
          chunks.contextual_content as contextual_content,
          chunks.parent_header as parent_header,
          chunks.chunk_index as chunk_index,
          bm25(chunks_fts) as raw_score,
          ${sql.raw(highlightSql)} as highlighted_content
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${nearQuery}
        AND chunks.file_id = ${fileId}
        ORDER BY bm25(chunks_fts)
        LIMIT ${limit}
        OFFSET ${offset}
      `
    : sql`
        SELECT
          chunks.id as id,
          chunks.file_id as file_id,
          chunks.content as content,
          chunks.contextual_content as contextual_content,
          chunks.parent_header as parent_header,
          chunks.chunk_index as chunk_index,
          bm25(chunks_fts) as raw_score,
          ${sql.raw(highlightSql)} as highlighted_content
        FROM chunks_fts
        INNER JOIN chunks ON chunks.rowid = chunks_fts.rowid
        WHERE chunks_fts MATCH ${nearQuery}
        ORDER BY bm25(chunks_fts)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

  const rawResults = await db.all<RawSearchResult>(searchQuery);

  // スコア正規化と結果整形
  const results: FtsSearchResult[] = rawResults.map((row) => ({
    id: row.id,
    fileId: row.file_id,
    content: row.content,
    contextualContent: row.contextual_content,
    parentHeader: row.parent_header,
    chunkIndex: row.chunk_index,
    score: normalizeBm25Score(row.raw_score, bm25ScaleFactor),
    highlightedContent: row.highlighted_content,
  }));

  return {
    results,
    totalCount,
    query: nearQuery,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    },
  };
}
