/**
 * テストデータ管理用Fixtureテンプレート
 *
 * このテンプレートは、Playwright E2Eテストでテストデータの
 * セットアップとクリーンアップを自動化するためのfixtureを提供します。
 *
 * 使用方法:
 * 1. このファイルをコピーして、プロジェクトのtests/fixtures/ディレクトリに配置
 * 2. {{変数}}を実際の値に置き換え
 * 3. 必要に応じてカスタマイズ
 */

import { test as base } from "@playwright/test";
// {{API_SEEDER_PATH}} 例: '../helpers/api-seeder'
// {{DB_SEEDER_PATH}} 例: '../helpers/db-seeder'
// {{UNIQUE_GENERATOR_PATH}} 例: '../helpers/unique-generator'

// ==============================================================================
// 型定義
// ==============================================================================

/**
 * テストデータFixture型
 *
 * カスタマイズポイント:
 * - 必要なfixtureプロパティを追加/削除
 * - プロジェクト固有の型を定義
 */
type TestDataFixtures = {
  // 一意性を保証するためのユーティリティ
  uniqueGen: {
    email: (base: string) => string;
    name: (base: string) => string;
    id: () => string;
  };

  // API経由のSeeder
  apiSeeder: any; // {{API_SEEDER_TYPE}} 例: ApiSeeder

  // データベース直接Seeder
  dbSeeder: any; // {{DB_SEEDER_TYPE}} 例: DbSeeder

  // 事前作成されたテストユーザー
  testUser: {
    id: string;
    email: string;
    name: string;
    // {{USER_ADDITIONAL_FIELDS}}
  };

  // 事前作成されたテストプロジェクト
  testProject: {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    // {{PROJECT_ADDITIONAL_FIELDS}}
  };

  // {{ADDITIONAL_FIXTURES}}
  // 例: testTask, testOrganization など
};

// ==============================================================================
// Fixture拡張
// ==============================================================================

export const test = base.extend<TestDataFixtures>({
  // ----------------------------------------------------------------------------
  // uniqueGen: 一意性を保証するためのユーティリティ
  // ----------------------------------------------------------------------------
  uniqueGen: async ({}, use, testInfo) => {
    const workerIndex = testInfo.parallelIndex;
    const timestamp = Date.now();
    const random = () => Math.random().toString(36).slice(2, 9);

    const generator = {
      /**
       * 一意のメールアドレスを生成
       * @param base ベースとなるメールアドレス
       * @returns 一意のメールアドレス
       */
      email: (base: string): string => {
        const [local, domain] = base.split("@");
        return `${local}+w${workerIndex}_${timestamp}_${random()}@${domain}`;
      },

      /**
       * 一意の名前を生成
       * @param base ベースとなる名前
       * @returns 一意の名前
       */
      name: (base: string): string => {
        return `${base}_w${workerIndex}_${timestamp}_${random()}`;
      },

      /**
       * 一意のIDを生成
       * @returns UUID v4形式の一意のID
       */
      id: (): string => {
        return `${workerIndex}_${timestamp}_${random()}`;
      },
    };

    await use(generator);
  },

  // ----------------------------------------------------------------------------
  // apiSeeder: API経由のテストデータSeeder
  // ----------------------------------------------------------------------------
  apiSeeder: async ({ uniqueGen }, use) => {
    // {{IMPORT_API_SEEDER}}
    // const { ApiSeeder } = await import('{{API_SEEDER_PATH}}');

    // const seeder = new ApiSeeder(process.env.{{BASE_URL_ENV}} || 'http://localhost:3000');
    // await seeder.initialize();

    // 認証が必要な場合
    // await seeder.authenticate(
    //   process.env.{{ADMIN_EMAIL_ENV}} || 'admin@test.com',
    //   process.env.{{ADMIN_PASSWORD_ENV}} || 'AdminPass123!'
    // );

    const seeder = null; // {{REPLACE_WITH_ACTUAL_SEEDER}}

    // Seederメソッドをラップして一意性を確保
    const createdResources = new Map<string, string[]>();

    // 例: createUserメソッドのラップ
    // const originalCreateUser = seeder.createUser.bind(seeder);
    // seeder.createUser = async (userData: any) => {
    //   const uniqueEmail = uniqueGen.email(userData.email);
    //   const uniqueName = uniqueGen.name(userData.name);
    //   const user = await originalCreateUser({
    //     ...userData,
    //     email: uniqueEmail,
    //     name: uniqueName,
    //   });
    //   const ids = createdResources.get('users') || [];
    //   ids.push(user.id);
    //   createdResources.set('users', ids);
    //   return user;
    // };

    // {{WRAP_OTHER_METHODS}}

    await use(seeder);

    // クリーンアップ（逆順で削除）
    // 例: プロジェクト → ユーザー
    // const projectIds = createdResources.get('projects') || [];
    // for (const id of projectIds.reverse()) {
    //   try {
    //     await seeder.deleteProject(id);
    //   } catch (error) {
    //     console.error(`Failed to delete project ${id}:`, error);
    //   }
    // }

    // const userIds = createdResources.get('users') || [];
    // for (const id of userIds.reverse()) {
    //   try {
    //     await seeder.deleteUser(id);
    //   } catch (error) {
    //     console.error(`Failed to delete user ${id}:`, error);
    //   }
    // }

    // await seeder.dispose();
  },

  // ----------------------------------------------------------------------------
  // dbSeeder: データベース直接Seeder
  // ----------------------------------------------------------------------------
  dbSeeder: async ({ uniqueGen }, use) => {
    // {{IMPORT_DB_SEEDER}}
    // const { DbSeeder } = await import('{{DB_SEEDER_PATH}}');

    // const seeder = new DbSeeder();
    const seeder = null; // {{REPLACE_WITH_ACTUAL_SEEDER}}

    await use(seeder);

    // クリーンアップ
    // await seeder.cleanup();
    // await seeder.dispose();
  },

  // ----------------------------------------------------------------------------
  // testUser: 事前作成されたテストユーザー
  // ----------------------------------------------------------------------------
  testUser: async ({ apiSeeder, uniqueGen }, use) => {
    // デフォルトのテストユーザーデータ
    const userData = {
      email: "{{DEFAULT_USER_EMAIL}}", // 例: 'testuser@example.com'
      name: "{{DEFAULT_USER_NAME}}", // 例: 'Test User'
      // {{USER_ADDITIONAL_DEFAULTS}}
    };

    // ユーザー作成（apiSeederが一意性を確保）
    // const user = await apiSeeder.createUser(userData);
    const user = null; // {{REPLACE_WITH_ACTUAL_USER_CREATION}}

    await use(user);

    // クリーンアップはapiSeederのdisposeで自動実行
  },

  // ----------------------------------------------------------------------------
  // testProject: 事前作成されたテストプロジェクト
  // ----------------------------------------------------------------------------
  testProject: async ({ apiSeeder, testUser, uniqueGen }, use) => {
    // testUserに依存（testUserが先に作成される）
    const projectData = {
      name: "{{DEFAULT_PROJECT_NAME}}", // 例: 'Test Project'
      description: "{{DEFAULT_PROJECT_DESCRIPTION}}", // 例: 'E2E Test Project'
      ownerId: testUser.id,
      // {{PROJECT_ADDITIONAL_DEFAULTS}}
    };

    // プロジェクト作成
    // const project = await apiSeeder.createProject(projectData);
    const project = null; // {{REPLACE_WITH_ACTUAL_PROJECT_CREATION}}

    await use(project);

    // クリーンアップはapiSeederのdisposeで自動実行
  },

  // {{ADDITIONAL_FIXTURE_IMPLEMENTATIONS}}
  // 例:
  // testTask: async ({ apiSeeder, testProject }, use) => {
  //   const task = await apiSeeder.createTask({
  //     title: 'Test Task',
  //     projectId: testProject.id,
  //   });
  //   await use(task);
  // },
});

// ==============================================================================
// エクスポート
// ==============================================================================

export { expect } from "@playwright/test";

// ==============================================================================
// 使用例
// ==============================================================================

/**
 * 基本的な使用例:
 *
 * ```typescript
 * import { test, expect } from './fixtures/test-data-fixtures';
 *
 * test('ユーザーダッシュボード表示', async ({ page, testUser }) => {
 *   // testUserは自動的に作成される
 *   await page.goto(`/users/${testUser.id}/dashboard`);
 *   await expect(page.locator('h1')).toContainText(testUser.name);
 * });
 *
 * test('プロジェクト詳細表示', async ({ page, testProject }) => {
 *   // testProjectとtestUserは自動的に作成される
 *   await page.goto(`/projects/${testProject.id}`);
 *   await expect(page.locator('h1')).toContainText(testProject.name);
 * });
 * ```
 */

/**
 * カスタムデータ作成の例:
 *
 * ```typescript
 * import { test, expect } from './fixtures/test-data-fixtures';
 *
 * test('追加のプロジェクト作成', async ({ page, apiSeeder, testUser }) => {
 *   // 既存のtestUserに加えて、追加のプロジェクトを作成
 *   const project2 = await apiSeeder.createProject({
 *     name: 'Second Project',
 *     description: 'Additional Project',
 *     ownerId: testUser.id,
 *   });
 *
 *   await page.goto('/projects');
 *   await expect(page.locator('text=' + project2.name)).toBeVisible();
 * });
 * ```
 */

/**
 * データベース直接Seedingの例:
 *
 * ```typescript
 * import { test, expect } from './fixtures/test-data-fixtures';
 *
 * test('大量データのパフォーマンステスト', async ({ page, dbSeeder }) => {
 *   // データベースに直接100件のプロジェクトを作成（高速）
 *   const projects = [];
 *   for (let i = 0; i < 100; i++) {
 *     const project = await dbSeeder.createProject({
 *       name: `Project ${i}`,
 *       ownerId: 'test-owner-id',
 *     });
 *     projects.push(project);
 *   }
 *
 *   await page.goto('/projects');
 *   await expect(page.locator('.project-item')).toHaveCount(100);
 * });
 * ```
 */

/**
 * 並列実行の例:
 *
 * ```typescript
 * import { test, expect } from './fixtures/test-data-fixtures';
 *
 * // これらのテストは並列実行されるが、uniqueGenによりデータは完全に分離される
 * test('並列テスト1', async ({ page, testUser }) => {
 *   // Worker 0: testuser+w0_1700000000000_abc123@example.com
 *   await page.goto(`/users/${testUser.id}`);
 *   await expect(page.locator('h1')).toContainText(testUser.name);
 * });
 *
 * test('並列テスト2', async ({ page, testUser }) => {
 *   // Worker 1: testuser+w1_1700000000001_def456@example.com
 *   await page.goto(`/users/${testUser.id}`);
 *   await expect(page.locator('h1')).toContainText(testUser.name);
 * });
 * ```
 */
