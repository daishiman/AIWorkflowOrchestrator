import { relations } from "drizzle-orm";
import { files } from "./files";
import { conversions } from "./conversions";
import { extractedMetadata } from "./extracted-metadata";
import { chunks } from "./chunks";

/**
 * filesテーブルのリレーション定義
 *
 * @remarks
 * - conversions: 1つのファイルは複数の変換履歴を持つ（1:N）
 *   - ファイルが削除されると、関連する変換履歴もCASCADE DELETEにより自動削除される
 *
 * @example
 * ```typescript
 * // ファイルと関連する変換履歴を一括取得
 * const fileWithConversions = await db.query.files.findFirst({
 *   where: eq(files.id, fileId),
 *   with: {
 *     conversions: true, // 1:N relation
 *   },
 * });
 * ```
 */
export const filesRelations = relations(files, ({ many }) => ({
  /** 変換履歴リスト（1:N） */
  conversions: many(conversions),

  /** チャンクリスト（1:N） */
  chunks: many(chunks),
}));

/**
 * conversionsテーブルのリレーション定義
 *
 * @remarks
 * - file: 1つの変換履歴は1つのファイルに属する（N:1）
 * - extractedMetadata: 1つの変換履歴は1つのメタデータを持つ（1:1）
 *   - 変換履歴が削除されると、関連するメタデータもCASCADE DELETEにより自動削除される
 *
 * カスケード削除の流れ:
 * ファイル削除 → 変換履歴削除（CASCADE） → メタデータ削除（CASCADE）
 *
 * @example
 * ```typescript
 * // 変換履歴と関連するファイル、メタデータを一括取得
 * const conversionWithRelations = await db.query.conversions.findFirst({
 *   where: eq(conversions.id, conversionId),
 *   with: {
 *     file: true,              // N:1 relation
 *     extractedMetadata: true, // 1:1 relation
 *   },
 * });
 * ```
 */
export const conversionsRelations = relations(conversions, ({ one }) => ({
  /**
   * 親ファイル（N:1）
   * conversions.fileId → files.id
   */
  file: one(files, {
    fields: [conversions.fileId],
    references: [files.id],
  }),

  /**
   * 抽出メタデータ（1:1）
   * conversions.id → extractedMetadata.conversionId
   */
  extractedMetadata: one(extractedMetadata, {
    fields: [conversions.id],
    references: [extractedMetadata.conversionId],
  }),
}));

/**
 * extractedMetadataテーブルのリレーション定義
 *
 * @remarks
 * - conversion: 1つのメタデータは1つの変換履歴に属する（1:1）
 *   - conversionIdにUNIQUE制約があり、1つの変換に対して複数のメタデータは作成できない
 *
 * @example
 * ```typescript
 * // メタデータと関連する変換履歴、ファイルを一括取得
 * const metadataWithRelations = await db.query.extractedMetadata.findFirst({
 *   where: eq(extractedMetadata.id, metadataId),
 *   with: {
 *     conversion: {
 *       with: {
 *         file: true, // 2段階のリレーション取得も可能
 *       },
 *     },
 *   },
 * });
 * ```
 */
export const extractedMetadataRelations = relations(
  extractedMetadata,
  ({ one }) => ({
    /**
     * 親変換履歴（1:1）
     * extractedMetadata.conversionId → conversions.id
     */
    conversion: one(conversions, {
      fields: [extractedMetadata.conversionId],
      references: [conversions.id],
    }),
  }),
);

/**
 * chunksテーブルのリレーション定義
 *
 * @remarks
 * - file: 1つのチャンクは1つのファイルに属する（N:1）
 *   - chunks.fileId → files.id
 * - prevChunk: 前のチャンクへの自己参照（1:1, nullable）
 *   - chunks.prevChunkId → chunks.id
 * - nextChunk: 次のチャンクへの自己参照（1:1, nullable）
 *   - chunks.nextChunkId → chunks.id
 *
 * カスケード削除の流れ:
 * ファイル削除 → 全チャンク削除（CASCADE）
 *
 * @example
 * ```typescript
 * // チャンクと関連するファイル、隣接チャンクを一括取得
 * const chunkWithRelations = await db.query.chunks.findFirst({
 *   where: eq(chunks.id, chunkId),
 *   with: {
 *     file: true,      // N:1 relation
 *     prevChunk: true, // 1:1 self-reference
 *     nextChunk: true, // 1:1 self-reference
 *   },
 * });
 *
 * // ファイルの全チャンクを順序付きで取得
 * const fileWithChunks = await db.query.files.findFirst({
 *   where: eq(files.id, fileId),
 *   with: {
 *     chunks: {
 *       orderBy: (chunks, { asc }) => [asc(chunks.chunkIndex)],
 *     },
 *   },
 * });
 * ```
 */
export const chunksRelations = relations(chunks, ({ one }) => ({
  /**
   * 親ファイル（N:1）
   * chunks.fileId → files.id
   */
  file: one(files, {
    fields: [chunks.fileId],
    references: [files.id],
  }),

  /**
   * 前のチャンク（1:1, nullable）
   * chunks.prevChunkId → chunks.id
   * @description 連結リスト構造で前のチャンクを参照
   */
  prevChunk: one(chunks, {
    fields: [chunks.prevChunkId],
    references: [chunks.id],
    relationName: "prevChunkRelation",
  }),

  /**
   * 次のチャンク（1:1, nullable）
   * chunks.nextChunkId → chunks.id
   * @description 連結リスト構造で次のチャンクを参照
   */
  nextChunk: one(chunks, {
    fields: [chunks.nextChunkId],
    references: [chunks.id],
    relationName: "nextChunkRelation",
  }),
}));
