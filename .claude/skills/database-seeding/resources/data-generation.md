# データ生成テクニック

## Faker.jsの活用

### 基本的な使い方

```typescript
import { faker } from "@faker-js/faker";
import { faker as fakerJa } from "@faker-js/faker/locale/ja";

// 日本語ロケールを使用
fakerJa.seed(12345); // 再現性のためにシードを設定

// 基本的なデータ生成
const user = {
  id: faker.string.uuid(),
  name: fakerJa.person.fullName(),
  email: faker.internet.email(),
  phone: fakerJa.phone.number(),
  address: {
    prefecture: fakerJa.location.state(),
    city: fakerJa.location.city(),
    street: fakerJa.location.streetAddress(),
    zipCode: fakerJa.location.zipCode(),
  },
  createdAt: faker.date.past(),
};
```

### カテゴリ別データ生成

```typescript
// 人物データ
const person = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  fullName: faker.person.fullName(),
  gender: faker.person.gender(),
  bio: faker.person.bio(),
  jobTitle: faker.person.jobTitle(),
};

// 会社データ
const company = {
  name: faker.company.name(),
  catchPhrase: faker.company.catchPhrase(),
  buzzPhrase: faker.company.buzzPhrase(),
};

// 商品データ
const product = {
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
  category: faker.commerce.department(),
  material: faker.commerce.productMaterial(),
};

// 日時データ
const dates = {
  past: faker.date.past({ years: 1 }),
  future: faker.date.future({ years: 1 }),
  between: faker.date.between({
    from: "2024-01-01",
    to: "2024-12-31",
  }),
  recent: faker.date.recent({ days: 7 }),
};

// 画像データ
const images = {
  avatar: faker.image.avatar(),
  url: faker.image.url(),
  placeholder: faker.image.urlPlaceholder({ width: 640, height: 480 }),
};
```

### 一括生成

```typescript
// ヘルパー関数
function generateMany<T>(count: number, generator: () => T): T[] {
  return Array.from({ length: count }, generator);
}

// 使用例
const users = generateMany(100, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.date.past(),
}));

// インデックス付き生成
const numberedUsers = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  email: `user${index + 1}@example.com`,
  name: faker.person.fullName(),
}));
```

## ファクトリパターン

### 基本的なファクトリ

```typescript
// ファクトリ定義
interface UserFactory {
  build(overrides?: Partial<User>): User;
  buildMany(count: number, overrides?: Partial<User>): User[];
  create(db: Database, overrides?: Partial<User>): Promise<User>;
  createMany(
    db: Database,
    count: number,
    overrides?: Partial<User>,
  ): Promise<User[]>;
}

function createUserFactory(): UserFactory {
  let sequence = 0;

  const build = (overrides: Partial<User> = {}): User => {
    sequence++;
    return {
      id: sequence,
      email: `user${sequence}@example.com`,
      name: faker.person.fullName(),
      role: "user",
      createdAt: new Date(),
      ...overrides,
    };
  };

  return {
    build,
    buildMany: (count, overrides) =>
      Array.from({ length: count }, () => build(overrides)),

    create: async (db, overrides) => {
      const user = build(overrides);
      await db.insert(users).values(user);
      return user;
    },

    createMany: async (db, count, overrides) => {
      const userList = Array.from({ length: count }, () => build(overrides));
      await db.insert(users).values(userList);
      return userList;
    },
  };
}

// 使用例
const userFactory = createUserFactory();

// メモリ上で生成
const user = userFactory.build({ role: "admin" });
const users = userFactory.buildMany(10);

// DBに作成
const createdUser = await userFactory.create(db, { role: "admin" });
const createdUsers = await userFactory.createMany(db, 50);
```

### 関連データのファクトリ

```typescript
// 関連を持つファクトリ
interface OrderFactory {
  createWithItems(
    db: Database,
    userId: number,
    itemCount?: number,
  ): Promise<{ order: Order; items: OrderItem[] }>;
}

function createOrderFactory(): OrderFactory {
  let orderSequence = 0;
  let itemSequence = 0;

  return {
    createWithItems: async (db, userId, itemCount = 3) => {
      orderSequence++;

      const order: Order = {
        id: orderSequence,
        userId,
        status: faker.helpers.arrayElement([
          "pending",
          "processing",
          "completed",
        ]),
        totalAmount: 0,
        createdAt: faker.date.recent(),
      };

      const items: OrderItem[] = Array.from({ length: itemCount }, () => {
        itemSequence++;
        const quantity = faker.number.int({ min: 1, max: 5 });
        const unitPrice = faker.number.int({ min: 100, max: 10000 });
        return {
          id: itemSequence,
          orderId: order.id,
          productName: faker.commerce.productName(),
          quantity,
          unitPrice,
          subtotal: quantity * unitPrice,
        };
      });

      order.totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      await db.insert(orders).values(order);
      await db.insert(orderItems).values(items);

      return { order, items };
    },
  };
}
```

## エッジケースの生成

### 境界値データ

```typescript
const edgeCases = {
  // 文字列の境界
  strings: {
    empty: "",
    singleChar: "a",
    maxLength: "a".repeat(255),
    unicode: "日本語テスト 🎉",
    specialChars: "O'Brien & Co.",
    whitespace: "  前後に空白  ",
    newlines: "複数\n行の\nテキスト",
  },

  // 数値の境界
  numbers: {
    zero: 0,
    negative: -1,
    maxInt: Number.MAX_SAFE_INTEGER,
    minInt: Number.MIN_SAFE_INTEGER,
    decimal: 123.456789,
  },

  // 日付の境界
  dates: {
    epoch: new Date(0),
    farPast: new Date("1900-01-01"),
    farFuture: new Date("2100-12-31"),
    leapYear: new Date("2024-02-29"),
    endOfMonth: new Date("2024-01-31"),
  },

  // 配列の境界
  arrays: {
    empty: [],
    single: ["item"],
    large: Array.from({ length: 1000 }, (_, i) => `item${i}`),
  },
};

// エッジケースを含むユーザー生成
function generateEdgeCaseUsers() {
  return [
    { email: "normal@example.com", name: "Normal User" },
    { email: "a@b.co", name: "A" }, // 最短
    { email: `${"a".repeat(50)}@${"b".repeat(50)}.com`, name: "a".repeat(255) }, // 最長
    { email: "o'brien@example.com", name: "O'Brien" }, // 特殊文字
    { email: "unicode@example.com", name: "田中太郎 🎉" }, // Unicode
  ];
}
```

### 現実的なシナリオ

```typescript
// ビジネスシナリオに基づくデータ
const businessScenarios = {
  // 新規ユーザー
  newUser: {
    user: { registeredAt: faker.date.recent({ days: 7 }) },
    orders: [], // 注文なし
  },

  // アクティブユーザー
  activeUser: {
    user: { registeredAt: faker.date.past({ years: 1 }) },
    orders: generateMany(20, () => ({
      status: "completed",
      createdAt: faker.date.past({ years: 1 }),
    })),
  },

  // 離脱ユーザー
  churnedUser: {
    user: {
      registeredAt: faker.date.past({ years: 2 }),
      lastLoginAt: faker.date.past({ years: 1 }),
    },
    orders: generateMany(5, () => ({
      status: "completed",
      createdAt: faker.date.past({ years: 2 }),
    })),
  },

  // 問題のある注文
  problematicOrder: {
    order: {
      status: "cancelled",
      cancelReason: "customer_request",
      refundAmount: 5000,
    },
  },
};
```

## 再現性の確保

### シードの固定

```typescript
import { faker } from "@faker-js/faker";

// グローバルシードを設定
faker.seed(12345);

// または各テストでリセット
beforeEach(() => {
  faker.seed(12345);
});

// 特定のシードで生成
function generateDeterministicData(seed: number) {
  faker.seed(seed);
  return {
    users: generateMany(10, () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
    })),
  };
}
```

### スナップショットの活用

```typescript
// 生成したデータをJSONで保存
import { writeFileSync, readFileSync, existsSync } from "fs";

const SNAPSHOT_PATH = "./seeds/snapshots/";

function getOrCreateSnapshot<T>(name: string, generator: () => T): T {
  const filePath = `${SNAPSHOT_PATH}${name}.json`;

  if (existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  }

  const data = generator();
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  return data;
}

// 使用例
const users = getOrCreateSnapshot("development-users", () =>
  generateMany(100, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
  })),
);
```

## パフォーマンス最適化

### バッチ処理

```typescript
const BATCH_SIZE = 1000;

async function seedLargeDataset(db: Database, totalCount: number) {
  console.log(`Seeding ${totalCount} records...`);

  for (let offset = 0; offset < totalCount; offset += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, totalCount - offset);
    const batch = generateMany(batchSize, generateUser);

    await db.insert(users).values(batch);

    console.log(`Progress: ${offset + batchSize}/${totalCount}`);
  }
}

// 並列処理（テーブル間で独立している場合）
async function seedInParallel(db: Database) {
  await Promise.all([
    seedUsers(db, 1000),
    seedCategories(db, 100),
    seedProducts(db, 5000),
  ]);
}
```

### メモリ効率

```typescript
// ジェネレータを使用
function* generateUsersIterator(count: number) {
  for (let i = 0; i < count; i++) {
    yield {
      id: i + 1,
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
  }
}

// ストリーミング挿入
async function seedWithIterator(db: Database, count: number) {
  const batch: User[] = [];
  const BATCH_SIZE = 1000;

  for (const user of generateUsersIterator(count)) {
    batch.push(user);

    if (batch.length >= BATCH_SIZE) {
      await db.insert(users).values(batch);
      batch.length = 0; // バッチをクリア
    }
  }

  // 残りを挿入
  if (batch.length > 0) {
    await db.insert(users).values(batch);
  }
}
```

## チェックリスト

### データ生成時

- [ ] シードを固定して再現性を確保しているか？
- [ ] エッジケースを含めているか？
- [ ] 日本語/Unicode対応しているか？
- [ ] パフォーマンスを考慮しているか？

### ファクトリ設計時

- [ ] 関連データを一緒に生成できるか？
- [ ] オーバーライドが簡単か？
- [ ] シーケンスIDが衝突しないか？
