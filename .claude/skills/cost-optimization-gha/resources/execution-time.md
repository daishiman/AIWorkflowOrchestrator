# 実行時間削減戦略

## 概要

GitHub Actions の実行時間を短縮することで、コストを直接削減できます。
このドキュメントでは、実行時間を30-70%削減する具体的な戦略を提供します。

## 主要な戦略

### 1. ジョブの並列化

**効果**: 30-50%の時間短縮

#### Matrix Strategy による並列化

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: pnpm ci
      - run: pnpm test

# 9つのジョブが並列実行（3 OS × 3 Node versions）
# 連続実行: 90分 → 並列実行: 10分
```

#### 複数ジョブへの分割

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm run build

# lint と test が並列実行
# 連続実行: 15分 → 並列実行: 10分
```

### 2. キャッシングの活用

**効果**: 40-70%の時間短縮

#### 依存関係キャッシュ

```yaml
- name: Cache Node.js dependencies
  uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install dependencies
  run: pnpm ci
# キャッシュヒット時: 2分 → 10秒 (83%短縮)
```

#### ビルド成果物のキャッシュ

```yaml
- name: Cache build output
  uses: actions/cache@v4
  with:
    path: |
      .next/cache
      dist/
    key: ${{ runner.os }}-build-${{ hashFiles('src/**') }}

- name: Build
  run: pnpm run build
# キャッシュヒット時: 5分 → 30秒 (90%短縮)
```

#### Docker層のキャッシュ

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: user/app:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
# キャッシュヒット時: 10分 → 2分 (80%短縮)
```

### 3. 条件実行による無駄の削減

**効果**: 20-80%の実行回避

#### Path フィルター

```yaml
on:
  push:
    paths:
      - "src/**"
      - "tests/**"
      - "package.json"
      - "package-lock.json"
  # ドキュメントのみの変更では実行しない

# 月間実行回数: 100回 → 40回 (60%削減)
```

#### ジョブレベルの条件

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy to production"

  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy preview"

# 不要なデプロイを回避
```

#### ステップレベルの条件

```yaml
- name: Upload coverage
  if: matrix.node == '20' && matrix.os == 'ubuntu-latest'
  uses: codecov/codecov-action@v3
  # 1つのマトリックス組み合わせのみでカバレッジアップロード
```

### 4. 効率的なステップ順序

**効果**: 10-30%の時間短縮

#### 高速フィードバック優先

```yaml
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      # 1. 最速のチェックを最初に実行
      - uses: actions/checkout@v4

      - name: Lint (fastest)
        run: pnpm run lint

      - name: Type check (fast)
        run: pnpm run typecheck

      - name: Unit tests (medium)
        run: pnpm run test:unit

      - name: Integration tests (slow)
        run: pnpm run test:integration

      - name: E2E tests (slowest)
        run: pnpm run test:e2e

# エラー時に早期終了 → 無駄な実行を回避
```

#### 依存関係の最適化

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  # ...

- name: Install dependencies
  run: pnpm ci --prefer-offline --no-audit
  # --prefer-offline: キャッシュ優先
  # --no-audit: セキュリティ監査をスキップ（別ジョブで実行）
  # 30%高速化
```

### 5. 並列テスト実行

**効果**: 50-70%の時間短縮

#### Jest の並列実行

```yaml
- name: Run tests
  run: pnpm test -- --maxWorkers=4
  # デフォルト: 1ワーカー (10分)
  # 4ワーカー: (3分) → 70%短縮
```

#### 複数ジョブでのテスト分割

```yaml
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm ci
      - name: Run test shard
        run: pnpm test -- --shard=${{ matrix.shard }}/4

# 40分のテストを4つに分割 → 10分
```

### 6. ステップのスキップ

**効果**: 20-40%の時間短縮

#### 変更検出によるスキップ

```yaml
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v40
  with:
    files: |
      src/**
      tests/**

- name: Run tests
  if: steps.changed-files.outputs.any_changed == 'true'
  run: pnpm test
# ソースコード変更がない場合はテストをスキップ
```

#### 前回実行結果のキャッシュ

```yaml
- name: Cache test results
  uses: actions/cache@v4
  with:
    path: .jest-cache
    key: test-${{ hashFiles('src/**', 'tests/**') }}

- name: Run tests
  run: pnpm test -- --cache --cacheDirectory=.jest-cache
# 変更がないテストはスキップ
```

## 実行時間削減の測定

### ワークフロー分析

```yaml
- name: Measure execution time
  run: |
    echo "Start time: $(date +%s)" >> $GITHUB_ENV

- name: Your workflow steps
  run: pnpm test

- name: Report execution time
  if: always()
  run: |
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - ${{ env.START_TIME }}))
    echo "Execution time: ${DURATION}s"
```

### GitHub Actions のメトリクス

```bash
# GitHub API で実行時間を取得
gh run list --workflow=ci.yml --json conclusion,startedAt,updatedAt \
  --jq '.[] | {conclusion, duration: (.updatedAt - .startedAt)}'
```

## ベストプラクティス

### 1. 段階的な最適化

```yaml
# Phase 1: キャッシング導入 (40-70%削減)
- uses: actions/cache@v4

# Phase 2: 並列化 (30-50%削減)
strategy:
  matrix:
    node: [18, 20, 22]

# Phase 3: 条件実行 (20-80%削減)
on:
  push:
    paths: ['src/**']

# 累積効果: 70-90%の時間短縮
```

### 2. ボトルネックの特定

```yaml
- name: Profile build
  run: |
    time pnpm run build
    time pnpm run test
    time pnpm run lint

# 最も時間がかかるステップを特定して最適化
```

### 3. 最適なランナーサイズ

```yaml
# 標準ランナー (2 CPU, 7 GB RAM)
runs-on: ubuntu-latest

# 大規模ランナー (4 CPU, 16 GB RAM) - Team/Enterprise のみ
runs-on: ubuntu-latest-4-cores

# コスト vs 時間のバランスを考慮
# 2倍のコスト → 2倍以上の高速化なら有効
```

## トラブルシューティング

### キャッシュが効かない場合

```yaml
- name: Debug cache
  run: |
    echo "Cache key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}"
    ls -la ~/.pnpm

# キーが一致しているか確認
# パスが正しいか確認
```

### 並列化が遅い場合

```yaml
# 過度な並列化は逆効果
strategy:
  matrix:
    shard: [1, 2, 3, 4, 5, 6, 7, 8] # 多すぎる
    # → オーバーヘッドで遅くなる

# 最適な数を見つける: 通常2-4が最適
```

## まとめ

実行時間削減の優先順位:

1. **キャッシング**: 最も効果的 (40-70%削減)
2. **並列化**: 大幅な時間短縮 (30-50%削減)
3. **条件実行**: 不要な実行を回避 (20-80%削減)
4. **ステップ最適化**: 細かい改善 (10-30%削減)

これらを組み合わせることで、70-90%の実行時間削減が可能です。
