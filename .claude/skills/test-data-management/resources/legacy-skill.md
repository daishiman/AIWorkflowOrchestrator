---
name: .claude/skills/test-data-management/SKILL.md
description: |
  E2Eテストのためのテストデータ管理戦略。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/test-data-management/resources/cleanup-patterns.md`: Cleanup Patternsリソース
  - `.claude/skills/test-data-management/resources/data-isolation-techniques.md`: Data Isolation Techniquesリソース
  - `.claude/skills/test-data-management/resources/seeding-strategies.md`: Seeding Strategiesリソース

  - `.claude/skills/test-data-management/templates/fixture-template.ts`: Fixtureテンプレート

  - `.claude/skills/test-data-management/scripts/generate-test-data.mjs`: Generate Test Dataスクリプト

version: 1.0.0
---

# Test Data Management Skill

## 概要

E2E テストのためのテストデータ管理戦略。Seeding（データ準備）、Teardown（クリーンアップ）、データ分離技術を提供。

## 核心概念

### 1. Seeding（データ準備）戦略

**目的**: テスト実行前に必要なデータを準備

```typescript
// APIによるSeeding
test.beforeEach(async ({ request }) => {
  await request.post("/api/users", {
    data: { name: "Test User", email: "test@example.com" },
  });
});

// Fixtureファイル使用
import testData from "./fixtures/users.json";

test.beforeEach(async ({ request }) => {
  for (const user of testData) {
    await request.post("/api/users", { data: user });
  }
});
```

### 2. Teardown（クリーンアップ）戦略

**目的**: テスト実行後にデータを削除

```typescript
test.afterEach(async ({ request }) => {
  // テストデータ削除
  await request.delete("/api/users/test@example.com");
});

// データベース直接クリーンアップ
test.afterEach(async () => {
  await db.query('DELETE FROM users WHERE email LIKE "test-%"');
});
```

### 3. テストデータ分離

**並列実行時のデータ競合回避**:

```typescript
test("ユーザー作成", async ({ page }) => {
  // 一意なデータ生成
  const uniqueEmail = `user-${Date.now()}@example.com`;
  const uniqueId = crypto.randomUUID();

  await page.goto("/register");
  await page.getByLabel("Email").fill(uniqueEmail);
  // ...
});
```

## 実装パターン

### パターン 1: Fixture-based パターン

```typescript
// fixtures/test-user.ts
export const test = base.extend({
  testUser: async ({ request }, use) => {
    // Setup
    const user = {
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
    };
    const response = await request.post("/api/users", { data: user });
    const createdUser = await response.json();

    // テストに渡す
    await use(createdUser);

    // Cleanup
    await request.delete(`/api/users/${createdUser.id}`);
  },
});

// テスト使用
test("ユーザープロフィール表示", async ({ page, testUser }) => {
  await page.goto(`/users/${testUser.id}`);
  await expect(page.getByText(testUser.name)).toBeVisible();
});
```

### パターン 2: Database Seeding

```typescript
// setup/seed-database.ts
import { PrismaClient } from "@prisma/client";

export async function seedDatabase() {
  const prisma = new PrismaClient();

  await prisma.user.createMany({
    data: [
      { name: "User 1", email: "user1@test.com" },
      { name: "User 2", email: "user2@test.com" },
    ],
  });

  await prisma.$disconnect();
}

// tests/users.spec.ts
test.beforeAll(async () => {
  await seedDatabase();
});

test.afterAll(async () => {
  const prisma = new PrismaClient();
  await prisma.user.deleteMany({ where: { email: { endsWith: "@test.com" } } });
  await prisma.$disconnect();
});
```

### パターン 3: トランザクションベース

```typescript
test.describe("トランザクション使用", () => {
  let transactionId;

  test.beforeEach(async ({ request }) => {
    // トランザクション開始
    const response = await request.post("/api/transactions/begin");
    transactionId = (await response.json()).id;
  });

  test.afterEach(async ({ request }) => {
    // ロールバック
    await request.post(`/api/transactions/${transactionId}/rollback`);
  });

  test("データ作成テスト", async ({ page }) => {
    // トランザクション内でデータ操作
    // ...
  });
});
```

## ベストプラクティス

### DO（推奨）

1. **一意なテストデータ生成**:

```typescript
const email = `test-${crypto.randomUUID()}@example.com`;
const timestamp = Date.now();
```

2. **最小限のデータセット**:

```typescript
// ✅ 必要最小限
await createUser({ name: "Test", email: "test@example.com" });

// ❌ 過剰なデータ
await create100Users(); // 不要
```

3. **クリーンアップの確実な実行**:

```typescript
test.afterEach(async () => {
  // 必ずクリーンアップ
});
```

### DON'T（非推奨）

1. **固定データへの依存を避ける**:

```typescript
// ❌ 固定データ（他テストと競合）
await page.fill('[name="email"]', "fixed@example.com");

// ✅ 動的データ
await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
```

2. **グローバルステートを避ける**:

```typescript
// ❌
let globalUser; // 避けるべき

// ✅
test.beforeEach(async ({ }, testInfo) => {
  const user = { ... }; // テストスコープ内
});
```

## リソース

- [resources/seeding-strategies.md](resources/seeding-strategies.md) - Seeding 戦略詳細（API、DB、Fixture）
- [resources/cleanup-patterns.md](resources/cleanup-patterns.md) - クリーンアップパターンとベストプラクティス
- [resources/data-isolation-techniques.md](resources/data-isolation-techniques.md) - 並列実行時のデータ分離技術
- [scripts/generate-test-data.mjs](scripts/generate-test-data.mjs) - テストデータ生成スクリプト
- [templates/fixture-template.ts](templates/fixture-template.ts) - Playwright の fixture 拡張テンプレート

## 関連スキル

- **.claude/skills/playwright-testing/SKILL.md** (`.claude/skills/playwright-testing/SKILL.md`): Playwright の基本操作
- **.claude/skills/flaky-test-prevention/SKILL.md** (`.claude/skills/flaky-test-prevention/SKILL.md`): テスト安定化
- **.claude/skills/api-mocking/SKILL.md** (`.claude/skills/api-mocking/SKILL.md`): API モック
