# Repository実装パターン

## 基本実装構造

### 標準Repository実装

```typescript
// 概念的な実装構造
class XxxRepository implements IXxxRepository {
  // DBクライアント/コネクション
  constructor(private readonly db: DatabaseClient) {}

  // 変換関数
  private toEntity(record: DbRecord): DomainEntity { /* ... */ }
  private toRecord(entity: DomainEntity): DbRecord { /* ... */ }

  // CRUD操作
  async add(entity: DomainEntity): Promise<DomainEntity> { /* ... */ }
  async findById(id: string): Promise<DomainEntity | null> { /* ... */ }
  async update(entity: DomainEntity): Promise<DomainEntity> { /* ... */ }
  async remove(entity: DomainEntity): Promise<void> { /* ... */ }

  // ドメイン固有検索
  async findByCondition(...): Promise<DomainEntity[]> { /* ... */ }
}
```

## エンティティマッピングパターン

### 1. 内部変換関数パターン

Repository内部にプライベートな変換関数を定義:

**DB → ドメインエンティティ（toEntity）**:
```typescript
// 概念構造
private toEntity(record: DbRecord): DomainEntity {
  return {
    id: record.id,
    // フィールドマッピング
    status: record.status as DomainStatus,
    // JSONB → オブジェクト
    config: record.config_json ? JSON.parse(record.config_json) : null,
    // タイムスタンプ変換
    createdAt: new Date(record.created_at),
    updatedAt: new Date(record.updated_at),
  }
}
```

**ドメインエンティティ → DB（toRecord）**:
```typescript
private toRecord(entity: DomainEntity): Partial<DbRecord> {
  return {
    id: entity.id,
    status: entity.status,
    // オブジェクト → JSONB
    config_json: entity.config ? JSON.stringify(entity.config) : null,
    // Date → ISO文字列（DBに応じて）
    updated_at: new Date().toISOString(),
  }
}
```

### 2. マッピングの注意点

**Null/Undefined処理**:
```typescript
// DB nullable → ドメイン optional
private toEntity(record: DbRecord): DomainEntity {
  return {
    // nullはundefinedに変換
    description: record.description ?? undefined,
    // 空文字列の扱い
    notes: record.notes || undefined,
  }
}
```

**型変換**:
```typescript
// 文字列 → Enum
status: record.status as WorkflowStatus,

// 数値 → Boolean
isActive: record.is_active === 1,

// JSONB → 型付きオブジェクト
metadata: record.metadata as Metadata,
```

## CRUD実装パターン

### Create（追加）

```typescript
async add(entity: Workflow): Promise<Workflow> {
  // 1. ID生成（必要に応じて）
  const id = entity.id || generateUUID()

  // 2. レコード作成
  const record = this.toRecord({ ...entity, id })

  // 3. DB挿入
  const [inserted] = await this.db
    .insert(workflowsTable)
    .values(record)
    .returning()

  // 4. エンティティに変換して返却
  return this.toEntity(inserted)
}
```

### Read（取得）

**単一取得**:
```typescript
async findById(id: string): Promise<Workflow | null> {
  const records = await this.db
    .select()
    .from(workflowsTable)
    .where(eq(workflowsTable.id, id))
    .limit(1)

  return records[0] ? this.toEntity(records[0]) : null
}
```

**複数取得**:
```typescript
async findAll(): Promise<Workflow[]> {
  const records = await this.db
    .select()
    .from(workflowsTable)

  return records.map(r => this.toEntity(r))
}
```

**条件検索**:
```typescript
async findByStatus(status: WorkflowStatus): Promise<Workflow[]> {
  const records = await this.db
    .select()
    .from(workflowsTable)
    .where(eq(workflowsTable.status, status))
    .orderBy(desc(workflowsTable.createdAt))

  return records.map(r => this.toEntity(r))
}
```

### Update（更新）

```typescript
async update(entity: Workflow): Promise<Workflow> {
  const record = this.toRecord(entity)

  const [updated] = await this.db
    .update(workflowsTable)
    .set({
      ...record,
      updated_at: new Date().toISOString(),
    })
    .where(eq(workflowsTable.id, entity.id))
    .returning()

  if (!updated) {
    throw new EntityNotFoundError(`Workflow with id ${entity.id} not found`)
  }

  return this.toEntity(updated)
}
```

### Delete（削除）

**物理削除**:
```typescript
async remove(entity: Workflow): Promise<void> {
  await this.db
    .delete(workflowsTable)
    .where(eq(workflowsTable.id, entity.id))
}
```

**論理削除（ソフトデリート）**:
```typescript
async remove(entity: Workflow): Promise<void> {
  await this.db
    .update(workflowsTable)
    .set({ deleted_at: new Date().toISOString() })
    .where(eq(workflowsTable.id, entity.id))
}
```

## エラーハンドリングパターン

### カスタムエラークラス

```typescript
// 基底エラー
class RepositoryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'RepositoryError'
  }
}

// エンティティ未発見
class EntityNotFoundError extends RepositoryError {
  constructor(public readonly entityId: string) {
    super(`Entity with id ${entityId} not found`)
    this.name = 'EntityNotFoundError'
  }
}

// 一意制約違反
class UniqueConstraintError extends RepositoryError {
  constructor(public readonly field: string, public readonly value: string) {
    super(`Unique constraint violated for ${field}: ${value}`)
    this.name = 'UniqueConstraintError'
  }
}
```

### エラーハンドリング実装

```typescript
async add(entity: Workflow): Promise<Workflow> {
  try {
    const [inserted] = await this.db
      .insert(workflowsTable)
      .values(this.toRecord(entity))
      .returning()

    return this.toEntity(inserted)
  } catch (error) {
    // 一意制約違反の検出（DB固有のエラーコードを確認）
    if (this.isUniqueConstraintError(error)) {
      throw new UniqueConstraintError('id', entity.id)
    }
    throw new RepositoryError('Failed to add entity', error as Error)
  }
}

private isUniqueConstraintError(error: unknown): boolean {
  // PostgreSQLの場合: error.code === '23505'
  // 実際のエラーコードはDBに依存
  return (error as any)?.code === '23505'
}
```

## 実装チェックリスト

### 基本実装

- [ ] コンストラクタでDBクライアントを受け取っているか？
- [ ] toEntity/toRecord変換関数が定義されているか？
- [ ] すべてのインターフェースメソッドが実装されているか？

### 変換ロジック

- [ ] Null/Undefinedが適切に処理されているか？
- [ ] 型変換（Enum、Date等）が正しいか？
- [ ] JSONB⇔オブジェクト変換が正しいか？

### エラーハンドリング

- [ ] エンティティ未発見時の処理があるか？
- [ ] 一意制約違反時の処理があるか？
- [ ] DB接続エラー時の処理があるか？

### パフォーマンス

- [ ] 必要なカラムのみSELECTしているか？
- [ ] 適切なインデックスが活用されているか？
- [ ] N+1問題が発生していないか？

## テスト戦略

### 単体テスト構造

```typescript
describe('WorkflowRepository', () => {
  // セットアップ
  beforeEach(async () => {
    // テストデータのセットアップ
  })

  afterEach(async () => {
    // クリーンアップ
  })

  // CRUD操作テスト
  describe('add', () => {
    it('新しいエンティティを追加できる', async () => { /* ... */ })
    it('一意制約違反時にエラーをスローする', async () => { /* ... */ })
  })

  describe('findById', () => {
    it('存在するエンティティを取得できる', async () => { /* ... */ })
    it('存在しないIDでnullを返す', async () => { /* ... */ })
  })

  describe('update', () => {
    it('エンティティを更新できる', async () => { /* ... */ })
    it('存在しないエンティティでエラーをスローする', async () => { /* ... */ })
  })

  describe('remove', () => {
    it('エンティティを削除できる', async () => { /* ... */ })
  })

  // ドメイン固有メソッドテスト
  describe('findByStatus', () => {
    it('指定ステータスのエンティティを取得できる', async () => { /* ... */ })
    it('該当なしで空配列を返す', async () => { /* ... */ })
  })
})
```
