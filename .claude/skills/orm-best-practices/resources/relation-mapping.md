# リレーション設定とマッピング

## Drizzle ORMのリレーション

### リレーション定義

```typescript
import { relations } from "drizzle-orm";
import { workflows, workflowSteps, users } from "./tables";

// Workflowのリレーション
export const workflowRelations = relations(workflows, ({ one, many }) => ({
  // 多対一: Workflow -> User
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  // 一対多: Workflow -> WorkflowSteps
  steps: many(workflowSteps),
}));

// WorkflowStepのリレーション
export const workflowStepRelations = relations(workflowSteps, ({ one }) => ({
  // 多対一: Step -> Workflow
  workflow: one(workflows, {
    fields: [workflowSteps.workflowId],
    references: [workflows.id],
  }),
}));

// Userのリレーション
export const userRelations = relations(users, ({ many }) => ({
  // 一対多: User -> Workflows
  workflows: many(workflows),
}));
```

### リレーションの種類

| 種類 | 定義                                 | 説明           |
| ---- | ------------------------------------ | -------------- |
| one  | `one(table, { fields, references })` | 多対一、一対一 |
| many | `many(table)`                        | 一対多         |

## リレーションクエリ

### 基本的なwith句

```typescript
// 関連データを含めて取得
const workflowsWithSteps = await db.query.workflows.findMany({
  with: {
    steps: true, // すべてのステップを含める
  },
});

// 結果の型
// Array<{
//   id: string
//   name: string
//   ...
//   steps: Array<{ id: string, workflowId: string, ... }>
// }>
```

### ネストしたリレーション

```typescript
const workflowsWithDetails = await db.query.workflows.findMany({
  with: {
    steps: {
      with: {
        actions: true, // ステップのアクションも取得
      },
    },
    user: true,
  },
});
```

### カラム選択

```typescript
const workflowSummaries = await db.query.workflows.findMany({
  columns: {
    id: true,
    name: true,
    status: true,
    // createdAt, updatedAtは除外
  },
  with: {
    user: {
      columns: {
        id: true,
        name: true,
        // emailなど他のカラムは除外
      },
    },
  },
});
```

### フィルタリング

```typescript
// 親テーブルのフィルタリング
const activeWorkflows = await db.query.workflows.findMany({
  where: eq(workflows.status, "ACTIVE"),
  with: {
    steps: true,
  },
});

// 関連テーブルのフィルタリング
const workflowsWithActiveSteps = await db.query.workflows.findMany({
  with: {
    steps: {
      where: eq(workflowSteps.status, "ACTIVE"),
    },
  },
});
```

### ソートと制限

```typescript
const recentWorkflows = await db.query.workflows.findMany({
  orderBy: [desc(workflows.createdAt)],
  limit: 10,
  with: {
    steps: {
      orderBy: [asc(workflowSteps.stepNumber)],
      limit: 5, // 最初の5ステップのみ
    },
  },
});
```

## エンティティマッピング

### DBレコードからドメインエンティティへ

```typescript
// DBレコード型（Drizzle推論）
type WorkflowRecord = InferSelectModel<typeof workflows>;
type WorkflowStepRecord = InferSelectModel<typeof workflowSteps>;

// ドメインエンティティ
interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStep {
  id: string;
  stepNumber: number;
  name: string;
  config: StepConfig;
}

// マッピング関数
function toWorkflowEntity(
  record: WorkflowRecord & { steps?: WorkflowStepRecord[] },
): Workflow {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status as WorkflowStatus,
    steps: (record.steps ?? []).map(toWorkflowStepEntity),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toWorkflowStepEntity(record: WorkflowStepRecord): WorkflowStep {
  return {
    id: record.id,
    stepNumber: record.stepNumber,
    name: record.name,
    config: record.config as StepConfig,
  };
}
```

### ドメインエンティティからDBレコードへ

```typescript
// 新規作成用
type NewWorkflowRecord = InferInsertModel<typeof workflows>;

function toNewWorkflowRecord(
  entity: Omit<Workflow, "id" | "createdAt" | "updatedAt">,
): NewWorkflowRecord {
  return {
    name: entity.name,
    description: entity.description,
    status: entity.status,
    // id, createdAt, updatedAtはDB側で設定
  };
}

// 更新用
type WorkflowUpdate = Partial<
  Pick<Workflow, "name" | "description" | "status">
>;

function toWorkflowUpdateRecord(
  update: WorkflowUpdate,
): Partial<WorkflowRecord> {
  const record: Partial<WorkflowRecord> = {};

  if (update.name !== undefined) record.name = update.name;
  if (update.description !== undefined) record.description = update.description;
  if (update.status !== undefined) record.status = update.status;

  record.updatedAt = new Date();

  return record;
}
```

## マッピングパターン

### 名前変換パターン

```typescript
// スネークケース（DB）→ キャメルケース（TS）
function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// キャメルケース（TS）→ スネークケース（DB）
function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
    result[snakeKey] = value;
  }
  return result;
}
```

### JSONマッピング

```typescript
// 型付きJSONの変換（SQLiteではtext({ mode: 'json' })を使用）
interface StepConfig {
  retryCount: number;
  timeout: number;
  inputs: Record<string, unknown>;
}

function parseStepConfig(json: unknown): StepConfig {
  if (!json || typeof json !== "object") {
    return { retryCount: 0, timeout: 30000, inputs: {} };
  }

  const obj = json as Record<string, unknown>;
  return {
    retryCount: typeof obj.retryCount === "number" ? obj.retryCount : 0,
    timeout: typeof obj.timeout === "number" ? obj.timeout : 30000,
    inputs:
      typeof obj.inputs === "object"
        ? (obj.inputs as Record<string, unknown>)
        : {},
  };
}

function serializeStepConfig(config: StepConfig): Record<string, unknown> {
  return {
    retryCount: config.retryCount,
    timeout: config.timeout,
    inputs: config.inputs,
  };
}
```

### Nullableハンドリング

```typescript
// null変換パターン
function mapNullable<T, U>(
  value: T | null | undefined,
  mapper: (v: T) => U,
): U | null {
  return value != null ? mapper(value) : null;
}

// 使用例
function toEntity(record: WorkflowRecord): Workflow {
  return {
    id: record.id,
    name: record.name,
    description: record.description, // null許容
    completedAt: mapNullable(record.completedAt, (d) => new Date(d)),
    // ...
  };
}
```

## リレーション読み込み戦略

### Eager Loading（一括読み込み）

```typescript
// 常に関連データを取得
async function getWorkflowWithAllRelations(
  id: string,
): Promise<Workflow | null> {
  const result = await db.query.workflows.findFirst({
    where: eq(workflows.id, id),
    with: {
      steps: {
        orderBy: [asc(workflowSteps.stepNumber)],
      },
      user: true,
    },
  });

  return result ? toWorkflowEntity(result) : null;
}
```

### Lazy Loading風パターン

```typescript
// 必要時に関連データを取得
class WorkflowRepository {
  async findById(id: string): Promise<Workflow | null> {
    const result = await db.query.workflows.findFirst({
      where: eq(workflows.id, id),
    });
    return result ? toWorkflowEntity(result) : null;
  }

  async loadSteps(workflow: Workflow): Promise<WorkflowStep[]> {
    const steps = await db.query.workflowSteps.findMany({
      where: eq(workflowSteps.workflowId, workflow.id),
      orderBy: [asc(workflowSteps.stepNumber)],
    });
    return steps.map(toWorkflowStepEntity);
  }
}

// 使用
const workflow = await repo.findById(id);
if (workflow && needSteps) {
  workflow.steps = await repo.loadSteps(workflow);
}
```

### バッチ読み込み

```typescript
// 複数ワークフローのステップを一括取得
async function loadStepsForWorkflows(workflows: Workflow[]): Promise<void> {
  if (workflows.length === 0) return;

  const workflowIds = workflows.map((w) => w.id);

  const allSteps = await db.query.workflowSteps.findMany({
    where: inArray(workflowSteps.workflowId, workflowIds),
    orderBy: [asc(workflowSteps.stepNumber)],
  });

  // ワークフローIDでグループ化
  const stepsByWorkflow = new Map<string, WorkflowStep[]>();
  for (const step of allSteps) {
    const steps = stepsByWorkflow.get(step.workflowId) ?? [];
    steps.push(toWorkflowStepEntity(step));
    stepsByWorkflow.set(step.workflowId, steps);
  }

  // 各ワークフローにステップを設定
  for (const workflow of workflows) {
    workflow.steps = stepsByWorkflow.get(workflow.id) ?? [];
  }
}
```

## 多対多リレーション

### 中間テーブル

```typescript
// スキーマ
export const workflows = sqliteTable('workflows', { ... })
export const tags = sqliteTable('tags', { ... })
export const workflowTags = sqliteTable('workflow_tags', {
  workflowId: integer('workflow_id').notNull().references(() => workflows.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.workflowId, table.tagId] }),
}))

// リレーション
export const workflowTagRelations = relations(workflowTags, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowTags.workflowId],
    references: [workflows.id],
  }),
  tag: one(tags, {
    fields: [workflowTags.tagId],
    references: [tags.id],
  }),
}))
```

### 多対多のクエリ

```typescript
// ワークフローとタグを取得
const workflowsWithTags = await db.query.workflows.findMany({
  with: {
    workflowTags: {
      with: {
        tag: true,
      },
    },
  },
});

// フラット化
const mapped = workflowsWithTags.map((w) => ({
  ...w,
  tags: w.workflowTags.map((wt) => wt.tag),
}));
```

## チェックリスト

### リレーション設計時

- [ ] すべてのリレーションが定義されているか？
- [ ] 外部キーと一致しているか？
- [ ] 循環参照がないか？

### マッピング実装時

- [ ] 双方向変換が一貫しているか？
- [ ] null処理が適切か？
- [ ] JSON型の変換があるか？

### パフォーマンス

- [ ] 必要なリレーションのみ読み込んでいるか？
- [ ] N+1問題を避けているか？
- [ ] バッチ読み込みを活用しているか？
