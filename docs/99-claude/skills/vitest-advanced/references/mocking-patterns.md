# モッキングパターン

## 概要

Vitestのモッキング機能を使用した実践的なパターンを解説します。

---

## 基本的なMock

### vi.fn() - 関数のMock

```typescript
import { vi, describe, it, expect } from "vitest";

// 基本的なMock関数
const mockFn = vi.fn();
mockFn("arg1", "arg2");
expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");

// 戻り値を設定
const mockWithReturn = vi.fn().mockReturnValue("result");
expect(mockWithReturn()).toBe("result");

// 非同期の戻り値
const mockAsync = vi.fn().mockResolvedValue({ data: "value" });
expect(await mockAsync()).toEqual({ data: "value" });

// 例外をスロー
const mockError = vi.fn().mockRejectedValue(new Error("Failed"));
await expect(mockError()).rejects.toThrow("Failed");
```

### 呼び出しごとに異なる値

```typescript
const mockSequence = vi
  .fn()
  .mockReturnValueOnce("first")
  .mockReturnValueOnce("second")
  .mockReturnValue("default");

expect(mockSequence()).toBe("first");
expect(mockSequence()).toBe("second");
expect(mockSequence()).toBe("default");
expect(mockSequence()).toBe("default"); // 以降はdefault
```

### mockImplementation

```typescript
const mockFn = vi.fn().mockImplementation((x: number) => x * 2);
expect(mockFn(5)).toBe(10);

// 条件付き実装
const conditionalMock = vi.fn().mockImplementation((id: string) => {
  if (id === "admin") {
    return { role: "admin", permissions: ["all"] };
  }
  return { role: "user", permissions: ["read"] };
});
```

---

## vi.mock() - モジュールのMock

### 全体をMock

```typescript
// モジュール全体をMock
vi.mock("./userRepository", () => ({
  userRepository: {
    findById: vi.fn().mockResolvedValue({ id: "1", name: "Test" }),
    save: vi.fn().mockResolvedValue(undefined),
  },
}));

// defaultエクスポートをMock
vi.mock("./logger", () => ({
  default: vi.fn(),
}));
```

### 部分的なMock

```typescript
// オリジナルを保持しつつ一部をMock
vi.mock("./utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils")>();
  return {
    ...actual,
    formatDate: vi.fn().mockReturnValue("2025-01-01"),
    // generateIdはオリジナルを使用
  };
});
```

### 動的なMock

```typescript
// テスト内でMockを変更
import { userRepository } from "./userRepository";

vi.mock("./userRepository");

describe("UserService", () => {
  it("should handle not found", () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);
    // テスト
  });

  it("should return user", () => {
    vi.mocked(userRepository.findById).mockResolvedValue({ id: "1" });
    // テスト
  });
});
```

---

## vi.spyOn() - Spy

### 基本的なSpy

```typescript
import { myModule } from "./myModule";

// メソッドをSpy
const spy = vi.spyOn(myModule, "calculate");

myModule.calculate(5);

expect(spy).toHaveBeenCalledWith(5);
expect(spy).toHaveReturnedWith(25); // 実際の戻り値を検証
```

### SpyでMock実装

```typescript
const spy = vi
  .spyOn(myModule, "fetchData")
  .mockResolvedValue({ data: "mocked" });

const result = await myModule.fetchData();
expect(result).toEqual({ data: "mocked" });
```

### プロトタイプメソッドのSpy

```typescript
// クラスのメソッドをSpy
const spy = vi.spyOn(UserService.prototype, "validate");

const service = new UserService();
service.validate(data);

expect(spy).toHaveBeenCalledWith(data);
```

---

## Mockのリセット

### リセットの種類

| メソッド        | 効果                           |
| --------------- | ------------------------------ |
| `mockClear()`   | 呼び出し履歴をクリア           |
| `mockReset()`   | 履歴クリア + 実装をundefinedに |
| `mockRestore()` | 履歴クリア + オリジナルに戻す  |

### 使用例

```typescript
describe("UserService", () => {
  const mockFn = vi.fn().mockReturnValue("value");

  beforeEach(() => {
    // 各テスト前に呼び出し履歴をクリア
    mockFn.mockClear();
  });

  afterEach(() => {
    // 実装もリセット
    mockFn.mockReset();
  });

  afterAll(() => {
    // Spyの場合はオリジナルに戻す
    vi.restoreAllMocks();
  });
});
```

### グローバルリセット

```typescript
// 全Mockをクリア
vi.clearAllMocks();

// 全Mockをリセット
vi.resetAllMocks();

// 全Mockをリストア
vi.restoreAllMocks();

// モジュールMockをリセット
vi.resetModules();
```

---

## 高度なパターン

### 型安全なMock

```typescript
import type { UserRepository } from "./types";

// 型を維持したMock
const mockRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

// vi.mocked()でモック型を推論
const mockedFn = vi.mocked(originalFn);
mockedFn.mockReturnValue("typed result");
```

### ファクトリ関数

```typescript
// テストごとにクリーンなMockを生成
function createMockRepository() {
  return {
    findById: vi.fn().mockResolvedValue({ id: "1", name: "Test" }),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe("UserService", () => {
  let mockRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
  });
});
```

### 依存の自動Mock

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    deps: {
      // 特定のモジュールを自動Mock
      interopDefault: true,
    },
  },
});
```

---

## アンチパターン

### ❌ 過度なMock

```typescript
// 悪い例：すべてをMock
it("should process order", async () => {
  vi.mock("./logger");
  vi.mock("./metrics");
  vi.mock("./validator");
  vi.mock("./repository");
  vi.mock("./notifier");
  // 本当にテストしているのは何？
});

// 良い例：必要な依存のみMock
it("should save processed order", async () => {
  const mockRepository = { save: vi.fn() };
  const service = new OrderService(mockRepository);
  // ...
});
```

### ❌ 実装詳細へのMock

```typescript
// 悪い例：プライベートメソッドをMock
vi.spyOn(service, "privateMethod");

// 良い例：公開インターフェースをテスト
expect(service.publicMethod()).toBe(expected);
```

### ❌ Mock忘れのリセット

```typescript
// 悪い例：リセットなし
describe("Tests", () => {
  const mockFn = vi.fn().mockReturnValue("value");

  it("test 1", () => {
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1); // OK
  });

  it("test 2", () => {
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1); // 失敗！2回呼ばれている
  });
});

// 良い例：beforeEachでリセット
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## チェックリスト

### Mock作成時

- [ ] 最小限の依存のみMockしているか？
- [ ] 型安全性は維持されているか？
- [ ] 戻り値は適切に設定されているか？

### Mock検証時

- [ ] 重要な振る舞いのみ検証しているか？
- [ ] 実装詳細に依存していないか？
- [ ] 適切なマッチャーを使用しているか？

### Mock管理

- [ ] 各テスト前にリセットしているか？
- [ ] afterAllでリストアしているか？
- [ ] テスト間で状態が漏れていないか？
