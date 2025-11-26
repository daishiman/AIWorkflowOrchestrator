# Stubパターン

## 概要

Stubは事前に設定された応答を返すテストダブルです。
テスト対象への入力を制御し、特定の条件下での動作をテストします。

## 基本パターン

### 固定値を返すStub

```typescript
// 最もシンプルなStub
const stubRepository = {
  findById: vi.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Test User',
  }),
};
```

### 条件付きStub

```typescript
// 入力に応じた値を返す
const stubRepository = {
  findById: vi.fn().mockImplementation(async (id) => {
    const users = {
      'user-1': { id: 'user-1', name: 'Alice' },
      'user-2': { id: 'user-2', name: 'Bob' },
    };
    return users[id] || null;
  }),
};
```

### 連続的なStub

```typescript
// 呼び出しごとに異なる値
const stubApi = {
  fetch: vi.fn()
    .mockResolvedValueOnce({ page: 1, hasMore: true })
    .mockResolvedValueOnce({ page: 2, hasMore: true })
    .mockResolvedValueOnce({ page: 3, hasMore: false }),
};
```

## ユースケース別パターン

### 成功ケース

```typescript
describe('成功ケース', () => {
  const stubRepository = {
    findById: vi.fn().mockResolvedValue({ id: '1', name: 'Test' }),
    save: vi.fn().mockResolvedValue(undefined),
  };

  it('should return user', async () => {
    const service = new UserService(stubRepository);
    const user = await service.getUser('1');
    expect(user.name).toBe('Test');
  });
});
```

### エラーケース

```typescript
describe('エラーケース', () => {
  const stubRepository = {
    findById: vi.fn().mockResolvedValue(null),
  };

  it('should throw when user not found', async () => {
    const service = new UserService(stubRepository);
    await expect(service.getUser('unknown')).rejects.toThrow('User not found');
  });
});
```

### 例外ケース

```typescript
describe('例外ケース', () => {
  const stubRepository = {
    findById: vi.fn().mockRejectedValue(new Error('DB connection failed')),
  };

  it('should handle database error', async () => {
    const service = new UserService(stubRepository);
    await expect(service.getUser('1')).rejects.toThrow('DB connection failed');
  });
});
```

### 遅延レスポンス

```typescript
// タイムアウトテスト用
const stubSlowApi = {
  fetch: vi.fn().mockImplementation(() =>
    new Promise(resolve => setTimeout(() => resolve({ data: 'slow' }), 5000))
  ),
};

it('should timeout on slow response', async () => {
  vi.useFakeTimers();
  const service = new ApiService(stubSlowApi, { timeout: 3000 });

  const promise = service.fetchData();
  vi.advanceTimersByTime(3000);

  await expect(promise).rejects.toThrow('Timeout');
  vi.useRealTimers();
});
```

## 外部サービスのStub

### HTTP APIのStub

```typescript
const stubHttpClient = {
  get: vi.fn().mockResolvedValue({
    status: 200,
    data: { users: [{ id: '1', name: 'Test' }] },
  }),
  post: vi.fn().mockResolvedValue({
    status: 201,
    data: { id: 'new-1' },
  }),
};
```

### 認証サービスのStub

```typescript
const stubAuthService = {
  verifyToken: vi.fn().mockResolvedValue({
    valid: true,
    userId: 'user-1',
    permissions: ['read', 'write'],
  }),
  refreshToken: vi.fn().mockResolvedValue({
    token: 'new-token',
    expiresIn: 3600,
  }),
};
```

### 外部APIのStub

```typescript
const stubPaymentGateway = {
  charge: vi.fn().mockResolvedValue({
    success: true,
    transactionId: 'txn-123',
    amount: 1000,
  }),
  refund: vi.fn().mockResolvedValue({
    success: true,
    refundId: 'ref-123',
  }),
};
```

## 状態を持つStub

```typescript
// 呼び出し回数で動作を変える
function createRetryStub() {
  let callCount = 0;

  return {
    fetch: vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error('Temporary failure');
      }
      return { success: true };
    }),
    reset: () => { callCount = 0; },
  };
}

it('should succeed after retries', async () => {
  const stub = createRetryStub();
  const service = new RetryService(stub, { maxRetries: 3 });

  const result = await service.fetchWithRetry();

  expect(result.success).toBe(true);
  expect(stub.fetch).toHaveBeenCalledTimes(3);
});
```

## ファクトリパターン

```typescript
// Stubファクトリ
function createUserStub(overrides = {}) {
  return {
    id: 'user-1',
    name: 'Default User',
    email: 'default@example.com',
    createdAt: new Date('2025-01-01'),
    ...overrides,
  };
}

function createRepositoryStub(users = [createUserStub()]) {
  const userMap = new Map(users.map(u => [u.id, u]));

  return {
    findById: vi.fn().mockImplementation(async (id) => userMap.get(id) || null),
    findAll: vi.fn().mockResolvedValue(users),
    save: vi.fn().mockImplementation(async (user) => {
      userMap.set(user.id, user);
      return user;
    }),
  };
}

// 使用例
it('should find admin user', async () => {
  const adminUser = createUserStub({ id: 'admin', role: 'admin' });
  const repo = createRepositoryStub([adminUser]);

  const service = new UserService(repo);
  const user = await service.getUser('admin');

  expect(user.role).toBe('admin');
});
```

## ビルダーパターン

```typescript
class StubBuilder {
  private responses: Map<string, any> = new Map();
  private errors: Map<string, Error> = new Map();

  withUser(id: string, user: Partial<User>) {
    this.responses.set(id, { id, name: 'Default', ...user });
    return this;
  }

  withError(id: string, error: Error) {
    this.errors.set(id, error);
    return this;
  }

  build() {
    return {
      findById: vi.fn().mockImplementation(async (id) => {
        if (this.errors.has(id)) {
          throw this.errors.get(id);
        }
        return this.responses.get(id) || null;
      }),
    };
  }
}

// 使用例
const stub = new StubBuilder()
  .withUser('user-1', { name: 'Alice' })
  .withUser('user-2', { name: 'Bob' })
  .withError('error-user', new Error('Not found'))
  .build();
```

## チェックリスト

### Stub設計時

- [ ] 必要な応答パターンは網羅されているか？
- [ ] エラーケースは考慮されているか？
- [ ] 境界値のテストは可能か？

### Stub使用時

- [ ] テストの意図が明確か？
- [ ] Stubの設定は最小限か？
- [ ] 状態検証が適切に行われているか？
