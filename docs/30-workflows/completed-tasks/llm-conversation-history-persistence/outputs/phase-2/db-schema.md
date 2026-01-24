# データベーススキーマ設計書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## スキーマ概要

本タスクでは、システム仕様書（database-schema.md）に定義済みの`chat_sessions`と`chat_messages`テーブルをそのまま活用する。追加のマイグレーションは不要。

---

## テーブル定義

### chat_sessions（チャットセッション）

会話セッションのメタデータを管理するテーブル。

```sql
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  pin_order INTEGER,
  last_message_preview TEXT,
  metadata JSON NOT NULL DEFAULT '{}',
  deleted_at TEXT
);
```

| カラム               | 型      | NULL | 説明                                     |
| -------------------- | ------- | ---- | ---------------------------------------- |
| id                   | TEXT    | NO   | UUID v4（主キー）                        |
| user_id              | TEXT    | NO   | ユーザーID（ローカル固定値使用）         |
| title                | TEXT    | NO   | セッションタイトル（3〜100文字）         |
| created_at           | TEXT    | NO   | 作成日時（ISO 8601形式、UTC）            |
| updated_at           | TEXT    | NO   | 最終更新日時                             |
| message_count        | INTEGER | NO   | メッセージ総数（非正規化）               |
| is_favorite          | INTEGER | NO   | お気に入りフラグ（0/1）                  |
| is_pinned            | INTEGER | NO   | ピン留めフラグ（0/1）                    |
| pin_order            | INTEGER | YES  | ピン留め時の表示順序（1〜10）            |
| last_message_preview | TEXT    | YES  | 最終メッセージのプレビュー（最大50文字） |
| metadata             | JSON    | NO   | 拡張メタデータ                           |
| deleted_at           | TEXT    | YES  | 削除日時（ソフトデリート用）             |

### chat_messages（チャットメッセージ）

会話内の個別メッセージを管理するテーブル。

```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  message_index INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  llm_provider TEXT,
  llm_model TEXT,
  llm_metadata JSON,
  attachments JSON NOT NULL DEFAULT '[]',
  system_prompt TEXT,
  metadata JSON NOT NULL DEFAULT '{}',
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);
```

| カラム        | 型      | NULL | 説明                                 |
| ------------- | ------- | ---- | ------------------------------------ |
| id            | TEXT    | NO   | UUID v4（主キー）                    |
| session_id    | TEXT    | NO   | 親セッションID（外部キー）           |
| role          | TEXT    | NO   | メッセージロール（user / assistant） |
| content       | TEXT    | NO   | メッセージ本文（1〜100,000文字）     |
| message_index | INTEGER | NO   | セッション内の順序（0から連番）      |
| timestamp     | TEXT    | NO   | メッセージ送信日時                   |
| llm_provider  | TEXT    | YES  | LLMプロバイダー名                    |
| llm_model     | TEXT    | YES  | LLMモデル名                          |
| llm_metadata  | JSON    | YES  | トークン使用量、応答時間等           |
| attachments   | JSON    | NO   | 添付ファイル情報                     |
| system_prompt | TEXT    | YES  | システムプロンプト                   |
| metadata      | JSON    | NO   | 拡張メタデータ                       |

---

## インデックス

### 既存インデックス

```sql
-- ユーザー別セッション取得
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- 作成日時降順ソート
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- セッション別メッセージ取得
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- 順序一意性保証
CREATE UNIQUE INDEX idx_chat_messages_session_message ON chat_messages(session_id, message_index);
```

### 追加推奨インデックス

```sql
-- ピン留めセッションのソート
CREATE INDEX idx_chat_sessions_pinned ON chat_sessions(user_id, is_pinned, pin_order)
  WHERE deleted_at IS NULL;

-- 更新日時ソート（一覧表示用）
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC)
  WHERE deleted_at IS NULL;

-- タイトル検索用（LIKE検索）
CREATE INDEX idx_chat_sessions_title ON chat_sessions(title)
  WHERE deleted_at IS NULL;
```

---

## 制約

### 外部キー制約

```sql
-- chat_messages.session_id → chat_sessions.id
FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
```

セッションが削除されると、関連するメッセージも自動的に削除される。

### チェック制約（アプリケーション層で実装）

| 制約対象                  | 条件                      |
| ------------------------- | ------------------------- |
| chat_sessions.title       | 3〜100文字                |
| chat_messages.role        | 'user' または 'assistant' |
| chat_messages.content     | 1〜100,000文字            |
| chat_sessions.is_favorite | 0 または 1                |
| chat_sessions.is_pinned   | 0 または 1                |

---

## データ操作パターン

### 1. 会話一覧取得（アクティブのみ）

```sql
SELECT
  id, title, created_at, updated_at, message_count,
  last_message_preview, is_favorite, is_pinned
FROM chat_sessions
WHERE user_id = ? AND deleted_at IS NULL
ORDER BY
  is_pinned DESC,
  pin_order ASC NULLS LAST,
  updated_at DESC
LIMIT ? OFFSET ?;
```

### 2. 会話詳細取得（メッセージ含む）

```sql
-- セッション取得
SELECT * FROM chat_sessions WHERE id = ? AND deleted_at IS NULL;

-- メッセージ取得
SELECT * FROM chat_messages
WHERE session_id = ?
ORDER BY message_index ASC;
```

### 3. 新規会話作成

```sql
INSERT INTO chat_sessions (
  id, user_id, title, created_at, updated_at,
  message_count, is_favorite, is_pinned,
  last_message_preview, metadata
) VALUES (?, ?, ?, ?, ?, 0, 0, 0, NULL, '{}');
```

### 4. メッセージ追加（トランザクション）

```sql
BEGIN TRANSACTION;

-- メッセージ挿入
INSERT INTO chat_messages (
  id, session_id, role, content, message_index,
  timestamp, llm_provider, llm_model, llm_metadata,
  attachments, system_prompt, metadata
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, '{}');

-- セッション更新
UPDATE chat_sessions SET
  message_count = message_count + 1,
  updated_at = ?,
  last_message_preview = ?
WHERE id = ?;

COMMIT;
```

### 5. 会話削除（ソフトデリート）

```sql
UPDATE chat_sessions SET deleted_at = ? WHERE id = ?;
```

---

## マイグレーション計画

### 現状

- `chat_sessions`と`chat_messages`テーブルは既にシステム仕様書で定義済み
- Drizzleマイグレーションで管理されている

### 追加作業

1. 追加推奨インデックスの作成（パフォーマンス最適化）
2. 既存データがある場合の互換性確認

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
