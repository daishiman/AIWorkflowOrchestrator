# シード戦略パターン

## シードの分類

### 1. マスターシード（Master Seed）

すべての環境で必要な基本データ。

```typescript
// 例: ロール定義
const roles = [
  { id: 1, name: "admin", displayName: "管理者", permissions: ["*"] },
  {
    id: 2,
    name: "editor",
    displayName: "編集者",
    permissions: ["read", "write"],
  },
  { id: 3, name: "viewer", displayName: "閲覧者", permissions: ["read"] },
];

// 例: アプリケーション設定
const settings = [
  { key: "app.name", value: "MyApp", description: "アプリケーション名" },
  { key: "app.timezone", value: "Asia/Tokyo", description: "タイムゾーン" },
];

// 例: カテゴリマスター
const categories = [
  { id: 1, name: "electronics", displayName: "電子機器" },
  { id: 2, name: "books", displayName: "書籍" },
  { id: 3, name: "clothing", displayName: "衣類" },
];
```

**特徴**:

- 静的で変更が少ない
- IDが固定されることが多い
- すべての環境で同一

### 2. 開発シード（Development Seed）

開発環境でのテスト・デバッグ用データ。

```typescript
import { faker } from "@faker-js/faker/locale/ja";

// 開発用ユーザー
const devUsers = [
  // 固定の開発アカウント
  {
    email: "admin@example.com",
    password: "password123", // 開発環境のみ
    role: "admin",
  },
  {
    email: "user@example.com",
    password: "password123",
    role: "user",
  },
  // ランダム生成ユーザー
  ...Array.from({ length: 50 }, () => ({
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: "user",
  })),
];
```

**特徴**:

- リアルなダミーデータ
- エッジケースを含む
- 本番には投入しない

### 3. テストシード（Test Seed）

自動テスト用の決定論的データ。

```typescript
// テスト用フィクスチャ
export const testFixtures = {
  // 特定のテストシナリオ用
  userWithOrders: {
    user: { id: 1001, email: "test-user@example.com" },
    orders: [
      { id: 2001, userId: 1001, status: "pending", total: 1000 },
      { id: 2002, userId: 1001, status: "completed", total: 2500 },
    ],
  },

  // エッジケース
  userWithNoOrders: {
    user: { id: 1002, email: "no-orders@example.com" },
    orders: [],
  },

  // 境界値テスト
  orderWithMaxItems: {
    orderId: 3001,
    itemCount: 100, // 最大アイテム数
  },
};
```

**特徴**:

- 決定論的（毎回同じ結果）
- テストケースに直接対応
- 最小限のデータ

### 4. 本番シード（Production Seed）

本番環境の初期設定データ。

```typescript
// 本番初期データ（最小限）
const productionSeeds = {
  // 最初の管理者
  adminUser: {
    email: process.env.ADMIN_EMAIL,
    // パスワードは環境変数または初期設定フローで設定
  },

  // 必須設定
  requiredSettings: [
    { key: "app.initialized", value: "true" },
    { key: "app.version", value: "1.0.0" },
  ],
};
```

**特徴**:

- 最小限のデータ
- セキュリティを考慮
- 機密情報は環境変数から

## シード実行戦略

### 戦略1: 環境別実行

```typescript
// seeds/index.ts
import { seedMaster } from "./master";
import { seedDevelopment } from "./development";
import { seedTest } from "./test";
import { seedProduction } from "./production";

export async function runSeeds(db: Database) {
  const env = process.env.NODE_ENV || "development";

  // すべての環境でマスターシードを実行
  await seedMaster(db);

  switch (env) {
    case "production":
      await seedProduction(db);
      break;
    case "test":
      await seedTest(db);
      break;
    case "development":
    default:
      await seedDevelopment(db);
      break;
  }
}
```

### 戦略2: フラグ制御

```typescript
interface SeedOptions {
  master?: boolean;
  development?: boolean;
  sample?: boolean;
  reset?: boolean;
}

export async function runSeeds(db: Database, options: SeedOptions) {
  if (options.reset) {
    await resetDatabase(db);
  }

  if (options.master !== false) {
    await seedMaster(db);
  }

  if (options.development) {
    await seedDevelopment(db);
  }

  if (options.sample) {
    await seedSampleData(db);
  }
}

// 使用例
// pnpm run seed -- --master --development
// pnpm run seed -- --reset --master
```

### 戦略3: 増分シード

```typescript
// マイグレーションスタイルのシード管理
const seedMigrations = [
  { version: "001", name: "initial_roles", run: seedRoles },
  { version: "002", name: "initial_categories", run: seedCategories },
  { version: "003", name: "admin_user", run: seedAdminUser },
];

export async function runSeedMigrations(db: Database) {
  // 実行済みシードを取得
  const executed = await db.select().from(seedHistory);
  const executedVersions = new Set(executed.map((s) => s.version));

  // 未実行のシードを順番に実行
  for (const seed of seedMigrations) {
    if (!executedVersions.has(seed.version)) {
      console.log(`Running seed: ${seed.name}`);
      await seed.run(db);
      await db.insert(seedHistory).values({
        version: seed.version,
        name: seed.name,
        executedAt: new Date(),
      });
    }
  }
}
```

## 依存関係の管理

### 依存関係グラフ

```
┌─────────────┐
│   roles     │  ← 独立（最初に実行）
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   users     │  ← rolesに依存
└──────┬──────┘
       │
       ├─────────────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   orders    │ │   posts     │  ← usersに依存
└──────┬──────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│ order_items │  ← ordersに依存
└─────────────┘
```

### 実装パターン

```typescript
// 依存関係を考慮したシード実行
async function seedAll(db: Database) {
  // レベル0: 独立テーブル
  const [roles, categories] = await Promise.all([
    seedRoles(db),
    seedCategories(db),
  ]);

  // レベル1: rolesに依存
  const users = await seedUsers(db, roles);

  // レベル2: usersに依存
  const [orders, posts] = await Promise.all([
    seedOrders(db, users),
    seedPosts(db, users),
  ]);

  // レベル3: ordersに依存
  await seedOrderItems(db, orders);

  return { roles, categories, users, orders, posts };
}
```

## データ量の設計

### 環境別データ量

| 環境         | ユーザー数 | 注文数  | 目的                   |
| ------------ | ---------- | ------- | ---------------------- |
| 開発         | 50-100     | 200-500 | 一般的なシナリオテスト |
| テスト       | 10-20      | 50-100  | 特定シナリオの検証     |
| ステージング | 1000+      | 10000+  | パフォーマンステスト   |
| 本番         | 最小限     | 0       | 初期設定のみ           |

### スケーラブルなシード設計

```typescript
// データ量を設定可能に
interface SeedConfig {
  userCount: number;
  ordersPerUser: number;
  itemsPerOrder: number;
}

const configs: Record<string, SeedConfig> = {
  development: { userCount: 50, ordersPerUser: 5, itemsPerOrder: 3 },
  staging: { userCount: 1000, ordersPerUser: 10, itemsPerOrder: 5 },
  performance: { userCount: 10000, ordersPerUser: 20, itemsPerOrder: 10 },
};

async function seedWithConfig(db: Database, config: SeedConfig) {
  const users = await createUsers(db, config.userCount);

  for (const user of users) {
    const orders = await createOrders(db, user.id, config.ordersPerUser);
    for (const order of orders) {
      await createOrderItems(db, order.id, config.itemsPerOrder);
    }
  }
}
```

## チェックリスト

### シード設計時

- [ ] データ分類（マスター/開発/テスト/本番）が明確か？
- [ ] 依存関係が整理されているか？
- [ ] 環境ごとの戦略が決まっているか？
- [ ] データ量が適切か？

### 実装時

- [ ] 冪等性が確保されているか？
- [ ] エラーハンドリングがあるか？
- [ ] ログ出力があるか？
- [ ] ロールバック可能か？

### 運用時

- [ ] シード実行手順が文書化されているか？
- [ ] 本番シードの承認フローがあるか？
- [ ] シードのバージョン管理ができているか？
