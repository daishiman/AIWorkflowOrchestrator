# Fakeパターン

## 概要

Fakeは本物のオブジェクトの簡略化された実装です。
実際に動作するロジックを持ち、本番とは異なる簡易実装を提供します。

## 特徴

- 実際に動作するロジック
- 状態を保持
- 本番より高速
- 統合テストに適する

## 代表的なFake

### インメモリリポジトリ

```typescript
class FakeUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (
      Array.from(this.users.values()).find((u) => u.email === email) || null
    );
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, { ...user });
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  // テストヘルパー
  seed(users: User[]): void {
    users.forEach((user) => this.users.set(user.id, user));
  }

  clear(): void {
    this.users.clear();
  }

  count(): number {
    return this.users.size;
  }
}
```

### インメモリキャッシュ

```typescript
class FakeCache implements ICache {
  private store: Map<string, { value: any; expiresAt: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  // テストヘルパー
  getAll(): Map<string, any> {
    return new Map(
      Array.from(this.store.entries())
        .filter(([_, v]) => Date.now() <= v.expiresAt)
        .map(([k, v]) => [k, v.value]),
    );
  }
}
```

### ファイルシステム

```typescript
class FakeFileSystem implements IFileSystem {
  private files: Map<string, { content: string; metadata: FileMetadata }> =
    new Map();

  async readFile(path: string): Promise<string> {
    const file = this.files.get(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    return file.content;
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, {
      content,
      metadata: {
        size: content.length,
        createdAt: this.files.get(path)?.metadata.createdAt || new Date(),
        modifiedAt: new Date(),
      },
    });
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async delete(path: string): Promise<void> {
    this.files.delete(path);
  }

  async listFiles(directory: string): Promise<string[]> {
    return Array.from(this.files.keys()).filter((path) =>
      path.startsWith(directory),
    );
  }

  // テストヘルパー
  seed(files: Record<string, string>): void {
    Object.entries(files).forEach(([path, content]) => {
      this.files.set(path, {
        content,
        metadata: {
          size: content.length,
          createdAt: new Date(),
          modifiedAt: new Date(),
        },
      });
    });
  }
}
```

### イベントバス

```typescript
class FakeEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: any) => void>> = new Map();
  private publishedEvents: Array<{ type: string; payload: any }> = [];

  subscribe<T>(eventType: string, handler: (event: T) => void): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish<T>(eventType: string, payload: T): Promise<void> {
    this.publishedEvents.push({ type: eventType, payload });

    const handlers = this.handlers.get(eventType) || [];
    await Promise.all(handlers.map((handler) => handler(payload)));
  }

  // テストヘルパー
  getPublishedEvents(): Array<{ type: string; payload: any }> {
    return [...this.publishedEvents];
  }

  getEventsOfType<T>(type: string): T[] {
    return this.publishedEvents
      .filter((e) => e.type === type)
      .map((e) => e.payload as T);
  }

  clearEvents(): void {
    this.publishedEvents = [];
  }
}
```

## 使用例

### 統合テスト

```typescript
describe("OrderService Integration", () => {
  let orderService: OrderService;
  let fakeOrderRepo: FakeOrderRepository;
  let fakeUserRepo: FakeUserRepository;
  let fakeEventBus: FakeEventBus;

  beforeEach(() => {
    fakeOrderRepo = new FakeOrderRepository();
    fakeUserRepo = new FakeUserRepository();
    fakeEventBus = new FakeEventBus();

    orderService = new OrderService(fakeOrderRepo, fakeUserRepo, fakeEventBus);

    // テストデータを設定
    fakeUserRepo.seed([{ id: "user-1", name: "Alice", tier: "gold" }]);
  });

  afterEach(() => {
    fakeOrderRepo.clear();
    fakeUserRepo.clear();
    fakeEventBus.clearEvents();
  });

  it("should create order and publish event", async () => {
    const result = await orderService.createOrder({
      userId: "user-1",
      items: [{ productId: "prod-1", quantity: 2 }],
    });

    // 状態検証
    const savedOrder = await fakeOrderRepo.findById(result.orderId);
    expect(savedOrder).not.toBeNull();
    expect(savedOrder.status).toBe("pending");

    // イベント検証
    const events =
      fakeEventBus.getEventsOfType<OrderCreatedEvent>("order.created");
    expect(events).toHaveLength(1);
    expect(events[0].orderId).toBe(result.orderId);
  });

  it("should apply gold tier discount", async () => {
    const result = await orderService.createOrder({
      userId: "user-1",
      items: [{ productId: "prod-1", quantity: 1, price: 1000 }],
    });

    const order = await fakeOrderRepo.findById(result.orderId);
    expect(order.discount).toBe(150); // 15% gold discount
  });
});
```

### シナリオテスト

```typescript
describe("User Registration Flow", () => {
  let userService: UserService;
  let fakeUserRepo: FakeUserRepository;
  let fakeEmailService: FakeEmailService;

  beforeEach(() => {
    fakeUserRepo = new FakeUserRepository();
    fakeEmailService = new FakeEmailService();
    userService = new UserService(fakeUserRepo, fakeEmailService);
  });

  it("should complete registration flow", async () => {
    // ユーザー登録
    const user = await userService.register({
      email: "new@example.com",
      name: "New User",
    });

    expect(user.status).toBe("pending_verification");

    // メール確認
    const sentEmails = fakeEmailService.getSentEmails();
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe("new@example.com");
    expect(sentEmails[0].type).toBe("verification");

    // トークンを取得して検証
    const verificationToken = sentEmails[0].token;
    await userService.verifyEmail(verificationToken);

    // 状態を確認
    const verifiedUser = await fakeUserRepo.findById(user.id);
    expect(verifiedUser.status).toBe("active");
  });
});
```

## Fake vs Stub

| 観点   | Fake       | Stub         |
| ------ | ---------- | ------------ |
| 実装   | 本物に近い | 固定値を返す |
| 状態   | 保持する   | 保持しない   |
| 用途   | 統合テスト | 単体テスト   |
| 複雑さ | 高い       | 低い         |
| 保守   | 必要       | 不要         |

## チェックリスト

### Fake設計時

- [ ] 本番と同じインターフェースを実装しているか？
- [ ] 必要な機能のみ実装しているか？
- [ ] テストヘルパーメソッドは用意されているか？
- [ ] クリーンアップ方法は明確か？

### Fake使用時

- [ ] 各テスト前に状態がクリアされているか？
- [ ] テストデータは適切にセットアップされているか？
- [ ] 状態検証は適切に行われているか？
