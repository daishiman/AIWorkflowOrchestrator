-- DiskANN ベクトルインデックス設定 - embeddingsテーブルマイグレーション
-- @see docs/30-workflows/diskann-vector-index/outputs/phase-2/database-schema.md

-- ============================================
-- 1. embeddingsテーブル作成
-- ============================================
CREATE TABLE IF NOT EXISTS embeddings (
  -- 基本情報
  id TEXT PRIMARY KEY,
  chunk_id TEXT NOT NULL UNIQUE REFERENCES chunks(id) ON DELETE CASCADE,

  -- ベクトルデータ
  vector BLOB NOT NULL,
  model_id TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  normalized_magnitude REAL NOT NULL,

  -- タイムスタンプ
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  -- 制約
  CHECK (dimensions > 0),
  CHECK (normalized_magnitude > 0)
);

-- ============================================
-- 2. インデックス作成
-- ============================================

-- チャンクID ユニークインデックス（1チャンク = 1埋め込み）
CREATE UNIQUE INDEX IF NOT EXISTS embeddings_chunk_id_idx
ON embeddings(chunk_id);

-- モデルID インデックス（モデル別検索用）
CREATE INDEX IF NOT EXISTS embeddings_model_id_idx
ON embeddings(model_id);

-- ============================================
-- 3. ベクトルインデックス作成（DiskANN）
-- ============================================
-- 注意: libSQLのベクトル拡張が有効な環境でのみ動作
-- デフォルト設定: 1536次元（OpenAI text-embedding-3-small）、コサイン類似度

CREATE INDEX IF NOT EXISTS embeddings_vector_idx
ON embeddings(vector)
USING vector(1536)
WITH (metric = 'cosine');
