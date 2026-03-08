# [テーブル/機能名] データベース仕様

> データベーススキーマ・操作の仕様定義
> カテゴリ: データベース
> 読み込み条件: [テーブル/機能名] のDB設計・実装時

---

## メタ情報

| 項目             | 内容                             |
| ---------------- | -------------------------------- |
| バージョン       | 1.0.0                            |
| 最終更新         | YYYY-MM-DD                       |
| データベース     | SQLite / Turso                   |
| ORM              | Drizzle ORM                      |
| スキーマファイル | `packages/shared/src/db/schema/` |

---

## 1. テーブル設計

### 1.1 テーブル一覧

| テーブル名  | 用途               | 主キー |
| ----------- | ------------------ | ------ |
| entities    | メインエンティティ | id     |
| entity_logs | 操作ログ           | id     |
| entity_tags | タグ関連           | 複合   |

### 1.2 ER図

```
[entities] 1 ──── * [entity_logs]
    │
    │ * ──── *
    │
[tags] ←───── [entity_tags]
```

---

## 2. スキーマ定義

### 2.1 entities テーブル

```typescript
export const entities = sqliteTable("entities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status", {
    enum: ["pending", "active", "completed"],
  })
    .notNull()
    .default("pending"),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
```

| カラム    | 型        | NULL | デフォルト | 説明           |
| --------- | --------- | ---- | ---------- | -------------- |
| id        | TEXT      | NO   | -          | UUID (PK)      |
| name      | TEXT      | NO   | -          | エンティティ名 |
| status    | TEXT      | NO   | 'pending'  | ステータス     |
| metadata  | JSON      | YES  | -          | メタデータ     |
| createdAt | TIMESTAMP | NO   | now        | 作成日時       |
| updatedAt | TIMESTAMP | NO   | now        | 更新日時       |

### 2.2 インデックス

```typescript
export const entitiesIndexes = {
  statusIdx: index("entities_status_idx").on(entities.status),
  createdAtIdx: index("entities_created_at_idx").on(entities.createdAt),
};
```

| インデックス名          | カラム    | 用途           |
| ----------------------- | --------- | -------------- |
| entities_status_idx     | status    | ステータス検索 |
| entities_created_at_idx | createdAt | 日時範囲検索   |

---

## 3. リレーション

### 3.1 リレーション定義

```typescript
export const entitiesRelations = relations(entities, ({ many }) => ({
  logs: many(entityLogs),
  tags: many(entityTags),
}));

export const entityLogsRelations = relations(entityLogs, ({ one }) => ({
  entity: one(entities, {
    fields: [entityLogs.entityId],
    references: [entities.id],
  }),
}));
```

### 3.2 外部キー制約

| テーブル    | カラム    | 参照先      | ON DELETE |
| ----------- | --------- | ----------- | --------- |
| entity_logs | entity_id | entities.id | CASCADE   |
| entity_tags | entity_id | entities.id | CASCADE   |
| entity_tags | tag_id    | tags.id     | CASCADE   |

---

## 4. クエリパターン

### 4.1 基本CRUD

```typescript
// 取得
const entity = await db.query.entities.findFirst({
  where: eq(entities.id, id),
  with: { logs: true },
});

// 一覧（フィルター付き）
const list = await db.query.entities.findMany({
  where: and(eq(entities.status, "active"), gte(entities.createdAt, startDate)),
  orderBy: desc(entities.createdAt),
  limit: 20,
  offset: 0,
});

// 作成
const [created] = await db
  .insert(entities)
  .values({
    id: generateId(),
    name: input.name,
  })
  .returning();

// 更新
await db
  .update(entities)
  .set({ name: input.name, updatedAt: new Date() })
  .where(eq(entities.id, id));

// 削除
await db.delete(entities).where(eq(entities.id, id));
```

### 4.2 トランザクション

```typescript
await db.transaction(async (tx) => {
  const [entity] = await tx.insert(entities).values(data).returning();
  await tx.insert(entityLogs).values({
    entityId: entity.id,
    action: "create",
  });
});
```

---

## 5. マイグレーション

### 5.1 マイグレーション履歴

| バージョン | 日付       | 変更内容            |
| ---------- | ---------- | ------------------- |
| 0001       | YYYY-MM-DD | 初期スキーマ作成    |
| 0002       | YYYY-MM-DD | metadata カラム追加 |

### 5.2 マイグレーションコマンド

```bash
# マイグレーション生成
pnpm --filter @repo/shared drizzle-kit generate:sqlite

# マイグレーション適用
pnpm --filter @repo/shared drizzle-kit migrate
```

---

## 6. パフォーマンス考慮

### 6.1 インデックス戦略

| クエリパターン     | 必要インデックス |
| ------------------ | ---------------- |
| ステータスで検索   | status           |
| 日付範囲で検索     | createdAt        |
| 名前で部分一致検索 | name (FTS5推奨)  |

### 6.2 最適化ポイント

| 項目       | 対策                   |
| ---------- | ---------------------- |
| N+1問題    | with句でeager loading  |
| 大量データ | ページネーション必須   |
| JSON検索   | 専用カラムへの抽出検討 |

---

## 7. 実装ファイル

| 種別             | パス                                      |
| ---------------- | ----------------------------------------- |
| スキーマ         | `packages/shared/src/db/schema/entity.ts` |
| リレーション     | `packages/shared/src/db/relations.ts`     |
| リポジトリ       | `packages/shared/src/repositories/`       |
| マイグレーション | `packages/shared/drizzle/`                |

---

## 関連ドキュメント

| ドキュメント               | 説明              |
| -------------------------- | ----------------- |
| database-schema.md         | 全体スキーマ      |
| database-implementation.md | 実装パターン      |
| interfaces-xxx.md          | 型定義（DTO変換） |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
