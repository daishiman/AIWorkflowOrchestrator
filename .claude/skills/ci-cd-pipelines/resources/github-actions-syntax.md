# GitHub Actions構文リファレンス

## ワークフロー基本構造

```yaml
name: CI                          # ワークフロー名
on: [push, pull_request]          # トリガー

jobs:
  build:                          # ジョブID
    runs-on: ubuntu-latest        # 実行環境
    steps:                        # ステップ配列
      - uses: actions/checkout@v4 # アクション使用
      - run: pnpm install          # コマンド実行
```

## トリガー設定詳細

### プルリクエストトリガー

```yaml
on:
  pull_request:
    branches: [main, develop]     # ターゲットブランチ
    paths:                        # パスフィルター
      - 'src/**'
      - 'package.json'
    types: [opened, synchronize, reopened]
```

### プッシュトリガー

```yaml
on:
  push:
    branches: [main]
    tags:
      - 'v*'                      # v で始まるタグ
    paths-ignore:
      - '**.md'                   # MDファイル変更は無視
```

### 手動実行トリガー

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
```

### スケジュールトリガー

```yaml
on:
  schedule:
    - cron: '0 0 * * *'           # 毎日0時UTC
```

## ジョブ設定

### 基本ジョブ

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10           # タイムアウト設定
    steps:
      - uses: actions/checkout@v4
```

### 依存関係（needs）

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [...]

  test:
    needs: build                  # buildジョブ完了後に実行
    runs-on: ubuntu-latest
    steps: [...]

  deploy:
    needs: [build, test]          # 複数ジョブ完了後
    runs-on: ubuntu-latest
    steps: [...]
```

### マトリクスビルド

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
      fail-fast: false            # 1つ失敗しても他は継続
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### 条件付き実行

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy only on success
        if: success()
        run: ./deploy.sh

      - name: Notify on failure
        if: failure()
        run: ./notify-failure.sh
```

## ステップ設定

### アクション使用

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0              # 全履歴取得
      token: ${{ secrets.GITHUB_TOKEN }}
```

### コマンド実行

```yaml
steps:
  - name: Install dependencies
    run: pnpm install --frozen-lockfile
    working-directory: ./app
    env:
      NODE_ENV: production
```

### 複数行コマンド

```yaml
steps:
  - name: Multi-line script
    run: |
      echo "Step 1"
      pnpm install
      pnpm run build
```

### シェル指定

```yaml
steps:
  - name: Bash script
    shell: bash
    run: |
      set -e
      ./scripts/deploy.sh
```

## 環境変数とシークレット

### 環境変数設定

```yaml
env:
  NODE_ENV: production            # ワークフローレベル

jobs:
  build:
    env:
      CI: true                    # ジョブレベル
    steps:
      - name: Build
        env:
          API_URL: https://api.example.com  # ステップレベル
        run: pnpm run build
```

### シークレット参照

```yaml
steps:
  - name: Deploy
    env:
      RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    run: railway up
```

### 動的環境変数

```yaml
steps:
  - name: Set output
    id: vars
    run: echo "sha_short=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

  - name: Use output
    run: echo "Short SHA: ${{ steps.vars.outputs.sha_short }}"
```

## キャッシュ設定

### 基本キャッシュ

```yaml
steps:
  - uses: actions/cache@v4
    with:
      path: ~/.pnpm-store
      key: pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
      restore-keys: |
        pnpm-
```

### pnpmセットアップ統合キャッシュ

```yaml
steps:
  - uses: pnpm/action-setup@v4
    with:
      version: 9

  - uses: actions/setup-node@v4
    with:
      node-version: 22
      cache: 'pnpm'               # 自動キャッシュ
```

### 複数パスキャッシュ

```yaml
steps:
  - uses: actions/cache@v4
    with:
      path: |
        ~/.pnpm-store
        .next/cache
        node_modules/.cache
      key: deps-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## アーティファクト管理

### アップロード

```yaml
steps:
  - name: Upload build artifacts
    uses: actions/upload-artifact@v4
    with:
      name: build-output
      path: dist/
      retention-days: 5
```

### ダウンロード

```yaml
steps:
  - name: Download artifacts
    uses: actions/download-artifact@v4
    with:
      name: build-output
      path: dist/
```

## 再利用可能ワークフロー

### 呼び出し側

```yaml
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: 22
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 再利用可能ワークフロー定義

```yaml
name: Reusable Test
on:
  workflow_call:
    inputs:
      node-version:
        type: number
        default: 22
    secrets:
      NPM_TOKEN:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
```

## 便利な式

### コンテキスト変数

```yaml
# github コンテキスト
${{ github.repository }}          # owner/repo
${{ github.ref }}                 # refs/heads/main
${{ github.sha }}                 # コミットSHA
${{ github.actor }}               # 実行者
${{ github.event_name }}          # トリガー名

# env コンテキスト
${{ env.MY_VAR }}

# secrets コンテキスト
${{ secrets.GITHUB_TOKEN }}

# steps コンテキスト
${{ steps.step_id.outputs.name }}
```

### 組み込み関数

```yaml
# 条件判定
${{ contains(github.event.head_commit.message, '[skip ci]') }}
${{ startsWith(github.ref, 'refs/tags/') }}
${{ endsWith(github.repository, '-private') }}

# 文字列操作
${{ format('Hello {0}', github.actor) }}
${{ join(matrix.os, ', ') }}

# JSON操作
${{ toJSON(github.event) }}
${{ fromJSON(needs.build.outputs.matrix) }}
```

## セキュリティベストプラクティス

### 最小権限の原則

```yaml
permissions:
  contents: read
  pull-requests: write            # 必要な権限のみ
```

### ピン留めバージョン

```yaml
# ❌ 避ける
- uses: actions/checkout@main

# ✅ 推奨
- uses: actions/checkout@v4.1.0
# または SHA でピン留め
- uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608
```

### シークレットの安全な使用

```yaml
# ❌ 避ける - シークレットがログに出力される可能性
- run: echo ${{ secrets.API_KEY }}

# ✅ 推奨 - 環境変数経由で使用
- run: ./script.sh
  env:
    API_KEY: ${{ secrets.API_KEY }}
```
