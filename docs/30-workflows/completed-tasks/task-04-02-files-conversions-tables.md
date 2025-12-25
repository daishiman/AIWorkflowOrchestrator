# CONV-04-02: files/conversions テーブル実装

## 概要

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | CONV-04-02                               |
| タスク名 | files/conversions テーブル実装           |
| 依存     | CONV-04-01                               |
| 規模     | 中                                       |
| 出力場所 | `packages/shared/src/db/schema/files.ts` |

## 目的

ファイルメタデータと変換履歴を管理するテーブルを定義する。
ファイル選択・変換機能の永続化基盤となる。

## 成果物

### 1. filesテーブル定義

```typescript
// packages/shared/src/db/schema/files.ts

import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import {
  uuidPrimaryKey,
  timestamps,
  metadataColumn,
  softDelete,
} from "./common";

/**
 * filesテーブル - ファイルメタデータ
 */
export const files = sqliteTable(
  "files",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 基本情報
    name: text("name").notNull(),
    path: text("path").notNull(),
    mimeType: text("mime_type").notNull(),
    category: text("category").notNull(),

    // サイズ・ハッシュ
    size: integer("size").notNull(),
    hash: text("hash").notNull(), // SHA-256 (64文字)
    encoding: text("encoding").notNull().default("utf-8"),

    // 日時情報
    lastModified: integer("last_modified", { mode: "timestamp" }).notNull(),

    // メタデータ
    ...metadataColumn(),

    // タイムスタンプ
    ...timestamps,

    // 論理削除
    ...softDelete,
  },
  (table) => ({
    // インデックス
    hashIdx: uniqueIndex("files_hash_idx").on(table.hash),
    pathIdx: index("files_path_idx").on(table.path),
    mimeTypeIdx: index("files_mime_type_idx").on(table.mimeType),
    categoryIdx: index("files_category_idx").on(table.category),
    createdAtIdx: index("files_created_at_idx").on(table.createdAt),
  }),
);

/**
 * filesテーブルの型
 */
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
```

### 2. conversionsテーブル定義

```typescript
// packages/shared/src/db/schema/conversions.ts

import {
  sqliteTable,
  text,
  integer,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { uuidPrimaryKey, timestamps } from "./common";
import { files } from "./files";

/**
 * conversionsテーブル - 変換履歴
 */
export const conversions = sqliteTable(
  "conversions",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 外部キー
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),

    // 変換情報
    status: text("status", {
      enum: ["pending", "processing", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    converterId: text("converter_id").notNull(),

    // ハッシュ（キャッシュ用）
    inputHash: text("input_hash").notNull(),
    outputHash: text("output_hash"),

    // パフォーマンス情報
    duration: integer("duration"), // ミリ秒
    inputSize: integer("input_size"),
    outputSize: integer("output_size"),

    // エラー情報
    error: text("error"),
    errorDetails: text("error_details", { mode: "json" }).$type<
      Record<string, unknown>
    >(),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    // インデックス
    fileIdIdx: index("conversions_file_id_idx").on(table.fileId),
    statusIdx: index("conversions_status_idx").on(table.status),
    inputHashIdx: index("conversions_input_hash_idx").on(table.inputHash),
    createdAtIdx: index("conversions_created_at_idx").on(table.createdAt),

    // 複合インデックス
    fileStatusIdx: index("conversions_file_status_idx").on(
      table.fileId,
      table.status,
    ),
  }),
);

/**
 * conversionsテーブルの型
 */
export type Conversion = typeof conversions.$inferSelect;
export type NewConversion = typeof conversions.$inferInsert;
```

### 3. リレーション定義

```typescript
// packages/shared/src/db/schema/relations.ts

import { relations } from "drizzle-orm";
import { files } from "./files";
import { conversions } from "./conversions";
// 後続タスクで追加
// import { chunks } from './chunks';

/**
 * filesテーブルのリレーション
 */
export const filesRelations = relations(files, ({ many }) => ({
  conversions: many(conversions),
  // chunks: many(chunks),  // CONV-04-03で追加
}));

/**
 * conversionsテーブルのリレーション
 */
export const conversionsRelations = relations(conversions, ({ one }) => ({
  file: one(files, {
    fields: [conversions.fileId],
    references: [files.id],
  }),
}));
```

### 4. 抽出メタデータテーブル

```typescript
// packages/shared/src/db/schema/extracted-metadata.ts

import {
  sqliteTable,
  text,
  integer,
  index,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { uuidPrimaryKey, timestamps } from "./common";
import { conversions } from "./conversions";

/**
 * extractedMetadataテーブル - 変換時に抽出されたメタデータ
 */
export const extractedMetadata = sqliteTable(
  "extracted_metadata",
  {
    // 主キー
    id: uuidPrimaryKey(),

    // 外部キー
    conversionId: text("conversion_id")
      .notNull()
      .references(() => conversions.id, { onDelete: "cascade" }),

    // 基本メタデータ
    title: text("title"),
    author: text("author"),
    language: text("language"), // ISO 639-1

    // カウント情報
    wordCount: integer("word_count").notNull().default(0),
    lineCount: integer("line_count").notNull().default(0),
    charCount: integer("char_count").notNull().default(0),
    codeBlocks: integer("code_blocks").notNull().default(0),

    // 配列データ（JSON）
    headers: text("headers", { mode: "json" }).$type<string[]>().default([]),
    links: text("links", { mode: "json" }).$type<string[]>().default([]),

    // カスタムメタデータ
    custom: text("custom", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default({}),

    // タイムスタンプ
    ...timestamps,
  },
  (table) => ({
    conversionIdIdx: uniqueIndex("extracted_metadata_conversion_id_idx").on(
      table.conversionId,
    ),
    languageIdx: index("extracted_metadata_language_idx").on(table.language),
  }),
);

/**
 * extractedMetadataテーブルの型
 */
export type ExtractedMetadata = typeof extractedMetadata.$inferSelect;
export type NewExtractedMetadata = typeof extractedMetadata.$inferInsert;
```

### 5. スキーマエクスポート更新

```typescript
// packages/shared/src/db/schema/index.ts

// 共通
export * from "./common";

// ファイル・変換
export * from "./files";
export * from "./conversions";
export * from "./extracted-metadata";
export * from "./relations";

// 後続タスクで追加
// export * from './chunks';       // CONV-04-03
// export * from './graph';        // CONV-04-05
```

### 6. マイグレーションSQL（参考）

```sql
-- 0001_create_files_table.sql

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT NOT NULL,
  size INTEGER NOT NULL,
  hash TEXT NOT NULL,
  encoding TEXT NOT NULL DEFAULT 'utf-8',
  last_modified INTEGER NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  deleted_at INTEGER
);

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS files_hash_idx ON files(hash);
CREATE INDEX IF NOT EXISTS files_path_idx ON files(path);
CREATE INDEX IF NOT EXISTS files_mime_type_idx ON files(mime_type);
CREATE INDEX IF NOT EXISTS files_category_idx ON files(category);
CREATE INDEX IF NOT EXISTS files_created_at_idx ON files(created_at);

-- 0002_create_conversions_table.sql

CREATE TABLE IF NOT EXISTS conversions (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  converter_id TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_hash TEXT,
  duration INTEGER,
  input_size INTEGER,
  output_size INTEGER,
  error TEXT,
  error_details TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- インデックス
CREATE INDEX IF NOT EXISTS conversions_file_id_idx ON conversions(file_id);
CREATE INDEX IF NOT EXISTS conversions_status_idx ON conversions(status);
CREATE INDEX IF NOT EXISTS conversions_input_hash_idx ON conversions(input_hash);
CREATE INDEX IF NOT EXISTS conversions_created_at_idx ON conversions(created_at);
CREATE INDEX IF NOT EXISTS conversions_file_status_idx ON conversions(file_id, status);

-- 0003_create_extracted_metadata_table.sql

CREATE TABLE IF NOT EXISTS extracted_metadata (
  id TEXT PRIMARY KEY,
  conversion_id TEXT NOT NULL REFERENCES conversions(id) ON DELETE CASCADE,
  title TEXT,
  author TEXT,
  language TEXT,
  word_count INTEGER NOT NULL DEFAULT 0,
  line_count INTEGER NOT NULL DEFAULT 0,
  char_count INTEGER NOT NULL DEFAULT 0,
  code_blocks INTEGER NOT NULL DEFAULT 0,
  headers TEXT DEFAULT '[]',
  links TEXT DEFAULT '[]',
  custom TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS extracted_metadata_conversion_id_idx
  ON extracted_metadata(conversion_id);
CREATE INDEX IF NOT EXISTS extracted_metadata_language_idx
  ON extracted_metadata(language);
```

## ディレクトリ構造

```
packages/shared/src/db/schema/
├── index.ts              # バレルエクスポート
├── common.ts             # 共通カラム（CONV-04-01で作成済み）
├── files.ts              # filesテーブル
├── conversions.ts        # conversionsテーブル
├── extracted-metadata.ts # extractedMetadataテーブル
└── relations.ts          # リレーション定義
```

## 受け入れ条件

- [ ] `files` テーブルが定義されている
- [ ] `conversions` テーブルが定義されている
- [ ] `extractedMetadata` テーブルが定義されている
- [ ] 適切なインデックスが設定されている
- [ ] 外部キー制約が設定されている（CASCADE DELETE）
- [ ] リレーションが定義されている
- [ ] マイグレーションが正常に実行できる
- [ ] 型定義（File, Conversion, ExtractedMetadata）がエクスポートされている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-04-01: Drizzle ORM セットアップ

### このタスクに依存するもの

- CONV-04-03: content_chunks テーブル + FTS5
- CONV-04-06: Repository パターン実装
- CONV-05-01: ログ記録サービス実装

## 備考

- hashカラムは重複ファイル検出に使用（同一内容のファイルは再処理をスキップ）
- conversionsテーブルは変換キャッシュとしても機能（inputHashが一致すれば再利用可能）
- extractedMetadataは1:1関係でconversionsに紐づく
- 論理削除（softDelete）はfilesテーブルのみに適用
