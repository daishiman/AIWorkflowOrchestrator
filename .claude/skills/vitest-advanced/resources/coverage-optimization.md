# カバレッジ最適化

## 概要

Vitestでのテストカバレッジの設定、測定、最適化方法を解説します。

---

## カバレッジの設定

### 基本設定

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // プロバイダー（v8推奨）
      provider: 'v8', // または 'istanbul'

      // 有効化
      enabled: true,

      // レポーター
      reporter: ['text', 'html', 'lcov', 'json'],

      // 出力ディレクトリ
      reportsDirectory: './coverage',
    },
  },
});
```

### カバレッジ対象の指定

```typescript
coverage: {
  // 含めるファイル
  include: ['src/**/*.ts'],

  // 除外するファイル
  exclude: [
    'src/**/*.test.ts',
    'src/**/*.spec.ts',
    'src/**/*.d.ts',
    'src/types/**',
    'src/index.ts',
  ],

  // すべてのファイルを対象（テストされていないファイルも含む）
  all: true,
}
```

### 閾値の設定

```typescript
coverage: {
  thresholds: {
    // グローバル閾値
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },

    // ファイル別閾値
    'src/critical/**/*.ts': {
      statements: 95,
      branches: 95,
    },

    // 閾値未満でエラー
    perFile: true,
  },
}
```

---

## カバレッジの種類

### Line Coverage（行カバレッジ）

実行された行の割合。

```typescript
function calculate(a: number, b: number): number {
  if (a > 0) {           // ← 実行された
    return a + b;        // ← 実行された
  }
  return b;              // ← 実行されていない
}
```

### Branch Coverage（分岐カバレッジ）

条件分岐の網羅率。

```typescript
function validate(value: number): string {
  if (value < 0) {       // ← true分岐とfalse分岐
    return 'negative';
  } else if (value > 100) {  // ← true分岐とfalse分岐
    return 'too high';
  }
  return 'valid';
}

// 4つの分岐すべてをテストする必要がある
```

### Function Coverage（関数カバレッジ）

呼び出された関数の割合。

### Statement Coverage（文カバレッジ）

実行された文の割合。

---

## カバレッジレポート

### テキストレポート

```bash
# コンソール出力
npx vitest run --coverage

# 出力例
-----------------|---------|----------|---------|---------|
File             | % Stmts | % Branch | % Funcs | % Lines |
-----------------|---------|----------|---------|---------|
All files        |   85.71 |    78.57 |   90.00 |   85.71 |
 src/services    |   90.00 |    80.00 |  100.00 |   90.00 |
  user.ts        |   90.00 |    80.00 |  100.00 |   90.00 |
-----------------|---------|----------|---------|---------|
```

### HTMLレポート

```typescript
coverage: {
  reporter: ['html'],
  reportsDirectory: './coverage',
}

// coverage/index.htmlをブラウザで開く
```

### LCOVレポート（CI連携用）

```typescript
coverage: {
  reporter: ['lcov'],
}

// coverage/lcov.info が生成される
// Codecov, Coverallsなどと連携可能
```

---

## カバレッジ改善戦略

### 1. 未カバー行の特定

```bash
# HTMLレポートで確認
npx vitest run --coverage

# 赤い行 = 未カバー
# 黄色い行 = 部分的にカバー
```

### 2. 分岐カバレッジの改善

```typescript
// カバーされていない分岐を特定
function process(data: Data): Result {
  if (data.type === 'A') {
    return processTypeA(data);
  } else if (data.type === 'B') {  // ← この分岐がテストされていない
    return processTypeB(data);
  }
  throw new Error('Unknown type');
}

// 追加テスト
it('should process type B', () => {
  const result = process({ type: 'B', value: 10 });
  expect(result).toBeDefined();
});
```

### 3. エッジケースの追加

```typescript
// 境界値テスト
it.each([
  { input: 0, expected: 'zero' },
  { input: -1, expected: 'negative' },
  { input: 100, expected: 'max' },
  { input: 101, expected: 'overflow' },
])('should handle $input', ({ input, expected }) => {
  expect(classify(input)).toBe(expected);
});
```

---

## 除外パターン

### ファイルレベル除外

```typescript
coverage: {
  exclude: [
    'src/**/*.test.ts',
    'src/types/**',
    'src/generated/**',
  ],
}
```

### コードレベル除外

```typescript
/* v8 ignore start */
// このブロックはカバレッジから除外
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode');
}
/* v8 ignore stop */

// 単一行の除外
const debug = () => console.log('debug'); /* v8 ignore next */
```

### Istanbulコメント

```typescript
/* istanbul ignore next */
function debugOnly() {
  // カバレッジから除外
}

/* istanbul ignore if */
if (unlikely_condition) {
  // この分岐を除外
}
```

---

## CI/CD連携

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm ci
      - run: pnpm run test:coverage

      # Codecovにアップロード
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

### 閾値チェック

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
}
```

```bash
# 閾値未満でCIを失敗させる
npx vitest run --coverage --coverage.thresholds.100
```

---

## アンチパターン

### ❌ 100%カバレッジの追求

```typescript
// 悪い例：カバレッジのためだけのテスト
it('should cover getters', () => {
  const user = new User();
  user.name; // ただ呼び出すだけ
  user.email; // 意味のないテスト
});

// 良い例：振る舞いをテスト
it('should format full name', () => {
  const user = new User({ firstName: 'John', lastName: 'Doe' });
  expect(user.fullName).toBe('John Doe');
});
```

### ❌ 重要でないコードのテスト

```typescript
// カバレッジから除外すべき
/* v8 ignore next */
function devOnly() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode');
  }
}
```

### ❌ カバレッジ至上主義

```typescript
// カバレッジ80%でも品質が低いテスト
it('covers the function', () => {
  const result = complexFunction(1, 2, 3);
  expect(result).toBeDefined(); // 何も検証していない
});

// カバレッジ60%でも品質が高いテスト
it('should calculate correct total with discount', () => {
  const result = complexFunction(100, 2, 0.1);
  expect(result.total).toBe(180);
  expect(result.discount).toBe(20);
});
```

---

## チェックリスト

### カバレッジ設定

- [ ] 適切なプロバイダーを選択したか？
- [ ] 除外パターンは正しいか？
- [ ] 閾値は現実的か？

### カバレッジ改善

- [ ] 未カバーのコードは重要か？
- [ ] 分岐カバレッジは十分か？
- [ ] エッジケースはテストされているか？

### CI/CD

- [ ] カバレッジレポートは生成されているか？
- [ ] 閾値チェックは設定されているか？
- [ ] カバレッジトレンドは追跡されているか？
