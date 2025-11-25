# スキーマ定義パターン

## Drizzle ORMスキーマの基本

### テーブル定義

```typescript
import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from 'drizzle-orm/pg-core'

// 基本的なテーブル定義
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

## カラム型の選択

### 文字列型

```typescript
// 固定長が分かっている場合
char('code', { length: 3 }).notNull()  // 国コードなど

// 可変長文字列
varchar('name', { length: 255 }).notNull()  // 長さ制限あり
text('description')  // 長さ制限なし

// 列挙型（PostgreSQL enum）
export const statusEnum = pgEnum('workflow_status', ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
// テーブルで使用
status: statusEnum('status').notNull().default('DRAFT')
```

### 数値型

```typescript
// 整数
integer('count').notNull().default(0)
smallint('priority').notNull()
bigint('large_count', { mode: 'number' })  // modeでTypeScript型を指定

// 小数
real('rating')  // 単精度
doublePrecision('price')  // 倍精度
numeric('amount', { precision: 10, scale: 2 })  // 金額など正確な値
```

### 日時型

```typescript
// タイムスタンプ
timestamp('created_at').notNull().defaultNow()  // タイムゾーンなし
timestamp('created_at', { withTimezone: true }).notNull().defaultNow()  // タイムゾーンあり

// 日付のみ
date('birth_date')

// 時刻のみ
time('start_time')

// 間隔
interval('duration')
```

### JSON型

```typescript
// JSON（検証なし）
json('metadata')

// JSONB（推奨：インデックス可能）
jsonb('config')

// 型付きJSONB
interface WorkflowConfig {
  retryCount: number
  timeout: number
  notifications: boolean
}
jsonb('config').$type<WorkflowConfig>()
```

### その他の型

```typescript
// UUID
uuid('id').primaryKey().defaultRandom()

// Boolean
boolean('is_active').notNull().default(true)

// 配列
text('tags').array()  // text[]
integer('scores').array()  // integer[]
```

## 制約の定義

### 主キー

```typescript
// 単一カラム主キー
id: uuid('id').primaryKey().defaultRandom()

// 複合主キー
export const workflowSteps = pgTable('workflow_steps', {
  workflowId: uuid('workflow_id').notNull(),
  stepNumber: integer('step_number').notNull(),
  // ...
}, (table) => ({
  pk: primaryKey({ columns: [table.workflowId, table.stepNumber] }),
}))
```

### 外部キー

```typescript
export const workflowSteps = pgTable('workflow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id, { onDelete: 'cascade' }),
  // ...
})
```

### 一意制約

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),  // 単一カラム
  // ...
}, (table) => ({
  // 複合一意制約
  uniqueOrgEmail: unique('unique_org_email').on(table.organizationId, table.email),
}))
```

### チェック制約

```typescript
import { check, sql } from 'drizzle-orm'

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  balance: numeric('balance', { precision: 10, scale: 2 }).notNull().default('0'),
}, (table) => ({
  balancePositive: check('balance_positive', sql`${table.balance} >= 0`),
}))
```

## インデックス定義

### 基本インデックス

```typescript
import { index } from 'drizzle-orm/pg-core'

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: text('status').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('workflows_status_idx').on(table.status),
  userIdIdx: index('workflows_user_id_idx').on(table.userId),
}))
```

### 複合インデックス

```typescript
export const workflows = pgTable('workflows', {
  // ...columns
}, (table) => ({
  // よく一緒に検索されるカラム
  userStatusIdx: index('workflows_user_status_idx').on(table.userId, table.status),
}))
```

### 部分インデックス

```typescript
export const workflows = pgTable('workflows', {
  // ...columns
}, (table) => ({
  // アクティブなワークフローのみインデックス
  activeIdx: index('workflows_active_idx')
    .on(table.status)
    .where(sql`${table.status} = 'ACTIVE'`),
}))
```

### GINインデックス（JSONB用）

```typescript
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  metadata: jsonb('metadata'),
}, (table) => ({
  metadataIdx: index('workflows_metadata_idx')
    .on(table.metadata)
    .using('gin'),
}))
```

## 型推論の活用

### テーブルからの型推論

```typescript
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

// SELECT結果の型
export type Workflow = InferSelectModel<typeof workflows>
// → { id: string, name: string, description: string | null, ... }

// INSERT用の型
export type NewWorkflow = InferInsertModel<typeof workflows>
// → { id?: string, name: string, description?: string | null, ... }
```

### カスタム型の定義

```typescript
// 部分的な型
export type WorkflowSummary = Pick<Workflow, 'id' | 'name' | 'status'>

// 更新用の型
export type WorkflowUpdate = Partial<Omit<Workflow, 'id' | 'createdAt'>>

// 関連を含む型
export type WorkflowWithSteps = Workflow & {
  steps: WorkflowStep[]
}
```

## 共通カラムパターン

### タイムスタンプカラム

```typescript
// 再利用可能なタイムスタンプカラム
const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ...timestamps,
})
```

### ソフトデリートパターン

```typescript
const softDelete = {
  deletedAt: timestamp('deleted_at'),
}

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ...timestamps,
  ...softDelete,
})
```

### 監査カラム

```typescript
const audit = {
  createdBy: uuid('created_by').notNull(),
  updatedBy: uuid('updated_by'),
  ...timestamps,
}
```

## ベストプラクティス

### すべきこと

1. **明示的なnullability**:
   ```typescript
   // ✅ 明示的
   name: text('name').notNull()
   description: text('description')  // nullableは暗黙
   ```

2. **デフォルト値の設定**:
   ```typescript
   // ✅ 適切なデフォルト
   status: text('status').notNull().default('DRAFT')
   createdAt: timestamp('created_at').notNull().defaultNow()
   ```

3. **型付きJSONB**:
   ```typescript
   // ✅ 型情報を付与
   config: jsonb('config').$type<ConfigType>()
   ```

### 避けるべきこと

1. **text型の濫用**:
   ```typescript
   // ❌ すべてtext
   status: text('status')

   // ✅ enumを使用
   status: statusEnum('status').notNull()
   ```

2. **インデックスの過剰設定**:
   ```typescript
   // ❌ すべてのカラムにインデックス
   // ✅ クエリパターンに基づいて必要なものだけ
   ```

3. **不要なnullable**:
   ```typescript
   // ❌ デフォルトでnullable
   name: text('name')

   // ✅ 必要な場合のみnullable
   name: text('name').notNull()
   ```

## チェックリスト

### テーブル定義時

- [ ] すべてのカラムに適切な型があるか？
- [ ] nullabilityは正しく設定されているか？
- [ ] 主キーは適切か？（UUID推奨）
- [ ] 外部キーの参照アクションは正しいか？
- [ ] 必要なインデックスがあるか？

### 型安全性

- [ ] InferSelectModel/InferInsertModelを使用しているか？
- [ ] JSONBカラムに型情報があるか？
- [ ] カスタム型が必要な箇所で定義されているか？
