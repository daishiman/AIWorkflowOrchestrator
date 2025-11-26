# テスト構造とライフサイクル

## 概要

Vitestのテスト構造とライフサイクルフックを効果的に使用する方法を解説します。

---

## 基本構造

### describe/it/test

```typescript
import { describe, it, test, expect } from 'vitest';

// describeでテストをグループ化
describe('UserService', () => {
  // itまたはtestでテストケースを定義
  it('should create user', () => {
    // テストロジック
  });

  test('creates user with valid data', () => {
    // testはitのエイリアス
  });
});
```

### ネストしたdescribe

```typescript
describe('UserService', () => {
  describe('getUser', () => {
    describe('when user exists', () => {
      it('should return user data', () => {
        // テスト
      });
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundError', () => {
        // テスト
      });
    });
  });

  describe('createUser', () => {
    // ...
  });
});
```

---

## ライフサイクルフック

### フックの種類

| フック | 実行タイミング |
|--------|----------------|
| `beforeAll` | 全テスト前に1回 |
| `afterAll` | 全テスト後に1回 |
| `beforeEach` | 各テスト前に毎回 |
| `afterEach` | 各テスト後に毎回 |

### 使用例

```typescript
import { describe, it, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

describe('Database Operations', () => {
  // 全テスト前に1回だけ実行
  beforeAll(async () => {
    await database.connect();
  });

  // 全テスト後に1回だけ実行
  afterAll(async () => {
    await database.disconnect();
  });

  // 各テスト前に毎回実行
  beforeEach(async () => {
    await database.beginTransaction();
  });

  // 各テスト後に毎回実行
  afterEach(async () => {
    await database.rollbackTransaction();
  });

  it('should insert record', async () => {
    // テスト
  });
});
```

### フックの実行順序

```
beforeAll
├── beforeEach
│   └── test 1
├── afterEach
├── beforeEach
│   └── test 2
├── afterEach
└── afterAll
```

### ネストしたdescribeでのフック

```typescript
describe('Outer', () => {
  beforeEach(() => console.log('outer beforeEach'));

  describe('Inner', () => {
    beforeEach(() => console.log('inner beforeEach'));

    it('test', () => {
      // 実行順: outer beforeEach → inner beforeEach → test
    });
  });
});
```

---

## テスト修飾子

### skip - テストをスキップ

```typescript
describe.skip('Skipped suite', () => {
  // このスイート全体がスキップされる
});

it.skip('skipped test', () => {
  // このテストがスキップされる
});
```

### only - 特定のテストのみ実行

```typescript
describe.only('Only this suite', () => {
  // このスイートのみ実行
});

it.only('only this test', () => {
  // このテストのみ実行
});
```

### todo - 未実装のテスト

```typescript
it.todo('should implement this feature');
```

### concurrent - 並行実行

```typescript
describe('Concurrent tests', () => {
  it.concurrent('test 1', async () => {
    await someAsyncOperation();
  });

  it.concurrent('test 2', async () => {
    await anotherAsyncOperation();
  });
});
```

### each - パラメータ化テスト

```typescript
it.each([
  { input: 1, expected: 2 },
  { input: 2, expected: 4 },
  { input: 3, expected: 6 },
])('double($input) should return $expected', ({ input, expected }) => {
  expect(double(input)).toBe(expected);
});

// 配列形式
it.each([
  [1, 2],
  [2, 4],
  [3, 6],
])('double(%i) should return %i', (input, expected) => {
  expect(double(input)).toBe(expected);
});
```

---

## Arrange-Act-Assert パターン

```typescript
it('should calculate total price with discount', () => {
  // Arrange - 準備
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 3 },
  ];
  const discount = 0.1;
  const calculator = new PriceCalculator();

  // Act - 実行
  const total = calculator.calculateTotal(items, discount);

  // Assert - 検証
  expect(total).toBe(315); // (200 + 150) * 0.9
});
```

---

## ファイル構成パターン

### コロケーション

```
src/
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts   # 同じディレクトリ
```

### 別ディレクトリ

```
src/
├── services/
│   └── user.service.ts
tests/
├── unit/
│   └── services/
│       └── user.service.test.ts
```

### ファイル命名

```
# 推奨パターン
user.service.test.ts
user.service.spec.ts

# テストタイプ別
user.service.unit.test.ts
user.service.integration.test.ts
```

---

## ベストプラクティス

### すべきこと

1. **明確な構造**:
   - describeでコンテキストを作る
   - itで単一の振る舞いを検証

2. **適切なフック使用**:
   - 共有セットアップにbeforeEach
   - リソース解放にafterEach
   - 重いセットアップにbeforeAll

3. **独立したテスト**:
   - テスト間で状態を共有しない
   - 実行順序に依存しない

### 避けるべきこと

1. **過度なネスト**:
   - 3階層以上のネストは避ける
   - 複雑な場合はファイル分割を検討

2. **テスト間の依存**:
   - あるテストが他のテストに依存
   - グローバル状態の変更

3. **skip/onlyの放置**:
   - コミット前にskip/onlyを削除
   - CIでチェック

---

## チェックリスト

### テスト構造

- [ ] describeで適切にグループ化されているか？
- [ ] itの名前は説明的か？
- [ ] Arrange-Act-Assertが明確か？

### ライフサイクル

- [ ] 適切なフックを使用しているか？
- [ ] リソースは正しく解放されているか？
- [ ] テストは独立しているか？
