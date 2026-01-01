# Mockパターン

## 概要

Mockは期待される呼び出しを事前に設定し、振る舞いを検証するテストダブルです。
Vitestでの実践的なMockパターンを解説します。

## 基本パターン

### 関数のMock

```typescript
import { vi, describe, it, expect } from "vitest";

// 基本的なMock関数
const mockFn = vi.fn();

// 戻り値を設定
const mockWithReturn = vi.fn().mockReturnValue("result");

// 非同期の戻り値
const mockAsync = vi.fn().mockResolvedValue({ data: "value" });

// 呼び出しごとに異なる値
const mockSequence = vi
  .fn()
  .mockReturnValueOnce("first")
  .mockReturnValueOnce("second")
  .mockReturnValue("default");
```

### オブジェクトのMock

```typescript
// 依存オブジェクトのMock
const mockRepository = {
  findById: vi.fn().mockResolvedValue({ id: "1", name: "Test" }),
  save: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
};

// 使用
const service = new UserService(mockRepository);
```

### モジュールのMock

```typescript
// モジュール全体をMock
vi.mock("./userRepository", () => ({
  userRepository: {
    findById: vi.fn().mockResolvedValue({ id: "1" }),
  },
}));

// 部分的なMock
vi.mock("./utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    formatDate: vi.fn().mockReturnValue("2025-01-01"),
  };
});
```

## 検証パターン

### 呼び出しの検証

```typescript
it("should call repository with correct id", async () => {
  await service.getUser("user-1");

  // 呼び出されたことを確認
  expect(mockRepository.findById).toHaveBeenCalled();

  // 呼び出し回数
  expect(mockRepository.findById).toHaveBeenCalledTimes(1);

  // 引数の検証
  expect(mockRepository.findById).toHaveBeenCalledWith("user-1");

  // 最後の呼び出しの引数
  expect(mockRepository.findById).toHaveBeenLastCalledWith("user-1");
});
```

### 引数マッチャー

```typescript
it("should call with expected structure", async () => {
  await service.createUser({ name: "Test", email: "test@example.com" });

  // 部分一致
  expect(mockRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Test",
    }),
  );

  // 任意の値
  expect(mockRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({
      id: expect.any(String),
      createdAt: expect.any(Date),
    }),
  );

  // 配列マッチャー
  expect(mockRepository.save).toHaveBeenCalledWith(
    expect.objectContaining({
      tags: expect.arrayContaining(["user", "new"]),
    }),
  );
});
```

### 呼び出し順序の検証

```typescript
it("should call in correct order", async () => {
  await service.processOrder(orderId);

  // 呼び出し履歴を取得
  const calls = mockRepository.save.mock.calls;

  // 順序を検証
  expect(calls[0][0].status).toBe("processing");
  expect(calls[1][0].status).toBe("completed");
});
```

## エラーハンドリング

### エラーをスロー

```typescript
it("should handle repository error", async () => {
  mockRepository.findById.mockRejectedValue(new Error("DB Error"));

  await expect(service.getUser("user-1")).rejects.toThrow("DB Error");
});
```

### 条件付きエラー

```typescript
mockRepository.findById.mockImplementation(async (id) => {
  if (id === "invalid") {
    throw new NotFoundError("User not found");
  }
  return { id, name: "Test" };
});
```

## リセットパターン

### 各テスト前にリセット

```typescript
describe("UserService", () => {
  beforeEach(() => {
    // 呼び出し履歴をクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Mock実装もリセット
    vi.resetAllMocks();
  });

  afterAll(() => {
    // 元の実装に戻す
    vi.restoreAllMocks();
  });
});
```

### 個別リセット

```typescript
beforeEach(() => {
  mockRepository.findById.mockClear();
  mockRepository.save.mockReset();
});
```

## 高度なパターン

### 実装のMock

```typescript
mockRepository.findById.mockImplementation(async (id) => {
  // カスタムロジック
  if (id.startsWith("admin-")) {
    return { id, role: "admin" };
  }
  return { id, role: "user" };
});
```

### Spyパターン

```typescript
import { myModule } from "./myModule";

// 実際の実装をSpyする
const spy = vi.spyOn(myModule, "calculate");

it("should call calculate", () => {
  myModule.process(5);
  expect(spy).toHaveBeenCalledWith(5);
  expect(spy).toHaveReturnedWith(25); // 実際の戻り値を検証
});
```

### 部分Mock

```typescript
// オリジナルを保持しつつ一部をMock
const originalMethod = service.validate.bind(service);

vi.spyOn(service, "validate").mockImplementation((input) => {
  if (input.skipValidation) {
    return true;
  }
  return originalMethod(input);
});
```

## アンチパターン

### ❌ 過度な検証

```typescript
// 悪い例：すべてを検証
it("should process order", async () => {
  await service.processOrder(order);

  expect(mockRepo.findById).toHaveBeenCalled();
  expect(mockRepo.save).toHaveBeenCalled();
  expect(mockLogger.log).toHaveBeenCalled();
  expect(mockMetrics.increment).toHaveBeenCalled();
  // 実装の詳細に密結合
});

// 良い例：重要な振る舞いのみ
it("should save processed order", async () => {
  await service.processOrder(order);

  expect(mockRepo.save).toHaveBeenCalledWith(
    expect.objectContaining({ status: "processed" }),
  );
});
```

### ❌ テストの脆弱性

```typescript
// 悪い例：厳密すぎる
expect(mockFn).toHaveBeenCalledWith({
  id: "user-1",
  name: "Test",
  email: "test@example.com",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
});

// 良い例：重要な部分のみ
expect(mockFn).toHaveBeenCalledWith(
  expect.objectContaining({ id: "user-1", name: "Test" }),
);
```

## チェックリスト

### Mock作成時

- [ ] 最小限の依存のみMockしているか？
- [ ] 戻り値は適切に設定されているか？
- [ ] エラーケースは考慮されているか？

### Mock検証時

- [ ] 重要な振る舞いのみ検証しているか？
- [ ] 実装詳細に密結合していないか？
- [ ] マッチャーは適切な粒度か？
