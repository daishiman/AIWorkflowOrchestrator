# [レイヤー/パターン名] アーキテクチャ仕様

> アーキテクチャレイヤー・設計パターンの仕様定義
> カテゴリ: アーキテクチャ
> 読み込み条件: [レイヤー/パターン名] の設計・実装時

---

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| バージョン | 1.0.0                                                |
| 最終更新   | YYYY-MM-DD                                           |
| レイヤー   | Presentation / Application / Domain / Infrastructure |
| パターン   | [適用パターン名]                                     |

---

## 1. 概要

### 1.1 目的

[このレイヤー/パターンの目的と責務を記述]

### 1.2 設計原則

| 原則           | 適用方法                   |
| -------------- | -------------------------- |
| 単一責任原則   | [具体的な適用]             |
| 依存性逆転原則 | インターフェース経由の依存 |
| 関心の分離     | レイヤー間の明確な境界     |

### 1.3 レイヤー構成

```
┌─────────────────────────────────────────┐
│  Presentation Layer (UI/API)            │
├─────────────────────────────────────────┤
│  Application Layer (Use Cases)          │
├─────────────────────────────────────────┤
│  Domain Layer (Business Logic)          │
├─────────────────────────────────────────┤
│  Infrastructure Layer (External)        │
└─────────────────────────────────────────┘
```

---

## 2. コンポーネント構成

### 2.1 主要コンポーネント

| コンポーネント | 責務             | 依存先     |
| -------------- | ---------------- | ---------- |
| Controller     | リクエスト処理   | Service    |
| Service        | ビジネスロジック | Repository |
| Repository     | データアクセス   | Database   |
| Handler        | IPC処理          | Service    |

### 2.2 依存関係図

```
[Controller/Handler]
        │
        ▼
    [Service]  ←──── [IService] (interface)
        │
        ▼
  [Repository] ←──── [IRepository] (interface)
        │
        ▼
    [Database]
```

---

## 3. パターン詳細

### 3.1 Repository パターン

```typescript
// インターフェース
export interface IEntityRepository {
  findById(id: string): Promise<Entity | null>;
  findAll(filter: EntityFilter): Promise<Entity[]>;
  save(entity: Entity): Promise<Entity>;
  delete(id: string): Promise<void>;
}

// 実装
export class EntityRepository implements IEntityRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Entity | null> {
    // 実装
  }
}
```

### 3.2 Service パターン

```typescript
export interface IEntityService {
  execute(params: Params): Promise<Result<Entity, EntityError>>;
}

export class EntityService implements IEntityService {
  constructor(
    private repository: IEntityRepository,
    private validator: IValidator,
  ) {}

  async execute(params: Params): Promise<Result<Entity, EntityError>> {
    // バリデーション
    const validation = this.validator.validate(params);
    if (!validation.success) {
      return Result.failure(new ValidationError(validation.errors));
    }

    // ビジネスロジック
    const entity = await this.repository.save(params);
    return Result.success(entity);
  }
}
```

### 3.3 Result パターン

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };

const Result = {
  success: <T>(data: T) => ({ success: true as const, data }),
  failure: <E>(error: E) => ({ success: false as const, error }),
};
```

---

## 4. 状態管理（該当時）

### 4.1 Zustand Slice パターン

```typescript
export interface EntitySlice {
  // State
  entities: Entity[];
  selectedId: string | null;
  isLoading: boolean;

  // Actions
  setEntities: (entities: Entity[]) => void;
  selectEntity: (id: string) => void;
  fetchEntities: () => Promise<void>;
}

export const createEntitySlice: StateCreator<EntitySlice> = (set) => ({
  entities: [],
  selectedId: null,
  isLoading: false,

  setEntities: (entities) => set({ entities }),
  selectEntity: (id) => set({ selectedId: id }),
  fetchEntities: async () => {
    set({ isLoading: true });
    const entities = await window.api.getEntities();
    set({ entities, isLoading: false });
  },
});
```

### 4.2 状態フロー

```
User Action → Store Action → IPC Call → Main Process → Response → Store Update → UI Re-render
```

---

## 5. エラーハンドリング

### 5.1 エラー伝播

| レイヤー       | エラー処理                         |
| -------------- | ---------------------------------- |
| Infrastructure | 技術的エラーをドメインエラーに変換 |
| Domain         | ビジネスルール違反のエラー生成     |
| Application    | エラーの集約とログ                 |
| Presentation   | ユーザーフレンドリーなメッセージ   |

### 5.2 エラー型定義

```typescript
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export class ValidationError extends DomainError {
  constructor(public errors: Record<string, string[]>) {
    super("VALIDATION_ERROR", "Input validation failed", errors);
  }
}
```

---

## 6. テスト戦略

### 6.1 レイヤー別テスト

| レイヤー       | テスト種別  | モック対象   |
| -------------- | ----------- | ------------ |
| Presentation   | Integration | Service      |
| Application    | Unit        | Repository   |
| Domain         | Unit        | なし         |
| Infrastructure | Integration | 外部サービス |

### 6.2 テスト例

```typescript
describe("EntityService", () => {
  let service: EntityService;
  let mockRepository: MockProxy<IEntityRepository>;

  beforeEach(() => {
    mockRepository = mock<IEntityRepository>();
    service = new EntityService(mockRepository, validator);
  });

  it("should create entity successfully", async () => {
    mockRepository.save.mockResolvedValue(expectedEntity);

    const result = await service.execute(validParams);

    expect(result.success).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledWith(validParams);
  });
});
```

---

## 7. 実装ファイル

| 種別             | パス                                |
| ---------------- | ----------------------------------- |
| インターフェース | `packages/shared/src/interfaces/`   |
| サービス         | `apps/desktop/src/main/services/`   |
| リポジトリ       | `packages/shared/src/repositories/` |
| 状態管理         | `apps/desktop/src/renderer/store/`  |

---

## 関連ドキュメント

| ドキュメント             | 説明                 |
| ------------------------ | -------------------- |
| architecture-patterns.md | 全体パターン集       |
| interfaces-core.md       | 共通インターフェース |
| error-handling.md        | エラー処理パターン   |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
