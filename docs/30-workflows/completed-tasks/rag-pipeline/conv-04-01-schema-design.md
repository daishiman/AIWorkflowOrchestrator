# CONV-04-01: 共通スキーマ設計書

## 概要

本設計書は、Drizzle ORM で使用する共通カラム定義と型定義を規定する。
**個別テーブル定義は本タスク（CONV-04-01）のスコープ外**であり、後続タスク（CONV-04-02〜06）で実装する。

## 目的

- 全テーブルで共通利用するカラム定義（UUID主キー、timestamps、metadata、softDelete）を設計
- 型安全性とメンテナンス性の高い共通ヘルパー関数を提供
- 後続タスクでのテーブル実装時の一貫性を確保

## スコープ

### 本タスクで実装するもの ✅

- UUID主キーヘルパー関数
- timestampsカラムヘルパー関数
- metadataカラムヘルパー関数
- softDeleteカラムヘルパー関数
- 共通型定義（BaseModel等）
- 型ガード関数

### 本タスクで実装しないもの ❌

- 個別テーブル定義（files、conversions、content_chunks等）
- テーブル固有のインデックス定義
- 外部キー制約定義
- マイグレーションファイル

これらは後続タスク（CONV-04-02〜06）で実装します。

---

## 1. UUID主キー設計

### 設計方針

全テーブルでUUID v4（RFC 4122準拠）を主キーとして使用。

### 実装: uuidPrimaryKey()

```typescript
// packages/shared/src/db/schema/common.ts

import { text } from "drizzle-orm/sqlite-core";

/**
 * UUID主キーカラム
 * crypto.randomUUID() で生成したUUIDを格納
 */
export const uuidPrimaryKey = () =>
  text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID());
```

### 仕様

| 項目         | 値                                     |
| ------------ | -------------------------------------- |
| カラム名     | `id`（全テーブル統一）                 |
| SQLite型     | `TEXT`                                 |
| 制約         | `PRIMARY KEY NOT NULL`                 |
| デフォルト値 | `crypto.randomUUID()`                  |
| フォーマット | `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |

### 使用例

```typescript
export const exampleTable = sqliteTable("example", {
  id: uuidPrimaryKey(),
  name: text("name").notNull(),
  // ...
});
```

---

## 2. timestamps カラム設計

### 設計方針

全テーブルで`created_at`、`updated_at`を必須カラムとして提供。

### 実装: timestamps

```typescript
import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

/**
 * タイムスタンプカラム（created_at, updated_at）
 * ISO 8601形式: YYYY-MM-DD HH:MM:SS.SSS
 */
export const timestamps = {
  created_at: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%d %H:%M:%f', 'now'))`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%d %H:%M:%f', 'now'))`),
} as const;
```

### 仕様

| カラム       | SQLite型 | 制約       | デフォルト値                           | フォーマット |
| ------------ | -------- | ---------- | -------------------------------------- | ------------ |
| `created_at` | `TEXT`   | `NOT NULL` | `strftime('%Y-%m-%d %H:%M:%f', 'now')` | ISO 8601     |
| `updated_at` | `TEXT`   | `NOT NULL` | `strftime('%Y-%m-%d %H:%M:%f', 'now')` | ISO 8601     |

### フォーマット

```
YYYY-MM-DD HH:MM:SS.SSS
例: 2025-12-24 12:34:56.789
```

### updated_at自動更新

**Repository層で実装**（推奨）:

```typescript
async update(id: string, data: Partial<UpdateData>) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 23);

  return db.update(table)
    .set({
      ...data,
      updated_at: now,
    })
    .where(eq(table.id, id));
}
```

### 使用例

```typescript
export const exampleTable = sqliteTable("example", {
  id: uuidPrimaryKey(),
  name: text("name").notNull(),
  ...timestamps, // created_at, updated_at
});
```

---

## 3. metadata カラム設計

### 設計方針

動的属性・拡張可能フィールドにはJSONカラムを使用。

### 実装: metadata()

```typescript
import { text } from "drizzle-orm/sqlite-core";

/**
 * JSONメタデータカラム
 * デフォルト: 空JSON '{}'
 */
export const metadata = () =>
  text("metadata", { mode: "json" }).notNull().default("{}");
```

### 仕様

| 項目         | 値               |
| ------------ | ---------------- |
| カラム名     | `metadata`       |
| SQLite型     | `TEXT`           |
| Drizzle型    | `json` mode      |
| 制約         | `NOT NULL`       |
| デフォルト値 | `'{}'`（空JSON） |

### Zodスキーマパターン

```typescript
import { z } from "zod";

// 基本パターン: 任意のJSONオブジェクト
const metadataSchema = z.record(z.unknown()).default({});

// 特定構造を持つメタデータ
const exampleMetadataSchema = z
  .object({
    tags: z.array(z.string()).default([]),
    labels: z.record(z.string()).default({}),
    custom: z.record(z.unknown()).default({}),
  })
  .default({
    tags: [],
    labels: {},
    custom: {},
  });

type ExampleMetadata = z.infer<typeof exampleMetadataSchema>;
```

### 使用例

```typescript
export const exampleTable = sqliteTable("example", {
  id: uuidPrimaryKey(),
  name: text("name").notNull(),
  metadata: metadata(), // JSON metadata
  ...timestamps,
});
```

---

## 4. softDelete カラム設計

### 設計方針

論理削除（Soft Delete）を標準パターンとする。

### 実装: softDelete()

```typescript
import { text } from "drizzle-orm/sqlite-core";

/**
 * ソフトデリートカラム
 * NULL: 未削除、ISO 8601文字列: 削除日時
 */
export const softDelete = () => text("deleted_at"); // NULL許容
```

### 仕様

| 項目         | 値                             |
| ------------ | ------------------------------ |
| カラム名     | `deleted_at`                   |
| SQLite型     | `TEXT`                         |
| 制約         | NULL許容                       |
| デフォルト値 | `NULL`                         |
| フォーマット | ISO 8601（`created_at`と同じ） |

### 状態定義

| 値                        | 意味     | 状態         |
| ------------------------- | -------- | ------------ |
| `NULL`                    | 未削除   | アクティブ   |
| `YYYY-MM-DD HH:MM:SS.SSS` | 削除済み | 論理削除済み |

### Repository層パターン

```typescript
// 未削除レコードのみ取得
async findAll() {
  return db.select()
    .from(table)
    .where(isNull(table.deleted_at));
}

// 論理削除の実行
async softDelete(id: string) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 23);

  return db.update(table)
    .set({
      deleted_at: now,
      updated_at: now,
    })
    .where(eq(table.id, id));
}

// 復元（Undelete）
async restore(id: string) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 23);

  return db.update(table)
    .set({
      deleted_at: null,
      updated_at: now,
    })
    .where(eq(table.id, id));
}
```

### 使用例

```typescript
export const exampleTable = sqliteTable("example", {
  id: uuidPrimaryKey(),
  name: text("name").notNull(),
  deleted_at: softDelete(), // ソフトデリート
  ...timestamps,
});
```

---

## 5. 型定義設計

### 基本型定義パターン

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// テーブル定義
export const exampleTable = sqliteTable("example", {
  id: uuidPrimaryKey(),
  name: text("name").notNull(),
  metadata: metadata(),
  deleted_at: softDelete(),
  ...timestamps,
});

// SELECT型（DB取得時の型）
export type Example = InferSelectModel<typeof exampleTable>;

// INSERT型（DB挿入時の型）
export type NewExample = InferInsertModel<typeof exampleTable>;
```

### 共通ベース型

```typescript
// packages/shared/src/db/schema/types.ts

/**
 * 共通カラムを含むベース型
 */
export type BaseModel = {
  id: string;
  created_at: string;
  updated_at: string;
};

/**
 * ソフトデリート対応ベース型
 */
export type SoftDeletableModel = BaseModel & {
  deleted_at: string | null;
};

/**
 * メタデータ対応ベース型
 */
export type MetadataModel<T = unknown> = BaseModel & {
  metadata: T;
};

/**
 * 全機能対応ベース型
 */
export type FullBaseModel<T = unknown> = SoftDeletableModel & MetadataModel<T>;
```

### 型ガード関数

```typescript
// packages/shared/src/db/schema/guards.ts

import { SoftDeletableModel } from "./types";

/**
 * 削除済みレコードの型ガード
 */
export function isDeleted<T extends SoftDeletableModel>(
  record: T,
): record is T & { deleted_at: string } {
  return record.deleted_at !== null;
}

/**
 * アクティブレコードの型ガード
 */
export function isActive<T extends SoftDeletableModel>(
  record: T,
): record is T & { deleted_at: null } {
  return record.deleted_at === null;
}

/**
 * レコード配列からアクティブのみをフィルタ
 */
export function filterActive<T extends SoftDeletableModel>(
  records: T[],
): Array<T & { deleted_at: null }> {
  return records.filter(isActive);
}
```

---

## 6. ファイル構成

### ディレクトリツリー

```
packages/shared/src/db/schema/
├── index.ts          # バレルエクスポート
├── common.ts         # 共通カラム定義（本タスクで実装）
├── types.ts          # 共通型定義（本タスクで実装）
└── guards.ts         # 型ガード関数（本タスクで実装）
```

### 各ファイルの責務

| ファイル    | 責務                       | 主要エクスポート                                 |
| ----------- | -------------------------- | ------------------------------------------------ |
| `common.ts` | 共通カラム定義ヘルパー関数 | uuidPrimaryKey, timestamps, metadata, softDelete |
| `types.ts`  | 共通型定義                 | BaseModel, SoftDeletableModel, MetadataModel     |
| `guards.ts` | 型ガード関数               | isDeleted, isActive, filterActive                |
| `index.ts`  | バレルエクスポート         | 全公開API                                        |

---

## 7. 実装チェックリスト

### Phase 4（実装フェーズ）で作成するファイル

- [ ] `packages/shared/src/db/schema/common.ts`
  - [ ] uuidPrimaryKey() 実装
  - [ ] timestamps 実装
  - [ ] metadata() 実装
  - [ ] softDelete() 実装

- [ ] `packages/shared/src/db/schema/types.ts`
  - [ ] BaseModel 型定義
  - [ ] SoftDeletableModel 型定義
  - [ ] MetadataModel 型定義
  - [ ] FullBaseModel 型定義

- [ ] `packages/shared/src/db/schema/guards.ts`
  - [ ] isDeleted() 実装
  - [ ] isActive() 実装
  - [ ] filterActive() 実装

- [ ] `packages/shared/src/db/schema/index.ts`
  - [ ] バレルエクスポート実装

---

## 8. 後続タスクでの使用例

### CONV-04-02: files/conversions テーブル（例）

```typescript
// packages/shared/src/db/schema/files.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { uuidPrimaryKey, timestamps, metadata, softDelete } from "./common";

export const files = sqliteTable("files", {
  id: uuidPrimaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  mime_type: text("mime_type").notNull(),
  metadata: metadata(),
  deleted_at: softDelete(),
  ...timestamps,
});
```

---

## 完了条件

- [ ] 共通カラム定義ヘルパー関数が実装されている
- [ ] 共通型定義が実装されている
- [ ] 型ガード関数が実装されている
- [ ] 全ファイルがTypeScript strict mode準拠
- [ ] 型安全性が確保されている
- [ ] バレルエクスポートが実装されている

---

## 参照

- [アーキテクチャ設計書](./conv-04-01-architecture.md)
- [要件定義書](./conv-04-01-requirements.md)
- [タスク仕様書](./task-conv-04-01-drizzle-setup-spec.md)
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
