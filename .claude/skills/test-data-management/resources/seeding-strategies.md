# テストデータSeeding戦略

テストデータのSeeding（初期データ投入）は、安定したテスト環境を構築するための基盤です。
このリソースでは、Playwright E2Eテストで使用可能な3つの主要なSeeding戦略を詳しく解説します。

---

## 目次

1. [API経由のSeeding](#api経由のseeding)
2. [データベース直接Seeding](#データベース直接seeding)
3. [Fixtureベースのカスタムセットアップ](#fixtureベースのカスタムセットアップ)
4. [戦略比較とユースケース](#戦略比較とユースケース)

---

## API経由のSeeding

### 概要

アプリケーションの公開APIエンドポイントを使用してテストデータを作成する方法。
最もアプリケーションに近い形でデータを投入できるため、**実際のユーザー操作に近いテスト**が可能。

### 実装パターン

```typescript
// tests/helpers/api-seeder.ts
import { request, APIRequestContext } from '@playwright/test';

export class ApiSeeder {
  private apiContext: APIRequestContext;
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async initialize() {
    this.apiContext = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  async authenticate(email: string, password: string) {
    const response = await this.apiContext.post('/api/auth/login', {
      data: { email, password },
    });
    const data = await response.json();
    this.authToken = data.token;
  }

  async createUser(userData: {
    email: string;
    name: string;
    role?: string;
  }) {
    const uniqueEmail = `${Date.now()}_${userData.email}`;
    const response = await this.apiContext.post('/api/users', {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
      data: {
        ...userData,
        email: uniqueEmail,
        password: 'Test1234!', // テスト用固定パスワード
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create user: ${response.status()}`);
    }

    return response.json();
  }

  async createProject(projectData: {
    name: string;
    description: string;
    ownerId: string;
  }) {
    const uniqueName = `${Date.now()}_${projectData.name}`;
    const response = await this.apiContext.post('/api/projects', {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
      data: {
        ...projectData,
        name: uniqueName,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create project: ${response.status()}`);
    }

    return response.json();
  }

  async dispose() {
    await this.apiContext.dispose();
  }
}
```

### 使用例

```typescript
// tests/project-management.spec.ts
import { test, expect } from '@playwright/test';
import { ApiSeeder } from './helpers/api-seeder';

test.describe('プロジェクト管理', () => {
  let seeder: ApiSeeder;
  let testUser: any;

  test.beforeEach(async () => {
    seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();
    await seeder.authenticate('admin@test.com', 'AdminPass123!');

    // テストユーザー作成
    testUser = await seeder.createUser({
      email: 'testuser@example.com',
      name: 'Test User',
      role: 'developer',
    });
  });

  test.afterEach(async () => {
    await seeder.dispose();
  });

  test('新規プロジェクトを作成できる', async ({ page }) => {
    const project = await seeder.createProject({
      name: 'Test Project',
      description: 'E2E Test Project',
      ownerId: testUser.id,
    });

    await page.goto(`/projects/${project.id}`);
    await expect(page.locator('h1')).toContainText('Test Project');
  });
});
```

### メリット

✅ **ビジネスロジック検証**: APIの検証ルールが適用される
✅ **保守性**: APIが変更されても、テストコードの修正が最小限
✅ **セキュリティ**: 認証・認可フローが正しく機能することを確認
✅ **現実的**: 実際のユーザー操作に近い

### デメリット

⚠️ **速度**: HTTPリクエストのオーバーヘッドがある
⚠️ **依存性**: APIが正常に動作していることが前提
⚠️ **複雑性**: 認証トークン管理など、追加の実装が必要

---

## データベース直接Seeding

### 概要

データベースに直接アクセスしてテストデータを挿入する方法。
**高速で柔軟性が高い**が、ビジネスロジックをバイパスするため注意が必要。

### 実装パターン（Drizzle ORMの場合）

```typescript
// tests/helpers/db-seeder.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, projects, projectMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class DbSeeder {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;
  private createdRecords: { table: string; id: string }[] = [];

  constructor() {
    this.client = postgres(process.env.DATABASE_URL!);
    this.db = drizzle(this.client);
  }

  async createUser(userData: {
    email: string;
    name: string;
    passwordHash?: string;
  }) {
    const uniqueEmail = `${Date.now()}_${userData.email}`;
    const [user] = await this.db
      .insert(users)
      .values({
        email: uniqueEmail,
        name: userData.name,
        passwordHash: userData.passwordHash || 'hashed_test_password',
        emailVerified: new Date(),
        createdAt: new Date(),
      })
      .returning();

    this.createdRecords.push({ table: 'users', id: user.id });
    return user;
  }

  async createProject(projectData: {
    name: string;
    description: string;
    ownerId: string;
  }) {
    const uniqueName = `${Date.now()}_${projectData.name}`;
    const [project] = await this.db
      .insert(projects)
      .values({
        name: uniqueName,
        description: projectData.description,
        ownerId: projectData.ownerId,
        status: 'active',
        createdAt: new Date(),
      })
      .returning();

    this.createdRecords.push({ table: 'projects', id: project.id });
    return project;
  }

  async addProjectMember(data: {
    projectId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member';
  }) {
    const [member] = await this.db
      .insert(projectMembers)
      .values({
        projectId: data.projectId,
        userId: data.userId,
        role: data.role,
        joinedAt: new Date(),
      })
      .returning();

    this.createdRecords.push({
      table: 'projectMembers',
      id: `${member.projectId}_${member.userId}`,
    });
    return member;
  }

  /**
   * 作成したすべてのレコードを削除（クリーンアップ）
   */
  async cleanup() {
    // 逆順で削除（外部キー制約を考慮）
    for (const record of this.createdRecords.reverse()) {
      try {
        switch (record.table) {
          case 'users':
            await this.db.delete(users).where(eq(users.id, record.id));
            break;
          case 'projects':
            await this.db.delete(projects).where(eq(projects.id, record.id));
            break;
          case 'projectMembers':
            // 複合キーの場合は特別な処理が必要
            break;
        }
      } catch (error) {
        console.error(`Failed to delete ${record.table} ${record.id}:`, error);
      }
    }
    this.createdRecords = [];
  }

  async dispose() {
    await this.cleanup();
    await this.client.end();
  }
}
```

### 使用例

```typescript
// tests/project-members.spec.ts
import { test, expect } from '@playwright/test';
import { DbSeeder } from './helpers/db-seeder';

test.describe('プロジェクトメンバー管理', () => {
  let seeder: DbSeeder;
  let owner: any;
  let project: any;

  test.beforeEach(async () => {
    seeder = new DbSeeder();

    // オーナーとプロジェクトを直接作成
    owner = await seeder.createUser({
      email: 'owner@test.com',
      name: 'Project Owner',
    });

    project = await seeder.createProject({
      name: 'Test Project',
      description: 'DB Seeded Project',
      ownerId: owner.id,
    });

    await seeder.addProjectMember({
      projectId: project.id,
      userId: owner.id,
      role: 'owner',
    });
  });

  test.afterEach(async () => {
    await seeder.dispose();
  });

  test('プロジェクトメンバーを追加できる', async ({ page }) => {
    // 新しいメンバーを作成
    const member = await seeder.createUser({
      email: 'member@test.com',
      name: 'New Member',
    });

    // ブラウザでメンバー追加UI操作
    await page.goto(`/projects/${project.id}/members`);
    await page.fill('input[name="email"]', member.email);
    await page.click('button:has-text("招待")');

    await expect(page.locator(`text=${member.name}`)).toBeVisible();
  });
});
```

### メリット

✅ **高速**: HTTPオーバーヘッドがない
✅ **柔軟性**: 複雑な初期状態を簡単に構築可能
✅ **制御**: ビジネスロジックをバイパスして特定の状態を作成可能
✅ **トランザクション**: データベーストランザクションで一貫性を保証

### デメリット

⚠️ **ビジネスロジックバイパス**: APIの検証ルールが適用されない
⚠️ **保守コスト**: スキーマ変更時にテストコードも修正が必要
⚠️ **データ整合性**: 手動で外部キー制約などを考慮する必要がある
⚠️ **依存性**: データベーススキーマへの直接依存

---

## Fixtureベースのカスタムセットアップ

### 概要

Playwrightのfixture機能を使用して、テストデータのセットアップとクリーンアップを自動化する方法。
**再利用性が高く、テストコードがシンプル**になる。

### 実装パターン

```typescript
// tests/fixtures/data-fixtures.ts
import { test as base } from '@playwright/test';
import { ApiSeeder } from '../helpers/api-seeder';
import { DbSeeder } from '../helpers/db-seeder';

type DataFixtures = {
  apiSeeder: ApiSeeder;
  dbSeeder: DbSeeder;
  testUser: Awaited<ReturnType<ApiSeeder['createUser']>>;
  testProject: Awaited<ReturnType<ApiSeeder['createProject']>>;
};

export const test = base.extend<DataFixtures>({
  apiSeeder: async ({}, use) => {
    const seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();
    await seeder.authenticate('admin@test.com', 'AdminPass123!');
    await use(seeder);
    await seeder.dispose();
  },

  dbSeeder: async ({}, use) => {
    const seeder = new DbSeeder();
    await use(seeder);
    await seeder.dispose();
  },

  testUser: async ({ apiSeeder }, use) => {
    const user = await apiSeeder.createUser({
      email: 'testuser@example.com',
      name: 'Test User',
      role: 'developer',
    });
    await use(user);
    // クリーンアップはapiSeederのdisposeで処理
  },

  testProject: async ({ apiSeeder, testUser }, use) => {
    const project = await apiSeeder.createProject({
      name: 'Test Project',
      description: 'Fixture Test Project',
      ownerId: testUser.id,
    });
    await use(project);
    // クリーンアップはapiSeederのdisposeで処理
  },
});

export { expect } from '@playwright/test';
```

### 使用例

```typescript
// tests/project-workflow.spec.ts
import { test, expect } from './fixtures/data-fixtures';

// testUser, testProjectは自動的にセットアップされる
test('プロジェクトのワークフローをテストする', async ({
  page,
  testUser,
  testProject,
}) => {
  // すでにユーザーとプロジェクトが存在する状態でテスト開始
  await page.goto(`/projects/${testProject.id}`);
  await expect(page.locator('h1')).toContainText(testProject.name);

  // タスク追加
  await page.click('button:has-text("タスク追加")');
  await page.fill('input[name="title"]', 'New Task');
  await page.click('button:has-text("保存")');

  await expect(page.locator('text=New Task')).toBeVisible();
});

// 必要に応じて追加のデータを作成
test('複数プロジェクトの管理', async ({
  page,
  apiSeeder,
  testUser,
  testProject,
}) => {
  // 既存のtestProjectに加えて、追加のプロジェクトを作成
  const project2 = await apiSeeder.createProject({
    name: 'Second Project',
    description: 'Additional Project',
    ownerId: testUser.id,
  });

  await page.goto('/projects');
  await expect(page.locator('text=' + testProject.name)).toBeVisible();
  await expect(page.locator('text=' + project2.name)).toBeVisible();
});
```

### メリット

✅ **再利用性**: 共通のセットアップを複数のテストで再利用
✅ **シンプル**: テストコードが簡潔で読みやすい
✅ **自動クリーンアップ**: fixtureが自動的にクリーンアップを実行
✅ **依存関係管理**: fixture間の依存関係を宣言的に定義可能
✅ **並列実行**: 各テストで独立したデータセットを自動生成

### デメリット

⚠️ **学習コスト**: Playwrightのfixture機能の理解が必要
⚠️ **デバッグ**: fixtureのエラーはスタックトレースが複雑になりがち
⚠️ **柔軟性**: 高度にカスタマイズされたセットアップには不向き

---

## 戦略比較とユースケース

| 戦略 | 速度 | 現実性 | 柔軟性 | 推奨ユースケース |
|------|------|--------|--------|------------------|
| **API Seeding** | 🐢 遅い | ⭐⭐⭐ 高い | ⭐⭐ 中 | エンドツーエンドの統合テスト、認証フロー検証 |
| **DB Seeding** | 🚀 高速 | ⭐ 低い | ⭐⭐⭐ 高い | 複雑な初期状態、パフォーマンステスト |
| **Fixture** | 🚄 中〜高速 | ⭐⭐ 中 | ⭐⭐⭐ 高い | 再利用可能なテストセットアップ、並列実行 |

### 推奨アプローチ

1. **基本的なテスト**: Fixtureベースのアプローチから始める
2. **速度が重要**: データベース直接Seedingを検討
3. **認証フロー**: API Seedingで実際のフローを検証
4. **ハイブリッド**: fixtureの中でAPI/DB Seedingを組み合わせる

---

## ベストプラクティス

### DO ✅

- **一意性を保証**: タイムスタンプやUUIDでデータの一意性を確保
- **クリーンアップを自動化**: afterEachやfixture disposalで確実にクリーンアップ
- **並列実行を考慮**: テスト間でデータが競合しないように設計
- **環境変数を使用**: 接続情報をハードコードしない
- **エラーハンドリング**: Seeding失敗時に適切なエラーメッセージを表示

### DON'T ❌

- **本番データを使用しない**: テスト専用のデータベースを使用
- **グローバル状態に依存しない**: 各テストで独立したデータセットを作成
- **ハードコードされたIDに依存しない**: 動的に生成されたIDを使用
- **クリーンアップを忘れない**: テストデータが蓄積すると他のテストに影響
- **過度に複雑なSeeding**: シンプルで保守しやすいSeeding戦略を選択

---

## まとめ

適切なSeeding戦略を選択することで、安定した高速なE2Eテストを実現できます。
プロジェクトの特性とテストの目的に応じて、最適な戦略を選択してください。

**推奨**: まずはFixtureベースのアプローチで始め、必要に応じてAPI/DB Seedingを組み込む。
