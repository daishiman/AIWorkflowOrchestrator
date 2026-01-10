# CI/CD統合パターン

## GitHub Actionsでの統合テスト

### 基本設定

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

## Testcontainersによる環境構築

### PostgreSQL + Redis

```typescript
import { GenericContainer, Wait } from "testcontainers";

describe("Microservices integration", () => {
  let postgresContainer;
  let redisContainer;

  beforeAll(async () => {
    postgresContainer = await new GenericContainer("postgres:16")
      .withExposedPorts(5432)
      .withEnvironment({ POSTGRES_PASSWORD: "test" })
      .withWaitStrategy(
        Wait.forLogMessage("database system is ready to accept connections"),
      )
      .start();

    redisContainer = await new GenericContainer("redis:7")
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
      .start();

    const dbUrl = `postgres://postgres:test@localhost:${postgresContainer.getMappedPort(5432)}/postgres`;
    db = drizzle(postgres(dbUrl));
  }, 30000);

  afterAll(async () => {
    await postgresContainer.stop();
    await redisContainer.stop();
  });
});
```

## テスト結果のレポーティング

### Vitest設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // 並列実行設定
    pool: "threads",
    poolOptions: {
      threads: { maxThreads: 4 },
    },

    // 遅いテストを警告
    slowTestThreshold: 3000,

    // カバレッジ設定
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["**/*.spec.ts", "**/*.test.ts"],
    },

    // レポーター設定
    reporters: ["default", "html", "json"],
    outputFile: {
      json: "./test-results/results.json",
      html: "./test-results/index.html",
    },
  },
});
```

## メッセージキュー統合テスト

### RabbitMQ

```typescript
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
    channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(message)));

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

## パフォーマンス最適化

### テスト分離とキャッシング

```typescript
describe("User integration tests", () => {
  let cachedUsers;

  beforeAll(async () => {
    // 共通テストデータを一度だけ作成
    cachedUsers = await Promise.all([
      db.insert(users).values({ name: "Alice" }).returning(),
      db.insert(users).values({ name: "Bob" }).returning(),
    ]);
  });

  it("should find Alice", async () => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, cachedUsers[0][0].id));
    expect(user[0].name).toBe("Alice");
  });
});
```

## CI/CDベストプラクティス

### Do

- サービスコンテナでDB/Redisを起動
- ヘルスチェックで起動待機
- 環境変数で接続情報を管理
- カバレッジレポートを出力
- テスト結果をアーティファクト保存

### Don't

- 本番DBに接続
- シークレットをハードコード
- タイムアウト設定を省略
- 失敗時のクリーンアップを忘れる
