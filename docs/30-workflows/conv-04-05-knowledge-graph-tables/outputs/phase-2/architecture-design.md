# アーキテクチャ設計: Knowledge Graph テーブル群

## 1. 概要

Knowledge Graphのデータ層を構成する6テーブル＋リレーション定義の設計。

---

## 2. テーブル関連図

```
                    ┌─────────────────┐
                    │     chunks      │
                    │   (既存テーブル)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              │              ▼
    ┌─────────────────┐      │    ┌─────────────────┐
    │  chunkEntities  │◄─────┼────│ relationEvidence│
    │  (中間テーブル)   │      │    │   (証拠テーブル)  │
    └────────┬────────┘      │    └────────┬────────┘
             │               │             │
             ▼               │             ▼
    ┌─────────────────┐      │    ┌─────────────────┐
    │    entities     │◄─────┴────│    relations    │
    │  (エンティティ)   │           │     (関係)      │
    └────────┬────────┘           └─────────────────┘
             │                           ▲ ▲
             │                           │ │
             ▼                           │ │
    ┌─────────────────┐                  │ │
    │entityCommunities│                  │ │
    │  (中間テーブル)   │                  │ │
    └────────┬────────┘                  │ │
             │                           │ │
             ▼                           │ │
    ┌─────────────────┐                  │ │
    │  communities    │──────────────────┘ │
    │ (コミュニティ)    │    (parentId自己参照)
    └─────────────────┘
```

---

## 3. ファイル構成

```
packages/shared/src/db/schema/graph/
├── index.ts              # バレルエクスポート
├── entities.ts           # エンティティテーブル
├── relations.ts          # 関係テーブル (drizzle-ormのrelationsと名前衝突回避)
├── relation-evidence.ts  # 関係証拠テーブル
├── communities.ts        # コミュニティテーブル
├── entity-communities.ts # エンティティ-コミュニティ中間テーブル
├── chunk-entities.ts     # チャンク-エンティティ中間テーブル
├── graph-relations.ts    # Drizzleリレーション定義
└── __tests__/            # テストファイル
    ├── entities.test.ts
    ├── relations.test.ts
    ├── communities.test.ts
    ├── junction-tables.test.ts
    └── graph-relations.test.ts
```

---

## 4. 設計方針

### 4.1 命名規則

| 項目       | 規則                | 例                             |
| ---------- | ------------------- | ------------------------------ |
| テーブル名 | snake_case (複数形) | `entities`, `relations`        |
| カラム名   | snake_case          | `normalized_name`, `source_id` |
| JS変数名   | camelCase           | `normalizedName`, `sourceId`   |
| 型名       | PascalCase          | `Entity`, `NewEntity`          |
| ファイル名 | kebab-case          | `entity-communities.ts`        |

### 4.2 共通パターン

既存スキーマ（chunks.ts）に従い、以下のパターンを適用:

```typescript
// UUID主キー
id: text("id")
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID()),

// タイムスタンプ
createdAt: integer("created_at", { mode: "timestamp" })
  .notNull()
  .default(sql`(unixepoch())`),

updatedAt: integer("updated_at", { mode: "timestamp" })
  .notNull()
  .default(sql`(unixepoch())`),

// JSON型
metadata: text("metadata", { mode: "json" }).$type<MetadataType>(),

// 外部キー
sourceId: text("source_id")
  .notNull()
  .references(() => entities.id, { onDelete: "cascade" }),
```

### 4.3 テーブル分離

`relations` テーブル名がDrizzle ORMの `relations` 関数と衝突するため:

- テーブル変数: `graphRelations` （または `entityRelations`）
- ファイル名: `relations.ts`
- SQLテーブル名: `relations`

---

## 5. 依存関係

### 5.1 ファイル間依存

```
chunks.ts (既存)
    ↑
    │
relation-evidence.ts ──► relations.ts ──► entities.ts
    │                         │
    │                         ├──► communities.ts
    │                         │
chunk-entities.ts ───────────►├──► entity-communities.ts
                              │
graph-relations.ts ──► (すべてのテーブルを参照)
```

### 5.2 インポート順序

循環参照を避けるため、以下の順序でエクスポート:

1. `entities.ts`
2. `communities.ts`
3. `relations.ts` (entities依存)
4. `relation-evidence.ts` (relations, chunks依存)
5. `entity-communities.ts` (entities, communities依存)
6. `chunk-entities.ts` (chunks, entities依存)
7. `graph-relations.ts` (全テーブル依存)

---

## 6. 型定義

### 6.1 エンティティタイプ Enum

```typescript
export const entityTypes = [
  "person",
  "organization",
  "location",
  "date",
  "event",
  "technology",
  "concept",
  "product",
  "api",
  "function",
  "class",
  "document",
  "section",
  "other",
] as const;

export type EntityType = (typeof entityTypes)[number];
```

### 6.2 関係タイプ Enum

```typescript
export const relationTypes = [
  "related_to",
  "part_of",
  "has_part",
  "belongs_to",
  "preceded_by",
  "followed_by",
  "concurrent_with",
  "uses",
  "used_by",
  "implements",
  "extends",
  "depends_on",
  "calls",
  "imports",
  "parent_of",
  "child_of",
  "references",
  "referenced_by",
  "defines",
  "defined_by",
  "authored_by",
  "works_for",
  "collaborates_with",
] as const;

export type RelationType = (typeof relationTypes)[number];
```

---

## 7. 変更影響

### 7.1 既存ファイルへの変更

| ファイル                                 | 変更内容                          |
| ---------------------------------------- | --------------------------------- |
| `packages/shared/src/db/schema/index.ts` | graphモジュールのエクスポート追加 |

### 7.2 新規ファイル

8ファイル（テーブル定義7 + テスト5）
