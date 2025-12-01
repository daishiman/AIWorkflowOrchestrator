# Design Patterns

再利用可能ワークフローの設計パターン: 合成、継承、チェーン。

## Composition Patterns

### Basic Composition

複数の再利用可能ワークフローを組み合わせて複雑なパイプラインを構築。

```yaml
name: Composed Pipeline

on: [push]

jobs:
  # コンポーネント1: ビルド
  build:
    uses: ./.github/workflows/component-build.yml
    with:
      node-version: '20'

  # コンポーネント2: テスト
  test:
    needs: build
    uses: ./.github/workflows/component-test.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}

  # コンポーネント3: デプロイ
  deploy:
    needs: [build, test]
    uses: ./.github/workflows/component-deploy.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}
      test-passed: ${{ needs.test.outputs.passed }}
```

### Parallel Composition

独立したコンポーネントを並列実行。

```yaml
jobs:
  lint:
    uses: ./.github/workflows/lint.yml

  type-check:
    uses: ./.github/workflows/type-check.yml

  unit-test:
    uses: ./.github/workflows/unit-test.yml

  # すべて完了後にデプロイ
  deploy:
    needs: [lint, type-check, unit-test]
    uses: ./.github/workflows/deploy.yml
```

### Conditional Composition

条件に基づいてコンポーネントを選択。

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml

  # プルリクエストのみ
  preview-deploy:
    if: github.event_name == 'pull_request'
    needs: build
    uses: ./.github/workflows/deploy-preview.yml

  # メインブランチのみ
  production-deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    uses: ./.github/workflows/deploy-production.yml
```

## Inheritance Patterns

### Base Workflow Pattern

基本ワークフローを定義し、異なる環境で再利用。

```yaml
# .github/workflows/base-deploy.yml
name: Base Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      requires-approval:
        required: false
        type: boolean
        default: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      - name: Wait for approval
        if: inputs.requires-approval
        uses: trstringer/manual-approval@v1

      - name: Deploy
        run: |
          echo "Deploying to ${{ inputs.environment }}"
          ./deploy.sh --env=${{ inputs.environment }}
```

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    uses: ./.github/workflows/base-deploy.yml
    with:
      environment: 'staging'
      requires-approval: false
```

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    uses: ./.github/workflows/base-deploy.yml
    with:
      environment: 'production'
      requires-approval: true
```

### Template Method Pattern

共通構造を定義し、特定のステップをカスタマイズ。

```yaml
# .github/workflows/template-test.yml
name: Test Template

on:
  workflow_call:
    inputs:
      test-command:
        required: true
        type: string
      setup-command:
        required: false
        type: string
        default: 'pnpm ci'
      coverage-required:
        required: false
        type: boolean
        default: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Template: Setup
      - name: Setup
        run: ${{ inputs.setup-command }}

      # Template: Test
      - name: Run tests
        run: ${{ inputs.test-command }}

      # Template: Coverage
      - name: Check coverage
        if: inputs.coverage-required
        run: pnpm run coverage:check
```

```yaml
# .github/workflows/unit-test.yml
name: Unit Tests

on: [push]

jobs:
  test:
    uses: ./.github/workflows/template-test.yml
    with:
      test-command: 'pnpm run test:unit'
      coverage-required: true
```

```yaml
# .github/workflows/e2e-test.yml
name: E2E Tests

on: [push]

jobs:
  test:
    uses: ./.github/workflows/template-test.yml
    with:
      setup-command: 'pnpm ci && npx playwright install'
      test-command: 'pnpm run test:e2e'
      coverage-required: false
```

## Chaining Patterns

### Linear Chain

ワークフローを線形に連鎖。

```yaml
jobs:
  stage-1-build:
    uses: ./.github/workflows/build.yml
    with:
      environment: 'build'

  stage-2-test:
    needs: stage-1-build
    uses: ./.github/workflows/test.yml
    with:
      build-id: ${{ needs.stage-1-build.outputs.build-id }}

  stage-3-scan:
    needs: stage-2-test
    uses: ./.github/workflows/security-scan.yml
    with:
      build-id: ${{ needs.stage-1-build.outputs.build-id }}

  stage-4-deploy:
    needs: stage-3-scan
    uses: ./.github/workflows/deploy.yml
    with:
      build-id: ${{ needs.stage-1-build.outputs.build-id }}
      scan-passed: ${{ needs.stage-3-scan.outputs.passed }}
```

### Fan-Out/Fan-In Chain

並列処理後に結果を集約。

```yaml
jobs:
  # Fan-Out: 複数環境でビルド
  build-linux:
    uses: ./.github/workflows/build.yml
    with:
      os: 'ubuntu-latest'

  build-windows:
    uses: ./.github/workflows/build.yml
    with:
      os: 'windows-latest'

  build-macos:
    uses: ./.github/workflows/build.yml
    with:
      os: 'macos-latest'

  # Fan-In: 結果を集約
  aggregate-results:
    needs: [build-linux, build-windows, build-macos]
    runs-on: ubuntu-latest
    steps:
      - name: Collect artifacts
        run: |
          echo "Linux: ${{ needs.build-linux.outputs.artifact-url }}"
          echo "Windows: ${{ needs.build-windows.outputs.artifact-url }}"
          echo "macOS: ${{ needs.build-macos.outputs.artifact-url }}"
```

### Conditional Chain

条件に基づいてチェーンを分岐。

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml

  # 条件分岐
  quick-test:
    if: github.event_name == 'pull_request'
    needs: build
    uses: ./.github/workflows/quick-test.yml

  full-test:
    if: github.ref == 'refs/heads/main'
    needs: build
    uses: ./.github/workflows/full-test.yml

  # 条件に応じて異なる入力で次のステージ
  deploy:
    needs: [quick-test, full-test]
    if: always() && !failure() && !cancelled()
    uses: ./.github/workflows/deploy.yml
    with:
      test-level: ${{ github.event_name == 'pull_request' && 'quick' || 'full' }}
```

## Strategy Patterns

### Multi-Environment Strategy

```yaml
jobs:
  deploy:
    strategy:
      matrix:
        environment:
          - name: dev
            url: https://dev.example.com
            approval: false
          - name: staging
            url: https://staging.example.com
            approval: false
          - name: production
            url: https://example.com
            approval: true

    uses: ./.github/workflows/deploy.yml
    with:
      environment: ${{ matrix.environment.name }}
      url: ${{ matrix.environment.url }}
      requires-approval: ${{ matrix.environment.approval }}
```

### Multi-Platform Strategy

```yaml
jobs:
  build-and-test:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            platform: linux
            arch: x64
          - os: windows-latest
            platform: windows
            arch: x64
          - os: macos-latest
            platform: darwin
            arch: arm64

    uses: ./.github/workflows/build-platform.yml
    with:
      os: ${{ matrix.os }}
      platform: ${{ matrix.platform }}
      architecture: ${{ matrix.arch }}
```

## Advanced Patterns

### Factory Pattern

動的にワークフローを生成。

```yaml
jobs:
  # Factory: 設定を生成
  generate-config:
    runs-on: ubuntu-latest
    outputs:
      config: ${{ steps.gen.outputs.config }}
    steps:
      - id: gen
        run: |
          CONFIG=$(cat <<EOF
          {
            "environments": ["dev", "staging", "prod"],
            "regions": ["us-east-1", "eu-west-1"],
            "features": ["auth", "api", "frontend"]
          }
          EOF
          )
          echo "config=${CONFIG}" >> $GITHUB_OUTPUT

  # Product: 生成された設定で実行
  deploy:
    needs: generate-config
    strategy:
      matrix:
        environment: ${{ fromJSON(needs.generate-config.outputs.config).environments }}
        region: ${{ fromJSON(needs.generate-config.outputs.config).regions }}
    uses: ./.github/workflows/deploy.yml
    with:
      environment: ${{ matrix.environment }}
      region: ${{ matrix.region }}
```

### Pipeline Pattern

複雑なパイプラインを段階的に構築。

```yaml
name: Complete Pipeline

on: [push]

jobs:
  # Phase 1: Preparation
  setup:
    uses: ./.github/workflows/pipeline-setup.yml
    with:
      prepare-cache: true

  # Phase 2: Build & Validate (parallel)
  build:
    needs: setup
    uses: ./.github/workflows/pipeline-build.yml
    with:
      cache-key: ${{ needs.setup.outputs.cache-key }}

  lint:
    needs: setup
    uses: ./.github/workflows/pipeline-lint.yml

  type-check:
    needs: setup
    uses: ./.github/workflows/pipeline-typecheck.yml

  # Phase 3: Testing (parallel)
  unit-test:
    needs: [build, lint, type-check]
    uses: ./.github/workflows/pipeline-test-unit.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}

  integration-test:
    needs: [build, lint, type-check]
    uses: ./.github/workflows/pipeline-test-integration.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}

  # Phase 4: Quality Gates
  quality-gate:
    needs: [unit-test, integration-test]
    uses: ./.github/workflows/pipeline-quality-gate.yml
    with:
      coverage: ${{ needs.unit-test.outputs.coverage }}
      test-results: ${{ needs.integration-test.outputs.results }}

  # Phase 5: Security
  security-scan:
    needs: build
    uses: ./.github/workflows/pipeline-security.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}

  # Phase 6: Deployment
  deploy:
    needs: [quality-gate, security-scan]
    if: github.ref == 'refs/heads/main'
    uses: ./.github/workflows/pipeline-deploy.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}
      quality-passed: ${{ needs.quality-gate.outputs.passed }}
      security-passed: ${{ needs.security-scan.outputs.passed }}

  # Phase 7: Post-deployment
  smoke-test:
    needs: deploy
    uses: ./.github/workflows/pipeline-smoke-test.yml
    with:
      deployment-url: ${{ needs.deploy.outputs.url }}

  notify:
    needs: [deploy, smoke-test]
    if: always()
    uses: ./.github/workflows/pipeline-notify.yml
    with:
      status: ${{ job.status }}
      deployment-url: ${{ needs.deploy.outputs.url }}
```

## Best Practices

### 1. Single Responsibility

各再利用可能ワークフローは一つの責務のみ。

```yaml
# ✅ 良い例: 単一責務
# build.yml - ビルドのみ
# test.yml - テストのみ
# deploy.yml - デプロイのみ

# ❌ 悪い例: 複数責務
# build-test-deploy.yml - すべて一緒
```

### 2. Clear Interface

入力/出力を明確に定義。

```yaml
# ✅ 良い例
on:
  workflow_call:
    inputs:
      environment:
        description: 'Deployment environment (dev|staging|prod)'
        required: true
        type: string
    outputs:
      deployment-url:
        description: 'URL of deployed application'
        value: ${{ jobs.deploy.outputs.url }}
```

### 3. Version Control

再利用可能ワークフローはバージョン管理。

```yaml
# ✅ 良い例: タグで参照
uses: org/workflows/.github/workflows/deploy.yml@v2.1.0

# ❌ 悪い例: ブランチで参照
uses: org/workflows/.github/workflows/deploy.yml@main
```

### 4. Error Handling

失敗時の動作を明確に。

```yaml
jobs:
  optional-scan:
    continue-on-error: true
    uses: ./.github/workflows/optional-scan.yml

  critical-test:
    uses: ./.github/workflows/test.yml
    # デフォルトで失敗時は停止
```

### 5. Documentation

各ワークフローを文書化。

```yaml
# ワークフローの説明をREADMEまたはコメントで提供
name: Reusable Build Workflow

# Purpose: Build and package the application
# Inputs:
#   - node-version: Node.js version (required)
#   - environment: Target environment (optional, default: production)
# Outputs:
#   - build-id: Unique build identifier
#   - artifact-url: URL to download build artifact

on:
  workflow_call:
    # ...
```
