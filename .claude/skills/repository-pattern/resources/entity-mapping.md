# エンティティマッピングガイド

## 概要

エンティティマッピングは、データベースレコード（永続化形式）と
ドメインエンティティ（ビジネスロジック形式）間の変換を担当します。

**目的**:
- ドメイン層をDBスキーマから独立させる
- 型安全な変換を保証する
- 変換ロジックを一箇所に集約する

## マッピング戦略

### 1. 直接マッピング

フィールド名と型が一致する場合:

```typescript
// DBレコード
interface DbWorkflow {
  id: string
  name: string
  status: string
}

// ドメインエンティティ
interface Workflow {
  id: string
  name: string
  status: WorkflowStatus  // Enum型
}

// マッピング
const toEntity = (record: DbWorkflow): Workflow => ({
  id: record.id,
  name: record.name,
  status: record.status as WorkflowStatus,
})
```

### 2. 名前変換マッピング

DBとドメインで命名規則が異なる場合:

```typescript
// DB: snake_case
interface DbWorkflow {
  workflow_id: string
  created_at: string
  updated_at: string
  is_active: number  // 0 or 1
}

// ドメイン: camelCase
interface Workflow {
  id: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

// マッピング
const toEntity = (record: DbWorkflow): Workflow => ({
  id: record.workflow_id,
  createdAt: new Date(record.created_at),
  updatedAt: new Date(record.updated_at),
  isActive: record.is_active === 1,
})
```

### 3. 構造変換マッピング

フラットなDBと階層的なドメイン:

```typescript
// DB: フラット構造
interface DbOrder {
  id: string
  shipping_address_street: string
  shipping_address_city: string
  shipping_address_zip: string
}

// ドメイン: 階層構造
interface Order {
  id: string
  shippingAddress: Address
}

interface Address {
  street: string
  city: string
  zipCode: string
}

// マッピング
const toEntity = (record: DbOrder): Order => ({
  id: record.id,
  shippingAddress: {
    street: record.shipping_address_street,
    city: record.shipping_address_city,
    zipCode: record.shipping_address_zip,
  },
})
```

### 4. JOSONBマッピング

柔軟なスキーマを持つフィールド:

```typescript
// DB: JSONB
interface DbWorkflow {
  id: string
  input_payload: string | null  // JSON文字列
  output_payload: string | null
  metadata: unknown  // JSONB型
}

// ドメイン: 型付きオブジェクト
interface Workflow {
  id: string
  inputPayload: InputPayload | null
  outputPayload: OutputPayload | null
  metadata: WorkflowMetadata
}

// マッピング
const toEntity = (record: DbWorkflow): Workflow => ({
  id: record.id,
  inputPayload: record.input_payload
    ? JSON.parse(record.input_payload) as InputPayload
    : null,
  outputPayload: record.output_payload
    ? JSON.parse(record.output_payload) as OutputPayload
    : null,
  metadata: record.metadata as WorkflowMetadata,
})

const toRecord = (entity: Workflow): Partial<DbWorkflow> => ({
  id: entity.id,
  input_payload: entity.inputPayload
    ? JSON.stringify(entity.inputPayload)
    : null,
  output_payload: entity.outputPayload
    ? JSON.stringify(entity.outputPayload)
    : null,
  metadata: entity.metadata,
})
```

## 型変換パターン

### 日時型

```typescript
// DB → ドメイン
createdAt: new Date(record.created_at)

// ドメイン → DB
created_at: entity.createdAt.toISOString()
```

### Enum型

```typescript
// DB → ドメイン（文字列 → Enum）
status: record.status as WorkflowStatus

// ドメイン → DB（Enum → 文字列）
status: entity.status  // TypeScriptのEnumは文字列としてそのまま使用可能
```

### Boolean型

```typescript
// DB: 数値（0/1） → ドメイン: boolean
isActive: record.is_active === 1

// ドメイン: boolean → DB: 数値
is_active: entity.isActive ? 1 : 0
```

### Nullable型

```typescript
// DB nullable → ドメイン optional
description: record.description ?? undefined

// ドメイン optional → DB nullable
description: entity.description ?? null
```

## Null/Undefined処理

### ルール

1. **DBのNULL**: `null`で表現
2. **ドメインの未設定**: `undefined`で表現
3. **変換時**: null ⇔ undefined の相互変換

### 実装パターン

```typescript
// DB → ドメイン
const toEntity = (record: DbRecord): Entity => ({
  // nullをundefinedに変換
  optionalField: record.nullable_field ?? undefined,

  // 空文字列も未設定として扱う場合
  description: record.description || undefined,

  // nullを許容するフィールド
  nullableField: record.nullable_field,  // そのまま
})

// ドメイン → DB
const toRecord = (entity: Entity): Partial<DbRecord> => ({
  // undefinedをnullに変換
  nullable_field: entity.optionalField ?? null,

  // 明示的にnullを設定しない（undefinedのまま）
  // → UPDATEで該当フィールドを更新しない
})
```

## 関連エンティティのマッピング

### 1. 埋め込みオブジェクト（Value Object）

```typescript
// 同一レコード内のValue Object
const toEntity = (record: DbOrder): Order => ({
  id: record.id,
  // Value Objectとして構築
  price: new Money(record.price_amount, record.price_currency),
  period: new DateRange(
    new Date(record.start_date),
    new Date(record.end_date)
  ),
})
```

### 2. 1対1関連

```typescript
// JOINで取得した関連データ
interface DbWorkflowWithUser {
  id: string
  name: string
  user_id: string
  user_name: string
  user_email: string
}

const toEntity = (record: DbWorkflowWithUser): WorkflowWithUser => ({
  id: record.id,
  name: record.name,
  user: {
    id: record.user_id,
    name: record.user_name,
    email: record.user_email,
  },
})
```

### 3. 1対多関連

```typescript
// 別クエリで取得した関連データを組み合わせ
const findWithSteps = async (id: string): Promise<WorkflowWithSteps> => {
  const workflow = await this.findById(id)
  const steps = await this.stepRepository.findByWorkflowId(id)

  return {
    ...workflow,
    steps,
  }
}
```

## マッピングチェックリスト

### 基本チェック

- [ ] すべてのフィールドがマッピングされているか？
- [ ] 型変換が正しく行われているか？
- [ ] Null/Undefinedが適切に処理されているか？

### 型安全性チェック

- [ ] 戻り値の型が正しく定義されているか？
- [ ] Enum変換時のバリデーションは必要か？
- [ ] JSONB解析時の型ガードは必要か？

### パフォーマンスチェック

- [ ] 不要な変換処理がないか？
- [ ] 大量データ時のメモリ使用量は問題ないか？
- [ ] 変換関数は副作用がないか？

## トラブルシューティング

### 問題1: 型の不一致

**症状**: TypeScriptコンパイルエラー

**原因**: DBスキーマとドメイン型の乖離

**解決策**:
1. DBスキーマ型を正確に定義
2. 変換関数で明示的に型変換
3. 必要に応じて型ガードを追加

### 問題2: Null参照エラー

**症状**: 実行時エラー「Cannot read property of null」

**原因**: Nullable処理の漏れ

**解決策**:
1. DBスキーマのNullable定義を確認
2. オプショナルチェーン（?.）を使用
3. Nullish coalescing（??）でデフォルト値を設定

### 問題3: データ損失

**症状**: 保存後にデータが欠落

**原因**: toRecordで一部フィールドが未マッピング

**解決策**:
1. すべてのフィールドがマッピングされているか確認
2. 部分更新時はspread演算子で既存値を保持
3. テストで往復変換（round-trip）を検証
