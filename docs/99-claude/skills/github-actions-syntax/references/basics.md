# GitHub Actions ワークフロー基礎

> 18-skills.md §3.5 準拠
> **相対パス**: `references/basics.md`

---

## 概要

GitHub Actionsワークフローの基本構造と構文。YAMLベースの設定ファイルでCI/CDパイプラインを定義する。

---

## ワークフロー基本構造

```yaml
# ワークフロー名（GitHub UIに表示）
name: CI Pipeline

# トリガーイベント
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# グローバルパーミッション
permissions:
  contents: read

# グローバル環境変数
env:
  NODE_VERSION: "20"

# ジョブ定義
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
```

---

## トップレベルキー

| キー          | 必須 | 説明               |
| ------------- | ---- | ------------------ |
| `name`        | 任意 | ワークフロー名     |
| `on`          | 必須 | トリガーイベント   |
| `permissions` | 推奨 | GITHUB_TOKENの権限 |
| `env`         | 任意 | グローバル環境変数 |
| `jobs`        | 必須 | ジョブ定義         |
| `concurrency` | 任意 | 同時実行制御       |
| `defaults`    | 任意 | デフォルト設定     |

---

## イベントトリガー

### 基本イベント

```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - "src/**"
      - "!src/**/*.test.ts"

  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]

  schedule:
    - cron: "0 0 * * 1" # 毎週月曜

  workflow_dispatch: # 手動トリガー
    inputs:
      environment:
        description: "Deploy environment"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production
```

### イベント一覧

| イベント            | 説明                   |
| ------------------- | ---------------------- |
| `push`              | プッシュ時             |
| `pull_request`      | PR作成・更新時         |
| `schedule`          | スケジュール実行       |
| `workflow_dispatch` | 手動トリガー           |
| `workflow_call`     | 再利用可能ワークフロー |
| `release`           | リリース時             |
| `issues`            | Issue操作時            |

---

## ジョブ定義

### 基本構造

```yaml
jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

### ジョブ依存関係

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

---

## ステップ定義

### アクション使用

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0

  - uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: "npm"
```

### コマンド実行

```yaml
steps:
  - name: Run tests
    run: npm test
    working-directory: ./app
    env:
      CI: true
```

### 複数行コマンド

```yaml
steps:
  - name: Setup
    run: |
      echo "Setting up..."
      npm ci
      npm run build
```

---

## 環境変数

### スコープ

| スコープ     | 定義場所           | 参照方法             |
| ------------ | ------------------ | -------------------- |
| ワークフロー | トップレベルenv    | `${{ env.VAR }}`     |
| ジョブ       | jobs.<job>.env     | `${{ env.VAR }}`     |
| ステップ     | steps.<step>.env   | `${{ env.VAR }}`     |
| シークレット | GitHubシークレット | `${{ secrets.VAR }}` |

### 定義例

```yaml
env:
  NODE_ENV: production

jobs:
  build:
    env:
      CI: true
    steps:
      - run: echo $NODE_ENV
        env:
          DEBUG: true
```

---

## コンテキスト

| コンテキスト | 説明             | 例                               |
| ------------ | ---------------- | -------------------------------- |
| `github`     | ワークフロー情報 | `${{ github.ref }}`              |
| `env`        | 環境変数         | `${{ env.NODE_ENV }}`            |
| `secrets`    | シークレット     | `${{ secrets.API_KEY }}`         |
| `job`        | ジョブ情報       | `${{ job.status }}`              |
| `steps`      | ステップ出力     | `${{ steps.step_id.outputs.* }}` |
| `matrix`     | マトリックス値   | `${{ matrix.node }}`             |

---

## 関連リソース

- **実装パターン**: See [patterns.md](patterns.md)
- **構文リファレンス**: See [syntax-reference.md](syntax-reference.md)
