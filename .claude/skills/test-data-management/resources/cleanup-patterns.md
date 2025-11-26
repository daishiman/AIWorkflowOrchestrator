# テストデータクリーンアップパターン

テストデータのクリーンアップは、安定したテスト環境を維持するための重要な要素です。
このリソースでは、Playwright E2Eテストで使用可能な効果的なクリーンアップパターンを解説します。

---

## 目次

1. [クリーンアップの重要性](#クリーンアップの重要性)
2. [基本パターン](#基本パターン)
3. [高度なクリーンアップ戦略](#高度なクリーンアップ戦略)
4. [並列実行とクリーンアップ](#並列実行とクリーンアップ)
5. [トラブルシューティング](#トラブルシューティング)

---

## クリーンアップの重要性

### クリーンアップしないとどうなる？

❌ **テスト間の干渉**: 前のテストのデータが次のテストに影響
❌ **不安定なテスト**: データの蓄積により予測不可能な結果
❌ **デバッグ困難**: 問題の原因がテスト自体かデータ汚染か判断困難
❌ **リソース枯渇**: データベース容量、メモリ、ディスク領域の浪費

### クリーンアップの原則

✅ **確実性**: クリーンアップは必ず実行されること
✅ **完全性**: 作成したすべてのデータを削除すること
✅ **順序性**: 外部キー制約を考慮した順序で削除すること
✅ **冪等性**: 複数回実行しても安全であること
✅ **高速性**: クリーンアップがテスト時間を不必要に延ばさないこと

---

## 基本パターン

### 1. afterEachフックパターン

最も一般的なパターン。各テスト後に自動的にクリーンアップを実行。

```typescript
// tests/basic-cleanup.spec.ts
import { test, expect } from '@playwright/test';
import { ApiSeeder } from './helpers/api-seeder';

test.describe('基本的なクリーンアップ', () => {
  let seeder: ApiSeeder;
  let createdUserIds: string[] = [];

  test.beforeEach(async () => {
    seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();
  });

  test.afterEach(async () => {
    // 作成したユーザーを削除
    for (const userId of createdUserIds) {
      try {
        await seeder.deleteUser(userId);
      } catch (error) {
        console.error(`Failed to delete user ${userId}:`, error);
      }
    }
    createdUserIds = [];
    await seeder.dispose();
  });

  test('ユーザー登録フロー', async ({ page }) => {
    const user = await seeder.createUser({
      email: 'newuser@test.com',
      name: 'New User',
    });
    createdUserIds.push(user.id);

    await page.goto(`/users/${user.id}`);
    await expect(page.locator('h1')).toContainText('New User');
  });
});
```

**メリット**: シンプルで理解しやすい
**デメリット**: 手動でIDを追跡する必要がある

---

### 2. Fixtureベースの自動クリーンアップ

Playwrightのfixture機能を使用して、自動的にクリーンアップを実行。

```typescript
// tests/fixtures/cleanup-fixtures.ts
import { test as base } from '@playwright/test';
import { ApiSeeder } from '../helpers/api-seeder';

type CleanupFixture = {
  autoCleanupSeeder: ApiSeeder & { createdResources: Map<string, string[]> };
};

export const test = base.extend<CleanupFixture>({
  autoCleanupSeeder: async ({}, use) => {
    const seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();

    // 作成されたリソースを自動追跡
    const createdResources = new Map<string, string[]>();

    // オリジナルのメソッドをラップ
    const originalCreateUser = seeder.createUser.bind(seeder);
    seeder.createUser = async (userData) => {
      const user = await originalCreateUser(userData);
      const ids = createdResources.get('users') || [];
      ids.push(user.id);
      createdResources.set('users', ids);
      return user;
    };

    const originalCreateProject = seeder.createProject.bind(seeder);
    seeder.createProject = async (projectData) => {
      const project = await originalCreateProject(projectData);
      const ids = createdResources.get('projects') || [];
      ids.push(project.id);
      createdResources.set('projects', ids);
      return project;
    };

    // fixtureをテストに提供
    await use(Object.assign(seeder, { createdResources }));

    // 自動クリーンアップ（逆順で削除）
    const projectIds = createdResources.get('projects') || [];
    for (const id of projectIds.reverse()) {
      try {
        await seeder.deleteProject(id);
      } catch (error) {
        console.error(`Failed to delete project ${id}:`, error);
      }
    }

    const userIds = createdResources.get('users') || [];
    for (const id of userIds.reverse()) {
      try {
        await seeder.deleteUser(id);
      } catch (error) {
        console.error(`Failed to delete user ${id}:`, error);
      }
    }

    await seeder.dispose();
  },
});

export { expect } from '@playwright/test';
```

### 使用例

```typescript
// tests/auto-cleanup.spec.ts
import { test, expect } from './fixtures/cleanup-fixtures';

test('ユーザーとプロジェクト作成（自動クリーンアップ）', async ({
  page,
  autoCleanupSeeder,
}) => {
  // データ作成（IDの追跡は不要）
  const user = await autoCleanupSeeder.createUser({
    email: 'user@test.com',
    name: 'Test User',
  });

  const project = await autoCleanupSeeder.createProject({
    name: 'Test Project',
    description: 'Auto cleanup test',
    ownerId: user.id,
  });

  await page.goto(`/projects/${project.id}`);
  await expect(page.locator('h1')).toContainText('Test Project');

  // テスト終了後、自動的にproject → userの順で削除される
});
```

**メリット**: ID追跡が不要、削除順序を自動管理
**デメリット**: 実装が複雑、デバッグが困難になる場合がある

---

### 3. データベーストランザクションパターン

データベース直接アクセスの場合、トランザクションでロールバックする方法。

```typescript
// tests/helpers/transaction-seeder.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export class TransactionSeeder {
  private client: ReturnType<typeof postgres>;
  private db: ReturnType<typeof drizzle>;
  private transactionClient?: ReturnType<typeof postgres>;

  constructor() {
    this.client = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(this.client);
  }

  /**
   * トランザクション開始
   */
  async beginTransaction() {
    this.transactionClient = postgres(process.env.DATABASE_URL!, { max: 1 });
    await this.transactionClient`BEGIN`;
  }

  /**
   * トランザクションロールバック（クリーンアップ）
   */
  async rollback() {
    if (this.transactionClient) {
      await this.transactionClient`ROLLBACK`;
      await this.transactionClient.end();
      this.transactionClient = undefined;
    }
  }

  async createUser(userData: any) {
    if (!this.transactionClient) {
      throw new Error('Transaction not started');
    }
    const [user] = await this.transactionClient`
      INSERT INTO users (email, name, password_hash)
      VALUES (${userData.email}, ${userData.name}, 'test_hash')
      RETURNING *
    `;
    return user;
  }

  async dispose() {
    await this.rollback();
    await this.client.end();
  }
}
```

### 使用例

```typescript
// tests/transaction-cleanup.spec.ts
import { test, expect } from '@playwright/test';
import { TransactionSeeder } from './helpers/transaction-seeder';

test.describe('トランザクションベースのクリーンアップ', () => {
  let seeder: TransactionSeeder;

  test.beforeEach(async () => {
    seeder = new TransactionSeeder();
    await seeder.beginTransaction();
  });

  test.afterEach(async () => {
    await seeder.rollback(); // すべての変更をロールバック
    await seeder.dispose();
  });

  test('ユーザー作成（自動ロールバック）', async ({ page }) => {
    const user = await seeder.createUser({
      email: 'rollback@test.com',
      name: 'Rollback User',
    });

    // テスト実行
    await page.goto(`/users/${user.id}`);
    await expect(page.locator('h1')).toContainText('Rollback User');

    // テスト終了後、自動的にロールバックされる
  });
});
```

**メリット**: 超高速、確実なクリーンアップ
**デメリット**: UIテストではトランザクションが分離されるため使用困難

---

## 高度なクリーンアップ戦略

### 1. カスケード削除パターン

外部キー制約を利用して、親レコード削除時に関連レコードも自動削除。

```typescript
// db/schema.ts（Drizzle ORM）
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // カスケード削除
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }), // カスケード削除
});
```

### クリーンアップ実装

```typescript
// tests/helpers/cascade-seeder.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class CascadeSeeder {
  private db: ReturnType<typeof drizzle>;
  private rootUserIds: string[] = [];

  async createUserWithProjects(userData: any, projectsData: any[]) {
    // ユーザー作成
    const [user] = await this.db.insert(users).values(userData).returning();
    this.rootUserIds.push(user.id);

    // プロジェクト作成（owner_idが外部キー）
    const projects = [];
    for (const projectData of projectsData) {
      const [project] = await this.db
        .insert(projects)
        .values({ ...projectData, ownerId: user.id })
        .returning();
      projects.push(project);
    }

    return { user, projects };
  }

  /**
   * ユーザーを削除すると、関連するプロジェクトとタスクも自動削除される
   */
  async cleanup() {
    for (const userId of this.rootUserIds) {
      await this.db.delete(users).where(eq(users.id, userId));
      // projects, tasksは自動的に削除される（CASCADE）
    }
    this.rootUserIds = [];
  }
}
```

**メリット**: シンプルなクリーンアップコード、削除順序を気にしなくて良い
**デメリット**: スキーマ設計に依存、意図しないデータ削除のリスク

---

### 2. タグベースのクリーンアップ

テスト実行時に一意のタグを付与し、タグでまとめて削除する方法。

```typescript
// tests/helpers/tagged-seeder.ts
export class TaggedSeeder {
  private testTag: string;

  constructor() {
    this.testTag = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  async createUser(userData: any) {
    const user = await this.db.insert(users).values({
      ...userData,
      email: `${this.testTag}_${userData.email}`, // タグをプレフィックスとして付与
      tags: [this.testTag], // タグ配列カラムがある場合
    }).returning();
    return user;
  }

  async createProject(projectData: any) {
    const project = await this.db.insert(projects).values({
      ...projectData,
      name: `${this.testTag}_${projectData.name}`,
      tags: [this.testTag],
    }).returning();
    return project;
  }

  /**
   * タグでまとめて削除
   */
  async cleanup() {
    // タグを含むすべてのレコードを削除
    await this.db.delete(projects).where(arrayContains(projects.tags, [this.testTag]));
    await this.db.delete(users).where(arrayContains(users.tags, [this.testTag]));

    // または、email/nameにタグが含まれるものを削除
    await this.db.delete(users).where(like(users.email, `${this.testTag}_%`));
  }

  getTag() {
    return this.testTag;
  }
}
```

**メリット**: 複数テーブルのデータを一括削除、並列実行時も安全
**デメリット**: スキーマにタグ用カラムまたはプレフィックスが必要

---

## 並列実行とクリーンアップ

### 問題点

並列実行時、複数のテストが同時にクリーンアップを実行すると競合が発生する可能性。

### 解決策：テストごとに独立したデータセット

```typescript
// tests/fixtures/isolated-data.ts
import { test as base } from '@playwright/test';

type IsolatedDataFixture = {
  uniquePrefix: string;
  isolatedSeeder: ApiSeeder;
};

export const test = base.extend<IsolatedDataFixture>({
  // 各テストで一意のプレフィックスを生成
  uniquePrefix: async ({}, use) => {
    const prefix = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await use(prefix);
  },

  isolatedSeeder: async ({ uniquePrefix }, use) => {
    const seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();

    // すべてのメソッドにプレフィックスを自動付与
    const originalCreateUser = seeder.createUser.bind(seeder);
    seeder.createUser = async (userData) => {
      return originalCreateUser({
        ...userData,
        email: `${uniquePrefix}_${userData.email}`,
      });
    };

    const createdIds = {
      users: [] as string[],
      projects: [] as string[],
    };

    // リソース追跡
    const originalCreate = seeder.createUser.bind(seeder);
    seeder.createUser = async (userData) => {
      const user = await originalCreate(userData);
      createdIds.users.push(user.id);
      return user;
    };

    await use(seeder);

    // クリーンアップ（このテスト固有のデータのみ）
    for (const id of createdIds.projects.reverse()) {
      await seeder.deleteProject(id).catch(console.error);
    }
    for (const id of createdIds.users.reverse()) {
      await seeder.deleteUser(id).catch(console.error);
    }

    await seeder.dispose();
  },
});
```

**メリット**: 並列実行時にテスト間でデータが競合しない
**デメリット**: 各テストで独立したデータセットが必要なため、データ量が増える

---

## トラブルシューティング

### 問題1: 外部キー制約エラー

**症状**: `FOREIGN KEY constraint failed`エラーが発生

**原因**: 削除順序が正しくない（子レコード → 親レコードの順で削除していない）

**解決策**:
```typescript
// 正しい削除順序
await seeder.deleteTasks(taskIds);       // 孫
await seeder.deleteProjects(projectIds); // 子
await seeder.deleteUsers(userIds);       // 親
```

---

### 問題2: クリーンアップが遅い

**症状**: テスト時間の大半がクリーンアップに費やされる

**解決策**:
```typescript
// 並列削除
await Promise.all([
  ...taskIds.map(id => seeder.deleteTask(id)),
  // ただし、外部キー制約がある場合は段階的に並列化
]);

// またはバルク削除
await this.db.delete(tasks).where(inArray(tasks.id, taskIds));
```

---

### 問題3: クリーンアップ漏れ

**症状**: テストデータが蓄積し、他のテストに影響

**解決策**:
```typescript
// テストタグを使用して定期的に全クリーンアップ
test.afterAll(async () => {
  // 古いテストデータ（1時間以上前）を削除
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await db.delete(users).where(
    and(
      like(users.email, 'test_%'),
      lt(users.createdAt, oneHourAgo)
    )
  );
});
```

---

## ベストプラクティス

### DO ✅

- **try-catchでラップ**: クリーンアップ失敗でテストが停止しないように
- **ログを残す**: クリーンアップ失敗時の詳細をログに記録
- **冪等性を確保**: 同じクリーンアップを複数回実行しても安全に
- **タイムアウト設定**: クリーンアップが無限に待機しないように
- **定期的な全クリーンアップ**: CI/CDパイプラインで古いテストデータを削除

### DON'T ❌

- **エラーを無視しない**: クリーンアップ失敗は将来の問題の兆候
- **順序を間違えない**: 外部キー制約を考慮した削除順序を守る
- **本番データを触らない**: 環境変数で確実にテストDBを使用
- **グローバルクリーンアップに依存しない**: 各テストで独立したクリーンアップを実装
- **過度に複雑にしない**: シンプルで理解しやすいクリーンアップを優先

---

## まとめ

効果的なクリーンアップ戦略は、安定したE2Eテストの基盤です。
プロジェクトの特性に応じて、適切なパターンを選択し、並列実行とデータ分離を考慮してください。

**推奨アプローチ**:
1. Fixtureベースの自動クリーンアップから始める
2. 並列実行を考慮して一意のプレフィックス/タグを使用
3. 外部キー制約を活用したカスケード削除を検討
4. 定期的な全クリーンアップをCI/CDに組み込む
