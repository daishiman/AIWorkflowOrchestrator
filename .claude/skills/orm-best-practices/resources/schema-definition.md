# スキーマ定義パターン

## Drizzle ORMスキーマの基本

### テーブル定義

```typescript
import { sqliteTable, text, integer, sql } from "drizzle-orm/sqlite-core";

// 基本的なテーブル定義
export const workflows = sqliteTable("workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("DRAFT"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
```

## カラム型の選択

### 文字列型

```typescript
// SQLiteでは文字列は全てtext型
text("name").notNull();
text("description"); // nullable

// 列挙型（text型で制約チェック）
// SQLiteにはネイティブenumがないため、textとCHECK制約を使用
status: text("status", {
  enum: ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"],
})
  .notNull()
  .default("DRAFT");
```

### 数値型

```typescript
// 整数（SQLiteのINTEGER）
integer("count").notNull().default(0);
integer("priority").notNull();

// 大きな整数（bigintモード）
integer("large_count", { mode: "number" });

// 小数（SQLiteのREAL）
real("rating");
real("price");

// 金額は整数（セント単位）で保存することを推奨
integer("amount_cents").notNull(); // $12.34 → 1234
```

### 日時型

```typescript
// タイムスタンプ（Unix時間: 整数秒）
integer("created_at", { mode: "timestamp" })
  .notNull()
  .default(sql`(unixepoch())`);

// タイムスタンプ（Unix時間: ミリ秒）
integer("created_at", { mode: "timestamp_ms" }).notNull();

// ISO 8601文字列として保存
text("created_at")
  .notNull()
  .default(sql`(datetime('now'))`);
```

### JSON型

```typescript
// JSON（text型として保存、{ mode: 'json' }で自動パース）
text("metadata", { mode: "json" });

// 型付きJSON
interface WorkflowConfig {
  retryCount: number;
  timeout: number;
  notifications: boolean;
}
text("config", { mode: "json" }).$type<WorkflowConfig>();
```

### その他の型

```typescript
// 主キー（自動インクリメント整数）
id: integer("id").primaryKey({ autoIncrement: true });

// Boolean（SQLiteでは0/1の整数）
integer("is_active", { mode: "boolean" }).notNull().default(true);

// Blob（バイナリデータ）
blob("file_data", { mode: "buffer" });
```

## 制約の定義

### 主キー

```typescript
// 単一カラム主キー（自動インクリメント）
id: integer("id").primaryKey({ autoIncrement: true });

// 複合主キー
export const workflowSteps = sqliteTable(
  "workflow_steps",
  {
    workflowId: integer("workflow_id").notNull(),
    stepNumber: integer("step_number").notNull(),
    // ...
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workflowId, table.stepNumber] }),
  }),
);
```

### 外部キー

```typescript
export const workflowSteps = sqliteTable("workflow_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workflowId: integer("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  // ...
});
```

### 一意制約

```typescript
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(), // 単一カラム
    // ...
  },
  (table) => ({
    // 複合一意制約
    uniqueOrgEmail: unique("unique_org_email").on(
      table.organizationId,
      table.email,
    ),
  }),
);
```

### チェック制約

```typescript
import { check, sql } from "drizzle-orm";

export const accounts = sqliteTable(
  "accounts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    balance: integer("balance_cents").notNull().default(0), // セント単位
  },
  (table) => ({
    balancePositive: check(
      "balance_positive",
      sql`${table.balance_cents} >= 0`,
    ),
  }),
);
```

## インデックス定義

### 基本インデックス

```typescript
import { index } from "drizzle-orm/sqlite-core";

export const workflows = sqliteTable(
  "workflows",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: text("status").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    statusIdx: index("workflows_status_idx").on(table.status),
    userIdIdx: index("workflows_user_id_idx").on(table.userId),
  }),
);
```

### 複合インデックス

```typescript
export const workflows = sqliteTable(
  "workflows",
  {
    // ...columns
  },
  (table) => ({
    // よく一緒に検索されるカラム
    userStatusIdx: index("workflows_user_status_idx").on(
      table.userId,
      table.status,
    ),
  }),
);
```

### 部分インデックス

```typescript
export const workflows = sqliteTable(
  "workflows",
  {
    // ...columns
  },
  (table) => ({
    // アクティブなワークフローのみインデックス
    activeIdx: index("workflows_active_idx")
      .on(table.status)
      .where(sql`${table.status} = 'ACTIVE'`),
  }),
);
```

### JSON検索用インデックス

```typescript
// SQLiteではJSON関数を使用したインデックス
export const workflows = sqliteTable(
  "workflows",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    metadata: text("metadata", { mode: "json" }),
  },
  (table) => ({
    // JSON内の特定フィールドにインデックス
    metadataTypeIdx: index("workflows_metadata_type_idx").on(
      sql`json_extract(${table.metadata}, '$.type')`,
    ),
  }),
);
```

## 型推論の活用

### テーブルからの型推論

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// SELECT結果の型
export type Workflow = InferSelectModel<typeof workflows>;
// → { id: number, name: string, description: string | null, ... }

// INSERT用の型
export type NewWorkflow = InferInsertModel<typeof workflows>;
// → { id?: number, name: string, description?: string | null, ... }
```

### カスタム型の定義

```typescript
// 部分的な型
export type WorkflowSummary = Pick<Workflow, "id" | "name" | "status">;

// 更新用の型
export type WorkflowUpdate = Partial<Omit<Workflow, "id" | "createdAt">>;

// 関連を含む型
export type WorkflowWithSteps = Workflow & {
  steps: WorkflowStep[];
};
```

## 共通カラムパターン

### タイムスタンプカラム

```typescript
// 再利用可能なタイムスタンプカラム
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

export const workflows = sqliteTable("workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ...timestamps,
});
```

### ソフトデリートパターン

```typescript
const softDelete = {
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
};

export const workflows = sqliteTable("workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ...timestamps,
  ...softDelete,
});
```

### 監査カラム

```typescript
const audit = {
  createdBy: integer("created_by").notNull(),
  updatedBy: integer("updated_by"),
  ...timestamps,
};
```

## ベストプラクティス

### すべきこと

1. **明示的なnullability**:

   ```typescript
   // ✅ 明示的
   name: text("name").notNull();
   description: text("description"); // nullableは暗黙
   ```

2. **デフォルト値の設定**:

   ```typescript
   // ✅ 適切なデフォルト
   status: text("status").notNull().default("DRAFT");
   createdAt: integer("created_at", { mode: "timestamp" })
     .notNull()
     .default(sql`(unixepoch())`);
   ```

3. **型付きJSON**:
   ```typescript
   // ✅ 型情報を付与
   config: text("config", { mode: "json" }).$type<ConfigType>();
   ```

### 避けるべきこと

1. **text型の濫用**:

   ```typescript
   // ❌ すべてtext
   status: text("status");

   // ✅ enumオプションを使用
   status: text("status", { enum: ["DRAFT", "ACTIVE"] }).notNull();
   ```

2. **インデックスの過剰設定**:

   ```typescript
   // ❌ すべてのカラムにインデックス
   // ✅ クエリパターンに基づいて必要なものだけ
   ```

3. **不要なnullable**:

   ```typescript
   // ❌ デフォルトでnullable
   name: text("name");

   // ✅ 必要な場合のみnullable
   name: text("name").notNull();
   ```

## チェックリスト

### テーブル定義時

- [ ] すべてのカラムに適切な型があるか？
- [ ] nullabilityは正しく設定されているか？
- [ ] 主キーは適切か？（自動インクリメント整数推奨）
- [ ] 外部キーの参照アクションは正しいか？
- [ ] 必要なインデックスがあるか？

### 型安全性

- [ ] InferSelectModel/InferInsertModelを使用しているか？
- [ ] JSONカラムに型情報があるか？
- [ ] カスタム型が必要な箇所で定義されているか？
