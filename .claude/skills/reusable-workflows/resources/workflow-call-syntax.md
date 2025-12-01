# Workflow Call Syntax

`workflow_call` イベントを使用した再利用可能ワークフローの詳細構文リファレンス。

## Basic Structure

```yaml
name: Reusable Workflow Name

on:
  workflow_call:
    inputs:
      # 入力パラメータ定義
    outputs:
      # 出力定義
    secrets:
      # シークレット定義
```

## Inputs Definition

### Input Types

```yaml
on:
  workflow_call:
    inputs:
      # String型
      environment:
        description: 'Deployment environment'
        required: true
        type: string

      # Boolean型
      debug-mode:
        description: 'Enable debug logging'
        required: false
        type: boolean
        default: false

      # Number型
      timeout-minutes:
        description: 'Job timeout in minutes'
        required: false
        type: number
        default: 30

      # Choice型（列挙）- stringで実装
      log-level:
        description: 'Logging level'
        required: false
        type: string
        default: 'info'
```

### Input Properties

| Property | Required | Description |
|----------|----------|-------------|
| `description` | No | 入力の説明 |
| `required` | No | 必須かどうか（デフォルト: false） |
| `type` | Yes | string, boolean, number のいずれか |
| `default` | No | デフォルト値（required: false の場合） |

### Using Inputs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Use input
        run: |
          echo "Environment: ${{ inputs.environment }}"
          echo "Debug: ${{ inputs.debug-mode }}"
          echo "Timeout: ${{ inputs.timeout-minutes }}"

      - name: Conditional step
        if: inputs.debug-mode == true
        run: echo "Debug mode enabled"
```

## Outputs Definition

### Basic Output

```yaml
on:
  workflow_call:
    outputs:
      build-version:
        description: "Built version identifier"
        value: ${{ jobs.build.outputs.version }}

      artifact-url:
        description: "URL to download artifact"
        value: ${{ jobs.build.outputs.url }}
```

### Setting Job Outputs

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}
      url: ${{ steps.upload.outputs.artifact-url }}

    steps:
      - name: Generate version
        id: version
        run: echo "value=1.0.${{ github.run_number }}" >> $GITHUB_OUTPUT

      - name: Upload artifact
        id: upload
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
```

### Output Properties

| Property | Required | Description |
|----------|----------|-------------|
| `description` | No | 出力の説明 |
| `value` | Yes | 出力値（ジョブの出力を参照） |

## Secrets Definition

### Secret Types

```yaml
on:
  workflow_call:
    secrets:
      # 必須シークレット
      NPM_TOKEN:
        required: true
        description: 'pnpm registry token'

      # オプショナルシークレット
      SENTRY_DSN:
        required: false
        description: 'Sentry error tracking DSN'
```

### Using Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy with token
        run: pnpm publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Configure Sentry
        if: secrets.SENTRY_DSN != ''
        run: |
          echo "SENTRY_DSN=${{ secrets.SENTRY_DSN }}" >> .env
```

### Secret Inheritance

呼び出し側で `secrets: inherit` を使用すると、すべてのシークレットを継承:

```yaml
# Caller workflow
jobs:
  build:
    uses: ./.github/workflows/reusable.yml
    secrets: inherit
```

## Complete Example

```yaml
name: Reusable Build and Test

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version to use'
        required: true
        type: string

      environment:
        description: 'Target environment'
        required: false
        type: string
        default: 'development'

      run-tests:
        description: 'Run test suite'
        required: false
        type: boolean
        default: true

      test-timeout:
        description: 'Test timeout in minutes'
        required: false
        type: number
        default: 10

    outputs:
      build-id:
        description: "Unique build identifier"
        value: ${{ jobs.build.outputs.build-id }}

      test-result:
        description: "Test result (passed/failed/skipped)"
        value: ${{ jobs.test.outputs.result }}

      coverage:
        description: "Test coverage percentage"
        value: ${{ jobs.test.outputs.coverage }}

    secrets:
      NPM_TOKEN:
        required: true
        description: 'pnpm authentication token'

      CODECOV_TOKEN:
        required: false
        description: 'Codecov upload token'

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      build-id: ${{ steps.build-info.outputs.id }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Build
        run: pnpm run build
        env:
          NODE_ENV: ${{ inputs.environment }}

      - name: Generate build info
        id: build-info
        run: |
          BUILD_ID="build-${{ github.run_number }}-$(date +%s)"
          echo "id=${BUILD_ID}" >> $GITHUB_OUTPUT
          echo "Built: ${BUILD_ID}"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ steps.build-info.outputs.id }}
          path: dist/

  test:
    if: inputs.run-tests
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: ${{ inputs.test-timeout }}
    outputs:
      result: ${{ steps.test.outputs.result }}
      coverage: ${{ steps.test.outputs.coverage }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'pnpm'

      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: build-${{ needs.build.outputs.build-id }}
          path: dist/

      - name: Run tests
        id: test
        run: |
          pnpm test -- --coverage
          RESULT=$?
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')

          if [ $RESULT -eq 0 ]; then
            echo "result=passed" >> $GITHUB_OUTPUT
          else
            echo "result=failed" >> $GITHUB_OUTPUT
          fi
          echo "coverage=${COVERAGE}" >> $GITHUB_OUTPUT
          exit $RESULT

      - name: Upload coverage
        if: secrets.CODECOV_TOKEN != ''
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
```

## Validation Rules

1. **入力名**: 小文字、数字、ハイフン、アンダースコアのみ
2. **型指定**: string, boolean, number のいずれか必須
3. **required + default**: 同時指定不可
4. **出力値**: 必ずジョブ出力を参照
5. **シークレット**: 環境変数として使用、直接出力しない

## Limitations

- **最大入力数**: 10個まで
- **最大出力数**: 50個まで
- **最大シークレット数**: 100個まで
- **ネスト制限**: 再利用可能ワークフローは最大4階層まで
- **ローカル参照**: 同じリポジトリ内の相対パスのみ、または他リポジトリの絶対パス

## Best Practices

1. **明確な命名**: 入力/出力/シークレット名は説明的に
2. **デフォルト値**: 可能な限りデフォルト値を提供
3. **ドキュメント**: description を必ず記述
4. **型安全**: 適切な型を使用（数値なら number）
5. **バリデーション**: 入力値の検証ステップを追加
6. **エラーハンドリング**: 失敗時の動作を明確に
