# 品質ゲート設計

## 品質ゲートとは

品質ゲートは、コードが次のステージに進む前に満たすべき品質基準のチェックポイント。
基準を満たさないコードは自動的にブロックされる。

## 品質ゲートの階層

```
Level 1: 静的チェック（高速）
├── TypeScript 型チェック
├── ESLint / Prettier
└── 構文エラー検出

Level 2: テスト（中速）
├── ユニットテスト
├── カバレッジ計測
└── スナップショットテスト

Level 3: 統合チェック（低速）
├── E2E テスト
├── セキュリティスキャン
└── パフォーマンステスト
```

## Level 1: 静的チェック

### TypeScript 型チェック

```yaml
- name: Type Check
  run: pnpm tsc --noEmit
```

**成功基準**:
- 型エラーゼロ
- 厳格モード（strict: true）でパス

**失敗時のアクション**:
- PR をブロック
- エラー箇所をコメント（オプション）

### ESLint チェック

```yaml
- name: Lint
  run: pnpm eslint . --max-warnings 0
```

**成功基準**:
- エラーゼロ
- 警告ゼロ（`--max-warnings 0`）

**推奨ルール**:
```javascript
// eslint.config.js
export default [
  {
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  }
];
```

### Prettier フォーマットチェック

```yaml
- name: Format Check
  run: pnpm prettier --check .
```

**成功基準**:
- すべてのファイルがフォーマット済み

## Level 2: テストチェック

### ユニットテスト

```yaml
- name: Unit Tests
  run: pnpm test --coverage
```

**成功基準**:
- 全テストパス
- カバレッジ閾値達成

### カバレッジ閾値

```yaml
- name: Check Coverage
  run: |
    pnpm test --coverage
    # カバレッジレポートからパーセンテージを抽出
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "❌ Coverage $COVERAGE% is below 80%"
      exit 1
    fi
    echo "✅ Coverage $COVERAGE% meets threshold"
```

**Vitest での設定**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

## Level 3: 統合チェック

### セキュリティスキャン

```yaml
- name: Security Audit
  run: pnpm audit --audit-level=high
  continue-on-error: false
```

**成功基準**:
- High/Critical 脆弱性ゼロ

### E2E テスト

```yaml
- name: E2E Tests
  run: pnpm playwright test
```

**成功基準**:
- 全 E2E テストパス
- スクリーンショット差分なし（Visual Regression）

## 品質ゲートの実装パターン

### パターン1: 並列チェック + 統合ゲート

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test --coverage

  quality-gate:
    needs: [lint, type-check, test]
    runs-on: ubuntu-latest
    steps:
      - name: All checks passed
        run: echo "✅ Quality gate passed"
```

### パターン2: 段階的ゲート

```yaml
jobs:
  static-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm lint
      - run: pnpm tsc --noEmit

  test:
    needs: static-check           # 静的チェック後
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test

  security:
    needs: test                   # テスト後
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm audit
```

### パターン3: マトリクス品質ゲート

```yaml
jobs:
  quality-check:
    strategy:
      matrix:
        check: [lint, type-check, test, audit]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm ${{ matrix.check }}

  gate:
    needs: quality-check
    runs-on: ubuntu-latest
    steps:
      - run: echo "All checks passed"
```

## ブランチ保護との連携

### GitHub ブランチ保護設定

```
Settings > Branches > Branch protection rules > Add rule

Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Status checks that are required:
    - lint
    - type-check
    - test
    - quality-gate

✅ Require conversation resolution before merging
```

### 必須ステータスチェックの設定

```yaml
# ワークフロー名を分かりやすく
name: CI

jobs:
  lint:
    name: Lint Check           # この名前がステータスチェック名になる
    runs-on: ubuntu-latest
    steps: [...]

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps: [...]
```

## 品質メトリクスの可視化

### カバレッジバッジ

```yaml
- name: Update Coverage Badge
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
```

### PR コメントへのレポート

```yaml
- name: Report Coverage
  uses: davelosert/vitest-coverage-report-action@v2
  if: always()
```

### ビルドステータスバッジ

README.md に追加:
```markdown
![CI](https://github.com/owner/repo/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/owner/repo/branch/main/graph/badge.svg)
```

## 品質ゲートのカスタマイズ

### プロジェクト固有の閾値

```yaml
env:
  COVERAGE_THRESHOLD: 80
  MAX_BUNDLE_SIZE: 500000  # bytes
  MAX_BUILD_TIME: 120      # seconds

jobs:
  quality-gate:
    steps:
      - name: Check Coverage
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
            exit 1
          fi

      - name: Check Bundle Size
        run: |
          SIZE=$(stat -f%z .next/static/chunks/*.js | awk '{s+=$1} END {print s}')
          if [ $SIZE -gt $MAX_BUNDLE_SIZE ]; then
            exit 1
          fi
```

### 段階的な閾値強化

```yaml
# Phase 1: 導入期（緩い基準）
COVERAGE_THRESHOLD: 60
LINT_WARNINGS_ALLOWED: 10

# Phase 2: 成長期
COVERAGE_THRESHOLD: 70
LINT_WARNINGS_ALLOWED: 5

# Phase 3: 成熟期
COVERAGE_THRESHOLD: 80
LINT_WARNINGS_ALLOWED: 0
```

## ベストプラクティス

### すべきこと

1. **高速なフィードバック**:
   - 静的チェックを最初に実行
   - 失敗しやすいチェックを先に

2. **明確なエラーメッセージ**:
   - 何が失敗したか明示
   - 修正方法を提示

3. **段階的な導入**:
   - 最初は警告のみ
   - 徐々に厳格化

### 避けるべきこと

1. **過度に厳格な初期設定**:
   - ❌ 初日からカバレッジ100%要求
   - ✅ 現状+10%から開始

2. **フレーキーチェック**:
   - ❌ ランダムに失敗するテスト
   - ✅ 決定論的なチェックのみ

3. **無視されるゲート**:
   - ❌ `continue-on-error: true` の乱用
   - ✅ 失敗は真剣に対処

## 完全な品質ゲート設定例

```yaml
name: Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  static-analysis:
    name: Static Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm eslint . --max-warnings 0
      - run: pnpm prettier --check .

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v4

  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm audit --audit-level=high

  quality-gate:
    name: Quality Gate
    needs: [static-analysis, unit-tests, security-audit]
    runs-on: ubuntu-latest
    steps:
      - name: All checks passed
        run: |
          echo "✅ All quality checks passed"
          echo "- Static Analysis: ✅"
          echo "- Unit Tests: ✅"
          echo "- Security Audit: ✅"
```
