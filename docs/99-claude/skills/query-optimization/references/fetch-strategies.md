# フェッチ戦略ガイド

## フェッチ戦略の種類

### 1. Eager Loading（即時読み込み）

**定義**: 親エンティティ取得時に関連データも同時に取得

**特徴**:

- 関連データは常に取得される
- クエリ数は固定（通常1〜2回）
- 結果セットが大きくなる可能性

**適用場面**:

- 関連データを常に使用する場合
- 一覧表示で関連情報を表示する場合
- N+1問題を確実に回避したい場合

**実装例**:

```typescript
// JOINによるEager Loading
async findAllWithUser(): Promise<WorkflowWithUser[]> {
  return this.db
    .select({
      workflow: workflows,
      user: users,
    })
    .from(workflows)
    .leftJoin(users, eq(users.id, workflows.userId))
}
```

### 2. Lazy Loading（遅延読み込み）

**定義**: 関連データへのアクセス時に初めて取得

**特徴**:

- 必要になるまでクエリは実行されない
- アクセスパターンによってN+1問題が発生
- 初期取得は高速

**適用場面**:

- 関連データを使用しないことが多い場合
- 詳細画面でのみ関連データが必要な場合
- メモリ使用量を抑えたい場合

**注意点**:

- ループ内でアクセスするとN+1問題発生
- トランザクション外でアクセスするとエラーの可能性
- デバッグが困難になることがある

### 3. 明示的フェッチ（Explicit Loading）

**定義**: 必要な関連データを明示的に指定して取得

**特徴**:

- ユースケースごとに最適なデータを取得
- クエリの内容が予測可能
- N+1問題を回避しやすい

**適用場面**:

- ユースケースによって必要なデータが異なる場合
- パフォーマンスを細かく制御したい場合
- 複雑な関連がある場合

**実装例**:

```typescript
// ユースケースごとのメソッド
interface IWorkflowRepository {
  // 基本取得（関連なし）
  findById(id: string): Promise<Workflow | null>;

  // ステップ付き取得
  findByIdWithSteps(id: string): Promise<WorkflowWithSteps | null>;

  // ユーザー付き取得
  findByIdWithUser(id: string): Promise<WorkflowWithUser | null>;

  // 全関連付き取得
  findByIdWithAllRelations(id: string): Promise<WorkflowFull | null>;
}
```

## 戦略選択ガイド

### 選択フローチャート

```
関連データを使用する？
    │
    ├─ 常に使用 → Eager Loading
    │
    ├─ 時々使用 → ユースケースで分かれる？
    │   ├─ Yes → 明示的フェッチ
    │   └─ No → Lazy Loading（N+1注意）
    │
    └─ まれに使用 → Lazy Loading
```

### 比較表

| 戦略   | クエリ数 | メモリ | N+1リスク | 制御性 |
| ------ | -------- | ------ | --------- | ------ |
| Eager  | 1〜2     | 高     | 低        | 低     |
| Lazy   | 1〜N+1   | 低     | 高        | 低     |
| 明示的 | 1〜2     | 中     | 低        | 高     |

## SELECT句の最適化

### 必要なカラムのみ取得

```typescript
// ❌ すべてのカラムを取得
const workflows = await db.select().from(workflows);

// ✅ 必要なカラムのみ取得
const workflows = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    status: workflows.status,
  })
  .from(workflows);
```

### 大きなカラムの除外

```typescript
// ❌ 不要な大きなカラム（JSON、TEXT）も取得
const workflows = await db.select().from(workflows);

// ✅ 一覧表示では大きなカラムを除外
const workflows = await db
  .select({
    id: workflows.id,
    name: workflows.name,
    status: workflows.status,
    createdAt: workflows.createdAt,
    // input_payload、output_payload は除外
  })
  .from(workflows);
```

## パフォーマンス考慮事項

### 結果セットサイズ

**JOINの場合**:

- 1対多のJOINは結果行が増加
- 多対多のJOINは指数的に増加する可能性

**対策**:

1. 必要なカラムのみSELECT
2. ページネーションの適用
3. バッチフェッチの使用

### メモリ使用量

**Eager Loadingの注意点**:

- 大量データでは全件がメモリに乗る
- ストリーミング処理を検討

**対策**:

1. ページネーションで分割取得
2. カーソルベースのページネーション
3. バッチ処理

### ネットワークラウンドトリップ

**考慮事項**:

- 各クエリにネットワーク遅延が発生
- リモートDBでは特に影響大

**対策**:

1. クエリ数を最小化
2. 必要なデータを一括取得
3. コネクションプーリングの活用

## ユースケース別パターン

### 一覧画面

```typescript
// 概要情報のみ取得（関連は不要または最小限）
async findAllForList(): Promise<WorkflowSummary[]> {
  return this.db
    .select({
      id: workflows.id,
      name: workflows.name,
      status: workflows.status,
      createdAt: workflows.createdAt,
    })
    .from(workflows)
    .orderBy(desc(workflows.createdAt))
    .limit(100)
}
```

### 詳細画面

```typescript
// すべての関連データを取得
async findByIdWithDetails(id: string): Promise<WorkflowDetails | null> {
  const [workflow] = await this.db
    .select()
    .from(workflows)
    .leftJoin(users, eq(users.id, workflows.userId))
    .leftJoin(steps, eq(steps.workflowId, workflows.id))
    .where(eq(workflows.id, id))

  if (!workflow) return null

  return this.toDetailsEntity(workflow)
}
```

### 集計・レポート

```typescript
// 必要な集計情報のみ取得
async countByStatus(): Promise<StatusCount[]> {
  return this.db
    .select({
      status: workflows.status,
      count: count(),
    })
    .from(workflows)
    .groupBy(workflows.status)
}
```

## チェックリスト

### フェッチ戦略決定時

- [ ] 関連データの使用頻度は？
- [ ] 結果セットの予想サイズは？
- [ ] パフォーマンス要件は？
- [ ] N+1問題のリスクは許容できる？

### 実装時

- [ ] 必要なカラムのみSELECTしている？
- [ ] JOINの順序は適切？
- [ ] ページネーションは必要？
- [ ] キャッシュは検討した？
