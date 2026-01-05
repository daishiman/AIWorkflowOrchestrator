# データベースインデックス戦略設計

**日付**: 2025-12-25
**タスク**: T-01-4 インデックス戦略設計
**ステータス**: 完了

---

## 概要

チャット履歴永続化システムのパフォーマンス最適化のため、インデックス戦略を設計します。

---

## インデックス命名規則

### 規則

```
idx_{table_name}_{column_name(s)}
```

### 例

| パターン     | 例                                                              |
| ------------ | --------------------------------------------------------------- |
| 単一カラム   | `idx_chat_sessions_user_id`                                     |
| 複合カラム   | `idx_chat_sessions_is_pinned` (user_id + is_pinned + pin_order) |
| ユニーク制約 | `idx_chat_messages_session_message` (UNIQUE)                    |

---

## クエリパターン分析

### 1. セッション一覧取得

**クエリ**:

```sql
SELECT * FROM chat_sessions
WHERE user_id = ? AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 50;
```

**使用頻度**: 高（アプリ起動時、セッション切替時）

**必要なインデックス**:

- `idx_chat_sessions_user_id` - user_id での絞り込み
- `idx_chat_sessions_deleted_at` - ソフトデリート対応
- **追加推奨**: `idx_chat_sessions_user_updated` (user_id, updated_at) - カバリングインデックス

---

### 2. ピン留めセッション取得

**クエリ**:

```sql
SELECT * FROM chat_sessions
WHERE user_id = ? AND is_pinned = 1 AND deleted_at IS NULL
ORDER BY pin_order ASC
LIMIT 10;
```

**使用頻度**: 高（サイドバー表示時）

**必要なインデックス**:

- `idx_chat_sessions_is_pinned` (user_id, is_pinned, pin_order) - 複合インデックス ✅

---

### 3. 特定セッションのメッセージ取得

**クエリ**:

```sql
SELECT * FROM chat_messages
WHERE session_id = ?
ORDER BY message_index ASC;
```

**使用頻度**: 非常に高（セッション選択時）

**必要なインデックス**:

- `idx_chat_messages_session_id` - session_id での絞り込み
- `idx_chat_messages_session_message` (session_id, message_index) - 順序保証 ✅

---

### 4. 最新メッセージ取得

**クエリ**:

```sql
SELECT * FROM chat_messages
WHERE session_id = ?
ORDER BY timestamp DESC
LIMIT 1;
```

**使用頻度**: 高（セッション情報更新時）

**必要なインデックス**:

- `idx_chat_messages_session_timestamp` (session_id, timestamp) - カバリングインデックス ✅

---

### 5. 全文検索（将来対応）

**クエリ**:

```sql
SELECT * FROM chat_messages
WHERE content LIKE '%keyword%';
```

**使用頻度**: 中（検索機能使用時）

**注意点**:

- LIKE '%keyword%' は前方一致でないためインデックス使用不可
- 全文検索インデックス（FTS5）の導入を検討

**推奨対応**:

```sql
-- SQLite FTS5 仮想テーブル
CREATE VIRTUAL TABLE chat_messages_fts USING fts5(
  content,
  content=chat_messages,
  content_rowid=rowid
);
```

---

### 6. ロール別メッセージ取得

**クエリ**:

```sql
SELECT * FROM chat_messages
WHERE session_id = ? AND role = 'assistant';
```

**使用頻度**: 低（分析・エクスポート時）

**必要なインデックス**:

- `idx_chat_messages_role` - ロール別フィルタリング ✅

---

## 現在のインデックス定義

### chat_sessions テーブル (4インデックス)

| インデックス名                 | カラム                        | 種別 | 用途                   |
| ------------------------------ | ----------------------------- | ---- | ---------------------- |
| `idx_chat_sessions_user_id`    | user_id                       | 通常 | ユーザー別検索         |
| `idx_chat_sessions_created_at` | created_at                    | 通常 | 作成日時ソート         |
| `idx_chat_sessions_is_pinned`  | user_id, is_pinned, pin_order | 複合 | ピン留めセッション取得 |
| `idx_chat_sessions_deleted_at` | deleted_at                    | 通常 | ソフトデリート対応     |

### chat_messages テーブル (5インデックス)

| インデックス名                        | カラム                    | 種別   | 用途                   |
| ------------------------------------- | ------------------------- | ------ | ---------------------- |
| `idx_chat_messages_session_id`        | session_id                | 通常   | セッション別検索       |
| `idx_chat_messages_timestamp`         | timestamp                 | 通常   | 日時順ソート           |
| `idx_chat_messages_role`              | role                      | 通常   | ロール別フィルタ       |
| `idx_chat_messages_session_timestamp` | session_id, timestamp     | 複合   | カバリングインデックス |
| `idx_chat_messages_session_message`   | session_id, message_index | UNIQUE | 順序一意性保証         |

---

## 複合インデックス分析

### 1. idx_chat_sessions_is_pinned

**カラム構成**: `(user_id, is_pinned, pin_order)`

**設計根拠**:

- user_id: 最も選択性の高いカラム（最初に配置）
- is_pinned: フィルタリング条件
- pin_order: ソート条件

**使用クエリ**:

```sql
WHERE user_id = ? AND is_pinned = 1 ORDER BY pin_order
```

**EXPLAIN QUERY PLAN想定結果**:

```
SEARCH TABLE chat_sessions USING INDEX idx_chat_sessions_is_pinned (user_id=? AND is_pinned=?)
```

---

### 2. idx_chat_messages_session_timestamp

**カラム構成**: `(session_id, timestamp)`

**設計根拠**:

- session_id: 外部キーによる絞り込み
- timestamp: 時系列ソート

**使用クエリ**:

```sql
WHERE session_id = ? ORDER BY timestamp DESC
```

**EXPLAIN QUERY PLAN想定結果**:

```
SEARCH TABLE chat_messages USING INDEX idx_chat_messages_session_timestamp (session_id=?)
```

---

### 3. idx_chat_messages_session_message (UNIQUE)

**カラム構成**: `(session_id, message_index)`

**設計根拠**:

- session_id: セッション単位の検索
- message_index: メッセージ順序の一意性保証

**使用クエリ**:

```sql
WHERE session_id = ? ORDER BY message_index ASC
```

**EXPLAIN QUERY PLAN想定結果**:

```
SEARCH TABLE chat_messages USING INDEX idx_chat_messages_session_message (session_id=?)
```

---

## EXPLAIN QUERY PLAN 想定結果

### クエリ1: セッション一覧取得

```sql
EXPLAIN QUERY PLAN
SELECT * FROM chat_sessions
WHERE user_id = 'user-123' AND deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 50;
```

**想定結果**:

```
SEARCH TABLE chat_sessions USING INDEX idx_chat_sessions_user_id (user_id=?)
```

**注意**: deleted_at IS NULL とのAND条件は別途フィルタリング

---

### クエリ2: メッセージ取得

```sql
EXPLAIN QUERY PLAN
SELECT * FROM chat_messages
WHERE session_id = 'session-456'
ORDER BY message_index ASC;
```

**想定結果**:

```
SEARCH TABLE chat_messages USING INDEX idx_chat_messages_session_message (session_id=?)
```

**最適化**: インデックスがソート順序も保持しているため、追加のソート不要

---

### クエリ3: ピン留めセッション取得

```sql
EXPLAIN QUERY PLAN
SELECT * FROM chat_sessions
WHERE user_id = 'user-123' AND is_pinned = 1
ORDER BY pin_order ASC
LIMIT 10;
```

**想定結果**:

```
SEARCH TABLE chat_sessions USING INDEX idx_chat_sessions_is_pinned (user_id=? AND is_pinned=?)
```

**最適化**: 複合インデックスにより、フィルタリングとソートの両方をインデックスで処理

---

## インデックス最適化推奨事項

### 現状評価

| 項目                   | 状態      |
| ---------------------- | --------- |
| 主要クエリのカバー     | ✅ 良好   |
| 複合インデックスの活用 | ✅ 良好   |
| カバリングインデックス | ✅ 良好   |
| 全文検索対応           | ⚠️ 未対応 |

### 推奨追加インデックス

#### 1. ユーザー別更新日時ソート用（オプション）

```typescript
index("idx_chat_sessions_user_updated").on(table.userId, table.updatedAt);
```

**用途**: セッション一覧の更新日時ソートを最適化
**優先度**: 低（現状のインデックスでも十分なパフォーマンス）

#### 2. FTS5全文検索（将来対応）

```sql
CREATE VIRTUAL TABLE chat_messages_fts USING fts5(
  content,
  content=chat_messages,
  content_rowid=rowid
);

CREATE TRIGGER chat_messages_ai AFTER INSERT ON chat_messages BEGIN
  INSERT INTO chat_messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;
```

**用途**: メッセージ内容の全文検索
**優先度**: 中（検索機能実装時に追加）

---

## インデックスオーバーヘッド分析

### 書き込みパフォーマンスへの影響

| テーブル      | インデックス数 | 書き込み影響       |
| ------------- | -------------- | ------------------ |
| chat_sessions | 4              | 低〜中（許容範囲） |
| chat_messages | 5              | 中（監視推奨）     |

### 推奨事項

1. **バッチ挿入の活用**: 複数メッセージを一括挿入
2. **トランザクション最適化**: 関連操作をトランザクションでグループ化
3. **定期的なVACUUM**: SQLiteファイルの断片化解消

---

## 完了条件チェック

| 条件                                         | 状態                           |
| -------------------------------------------- | ------------------------------ |
| クエリパターンが分析されている               | ✅                             |
| 主要インデックスが設計されている（最低3つ）  | ✅ (9つ定義済み)               |
| 複合インデックスの必要性が検討されている     | ✅ (3つの複合インデックス分析) |
| EXPLAIN QUERY PLANの想定結果が記載されている | ✅                             |
| インデックス命名規則が定義されている         | ✅                             |

---

## 実装ファイル

**スキーマ定義**: `packages/shared/src/db/schema/chat-history.ts`

---

## 次のステップ

- T-02-1: 設計レビュー実施
- 全文検索（FTS5）の実装検討
- パフォーマンステストの実施
