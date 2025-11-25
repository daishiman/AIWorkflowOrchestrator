# リポジトリインターフェース設計

## リポジトリパターンとは

リポジトリパターンは、ドメイン層と永続化層の間に抽象化レイヤーを提供するパターンです。
ドメインオブジェクトのコレクションに対する操作を、メモリ内コレクションのように扱えます。

## 設計原則

### 1. コレクション風インターフェース

**原則**: リポジトリはコレクションのように振る舞う

**メソッド命名規則**:
| 操作 | メソッド名 | 説明 |
|------|----------|------|
| 追加 | `add(entity)` | エンティティを追加 |
| 検索(ID) | `findById(id)` | IDで1件取得 |
| 検索(条件) | `findByXxx(criteria)` | 条件で検索 |
| 存在確認 | `exists(id)` | 存在確認 |
| 削除 | `remove(entity)` | エンティティを削除 |
| 全件取得 | `findAll()` | 全件取得（注意して使用） |

### 2. ドメインエンティティの入出力

**原則**: 引数と戻り値はドメインエンティティ

**理由**:
- ドメイン層からDB詳細を隠蔽
- 型安全性の確保
- ドメインロジックとの統合

**概念例**:
```typescript
interface IWorkflowRepository {
  add(workflow: Workflow): Promise<void>;
  findById(id: WorkflowId): Promise<Workflow | null>;
  findByUserId(userId: UserId): Promise<Workflow[]>;
  remove(workflow: Workflow): Promise<void>;
}
```

### 3. インターフェースの配置

**原則**:
- インターフェース → ドメイン層（`src/shared/core/interfaces/`）
- 実装 → インフラストラクチャ層（`src/shared/infrastructure/`）

**依存の方向**:
```
Infrastructure層 → ドメイン層（インターフェース）
                        ↑
                   ドメイン層（エンティティ）
```

### 4. 集約ルートごとに1つ

**原則**: リポジトリは集約ルートに対してのみ定義

**理由**:
- 集約の整合性を保護
- アクセス経路の明確化
- 不変条件の維持

**正しい例**:
```
IOrderRepository      → Order集約ルート
ICustomerRepository   → Customer集約ルート
```

**避けるべき例**:
```
IOrderItemRepository  → OrderItem（集約内エンティティ）
```

## リポジトリメソッドの設計

### 検索メソッド

**基本パターン**:
- `findById(id)`: 単一エンティティ取得、見つからない場合null
- `getById(id)`: 単一エンティティ取得、見つからない場合例外
- `findByXxx(criteria)`: 条件検索、配列を返す
- `findAll()`: 全件取得（ページネーション推奨）

**クエリの複雑さに応じた選択**:
| 複雑さ | 配置 | 例 |
|-------|-----|-----|
| 単純 | リポジトリ | findById, findByUserId |
| 中程度 | リポジトリ | 複数条件の検索 |
| 複雑 | 専用クエリサービス | 分析クエリ、レポート |

### 永続化メソッド

**パターン**:
- `add(entity)`: 新規追加
- `update(entity)` or `save(entity)`: 更新
- `remove(entity)`: 削除

**Unit of Work パターンとの組み合わせ**:
- トランザクション管理は上位層で
- リポジトリは個別操作のみ

### 存在確認メソッド

**パターン**:
- `exists(id)`: IDで存在確認
- `existsByXxx(criteria)`: 条件で存在確認

**用途**:
- 重複チェック
- 前提条件の検証
- パフォーマンス最適化（全件取得を避ける）

## インターフェース設計のベストプラクティス

### 1. 戻り値の型

**null許容**:
- `findById`: `Promise<Entity | null>`
- 見つからない場合はnullを返す

**例外スロー**:
- `getById`: `Promise<Entity>` (例外スロー)
- 見つからない場合は例外

**使い分け**:
- 存在しない可能性が高い → find系
- 存在することが前提 → get系

### 2. 引数の設計

**ID型の使用**:
```typescript
// ✓ 良い: 値オブジェクトのID
findById(id: WorkflowId): Promise<Workflow | null>

// ✗ 避ける: プリミティブ型
findById(id: string): Promise<Workflow | null>
```

**検索条件の構造化**:
```typescript
// 複雑な条件の場合は専用の型を定義
interface WorkflowSearchCriteria {
  userId?: UserId;
  status?: WorkflowStatus;
  createdAfter?: Date;
}

findByCriteria(criteria: WorkflowSearchCriteria): Promise<Workflow[]>
```

### 3. ページネーション

**標準的なインターフェース**:
```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

findAll(options: PaginationOptions): Promise<PaginatedResult<Workflow>>
```

## アンチパターン

### 1. 汎用リポジトリ

**症状**: すべてのエンティティに同じインターフェース

**問題**:
- ドメイン固有のクエリが表現できない
- 型安全性の低下

**解決策**:
- 集約ごとに専用リポジトリを定義

### 2. ビジネスロジックの混入

**症状**: リポジトリ内でビジネスルールを実装

**問題**:
- 責務の混在
- テスト困難

**解決策**:
- リポジトリはCRUD操作のみ
- ビジネスロジックはドメインサービスへ

### 3. SQLの漏洩

**症状**: リポジトリインターフェースにSQL固有の概念

**問題**:
- ドメイン層がDB詳細に依存

**解決策**:
- インターフェースはドメイン用語のみ使用
- 実装でDBマッピング

## チェックリスト

### リポジトリインターフェース設計チェック

- [ ] インターフェースがドメイン層に配置されているか？
- [ ] 集約ルートに対してのみ定義されているか？
- [ ] メソッド名がコレクション風か？
- [ ] 引数と戻り値がドメインエンティティか？
- [ ] プリミティブ型ではなく値オブジェクトを使用しているか？
- [ ] 実装の詳細（SQL等）が漏れていないか？
- [ ] ページネーションが考慮されているか？
- [ ] 適切な例外/null処理が設計されているか？
