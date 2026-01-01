# Composite Action 構文リファレンス

## action.yml 基本構造

### 必須フィールド

```yaml
name: "My Action" # アクション名（必須）
description: "Action purpose" # 説明（必須）

runs:
  using: "composite" # 必須: 'composite' を指定
  steps: [] # 実行ステップ（必須）
```

### 完全な構造

```yaml
name: "Complete Composite Action"
description: "Full example with all features"
author: "Your Name"
branding:
  icon: "activity"
  color: "blue"

inputs:
  input-name:
    description: "Input description"
    required: true|false
    default: "default value"
    deprecationMessage: "Use new-input instead"

outputs:
  output-name:
    description: "Output description"
    value: ${{ steps.step-id.outputs.value }}

runs:
  using: "composite"
  steps:
    - name: "Step name"
      id: step-id
      uses: actions/checkout@v4
      with:
        param: value
      shell: bash
      run: |
        echo "script"
      if: inputs.condition == 'true'
      env:
        KEY: value
      continue-on-error: true
```

---

## inputs 定義

### 基本的な入力

```yaml
inputs:
  # 文字列入力
  message:
    description: "メッセージテキスト"
    required: true

  # デフォルト値付き
  log-level:
    description: "ログレベル"
    required: false
    default: "info"

  # 非推奨の入力
  old-param:
    description: "古いパラメータ"
    required: false
    deprecationMessage: "Use new-param instead. Will be removed in v2.0.0"
```

### 入力の型と検証

```yaml
inputs:
  # 真偽値
  enable-feature:
    description: "機能を有効化"
    required: false
    default: "false" # 注意: 文字列として定義

  # 数値
  timeout:
    description: "タイムアウト（秒）"
    required: false
    default: "300" # 注意: 文字列として定義

  # 選択肢（ドキュメントで明記）
  environment:
    description: "環境 (dev, staging, prod)"
    required: true
    # 注意: 列挙型の検証は実装側で行う
```

### 複雑な入力例

```yaml
inputs:
  # JSON形式の入力
  config:
    description: "JSON形式の設定"
    required: false
    default: "{}"

  # マルチライン入力
  script:
    description: "実行するスクリプト"
    required: true

  # パス入力
  working-directory:
    description: "作業ディレクトリ"
    required: false
    default: "."
```

---

## outputs 定義

### 基本的な出力

```yaml
outputs:
  # 単一値の出力
  result:
    description: "処理結果"
    value: ${{ steps.process.outputs.result }}

  # 真偽値の出力
  success:
    description: "成功したかどうか"
    value: ${{ steps.check.outputs.success }}

  # 複数ステップの出力を結合
  summary:
    description: "処理サマリー"
    value: |
      Status: ${{ steps.check.outputs.status }}
      Duration: ${{ steps.measure.outputs.duration }}
```

### 条件付き出力

```yaml
outputs:
  # 条件によって値を変更
  deployment-url:
    description: "デプロイメントURL"
    value: ${{ inputs.environment == 'prod' && steps.deploy.outputs.prod-url || steps.deploy.outputs.dev-url }}

  # 存在チェック
  cache-hit:
    description: "キャッシュヒット"
    value: ${{ steps.cache.outputs.cache-hit || 'false' }}
```

### ステップでの出力設定

```yaml
runs:
  using: "composite"
  steps:
    # 単一値の出力
    - id: compute
      shell: bash
      run: |
        RESULT="success"
        echo "result=$RESULT" >> $GITHUB_OUTPUT

    # 複数値の出力
    - id: analyze
      shell: bash
      run: |
        echo "status=completed" >> $GITHUB_OUTPUT
        echo "duration=42" >> $GITHUB_OUTPUT
        echo "errors=0" >> $GITHUB_OUTPUT

    # 複雑な値の出力（JSON）
    - id: report
      shell: bash
      run: |
        REPORT=$(jq -n \
          --arg status "success" \
          --arg time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
          '{status: $status, timestamp: $time}')
        echo "report=$REPORT" >> $GITHUB_OUTPUT
```

---

## runs.steps 構文

### ステップの種類

#### 1. アクションの使用

```yaml
steps:
  - name: "Use action"
    uses: actions/checkout@v4
    with:
      repository: owner/repo
      token: ${{ inputs.token }}
```

#### 2. スクリプトの実行

```yaml
steps:
  - name: "Run script"
    run: |
      echo "Processing..."
      ./scripts/deploy.sh
    shell: bash
```

#### 3. 混合（アクションとスクリプト）

```yaml
steps:
  - name: "Setup"
    uses: actions/setup-node@v4
    with:
      node-version: ${{ inputs.node-version }}

  - name: "Install"
    run: pnpm ci
    shell: bash

  - name: "Test"
    run: pnpm test
    shell: bash
```

### ステップのプロパティ

```yaml
steps:
  - name: "Full step example"
    id: step-id # ステップID（outputsで参照）
    if: inputs.condition == 'true' # 条件付き実行
    uses: owner/action@v1 # 使用するアクション
    with: # アクションへの入力
      param: value
    run: echo "script" # 実行するスクリプト
    shell: bash # シェル（run使用時は必須）
    working-directory: ./subdir # 作業ディレクトリ
    env: # 環境変数
      KEY: value
    continue-on-error: true # エラーでも続行
```

### shell オプション

```yaml
steps:
  # bash (Linux/macOS)
  - run: echo "bash"
    shell: bash

  # pwsh (PowerShell Core - クロスプラットフォーム)
  - run: Write-Host "PowerShell"
    shell: pwsh

  # python
  - run: print("Python")
    shell: python

  # カスタムシェル
  - run: |
      set -e  # エラー時に停止
      command1
      command2
    shell: bash
```

---

## 条件式と制御

### if 条件

```yaml
steps:
  # 入力による条件
  - name: "Production only"
    if: inputs.environment == 'prod'
    run: ./prod-script.sh
    shell: bash

  # 複数条件
  - name: "Conditional step"
    if: inputs.enabled == 'true' && runner.os == 'Linux'
    run: ./linux-script.sh
    shell: bash

  # 失敗時の実行
  - name: "Cleanup on failure"
    if: failure()
    run: ./cleanup.sh
    shell: bash

  # 常に実行
  - name: "Always run"
    if: always()
    run: ./report.sh
    shell: bash
```

### continue-on-error

```yaml
steps:
  # エラーを無視して続行
  - name: "Optional step"
    continue-on-error: true
    run: ./optional-check.sh
    shell: bash

  # 条件付きエラー無視
  - name: "Ignore errors on dev"
    continue-on-error: ${{ inputs.environment == 'dev' }}
    run: ./strict-check.sh
    shell: bash
```

---

## 環境変数の管理

### 環境変数の設定

```yaml
steps:
  # ステップレベルの環境変数
  - name: "With env"
    env:
      NODE_ENV: production
      API_URL: https://api.example.com
    run: pnpm run build
    shell: bash

  # 永続的な環境変数
  - name: "Set global env"
    shell: bash
    run: |
      echo "BUILD_ID=${{ github.run_id }}" >> $GITHUB_ENV
      echo "DEPLOY_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $GITHUB_ENV

  # 後続ステップで使用
  - name: "Use env"
    shell: bash
    run: |
      echo "Build: $BUILD_ID"
      echo "Time: $DEPLOY_TIME"
```

### 入力からの環境変数

```yaml
steps:
  - name: "Setup environment"
    shell: bash
    run: |
      echo "ENV_NAME=${{ inputs.environment }}" >> $GITHUB_ENV
      echo "DEBUG_MODE=${{ inputs.debug }}" >> $GITHUB_ENV
      echo "LOG_LEVEL=${{ inputs.log-level }}" >> $GITHUB_ENV
```

---

## エラーハンドリング

### エラー検出とレポート

```yaml
steps:
  - name: "Safe execution"
    shell: bash
    run: |
      set -e  # エラー時に停止

      if ! ./validate.sh; then
        echo "::error::Validation failed"
        exit 1
      fi

      if ! ./deploy.sh; then
        echo "::error::Deployment failed"
        exit 1
      fi

      echo "::notice::Deployment successful"
```

### 警告とエラーメッセージ

```yaml
steps:
  - name: "With annotations"
    shell: bash
    run: |
      # 情報メッセージ
      echo "::notice::Starting deployment"

      # 警告
      if [ "${{ inputs.skip-tests }}" = "true" ]; then
        echo "::warning::Tests are skipped"
      fi

      # エラー（実行は続行）
      if [ ! -f "config.yml" ]; then
        echo "::error file=config.yml::Config file not found"
      fi

      # 致命的エラー（停止）
      if [ -z "$REQUIRED_VAR" ]; then
        echo "::error::REQUIRED_VAR is not set"
        exit 1
      fi
```

### トライ・キャッチパターン

```yaml
steps:
  - name: "Try-catch pattern"
    id: execute
    shell: bash
    run: |
      set +e  # エラーでも続行

      ./risky-command.sh
      EXIT_CODE=$?

      if [ $EXIT_CODE -ne 0 ]; then
        echo "::warning::Command failed with code $EXIT_CODE"
        echo "success=false" >> $GITHUB_OUTPUT
      else
        echo "success=true" >> $GITHUB_OUTPUT
      fi

      set -e  # エラー検出を再有効化
```

---

## 高度なパターン

### マルチOS対応

```yaml
steps:
  - name: "Cross-platform setup"
    shell: bash
    run: |
      if [ "$RUNNER_OS" = "Windows" ]; then
        echo "Windows setup"
        # Windows固有の処理
      elif [ "$RUNNER_OS" = "macOS" ]; then
        echo "macOS setup"
        # macOS固有の処理
      else
        echo "Linux setup"
        # Linux固有の処理
      fi
```

### ファイルパスの動的生成

```yaml
steps:
  - name: "Dynamic paths"
    shell: bash
    run: |
      # ワークスペースからの相対パス
      CONFIG_PATH="${GITHUB_WORKSPACE}/config/${{ inputs.environment }}.yml"

      # アクションディレクトリからの相対パス
      SCRIPT_PATH="${{ github.action_path }}/scripts/deploy.sh"

      echo "config-path=$CONFIG_PATH" >> $GITHUB_OUTPUT
      echo "script-path=$SCRIPT_PATH" >> $GITHUB_OUTPUT
```

### 条件付きステップの連鎖

```yaml
steps:
  - name: "Check prerequisites"
    id: check
    shell: bash
    run: |
      if [ -f "package.json" ]; then
        echo "has-package-json=true" >> $GITHUB_OUTPUT
      else
        echo "has-package-json=false" >> $GITHUB_OUTPUT
      fi

  - name: "Install dependencies"
    if: steps.check.outputs.has-package-json == 'true'
    run: pnpm ci
    shell: bash

  - name: "Build"
    if: steps.check.outputs.has-package-json == 'true'
    run: pnpm run build
    shell: bash
```

---

## 制限と注意点

### Composite Actionsでできないこと

1. **ジョブレベルの制御**
   - `strategy.matrix` の使用不可
   - `needs` による依存関係の定義不可
   - `container` の指定不可

2. **シークレットへの直接アクセス**
   - `secrets` コンテキストにアクセス不可
   - ワークフローから環境変数として渡す必要あり

3. **サービスコンテナ**
   - `services` の定義不可
   - ワークフローレベルで定義する必要あり

### ベストプラクティス

1. **shell を必ず指定**

   ```yaml
   # ❌ エラー
   - run: echo "test"

   # ✅ 正しい
   - run: echo "test"
     shell: bash
   ```

2. **id を使ってステップを識別**

   ```yaml
   - id: build
     run: pnpm run build
     shell: bash
   ```

3. **エラーハンドリングを実装**

   ```yaml
   - run: |
       set -e
       command || { echo "Failed"; exit 1; }
     shell: bash
   ```

4. **入力の検証**
   ```yaml
   - run: |
       if [ -z "${{ inputs.required-input }}" ]; then
         echo "::error::required-input is not set"
         exit 1
       fi
     shell: bash
   ```
