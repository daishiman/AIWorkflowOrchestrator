---
title: CONV-04-02 files/conversionsテーブル実装 - 要件定義書
version: 1.0.0
status: draft
created: 2025-12-25
author: spec-writer
task_id: CONV-04-02
phase: Phase 0 - 要件定義
---

# CONV-04-02: files/conversionsテーブル実装 - 要件定義書

## 1. 概要

### 1.1 目的

RAGパイプラインの基盤となるファイル管理テーブル（`files`）と変換管理テーブル（`conversions`）を実装する。これらのテーブルは、ドキュメントのインジェスト・変換フローを管理し、後続のチャンキング・埋め込み生成の基盤となる。

### 1.2 背景

- CONV-04-01でDrizzle ORM基盤と共通カラム定義が完了済み
- RAGパイプラインでは多様なファイル形式（PDF、Markdown、テキスト等）を統一的に管理する必要がある
- ファイルの変換状態を追跡し、エラーリカバリーを可能にする

### 1.3 スコープ

#### 含むもの

- `files`テーブルのスキーマ定義
- `conversions`テーブルのスキーマ定義
- `extractedMetadata`テーブルのスキーマ定義
- 必要なインデックス定義
- 外部キー制約の定義
- TypeScript型定義（Drizzle ORM推論型）
- テーブル間リレーション定義

#### 含まないもの

- チャンクテーブル（`chunks`）の実装（CONV-04-03）
- ベクトルインデックス（CONV-04-04）
- ナレッジグラフテーブル（CONV-04-05）
- リポジトリパターン実装（CONV-04-06）
- マイグレーション実行（別タスク）

## 2. 技術制約

### 2.1 技術スタック

| 項目         | 仕様                         |
| ------------ | ---------------------------- |
| ORM          | Drizzle ORM 0.39.x           |
| データベース | SQLite（Turso libSQL対応）   |
| 言語         | TypeScript 5.x strict モード |
| ランタイム   | Node.js 20.x / Electron      |

### 2.2 プロジェクト制約

- **共通カラム活用**: `common.ts`で定義された`uuidPrimaryKey`、`timestamps`、`metadataColumn`、`softDelete`を使用
- **命名規則**: テーブル名はsnake_case、カラム名もsnake_case
- **SQLite制約**: 外部キー制約はPRAGMAで有効化が必要
- **Turso対応**: libSQL互換のSQL構文を使用

### 2.3 依存関係

```
CONV-04-01 (Drizzle ORM基盤) ← 本タスク → CONV-04-03 (chunksテーブル)
                                        → CONV-04-04 (ベクトルインデックス)
```

## 3. テーブル設計

### 3.1 filesテーブル

#### 目的

ファイルのメタデータと格納場所を管理する。

#### スキーマ定義

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

#### カラム詳細

| カラム        | 型         | 制約                      | 説明                               |
| ------------- | ---------- | ------------------------- | ---------------------------------- |
| id            | TEXT       | PK, UUID                  | 一意識別子                         |
| name          | TEXT       | NOT NULL                  | ファイル名（拡張子含む）           |
| path          | TEXT       | NOT NULL                  | 相対パス                           |
| mime_type     | TEXT       | NOT NULL                  | MIMEタイプ                         |
| category      | TEXT       | NOT NULL                  | カテゴリ（document/image/video等） |
| size          | INTEGER    | NOT NULL                  | ファイルサイズ（バイト）           |
| hash          | TEXT       | NOT NULL, UNIQUE          | SHA-256ハッシュ値（重複検出用）    |
| encoding      | TEXT       | NOT NULL, DEFAULT 'utf-8' | 文字エンコーディング               |
| last_modified | INTEGER    | NOT NULL                  | 最終更新日時（タイムスタンプ）     |
| metadata      | TEXT(JSON) | DEFAULT '{}'              | 追加メタデータ                     |
| created_at    | INTEGER    | NOT NULL                  | 作成日時（unixepoch）              |
| updated_at    | INTEGER    | NOT NULL                  | 更新日時（unixepoch）              |
| deleted_at    | INTEGER    | NULL許容                  | 論理削除日時                       |

#### インデックス戦略

| インデックス名       | カラム     | 用途                           |
| -------------------- | ---------- | ------------------------------ |
| files_hash_idx       | hash       | 重複ファイル検出（UNIQUE）     |
| files_path_idx       | path       | パスによる検索                 |
| files_mime_type_idx  | mime_type  | MIMEタイプによるフィルタリング |
| files_category_idx   | category   | カテゴリ別検索                 |
| files_created_at_idx | created_at | 時系列ソート・範囲検索         |

### 3.2 conversionsテーブル

#### 目的

ファイルの変換処理（PDFからテキスト抽出等）の状態と結果を管理する。

#### スキーマ定義

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

#### カラム詳細

| カラム        | 型         | 制約                        | 説明                           |
| ------------- | ---------- | --------------------------- | ------------------------------ |
| id            | TEXT       | PK, UUID                    | 一意識別子                     |
| file_id       | TEXT       | NOT NULL, FK                | 対象ファイルID                 |
| status        | TEXT       | NOT NULL, DEFAULT 'pending' | 変換状態（enum）               |
| converter_id  | TEXT       | NOT NULL                    | 変換器識別子                   |
| input_hash    | TEXT       | NOT NULL                    | 入力ハッシュ（キャッシュキー） |
| output_hash   | TEXT       | NULL許容                    | 出力ハッシュ                   |
| duration      | INTEGER    | NULL許容                    | 処理時間（ミリ秒）             |
| input_size    | INTEGER    | NULL許容                    | 入力サイズ                     |
| output_size   | INTEGER    | NULL許容                    | 出力サイズ                     |
| error         | TEXT       | NULL許容                    | エラーメッセージ               |
| error_details | TEXT(JSON) | NULL許容                    | エラー詳細（JSON）             |
| created_at    | INTEGER    | NOT NULL                    | 作成日時                       |
| updated_at    | INTEGER    | NOT NULL                    | 更新日時                       |

#### インデックス戦略

| インデックス名              | カラム          | 用途                         |
| --------------------------- | --------------- | ---------------------------- |
| conversions_file_id_idx     | file_id         | ファイル別変換履歴取得       |
| conversions_status_idx      | status          | 処理状態によるフィルタリング |
| conversions_input_hash_idx  | input_hash      | キャッシュ検索               |
| conversions_created_at_idx  | created_at      | 時系列ソート                 |
| conversions_file_status_idx | file_id, status | 複合検索                     |

### 3.3 extractedMetadataテーブル

#### 目的

変換時に抽出されたメタデータ（タイトル、著者、文字数等）を管理する。

#### スキーマ定義

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

#### カラム詳細

| カラム        | 型         | 制約                 | 説明                    |
| ------------- | ---------- | -------------------- | ----------------------- |
| id            | TEXT       | PK, UUID             | 一意識別子              |
| conversion_id | TEXT       | NOT NULL, FK, UNIQUE | 変換ID（1:1関係）       |
| title         | TEXT       | NULL許容             | ドキュメントタイトル    |
| author        | TEXT       | NULL許容             | 著者                    |
| language      | TEXT       | NULL許容             | 言語コード（ISO 639-1） |
| word_count    | INTEGER    | NOT NULL, DEFAULT 0  | 単語数                  |
| line_count    | INTEGER    | NOT NULL, DEFAULT 0  | 行数                    |
| char_count    | INTEGER    | NOT NULL, DEFAULT 0  | 文字数                  |
| code_blocks   | INTEGER    | NOT NULL, DEFAULT 0  | コードブロック数        |
| headers       | TEXT(JSON) | DEFAULT '[]'         | 見出しリスト            |
| links         | TEXT(JSON) | DEFAULT '[]'         | リンクリスト            |
| custom        | TEXT(JSON) | DEFAULT '{}'         | カスタムメタデータ      |
| created_at    | INTEGER    | NOT NULL             | 作成日時                |
| updated_at    | INTEGER    | NOT NULL             | 更新日時                |

### 3.4 リレーション定義

```typescript
// packages/shared/src/db/schema/relations.ts

import { relations } from "drizzle-orm";
import { files } from "./files";
import { conversions } from "./conversions";
import { extractedMetadata } from "./extracted-metadata";

/**
 * filesテーブルのリレーション
 */
export const filesRelations = relations(files, ({ many }) => ({
  conversions: many(conversions),
}));

/**
 * conversionsテーブルのリレーション
 */
export const conversionsRelations = relations(conversions, ({ one, many }) => ({
  file: one(files, {
    fields: [conversions.fileId],
    references: [files.id],
  }),
  extractedMetadata: one(extractedMetadata, {
    fields: [conversions.id],
    references: [extractedMetadata.conversionId],
  }),
}));

/**
 * extractedMetadataテーブルのリレーション
 */
export const extractedMetadataRelations = relations(
  extractedMetadata,
  ({ one }) => ({
    conversion: one(conversions, {
      fields: [extractedMetadata.conversionId],
      references: [conversions.id],
    }),
  }),
);
```

## 4. 型定義

### 4.1 推論型

```typescript
// packages/shared/src/db/schema/types.ts

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { files } from "./files";
import type { conversions } from "./conversions";
import type { extractedMetadata } from "./extracted-metadata";

// filesテーブル
export type File = InferSelectModel<typeof files>;
export type NewFile = InferInsertModel<typeof files>;

// conversionsテーブル
export type Conversion = InferSelectModel<typeof conversions>;
export type NewConversion = InferInsertModel<typeof conversions>;

// extractedMetadataテーブル
export type ExtractedMetadata = InferSelectModel<typeof extractedMetadata>;
export type NewExtractedMetadata = InferInsertModel<typeof extractedMetadata>;

// ステータス型
export type ConversionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
```

## 5. 受け入れ基準

### 5.1 機能要件

- [ ] `files`テーブルが正しく定義され、CRUD操作が可能
- [ ] `conversions`テーブルが正しく定義され、CRUD操作が可能
- [ ] `extractedMetadata`テーブルが正しく定義され、CRUD操作が可能
- [ ] 外部キー制約が正しく機能し、CASCADE DELETEが動作
- [ ] すべてのインデックスが作成されている
- [ ] リレーションが正しく定義されている

### 5.2 技術要件

- [ ] TypeScript strictモードでコンパイルエラーがない
- [ ] Drizzle ORM 0.39.xとの互換性が確認されている
- [ ] SQLite（Turso libSQL）で動作確認済み
- [ ] 共通カラム（id, timestamps, metadata, softDelete）が正しく適用されている

### 5.3 品質要件

- [ ] ESLint/Prettierでエラーがない
- [ ] 型定義がエクスポートされている
- [ ] schema/index.tsに正しくエクスポートされている

### 5.4 テスト要件

- [ ] テーブル作成のテストが存在
- [ ] 基本CRUD操作のテストが存在
- [ ] 外部キー制約のテストが存在
- [ ] インデックス存在確認のテストが存在

## 6. ファイル構成

```
packages/shared/src/db/schema/
├── common.ts                # 既存：共通カラム定義
├── files.ts                 # 新規：filesテーブル
├── conversions.ts           # 新規：conversionsテーブル
├── extracted-metadata.ts    # 新規：extractedMetadataテーブル
├── relations.ts             # 新規：リレーション定義
└── index.ts                 # 更新：エクスポート追加
```

## 7. 実装順序

1. `files.ts` - filesテーブルスキーマ定義
2. `conversions.ts` - conversionsテーブルスキーマ定義
3. `extracted-metadata.ts` - extractedMetadataテーブルスキーマ定義
4. `relations.ts` - リレーション定義
5. `index.ts` - エクスポート更新
6. テスト作成・実行

## 8. 次フェーズ連携情報

### 8.1 後続タスクへの入力

- CONV-04-03（chunksテーブル）: `files.id`を参照する外部キーを持つ
- CONV-04-06（リポジトリパターン）: 本タスクのスキーマを使用してリポジトリを実装

### 8.2 テスト作成指示

```
テストファイルパス: packages/shared/src/db/schema/__tests__/*.test.ts
テストフレームワーク: Vitest
カバレッジ目標: 80%以上
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-12-25 | 初版作成 |
