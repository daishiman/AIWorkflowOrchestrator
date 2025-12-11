# 並列化とマトリクスビルド

## 並列化の原則

### なぜ並列化が重要か

1. **実行時間短縮**: 線形実行の数倍高速化
2. **早期フィードバック**: 問題の早期検出
3. **リソース効率**: GitHub Actions の並列実行能力を活用

### 並列化可能な条件

- **独立性**: 他のジョブの出力に依存しない
- **べき等性**: 何度実行しても同じ結果
- **副作用の分離**: 共有リソースへの書き込みがない

## ジョブレベルの並列化

### 基本パターン

```yaml
jobs:
  lint: # 並列実行
    runs-on: ubuntu-latest
    steps: [...]

  type-check: # 並列実行
    runs-on: ubuntu-latest
    steps: [...]

  test: # 並列実行
    runs-on: ubuntu-latest
    steps: [...]

  build: # 並列実行
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: [lint, type-check, test, build] # すべて完了後
    runs-on: ubuntu-latest
    steps: [...]
```

### 実行時間の比較

```
線形実行:
lint(1m) → type-check(1m) → test(3m) → build(2m) = 7分

並列実行:
├── lint(1m)
├── type-check(1m)
├── test(3m)          # 最長
└── build(2m)
                      = 3分 (57%短縮)
```

## マトリクスビルド

### 基本構文

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: pnpm test
```

**生成されるジョブ**:

- test (ubuntu-latest, node 18)
- test (ubuntu-latest, node 20)
- test (ubuntu-latest, node 22)
- test (windows-latest, node 18)
- test (windows-latest, node 20)
- test (windows-latest, node 22)

### include/exclude

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20, 22]
    exclude:
      - os: windows-latest
        node: 18 # Windows + Node 18 をスキップ
    include:
      - os: macos-latest
        node: 22 # macOS + Node 22 を追加
```

### 動的マトリクス

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          echo "matrix={\"include\":[{\"project\":\"app\"},{\"project\":\"lib\"}]}" >> $GITHUB_OUTPUT

  build:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building ${{ matrix.project }}"
```

## fail-fast 戦略

### デフォルト動作（fail-fast: true）

1つのジョブが失敗すると、他の実行中ジョブもキャンセル。

```yaml
strategy:
  fail-fast: true # デフォルト
  matrix:
    node: [18, 20, 22]
```

**利点**:

- リソース節約
- 早期フィードバック

**欠点**:

- 他のバージョンでの問題が見つからない

### 全ジョブ実行（fail-fast: false）

```yaml
strategy:
  fail-fast: false
  matrix:
    node: [18, 20, 22]
```

**利点**:

- すべてのバージョンでの問題を検出
- 包括的なテスト結果

**欠点**:

- 実行時間が長くなる可能性

### 推奨設定

```yaml
strategy:
  fail-fast: false # 全バージョンテスト
  matrix:
    node: [18, 20, 22]
```

CI では通常、すべての環境での動作確認が重要。

## 並列テスト実行

### Vitest の並列実行

```yaml
- name: Run tests in parallel
  run: pnpm test --pool=threads --poolOptions.threads.maxThreads=4
```

### Playwright のシャーディング

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - name: Run Playwright tests
        run: pnpm playwright test --shard=${{ matrix.shard }}/4
```

### Jest の並列実行

```yaml
- name: Run Jest tests
  run: pnpm jest --maxWorkers=4
```

## 依存関係の最適化

### アーティファクトを使った共有

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  test-unit:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
      - run: pnpm test:unit

  test-e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
      - run: pnpm test:e2e
```

### キャッシュを使った共有

```yaml
jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile

  lint:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm" # キャッシュから復元
      - run: pnpm install --frozen-lockfile # ほぼ即座
      - run: pnpm lint
```

## 並列化のアンチパターン

### 1. 不要な依存関係

❌ **避けるべき**:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest

  type-check:
    needs: lint # 不要な依存
    runs-on: ubuntu-latest
```

✅ **推奨**:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest

  type-check: # 並列実行
    runs-on: ubuntu-latest
```

### 2. 過度なマトリクス

❌ **避けるべき**:

```yaml
strategy:
  matrix:
    node: [14, 16, 18, 20, 22]
    os: [ubuntu-latest, windows-latest, macos-latest]
    # = 15 ジョブ
```

✅ **推奨**:

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest]
    include:
      - node: 22
        os: windows-latest # 代表テストのみ
```

### 3. 共有リソースの競合

❌ **避けるべき**:

```yaml
jobs:
  test-1:
    runs-on: ubuntu-latest
    steps:
      - run: echo "data" > shared.txt # 競合の可能性

  test-2:
    runs-on: ubuntu-latest
    steps:
      - run: cat shared.txt # ファイルが存在しない
```

✅ **推奨**:

```yaml
jobs:
  test-1:
    runs-on: ubuntu-latest
    steps:
      - run: echo "data" > test1.txt # 独立したファイル

  test-2:
    runs-on: ubuntu-latest
    steps:
      - run: echo "data" > test2.txt # 独立したファイル
```

## 最適化されたワークフロー例

```yaml
name: Optimized CI

on:
  pull_request:
    branches: [main]

jobs:
  # Phase 1: 高速チェック（並列）
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit

  # Phase 2: ビルド
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/

  # Phase 3: テスト（並列、ビルド依存）
  unit-test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  e2e-test:
    needs: build
    strategy:
      matrix:
        shard: [1, 2]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: .next/
      - run: pnpm playwright test --shard=${{ matrix.shard }}/2

  # Phase 4: 品質ゲート
  quality-gate:
    needs: [lint, type-check, unit-test, e2e-test]
    runs-on: ubuntu-latest
    steps:
      - run: echo "✅ All checks passed"
```

## パフォーマンス測定

### 実行時間の可視化

```yaml
- name: Record start time
  id: start
  run: echo "time=$(date +%s)" >> $GITHUB_OUTPUT

- name: Run tests
  run: pnpm test

- name: Calculate duration
  run: |
    END=$(date +%s)
    DURATION=$((END - ${{ steps.start.outputs.time }}))
    echo "⏱️ Test duration: ${DURATION}s"
```

### GitHub Actions Insights

- リポジトリ → Actions → Insights
- ワークフロー実行時間の推移を確認
- ボトルネックジョブの特定
