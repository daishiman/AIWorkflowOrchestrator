# パフォーマンス改善

## 概要

Vitestテストの実行速度と効率を改善するためのテクニックを解説します。

---

## 並行実行

### スレッド設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // スレッドを有効化
    threads: true,

    // 最大スレッド数
    maxThreads: 4,

    // 最小スレッド数
    minThreads: 1,

    // スレッドの分離
    isolate: true,
  },
});
```

### 並行テスト

```typescript
// テストを並行実行
describe.concurrent("Parallel tests", () => {
  it.concurrent("test 1", async () => {
    await someAsyncOperation();
  });

  it.concurrent("test 2", async () => {
    await anotherAsyncOperation();
  });
});
```

### テストの独立性

```typescript
// ❌ 悪い例：共有状態
let sharedData: Data;

beforeAll(() => {
  sharedData = loadData();
});

it("test 1", () => {
  sharedData.modify(); // 他のテストに影響
});

// ✅ 良い例：独立したセットアップ
it("test 1", () => {
  const data = loadData();
  data.modify();
});
```

---

## セットアップの最適化

### beforeAll vs beforeEach

```typescript
// 重いセットアップはbeforeAllで共有
describe("Database tests", () => {
  let connection: Connection;

  beforeAll(async () => {
    // 一度だけ接続
    connection = await createConnection();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    // 各テスト前にデータをリセット
    await connection.truncateAll();
  });
});
```

### セットアップファイル

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // グローバルセットアップ
    setupFiles: ["./test/setup.ts"],

    // 環境ごとのセットアップ
    globalSetup: ["./test/global-setup.ts"],
  },
});
```

```typescript
// test/setup.ts
import { vi } from "vitest";

// グローバルモック
vi.mock("./expensive-module", () => ({
  default: vi.fn(),
}));
```

---

## モッキングの最適化

### 軽量なMock

```typescript
// ❌ 重い：実際のモジュールをロード
vi.mock("./heavy-module", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, method: vi.fn() };
});

// ✅ 軽い：完全にモック
vi.mock("./heavy-module", () => ({
  default: vi.fn(),
  method: vi.fn(),
}));
```

### Mock対象の最小化

```typescript
// ❌ 悪い：不要なモック
vi.mock("./logger");
vi.mock("./metrics");
vi.mock("./tracer");
// 実際に使うのはloggerだけ

// ✅ 良い：必要なものだけ
vi.mock("./logger");
```

---

## ファイル構成の最適化

### テストのシャーディング

```bash
# CIで並列実行
npx vitest run --shard=1/3
npx vitest run --shard=2/3
npx vitest run --shard=3/3
```

```yaml
# GitHub Actions
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - run: npx vitest run --shard=${{ matrix.shard }}/3
```

### テストファイルの分割

```
# ❌ 大きすぎるファイル
tests/user.test.ts  # 500テスト

# ✅ 適切に分割
tests/user/
├── user.create.test.ts
├── user.update.test.ts
├── user.delete.test.ts
└── user.query.test.ts
```

---

## ウォッチモードの最適化

### 変更検知の設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // 監視対象
    watchExclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],

    // 関連ファイルのみ再実行
    passWithNoTests: true,
  },
});
```

### フィルタリング

```bash
# 特定のファイルのみ実行
npx vitest user.test.ts

# パターンマッチ
npx vitest --testNamePattern="should create"

# 変更されたファイル関連のみ
npx vitest --changed
```

---

## メモリ最適化

### メモリリーク防止

```typescript
describe("Memory sensitive tests", () => {
  let largeData: LargeData;

  beforeEach(() => {
    largeData = generateLargeData();
  });

  afterEach(() => {
    // 明示的にクリア
    largeData = null!;
  });
});
```

### 分離設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // テスト間の分離
    isolate: true,

    // スレッドごとに分離
    poolOptions: {
      threads: {
        isolate: true,
      },
    },
  },
});
```

---

## プロファイリング

### 遅いテストの特定

```bash
# 遅いテストを表示
npx vitest run --reporter=verbose

# JSONレポート
npx vitest run --reporter=json --outputFile=results.json
```

### ベンチマーク

```typescript
import { bench, describe } from "vitest";

describe("Performance benchmarks", () => {
  bench("fast operation", () => {
    fastFunction();
  });

  bench("slow operation", () => {
    slowFunction();
  });
});
```

---

## 設定のチューニング

### 高速設定例

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // 並行実行
    threads: true,
    maxThreads: 8,

    // グローバル設定
    globals: true,

    // キャッシュ
    cache: {
      dir: "./node_modules/.vitest",
    },

    // 型チェックをスキップ
    typecheck: {
      enabled: false,
    },

    // 最小限のレポート
    reporters: ["basic"],

    // 不要な機能を無効化
    coverage: {
      enabled: false, // CI以外では無効
    },
  },
});
```

### CI用設定

```typescript
// vitest.config.ci.ts
export default defineConfig({
  test: {
    // CIでの並列実行
    threads: true,

    // キャッシュ無効
    cache: false,

    // 完全なレポート
    reporters: ["verbose", "junit"],
    outputFile: "./test-results.xml",

    // カバレッジ有効
    coverage: {
      enabled: true,
    },
  },
});
```

---

## アンチパターン

### ❌ 不要な待機

```typescript
// 悪い例：固定待機
it("should process", async () => {
  await process();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 不要
  expect(result).toBeDefined();
});

// 良い例：必要な待機のみ
it("should process", async () => {
  const result = await process();
  expect(result).toBeDefined();
});
```

### ❌ 過度なセットアップ

```typescript
// 悪い例：すべてのテストで重いセットアップ
beforeEach(async () => {
  await seedDatabase(); // 毎回実行
  await warmupCache(); // 毎回実行
});

// 良い例：必要な時だけ
beforeAll(async () => {
  await seedDatabase(); // 一度だけ
});

beforeEach(() => {
  // 軽量なリセットのみ
  vi.clearAllMocks();
});
```

---

## チェックリスト

### 並行実行

- [ ] テストは独立しているか？
- [ ] 共有状態は排除されているか？
- [ ] 適切なスレッド数を設定したか？

### セットアップ

- [ ] beforeAll/beforeEachを適切に使い分けているか？
- [ ] 重いセットアップは共有されているか？
- [ ] afterEachでクリーンアップしているか？

### CI/CD

- [ ] シャーディングは設定されているか？
- [ ] キャッシュは活用されているか？
- [ ] 不要な機能は無効化されているか？
