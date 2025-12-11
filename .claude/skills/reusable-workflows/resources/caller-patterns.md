# Caller Patterns

再利用可能ワークフローを呼び出す側のパターンとベストプラクティス。

## Basic Calling Pattern

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on: [push, pull_request]

jobs:
  call-reusable:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: "20"
      environment: "staging"
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Local vs Remote

### Local (Same Repository)

```yaml
jobs:
  build:
    # 相対パス: .github/workflows/ からの相対
    uses: ./.github/workflows/reusable-build.yml
```

### Remote (Different Repository)

```yaml
jobs:
  build:
    # owner/repo/.github/workflows/workflow.yml@ref
    uses: octocat/shared-workflows/.github/workflows/build.yml@v1

  # タグ参照
  deploy:
    uses: company/workflows/.github/workflows/deploy.yml@v2.1.0

  # ブランチ参照
  test:
    uses: team/templates/.github/workflows/test.yml@main

  # コミットSHA参照（最も安全）
    uses: org/actions/.github/workflows/scan.yml@a1b2c3d4
```

## Passing Inputs

### Simple Inputs

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml
    with:
      node-version: "20"
      environment: "production"
      debug-mode: true
      timeout-minutes: 45
```

### Dynamic Inputs

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml
    with:
      # GitHub コンテキスト使用
      environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}

      # ワークフロー入力
      node-version: ${{ inputs.node-version || '20' }}

      # マトリックス値
      os: ${{ matrix.os }}
```

### Conditional Inputs

```yaml
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: |
        ${{
          github.ref_name == 'main' && 'production' ||
          github.ref_name == 'develop' && 'staging' ||
          'development'
        }}
```

## Passing Secrets

### Individual Secrets

```yaml
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Inherit All Secrets

```yaml
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    secrets: inherit
```

### Conditional Secrets

```yaml
jobs:
  deploy:
    uses: ./.github/workflows/deploy.yml
    secrets:
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
      # 本番環境のみのシークレット
      PROD_KEY: ${{ github.ref_name == 'main' && secrets.PROD_KEY || '' }}
```

## Using Outputs

### Basic Output Usage

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml
    with:
      node-version: "20"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy build
        run: |
          echo "Deploying build: ${{ needs.build.outputs.build-id }}"
          echo "Version: ${{ needs.build.outputs.version }}"
```

### Chaining Outputs

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml

  test:
    needs: build
    uses: ./.github/workflows/test.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}

  deploy:
    needs: [build, test]
    uses: ./.github/workflows/deploy.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}
      test-result: ${{ needs.test.outputs.result }}
```

### Output in Conditions

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml

  deploy:
    needs: build
    if: needs.build.outputs.should-deploy == 'true'
    uses: ./.github/workflows/deploy.yml
```

## Matrix Strategy

### Simple Matrix

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
    uses: ./.github/workflows/test.yml
    with:
      os: ${{ matrix.os }}
      node-version: ${{ matrix.node }}
```

### Matrix with Include/Exclude

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20]
        include:
          # 特定の組み合わせを追加
          - os: macos-latest
            node: 20
        exclude:
          # 特定の組み合わせを除外
          - os: windows-latest
            node: 18

    uses: ./.github/workflows/build.yml
    with:
      os: ${{ matrix.os }}
      node-version: ${{ matrix.node }}
```

### Dynamic Matrix

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          echo "matrix={\"version\":[\"18\",\"20\",\"22\"]}" >> $GITHUB_OUTPUT

  build:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    uses: ./.github/workflows/build.yml
    with:
      node-version: ${{ matrix.version }}
```

## Permissions

### Explicit Permissions

```yaml
jobs:
  deploy:
    permissions:
      contents: read
      id-token: write
    uses: ./.github/workflows/deploy.yml
```

### Inherit Permissions

```yaml
# Workflow level
permissions:
  contents: read
  packages: write

jobs:
  publish:
    uses: ./.github/workflows/publish.yml
    # 上位の permissions を継承
```

## Concurrency Control

```yaml
jobs:
  deploy:
    concurrency:
      group: deploy-${{ github.ref }}
      cancel-in-progress: false
    uses: ./.github/workflows/deploy.yml
```

## Environment

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
    uses: ./.github/workflows/deploy.yml
    secrets: inherit
```

## Complete Example: Multi-Stage Pipeline

```yaml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:

env:
  NODE_VERSION: "20"

jobs:
  # Stage 1: Build
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: ${{ env.NODE_VERSION }}
      environment: ${{ github.ref_name }}
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  # Stage 2: Test (parallel)
  unit-test:
    needs: build
    uses: ./.github/workflows/reusable-test.yml
    with:
      test-type: "unit"
      build-id: ${{ needs.build.outputs.build-id }}
      node-version: ${{ env.NODE_VERSION }}

  integration-test:
    needs: build
    uses: ./.github/workflows/reusable-test.yml
    with:
      test-type: "integration"
      build-id: ${{ needs.build.outputs.build-id }}
      node-version: ${{ env.NODE_VERSION }}

  e2e-test:
    needs: build
    uses: ./.github/workflows/reusable-e2e.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}
    secrets:
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

  # Stage 3: Quality Gates
  quality-check:
    needs: [unit-test, integration-test]
    uses: ./.github/workflows/reusable-quality.yml
    with:
      coverage: ${{ needs.unit-test.outputs.coverage }}
      build-id: ${{ needs.build.outputs.build-id }}

  security-scan:
    needs: build
    uses: ./.github/workflows/reusable-security.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}
    secrets:
      SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Stage 4: Deploy (conditional)
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs:
      [
        build,
        unit-test,
        integration-test,
        e2e-test,
        quality-check,
        security-scan,
      ]
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: "staging"
      build-id: ${{ needs.build.outputs.build-id }}
    secrets: inherit
    environment:
      name: staging
      url: https://staging.example.com

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs:
      [
        build,
        unit-test,
        integration-test,
        e2e-test,
        quality-check,
        security-scan,
      ]
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: "production"
      build-id: ${{ needs.build.outputs.build-id }}
    secrets: inherit
    environment:
      name: production
      url: https://example.com

  # Stage 5: Notification
  notify:
    if: always()
    needs: [deploy-staging, deploy-production]
    uses: ./.github/workflows/reusable-notify.yml
    with:
      status: ${{ job.status }}
      build-id: ${{ needs.build.outputs.build-id }}
    secrets:
      SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

## Best Practices

### 1. Version Pinning

```yaml
# ❌ 悪い例: 不安定なブランチ参照
uses: org/workflows/.github/workflows/deploy.yml@main

# ✅ 良い例: 安定したタグ参照
uses: org/workflows/.github/workflows/deploy.yml@v1.2.3

# ✅ 最良: コミットSHA（最も安全）
uses: org/workflows/.github/workflows/deploy.yml@a1b2c3d4e5f6
```

### 2. Secret Management

```yaml
# ❌ 悪い例: シークレットを出力
with:
  api-key: ${{ secrets.API_KEY }}

# ✅ 良い例: シークレットとして渡す
secrets:
  API_KEY: ${{ secrets.API_KEY }}
```

### 3. Conditional Execution

```yaml
# ✅ 条件付き呼び出し
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  uses: ./.github/workflows/deploy.yml
```

### 4. Error Handling

```yaml
# ✅ continue-on-error で続行
optional-check:
  continue-on-error: true
  uses: ./.github/workflows/optional-scan.yml

# ✅ 失敗時の通知
notify-failure:
  if: failure()
  needs: [build, test]
  uses: ./.github/workflows/notify.yml
```

### 5. Resource Optimization

```yaml
# ✅ 並列実行
test-unit:
  uses: ./.github/workflows/test.yml

test-integration:
  uses: ./.github/workflows/test.yml

# ✅ 条件付きスキップ
deploy:
  if: needs.test.outputs.changed == 'true'
  needs: test
  uses: ./.github/workflows/deploy.yml
```
