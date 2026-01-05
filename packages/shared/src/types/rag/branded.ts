/**
 * @file Branded Types（ID型）定義
 * @module @repo/shared/types/rag/branded
 * @description 異なるIDの誤用をコンパイル時に検出可能にする型システム
 */

// =============================================================================
// Brand型基盤
// =============================================================================

/**
 * ブランド用のユニークシンボル
 * 実行時には存在しない（型レベルのみ）
 */
declare const brand: unique symbol;

/**
 * Branded Type - プリミティブ型に名目的な型情報を付与
 * @template T ベースとなる型（通常はstring）
 * @template B ブランド名（文字列リテラル）
 * @example
 * type UserId = Brand<string, "UserId">;
 * type ProductId = Brand<string, "ProductId">;
 * // UserId と ProductId は構造的には同じだが、型としては互換性がない
 */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

// =============================================================================
// ID型定義
// =============================================================================

/** ファイルを一意に識別するID */
export type FileId = Brand<string, "FileId">;

/** チャンク（分割されたテキスト）を一意に識別するID */
export type ChunkId = Brand<string, "ChunkId">;

/** 変換プロセスを一意に識別するID */
export type ConversionId = Brand<string, "ConversionId">;

/** エンティティ（知識グラフのノード）を一意に識別するID */
export type EntityId = Brand<string, "EntityId">;

/** 関係（知識グラフのエッジ）を一意に識別するID */
export type RelationId = Brand<string, "RelationId">;

/** コミュニティ（エンティティのクラスタ）を一意に識別するID */
export type CommunityId = Brand<string, "CommunityId">;

/** 埋め込みベクトルを一意に識別するID */
export type EmbeddingId = Brand<string, "EmbeddingId">;

// =============================================================================
// 型キャスト関数（既存文字列 → ID型）
// =============================================================================

/**
 * 文字列をFileIdに変換
 * @param id 変換元の文字列
 * @returns FileId型の値
 * @example
 * const id = createFileId("550e8400-e29b-41d4-a716-446655440000");
 */
export const createFileId = (id: string): FileId => id as FileId;

/**
 * 文字列をChunkIdに変換
 * @param id 変換元の文字列
 * @returns ChunkId型の値
 */
export const createChunkId = (id: string): ChunkId => id as ChunkId;

/**
 * 文字列をConversionIdに変換
 * @param id 変換元の文字列
 * @returns ConversionId型の値
 */
export const createConversionId = (id: string): ConversionId =>
  id as ConversionId;

/**
 * 文字列をEntityIdに変換
 * @param id 変換元の文字列
 * @returns EntityId型の値
 */
export const createEntityId = (id: string): EntityId => id as EntityId;

/**
 * 文字列をRelationIdに変換
 * @param id 変換元の文字列
 * @returns RelationId型の値
 */
export const createRelationId = (id: string): RelationId => id as RelationId;

/**
 * 文字列をCommunityIdに変換
 * @param id 変換元の文字列
 * @returns CommunityId型の値
 */
export const createCommunityId = (id: string): CommunityId => id as CommunityId;

/**
 * 文字列をEmbeddingIdに変換
 * @param id 変換元の文字列
 * @returns EmbeddingId型の値
 */
export const createEmbeddingId = (id: string): EmbeddingId => id as EmbeddingId;

// =============================================================================
// UUID生成関数（新規ID生成）
// =============================================================================

/**
 * UUID v4を生成
 * @returns UUID v4形式の文字列
 * @example
 * const uuid = generateUUID(); // "550e8400-e29b-41d4-a716-446655440000"
 */
export const generateUUID = (): string => crypto.randomUUID();

/**
 * 新規FileIdを生成
 * @returns UUID v4形式のFileId
 */
export const generateFileId = (): FileId => createFileId(generateUUID());

/**
 * 新規ChunkIdを生成
 * @returns UUID v4形式のChunkId
 */
export const generateChunkId = (): ChunkId => createChunkId(generateUUID());

/**
 * 新規ConversionIdを生成
 * @returns UUID v4形式のConversionId
 */
export const generateConversionId = (): ConversionId =>
  createConversionId(generateUUID());

/**
 * 新規EntityIdを生成
 * @returns UUID v4形式のEntityId
 */
export const generateEntityId = (): EntityId => createEntityId(generateUUID());

/**
 * 新規RelationIdを生成
 * @returns UUID v4形式のRelationId
 */
export const generateRelationId = (): RelationId =>
  createRelationId(generateUUID());

/**
 * 新規CommunityIdを生成
 * @returns UUID v4形式のCommunityId
 */
export const generateCommunityId = (): CommunityId =>
  createCommunityId(generateUUID());

/**
 * 新規EmbeddingIdを生成
 * @returns UUID v4形式のEmbeddingId
 */
export const generateEmbeddingId = (): EmbeddingId =>
  createEmbeddingId(generateUUID());
