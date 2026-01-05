-- chunks FTS5仮想テーブルとトリガー作成マイグレーション
--
-- @see docs/30-workflows/rag-conversion-system/design-chunks-fts5.md
--
-- 実行: pnpm --filter @repo/shared db:migrate
--
-- 注意: このマイグレーションはchunksテーブルが既に存在することを前提とします
--      0002_short_norrin_radd.sqlで作成されたchunksテーブルに対してFTS5インデックスを構築

-- ============================================================
-- chunks_fts FTS5仮想テーブル
-- ============================================================
-- 全文検索用のFTS5仮想テーブル
-- External Content Table パターンを使用してデータ重複を回避

CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  -- インデックス対象カラム
  content,
  contextual_content,
  parent_header,

  -- External Content Table設定
  content='chunks',          -- ソーステーブル
  content_rowid='rowid',     -- rowidマッピング

  -- トークナイザー設定
  -- unicode61: 日本語・英語対応
  -- remove_diacritics 2: 発音記号を正規化
  tokenize='unicode61 remove_diacritics 2'
);

-- ============================================================
-- INSERT トリガー
-- ============================================================
-- chunksテーブルに新規レコードが追加されたときにFTS5へ同期

CREATE TRIGGER IF NOT EXISTS chunks_fts_insert
AFTER INSERT ON chunks
BEGIN
  INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
  VALUES (
    new.rowid,
    new.content,
    new.contextual_content,
    new.parent_header
  );
END;

-- ============================================================
-- UPDATE トリガー
-- ============================================================
-- chunksテーブルのレコードが更新されたときにFTS5へ同期
-- FTS5の制約により、DELETE + INSERT の2ステップで更新

CREATE TRIGGER IF NOT EXISTS chunks_fts_update
AFTER UPDATE ON chunks
BEGIN
  -- 既存エントリを削除
  DELETE FROM chunks_fts WHERE rowid = old.rowid;

  -- 新しいエントリを挿入
  INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
  VALUES (
    new.rowid,
    new.content,
    new.contextual_content,
    new.parent_header
  );
END;

-- ============================================================
-- DELETE トリガー
-- ============================================================
-- chunksテーブルからレコードが削除されたときにFTS5から削除

CREATE TRIGGER IF NOT EXISTS chunks_fts_delete
AFTER DELETE ON chunks
BEGIN
  DELETE FROM chunks_fts WHERE rowid = old.rowid;
END;

-- ============================================================
-- 既存データの初期インデックス化
-- ============================================================
-- chunksテーブルに既存のデータがある場合、FTS5インデックスに追加
-- 注意: 大量データの場合は時間がかかる可能性があります

INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
SELECT rowid, content, contextual_content, parent_header
FROM chunks;
