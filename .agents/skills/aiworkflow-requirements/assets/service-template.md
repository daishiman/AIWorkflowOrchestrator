# サービス仕様テンプレート

> 用途: ビジネスロジック層、ドメインサービス、アプリケーションサービスの仕様定義
> 参考: architecture-patterns.md, interfaces-core.md

---

## 概要

[サービス名]の仕様を定義する。

---

## サービス概要

| 項目       | 内容                      |
| ---------- | ------------------------- |
| サービス名 | XxxService                |
| レイヤー   | Application / Domain      |
| 責務       | [主要責務]                |
| 依存       | [依存サービス/リポジトリ] |

---

## インターフェース定義

### サービスインターフェース

```typescript
export interface IXxxService {
  /**
   * [メソッド説明]
   * @param params - 入力パラメータ
   * @returns 処理結果
   * @throws XxxError - [エラー条件]
   */
  execute(params: XxxParams): Promise<Result<XxxResult, XxxError>>;

  /**
   * [メソッド説明]
   */
  getById(id: string): Promise<Result<XxxEntity | null, XxxError>>;

  /**
   * [メソッド説明]
   */
  list(filter: XxxFilter): Promise<Result<XxxEntity[], XxxError>>;
}
```

### 入力/出力型

```typescript
// 入力パラメータ
export interface XxxParams {
  id: string;
  data: XxxData;
  options?: XxxOptions;
}

// フィルター型
export interface XxxFilter {
  status?: XxxStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// 結果型
export interface XxxResult {
  id: string;
  processedAt: Date;
  output: unknown;
}
```

---

## 実装仕様

### クラス構造

```typescript
export class XxxService implements IXxxService {
  constructor(
    private readonly repository: IXxxRepository,
    private readonly validator: IXxxValidator,
    private readonly logger: ILogger,
  ) {}

  async execute(params: XxxParams): Promise<Result<XxxResult, XxxError>> {
    // 1. バリデーション
    const validationResult = this.validator.validate(params);
    if (!validationResult.success) {
      return Result.failure(new ValidationError(validationResult.errors));
    }

    // 2. ビジネスロジック実行
    try {
      const result = await this.processBusinessLogic(params);
      return Result.success(result);
    } catch (error) {
      this.logger.error("XxxService.execute failed", { error, params });
      return Result.failure(new XxxError("PROCESS_FAILED", error.message));
    }
  }

  private async processBusinessLogic(params: XxxParams): Promise<XxxResult> {
    // ビジネスロジック実装
  }
}
```

### Result Pattern

```typescript
// Result型定義
export type Result<T, E extends Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Result = {
  success: <T>(data: T): Result<T, never> => ({ success: true, data }),
  failure: <E extends Error>(error: E): Result<never, E> => ({
    success: false,
    error,
  }),
};
```

---

## ビジネスルール

### 前提条件

| ルールID | ルール名     | 条件             | 違反時の動作      |
| -------- | ------------ | ---------------- | ----------------- |
| BR-001   | 認証必須     | ユーザー認証済み | UnauthorizedError |
| BR-002   | 権限チェック | 適切な権限保持   | ForbiddenError    |

### 処理ルール

| ルールID | ルール名   | ロジック       | 備考 |
| -------- | ---------- | -------------- | ---- |
| PR-001   | [ルール名] | [ロジック説明] |      |

### 後続処理

| 条件   | 後続処理     | 非同期 |
| ------ | ------------ | ------ |
| 成功時 | イベント発行 | Yes    |
| 失敗時 | ログ記録     | No     |

---

## 依存関係

### 依存注入

```typescript
// DIコンテナ登録
container.register<IXxxService>("XxxService", {
  useFactory: (c) =>
    new XxxService(
      c.resolve<IXxxRepository>("XxxRepository"),
      c.resolve<IXxxValidator>("XxxValidator"),
      c.resolve<ILogger>("Logger"),
    ),
});
```

### 依存グラフ

```
XxxService
├── IXxxRepository (Infrastructure)
├── IXxxValidator (Domain)
└── ILogger (Infrastructure)
```

---

## エラーハンドリング

| エラー型        | 条件             | HTTPステータス |
| --------------- | ---------------- | -------------- |
| ValidationError | 入力不正         | 400            |
| NotFoundError   | リソース不在     | 404            |
| ConflictError   | 状態競合         | 409            |
| XxxError        | その他業務エラー | 500            |

---

## テスト仕様

### 単体テスト

```typescript
describe("XxxService", () => {
  let service: XxxService;
  let mockRepository: MockProxy<IXxxRepository>;

  beforeEach(() => {
    mockRepository = mock<IXxxRepository>();
    service = new XxxService(mockRepository, validator, logger);
  });

  describe("execute", () => {
    it("should return success result when valid params", async () => {
      // Arrange
      mockRepository.save.mockResolvedValue(expectedEntity);

      // Act
      const result = await service.execute(validParams);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
```

### カバレッジ目標

| メトリクス | 目標 |
| ---------- | ---- |
| Line       | 90%+ |
| Branch     | 85%+ |
| Function   | 100% |

---

## 関連ドキュメント

| ドキュメント             | 説明             |
| ------------------------ | ---------------- |
| architecture-patterns.md | サービスパターン |
| interfaces-core.md       | Result型定義     |
| error-handling.md        | エラー処理       |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
