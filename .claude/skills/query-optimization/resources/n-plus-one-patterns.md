# N+1問題パターンと解決策

## N+1問題とは

**定義**: 親エンティティを取得するクエリ（1回）と、各親エンティティに対する
子エンティティ取得クエリ（N回）が発生する問題。

**影響**:
- データベース負荷の増大
- レスポンスタイムの悪化
- コネクションプールの枯渇リスク

## 検出パターン

### パターン1: ループ内のDB呼び出し

```typescript
// ❌ N+1問題あり
async function getWorkflowsWithSteps(): Promise<WorkflowWithSteps[]> {
  const workflows = await workflowRepo.findAll()  // 1クエリ

  return Promise.all(
    workflows.map(async (workflow) => ({
      ...workflow,
      steps: await stepRepo.findByWorkflowId(workflow.id),  // N クエリ
    }))
  )
}
// 合計: 1 + N クエリ
```

### パターン2: 関連プロパティへのアクセス

```typescript
// ❌ Lazy Loading による N+1
const workflows = await workflowRepo.findAll()  // 1クエリ

for (const workflow of workflows) {
  console.log(workflow.user.name)  // 暗黙的に N クエリ発生
}
```

### パターン3: テンプレートでのアクセス

```tsx
// ❌ テンプレート内での関連アクセス
{workflows.map((workflow) => (
  <div key={workflow.id}>
    {workflow.user.name}  // レンダリング時に N クエリ
    {workflow.steps.length}  // さらに N クエリ
  </div>
))}
```

## 解決策

### 解決策1: JOIN戦略

**概念**: 1回のクエリで親と子を同時に取得

```typescript
// ✅ JOINで一括取得
async function getWorkflowsWithSteps(): Promise<WorkflowWithSteps[]> {
  const results = await db
    .select()
    .from(workflows)
    .leftJoin(steps, eq(steps.workflowId, workflows.id))
    .orderBy(workflows.id)

  // 結果をグループ化
  return groupByWorkflow(results)
}
// 合計: 1 クエリ
```

**適用条件**:
- [ ] 関連データが常に必要
- [ ] 結果セットが大きすぎない
- [ ] 1対多または多対多の関連

**メリット**:
- クエリ数が最小（1回）
- ネットワークラウンドトリップ削減

**デメリット**:
- 結果セットが大きくなる可能性
- メモリ使用量の増加

### 解決策2: バッチフェッチ（IN句）

**概念**: 複数のIDを一括で取得

```typescript
// ✅ バッチフェッチで一括取得
async function getWorkflowsWithSteps(): Promise<WorkflowWithSteps[]> {
  const workflows = await workflowRepo.findAll()  // 1クエリ
  const workflowIds = workflows.map(w => w.id)

  const allSteps = await stepRepo.findByWorkflowIds(workflowIds)  // 1クエリ
  const stepsByWorkflowId = groupBy(allSteps, 'workflowId')

  return workflows.map(workflow => ({
    ...workflow,
    steps: stepsByWorkflowId[workflow.id] || [],
  }))
}
// 合計: 2 クエリ（1 + 1）
```

**適用条件**:
- [ ] IDの配列で検索可能
- [ ] 結果のグループ化が可能
- [ ] JOINが複雑すぎる場合

**メリット**:
- クエリ数が固定（2回）
- JOINより結果セットが小さい

**デメリット**:
- アプリケーション側でのグループ化が必要
- IN句の要素数制限に注意

### 解決策3: データローダーパターン

**概念**: 同一リクエスト内のクエリを自動的にバッチ化

```typescript
// ✅ DataLoaderを使用
import DataLoader from 'dataloader'

const stepLoader = new DataLoader(async (workflowIds: string[]) => {
  const steps = await stepRepo.findByWorkflowIds(workflowIds)
  const stepsByWorkflowId = groupBy(steps, 'workflowId')
  return workflowIds.map(id => stepsByWorkflowId[id] || [])
})

// 使用側（ループでも自動的にバッチ化）
const workflows = await workflowRepo.findAll()
const results = await Promise.all(
  workflows.map(async (workflow) => ({
    ...workflow,
    steps: await stepLoader.load(workflow.id),  // 自動バッチ化
  }))
)
```

**適用条件**:
- [ ] GraphQLなどのリゾルバーパターン
- [ ] 複雑なネストした関連がある
- [ ] リクエストスコープでのキャッシュが有効

**メリット**:
- 透過的なバッチ化
- キャッシュ機能あり
- コードの可読性維持

**デメリット**:
- 追加ライブラリが必要
- リクエストスコープの管理が必要

## 解決策選択ガイド

```
N+1問題を検出
    │
    ├─ 関連データは常に必要？
    │   ├─ Yes → 結果セットは許容範囲？
    │   │   ├─ Yes → JOIN戦略
    │   │   └─ No → バッチフェッチ
    │   │
    │   └─ No → 条件によって必要？
    │       ├─ Yes → 明示的フェッチメソッド
    │       └─ No → Lazy Loadingのまま（監視必要）
    │
    └─ GraphQL/リゾルバー？
        ├─ Yes → DataLoaderパターン
        └─ No → バッチフェッチ
```

## N+1検出チェックリスト

### コードレビュー時

- [ ] ループ内でawaitを使用していないか？
- [ ] Promise.all内で個別にDB呼び出ししていないか？
- [ ] 関連プロパティに直接アクセスしていないか？

### 実行時

- [ ] クエリログでSELECTが連続していないか？
- [ ] 同じテーブルへのクエリが大量にないか？
- [ ] クエリ数がデータ件数に比例していないか？

### パフォーマンステスト時

- [ ] データ件数を増やした時にクエリ数が増加しないか？
- [ ] レスポンスタイムがデータ件数に比例しないか？

## 実装例

### Repository側の対応

```typescript
// バッチフェッチ用メソッドの追加
interface IStepRepository {
  findByWorkflowId(workflowId: string): Promise<Step[]>
  findByWorkflowIds(workflowIds: string[]): Promise<Step[]>  // バッチ用
}

// 実装
async findByWorkflowIds(workflowIds: string[]): Promise<Step[]> {
  return this.db
    .select()
    .from(steps)
    .where(inArray(steps.workflowId, workflowIds))
}
```

### サービス側の対応

```typescript
// JOINを使用した取得メソッド
async findWorkflowsWithDetails(userId: string): Promise<WorkflowWithDetails[]> {
  // 1クエリでまとめて取得
  const results = await this.workflowRepo.findByUserIdWithSteps(userId)
  return results
}
```

## パフォーマンス比較

| 方式 | クエリ数 | メモリ | 実装難易度 |
|------|---------|--------|-----------|
| N+1（問題あり） | 1 + N | 低 | 低 |
| JOIN | 1 | 高 | 中 |
| バッチフェッチ | 2 | 中 | 中 |
| DataLoader | 2〜 | 中 | 高 |

**目安**:
- N < 10: どの方式でも大差なし
- N = 100: JOIN または バッチフェッチ推奨
- N > 1000: バッチフェッチ + ページネーション推奨
