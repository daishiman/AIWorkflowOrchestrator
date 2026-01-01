# パーミッションと環境変数詳細

## パーミッション設定

### ワークフローレベル

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
  packages: write
  deployments: write

jobs:
  build:
    runs-on: ubuntu-latest
```

### ジョブレベル

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read

  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
```

### 全権限無効化

```yaml
permissions: {}
```

### 読み取り専用

```yaml
permissions: read-all
```

### 書き込み可能

```yaml
permissions: write-all
```

## パーミッションスコープ一覧

| スコープ              | 説明             | 用途                                   |
| --------------------- | ---------------- | -------------------------------------- |
| `actions`             | GitHub Actions   | ワークフロー管理、アーティファクト削除 |
| `checks`              | チェック         | ステータスチェック作成・更新           |
| `contents`            | リポジトリ       | コード読み書き、リリース作成           |
| `deployments`         | デプロイ         | デプロイメント作成・管理               |
| `discussions`         | ディスカッション | ディスカッション管理                   |
| `id-token`            | OIDC             | クラウドプロバイダー認証               |
| `issues`              | Issue            | Issue作成・編集・クローズ              |
| `packages`            | パッケージ       | GitHub Packages読み書き                |
| `pages`               | Pages            | GitHub Pages管理                       |
| `pull-requests`       | PR               | PR作成・編集・マージ                   |
| `repository-projects` | プロジェクト     | プロジェクト管理                       |
| `security-events`     | セキュリティ     | コードスキャン結果                     |
| `statuses`            | ステータス       | コミットステータス更新                 |

## 権限レベル

- `read`: 読み取り専用
- `write`: 読み書き可能
- `none`: アクセス不可

## 環境変数

### ワークフローレベル

```yaml
env:
  NODE_ENV: production
  CI: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo $NODE_ENV
```

### ジョブレベル

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      BUILD_TYPE: release
    steps:
      - run: echo $BUILD_TYPE
```

### ステップレベル

```yaml
steps:
  - name: Build
    env:
      DEBUG: true
    run: pnpm run build
```

## デフォルト環境変数

| 変数名              | 説明                      |
| ------------------- | ------------------------- |
| `GITHUB_REPOSITORY` | オーナー/リポジトリ名     |
| `GITHUB_REF`        | 参照（refs/heads/main等） |
| `GITHUB_SHA`        | コミットSHA               |
| `GITHUB_ACTOR`      | トリガーしたユーザー      |
| `GITHUB_WORKFLOW`   | ワークフロー名            |
| `GITHUB_RUN_ID`     | 実行ID                    |
| `GITHUB_RUN_NUMBER` | 実行番号                  |
| `GITHUB_JOB`        | ジョブID                  |
| `GITHUB_ACTION`     | アクションID              |
| `GITHUB_EVENT_NAME` | イベント名                |
| `GITHUB_WORKSPACE`  | ワークスペースパス        |
| `RUNNER_OS`         | ランナーOS                |
| `RUNNER_ARCH`       | ランナーアーキテクチャ    |

## シークレットの使用

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
          TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
          TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}
        run: ./deploy.sh
```

## 同時実行制御 (concurrency)

### ワークフローレベル

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### ジョブレベル

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    concurrency:
      group: deploy-${{ github.ref }}
      cancel-in-progress: false
```

### よくあるパターン

```yaml
# ブランチごとに1つ
concurrency:
  group: ${{ github.ref }}
  cancel-in-progress: true

# PRごとに1つ
concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

# 本番デプロイは並列実行しない
concurrency:
  group: production-deploy
  cancel-in-progress: false
```

## デフォルト設定 (defaults)

```yaml
defaults:
  run:
    shell: bash
    working-directory: ./src

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
```
