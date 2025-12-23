-- カバリングインデックス追加マイグレーション
--
-- レビュー指摘事項 (T-02-1) への対応:
-- セッション内メッセージの日時降順取得を最適化するカバリングインデックスを追加
--
-- @see docs/30-workflows/chat-history-persistence/review-results.md
--
-- 実行: pnpm --filter @repo/shared db:migrate

-- ============================================================
-- chat_messages カバリングインデックス
-- ============================================================
-- セッションIDとタイムスタンプの複合インデックス
-- 「特定セッションのメッセージを日時順で取得」するクエリを最適化

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_timestamp
    ON chat_messages(session_id, timestamp DESC);
