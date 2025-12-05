# 環境分離ガイド

## 環境の種類

### 環境定義

| 環境        | 目的           | シードデータ | セキュリティ |
| ----------- | -------------- | ------------ | ------------ |
| development | 開発・デバッグ | フルセット   | 緩い         |
| test        | 自動テスト     | フィクスチャ | -            |
| staging     | 本番前検証     | 本番相当     | 本番同等     |
| production  | 本番運用       | 最小限       | 厳格         |

### 環境変数による制御

```typescript
// 環境タイプの定義
type Environment = "development" | "test" | "staging" | "production";

function getEnvironment(): Environment {
  const env = process.env.NODE_ENV;

  if (["development", "test", "staging", "production"].includes(env!)) {
    return env as Environment;
  }

  return "development";
}

// 環境チェック関数
const isDevelopment = () => getEnvironment() === "development";
const isTest = () => getEnvironment() === "test";
const isStaging = () => getEnvironment() === "staging";
const isProduction = () => getEnvironment() === "production";
```

## シード実行の制御

### 基本的な分岐

```typescript
async function runSeeds(db: Database) {
  const env = getEnvironment();

  console.log(`Running seeds for: ${env}`);

  // すべての環境で実行
  await seedMasterData(db);

  // 環境別の処理
  switch (env) {
    case "production":
      // 本番は最小限
      await seedProductionDefaults(db);
      break;

    case "staging":
      // ステージングは本番相当 + テストデータ
      await seedProductionDefaults(db);
      await seedStagingData(db);
      break;

    case "test":
      // テストは固定フィクスチャ
      await seedTestFixtures(db);
      break;

    case "development":
    default:
      // 開発はフルセット
      await seedDevelopmentData(db);
      break;
  }
}
```

### 明示的なフラグ制御

```typescript
interface SeedConfig {
  environment: Environment;
  options: {
    includeMaster: boolean;
    includeDevelopment: boolean;
    includeTestData: boolean;
    sampleDataCount: number;
  };
}

const seedConfigs: Record<Environment, SeedConfig["options"]> = {
  production: {
    includeMaster: true,
    includeDevelopment: false,
    includeTestData: false,
    sampleDataCount: 0,
  },
  staging: {
    includeMaster: true,
    includeDevelopment: false,
    includeTestData: true,
    sampleDataCount: 1000,
  },
  test: {
    includeMaster: true,
    includeDevelopment: false,
    includeTestData: true,
    sampleDataCount: 20,
  },
  development: {
    includeMaster: true,
    includeDevelopment: true,
    includeTestData: true,
    sampleDataCount: 100,
  },
};

async function runSeedsWithConfig(db: Database) {
  const env = getEnvironment();
  const config = seedConfigs[env];

  if (config.includeMaster) {
    await seedMasterData(db);
  }

  if (config.includeDevelopment) {
    await seedDevelopmentData(db);
  }

  if (config.includeTestData && config.sampleDataCount > 0) {
    await seedSampleData(db, config.sampleDataCount);
  }
}
```

## 本番環境の保護

### 本番実行の防止

```typescript
// 開発データのシード関数
async function seedDevelopmentData(db: Database) {
  // 本番環境では絶対に実行しない
  if (isProduction()) {
    throw new Error(
      "Development seeds cannot be run in production environment",
    );
  }

  await seedDummyUsers(db);
  await seedDummyOrders(db);
}

// 破壊的操作の保護
async function resetDatabase(db: Database) {
  if (isProduction()) {
    throw new Error("Database reset is not allowed in production");
  }

  if (isStaging()) {
    // ステージングでは確認を要求
    const confirmed = await confirmReset();
    if (!confirmed) {
      throw new Error("Reset cancelled by user");
    }
  }

  await db.execute(sql`TRUNCATE ALL TABLES CASCADE`);
}
```

### 確認プロンプト

```typescript
import * as readline from "readline";

async function confirmProductionSeed(): Promise<boolean> {
  if (!isProduction()) {
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log("\n⚠️  WARNING: You are about to run seeds in PRODUCTION");
    console.log(
      "Database:",
      process.env.DATABASE_URL?.substring(0, 30) + "...",
    );
    console.log("");

    rl.question('Type "PRODUCTION" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === "PRODUCTION");
    });
  });
}

// 使用例
async function main() {
  if (isProduction()) {
    const confirmed = await confirmProductionSeed();
    if (!confirmed) {
      console.log("Seed cancelled");
      process.exit(1);
    }
  }

  await runSeeds(db);
}
```

## データの匿名化

### 本番データからの開発データ作成

```typescript
// 個人情報の匿名化
function anonymizeUser(user: User): User {
  return {
    ...user,
    email: `user${user.id}@example.com`,
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    // IDや参照関係は保持
    id: user.id,
    roleId: user.roleId,
    createdAt: user.createdAt,
  };
}

// バッチ匿名化
async function anonymizeProductionData(sourcDb: Database, targetDb: Database) {
  // ユーザーデータ
  const users = await sourcDb.select().from(usersTable);
  const anonymizedUsers = users.map(anonymizeUser);
  await targetDb.insert(usersTable).values(anonymizedUsers);

  // 注文データ（金額は保持、詳細は匿名化）
  const orders = await sourcDb.select().from(ordersTable);
  const anonymizedOrders = orders.map((order) => ({
    ...order,
    shippingAddress: faker.location.streetAddress(),
    billingAddress: faker.location.streetAddress(),
  }));
  await targetDb.insert(ordersTable).values(anonymizedOrders);
}
```

### PII検出

```typescript
// 個人情報が含まれていないか検証
function validateNoRealPII(data: unknown): void {
  const json = JSON.stringify(data);

  // 実際のメールアドレスパターン（@example.com以外）
  const realEmailPattern =
    /[a-zA-Z0-9._%+-]+@(?!example\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (realEmailPattern.test(json)) {
    throw new Error("Real email addresses detected in seed data");
  }

  // 電話番号パターン（日本）
  const phonePattern = /0\d{1,4}-\d{1,4}-\d{4}/g;
  if (phonePattern.test(json)) {
    console.warn("Phone numbers detected - ensure they are fake");
  }

  // 実際の住所パターン（簡易チェック）
  const addressPatterns = ["東京都", "大阪府", "神奈川県"];
  for (const pattern of addressPatterns) {
    if (json.includes(pattern)) {
      console.warn(`Real address pattern "${pattern}" detected`);
    }
  }
}
```

## 環境別データベース設定

### 接続文字列の管理

```typescript
// .env.development
// DATABASE_URL=sqlite://dev:dev@localhost:5432/myapp_dev

// .env.test
// DATABASE_URL=sqlite://test:test@localhost:5432/myapp_test

// .env.production
// DATABASE_URL=sqlite://prod:***@prod-server/myapp

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // 本番URLの検証
  if (isProduction() && !url.includes("prod")) {
    console.warn(
      'Warning: Production environment but URL does not contain "prod"',
    );
  }

  return url;
}
```

### 接続プール設定

```typescript
const poolConfigs: Record<Environment, PoolConfig> = {
  development: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  test: {
    max: 5,
    min: 1,
    idleTimeoutMillis: 10000,
  },
  staging: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
  },
  production: {
    max: 50,
    min: 10,
    idleTimeoutMillis: 30000,
  },
};
```

## CI/CD統合

### GitHub Actions例

```yaml
# .github/workflows/seed.yml
name: Database Seed

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
        type: choice
        options:
          - development
          - staging
      seed_type:
        description: "Seed type"
        required: true
        type: choice
        options:
          - master
          - full
          - reset

jobs:
  seed:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: pnpm ci

      - name: Run seeds
        env:
          NODE_ENV: ${{ github.event.inputs.environment }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          pnpm run seed -- --type ${{ github.event.inputs.seed_type }}
```

## チェックリスト

### 環境設計時

- [ ] 環境タイプが明確に定義されているか？
- [ ] 各環境のシードポリシーが決まっているか？
- [ ] 本番保護機構があるか？

### 実装時

- [ ] 環境変数で適切に分岐しているか？
- [ ] 本番で開発シードが実行されないか？
- [ ] 確認プロンプトがあるか？

### セキュリティ

- [ ] 本番データは匿名化されているか？
- [ ] PIIが開発環境に流出していないか？
- [ ] 接続文字列は安全に管理されているか？
