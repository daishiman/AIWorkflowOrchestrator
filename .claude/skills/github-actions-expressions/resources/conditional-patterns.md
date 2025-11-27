# 条件付き実行の実践パターン

## 概要

GitHub Actionsの式と条件付き実行を組み合わせることで、効率的で柔軟なワークフローを構築できます。
このドキュメントでは、実際のプロジェクトで頻繁に使用される条件パターンと、
それらを効果的に活用するためのベストプラクティスを提供します。

## ブランチベースの条件付き実行

### メインブランチのみで実行

```yaml
# パターン1: 完全一致
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy

# パターン2: ブランチ名のみで判定
jobs:
  deploy:
    if: github.ref_name == 'main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

### 複数ブランチで実行

```yaml
# OR条件
jobs:
  build:
    if: |
      github.ref == 'refs/heads/main' ||
      github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest

# contains使用
jobs:
  build:
    if: |
      contains(github.ref, 'refs/heads/main') ||
      contains(github.ref, 'refs/heads/develop')
    runs-on: ubuntu-latest
```

### ブランチパターンマッチング

```yaml
# feature/* ブランチ
- if: startsWith(github.ref, 'refs/heads/feature/')
  run: echo "Feature branch"

# release/* ブランチ
- if: startsWith(github.ref, 'refs/heads/release/')
  run: npm run build-release

# hotfix/* ブランチ
- if: startsWith(github.ref, 'refs/heads/hotfix/')
  run: npm run hotfix-deploy
```

### ブランチ除外

```yaml
# main以外のブランチで実行
- if: github.ref != 'refs/heads/main'
  run: npm run test

# feature/*ブランチを除外
- if: |
    !startsWith(github.ref, 'refs/heads/feature/') &&
    github.ref == 'refs/heads/develop'
  run: npm run integration-test
```

## タグベースの条件付き実行

### タグプッシュの検出

```yaml
# すべてのタグ
jobs:
  release:
    if: github.ref_type == 'tag'
    runs-on: ubuntu-latest

# 別パターン
jobs:
  release:
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
```

### バージョンタグのパターンマッチング

```yaml
# vで始まるタグ（v1.0.0, v2.1.3など）
- if: startsWith(github.ref, 'refs/tags/v')
  run: echo "Version tag detected"

# セマンティックバージョニング対応
- if: |
    startsWith(github.ref, 'refs/tags/v') &&
    !contains(github.ref, '-alpha') &&
    !contains(github.ref, '-beta')
  run: npm run release-production

# プレリリースタグ
- if: |
    startsWith(github.ref, 'refs/tags/v') &&
    (contains(github.ref, '-alpha') || contains(github.ref, '-beta'))
  run: npm run release-prerelease
```

## イベントタイプベースの条件付き実行

### Push vs Pull Request

```yaml
# Pushイベント
- if: github.event_name == 'push'
  run: npm run deploy

# Pull Requestイベント
- if: github.event_name == 'pull_request'
  run: npm run pr-check

# 複数イベント
- if: |
    github.event_name == 'push' ||
    github.event_name == 'workflow_dispatch'
  run: npm run manual-trigger-allowed
```

### Pull Requestの詳細条件

```yaml
# PRが開かれた時のみ
- if: |
    github.event_name == 'pull_request' &&
    github.event.action == 'opened'
  run: echo "New PR created"

# PRが同期（更新）された時
- if: |
    github.event_name == 'pull_request' &&
    github.event.action == 'synchronize'
  run: npm run incremental-test

# PRがマージ可能な時
- if: |
    github.event_name == 'pull_request' &&
    github.event.pull_request.mergeable == true
  run: npm run pre-merge-check
```

## ラベルベースの条件付き実行

### 単一ラベルチェック

```yaml
# "deploy"ラベルが付いている
- if: contains(github.event.pull_request.labels.*.name, 'deploy')
  run: npm run deploy-preview

# "skip-ci"ラベルが付いていない
- if: |
    github.event_name == 'pull_request' &&
    !contains(github.event.pull_request.labels.*.name, 'skip-ci')
  run: npm test
```

### 複数ラベルの組み合わせ

```yaml
# "approved" かつ "ready-to-merge"
- if: |
    contains(github.event.pull_request.labels.*.name, 'approved') &&
    contains(github.event.pull_request.labels.*.name, 'ready-to-merge')
  run: npm run pre-merge-validation

# "deploy" かつ "wip"ではない
- if: |
    contains(github.event.pull_request.labels.*.name, 'deploy') &&
    !contains(github.event.pull_request.labels.*.name, 'wip')
  run: npm run deploy
```

## コミットメッセージベースの条件付き実行

### キーワード検出

```yaml
# [skip ci] を含む場合スキップ
- if: |
    !contains(github.event.head_commit.message, '[skip ci]') &&
    !contains(github.event.head_commit.message, '[ci skip]')
  run: npm test

# [deploy] を含む場合デプロイ
- if: contains(github.event.head_commit.message, '[deploy]')
  run: npm run deploy

# Conventional Commits
- if: startsWith(github.event.head_commit.message, 'feat:')
  run: echo "Feature commit"

- if: startsWith(github.event.head_commit.message, 'fix:')
  run: echo "Bug fix commit"
```

### 複数キーワードの組み合わせ

```yaml
- if: |
    contains(github.event.head_commit.message, '[force-deploy]') ||
    (
      github.ref == 'refs/heads/main' &&
      contains(github.event.head_commit.message, 'release:')
    )
  run: npm run force-deploy
```

## ステップ結果ベースの条件付き実行

### 前ステップの成功・失敗

```yaml
steps:
  - id: build
    run: npm run build

  # ビルド成功時のみテスト
  - if: success()
    run: npm test

  # ビルド失敗時のみクリーンアップ
  - if: failure()
    run: npm run clean

  # 常に実行
  - if: always()
    run: docker-compose down
```

### ステップ出力による条件分岐

```yaml
steps:
  - id: check-changes
    run: |
      if git diff --name-only HEAD~1 | grep "^src/"; then
        echo "HAS_CHANGES=true" >> $GITHUB_OUTPUT
      else
        echo "HAS_CHANGES=false" >> $GITHUB_OUTPUT
      fi

  - if: steps.check-changes.outputs.HAS_CHANGES == 'true'
    run: npm run build

  # 複数ステップ出力の組み合わせ
  - id: version
    run: echo "VERSION=2.0.0" >> $GITHUB_OUTPUT

  - if: |
      steps.check-changes.outputs.HAS_CHANGES == 'true' &&
      startsWith(steps.version.outputs.VERSION, '2.')
    run: npm run migrate-v2
```

### ステップの結論による分岐

```yaml
steps:
  - id: test
    continue-on-error: true
    run: npm test

  - if: steps.test.conclusion == 'success'
    run: echo "All tests passed"

  - if: steps.test.conclusion == 'failure'
    run: |
      echo "Tests failed, but continuing..."
      npm run generate-report
```

## マトリクスベースの条件付き実行

### マトリクス値による分岐

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [16, 18, 20]
    runs-on: ${{ matrix.os }}
    steps:
      # Ubuntu専用セットアップ
      - if: matrix.os == 'ubuntu-latest'
        run: sudo apt-get update

      # Windows専用セットアップ
      - if: matrix.os == 'windows-latest'
        run: choco install nodejs

      # 特定バージョンのみ追加テスト
      - if: matrix.node == 20
        run: npm run future-compat-test

      # 複数条件
      - if: |
          matrix.os == 'ubuntu-latest' &&
          matrix.node >= 18
        run: npm run integration-test
```

### マトリクス除外パターン

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [16, 18, 20]
    runs-on: ${{ matrix.os }}
    steps:
      # Windows + Node 16 の組み合わせをスキップ
      - if: |
          !(matrix.os == 'windows-latest' && matrix.node == 16)
        run: npm test
```

## 依存ジョブの結果による条件付き実行

### needs による条件分岐

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}
    steps:
      - id: version
        run: echo "value=1.0.0" >> $GITHUB_OUTPUT

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: [build, test]
    # すべてのジョブが成功した場合のみ
    if: |
      needs.build.result == 'success' &&
      needs.test.result == 'success'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy

  cleanup:
    needs: [build, test, deploy]
    # 常に実行（失敗しても）
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: echo "Cleaning up..."

  rollback:
    needs: deploy
    # デプロイが失敗した場合のみ
    if: needs.deploy.result == 'failure'
    runs-on: ubuntu-latest
    steps:
      - run: npm run rollback
```

### ジョブ出力の活用

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      should-deploy: ${{ steps.check.outputs.deploy }}
    steps:
      - id: check
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "deploy=true" >> $GITHUB_OUTPUT
          else
            echo "deploy=false" >> $GITHUB_OUTPUT
          fi

  deploy:
    needs: setup
    if: needs.setup.outputs.should-deploy == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

## ファイル変更ベースの条件付き実行

### 変更ファイルの検出

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 2

  - id: check-files
    run: |
      if git diff --name-only HEAD~1 | grep "^src/"; then
        echo "SRC_CHANGED=true" >> $GITHUB_OUTPUT
      fi
      if git diff --name-only HEAD~1 | grep "^docs/"; then
        echo "DOCS_CHANGED=true" >> $GITHUB_OUTPUT
      fi

  - if: steps.check-files.outputs.SRC_CHANGED == 'true'
    run: npm run build

  - if: steps.check-files.outputs.DOCS_CHANGED == 'true'
    run: npm run build-docs
```

### パスフィルターとの組み合わせ

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'

jobs:
  build:
    # パスフィルターと追加条件
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
```

## 環境変数・シークレットベースの条件付き実行

### シークレットの存在確認

```yaml
steps:
  # シークレットが設定されている場合のみ実行
  - if: secrets.DEPLOY_TOKEN != null
    run: |
      echo "Deploying with token..."
      curl -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}" \
        https://api.example.com/deploy

  # 複数シークレットの確認
  - if: |
      secrets.AWS_ACCESS_KEY_ID != null &&
      secrets.AWS_SECRET_ACCESS_KEY != null
    run: aws s3 sync build/ s3://my-bucket
```

### 環境変数による分岐

```yaml
env:
  DEPLOY_ENV: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - if: env.DEPLOY_ENV == 'production'
        run: npm run deploy-production

      - if: env.DEPLOY_ENV == 'staging'
        run: npm run deploy-staging
```

### 設定変数（vars）の活用

```yaml
steps:
  - if: vars.ENABLE_FEATURE_X == 'true'
    run: npm run feature-x-test

  - if: vars.DEPLOY_ENVIRONMENT == 'production'
    run: npm run production-deploy
```

## 時間ベースの条件付き実行

### スケジュール実行での条件分岐

```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # 毎日午前0時
  push:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # スケジュール実行時のみフルテスト
      - if: github.event_name == 'schedule'
        run: npm run test:full

      # Push時は差分テスト
      - if: github.event_name == 'push'
        run: npm run test:incremental
```

## 複雑な条件パターン

### ネストした条件

```yaml
- if: |
    (
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main'
    ) ||
    (
      github.event_name == 'pull_request' &&
      contains(github.event.pull_request.labels.*.name, 'deploy-preview')
    ) ||
    (
      github.event_name == 'workflow_dispatch' &&
      inputs.force-deploy == true
    )
  run: npm run deploy
```

### 複数ファクターの組み合わせ

```yaml
jobs:
  deploy:
    if: |
      github.ref == 'refs/heads/main' &&
      github.event_name == 'push' &&
      !contains(github.event.head_commit.message, '[skip deploy]') &&
      secrets.DEPLOY_TOKEN != null
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

## ベストプラクティス

### 1. 可読性の優先

```yaml
# ❌ 悪い例: 長い条件を1行で
- if: github.ref == 'refs/heads/main' && github.event_name == 'push' && !contains(github.event.head_commit.message, '[skip ci]') && success()

# ✅ 良い例: 複数行で整形
- if: |
    github.ref == 'refs/heads/main' &&
    github.event_name == 'push' &&
    !contains(github.event.head_commit.message, '[skip ci]') &&
    success()
```

### 2. DRYの原則

```yaml
# 条件を環境変数として定義
env:
  IS_MAIN_PUSH: ${{ github.ref == 'refs/heads/main' && github.event_name == 'push' }}

jobs:
  deploy:
    if: env.IS_MAIN_PUSH == 'true'
    runs-on: ubuntu-latest

# または、ジョブレベルで判定
jobs:
  check:
    outputs:
      should-deploy: ${{ steps.check.outputs.result }}
    steps:
      - id: check
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "result=true" >> $GITHUB_OUTPUT
          fi

  deploy:
    needs: check
    if: needs.check.outputs.should-deploy == 'true'
    runs-on: ubuntu-latest
```

### 3. フェイルセーフな設計

```yaml
# デフォルトでセキュアな状態
- if: |
    github.ref == 'refs/heads/main' &&
    secrets.DEPLOY_TOKEN != null &&
    success()
  run: npm run deploy

# エラー時のフォールバック
- if: failure()
  run: npm run rollback
```

### 4. テストしやすい条件

```yaml
# workflow_dispatchで条件をテスト可能に
on:
  workflow_dispatch:
    inputs:
      simulate-main:
        type: boolean
        default: false

jobs:
  deploy:
    if: |
      inputs.simulate-main == true ||
      github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
```

## 参考資料

- GitHub公式ドキュメント: [Using conditions to control job execution](https://docs.github.com/en/actions/using-jobs/using-conditions-to-control-job-execution)
- GitHub公式ドキュメント: [Expressions](https://docs.github.com/en/actions/learn-github-actions/expressions)
