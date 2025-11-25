# スキーマ定義テンプレート

## 基本情報

**エンティティ名**: {{EntityName}}
**テーブル名**: {{table_name}}
**作成日**: {{date}}
**担当者**: {{author}}

## エンティティ概要

### ビジネス目的

{{business_purpose}}

### 主要属性

| 属性 | 説明 | 必須 | 一意 |
|------|------|------|------|
| {{attr1}} | {{desc1}} | ✅/❌ | ✅/❌ |
| {{attr2}} | {{desc2}} | ✅/❌ | ✅/❌ |

## テーブル定義

### スキーマコード

```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

// テーブル定義
export const {{tableName}} = pgTable('{{table_name}}', {
  // 主キー
  id: uuid('id').primaryKey().defaultRandom(),

  // 基本属性
  {{column1}}: text('{{column1_name}}').notNull(),
  {{column2}}: text('{{column2_name}}'),

  // 外部キー
  {{foreignKey}}: uuid('{{foreign_key_name}}')
    .notNull()
    .references(() => {{relatedTable}}.id, { onDelete: 'cascade' }),

  // ステータス / 列挙型
  status: text('status').notNull().default('{{default_status}}'),

  // JSON設定
  config: jsonb('config').$type<{{ConfigType}}>(),

  // タイムスタンプ
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  // ソフトデリート（オプション）
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // インデックス
  {{indexName}}: index('{{index_name}}').on(table.{{indexColumn}}),

  // 複合インデックス
  {{compositeIndexName}}: index('{{composite_index_name}}')
    .on(table.{{column1}}, table.{{column2}}),

  // 部分インデックス（オプション）
  activeIdx: index('{{table_name}}_active_idx')
    .on(table.status)
    .where(sql`${table.deletedAt} IS NULL`),

  // 一意制約
  {{uniqueConstraint}}: unique('{{unique_name}}').on(table.{{uniqueColumn}}),
}))

// 型エクスポート
export type {{EntityName}} = InferSelectModel<typeof {{tableName}}>
export type New{{EntityName}} = InferInsertModel<typeof {{tableName}}>
```

### 列挙型（必要な場合）

```typescript
import { pgEnum } from 'drizzle-orm/pg-core'

export const {{enumName}} = pgEnum('{{enum_name}}', [
  '{{value1}}',
  '{{value2}}',
  '{{value3}}',
])

// テーブルでの使用
status: {{enumName}}('status').notNull().default('{{default_value}}'),
```

## リレーション定義

### リレーションコード

```typescript
import { relations } from 'drizzle-orm'

export const {{tableName}}Relations = relations({{tableName}}, ({ one, many }) => ({
  // 多対一リレーション
  {{parentRelation}}: one({{parentTable}}, {
    fields: [{{tableName}}.{{foreignKey}}],
    references: [{{parentTable}}.id],
  }),

  // 一対多リレーション
  {{childRelation}}: many({{childTable}}),
}))
```

### リレーション図

```
{{parentTable}} 1 ─────┬───── N {{tableName}}
                       │
                       └───── N {{childTable}}
```

## JSONB型定義

### 設定オブジェクト型

```typescript
// JSONBカラムの型定義
export interface {{ConfigType}} {
  {{configField1}}: {{type1}}
  {{configField2}}: {{type2}}
  {{configField3}}?: {{type3}}  // オプショナル
}

// デフォルト値
export const default{{ConfigType}}: {{ConfigType}} = {
  {{configField1}}: {{default1}},
  {{configField2}}: {{default2}},
}
```

## カスタム型

### 派生型

```typescript
// 更新用の型
export type {{EntityName}}Update = Partial<Omit<{{EntityName}}, 'id' | 'createdAt'>>

// サマリー型
export type {{EntityName}}Summary = Pick<{{EntityName}}, 'id' | 'name' | 'status'>

// リレーションを含む型
export type {{EntityName}}WithRelations = {{EntityName}} & {
  {{parentRelation}}: {{ParentType}}
  {{childRelation}}: {{ChildType}}[]
}
```

## マッピング関数

### エンティティ変換

```typescript
import type { {{EntityName}}, New{{EntityName}} } from '@/db/schema'

// ドメインエンティティ型
interface {{DomainEntityName}} {
  id: string
  {{domainField1}}: {{domainType1}}
  {{domainField2}}: {{domainType2}}
  config: {{ConfigType}}
  createdAt: Date
  updatedAt: Date
}

// DBレコード → ドメインエンティティ
export function to{{EntityName}}Entity(record: {{EntityName}}): {{DomainEntityName}} {
  return {
    id: record.id,
    {{domainField1}}: record.{{column1}},
    {{domainField2}}: record.{{column2}},
    config: record.config ?? default{{ConfigType}},
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

// ドメインエンティティ → DBレコード（新規作成用）
export function toNew{{EntityName}}Record(
  entity: Omit<{{DomainEntityName}}, 'id' | 'createdAt' | 'updatedAt'>
): New{{EntityName}} {
  return {
    {{column1}}: entity.{{domainField1}},
    {{column2}}: entity.{{domainField2}},
    config: entity.config,
  }
}

// ドメインエンティティ → DBレコード（更新用）
export function to{{EntityName}}UpdateRecord(
  update: Partial<{{DomainEntityName}}>
): {{EntityName}}Update {
  const record: {{EntityName}}Update = {}

  if (update.{{domainField1}} !== undefined) {
    record.{{column1}} = update.{{domainField1}}
  }
  if (update.{{domainField2}} !== undefined) {
    record.{{column2}} = update.{{domainField2}}
  }
  if (update.config !== undefined) {
    record.config = update.config
  }

  record.updatedAt = new Date()
  return record
}
```

## マイグレーション

### 初期マイグレーション

```sql
-- migration: create_{{table_name}}
-- created: {{date}}

CREATE TABLE IF NOT EXISTS "{{table_name}}" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "{{column1_name}}" text NOT NULL,
  "{{column2_name}}" text,
  "{{foreign_key_name}}" uuid NOT NULL REFERENCES "{{related_table}}"("id") ON DELETE CASCADE,
  "status" text NOT NULL DEFAULT '{{default_status}}',
  "config" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "deleted_at" timestamp
);

CREATE INDEX "{{index_name}}" ON "{{table_name}}" ("{{index_column}}");
CREATE INDEX "{{composite_index_name}}" ON "{{table_name}}" ("{{column1}}", "{{column2}}");
CREATE INDEX "{{table_name}}_active_idx" ON "{{table_name}}" ("status") WHERE "deleted_at" IS NULL;
```

## チェックリスト

### スキーマ定義

- [ ] 主キーはUUID型か？
- [ ] 必須カラムにnotNullがあるか？
- [ ] 外部キーにreferencesがあるか？
- [ ] onDeleteアクションは適切か？
- [ ] created_at/updated_atがあるか？

### インデックス

- [ ] 検索に使用するカラムにインデックスがあるか？
- [ ] 複合検索用の複合インデックスがあるか？
- [ ] ソフトデリート用の部分インデックスがあるか？

### 型定義

- [ ] InferSelectModel/InferInsertModelを使用しているか？
- [ ] JSONBカラムに型情報があるか？
- [ ] 派生型（Update, Summary）が定義されているか？

### リレーション

- [ ] すべての外部キーにリレーションがあるか？
- [ ] 親テーブルにmany定義があるか？
- [ ] 子テーブルにone定義があるか？

### マッピング

- [ ] toEntity関数があるか？
- [ ] toRecord関数があるか？
- [ ] null/undefined処理が適切か？

## 参考資料

- [スキーマ定義パターン](../resources/schema-definition.md)
- [リレーション設定](../resources/relation-mapping.md)
- [パフォーマンスパターン](../resources/performance-patterns.md)
