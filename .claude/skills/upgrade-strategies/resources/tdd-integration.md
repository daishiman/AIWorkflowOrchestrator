# TDD統合パターン

## 概要

テスト駆動開発（TDD）の原則を依存関係のアップグレードに適用することで、
安全で信頼性の高い更新プロセスを実現します。

## TDDアップグレードの原則

### Red-Green-Refactor サイクルの適用

```
1. Green（既存テストが通過）
   ↓
2. Update（パッケージを更新）
   ↓
3. Red または Green（テスト実行）
   ↓
4. Fix（失敗したテストを修正）
   ↓
5. Green（全テスト通過）
   ↓
6. Refactor（必要に応じてリファクタリング）
```

## テストカバレッジの要件

### 最小要件（Patch更新）

```
ユニットテスト: 60%以上
静的解析: 100%（TypeScript, ESLint）
```

### 推奨要件（Minor更新）

```
ユニットテスト: 80%以上
統合テスト: 主要フローをカバー
静的解析: 100%
```

### 理想要件（Major更新）

```
ユニットテスト: 90%以上
統合テスト: 全フローをカバー
E2Eテスト: クリティカルパスをカバー
静的解析: 100%
パフォーマンステスト: ベンチマーク
```

## 静的テスト（100%必須）

### TypeScript型チェック

```bash
# 厳格モードでの型チェック
pnpm tsc --noEmit --strict

# CI用の設定
# tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint

```bash
# 全ファイルのチェック
pnpm eslint . --ext .ts,.tsx,.js,.jsx

# 自動修正
pnpm eslint . --fix

# CI用の厳格チェック
pnpm eslint . --max-warnings 0
```

### Prettier

```bash
# フォーマットチェック
pnpm prettier --check .

# 自動フォーマット
pnpm prettier --write .
```

## ユニットテスト

### テスト実行の順序

```bash
# 1. 更新前のテスト実行（ベースライン）
pnpm test --coverage > baseline-coverage.txt

# 2. パッケージを更新
pnpm update package-name

# 3. 更新後のテスト実行
pnpm test --coverage

# 4. カバレッジの比較
diff baseline-coverage.txt coverage/lcov-report/index.html
```

### テスト失敗時の対応

```javascript
// 失敗パターン1: APIの変更
// Before
import { oldFunction } from 'package';
oldFunction(arg1);

// After
import { newFunction } from 'package';
newFunction({ arg: arg1 }); // 引数形式の変更

// 失敗パターン2: 型の変更
// Before
const result: OldType = await getData();

// After
const result: NewType = await getData();
// NewTypeに合わせてテストを修正
```

### モックの更新

```javascript
// 古いモック
jest.mock('package', () => ({
  oldMethod: jest.fn()
}));

// 新しいモック（APIが変更された場合）
jest.mock('package', () => ({
  newMethod: jest.fn(),
  // 後方互換性のためのラッパー
  oldMethod: (...args) => newMethod({ args })
}));
```

## 統合テスト

### アップグレード前後の比較テスト

```javascript
// integration.test.ts
describe('Package Upgrade Integration', () => {
  describe('Critical Path', () => {
    it('should maintain user authentication flow', async () => {
      // 認証フローが以前と同様に動作することを確認
      const result = await authenticateUser(credentials);
      expect(result.token).toBeDefined();
      expect(result.user).toMatchObject(expectedUserShape);
    });

    it('should maintain data processing', async () => {
      // データ処理が同じ結果を返すことを確認
      const input = generateTestData();
      const result = await processData(input);
      expect(result).toMatchSnapshot();
    });
  });
});
```

### スナップショットテスト

```javascript
// snapshot.test.ts
describe('Component Render', () => {
  it('should render consistently after upgrade', () => {
    const component = render(<MyComponent data={testData} />);
    expect(component).toMatchSnapshot();
  });
});

// スナップショットの更新が必要な場合
// pnpm test -- -u
```

## E2Eテスト

### クリティカルパスのテスト

```javascript
// e2e/critical-paths.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Post-Upgrade Verification', () => {
  test('login flow works correctly', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.user-name')).toBeVisible();
  });

  test('checkout flow completes', async ({ page }) => {
    // チェックアウトフローのテスト
    await page.goto('/products');
    await page.click('.add-to-cart');
    await page.click('.checkout-button');
    // ...
  });
});
```

## CI/CD統合

### GitHub Actions設定

```yaml
name: Upgrade Testing

on:
  pull_request:
    paths:
      - 'package.json'
      - 'pnpm-lock.yaml'

jobs:
  static-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm eslint .
      - run: pnpm prettier --check .

  unit-tests:
    needs: static-analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/lcov-report/index.html | grep -oP 'Total.*?(\d+\.?\d*)%' | head -1 | grep -oP '\d+\.?\d*')
          if (( $(echo "$COVERAGE < 60" | bc -l) )); then
            echo "Coverage is below 60%"
            exit 1
          fi

  e2e-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test:e2e
```

## テスト失敗の分類と対応

### 分類1: 正当な失敗（テスト修正が必要）

**原因**: APIが変更され、テストが古い動作を期待している

**対応**:
```javascript
// 古いテスト
expect(result.data).toEqual([1, 2, 3]);

// 新しいテスト（APIの戻り値形式が変更された場合）
expect(result.items).toEqual([1, 2, 3]);
```

### 分類2: 回帰（コード修正が必要）

**原因**: アップグレードによりコードが壊れた

**対応**:
1. アップグレードをロールバック
2. 原因を調査
3. コードを修正
4. 再度アップグレードを試行

### 分類3: 環境依存（環境設定の修正が必要）

**原因**: テスト環境の設定が古い

**対応**:
```javascript
// jest.config.js の更新
module.exports = {
  // 新しいトランスフォーマー設定
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      // 新しい設定オプション
    }]
  }
};
```

## チェックリスト

### アップグレード前
- [ ] 現在のテストカバレッジを確認したか？
- [ ] ベースラインのテスト結果を記録したか？
- [ ] 静的解析が100%通過するか？

### アップグレード中
- [ ] テストを実行したか？
- [ ] 失敗したテストを分類したか？
- [ ] 適切な対応を行ったか？

### アップグレード後
- [ ] 全テストが通過するか？
- [ ] カバレッジが維持されているか？
- [ ] E2Eテストが通過するか？
- [ ] パフォーマンスに影響がないか？
