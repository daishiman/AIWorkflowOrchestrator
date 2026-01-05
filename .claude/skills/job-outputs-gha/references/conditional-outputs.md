# 条件付き出力パターン

## 概要

このドキュメントでは、条件に基づいてジョブ出力を制御する
様々なパターンを解説します。

## 基本パターン

### if文による条件付き出力

```yaml
jobs:
  check:
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
    needs: check
    if: needs.check.outputs.should-deploy == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "本番環境にデプロイ"
```

### 複数条件の組み合わせ

```yaml
jobs:
  analyze:
    outputs:
      deploy-env: ${{ steps.env.outputs.name }}
      skip-tests: ${{ steps.env.outputs.skip-tests }}
    steps:
      - id: env
        run: |
          ref="${{ github.ref }}"
          event="${{ github.event_name }}"

          if [ "$ref" == "refs/heads/main" ]; then
            echo "name=production" >> $GITHUB_OUTPUT
            echo "skip-tests=false" >> $GITHUB_OUTPUT
          elif [ "$ref" == "refs/heads/staging" ]; then
            echo "name=staging" >> $GITHUB_OUTPUT
            echo "skip-tests=false" >> $GITHUB_OUTPUT
          elif [ "$event" == "pull_request" ]; then
            echo "name=preview" >> $GITHUB_OUTPUT
            echo "skip-tests=true" >> $GITHUB_OUTPUT
          else
            echo "name=development" >> $GITHUB_OUTPUT
            echo "skip-tests=true" >> $GITHUB_OUTPUT
          fi
```

## 高度なパターン

### 環境に基づく動的設定

```yaml
jobs:
  config:
    outputs:
      replicas: ${{ steps.config.outputs.replicas }}
      memory: ${{ steps.config.outputs.memory }}
    steps:
      - id: config
        run: |
          env="${{ github.ref_name }}"
          case $env in
            main)
              echo "replicas=3" >> $GITHUB_OUTPUT
              echo "memory=4Gi" >> $GITHUB_OUTPUT
              ;;
            staging)
              echo "replicas=2" >> $GITHUB_OUTPUT
              echo "memory=2Gi" >> $GITHUB_OUTPUT
              ;;
            *)
              echo "replicas=1" >> $GITHUB_OUTPUT
              echo "memory=1Gi" >> $GITHUB_OUTPUT
              ;;
          esac
```

### 変更ファイルに基づく条件分岐

```yaml
jobs:
  detect-changes:
    outputs:
      frontend-changed: ${{ steps.changes.outputs.frontend }}
      backend-changed: ${{ steps.changes.outputs.backend }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - id: changes
        run: |
          # main からの差分を確認
          changed=$(git diff --name-only origin/main...HEAD)

          if echo "$changed" | grep -q "^frontend/"; then
            echo "frontend=true" >> $GITHUB_OUTPUT
          else
            echo "frontend=false" >> $GITHUB_OUTPUT
          fi

          if echo "$changed" | grep -q "^backend/"; then
            echo "backend=true" >> $GITHUB_OUTPUT
          else
            echo "backend=false" >> $GITHUB_OUTPUT
          fi

  build-frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend-changed == 'true'
    steps:
      - run: echo "フロントエンドをビルド"

  build-backend:
    needs: detect-changes
    if: needs.detect-changes.outputs.backend-changed == 'true'
    steps:
      - run: echo "バックエンドをビルド"
```

### 前のジョブの結果に基づく分岐

```yaml
jobs:
  test:
    outputs:
      status: ${{ steps.test.outputs.status }}
      coverage: ${{ steps.test.outputs.coverage }}
    steps:
      - id: test
        run: |
          # テスト実行
          coverage=85
          if [ $coverage -ge 80 ]; then
            echo "status=passed" >> $GITHUB_OUTPUT
          else
            echo "status=failed" >> $GITHUB_OUTPUT
          fi
          echo "coverage=$coverage" >> $GITHUB_OUTPUT

  notify-success:
    needs: test
    if: needs.test.outputs.status == 'passed'
    steps:
      - run: echo "テスト成功通知"

  notify-failure:
    needs: test
    if: needs.test.outputs.status == 'failed'
    steps:
      - run: echo "テスト失敗通知"
```

## 空出力の安全な処理

### デフォルト値の設定

```yaml
jobs:
  optional:
    outputs:
      value: ${{ steps.maybe.outputs.value }}
    steps:
      - id: maybe
        run: |
          if [ some-condition ]; then
            echo "value=something" >> $GITHUB_OUTPUT
          fi
          # 条件に合わない場合、出力は空

  consumer:
    needs: optional
    steps:
      - run: |
          value="${{ needs.optional.outputs.value }}"
          if [ -z "$value" ]; then
            value="default-value"
          fi
          echo "使用する値: $value"
```

### 空チェック付きの条件分岐

```yaml
jobs:
  deploy:
    needs: build
    if: needs.build.outputs.artifact-url != ''
    steps:
      - run: echo "デプロイ実行"
```

## ベストプラクティス

1. **明示的な値設定**: 条件に合わない場合も明示的に値を設定
2. **空文字列チェック**: 出力が空の可能性がある場合は必ずチェック
3. **型の一貫性**: 同じ出力は常に同じ型を返す
4. **デバッグログ**: 条件分岐のデバッグ用に中間値を出力
