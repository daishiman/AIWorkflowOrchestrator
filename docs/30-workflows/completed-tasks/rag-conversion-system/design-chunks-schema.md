# Chunks テーブル スキーマ設計書

**作成日**: 2025-12-26
**更新日**: 2025-12-26
**対象**: RAG変換システム - チャンク管理
**参照要件**: `requirements-chunks-fts5.md`

---

## 1. 設計概要

### 1.1 目的

ファイル変換によって生成されたテキストチャンクを管理し、以下の要件を満たす：

- **位置追跡**: ファイル内のチャンク位置（行番号、文字位置、順序）
- **チャンキング戦略管理**: 使用された分割方法の記録
- **オーバーラップ管理**: 隣接チャンク間の連続性とオーバーラップ情報
- **重複検出**: ハッシュベースの重複チャンク検出
- **全文検索**: FTS5仮想テーブル連携によるベクトル検索

### 1.2 設計原則

| 原則               | 適用内容                               |
| ------------------ | -------------------------------------- |
| **正規化レベル**   | 第3正規形（3NF）準拠                   |
| **意図的非正規化** | `tokenCount`（計算コスト削減）         |
| **NULL戦略**       | 自己参照外部キー・位置情報のみNULLABLE |
| **参照整合性**     | CASCADE DELETE（ファイル削除時）       |

---

## 2. テーブル構造

### 2.1 カラム定義一覧

#### 基本情報

| カラム名            | 型   | 制約         | 説明                     |
| ------------------- | ---- | ------------ | ------------------------ |
| `id`                | TEXT | PK           | UUID形式のチャンクID     |
| `fileId`            | TEXT | NOT NULL, FK | 参照元ファイルID         |
| `content`           | TEXT | NOT NULL     | チャンクテキスト本体     |
| `contextualContent` | TEXT | -            | コンテキスト付きテキスト |

#### 位置情報

| カラム名       | 型      | 制約     | 説明                                |
| -------------- | ------- | -------- | ----------------------------------- |
| `chunkIndex`   | INTEGER | NOT NULL | ファイル内のチャンク順序（0始まり） |
| `startLine`    | INTEGER | -        | 開始行番号（1始まり）               |
| `endLine`      | INTEGER | -        | 終了行番号                          |
| `startChar`    | INTEGER | -        | 開始文字位置（バイトオフセット）    |
| `endChar`      | INTEGER | -        | 終了文字位置                        |
| `parentHeader` | TEXT    | -        | 親見出しテキスト                    |

#### チャンキング情報

| カラム名     | 型      | 制約             | 説明                          |
| ------------ | ------- | ---------------- | ----------------------------- |
| `strategy`   | TEXT    | NOT NULL         | チャンキング戦略（Enum）      |
| `tokenCount` | INTEGER | -                | トークン数（tiktoken基準）    |
| `hash`       | TEXT    | NOT NULL, UNIQUE | SHA-256ハッシュ（重複検出用） |

**strategyの値**:

- `fixed_size`: 固定トークン数分割
- `semantic`: セマンティックチャンキング
- `recursive`: 再帰的分割
- `sentence`: 文単位分割
- `paragraph`: 段落単位分割
- `markdown_header`: Markdown見出し基準
- `code_block`: コードブロック単位

#### オーバーラップ情報

| カラム名        | 型      | 制約      | 説明                       |
| --------------- | ------- | --------- | -------------------------- |
| `prevChunkId`   | TEXT    | -         | 前のチャンクID（自己参照） |
| `nextChunkId`   | TEXT    | -         | 次のチャンクID（自己参照） |
| `overlapTokens` | INTEGER | DEFAULT 0 | オーバーラップトークン数   |

#### メタデータ・監査

| カラム名    | 型      | 制約     | 説明               |
| ----------- | ------- | -------- | ------------------ |
| `metadata`  | TEXT    | -        | JSON形式の追加情報 |
| `createdAt` | INTEGER | NOT NULL | 作成タイムスタンプ |
| `updatedAt` | INTEGER | NOT NULL | 更新タイムスタンプ |

---

## 3. 制約設計

### 3.1 外部キー制約

#### ファイル参照

```typescript
fileId → files.id
  ON DELETE CASCADE
  ON UPDATE CASCADE
```

**CASCADE理由**: ファイル削除時は全チャンクも削除すべき（孤児チャンク防止）

### 3.2 UNIQUE制約

```sql
-- ハッシュ一意性（重複チャンク防止）
UNIQUE (hash)
```

---

## 4. インデックス設計

### 4.1 インデックス一覧

| インデックス名           | カラム                 | タイプ          | 目的                     |
| ------------------------ | ---------------------- | --------------- | ------------------------ |
| `idx_chunks_file_id`     | `fileId`               | B-Tree          | ファイル単位チャンク取得 |
| `idx_chunks_hash`        | `hash`                 | B-Tree (UNIQUE) | 重複検出                 |
| `idx_chunks_chunk_index` | `(fileId, chunkIndex)` | B-Tree (複合)   | 順序付きチャンク取得     |
| `idx_chunks_strategy`    | `strategy`             | B-Tree          | 戦略別分析               |

### 4.2 主要アクセスパターン

```sql
-- ファイルの全チャンク取得（順序付き）
SELECT * FROM chunks
WHERE fileId = ?
ORDER BY chunkIndex;

-- 重複チャンク検出
SELECT * FROM chunks
WHERE hash = ?
LIMIT 1;

-- 戦略別チャンク統計
SELECT strategy, COUNT(*), AVG(tokenCount)
FROM chunks
GROUP BY strategy;
```

---

## 5. Drizzle ORM 実装

### 5.1 スキーマ定義

```typescript
// packages/shared/src/db/schema/chunks.ts

export const chunkStrategies = [
  "fixed_size",
  "semantic",
  "recursive",
  "sentence",
  "paragraph",
  "markdown_header",
  "code_block",
] as const;

export type ChunkStrategy = (typeof chunkStrategies)[number];

export const chunks = sqliteTable(
  "chunks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    contextualContent: text("contextual_content"),
    chunkIndex: integer("chunk_index").notNull(),
    startLine: integer("start_line"),
    endLine: integer("end_line"),
    startChar: integer("start_char"),
    endChar: integer("end_char"),
    parentHeader: text("parent_header"),
    strategy: text("strategy").notNull(),
    tokenCount: integer("token_count"),
    hash: text("hash").notNull(),
    prevChunkId: text("prev_chunk_id"),
    nextChunkId: text("next_chunk_id"),
    overlapTokens: integer("overlap_tokens").notNull().default(0),
    metadata: text("metadata", { mode: "json" }).$type<ChunkMetadata>(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    fileIdIdx: index("idx_chunks_file_id").on(table.fileId),
    hashIdx: unique("idx_chunks_hash").on(table.hash),
    chunkIndexIdx: index("idx_chunks_chunk_index").on(
      table.fileId,
      table.chunkIndex,
    ),
    strategyIdx: index("idx_chunks_strategy").on(table.strategy),
  }),
);
```

### 5.2 型定義

```typescript
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
```

---

## 6. FTS5 仮想テーブル設計

### 6.1 FTS5テーブル定義

```sql
CREATE VIRTUAL TABLE chunks_fts USING fts5(
  content,
  contextual_content,
  content='chunks',
  content_rowid='rowid',
  tokenize='porter unicode61 remove_diacritics 1'
);
```

### 6.2 同期トリガー

```sql
-- INSERT トリガー
CREATE TRIGGER chunks_fts_insert AFTER INSERT ON chunks BEGIN
  INSERT INTO chunks_fts(rowid, content, contextual_content)
  VALUES (new.rowid, new.content, new.contextual_content);
END;

-- UPDATE トリガー
CREATE TRIGGER chunks_fts_update AFTER UPDATE ON chunks BEGIN
  UPDATE chunks_fts SET
    content = new.content,
    contextual_content = new.contextual_content
  WHERE rowid = old.rowid;
END;

-- DELETE トリガー
CREATE TRIGGER chunks_fts_delete AFTER DELETE ON chunks BEGIN
  DELETE FROM chunks_fts WHERE rowid = old.rowid;
END;
```

---

## 7. 完了条件チェックリスト

- [x] 全カラムが定義されている（id、fileId、content、contextualContent、chunkIndex、startLine、endLine、startChar、endChar、parentHeader、strategy、tokenCount、hash、prevChunkId、nextChunkId、overlapTokens、metadata、createdAt、updatedAt）
- [x] 外部キー制約が定義されている（fileId → files.id、onDelete: cascade）
- [x] インデックスが定義されている（fileIdIdx、hashIdx、chunkIndexIdx、strategyIdx）
- [x] strategy列のenumが定義されている（fixed_size、semantic、recursive、sentence、paragraph、markdown_header、code_block）
- [x] 型定義が明確である（Chunk、NewChunk）

---

## 8. 次のアクション

### T-01-2: FTS5仮想テーブル設計

**依存関係**: T-01-1（本タスク）完了後に実行

**実装内容**:

1. マイグレーションファイル作成
2. FTS5仮想テーブル定義
3. 同期トリガー定義
4. マイグレーション実行とテスト

---

## 変更履歴

| 日付       | 変更内容                     | 担当         |
| ---------- | ---------------------------- | ------------ |
| 2025-12-26 | 初版作成                     | db-architect |
| 2025-12-26 | 拡張カラム追加（位置情報等） | db-architect |
