# CONV-04-03: content_chunks テーブル + FTS5

## 概要

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| タスクID | CONV-04-03                                |
| タスク名 | content_chunks テーブル + FTS5            |
| 依存     | CONV-04-01                                |
| 規模     | 中                                        |
| 出力場所 | `packages/shared/src/db/schema/chunks.ts` |

## 目的

テキストチャンクを保存し、FTS5（Full-Text Search 5）によるキーワード検索を可能にするテーブルを定義する。
BM25ベースのキーワード検索基盤となる。

## 成果物

### 1. chunksテーブル定義

```typescript
// packages/shared/src/db/schema/chunks.ts

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { uuidPrimaryKey, timestamps, metadataColumn } from "./common";
import { files } from "./files";

/**
 * chunksテーブル - テキストチャンク
 */
export const chunks = sqliteTable(
  "chunks",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 外部キー
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),

    // コンテンツ
    content: text("content").notNull(),
    contextualContent: text("contextual_content"), // Contextual Retrieval用

    // 位置情報
    chunkIndex: integer("chunk_index").notNull(),
    startLine: integer("start_line").notNull(),
    endLine: integer("end_line").notNull(),
    startChar: integer("start_char").notNull(),
    endChar: integer("end_char").notNull(),
    parentHeader: text("parent_header"),

    // チャンキング情報
    strategy: text("strategy", {
      enum: [
        "fixed_size",
        "semantic",
        "recursive",
        "sentence",
        "paragraph",
        "markdown_header",
        "code_block",
      ],
    }).notNull(),
    tokenCount: integer("token_count").notNull(),
    hash: text("hash").notNull(), // 重複検出用

    // オーバーラップ情報
    prevChunkId: text("prev_chunk_id"),
    nextChunkId: text("next_chunk_id"),
    overlapTokens: integer("overlap_tokens").default(0),

    // メタデータ
    metadata: metadataColumn(),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    // インデックス
    fileIdIdx: index("chunks_file_id_idx").on(table.fileId),
    hashIdx: index("chunks_hash_idx").on(table.hash),
    chunkIndexIdx: index("chunks_chunk_index_idx").on(
      table.fileId,
      table.chunkIndex,
    ),
    strategyIdx: index("chunks_strategy_idx").on(table.strategy),
  }),
);

/**
 * chunksテーブルの型
 */
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
```

### 2. FTS5仮想テーブル定義

```typescript
// packages/shared/src/db/schema/chunks-fts.ts

import { sql } from "drizzle-orm";
import type { Database } from "../client";

/**
 * FTS5仮想テーブル作成SQL
 * 注: Drizzleでは仮想テーブルの直接定義ができないため、raw SQLで作成
 */
export const createChunksFtsTable = async (db: Database): Promise<void> => {
  await db.run(sql`
    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
      content,
      contextual_content,
      parent_header,
      content=chunks,
      content_rowid=rowid,
      tokenize='unicode61 remove_diacritics 2'
    );
  `);
};

/**
 * FTS5トリガー作成SQL
 * chunksテーブルの変更をFTSテーブルに同期
 */
export const createChunksFtsTriggers = async (db: Database): Promise<void> => {
  // INSERT時
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_insert
    AFTER INSERT ON chunks
    BEGIN
      INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
      VALUES (NEW.rowid, NEW.content, NEW.contextual_content, NEW.parent_header);
    END;
  `);

  // UPDATE時
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_update
    AFTER UPDATE ON chunks
    BEGIN
      INSERT INTO chunks_fts(chunks_fts, rowid, content, contextual_content, parent_header)
      VALUES ('delete', OLD.rowid, OLD.content, OLD.contextual_content, OLD.parent_header);
      INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
      VALUES (NEW.rowid, NEW.content, NEW.contextual_content, NEW.parent_header);
    END;
  `);

  // DELETE時
  await db.run(sql`
    CREATE TRIGGER IF NOT EXISTS chunks_fts_delete
    AFTER DELETE ON chunks
    BEGIN
      INSERT INTO chunks_fts(chunks_fts, rowid, content, contextual_content, parent_header)
      VALUES ('delete', OLD.rowid, OLD.content, OLD.contextual_content, OLD.parent_header);
    END;
  `);
};

/**
 * FTS5テーブルとトリガーを初期化
 */
export const initializeChunksFts = async (db: Database): Promise<void> => {
  await createChunksFtsTable(db);
  await createChunksFtsTriggers(db);
};
```

### 3. FTS5検索クエリビルダー

```typescript
// packages/shared/src/db/queries/chunks-search.ts

import { sql, eq, and, inArray } from 'drizzle-orm';
import type { Database } from '../client';
import { chunks } from '../schema/chunks';

/**
 * FTS5検索結果
 */
export interface FtsSearchResult {
  chunkId: string;
  content: string;
  contextualContent: string | null;
  parentHeader: string | null;
  bm25Score: number;
  snippet: string;
  highlights: string[];
}

/**
 * FTS5キーワード検索
 */
export const searchChunksByKeyword = async (
  db: Database,
  query: string,
  options: {
    limit?: number;
    offset?: number;
    fileIds?: string[];
    highlightTag?: string;
  } = {}
): Promise<FtsSearchResult[]> => {
  const {
    limit = 20,
    offset = 0,
    fileIds,
    highlightTag = 'b',
  } = options;

  // FTS5クエリのエスケープ
  const escapedQuery = escapeF ts5Query(query);

  // 基本クエリ
  let baseQuery = sql`
    SELECT
      c.id as chunk_id,
      c.content,
      c.contextual_content,
      c.parent_header,
      bm25(chunks_fts) as bm25_score,
      snippet(chunks_fts, 0, '<${sql.raw(highlightTag)}>', '</${sql.raw(highlightTag)}>', '...', 64) as snippet,
      highlight(chunks_fts, 0, '<${sql.raw(highlightTag)}>', '</${sql.raw(highlightTag)}>') as highlights
    FROM chunks_fts
    INNER JOIN chunks c ON chunks_fts.rowid = c.rowid
    WHERE chunks_fts MATCH ${escapedQuery}
  `;

  // ファイルIDフィルター
  if (fileIds && fileIds.length > 0) {
    baseQuery = sql`${baseQuery} AND c.file_id IN (${sql.join(fileIds.map(id => sql`${id}`), sql`, `)})`;
  }

  // ソート・ページネーション
  baseQuery = sql`${baseQuery}
    ORDER BY bm25_score
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const results = await db.all(baseQuery);

  return results.map((row: any) => ({
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    parentHeader: row.parent_header,
    bm25Score: row.bm25_score,
    snippet: row.snippet,
    highlights: row.highlights ? [row.highlights] : [],
  }));
};

/**
 * FTS5クエリのエスケープ
 */
export const escapeFts5Query = (query: string): string => {
  // 特殊文字をエスケープ
  return query
    .replace(/"/g, '""')  // ダブルクォートをエスケープ
    .replace(/[*]/g, '')   // ワイルドカードを除去（必要に応じて調整）
    .split(/\s+/)
    .filter(term => term.length > 0)
    .map(term => `"${term}"`)  // 各単語をクォート
    .join(' ');
};

/**
 * FTS5フレーズ検索
 */
export const searchChunksByPhrase = async (
  db: Database,
  phrase: string,
  options: { limit?: number; offset?: number } = {}
): Promise<FtsSearchResult[]> => {
  const { limit = 20, offset = 0 } = options;

  // フレーズをダブルクォートで囲む
  const phraseQuery = `"${phrase.replace(/"/g, '""')}"`;

  const results = await db.all(sql`
    SELECT
      c.id as chunk_id,
      c.content,
      c.contextual_content,
      c.parent_header,
      bm25(chunks_fts) as bm25_score,
      snippet(chunks_fts, 0, '<b>', '</b>', '...', 64) as snippet
    FROM chunks_fts
    INNER JOIN chunks c ON chunks_fts.rowid = c.rowid
    WHERE chunks_fts MATCH ${phraseQuery}
    ORDER BY bm25_score
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  return results.map((row: any) => ({
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    parentHeader: row.parent_header,
    bm25Score: row.bm25_score,
    snippet: row.snippet,
    highlights: [],
  }));
};

/**
 * FTS5 NEAR検索（近接検索）
 */
export const searchChunksByNear = async (
  db: Database,
  terms: string[],
  distance: number = 10,
  options: { limit?: number; offset?: number } = {}
): Promise<FtsSearchResult[]> => {
  const { limit = 20, offset = 0 } = options;

  // NEAR構文: NEAR(term1 term2, distance)
  const nearQuery = `NEAR(${terms.map(t => `"${t}"`).join(' ')}, ${distance})`;

  const results = await db.all(sql`
    SELECT
      c.id as chunk_id,
      c.content,
      c.contextual_content,
      c.parent_header,
      bm25(chunks_fts) as bm25_score,
      snippet(chunks_fts, 0, '<b>', '</b>', '...', 64) as snippet
    FROM chunks_fts
    INNER JOIN chunks c ON chunks_fts.rowid = c.rowid
    WHERE chunks_fts MATCH ${nearQuery}
    ORDER BY bm25_score
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  return results.map((row: any) => ({
    chunkId: row.chunk_id,
    content: row.content,
    contextualContent: row.contextual_content,
    parentHeader: row.parent_header,
    bm25Score: row.bm25_score,
    snippet: row.snippet,
    highlights: [],
  }));
};

/**
 * BM25スコアの正規化（0-1範囲に）
 */
export const normalizeBm25Score = (score: number): number => {
  // BM25スコアは負の値（類似度が高いほど0に近い）
  // 正規化して0-1の範囲に変換
  return 1 / (1 + Math.exp(score));  // シグモイド関数で変換
};
```

### 4. リレーション更新

```typescript
// packages/shared/src/db/schema/relations.ts に追加

import { relations } from "drizzle-orm";
import { files } from "./files";
import { conversions } from "./conversions";
import { chunks } from "./chunks";

/**
 * filesテーブルのリレーション（更新）
 */
export const filesRelations = relations(files, ({ many }) => ({
  conversions: many(conversions),
  chunks: many(chunks),
}));

/**
 * chunksテーブルのリレーション
 */
export const chunksRelations = relations(chunks, ({ one }) => ({
  file: one(files, {
    fields: [chunks.fileId],
    references: [files.id],
  }),
  prevChunk: one(chunks, {
    fields: [chunks.prevChunkId],
    references: [chunks.id],
    relationName: "prevChunk",
  }),
  nextChunk: one(chunks, {
    fields: [chunks.nextChunkId],
    references: [chunks.id],
    relationName: "nextChunk",
  }),
}));
```

### 5. マイグレーションSQL（参考）

```sql
-- 0004_create_chunks_table.sql

CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  contextual_content TEXT,
  chunk_index INTEGER NOT NULL,
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  start_char INTEGER NOT NULL,
  end_char INTEGER NOT NULL,
  parent_header TEXT,
  strategy TEXT NOT NULL
    CHECK(strategy IN ('fixed_size', 'semantic', 'recursive', 'sentence', 'paragraph', 'markdown_header', 'code_block')),
  token_count INTEGER NOT NULL,
  hash TEXT NOT NULL,
  prev_chunk_id TEXT,
  next_chunk_id TEXT,
  overlap_tokens INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- インデックス
CREATE INDEX IF NOT EXISTS chunks_file_id_idx ON chunks(file_id);
CREATE INDEX IF NOT EXISTS chunks_hash_idx ON chunks(hash);
CREATE INDEX IF NOT EXISTS chunks_chunk_index_idx ON chunks(file_id, chunk_index);
CREATE INDEX IF NOT EXISTS chunks_strategy_idx ON chunks(strategy);

-- 0005_create_chunks_fts.sql

-- FTS5仮想テーブル
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  content,
  contextual_content,
  parent_header,
  content=chunks,
  content_rowid=rowid,
  tokenize='unicode61 remove_diacritics 2'
);

-- INSERT トリガー
CREATE TRIGGER IF NOT EXISTS chunks_fts_insert
AFTER INSERT ON chunks
BEGIN
  INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
  VALUES (NEW.rowid, NEW.content, NEW.contextual_content, NEW.parent_header);
END;

-- UPDATE トリガー
CREATE TRIGGER IF NOT EXISTS chunks_fts_update
AFTER UPDATE ON chunks
BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, content, contextual_content, parent_header)
  VALUES ('delete', OLD.rowid, OLD.content, OLD.contextual_content, OLD.parent_header);
  INSERT INTO chunks_fts(rowid, content, contextual_content, parent_header)
  VALUES (NEW.rowid, NEW.content, NEW.contextual_content, NEW.parent_header);
END;

-- DELETE トリガー
CREATE TRIGGER IF NOT EXISTS chunks_fts_delete
AFTER DELETE ON chunks
BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, content, contextual_content, parent_header)
  VALUES ('delete', OLD.rowid, OLD.content, OLD.contextual_content, OLD.parent_header);
END;
```

## ディレクトリ構造

```
packages/shared/src/db/
├── schema/
│   ├── chunks.ts           # chunksテーブル
│   └── chunks-fts.ts       # FTS5仮想テーブル
└── queries/
    └── chunks-search.ts    # FTS5検索クエリ
```

## 受け入れ条件

- [ ] `chunks` テーブルが定義されている
- [ ] FTS5仮想テーブル `chunks_fts` が作成できる
- [ ] INSERT/UPDATE/DELETEトリガーが動作する
- [ ] キーワード検索関数が実装されている
- [ ] フレーズ検索関数が実装されている
- [ ] NEAR検索関数が実装されている
- [ ] BM25スコア正規化関数が実装されている
- [ ] マイグレーションが正常に実行できる
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-04-01: Drizzle ORM セットアップ

### このタスクに依存するもの

- CONV-04-04: DiskANN ベクトルインデックス設定
- CONV-06-01: チャンキング戦略実装
- CONV-07-02: キーワード検索戦略 (FTS5/BM25)

## 備考

- FTS5はSQLite標準拡張で、libSQLでもサポートされている
- `tokenize='unicode61 remove_diacritics 2'` で日本語を含むUnicode文字を適切に処理
- BM25スコアは負の値で返される（小さいほど関連度が高い）ため、正規化が必要
- contextual_contentはContextual Retrieval用のLLM生成コンテキスト
- 既存データがある場合、FTS5テーブルの再構築が必要（`INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild')`）
