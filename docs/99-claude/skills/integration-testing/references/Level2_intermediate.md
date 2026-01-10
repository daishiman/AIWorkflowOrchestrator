# Level 2: 中級統合テスト

## 目的

データベース統合、API統合、テストデータ管理の実践的なパターンを習得する。

## データベース統合テスト

### テストデータベースのセットアップ

#### パターン1: トランザクションロールバック

各テスト後にトランザクションをロールバックし、データをクリーンな状態に戻す。

```typescript
import { beforeEach, afterEach, describe, it, expect } from "vitest";
import { db } from "./db";

describe("User repository", () => {
  let transaction;

  beforeEach(async () => {
    // トランザクション開始
    transaction = await db.transaction();
  });

  afterEach(async () => {
    // ロールバック
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

#### パターン2: テストDBの完全リセット

各テスト前にデータベースを完全にクリアする。

```typescript
import { beforeEach, describe, it, expect } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "./db";

async function resetDatabase() {
  // すべてのテーブルをTRUNCATE
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

#### パターン3: インメモリデータベース

テスト用に高速なインメモリDBを使用。

```typescript
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

describe("In-memory database tests", () => {
  let db;
  let sqlite;

  beforeAll(() => {
    sqlite = new Database(":memory:");
    db = drizzle(sqlite);
    // スキーマを作成
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

### HTTPクライアントのテスト

#### パターン1: 実APIへのリクエスト

```typescript
import { describe, it, expect } from "vitest";
import { apiClient } from "./api-client";

describe("API Client", () => {
  it("should fetch user data", async () => {
    const user = await apiClient.getUser(1);

    expect(user.id).toBe(1);
    expect(user.name).toBeDefined();
    expect(user.email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
  });

  it("should handle 404 errors", async () => {
    await expect(apiClient.getUser(999999)).rejects.toThrow("User not found");
  });
});
```

#### パターン2: モックサーバーを使用

外部APIをモックし、テストの独立性を確保。

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { apiClient } from "./api-client";

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
    expect(user.email).toBe("mock@example.com");
  });
});
```

### REST APIエンドポイントのテスト

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app";
import { resetDatabase } from "./test-helpers";

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

  it("should return 400 for invalid email", async () => {
    await request(app)
      .post("/api/users")
      .send({ name: "Bob", email: "invalid-email" })
      .expect(400);
  });
});
```

## テストデータ管理

### ファクトリーパターン

テストデータを一貫して生成するためのファクトリー関数。

```typescript
// test-factories.ts
import { faker } from "@faker-js/faker";

export function createUserFactory(overrides = {}) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 18, max: 80 }),
    ...overrides,
  };
}

export function createPostFactory(overrides = {}) {
  return {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    authorId: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  };
}

// テストでの使用
describe("User tests", () => {
  it("should create user with factory", async () => {
    const userData = createUserFactory({ name: "Alice" });
    const user = await db.insert(users).values(userData).returning();

    expect(user[0].name).toBe("Alice");
    expect(user[0].email).toMatch(/@/);
  });
});
```

### フィクスチャパターン

固定的なテストデータをファイルで管理。

```typescript
// fixtures/users.json
[
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// test-helpers.ts
import usersFixture from "./fixtures/users.json";

export async function seedUsers() {
  await db.insert(users).values(usersFixture);
}

// テストでの使用
describe("User repository", () => {
  beforeEach(async () => {
    await seedUsers();
  });

  it("should find user by id", async () => {
    const user = await userRepository.findById(1);
    expect(user.name).toBe("Alice");
  });
});
```

## トランザクション管理

### 分離レベルの設定

```typescript
import { describe, it, expect } from "vitest";
import { db } from "./db";
import { sql } from "drizzle-orm";

describe("Transaction isolation", () => {
  it("should prevent dirty reads", async () => {
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET TRANSACTION ISOLATION LEVEL READ COMMITTED`);

      await tx.insert(users).values({ name: "Alice" });

      // 別のトランザクションからは見えない
      const usersInOtherTx = await db.select().from(users);
      expect(usersInOtherTx).toHaveLength(0);
    });
  });
});
```

### デッドロック回避

```typescript
describe("Deadlock prevention", () => {
  it("should acquire locks in consistent order", async () => {
    await db.transaction(async (tx) => {
      // 常にIDの昇順でロックを取得
      await tx.select().from(users).where(eq(users.id, 1)).for("update");
      await tx.select().from(users).where(eq(users.id, 2)).for("update");

      // 更新処理
      await tx.update(users).set({ balance: 100 }).where(eq(users.id, 1));
      await tx.update(users).set({ balance: 200 }).where(eq(users.id, 2));
    });
  });
});
```

## 実装チェックリスト

統合テスト実装時に確認すべき項目：

- [ ] テストは独立して実行可能か
- [ ] テストデータのセットアップとクリーンアップが実装されているか
- [ ] トランザクション分離が適切に設定されているか
- [ ] エラーケース（4xx、5xx、タイムアウト）がテストされているか
- [ ] テストの実行時間が許容範囲内か（各テスト3秒以内）
- [ ] アサーションが明確で、失敗時のエラーメッセージが分かりやすいか
- [ ] 外部依存（DB、API）が制御されているか
- [ ] テストコードが読みやすく、意図が明確か

## 次のステップ

Level2の理解ができたら、次のレベルへ進みましょう：

- **Level3**: コントラクトテスト、並列実行、分散システムテスト
- **Level4**: パフォーマンス最適化、高度なパターン、アーキテクチャ
