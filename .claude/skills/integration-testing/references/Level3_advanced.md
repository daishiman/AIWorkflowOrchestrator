# Level 3: 高度な統合テスト

## 目的

コントラクトテスト、並列実行、分散システムテスト、CI/CD統合の高度な手法を習得する。

## コントラクトテスト（Contract Testing）

### コンシューマー駆動契約テスト（Consumer-Driven Contract Testing）

サービス間の契約を明確にし、コンシューマーとプロバイダーが独立してテストできるようにする。

#### Pactを使用したコントラクトテスト

```typescript
// consumer-test.spec.ts (コンシューマー側)
import { pactWith } from "jest-pact";
import { Matchers } from "@pact-foundation/pact";
import { userService } from "./user-service";

pactWith({ consumer: "UserApp", provider: "UserAPI" }, (interaction) => {
  interaction("get user by ID", ({ provider, execute }) => {
    beforeEach(() =>
      provider
        .given("user 1 exists")
        .uponReceiving("a request for user 1")
        .withRequest({
          method: "GET",
          path: "/users/1",
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: {
            id: Matchers.integer(1),
            name: Matchers.string("Alice"),
            email: Matchers.email("alice@example.com"),
          },
        }),
    );

    execute("should return user data", async (mockServer) => {
      const user = await userService.getUser(mockServer.url, 1);

      expect(user.id).toBe(1);
      expect(user.name).toBe("Alice");
    });
  });
});
```

```typescript
// provider-test.spec.ts (プロバイダー側)
import { Verifier } from "@pact-foundation/pact";
import { app } from "./app";

describe("Pact Verification", () => {
  it("should validate the expectations of UserApp", () => {
    return new Verifier({
      provider: "UserAPI",
      providerBaseUrl: "http://localhost:3000",
      pactUrls: ["./pacts/userapp-userapi.json"],
      stateHandlers: {
        "user 1 exists": async () => {
          // プロバイダーの状態をセットアップ
          await db
            .insert(users)
            .values({ id: 1, name: "Alice", email: "alice@example.com" });
        },
      },
    }).verifyProvider();
  });
});
```

### スキーマベース契約テスト

OpenAPI仕様に基づいて契約を検証。

```typescript
import { OpenAPIValidator } from "express-openapi-validator";
import request from "supertest";
import { app } from "./app";

describe("OpenAPI Contract Tests", () => {
  it("should comply with OpenAPI spec", async () => {
    app.use(
      OpenAPIValidator.middleware({
        apiSpec: "./openapi.yaml",
        validateRequests: true,
        validateResponses: true,
      }),
    );

    const response = await request(app).get("/api/users/1").expect(200);

    // OpenAPI仕様に準拠したレスポンスが返される
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  });
});
```

## 並列実行とパフォーマンス最適化

### テストの並列化

#### Vitestの並列実行

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 並列実行を有効化
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
    // テスト分離を強化
    isolate: true,
    // 各テストファイルごとに環境をリセット
    clearMocks: true,
  },
});
```

#### データベース分離戦略

並列実行時にデータ競合を回避するため、各テストワーカーに独立したデータベースを割り当てる。

```typescript
// test-setup.ts
import { beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const workerId = process.env.VITEST_WORKER_ID || "0";
const testDbName = `test_db_${workerId}`;

let client;
let db;

beforeAll(async () => {
  // ワーカーごとに独立したDBを作成
  const adminClient = postgres("postgres://localhost/postgres");
  await adminClient`DROP DATABASE IF EXISTS ${postgres(testDbName)}`;
  await adminClient`CREATE DATABASE ${postgres(testDbName)}`;
  await adminClient.end();

  client = postgres(`postgres://localhost/${testDbName}`);
  db = drizzle(client);

  // マイグレーション実行
  await runMigrations(db);
});

afterAll(async () => {
  await client.end();
});

export { db };
```

### テスト実行時間の最適化

#### 遅いテストの特定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // 遅いテストを報告
    slowTestThreshold: 3000, // 3秒以上のテストを警告
    reporters: ["default", "json"],
    outputFile: "./test-results/results.json",
  },
});
```

#### テストデータのキャッシング

```typescript
import { beforeAll, describe, it, expect } from "vitest";

describe("User integration tests", () => {
  let cachedUsers;

  beforeAll(async () => {
    // 共通テストデータを一度だけ作成
    cachedUsers = await Promise.all([
      db.insert(users).values({ name: "Alice" }).returning(),
      db.insert(users).values({ name: "Bob" }).returning(),
      db.insert(users).values({ name: "Charlie" }).returning(),
    ]);
  });

  it("should find Alice", async () => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, cachedUsers[0][0].id));
    expect(user[0].name).toBe("Alice");
  });

  it("should find Bob", async () => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, cachedUsers[1][0].id));
    expect(user[0].name).toBe("Bob");
  });
});
```

## 分散システムテスト

### マイクロサービス統合テスト

#### Testcontainersを使用した環境構築

```typescript
import { GenericContainer, Wait } from "testcontainers";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

describe("Microservices integration", () => {
  let postgresContainer;
  let redisContainer;
  let db;
  let redis;

  beforeAll(async () => {
    // PostgreSQLコンテナ起動
    postgresContainer = await new GenericContainer("postgres:16")
      .withExposedPorts(5432)
      .withEnvironment({ POSTGRES_PASSWORD: "test" })
      .withWaitStrategy(
        Wait.forLogMessage("database system is ready to accept connections"),
      )
      .start();

    // Redisコンテナ起動
    redisContainer = await new GenericContainer("redis:7")
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
      .start();

    const dbUrl = `postgres://postgres:test@localhost:${postgresContainer.getMappedPort(5432)}/postgres`;
    db = drizzle(postgres(dbUrl));

    const redisUrl = `redis://localhost:${redisContainer.getMappedPort(6379)}`;
    redis = createClient({ url: redisUrl });
    await redis.connect();
  }, 30000);

  afterAll(async () => {
    await redis.quit();
    await postgresContainer.stop();
    await redisContainer.stop();
  });

  it("should integrate database and cache", async () => {
    // DBにデータを保存
    const user = await db.insert(users).values({ name: "Alice" }).returning();

    // キャッシュに保存
    await redis.set(`user:${user[0].id}`, JSON.stringify(user[0]));

    // キャッシュから取得
    const cached = await redis.get(`user:${user[0].id}`);
    expect(JSON.parse(cached).name).toBe("Alice");
  });
});
```

### サービス間通信のテスト

#### メッセージキュー統合

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import amqp from "amqplib";

describe("RabbitMQ integration", () => {
  let connection;
  let channel;

  beforeAll(async () => {
    connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue("test-queue");
  });

  afterAll(async () => {
    await channel.close();
    await connection.close();
  });

  it("should send and receive messages", async () => {
    const message = { userId: 1, action: "created" };

    // メッセージ送信
    channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(message)));

    // メッセージ受信
    const receivedMessage = await new Promise((resolve) => {
      channel.consume("test-queue", (msg) => {
        resolve(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      });
    });

    expect(receivedMessage).toEqual(message);
  });
});
```

## CI/CD統合

### GitHub Actionsでの統合テスト

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm db:migrate
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        if: always()
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### テスト結果のレポーティング

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/*.test.ts"],
    },
    reporters: ["default", "html", "json"],
    outputFile: {
      json: "./test-results/results.json",
      html: "./test-results/index.html",
    },
  },
});
```

## 次のステップ

Level3の理解ができたら、次のレベルへ進みましょう：

- **Level4**: パフォーマンス最適化、高度なパターン、エンタープライズアーキテクチャ
