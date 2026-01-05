-- チャット履歴テーブル作成マイグレーション
--
-- @see docs/30-workflows/chat-history-persistence/metadata-specification.md
-- @see docs/30-workflows/chat-history-persistence/task-chat-history-persistence.md
--
-- 実行: pnpm --filter @repo/shared db:migrate

-- ============================================================
-- chat_sessions テーブル
-- ============================================================
-- ユーザーとAIアシスタント間の会話セッションを管理する最上位エンティティ。

CREATE TABLE IF NOT EXISTS chat_sessions (
    -- セッション一意識別子（UUID v4）
    id TEXT PRIMARY KEY,

    -- ユーザーID（将来の認証機能との連携用）
    user_id TEXT NOT NULL,

    -- セッションタイトル（3〜100文字、空の場合は自動生成）
    title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 100),

    -- 作成日時（ISO 8601形式、UTC）
    created_at TEXT NOT NULL,

    -- 最終更新日時（ISO 8601形式、UTC）
    updated_at TEXT NOT NULL,

    -- セッション内のメッセージ総数（非正規化、検索最適化用）
    message_count INTEGER NOT NULL DEFAULT 0 CHECK(message_count >= 0),

    -- お気に入りフラグ（0: false, 1: true）
    is_favorite INTEGER NOT NULL DEFAULT 0 CHECK(is_favorite IN (0, 1)),

    -- ピン留めフラグ（0: false, 1: true）
    is_pinned INTEGER NOT NULL DEFAULT 0 CHECK(is_pinned IN (0, 1)),

    -- ピン留め時の表示順序（1〜10、isPinned = 1 の場合のみ使用）
    pin_order INTEGER CHECK(pin_order BETWEEN 1 AND 10),

    -- 最終メッセージのプレビュー（最大50文字）
    last_message_preview TEXT CHECK(length(last_message_preview) <= 50),

    -- 拡張メタデータ（JSON形式）
    metadata TEXT NOT NULL DEFAULT '{}',

    -- 削除日時（ソフトデリート用、NULLの場合は有効なセッション）
    deleted_at TEXT
);

-- インデックス作成（chat_sessions）
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
    ON chat_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at
    ON chat_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_pinned
    ON chat_sessions(user_id, is_pinned, pin_order);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_deleted_at
    ON chat_sessions(deleted_at);

-- ============================================================
-- chat_sessions FTS5 全文検索テーブル
-- ============================================================
-- タイトルとプレビューの全文検索を高速化
-- 通常モード(独自のコンテンツコピーを持つ)で作成

CREATE VIRTUAL TABLE IF NOT EXISTS chat_sessions_fts USING fts5(
    id UNINDEXED,
    title,
    last_message_preview
);

-- FTS5同期トリガー（INSERT）
CREATE TRIGGER IF NOT EXISTS chat_sessions_fts_insert
AFTER INSERT ON chat_sessions BEGIN
    INSERT INTO chat_sessions_fts(id, title, last_message_preview)
    VALUES (new.id, new.title, new.last_message_preview);
END;

-- FTS5同期トリガー（UPDATE）
-- FTS5はUPDATEをサポートしていないため、DELETE+INSERTパターンを使用
CREATE TRIGGER IF NOT EXISTS chat_sessions_fts_update
AFTER UPDATE ON chat_sessions BEGIN
    DELETE FROM chat_sessions_fts WHERE id = old.id;
    INSERT INTO chat_sessions_fts(id, title, last_message_preview)
    VALUES (new.id, new.title, new.last_message_preview);
END;

-- FTS5同期トリガー（DELETE）
CREATE TRIGGER IF NOT EXISTS chat_sessions_fts_delete
AFTER DELETE ON chat_sessions BEGIN
    DELETE FROM chat_sessions_fts WHERE id = old.id;
END;

-- ============================================================
-- chat_messages テーブル
-- ============================================================
-- セッション内の個別の発言（ユーザーまたはアシスタント）を管理

CREATE TABLE IF NOT EXISTS chat_messages (
    -- メッセージ一意識別子（UUID v4）
    id TEXT PRIMARY KEY,

    -- 親セッションID（外部キー）
    session_id TEXT NOT NULL,

    -- メッセージロール（"user" or "assistant"）
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),

    -- メッセージ本文（1〜100,000文字）
    content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 100000),

    -- セッション内の順序（0から連番）
    message_index INTEGER NOT NULL CHECK(message_index >= 0),

    -- メッセージ送信日時（ISO 8601形式、UTC）
    timestamp TEXT NOT NULL,

    -- LLMプロバイダー名（アシスタント応答のみ）
    llm_provider TEXT,

    -- LLMモデル名（アシスタント応答のみ）
    llm_model TEXT,

    -- LLMメタデータ（JSON形式、トークン使用量等）
    llm_metadata TEXT,

    -- 添付ファイル情報（JSON配列形式）
    attachments TEXT NOT NULL DEFAULT '[]',

    -- システムプロンプト（将来対応）
    system_prompt TEXT,

    -- 拡張メタデータ（JSON形式）
    metadata TEXT NOT NULL DEFAULT '{}',

    -- 外部キー制約（CASCADE DELETE）
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,

    -- セッション内のメッセージ順序の一意性保証
    UNIQUE(session_id, message_index)
);

-- インデックス作成（chat_messages）
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
    ON chat_messages(session_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp
    ON chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role
    ON chat_messages(role);
