---
name: test-data-management
description: |
  E2Eテストのためのテストデータ管理戦略。
  Seeding（データ準備）、Teardown（クリーンアップ）、データ分離技術を提供します。

  専門分野:
  - Seeding戦略: API経由、DB直接、Fixtureベースの使い分け
  - Teardown戦略: フックメカニズム、トランザクションロールバック、確実なクリーンアップ
  - データ分離: UUID、タイムスタンプ、Worker ID活用の並列実行対応
  - Fixture設計: カスタムFixture、自動セットアップ/クリーンアップ

  使用タイミング:
  - E2Eテストのデータセットアップが必要な時
  - テスト間のデータ競合を防ぐ必要がある時
  - テストデータのクリーンアップが必要な時
  - Fixture-basedパターンを適用する時
  - 並列テスト実行時のデータ分離が必要な時

  Use proactively when setting up test data, managing test isolation,
  or designing cleanup strategies for E2E tests.
version: 1.0.0
---

# Test Data Management Skill

## 概要

E2Eテストのためのテストデータ管理戦略。Seeding（データ準備）、Teardown（クリーンアップ）、データ分離技術を提供。

## 核心概念

### 1. Seeding（データ準備）戦略

**目的**: テスト実行前に必要なデータを準備

```typescript
// APIによるSeeding
test.beforeEach(async ({ request }) => {
  await request.post('/api/users', {
    data: { name: 'Test User', email: 'test@example.com' }
  });
});

// Fixtureファイル使用
import testData from './fixtures/users.json';

test.beforeEach(async ({ request }) => {
  for (const user of testData) {
    await request.post('/api/users', { data: user });
  }
});
```

### 2. Teardown（クリーンアップ）戦略

**目的**: テスト実行後にデータを削除

```typescript
test.afterEach(async ({ request }) => {
  // テストデータ削除
  await request.delete('/api/users/test@example.com');
});

// データベース直接クリーンアップ
test.afterEach(async () => {
  await db.query('DELETE FROM users WHERE email LIKE "test-%"');
});
```

### 3. テストデータ分離

**並列実行時のデータ競合回避**:

```typescript
test('ユーザー作成', async ({ page }) => {
  // 一意なデータ生成
  const uniqueEmail = `user-${Date.now()}@example.com`;
  const uniqueId = crypto.randomUUID();

  await page.goto('/register');
  await page.getByLabel('Email').fill(uniqueEmail);
  // ...
});
```

## 実装パターン

### パターン1: Fixture-basedパターン

```typescript
// fixtures/test-user.ts
export const test = base.extend({
  testUser: async ({ request }, use) => {
    // Setup
    const user = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`
    };
    const response = await request.post('/api/users', { data: user });
    const createdUser = await response.json();

    // テストに渡す
    await use(createdUser);

    // Cleanup
    await request.delete(`/api/users/${createdUser.id}`);
  }
});

// テスト使用
test('ユーザープロフィール表示', async ({ page, testUser }) => {
  await page.goto(`/users/${testUser.id}`);
  await expect(page.getByText(testUser.name)).toBeVisible();
});
```

### パターン2: Database Seeding

```typescript
// setup/seed-database.ts
import { PrismaClient } from '@prisma/client';

export async function seedDatabase() {
  const prisma = new PrismaClient();

  await prisma.user.createMany({
    data: [
      { name: 'User 1', email: 'user1@test.com' },
      { name: 'User 2', email: 'user2@test.com' }
    ]
  });

  await prisma.$disconnect();
}

// tests/users.spec.ts
test.beforeAll(async () => {
  await seedDatabase();
});

test.afterAll(async () => {
  const prisma = new PrismaClient();
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test.com' } } });
  await prisma.$disconnect();
});
```

### パターン3: トランザクションベース

```typescript
test.describe('トランザクション使用', () => {
  let transactionId;

  test.beforeEach(async ({ request }) => {
    // トランザクション開始
    const response = await request.post('/api/transactions/begin');
    transactionId = (await response.json()).id;
  });

  test.afterEach(async ({ request }) => {
    // ロールバック
    await request.post(`/api/transactions/${transactionId}/rollback`);
  });

  test('データ作成テスト', async ({ page }) => {
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
await createUser({ name: 'Test', email: 'test@example.com' });

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
await page.fill('[name="email"]', 'fixed@example.com');

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

- [resources/seeding-strategies.md](resources/seeding-strategies.md) - Seeding戦略詳細（API、DB、Fixture）
- [resources/cleanup-patterns.md](resources/cleanup-patterns.md) - クリーンアップパターンとベストプラクティス
- [resources/data-isolation-techniques.md](resources/data-isolation-techniques.md) - 並列実行時のデータ分離技術
- [scripts/generate-test-data.mjs](scripts/generate-test-data.mjs) - テストデータ生成スクリプト
- [templates/fixture-template.ts](templates/fixture-template.ts) - Playwrightのfixture拡張テンプレート

## 関連スキル

- **playwright-testing** (`.claude/skills/playwright-testing/SKILL.md`): Playwrightの基本操作
- **flaky-test-prevention** (`.claude/skills/flaky-test-prevention/SKILL.md`): テスト安定化
- **api-mocking** (`.claude/skills/api-mocking/SKILL.md`): API モック
