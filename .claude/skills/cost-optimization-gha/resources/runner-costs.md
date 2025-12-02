# ランナーコスト最適化

## 概要

GitHub Actions のランナー選択はコストに大きく影響します。
適切なランナーを選択することで、コストを10-100%削減できます。

## ランナー価格表

### GitHub-hosted ランナー

| ランナータイプ | CPU | RAM | 分単価 | 1000分あたり | 月間コスト (20回/日, 10分) |
|-------------|-----|-----|--------|------------|----------------------|
| **ubuntu-latest** | 4 | 16GB | $0.008 | $8 | $48 |
| **ubuntu-latest-4-cores** | 4 | 16GB | $0.016 | $16 | $96 |
| **ubuntu-latest-8-cores** | 8 | 32GB | $0.032 | $32 | $192 |
| **ubuntu-latest-16-cores** | 16 | 64GB | $0.064 | $64 | $384 |
| **windows-latest** | 4 | 16GB | $0.016 | $16 | $96 |
| **windows-latest-8-cores** | 8 | 32GB | $0.032 | $32 | $192 |
| **macos-13** | 4 | 14GB | $0.08 | $80 | $480 |
| **macos-14** (M1) | 3 | 7GB | $0.16 | $160 | $960 |
| **macos-14-large** (M1) | 6 | 14GB | $0.16 | $160 | $960 |

### Self-hosted ランナー

| インフラ | 初期コスト | 月間運用コスト | 実行コスト | ブレークイーブン |
|---------|----------|--------------|----------|-------------|
| **AWS EC2 (t3.medium)** | $0 | $30/月 | $0 | 4,000分/月 |
| **AWS EC2 (t3.large)** | $0 | $60/月 | $0 | 8,000分/月 |
| **オンプレミス** | $2,000 | $50/月 | $0 | 高頻度実行 |
| **既存サーバー** | $0 | $0 | $0 | 即座に有益 |

## ランナー選択戦略

### 1. OS 選択による最適化

**コスト比較 (10分実行)**:
- Linux: $0.08
- Windows: $0.16 (2倍)
- macOS (Intel): $0.80 (10倍)
- macOS (M1): $1.60 (20倍)

#### 最適化パターン

```yaml
jobs:
  # ✅ 最適: Linux を優先
  build:
    runs-on: ubuntu-latest
    # コスト: $0.008/分

  # ⚠️ 注意: Windows は必要な場合のみ
  build-windows:
    if: matrix.os == 'windows'
    runs-on: windows-latest
    # コスト: $0.016/分 (2倍)

  # 🚨 高コスト: macOS は最小限に
  build-ios:
    if: needs.check.outputs.ios-changed == 'true'
    runs-on: macos-latest
    # コスト: $0.08/分 (10倍)
```

### 2. クロスプラットフォームビルドの最適化

#### パターン1: Linux でビルド、特定OSでテスト

```yaml
jobs:
  build:
    runs-on: ubuntu-latest  # 最安
    steps:
      - run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/download-artifact@v4
      - run: pnpm test

# ビルド: Linux ($0.08)
# テスト: 3 OS ($0.08 + $0.16 + $0.80 = $1.04)
# 合計: $1.12

# 各OSでビルド+テスト: $1.04 × 3 = $3.12
# 削減額: $2.00 (64%削減)
```

#### パターン2: 条件付き macOS 実行

```yaml
jobs:
  check-changes:
    runs-on: ubuntu-latest
    outputs:
      ios-changed: ${{ steps.filter.outputs.ios }}
    steps:
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            ios:
              - 'ios/**'
              - 'macos/**'

  build-ios:
    needs: check-changes
    if: needs.check-changes.outputs.ios-changed == 'true'
    runs-on: macos-latest
    # iOS/macOS ファイル変更時のみ実行

# 月間実行: 100回 → 20回 (80%削減)
# コスト削減: $800 → $160 (80%削減)
```

### 3. ランナーサイズの最適化

#### 小規模ジョブ: 標準ランナー

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest  # 4 CPU, 16GB
    steps:
      - run: pnpm run lint
    # 実行時間: 2分
    # コスト: $0.016
```

#### 大規模ジョブ: 大型ランナー

```yaml
jobs:
  build:
    runs-on: ubuntu-latest-8-cores  # 8 CPU, 32GB
    steps:
      - run: pnpm run build
    # 標準ランナー: 10分 × $0.008/分 = $0.08
    # 大型ランナー: 4分 × $0.032/分 = $0.128
    # → 標準ランナーの方が安い
```

**コスト計算式**:
```
標準ランナーコスト = 実行時間 × $0.008
大型ランナーコスト = 実行時間/2 × $0.016

大型ランナーが有効:
  実行時間/2 × $0.016 < 実行時間 × $0.008
  → 2倍以上の高速化が必要
```

### 4. Self-hosted ランナーへの移行

#### ブレークイーブンポイント

**AWS EC2 (t3.medium) の場合**:

```
月間コスト: $30
ブレークイーブンポイント: $30 / $0.008 = 3,750分

月間実行時間が 3,750分 (62.5時間) 以上なら self-hosted が有利
```

**実行頻度別の推奨**:

| 実行パターン | 月間時間 | 推奨ランナー |
|------------|---------|------------|
| **低頻度** (1-2回/日) | <10時間 | GitHub-hosted |
| **中頻度** (5-10回/日) | 20-40時間 | GitHub-hosted |
| **高頻度** (20+回/日) | 100+時間 | Self-hosted |
| **継続的** (常時実行) | 720時間 | Self-hosted |

#### Self-hosted ランナーのセットアップ

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: pnpm ci
      - run: pnpm run build

# コスト: $0 (インフラコストのみ)
```

**Self-hosted の利点**:
- 実行コスト: $0
- キャッシュ永続化
- カスタマイズ可能
- 専用リソース

**Self-hosted のデメリット**:
- 初期セットアップコスト
- メンテナンス負担
- セキュリティ管理
- インフラコスト

## コスト削減パターン

### パターン1: Linux 優先戦略

```yaml
jobs:
  # 開発ビルド: Linux のみ
  build-dev:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest

  # 本番ビルド: 全 OS
  build-prod:
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}

# PR: Linux のみ → $0.08
# 本番: 全 OS → $1.04
# 平均コスト削減: 80%
```

### パターン2: macOS 実行の最小化

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20, 22]
        include:
          # macOS は最新バージョンのみ
          - os: macos-latest
            node: 22
    runs-on: ${{ matrix.os }}

# Linux + Windows: 6ジョブ
# macOS: 1ジョブ
# macOS なしの場合と比較: 9ジョブ → 7ジョブ (22%削減)
```

### パターン3: 段階的な OS テスト

```yaml
jobs:
  test-linux:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test

  test-other:
    needs: test-linux
    if: success()
    strategy:
      matrix:
        os: [windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - run: pnpm test

# Linux でエラーがあれば早期終了
# Windows/macOS の無駄な実行を回避
```

## 無料枠の最適化

### プラン別の無料枠

| プラン | 無料枠 | Linux換算 | Windows換算 | macOS換算 |
|--------|-------|-----------|------------|-----------|
| **Free** | 2,000分 | 2,000分 | 1,000分 | 250分 |
| **Pro** | 3,000分 | 3,000分 | 1,500分 | 375分 |
| **Team** | 3,000分 | 3,000分 | 1,500分 | 375分 |
| **Enterprise** | 50,000分 | 50,000分 | 25,000分 | 6,250分 |

### 無料枠内での最適化

```yaml
jobs:
  # 無料枠を効率的に使用
  build:
    runs-on: ubuntu-latest  # 最も効率的
    steps:
      - uses: actions/cache@v4  # キャッシングで時間短縮
      - run: pnpm ci
      - run: pnpm run build

  # 有料実行を最小化
  test-expensive:
    if: github.ref == 'refs/heads/main'
    runs-on: macos-latest
    # 本番環境のみで実行
```

## コスト監視

### GitHub Actions 使用量の確認

```bash
# 組織の使用量を確認
gh api /orgs/{org}/settings/billing/actions

# リポジトリの使用量を確認
gh api /repos/{owner}/{repo}/actions/runs \
  --jq '.workflow_runs[] | {name, conclusion, run_started_at, updated_at}'
```

### コスト計算スクリプト

```javascript
// scripts/calculate-cost.mjs
const runs = await fetch('https://api.github.com/repos/{owner}/{repo}/actions/runs');
const data = await runs.json();

let totalCost = 0;
for (const run of data.workflow_runs) {
  const duration = (new Date(run.updated_at) - new Date(run.run_started_at)) / 60000;
  const os = run.run_started_at.includes('ubuntu') ? 0.008 :
             run.run_started_at.includes('windows') ? 0.016 : 0.08;
  totalCost += duration * os;
}

console.log(`Total cost: $${totalCost.toFixed(2)}`);
```

## ベストプラクティス

### 1. ランナー選択のデシジョンツリー

```
プラットフォーム固有の機能が必要？
├─ No → ubuntu-latest (最安)
└─ Yes
   ├─ Windows 機能？ → windows-latest
   ├─ macOS 機能？ → macos-latest
   └─ iOS/macOS ビルド？ → macos-14 (M1)

月間実行時間 > 100時間？
└─ Yes → self-hosted を検討
```

### 2. コスト最適化チェックリスト

- [ ] デフォルトは ubuntu-latest を使用
- [ ] macOS は必要な場合のみ使用
- [ ] クロスプラットフォームビルドは Linux で実行
- [ ] 大型ランナーは2倍以上高速化する場合のみ
- [ ] 高頻度実行は self-hosted を検討
- [ ] 無料枠を効率的に使用
- [ ] コスト監視を実装

### 3. 段階的な移行

```yaml
# Phase 1: Linux 優先
runs-on: ubuntu-latest

# Phase 2: 条件付き macOS
runs-on: ${{ matrix.os }}
strategy:
  matrix:
    os: [ubuntu-latest]
    include:
      - os: macos-latest
        if: github.ref == 'refs/heads/main'

# Phase 3: Self-hosted 検討
runs-on: ${{ github.event_name == 'pull_request' && 'self-hosted' || 'ubuntu-latest' }}
```

## まとめ

ランナーコスト削減の優先順位:

1. **Linux 優先**: 最も効率的 (10-20倍安い)
2. **macOS 最小化**: 必要な場合のみ (80%削減)
3. **適切なサイズ**: 標準 vs 大型 (2倍以上高速化時のみ)
4. **Self-hosted 検討**: 高頻度実行 (60-100%削減)

これらを組み合わせることで、ランナーコストを50-90%削減できます。
