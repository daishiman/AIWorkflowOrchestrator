# テストファイルテンプレート

## Vitest テストテンプレート

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// テスト対象のインポート
import { TargetClass } from "./target";

describe("TargetClass", () => {
  // 共通のセットアップ
  let target: TargetClass;

  beforeEach(() => {
    // Arrange: 各テスト前の準備
    target = new TargetClass();
  });

  afterEach(() => {
    // クリーンアップ
    vi.clearAllMocks();
  });

  describe("#methodName", () => {
    describe("正常系", () => {
      it("should return expected result when valid input", () => {
        // Arrange
        const input = "valid input";
        const expected = "expected result";

        // Act
        const result = target.methodName(input);

        // Assert
        expect(result).toBe(expected);
      });

      it("should handle edge case correctly", () => {
        // Arrange
        const input = "edge case input";

        // Act
        const result = target.methodName(input);

        // Assert
        expect(result).toBeDefined();
      });
    });

    describe("異常系", () => {
      it("should throw error when input is invalid", () => {
        // Arrange
        const invalidInput = null;

        // Act & Assert
        expect(() => target.methodName(invalidInput)).toThrow(
          "Expected error message",
        );
      });

      it("should return null when item not found", () => {
        // Arrange
        const nonExistentId = "non-existent";

        // Act
        const result = target.methodName(nonExistentId);

        // Assert
        expect(result).toBeNull();
      });
    });
  });
});
```

## モック使用テンプレート

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TargetService } from "./target-service";
import { DependencyService } from "./dependency-service";

// モック作成
vi.mock("./dependency-service");

describe("TargetService", () => {
  let target: TargetService;
  let mockDependency: DependencyService;

  beforeEach(() => {
    // モックのリセット
    vi.clearAllMocks();

    // モックの設定
    mockDependency = new DependencyService();
    vi.mocked(mockDependency.someMethod).mockResolvedValue("mocked value");

    target = new TargetService(mockDependency);
  });

  it("should call dependency with correct parameters", async () => {
    // Arrange
    const expectedParam = "test param";

    // Act
    await target.doSomething(expectedParam);

    // Assert
    expect(mockDependency.someMethod).toHaveBeenCalledWith(expectedParam);
    expect(mockDependency.someMethod).toHaveBeenCalledTimes(1);
  });
});
```

## 非同期テストテンプレート

```typescript
import { describe, it, expect } from "vitest";
import { AsyncService } from "./async-service";

describe("AsyncService", () => {
  describe("#fetchData", () => {
    it("should resolve with data when successful", async () => {
      // Arrange
      const service = new AsyncService();
      const expectedData = { id: 1, name: "test" };

      // Act
      const result = await service.fetchData(1);

      // Assert
      expect(result).toEqual(expectedData);
    });

    it("should reject when network error occurs", async () => {
      // Arrange
      const service = new AsyncService();

      // Act & Assert
      await expect(service.fetchData(-1)).rejects.toThrow("Network error");
    });
  });
});
```

## テスト構造のガイドライン

### ファイル命名規則

- `*.test.ts` または `*.spec.ts`
- ソースファイルと同じベース名: `user-service.ts` → `user-service.test.ts`

### テストの構造

1. **describe**: テスト対象のグループ化
2. **it/test**: 個別のテストケース
3. **Arrange-Act-Assert**: テスト内部の構造

### 命名規則

- describe: クラス名/関数名
- it: `should + 期待動作 + when + 条件`

### ベストプラクティス

- 一つのテストは一つのことだけを検証
- テストは独立して実行可能
- テストデータは明示的に準備
- マジックナンバーを避け、意図が分かる変数名を使用
