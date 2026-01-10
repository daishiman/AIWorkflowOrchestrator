# 統合テストパターン

## データベース統合テスト

### パターン1: トランザクションロールバック

各テスト後にトランザクションをロールバックし、データをクリーンな状態に戻す。

```typescript
describe("User repository", () => {
  let transaction;

  beforeEach(async () => {
    transaction = await db.transaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  it("should create user", async () => {
    const user = await transaction
      .insert(users)
      .values({ name: "Alice" })
      .returning();
    expect(user[0].name).toBe("Alice");
  });
});
```

### パターン2: テストDBの完全リセット

```typescript
async function resetDatabase() {
  await db.execute(sql`TRUNCATE TABLE users CASCADE`);
  await db.execute(sql`TRUNCATE TABLE posts CASCADE`);
}

describe("Database integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("should start with empty database", async () => {
    const users = await db.select().from(users);
    expect(users).toHaveLength(0);
  });
});
```

### パターン3: インメモリデータベース

```typescript
describe("In-memory database tests", () => {
  let db;
  let sqlite;

  beforeAll(() => {
    sqlite = new Database(":memory:");
    db = drizzle(sqlite);
    db.run(sql`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)`);
  });

  afterAll(() => {
    sqlite.close();
  });

  it("should work with in-memory db", async () => {
    await db.insert(users).values({ name: "Alice" });
    const result = await db.select().from(users);
    expect(result).toHaveLength(1);
  });
});
```

## API統合テスト

### モックサーバーを使用（MSW）

```typescript
const server = setupServer(
  rest.get("/api/users/:id", (req, res, ctx) => {
    return res(
      ctx.json({
        id: Number(req.params.id),
        name: "Mock User",
        email: "mock@example.com",
      }),
    );
  }),
);

describe("API Client with MSW", () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("should fetch mocked user data", async () => {
    const user = await apiClient.getUser(1);
    expect(user.name).toBe("Mock User");
  });
});
```

### REST APIエンドポイントのテスト

```typescript
describe("POST /api/users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("should create new user", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ name: "Alice", email: "alice@example.com" })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("Alice");
  });
});
```

## テストデータ管理

### ファクトリーパターン

```typescript
import { faker } from "@faker-js/faker";

export function createUserFactory(overrides = {}) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
    ...overrides,
  };
}

// 使用例
it("should create user with factory", async () => {
  const userData = createUserFactory({ name: "Alice" });
  const user = await db.insert(users).values(userData).returning();
  expect(user[0].name).toBe("Alice");
});
```

### フィクスチャパターン

```typescript
// fixtures/users.json
[
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// 使用例
export async function seedUsers() {
  await db.insert(users).values(usersFixture);
}
```

## コントラクトテスト

### Pactを使用したコントラクトテスト

```typescript
// コンシューマー側
pactWith({ consumer: "UserApp", provider: "UserAPI" }, (interaction) => {
  interaction("get user by ID", ({ provider, execute }) => {
    beforeEach(() =>
      provider
        .given("user 1 exists")
        .uponReceiving("a request for user 1")
        .withRequest({ method: "GET", path: "/users/1" })
        .willRespondWith({
          status: 200,
          body: {
            id: Matchers.integer(1),
            name: Matchers.string("Alice"),
          },
        }),
    );

    execute("should return user data", async (mockServer) => {
      const user = await userService.getUser(mockServer.url, 1);
      expect(user.id).toBe(1);
    });
  });
});
```

## 並列実行戦略

### ワーカーごとのDB分離

```typescript
const workerId = process.env.VITEST_WORKER_ID || "0";
const testDbName = `test_db_${workerId}`;

beforeAll(async () => {
  const adminClient = postgres("postgres://localhost/postgres");
  await adminClient`DROP DATABASE IF EXISTS ${postgres(testDbName)}`;
  await adminClient`CREATE DATABASE ${postgres(testDbName)}`;
  await adminClient.end();

  client = postgres(`postgres://localhost/${testDbName}`);
  db = drizzle(client);
  await runMigrations(db);
});
```

## 実装チェックリスト

- [ ] テストは独立して実行可能か
- [ ] テストデータのセットアップとクリーンアップが実装されているか
- [ ] トランザクション分離が適切に設定されているか
- [ ] エラーケース（4xx、5xx、タイムアウト）がテストされているか
- [ ] テストの実行時間が許容範囲内か（各テスト3秒以内）
- [ ] アサーションが明確で、失敗時のエラーメッセージが分かりやすいか
