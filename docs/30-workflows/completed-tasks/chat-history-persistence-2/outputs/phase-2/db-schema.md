# チャット履歴永続化機能 - DBスキーマ設計書

## 1. 概要

本ドキュメントはチャット履歴永続化機能のデータベーススキーマ設計を定義する。
SQLite（Turso/libSQL）+ Drizzle ORMを使用した設計となっている。

## 2. ER図

```
┌─────────────────────────────────────┐
│           chat_sessions             │
├─────────────────────────────────────┤
│ PK  id                 TEXT         │
│     user_id            TEXT NOT NULL│
│     title              TEXT NOT NULL│
│     created_at         TEXT NOT NULL│
│     updated_at         TEXT NOT NULL│
│     message_count      INT  NOT NULL│
│     is_favorite        INT  NOT NULL│
│     is_pinned          INT  NOT NULL│
│     pin_order          INT          │
│     last_message_preview TEXT       │
│     metadata           TEXT NOT NULL│
│     deleted_at         TEXT         │
└────────────┬────────────────────────┘
             │ 1
             │
             │ N
┌────────────┴────────────────────────┐
│           chat_messages             │
├─────────────────────────────────────┤
│ PK  id                 TEXT         │
│ FK  session_id         TEXT NOT NULL│
│     role               TEXT NOT NULL│
│     content            TEXT NOT NULL│
│     message_index      INT  NOT NULL│
│     timestamp          TEXT NOT NULL│
│     llm_provider       TEXT         │
│     llm_model          TEXT         │
│     llm_metadata       TEXT         │
│     attachments        TEXT NOT NULL│
│     system_prompt      TEXT         │
│     metadata           TEXT NOT NULL│
└─────────────────────────────────────┘
```

## 3. テーブル定義

### 3.1 chat_sessions（チャットセッション）

ユーザーとAIアシスタント間の会話セッションを管理する最上位エンティティ。

| カラム名             | 型      | 制約        | 説明                                     |
| -------------------- | ------- | ----------- | ---------------------------------------- |
| id                   | TEXT    | PRIMARY KEY | UUID v4形式の一意識別子                  |
| user_id              | TEXT    | NOT NULL    | ユーザーID（将来の認証機能連携用）       |
| title                | TEXT    | NOT NULL    | セッションタイトル（3〜100文字）         |
| created_at           | TEXT    | NOT NULL    | 作成日時（ISO 8601形式、UTC）            |
| updated_at           | TEXT    | NOT NULL    | 最終更新日時（ISO 8601形式、UTC）        |
| message_count        | INTEGER | NOT NULL    | セッション内のメッセージ総数（非正規化） |
| is_favorite          | INTEGER | NOT NULL    | お気に入りフラグ（0: false, 1: true）    |
| is_pinned            | INTEGER | NOT NULL    | ピン留めフラグ（0: false, 1: true）      |
| pin_order            | INTEGER |             | ピン留め時の表示順序（1〜10）            |
| last_message_preview | TEXT    |             | 最終メッセージプレビュー（最大50文字）   |
| metadata             | TEXT    | NOT NULL    | 拡張メタデータ（JSON形式）               |
| deleted_at           | TEXT    |             | 削除日時（ソフトデリート用）             |

**インデックス:**

| インデックス名               | カラム                        | 用途                     |
| ---------------------------- | ----------------------------- | ------------------------ |
| idx_chat_sessions_user_id    | user_id                       | ユーザーID検索最適化     |
| idx_chat_sessions_created_at | created_at                    | 作成日時ソート最適化     |
| idx_chat_sessions_is_pinned  | user_id, is_pinned, pin_order | ピン留めセッション取得   |
| idx_chat_sessions_deleted_at | deleted_at                    | 有効セッション取得最適化 |

### 3.2 chat_messages（チャットメッセージ）

セッション内の個別の発言（ユーザーまたはアシスタント）を管理する。

| カラム名      | 型      | 制約                         | 説明                             |
| ------------- | ------- | ---------------------------- | -------------------------------- |
| id            | TEXT    | PRIMARY KEY                  | UUID v4形式の一意識別子          |
| session_id    | TEXT    | NOT NULL, FK, CASCADE DELETE | 親セッションID                   |
| role          | TEXT    | NOT NULL                     | "user" または "assistant"        |
| content       | TEXT    | NOT NULL                     | メッセージ本文（1〜100,000文字） |
| message_index | INTEGER | NOT NULL                     | セッション内の順序（0から連番）  |
| timestamp     | TEXT    | NOT NULL                     | 送信日時（ISO 8601形式、UTC）    |
| llm_provider  | TEXT    |                              | LLMプロバイダー名（assistant時） |
| llm_model     | TEXT    |                              | LLMモデル名（assistant時）       |
| llm_metadata  | TEXT    |                              | LLMメタデータ（JSON形式）        |
| attachments   | TEXT    | NOT NULL                     | 添付ファイル情報（JSON配列形式） |
| system_prompt | TEXT    |                              | システムプロンプト（将来対応）   |
| metadata      | TEXT    | NOT NULL                     | 拡張メタデータ（JSON形式）       |

**インデックス:**

| インデックス名                      | カラム                    | 用途                     |
| ----------------------------------- | ------------------------- | ------------------------ |
| idx_chat_messages_session_id        | session_id                | セッションID検索最適化   |
| idx_chat_messages_timestamp         | timestamp                 | タイムスタンプ検索最適化 |
| idx_chat_messages_role              | role                      | ロール別フィルタリング   |
| idx_chat_messages_session_timestamp | session_id, timestamp     | カバリングインデックス   |
| idx_chat_messages_session_message   | session_id, message_index | 一意性保証（UNIQUE）     |

## 4. 正規化分析

### 4.1 第1正規形（1NF）

- 全ての属性が原子値である
- JSONカラム（metadata, attachments, llm_metadata）は意図的な非正規化

### 4.2 第2正規形（2NF）

- 主キーが単一カラムのため、部分関数従属は発生しない

### 4.3 第3正規形（3NF）

- 推移的関数従属は存在しない
- message_countは非正規化フィールド（パフォーマンス最適化）

### 4.4 意図的な非正規化

| フィールド           | 理由                                           |
| -------------------- | ---------------------------------------------- |
| message_count        | セッション一覧表示時のN+1問題回避              |
| last_message_preview | プレビュー表示の高速化                         |
| metadata (JSON)      | 将来の拡張性確保、スキーマ変更なしで機能追加可 |
| attachments (JSON)   | 可変長の添付ファイル情報を柔軟に格納           |

## 5. 制約とビジネスルール

### 5.1 データベース制約

- **外部キー制約**: `chat_messages.session_id` → `chat_sessions.id` (CASCADE DELETE)
- **一意性制約**: `(session_id, message_index)` の組み合わせ

### 5.2 アプリケーション層制約

| ルールID       | 内容                                                                |
| -------------- | ------------------------------------------------------------------- |
| BR-SESSION-001 | タイトル未指定時は「新しいチャット YYYY-MM-DD HH:mm」形式で自動生成 |
| BR-SESSION-002 | ピン留め可能なセッションは最大10件まで                              |
| BR-SESSION-003 | メッセージ追加時、最後のメッセージから最大50文字のプレビューを生成  |
| BR-MESSAGE-001 | メッセージはセッション内で0から始まる連番を持つ                     |
| BR-MESSAGE-002 | role=assistantの場合、LLMメタデータの付与を推奨                     |

## 6. 実装状況

| 項目             | ファイル                                        | ステータス |
| ---------------- | ----------------------------------------------- | ---------- |
| Drizzleスキーマ  | `packages/shared/src/db/schema/chat-history.ts` | 完了       |
| マイグレーション | Drizzle Kit管理                                 | 完了       |

## 7. 将来の拡張

- **FTS5仮想テーブル**: 全文検索用（`chat_sessions_fts`）
- **添付ファイルテーブル**: 別テーブルへの分離（大規模運用時）
- **履歴テーブル**: 監査ログ用（コンプライアンス要件時）
