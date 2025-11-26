# データ分離技術

並列実行するE2Eテストにおいて、データ分離は安定性と速度の両立に不可欠です。
このリソースでは、Playwright E2Eテストでテスト間のデータ競合を防ぐための技術を解説します。

---

## 目次

1. [データ分離の必要性](#データ分離の必要性)
2. [一意性確保戦略](#一意性確保戦略)
3. [名前空間パターン](#名前空間パターン)
4. [テナント分離パターン](#テナント分離パターン)
5. [並列実行の最適化](#並列実行の最適化)

---

## データ分離の必要性

### 並列実行時の問題

Playwrightはデフォルトで**複数のテストを並列実行**します。データ分離が不十分な場合、以下の問題が発生します:

❌ **データ競合**: 同じメールアドレスで複数ユーザーを同時作成 → UNIQUE制約違反
❌ **不安定なテスト**: テストAが作成したデータをテストBが誤って参照
❌ **予期しない状態**: 並列テストがお互いのデータを上書き・削除
❌ **デバッグ困難**: 問題が再現しない（並列実行の順序に依存）

### データ分離の原則

✅ **完全分離**: 各テストが独立したデータセットを使用
✅ **一意性**: すべてのリソースが一意の識別子を持つ
✅ **予測可能性**: テスト実行順序に依存しない
✅ **クリーンアップ**: 各テストが自分のデータのみをクリーンアップ
✅ **スケーラビリティ**: ワーカー数を増やしても問題が発生しない

---

## 一意性確保戦略

### 1. タイムスタンプベースの一意性

最もシンプルな方法。`Date.now()`を使用して一意の識別子を生成。

```typescript
// tests/helpers/unique-generator.ts
export class UniqueGenerator {
  /**
   * タイムスタンプベースの一意のメールアドレス生成
   */
  static email(baseEmail: string): string {
    const timestamp = Date.now();
    const [local, domain] = baseEmail.split('@');
    return `${local}+${timestamp}@${domain}`;
  }

  /**
   * タイムスタンプベースの一意の名前生成
   */
  static name(baseName: string): string {
    return `${baseName}_${Date.now()}`;
  }

  /**
   * タイムスタンプ + ランダム文字列
   */
  static id(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
```

### 使用例

```typescript
// tests/user-registration.spec.ts
import { test, expect } from '@playwright/test';
import { UniqueGenerator } from './helpers/unique-generator';

test('ユーザー登録', async ({ page }) => {
  const email = UniqueGenerator.email('testuser@example.com');
  const name = UniqueGenerator.name('Test User');

  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="name"]', name);
  await page.click('button:has-text("登録")');

  await expect(page).toHaveURL('/dashboard');
});
```

**メリット**: 実装が簡単、追加の依存なし
**デメリット**: 同一ミリ秒内に実行されると衝突の可能性（極めて稀）

---

### 2. UUIDベースの一意性

UUIDv4を使用して、完全に一意な識別子を生成。

```typescript
// tests/helpers/uuid-generator.ts
import { randomUUID } from 'crypto';

export class UuidGenerator {
  /**
   * UUID v4ベースの一意のメールアドレス生成
   */
  static email(baseEmail: string): string {
    const uuid = randomUUID();
    const [local, domain] = baseEmail.split('@');
    return `${local}+${uuid}@${domain}`;
  }

  /**
   * UUID v4ベースの一意の名前生成
   */
  static name(baseName: string): string {
    const uuid = randomUUID().slice(0, 8); // 短縮版
    return `${baseName}_${uuid}`;
  }

  /**
   * 完全なUUID v4
   */
  static id(): string {
    return randomUUID();
  }
}
```

### 使用例

```typescript
// tests/project-creation.spec.ts
import { test, expect } from '@playwright/test';
import { UuidGenerator } from './helpers/uuid-generator';

test('プロジェクト作成', async ({ page }) => {
  const projectName = UuidGenerator.name('Test Project');

  await page.goto('/projects/new');
  await page.fill('input[name="name"]', projectName);
  await page.click('button:has-text("作成")');

  await expect(page.locator('h1')).toContainText(projectName);
});
```

**メリット**: 完全に一意、衝突の可能性ゼロ
**デメリット**: 長い文字列（36文字）、可読性が低い

---

### 3. Worker ID + タイムスタンプの組み合わせ

Playwrightのworker IDを使用して、ワーカーごとに一意のデータセットを作成。

```typescript
// tests/helpers/worker-unique-generator.ts
export class WorkerUniqueGenerator {
  private workerId: string;

  constructor(workerIndex: number) {
    this.workerId = `w${workerIndex}`;
  }

  /**
   * Worker ID + タイムスタンプの組み合わせ
   */
  email(baseEmail: string): string {
    const timestamp = Date.now();
    const [local, domain] = baseEmail.split('@');
    return `${local}+${this.workerId}_${timestamp}@${domain}`;
  }

  name(baseName: string): string {
    return `${baseName}_${this.workerId}_${Date.now()}`;
  }

  id(): string {
    return `${this.workerId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
```

### Fixtureとして提供

```typescript
// tests/fixtures/worker-fixtures.ts
import { test as base } from '@playwright/test';
import { WorkerUniqueGenerator } from '../helpers/worker-unique-generator';

type WorkerFixtures = {
  uniqueGen: WorkerUniqueGenerator;
};

export const test = base.extend<WorkerFixtures>({
  uniqueGen: async ({}, use, testInfo) => {
    const generator = new WorkerUniqueGenerator(testInfo.parallelIndex);
    await use(generator);
  },
});

export { expect } from '@playwright/test';
```

### 使用例

```typescript
// tests/parallel-user-creation.spec.ts
import { test, expect } from './fixtures/worker-fixtures';

test('並列ユーザー作成 1', async ({ page, uniqueGen }) => {
  const email = uniqueGen.email('user@test.com');
  // Worker 0: user+w0_1700000000000@test.com

  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.click('button:has-text("登録")');
  await expect(page).toHaveURL('/dashboard');
});

test('並列ユーザー作成 2', async ({ page, uniqueGen }) => {
  const email = uniqueGen.email('user@test.com');
  // Worker 1: user+w1_1700000000001@test.com

  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.click('button:has-text("登録")');
  await expect(page).toHaveURL('/dashboard');
});
```

**メリット**: ワーカーごとに完全分離、デバッグが容易（ログからworker IDで追跡可能）
**デメリット**: Playwrightの`testInfo`に依存

---

## 名前空間パターン

### コンセプト

各テストまたはテストスイートに専用の「名前空間」を割り当て、その名前空間内でのみデータを管理。

### 実装

```typescript
// tests/helpers/namespace-manager.ts
export class NamespaceManager {
  private namespace: string;
  private createdResources: Map<string, Set<string>>;

  constructor(testName: string, workerIndex: number) {
    // テスト名 + worker ID + タイムスタンプで名前空間を作成
    this.namespace = `${testName}_w${workerIndex}_${Date.now()}`
      .replace(/[^a-zA-Z0-9_]/g, '_') // 特殊文字を除去
      .toLowerCase();
    this.createdResources = new Map();
  }

  /**
   * 名前空間付きのリソース名を生成
   */
  resourceName(baseName: string): string {
    return `${this.namespace}__${baseName}`;
  }

  /**
   * 名前空間付きのメールアドレスを生成
   */
  email(baseEmail: string): string {
    const [local, domain] = baseEmail.split('@');
    return `${local}+${this.namespace}@${domain}`;
  }

  /**
   * リソースを追跡
   */
  trackResource(resourceType: string, resourceId: string) {
    if (!this.createdResources.has(resourceType)) {
      this.createdResources.set(resourceType, new Set());
    }
    this.createdResources.get(resourceType)!.add(resourceId);
  }

  /**
   * この名前空間のすべてのリソースIDを取得
   */
  getTrackedResources(resourceType: string): string[] {
    return Array.from(this.createdResources.get(resourceType) || []);
  }

  /**
   * 名前空間を取得
   */
  getNamespace(): string {
    return this.namespace;
  }
}
```

### Fixtureとして提供

```typescript
// tests/fixtures/namespace-fixtures.ts
import { test as base } from '@playwright/test';
import { NamespaceManager } from '../helpers/namespace-manager';

type NamespaceFixtures = {
  namespace: NamespaceManager;
};

export const test = base.extend<NamespaceFixtures>({
  namespace: async ({}, use, testInfo) => {
    const manager = new NamespaceManager(
      testInfo.title,
      testInfo.parallelIndex
    );
    await use(manager);
  },
});

export { expect } from '@playwright/test';
```

### 使用例

```typescript
// tests/namespaced-projects.spec.ts
import { test, expect } from './fixtures/namespace-fixtures';
import { ApiSeeder } from './helpers/api-seeder';

test.describe('名前空間付きプロジェクト管理', () => {
  let seeder: ApiSeeder;

  test.beforeEach(async ({ namespace }) => {
    seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();
    console.log(`Test namespace: ${namespace.getNamespace()}`);
  });

  test('プロジェクト作成と削除', async ({ page, namespace }) => {
    // 名前空間付きでユーザー作成
    const userEmail = namespace.email('user@test.com');
    const user = await seeder.createUser({
      email: userEmail,
      name: namespace.resourceName('Test User'),
    });
    namespace.trackResource('users', user.id);

    // 名前空間付きでプロジェクト作成
    const projectName = namespace.resourceName('Project');
    const project = await seeder.createProject({
      name: projectName,
      description: 'Namespaced project',
      ownerId: user.id,
    });
    namespace.trackResource('projects', project.id);

    await page.goto(`/projects/${project.id}`);
    await expect(page.locator('h1')).toContainText(projectName);
  });

  test.afterEach(async ({ namespace }) => {
    // 名前空間内のリソースをクリーンアップ
    const projectIds = namespace.getTrackedResources('projects');
    for (const id of projectIds) {
      await seeder.deleteProject(id).catch(console.error);
    }

    const userIds = namespace.getTrackedResources('users');
    for (const id of userIds) {
      await seeder.deleteUser(id).catch(console.error);
    }

    await seeder.dispose();
  });
});
```

**メリット**:
- テストごとに完全に分離されたデータセット
- リソース追跡が容易
- デバッグ時に名前空間でフィルタリング可能

**デメリット**:
- リソース名が長くなる
- 実装が複雑

---

## テナント分離パターン

### コンセプト

マルチテナントアーキテクチャのアプリケーションの場合、各テストに専用のテナントを割り当てる。

### 実装

```typescript
// tests/helpers/tenant-manager.ts
export class TenantManager {
  private tenantId: string;
  private tenantName: string;

  constructor(testName: string, workerIndex: number) {
    this.tenantId = `tenant_${workerIndex}_${Date.now()}`;
    this.tenantName = `Tenant ${testName} (Worker ${workerIndex})`;
  }

  async createTenant(seeder: ApiSeeder) {
    const tenant = await seeder.createTenant({
      id: this.tenantId,
      name: this.tenantName,
      plan: 'test',
    });
    return tenant;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  /**
   * テナントスコープ内でリソースを作成
   */
  async createUserInTenant(seeder: ApiSeeder, userData: any) {
    return seeder.createUser({
      ...userData,
      tenantId: this.tenantId,
    });
  }

  async createProjectInTenant(seeder: ApiSeeder, projectData: any) {
    return seeder.createProject({
      ...projectData,
      tenantId: this.tenantId,
    });
  }

  /**
   * テナントごと削除（カスケード削除）
   */
  async deleteTenant(seeder: ApiSeeder) {
    await seeder.deleteTenant(this.tenantId);
    // テナントに紐づくすべてのデータが自動削除される
  }
}
```

### Fixtureとして提供

```typescript
// tests/fixtures/tenant-fixtures.ts
import { test as base } from '@playwright/test';
import { TenantManager } from '../helpers/tenant-manager';
import { ApiSeeder } from '../helpers/api-seeder';

type TenantFixtures = {
  tenantManager: TenantManager;
  tenantSeeder: ApiSeeder;
};

export const test = base.extend<TenantFixtures>({
  tenantManager: async ({}, use, testInfo) => {
    const manager = new TenantManager(testInfo.title, testInfo.parallelIndex);
    await use(manager);
  },

  tenantSeeder: async ({ tenantManager }, use) => {
    const seeder = new ApiSeeder(process.env.BASE_URL!);
    await seeder.initialize();
    await seeder.authenticate('admin@test.com', 'AdminPass123!');

    // テナント作成
    await tenantManager.createTenant(seeder);

    await use(seeder);

    // テナントごと削除（カスケード）
    await tenantManager.deleteTenant(seeder);
    await seeder.dispose();
  },
});

export { expect } from '@playwright/test';
```

### 使用例

```typescript
// tests/multi-tenant.spec.ts
import { test, expect } from './fixtures/tenant-fixtures';

test('テナント分離されたプロジェクト作成', async ({
  page,
  tenantManager,
  tenantSeeder,
}) => {
  // このテスト専用のテナント内でユーザー作成
  const user = await tenantManager.createUserInTenant(tenantSeeder, {
    email: 'user@test.com',
    name: 'Tenant User',
  });

  // このテスト専用のテナント内でプロジェクト作成
  const project = await tenantManager.createProjectInTenant(tenantSeeder, {
    name: 'Tenant Project',
    description: 'Isolated in tenant',
    ownerId: user.id,
  });

  await page.goto(`/projects/${project.id}`);
  await expect(page.locator('h1')).toContainText('Tenant Project');

  // テスト終了後、テナントごと削除される（カスケード）
});
```

**メリット**:
- 完全なデータ分離
- シンプルなクリーンアップ（テナント削除のみ）
- 実際のマルチテナント環境に近い

**デメリット**:
- マルチテナントアーキテクチャが必要
- テナント作成のオーバーヘッド

---

## 並列実行の最適化

### Playwright設定

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // すべてのテストを並列実行
  workers: process.env.CI ? 2 : undefined, // CI環境ではworker数を制限
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### Worker数の最適化

```bash
# ローカル開発: CPUコア数に応じて自動調整
pnpm playwright test

# CI環境: worker数を制限（メモリ制約を考慮）
pnpm playwright test --workers=2

# シングルワーカー（デバッグ用）
pnpm playwright test --workers=1
```

---

## ベストプラクティス

### DO ✅

- **常に一意性を確保**: タイムスタンプ、UUID、worker IDを活用
- **名前空間を使用**: テストごとに専用の名前空間を割り当てる
- **リソース追跡**: 作成したリソースを確実に追跡し、クリーンアップ
- **並列実行テスト**: ローカルで`--workers=4`などで並列実行をテスト
- **ログに一意IDを含める**: デバッグ時に特定のテストのログを追跡可能に

### DON'T ❌

- **固定値を使用しない**: `testuser@example.com`など、固定のメールアドレスは使用禁止
- **グローバル状態に依存しない**: テスト間で共有されるデータに依存しない
- **worker数に依存しない**: worker数が変わっても動作するように設計
- **順序依存を作らない**: テストAが成功しないとテストBが動かない、という設計を避ける
- **過度に複雑にしない**: シンプルなタイムスタンプベースから始める

---

## まとめ

データ分離技術は、並列実行可能で安定したE2Eテストの基盤です。
以下の戦略を組み合わせて、プロジェクトに最適なアプローチを選択してください:

1. **タイムスタンプベース**: シンプルで実装が容易
2. **UUIDベース**: 完全な一意性が必要な場合
3. **Worker ID + タイムスタンプ**: デバッグが容易
4. **名前空間パターン**: テストごとに完全分離
5. **テナント分離**: マルチテナントアプリケーションの場合

**推奨アプローチ**:
- 小規模プロジェクト: タイムスタンプベースから始める
- 中規模プロジェクト: Worker ID + タイムスタンプ + Fixture
- 大規模プロジェクト: 名前空間パターンまたはテナント分離
