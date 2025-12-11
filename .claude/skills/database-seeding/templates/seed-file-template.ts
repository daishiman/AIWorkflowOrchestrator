/**
 * シードファイルテンプレート
 *
 * このファイルをコピーして、プロジェクト固有のシードを作成してください。
 *
 * 使用方法:
 *   1. このファイルを seeds/ ディレクトリにコピー
 *   2. テーブル名とデータを更新
 *   3. pnpm run seed で実行
 */

import { faker } from "@faker-js/faker/locale/ja";
import { db } from "../db"; // プロジェクトのDB設定に合わせて変更
import { users, roles, orders, orderItems } from "../db/schema"; // スキーマをインポート
import { sql } from "drizzle-orm";

// =============================================================================
// 設定
// =============================================================================

const SEED_CONFIG = {
  // 開発環境での生成数
  development: {
    users: 50,
    ordersPerUser: 5,
    itemsPerOrder: 3,
  },
  // ステージング環境での生成数
  staging: {
    users: 500,
    ordersPerUser: 10,
    itemsPerOrder: 5,
  },
  // テスト環境での生成数
  test: {
    users: 10,
    ordersPerUser: 2,
    itemsPerOrder: 2,
  },
};

// 再現性のためにシードを固定
faker.seed(12345);

// =============================================================================
// ヘルパー関数
// =============================================================================

function getConfig() {
  const env = process.env.NODE_ENV || "development";
  return (
    SEED_CONFIG[env as keyof typeof SEED_CONFIG] || SEED_CONFIG.development
  );
}

function generateMany<T>(count: number, generator: (index: number) => T): T[] {
  return Array.from({ length: count }, (_, i) => generator(i));
}

// =============================================================================
// マスターデータ
// =============================================================================

const MASTER_ROLES = [
  { id: 1, name: "admin", displayName: "管理者", permissions: ["*"] },
  {
    id: 2,
    name: "editor",
    displayName: "編集者",
    permissions: ["read", "write"],
  },
  { id: 3, name: "viewer", displayName: "閲覧者", permissions: ["read"] },
];

async function seedRoles() {
  console.log("  Seeding roles...");

  for (const role of MASTER_ROLES) {
    await db
      .insert(roles)
      .values(role)
      .onConflictDoUpdate({
        target: roles.id,
        set: {
          name: sql`excluded.name`,
          displayName: sql`excluded.display_name`,
          permissions: sql`excluded.permissions`,
        },
      });
  }

  console.log(`  ✅ Roles seeded: ${MASTER_ROLES.length} records`);
  return MASTER_ROLES;
}

// =============================================================================
// 開発データ生成
// =============================================================================

function generateUser(index: number) {
  return {
    id: index + 1,
    email: index === 0 ? "admin@example.com" : faker.internet.email(),
    name: faker.person.fullName(),
    roleId: index === 0 ? 1 : faker.helpers.arrayElement([2, 3]),
    password: "hashed_password_placeholder", // 実際は bcrypt などでハッシュ
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };
}

function generateOrder(userId: number, index: number) {
  return {
    id: userId * 100 + index + 1,
    userId,
    status: faker.helpers.arrayElement([
      "pending",
      "processing",
      "completed",
      "cancelled",
    ]),
    totalAmount: 0, // アイテム追加後に計算
    shippingAddress: faker.location.streetAddress(),
    createdAt: faker.date.recent({ days: 90 }),
    updatedAt: new Date(),
  };
}

function generateOrderItem(orderId: number, index: number) {
  const quantity = faker.number.int({ min: 1, max: 5 });
  const unitPrice = faker.number.int({ min: 100, max: 10000 });
  return {
    id: orderId * 10 + index + 1,
    orderId,
    productName: faker.commerce.productName(),
    quantity,
    unitPrice,
    subtotal: quantity * unitPrice,
    createdAt: new Date(),
  };
}

async function seedUsers() {
  const config = getConfig();
  console.log(`  Seeding users... (${config.users} records)`);

  const userData = generateMany(config.users, generateUser);

  // バッチインサート
  const BATCH_SIZE = 100;
  for (let i = 0; i < userData.length; i += BATCH_SIZE) {
    const batch = userData.slice(i, i + BATCH_SIZE);
    await db.insert(users).values(batch).onConflictDoNothing();
  }

  console.log(`  ✅ Users seeded: ${userData.length} records`);
  return userData;
}

async function seedOrdersAndItems(userList: ReturnType<typeof generateUser>[]) {
  const config = getConfig();
  console.log(`  Seeding orders and items...`);

  let orderCount = 0;
  let itemCount = 0;

  for (const user of userList) {
    const orderData = generateMany(config.ordersPerUser, (i) =>
      generateOrder(user.id, i),
    );

    for (const order of orderData) {
      const itemData = generateMany(config.itemsPerOrder, (i) =>
        generateOrderItem(order.id, i),
      );

      // 合計金額を計算
      order.totalAmount = itemData.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );

      await db.insert(orders).values(order).onConflictDoNothing();
      await db.insert(orderItems).values(itemData).onConflictDoNothing();

      orderCount++;
      itemCount += itemData.length;
    }
  }

  console.log(`  ✅ Orders seeded: ${orderCount} records`);
  console.log(`  ✅ Order items seeded: ${itemCount} records`);
}

// =============================================================================
// テストフィクスチャ
// =============================================================================

export const TEST_FIXTURES = {
  // 注文を持つユーザー
  userWithOrders: {
    user: {
      id: 9001,
      email: "test-with-orders@example.com",
      name: "Test User 1",
    },
    orders: [
      { id: 90001, status: "pending", totalAmount: 1000 },
      { id: 90002, status: "completed", totalAmount: 2500 },
    ],
  },

  // 注文を持たないユーザー
  userWithoutOrders: {
    user: {
      id: 9002,
      email: "test-no-orders@example.com",
      name: "Test User 2",
    },
    orders: [],
  },

  // キャンセルされた注文
  cancelledOrder: {
    orderId: 90003,
    status: "cancelled",
    cancelReason: "customer_request",
  },
};

async function seedTestFixtures() {
  console.log("  Seeding test fixtures...");

  // テストユーザー
  for (const fixture of Object.values(TEST_FIXTURES)) {
    if ("user" in fixture) {
      await db
        .insert(users)
        .values({
          ...fixture.user,
          roleId: 3,
          password: "test_password_hash",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }

  console.log(`  ✅ Test fixtures seeded`);
}

// =============================================================================
// メイン処理
// =============================================================================

async function seedMaster() {
  console.log("\n📦 Seeding master data...");
  await seedRoles();
}

async function seedDevelopment() {
  console.log("\n🔧 Seeding development data...");
  const userList = await seedUsers();
  await seedOrdersAndItems(userList);
}

async function seedTest() {
  console.log("\n🧪 Seeding test fixtures...");
  await seedTestFixtures();
}

export async function runSeeds(
  options: {
    master?: boolean;
    development?: boolean;
    test?: boolean;
  } = {},
) {
  const { master = true, development = false, test = false } = options;

  console.log("🚀 Starting seed process...");
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);

  try {
    if (master) {
      await seedMaster();
    }

    if (development) {
      await seedDevelopment();
    }

    if (test) {
      await seedTest();
    }

    console.log("\n✅ All seeds completed successfully");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    throw error;
  }
}

// CLIから直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = process.env.NODE_ENV || "development";

  runSeeds({
    master: true,
    development: env === "development",
    test: env === "test",
  })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
