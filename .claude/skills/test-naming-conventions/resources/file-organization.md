# ファイル構成

## 概要

テストファイルの配置と命名規則について解説します。
プロジェクト全体で一貫した構成を維持することが重要です。

---

## ディレクトリ構成パターン

### パターン1: コロケーション（同一ディレクトリ）

```
src/
├── services/
│   ├── user.service.ts
│   ├── user.service.test.ts     ← 同じディレクトリ
│   ├── order.service.ts
│   └── order.service.test.ts
├── utils/
│   ├── format.ts
│   └── format.test.ts
```

**利点**:

- テストとソースの関係が明確
- ファイル移動が容易
- 関連ファイルが近くにある

**欠点**:

- ソースディレクトリが混在
- テストのみのビルド除外が必要

### パターン2: 専用テストディレクトリ

```
src/
├── services/
│   ├── user.service.ts
│   └── order.service.ts
tests/
├── unit/
│   └── services/
│       ├── user.service.test.ts
│       └── order.service.test.ts
├── integration/
│   └── api/
│       └── users.test.ts
└── e2e/
    └── user-flow.test.ts
```

**利点**:

- テストタイプ別に整理
- ソースとテストの明確な分離
- ビルド設定が簡単

**欠点**:

- パス管理が複雑
- ソースとテストが離れる

### パターン3: **tests**ディレクトリ

```
src/
├── services/
│   ├── __tests__/
│   │   ├── user.service.test.ts
│   │   └── order.service.test.ts
│   ├── user.service.ts
│   └── order.service.ts
```

**利点**:

- Jestのデフォルト
- テストが近くにある
- ソースファイルと区別しやすい

---

## ファイル命名規則

### 基本パターン

```
[source-name].test.ts    ← 推奨
[source-name].spec.ts    ← BDDスタイル
[source-name]-test.ts    ← 非推奨
test-[source-name].ts    ← 非推奨
```

### 例

```
user.service.ts       → user.service.test.ts
UserService.ts        → UserService.test.ts
format-date.ts        → format-date.test.ts
index.ts              → index.test.ts
```

### テストタイプ別

```
user.service.test.ts           ← ユニットテスト
user.service.integration.test.ts  ← 統合テスト
user.service.e2e.test.ts       ← E2Eテスト
```

---

## Vitest設定

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // テストファイルのパターン
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],

    // 除外パターン
    exclude: [
      "node_modules",
      "dist",
      "**/*.e2e.test.ts", // E2Eは別で実行
    ],

    // グローバルセットアップ
    setupFiles: ["./tests/setup.ts"],

    // 環境
    environment: "node",
  },
});
```

### テスト発見の設定

```typescript
test: {
  // デフォルト: **/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}
  include: ['**/*.test.ts'],

  // テストディレクトリを指定
  root: './src',

  // または
  root: './tests',
}
```

---

## 大規模プロジェクトの構成

### フィーチャー別

```
src/
├── features/
│   ├── auth/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.test.ts
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginForm.test.tsx
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       └── useAuth.test.ts
│   └── users/
│       └── ...
```

### レイヤー別

```
src/
├── domain/
│   └── entities/
│       ├── user.ts
│       └── user.test.ts
├── application/
│   └── services/
│       ├── user.service.ts
│       └── user.service.test.ts
├── infrastructure/
│   └── repositories/
│       ├── user.repository.ts
│       └── user.repository.test.ts
```

---

## 共通ファイル

### テストユーティリティ

```
tests/
├── setup.ts              ← グローバルセットアップ
├── helpers/
│   ├── test-utils.ts     ← ユーティリティ関数
│   └── fixtures.ts       ← テストデータ
├── mocks/
│   ├── repositories.ts   ← モックオブジェクト
│   └── services.ts
└── factories/
    └── user.factory.ts   ← テストデータ生成
```

### セットアップファイル

```typescript
// tests/setup.ts
import { vi } from "vitest";

// グローバルモック
vi.mock("./src/config", () => ({
  config: {
    apiUrl: "http://localhost:3000",
  },
}));

// グローバルクリーンアップ
afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});
```

### ファクトリ

```typescript
// tests/factories/user.factory.ts
import { User } from "../../src/types";

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    createdAt: new Date(),
    ...overrides,
  };
}

// 使用例
const user = createUser({ name: "Custom Name" });
```

---

## 命名の一貫性

### ケース統一

```
# 選択肢1: ケバブケース（推奨）
user-service.ts
user-service.test.ts

# 選択肢2: キャメルケース
userService.ts
userService.test.ts

# 選択肢3: パスカルケース（クラスファイル）
UserService.ts
UserService.test.ts
```

### プロジェクト内で統一

```
✅ 一貫性あり:
├── user-service.ts
├── user-service.test.ts
├── order-service.ts
└── order-service.test.ts

❌ 不一致:
├── user-service.ts
├── userService.test.ts      ← 不一致
├── OrderService.ts          ← 不一致
└── order.service.test.ts    ← 不一致
```

---

## チェックリスト

### ディレクトリ構成

- [ ] プロジェクト全体で統一されているか？
- [ ] テストタイプ別に分離されているか？
- [ ] 共通ファイルは適切に配置されているか？

### ファイル命名

- [ ] 命名規則は統一されているか？
- [ ] ソースファイルとの対応が明確か？
- [ ] テストタイプが識別可能か？

### 設定

- [ ] vitest.configでinclude/excludeは正しいか？
- [ ] セットアップファイルは設定されているか？
- [ ] パスエイリアスは設定されているか？
