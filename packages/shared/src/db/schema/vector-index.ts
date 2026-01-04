/**
 * ベクトルインデックス管理
 *
 * @description
 * libSQLのDiskANNベクトルインデックスを管理する関数群を提供
 *
 * @see docs/30-workflows/diskann-vector-index/outputs/phase-2/database-schema.md
 */
import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

// ============================================
// 型定義
// ============================================

/**
 * ベクトルインデックス設定
 *
 * @description DiskANNベクトルインデックスの設定パラメータ
 */
export interface VectorIndexConfig {
  /**
   * インデックス名
   * @example "embeddings_vector_idx"
   */
  readonly name: string;

  /**
   * ベクトル次元数
   * @example 1536 (OpenAI text-embedding-3-small)
   */
  readonly dimensions: number;

  /**
   * 距離メトリクス
   * - cosine: コサイン類似度
   * - l2: ユークリッド距離
   * - dot: 内積
   */
  readonly metric: "cosine" | "l2" | "dot";

  /**
   * インデックス内の最大要素数
   * @default 1000000
   */
  readonly maxElements?: number;

  /**
   * インデックス構築時のef値
   * @description 高いほど品質が良いが構築時間が増加
   * @default 200
   */
  readonly efConstruction?: number;

  /**
   * 検索時のef値
   * @description 高いほど品質が良いが検索時間が増加
   * @default 100
   */
  readonly efSearch?: number;
}

/**
 * ベクトルインデックス統計情報
 */
export interface VectorIndexStats {
  /**
   * インデックス名
   */
  name: string;

  /**
   * インデックス内のエントリ数
   */
  entryCount: number;

  /**
   * インデックスが存在するかどうか
   */
  exists: boolean;
}

// ============================================
// デフォルト設定
// ============================================

/**
 * デフォルトのベクトルインデックス設定
 *
 * @description OpenAI text-embedding-3-small向けの設定
 */
export const defaultVectorIndexConfig: VectorIndexConfig = {
  name: "embeddings_vector_idx",
  dimensions: 1536,
  metric: "cosine",
  maxElements: 1000000,
  efConstruction: 200,
  efSearch: 100,
};

/**
 * プリセット設定
 *
 * @description 主要な埋め込みモデル向けの設定
 */
export const vectorIndexConfigs: Record<string, VectorIndexConfig> = {
  /**
   * OpenAI text-embedding-3-small
   */
  openai_small: {
    name: "embeddings_vector_idx",
    dimensions: 1536,
    metric: "cosine",
    maxElements: 1000000,
    efConstruction: 200,
    efSearch: 100,
  },

  /**
   * OpenAI text-embedding-3-large
   */
  openai_large: {
    name: "embeddings_vector_idx",
    dimensions: 3072,
    metric: "cosine",
    maxElements: 500000,
    efConstruction: 200,
    efSearch: 100,
  },

  /**
   * Cohere embed-multilingual-v3.0
   */
  cohere_multilingual: {
    name: "embeddings_vector_idx",
    dimensions: 1024,
    metric: "cosine",
    maxElements: 1000000,
    efConstruction: 200,
    efSearch: 100,
  },
};

// ============================================
// インデックス管理関数
// ============================================

/**
 * ベクトルインデックスを作成する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param config - インデックス設定（オプション、デフォルトはdefaultVectorIndexConfig）
 *
 * @throws {Error} インデックス作成に失敗した場合
 *
 * @example
 * ```typescript
 * await createVectorIndex(db);
 *
 * // カスタム設定
 * await createVectorIndex(db, {
 *   name: "custom_vector_idx",
 *   dimensions: 768,
 *   metric: "l2",
 * });
 * ```
 */
export async function createVectorIndex(
  db: LibSQLDatabase<Record<string, never>>,
  config: VectorIndexConfig = defaultVectorIndexConfig,
): Promise<void> {
  const { name, dimensions, metric } = config;

  // libSQLのベクトルインデックス作成構文
  // CREATE INDEX idx ON table(column) USING vector(dimensions) WITH (metric = 'cosine')
  await db.run(
    sql.raw(`
      CREATE INDEX IF NOT EXISTS ${name}
      ON embeddings(vector)
      USING vector(${dimensions})
      WITH (metric = '${metric}')
    `),
  );
}

/**
 * ベクトルインデックスを削除する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param indexName - 削除するインデックス名（オプション）
 *
 * @throws {Error} インデックス削除に失敗した場合
 *
 * @example
 * ```typescript
 * await dropVectorIndex(db);
 *
 * // カスタム名
 * await dropVectorIndex(db, "custom_vector_idx");
 * ```
 */
export async function dropVectorIndex(
  db: LibSQLDatabase<Record<string, never>>,
  indexName: string = defaultVectorIndexConfig.name,
): Promise<void> {
  await db.run(sql.raw(`DROP INDEX IF EXISTS ${indexName}`));
}

/**
 * ベクトルインデックスを再構築する
 *
 * @description
 * 既存のインデックスを削除し、新しい設定で再作成する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param config - インデックス設定（オプション）
 *
 * @throws {Error} インデックス再構築に失敗した場合
 *
 * @example
 * ```typescript
 * await rebuildVectorIndex(db);
 *
 * // 新しい設定で再構築
 * await rebuildVectorIndex(db, {
 *   ...defaultVectorIndexConfig,
 *   dimensions: 768,
 * });
 * ```
 */
export async function rebuildVectorIndex(
  db: LibSQLDatabase<Record<string, never>>,
  config: VectorIndexConfig = defaultVectorIndexConfig,
): Promise<void> {
  await dropVectorIndex(db, config.name);
  await createVectorIndex(db, config);
}

/**
 * ベクトルインデックスの統計情報を取得する
 *
 * @param db - LibSQLデータベースインスタンス
 * @param indexName - インデックス名（オプション）
 * @returns インデックス統計情報
 *
 * @example
 * ```typescript
 * const stats = await getVectorIndexStats(db);
 * console.log(`Entries: ${stats.entryCount}`);
 * console.log(`Exists: ${stats.exists}`);
 * ```
 */
export async function getVectorIndexStats(
  db: LibSQLDatabase<Record<string, never>>,
  indexName: string = defaultVectorIndexConfig.name,
): Promise<VectorIndexStats> {
  // インデックスの存在確認
  const indexResult = await db.all<{ name: string }>(
    sql.raw(`
      SELECT name FROM sqlite_master
      WHERE type = 'index' AND name = '${indexName}'
    `),
  );

  const exists = indexResult.length > 0;

  // エントリ数を取得
  let entryCount = 0;
  if (exists) {
    const countResult = await db.all<{ count: number }>(
      sql.raw(`SELECT COUNT(*) as count FROM embeddings`),
    );
    entryCount = countResult[0]?.count ?? 0;
  }

  return {
    name: indexName,
    entryCount,
    exists,
  };
}
