# Repositoryインターフェース設計パターン

## 基本インターフェースパターン

### 1. 汎用Repositoryインターフェース

```typescript
// 概念的な構造（実装は技術スタックに応じて調整）
interface IRepository<T, ID> {
  // 作成
  add(entity: T): Promise<T>;

  // 読み取り
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;

  // 更新
  update(entity: T): Promise<T>;

  // 削除
  remove(entity: T): Promise<void>;
  removeById(id: ID): Promise<boolean>;

  // 存在確認
  exists(id: ID): Promise<boolean>;

  // カウント
  count(): Promise<number>;
}
```

### 2. 読み取り専用Repository

読み取りのみが必要なユースケース向け:

```typescript
interface IReadOnlyRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  exists(id: ID): Promise<boolean>;
  count(): Promise<number>;
}
```

### 3. 書き込み専用Repository

イベントソーシングやCQRSパターン向け:

```typescript
interface IWriteOnlyRepository<T, ID> {
  add(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  remove(entity: T): Promise<void>;
}
```

## ドメイン固有メソッドパターン

### ファインダーメソッド

ビジネス要件に基づいた検索メソッド:

```typescript
interface IWorkflowRepository extends IRepository<Workflow, string> {
  // ステータスによる検索
  findPendingWorkflows(): Promise<Workflow[]>;
  findCompletedWorkflows(): Promise<Workflow[]>;

  // ユーザーによる検索
  findByUserId(userId: string): Promise<Workflow[]>;

  // 複合条件
  findByUserAndStatus(
    userId: string,
    status: WorkflowStatus,
  ): Promise<Workflow[]>;

  // 期間指定
  findCreatedAfter(date: Date): Promise<Workflow[]>;
  findCreatedBetween(start: Date, end: Date): Promise<Workflow[]>;
}
```

### ページネーション対応

大量データ取得時のパターン:

```typescript
interface PageRequest {
  page: number; // 0-indexed
  size: number; // 1ページあたりの件数
  sortBy?: string; // ソートカラム
  sortOrder?: "asc" | "desc";
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface IPaginatedRepository<T, ID> extends IRepository<T, ID> {
  findAllPaginated(request: PageRequest): Promise<Page<T>>;
  findByConditionPaginated(
    condition: Partial<T>,
    request: PageRequest,
  ): Promise<Page<T>>;
}
```

### バルク操作

複数エンティティの一括操作:

```typescript
interface IBulkRepository<T, ID> {
  addAll(entities: T[]): Promise<T[]>;
  updateAll(entities: T[]): Promise<T[]>;
  removeAll(entities: T[]): Promise<void>;
  removeAllByIds(ids: ID[]): Promise<number>; // 削除件数を返却

  // 一括検索
  findByIds(ids: ID[]): Promise<T[]>;
}
```

## 命名規則

### メソッド名プレフィックス

| プレフィックス | 用途     | 戻り値                 |
| -------------- | -------- | ---------------------- |
| `find`         | 検索     | `T` or `T[]` or `null` |
| `findAll`      | 全件取得 | `T[]`                  |
| `findBy`       | 条件検索 | `T` or `T[]`           |
| `exists`       | 存在確認 | `boolean`              |
| `count`        | 件数取得 | `number`               |
| `add`          | 追加     | `T`                    |
| `update`       | 更新     | `T`                    |
| `remove`       | 削除     | `void` or `boolean`    |

### ビジネス用語の使用

```typescript
// ❌ 技術的な命名
findByStatusEquals(status: string)
selectWhereUserIdIn(userIds: string[])

// ✅ ビジネス用語での命名
findPendingWorkflows()
findWorkflowsByUsers(userIds: string[])
```

## インターフェース設計チェックリスト

### 抽象化チェック

- [ ] DB固有の型（Connection, QueryBuilder等）を含んでいないか？
- [ ] SQLキーワード（SELECT, WHERE等）がメソッド名に含まれていないか？
- [ ] 戻り値はドメインエンティティまたはValue Objectか？

### ドメイン表現チェック

- [ ] メソッド名はドメインエキスパートが理解できるか？
- [ ] ビジネス用語を使用しているか？
- [ ] 技術的な詳細が隠蔽されているか？

### 設計品質チェック

- [ ] 単一責任原則に従っているか？（CRUD + 検索のみ）
- [ ] インターフェース分離原則に従っているか？（必要なメソッドのみ）
- [ ] 適切な粒度か？（多すぎず、少なすぎず）

## アンチパターン

### 1. 汎用クエリメソッド

```typescript
// ❌ アンチパターン
interface IRepository<T> {
  find(query: any): Promise<T[]>; // 任意のクエリを許可
  executeQuery(sql: string): Promise<T[]>; // 生SQL
}
```

**問題点**: 抽象化が破綻し、DBの詳細がドメインに漏れる

### 2. トランザクション制御の混入

```typescript
// ❌ アンチパターン
interface IRepository<T> {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

**問題点**: トランザクションはユースケース層で制御すべき

### 3. ビジネスロジックの混入

```typescript
// ❌ アンチパターン
interface IWorkflowRepository {
  processWorkflow(id: string): Promise<void>; // ビジネスロジック
  validateAndSave(workflow: Workflow): Promise<Workflow>; // バリデーション混入
}
```

**問題点**: Repositoryの責務を超えている

## 型安全性の確保

### ジェネリクスの活用

```typescript
// ID型を明示的に指定
interface IRepository<T, ID extends string | number> {
  findById(id: ID): Promise<T | null>;
  removeById(id: ID): Promise<boolean>;
}

// 使用例
interface IWorkflowRepository extends IRepository<Workflow, WorkflowId> {
  // WorkflowIdは`string`のブランド型
}
```

### Null安全性

```typescript
// 単一エンティティ取得は null を許容
findById(id: ID): Promise<T | null>

// 複数エンティティ取得は空配列を返却
findAll(): Promise<T[]>  // never null, empty array possible

// 必須取得（見つからない場合は例外）
findByIdOrThrow(id: ID): Promise<T>
```
