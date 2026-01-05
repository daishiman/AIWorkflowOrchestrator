# CONV-04-02: Files/Conversions/ExtractedMetadata テーブル詳細設計

## 概要

RAGパイプラインにおけるファイル管理と変換履歴を管理する3つのテーブルの詳細設計。

**設計原則**:

- C.J.デイトのリレーショナルモデル理論に基づく第3正規形（3NF）準拠
- 参照整合性の厳格な保証（CASCADE DELETE戦略）
- SQLite制約による自己文書化
- パフォーマンス要件に基づくインデックス戦略

## 対象テーブル

| テーブル名          | 目的                   | 正規化レベル |
| ------------------- | ---------------------- | ------------ |
| `files`             | ファイルメタデータ管理 | 3NF          |
| `conversions`       | 変換履歴管理           | 3NF          |
| `extractedMetadata` | 抽出メタデータ管理     | 3NF          |

## ER図

```mermaid
erDiagram
    files ||--o{ conversions : "1:N (has many)"
    conversions ||--o| extractedMetadata : "1:1 (has one)"

    files {
        text id PK "UUID"
        text name "ファイル名"
        text path "ファイルパス"
        text mimeType "MIME type"
        text category "カテゴリ"
        integer size "バイト数"
        text hash UK "SHA256ハッシュ値"
        text encoding "文字エンコーディング"
        integer lastModified "最終更新日時"
        text metadata "JSON (追加メタデータ)"
        integer createdAt "作成日時"
        integer updatedAt "更新日時"
        integer deletedAt "論理削除日時"
    }

    conversions {
        text id PK "UUID"
        text fileId FK "参照: files.id"
        text status "変換ステータス (enum)"
        text converterId "変換器ID"
        text inputHash "入力ハッシュ"
        text outputHash "出力ハッシュ"
        integer duration "処理時間(ms)"
        integer inputSize "入力サイズ"
        integer outputSize "出力サイズ"
        text error "エラーメッセージ"
        text errorDetails "JSON (エラー詳細)"
        integer createdAt "作成日時"
        integer updatedAt "更新日時"
    }

    extractedMetadata {
        text id PK "UUID"
        text conversionId FK_UK "参照: conversions.id"
        text title "ドキュメントタイトル"
        text author "作成者"
        text language "言語コード (ISO 639-1)"
        integer wordCount "単語数"
        integer lineCount "行数"
        integer charCount "文字数"
        integer codeBlocks "コードブロック数"
        text headers "JSON (見出し配列)"
        text links "JSON (リンク配列)"
        text custom "JSON (カスタムメタデータ)"
        integer createdAt "作成日時"
        integer updatedAt "更新日時"
    }
```

## 詳細設計

### 1. files テーブル

**目的**: ファイルのメタデータと格納場所を管理

**カラム定義**:

| カラム名       | データ型 | 制約                      | 説明                      | 正規化根拠             |
| -------------- | -------- | ------------------------- | ------------------------- | ---------------------- |
| `id`           | TEXT     | PRIMARY KEY               | UUID                      | 代理キー（不変識別子） |
| `name`         | TEXT     | NOT NULL                  | ファイル名（拡張子含む）  | 1NF: 原子値            |
| `path`         | TEXT     | NOT NULL                  | 相対パス                  | 1NF: 原子値            |
| `mimeType`     | TEXT     | NOT NULL                  | MIME type                 | 1NF: 原子値            |
| `category`     | TEXT     | NOT NULL                  | カテゴリ                  | 1NF: 原子値            |
| `size`         | INTEGER  | NOT NULL, CHECK >= 0      | ファイルサイズ（バイト）  | 1NF: 原子値            |
| `hash`         | TEXT     | NOT NULL, UNIQUE          | SHA256ハッシュ値          | 重複検出用             |
| `encoding`     | TEXT     | NOT NULL, DEFAULT 'utf-8' | 文字エンコーディング      | 1NF: 原子値            |
| `lastModified` | INTEGER  | NOT NULL                  | 最終更新日時（timestamp） | 1NF: 原子値            |
| `metadata`     | TEXT     | DEFAULT '{}'              | 追加メタデータ（JSON）    | JSON1拡張による柔軟性  |
| `createdAt`    | INTEGER  | NOT NULL                  | 作成日時（unixepoch）     | 監査要件               |
| `updatedAt`    | INTEGER  | NOT NULL                  | 更新日時（unixepoch）     | 監査要件               |
| `deletedAt`    | INTEGER  | NULL                      | 論理削除日時（unixepoch） | ソフトデリート         |

**正規化分析**:

- **1NF**: すべてのカラムが原子値（配列・構造体なし）
- **2NF**: 部分関数従属なし（主キーが単一カラムのため自動的に満たす）
- **3NF**: 推移関数従属なし（すべてのカラムが主キーに直接依存）

**インデックス戦略**:

| インデックス名         | カラム    | 用途                           | タイプ |
| ---------------------- | --------- | ------------------------------ | ------ |
| `files_hash_idx`       | hash      | 重複ファイル検出               | UNIQUE |
| `files_path_idx`       | path      | パスによる検索                 | INDEX  |
| `files_mime_type_idx`  | mimeType  | MIMEタイプによるフィルタリング | INDEX  |
| `files_category_idx`   | category  | カテゴリ別検索                 | INDEX  |
| `files_created_at_idx` | createdAt | 時系列ソート・範囲検索         | INDEX  |

**Drizzle ORM実装**:

```typescript
export const files = sqliteTable(
  "files",
  {
    id: uuidPrimaryKey(),
    name: text("name").notNull(),
    path: text("path").notNull(),
    mimeType: text("mime_type").notNull(),
    category: text("category").notNull(),
    size: integer("size").notNull(),
    hash: text("hash").notNull(),
    encoding: text("encoding").notNull().default("utf-8"),
    lastModified: integer("last_modified", { mode: "timestamp" }).notNull(),
    ...metadataColumn(),
    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    hashIdx: uniqueIndex("files_hash_idx").on(table.hash),
    pathIdx: index("files_path_idx").on(table.path),
    mimeTypeIdx: index("files_mime_type_idx").on(table.mimeType),
    categoryIdx: index("files_category_idx").on(table.category),
    createdAtIdx: index("files_created_at_idx").on(table.createdAt),
  }),
);
```

---

### 2. conversions テーブル

**目的**: ファイルの変換処理の状態と結果を管理

**カラム定義**:

| カラム名       | データ型 | 制約                        | 説明                           | 正規化根拠  |
| -------------- | -------- | --------------------------- | ------------------------------ | ----------- |
| `id`           | TEXT     | PRIMARY KEY                 | UUID                           | 代理キー    |
| `fileId`       | TEXT     | NOT NULL, FK                | ファイルID                     | 外部キー    |
| `status`       | TEXT     | NOT NULL, DEFAULT 'pending' | 変換状態（enum）               | 1NF: 原子値 |
| `converterId`  | TEXT     | NOT NULL                    | 変換器識別子                   | 1NF: 原子値 |
| `inputHash`    | TEXT     | NOT NULL                    | 入力ハッシュ（キャッシュキー） | 1NF: 原子値 |
| `outputHash`   | TEXT     | NULL                        | 出力ハッシュ                   | 1NF: 原子値 |
| `duration`     | INTEGER  | NULL                        | 処理時間（ミリ秒）             | 1NF: 原子値 |
| `inputSize`    | INTEGER  | NULL                        | 入力サイズ                     | 1NF: 原子値 |
| `outputSize`   | INTEGER  | NULL                        | 出力サイズ                     | 1NF: 原子値 |
| `error`        | TEXT     | NULL                        | エラーメッセージ               | 1NF: 原子値 |
| `errorDetails` | TEXT     | NULL                        | エラー詳細（JSON）             | JSON1拡張   |
| `createdAt`    | INTEGER  | NOT NULL                    | 作成日時                       | 監査要件    |
| `updatedAt`    | INTEGER  | NOT NULL                    | 更新日時                       | 監査要件    |

**ステータスEnum**:

```typescript
type ConversionStatus = "pending" | "processing" | "completed" | "failed";
```

**外部キー制約**:

```sql
FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE
```

**CASCADE戦略**:

- `fileId`: `ON DELETE CASCADE` - ファイル削除時、変換履歴も削除

**インデックス戦略**:

| インデックス名                | カラム         | 用途                            |
| ----------------------------- | -------------- | ------------------------------- |
| `conversions_file_id_idx`     | fileId         | ファイル別変換履歴取得          |
| `conversions_status_idx`      | status         | 処理状態によるフィルタリング    |
| `conversions_input_hash_idx`  | inputHash      | キャッシュ検索                  |
| `conversions_created_at_idx`  | createdAt      | 時系列ソート                    |
| `conversions_file_status_idx` | fileId, status | 複合検索（ファイル×ステータス） |

**Drizzle ORM実装**:

```typescript
export const conversions = sqliteTable(
  "conversions",
  {
    id: uuidPrimaryKey(),
    fileId: text("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["pending", "processing", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    converterId: text("converter_id").notNull(),
    inputHash: text("input_hash").notNull(),
    outputHash: text("output_hash"),
    duration: integer("duration"),
    inputSize: integer("input_size"),
    outputSize: integer("output_size"),
    error: text("error"),
    errorDetails: text("error_details", { mode: "json" }).$type<
      Record<string, unknown>
    >(),
    ...timestamps,
  },
  (table) => ({
    fileIdIdx: index("conversions_file_id_idx").on(table.fileId),
    statusIdx: index("conversions_status_idx").on(table.status),
    inputHashIdx: index("conversions_input_hash_idx").on(table.inputHash),
    createdAtIdx: index("conversions_created_at_idx").on(table.createdAt),
    fileStatusIdx: index("conversions_file_status_idx").on(
      table.fileId,
      table.status,
    ),
  }),
);
```

---

### 3. extractedMetadata テーブル

**目的**: 変換時に抽出されたメタデータの保存

**カラム定義**:

| カラム名       | データ型 | 制約                 | 説明                       | 正規化根拠  |
| -------------- | -------- | -------------------- | -------------------------- | ----------- |
| `id`           | TEXT     | PRIMARY KEY          | UUID                       | 代理キー    |
| `conversionId` | TEXT     | NOT NULL, UNIQUE, FK | 変換ID（1:1リレーション）  | 外部キー    |
| `title`        | TEXT     | NULL                 | ドキュメントタイトル       | 1NF: 原子値 |
| `author`       | TEXT     | NULL                 | 著者                       | 1NF: 原子値 |
| `language`     | TEXT     | NULL                 | 言語コード（ISO 639-1）    | 1NF: 原子値 |
| `wordCount`    | INTEGER  | NOT NULL, DEFAULT 0  | 単語数                     | 1NF: 原子値 |
| `lineCount`    | INTEGER  | NOT NULL, DEFAULT 0  | 行数                       | 1NF: 原子値 |
| `charCount`    | INTEGER  | NOT NULL, DEFAULT 0  | 文字数                     | 1NF: 原子値 |
| `codeBlocks`   | INTEGER  | NOT NULL, DEFAULT 0  | コードブロック数           | 1NF: 原子値 |
| `headers`      | TEXT     | DEFAULT '[]'         | 見出しリスト（JSON配列）   | JSON1拡張   |
| `links`        | TEXT     | DEFAULT '[]'         | リンクリスト（JSON配列）   | JSON1拡張   |
| `custom`       | TEXT     | DEFAULT '{}'         | カスタムメタデータ（JSON） | JSON1拡張   |
| `createdAt`    | INTEGER  | NOT NULL             | 作成日時                   | 監査要件    |
| `updatedAt`    | INTEGER  | NOT NULL             | 更新日時                   | 監査要件    |

**1:1リレーション保証**:

- `conversionId` に `UNIQUE` 制約を設定
- 1つの変換に対して1つのメタデータのみ存在

**外部キー制約**:

```sql
FOREIGN KEY (conversionId) REFERENCES conversions(id) ON DELETE CASCADE
```

**CASCADE戦略**:

- `conversionId`: `ON DELETE CASCADE` - 変換削除時、メタデータも削除

**インデックス戦略**:

| インデックス名                         | カラム       | 用途                          |
| -------------------------------------- | ------------ | ----------------------------- |
| `extracted_metadata_conversion_id_idx` | conversionId | 1:1リレーション保証（UNIQUE） |
| `extracted_metadata_language_idx`      | language     | 言語フィルタリング            |

**Drizzle ORM実装**:

```typescript
export const extractedMetadata = sqliteTable(
  "extracted_metadata",
  {
    id: uuidPrimaryKey(),
    conversionId: text("conversion_id")
      .notNull()
      .references(() => conversions.id, { onDelete: "cascade" }),
    title: text("title"),
    author: text("author"),
    language: text("language"),
    wordCount: integer("word_count").notNull().default(0),
    lineCount: integer("line_count").notNull().default(0),
    charCount: integer("char_count").notNull().default(0),
    codeBlocks: integer("code_blocks").notNull().default(0),
    headers: text("headers", { mode: "json" }).$type<string[]>().default([]),
    links: text("links", { mode: "json" }).$type<string[]>().default([]),
    custom: text("custom", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default({}),
    ...timestamps,
  },
  (table) => ({
    conversionIdIdx: uniqueIndex("extracted_metadata_conversion_id_idx").on(
      table.conversionId,
    ),
    languageIdx: index("extracted_metadata_language_idx").on(table.language),
  }),
);
```

---

## リレーション定義

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
export const conversionsRelations = relations(conversions, ({ one }) => ({
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

---

## パフォーマンス最適化

### 1. クエリ最適化戦略

**頻出クエリパターン**:

```sql
-- Pattern 1: ファイル別変換履歴取得
SELECT * FROM conversions
WHERE fileId = ? AND deletedAt IS NULL;
-- 使用インデックス: conversions_file_id_idx

-- Pattern 2: 失敗した変換の特定
SELECT * FROM conversions
WHERE fileId = ? AND status = 'failed';
-- 使用インデックス: conversions_file_status_idx

-- Pattern 3: 重複ファイル検出
SELECT f1.*, f2.* FROM files f1
INNER JOIN files f2 ON f1.hash = f2.hash AND f1.id < f2.id
WHERE f1.deletedAt IS NULL AND f2.deletedAt IS NULL;
-- 使用インデックス: files_hash_idx

-- Pattern 4: キャッシュヒット確認
SELECT * FROM conversions
WHERE inputHash = ? AND status = 'completed';
-- 使用インデックス: conversions_input_hash_idx
```

### 2. インデックス効率分析

| インデックス名                    | 推定カバレッジ | 頻度 | 削除可能性 |
| --------------------------------- | -------------- | ---- | ---------- |
| `files_hash_idx`                  | 100%           | 高   | 低         |
| `files_path_idx`                  | 90%            | 高   | 低         |
| `conversions_file_status_idx`     | 95%            | 高   | 低         |
| `conversions_input_hash_idx`      | 80%            | 中   | 低         |
| `extracted_metadata_language_idx` | 50%            | 中   | 中         |

### 3. トランザクション分離レベル

**推奨設定**:

```sql
PRAGMA journal_mode = WAL;  -- Write-Ahead Logging
PRAGMA synchronous = NORMAL; -- バランス型
PRAGMA foreign_keys = ON;    -- 外部キー制約有効化
```

---

## データ整合性保証

### 1. 参照整合性マトリクス

| 親テーブル  | 子テーブル        | 関係 | CASCADE動作    |
| ----------- | ----------------- | ---- | -------------- |
| files       | conversions       | 1:N  | DELETE CASCADE |
| conversions | extractedMetadata | 1:1  | DELETE CASCADE |

### 2. ソフトデリート戦略

- `files`テーブルのみ論理削除（`deletedAt`カラム）を適用
- `conversions`と`extractedMetadata`は親テーブル削除時にCASCADE DELETE

---

## SQLアンチパターン回避

### 1. ジェイウォーク（カンマ区切り値）回避

**❌ アンチパターン**:

```sql
tags TEXT  -- "TypeScript,Database,ORM"
```

**✅ 正しい設計**:

```sql
headers TEXT CHECK (json_valid(headers) = 1 AND json_type(headers) = 'array')
```

### 2. EAV（Entity-Attribute-Value）回避

**❌ アンチパターン**:

```sql
CREATE TABLE file_attributes (
  fileId TEXT,
  attributeName TEXT,
  attributeValue TEXT
);
```

**✅ 正しい設計**:

```sql
metadata TEXT CHECK (json_valid(metadata) = 1)
```

---

## 品質保証

### 完了条件チェックリスト

- [x] 各テーブルのカラム定義が完成している
- [x] インデックス戦略が明確になっている
- [x] 外部キー制約が定義されている
- [x] リレーション定義が明確になっている
- [x] ER図が作成されている
- [x] パフォーマンス要件が満たされる設計になっている

### メトリクス

```yaml
normalization_level: 3NF
index_count: 12
foreign_key_count: 2
anti_pattern_count: 0
json_column_count: 5
cascade_strategy: 明確に定義
soft_delete: filesテーブルのみ
```

---

## 次のアクション

1. **設計レビュー** (`task-step02-design-review.md`) - アーキテクトによる設計レビュー
2. **テスト作成** (`task-step03-tests.md`) - スキーマ単体テスト作成
3. **実装** (`task-step04-implementation.md`) - Drizzle ORMスキーマファイル作成

---

## 参考文献

- C.J.デイト『データベース実践講義』（正規化理論）
- Bill Karwin『SQLアンチパターン』（アンチパターン回避）
- Drizzle ORM公式ドキュメント
- SQLite公式ドキュメント（JSON1拡張、WAL、外部キー制約）
