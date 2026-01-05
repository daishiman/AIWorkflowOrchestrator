-- ファイル・変換テーブル作成マイグレーション
--
-- @see docs/30-workflows/completed-tasks/task-04-02-files-conversions-tables.md
--
-- 実行: pnpm --filter @repo/shared db:migrate

-- ============================================================
-- files テーブル
-- ============================================================
-- ファイルメタデータを管理するテーブル

CREATE TABLE IF NOT EXISTS files (
    -- 主キー
    id TEXT PRIMARY KEY,

    -- 基本情報
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    category TEXT NOT NULL,

    -- サイズ・ハッシュ
    size INTEGER NOT NULL,
    hash TEXT NOT NULL, -- SHA-256 (64文字)
    encoding TEXT NOT NULL DEFAULT 'utf-8',

    -- 日時情報
    last_modified INTEGER NOT NULL,

    -- メタデータ
    metadata TEXT NOT NULL DEFAULT '{}',

    -- タイムスタンプ
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    -- 論理削除
    deleted_at INTEGER
);

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS files_hash_idx ON files(hash);
CREATE INDEX IF NOT EXISTS files_path_idx ON files(path);
CREATE INDEX IF NOT EXISTS files_mime_type_idx ON files(mime_type);
CREATE INDEX IF NOT EXISTS files_category_idx ON files(category);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON files(created_at);

-- ============================================================
-- conversions テーブル
-- ============================================================
-- 変換履歴を管理するテーブル

CREATE TABLE IF NOT EXISTS conversions (
    -- 主キー
    id TEXT PRIMARY KEY,

    -- 外部キー
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,

    -- 変換情報
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
    converter_id TEXT NOT NULL,

    -- ハッシュ（キャッシュ用）
    input_hash TEXT NOT NULL,
    output_hash TEXT,

    -- パフォーマンス情報
    duration INTEGER, -- ミリ秒
    input_size INTEGER,
    output_size INTEGER,

    -- エラー情報
    error TEXT,
    error_details TEXT,

    -- タイムスタンプ
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS conversions_file_id_idx ON conversions(file_id);
CREATE INDEX IF NOT EXISTS conversions_status_idx ON conversions(status);
CREATE INDEX IF NOT EXISTS conversions_input_hash_idx ON conversions(input_hash);
CREATE INDEX IF NOT EXISTS conversions_created_at_idx ON conversions(created_at);

-- 複合インデックス
CREATE INDEX IF NOT EXISTS conversions_file_status_idx ON conversions(file_id, status);

-- ============================================================
-- extracted_metadata テーブル
-- ============================================================
-- 変換時に抽出されたメタデータを管理するテーブル

CREATE TABLE IF NOT EXISTS extracted_metadata (
    -- 主キー
    id TEXT PRIMARY KEY,

    -- 外部キー
    conversion_id TEXT NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,

    -- 基本メタデータ
    title TEXT,
    author TEXT,
    language TEXT, -- ISO 639-1

    -- カウント情報
    word_count INTEGER NOT NULL DEFAULT 0,
    line_count INTEGER NOT NULL DEFAULT 0,
    char_count INTEGER NOT NULL DEFAULT 0,
    code_blocks INTEGER NOT NULL DEFAULT 0,

    -- 配列データ（JSON）
    headers TEXT DEFAULT '[]',
    links TEXT DEFAULT '[]',

    -- カスタムメタデータ
    custom TEXT DEFAULT '{}',

    -- タイムスタンプ
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS extracted_metadata_conversion_id_idx
    ON extracted_metadata(conversion_id);
CREATE INDEX IF NOT EXISTS extracted_metadata_language_idx
    ON extracted_metadata(language);
