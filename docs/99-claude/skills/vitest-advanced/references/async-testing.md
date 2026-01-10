# 非同期テスト

## 概要

Vitestでの非同期コードのテストパターンを解説します。
Promise、async/await、タイマー、イベントのテストを扱います。

---

## async/await

### 基本パターン

```typescript
import { describe, it, expect } from "vitest";

it("should fetch user data", async () => {
  const user = await userService.getUser("1");
  expect(user).toEqual({ id: "1", name: "Test" });
});

// 明示的なawait
it("should process order", async () => {
  const result = await orderService.process(orderData);
  expect(result.status).toBe("completed");
});
```

### 複数の非同期操作

```typescript
it("should process multiple operations", async () => {
  // 順次実行
  const user = await userService.create(userData);
  const order = await orderService.create(user.id, orderData);
  expect(order.userId).toBe(user.id);

  // 並行実行
  const [users, orders] = await Promise.all([
    userService.getAll(),
    orderService.getAll(),
  ]);
  expect(users).toHaveLength(1);
  expect(orders).toHaveLength(1);
});
```

---

## resolves/rejects

### Promiseの成功を検証

```typescript
it("should resolve with data", async () => {
  await expect(fetchData()).resolves.toEqual({ data: "value" });
});

it("should resolve to truthy", async () => {
  await expect(checkStatus()).resolves.toBeTruthy();
});

// チェーン
it("should resolve with specific property", async () => {
  await expect(getUser("1")).resolves.toHaveProperty("id", "1");
});
```

### Promiseの失敗を検証

```typescript
it("should reject with error", async () => {
  await expect(failingFn()).rejects.toThrow("Error message");
});

it("should reject with specific error type", async () => {
  await expect(fetchInvalidUser()).rejects.toBeInstanceOf(NotFoundError);
});

it("should reject with error containing message", async () => {
  await expect(invalidOperation()).rejects.toThrow(/invalid/i);
});
```

---

## タイマーのテスト

### Fake Timers

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Timer tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call callback after delay", () => {
    const callback = vi.fn();
    setTimeout(callback, 1000);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

### タイマー操作

```typescript
// 指定時間を進める
vi.advanceTimersByTime(1000); // 1秒進める

// 次のタイマーまで進める
vi.advanceTimersToNextTimer();

// すべてのタイマーを実行
vi.runAllTimers();

// 保留中のタイマーをすべて実行
vi.runOnlyPendingTimers();

// 現在時刻を設定
vi.setSystemTime(new Date("2025-01-01"));
```

### Debounce/Throttleのテスト

```typescript
it("should debounce function calls", () => {
  const callback = vi.fn();
  const debounced = debounce(callback, 300);

  debounced();
  debounced();
  debounced();

  expect(callback).not.toHaveBeenCalled();

  vi.advanceTimersByTime(300);

  expect(callback).toHaveBeenCalledTimes(1);
});
```

### setIntervalのテスト

```typescript
it("should poll at intervals", () => {
  const poller = vi.fn();
  setInterval(poller, 100);

  vi.advanceTimersByTime(350);

  expect(poller).toHaveBeenCalledTimes(3);
});
```

---

## 日付のテスト

### システム時刻の設定

```typescript
it("should use current date", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-06-15T10:00:00"));

  const result = service.getFormattedDate();
  expect(result).toBe("2025-06-15");

  vi.useRealTimers();
});
```

### Date.nowのMock

```typescript
it("should generate timestamp", () => {
  vi.useFakeTimers();
  vi.setSystemTime(1735689600000); // 2025-01-01

  const record = createRecord();
  expect(record.createdAt).toBe(1735689600000);

  vi.useRealTimers();
});
```

---

## タイムアウトの設定

### テストタイムアウト

```typescript
// 個別のテスト
it("long running test", async () => {
  // ...
}, 10000); // 10秒のタイムアウト

// describeレベル
describe("Integration tests", { timeout: 30000 }, () => {
  // ...
});
```

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    testTimeout: 5000, // デフォルト5秒
    hookTimeout: 10000, // フックのタイムアウト
  },
});
```

---

## イベントのテスト

### EventEmitterのテスト

```typescript
import { EventEmitter } from "events";

it("should emit event", () => {
  const emitter = new EventEmitter();
  const listener = vi.fn();

  emitter.on("data", listener);
  emitter.emit("data", { value: 42 });

  expect(listener).toHaveBeenCalledWith({ value: 42 });
});
```

### 非同期イベントのテスト

```typescript
it("should wait for event", async () => {
  const emitter = new EventEmitter();

  const eventPromise = new Promise((resolve) => {
    emitter.once("complete", resolve);
  });

  // 非同期でイベント発火
  setTimeout(() => emitter.emit("complete", "done"), 100);

  vi.advanceTimersByTime(100);

  await expect(eventPromise).resolves.toBe("done");
});
```

---

## 再試行パターン

### 不安定なテストの再試行

```typescript
// 個別テスト
it("flaky test", { retry: 3 }, async () => {
  // 最大3回再試行
});

// vitest.config.ts
export default defineConfig({
  test: {
    retry: 2, // 全テストで2回再試行
  },
});
```

---

## アンチパターン

### ❌ awaitの忘れ

```typescript
// 悪い例：Promiseがテストされない
it("should fetch data", () => {
  expect(fetchData()).toBeDefined(); // Promiseオブジェクトを検証
});

// 良い例
it("should fetch data", async () => {
  expect(await fetchData()).toBeDefined();
});
```

### ❌ タイマーリセット忘れ

```typescript
// 悪い例
it("timer test", () => {
  vi.useFakeTimers();
  // テスト
  // vi.useRealTimers()を忘れている
});

// 良い例：afterEachでリセット
afterEach(() => {
  vi.useRealTimers();
});
```

### ❌ 不適切なタイムアウト

```typescript
// 悪い例：長すぎるタイムアウト
it("should respond quickly", async () => {
  await expect(fastOperation()).resolves.toBeDefined();
}, 60000); // 60秒は長すぎる

// 良い例
it("should respond quickly", async () => {
  await expect(fastOperation()).resolves.toBeDefined();
}, 1000); // 1秒で十分
```

---

## チェックリスト

### 非同期テスト

- [ ] すべてのPromiseをawaitしているか？
- [ ] resolves/rejectsを正しく使用しているか？
- [ ] タイムアウトは適切か？

### タイマーテスト

- [ ] useFakeTimers/useRealTimersのペアは正しいか？
- [ ] afterEachでタイマーをリセットしているか？
- [ ] システム時刻は適切に管理されているか？
