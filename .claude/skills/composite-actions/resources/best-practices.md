# Composite Actions ベストプラクティス

## 設計原則

### 単一責任の原則

**各アクションは1つの明確な責務を持つべき**

```yaml
# ✅ 良い例: 単一責務
name: 'Setup Node with Cache'
description: 'Node.jsのセットアップとキャッシュの設定'

# ❌ 悪い例: 複数責務
name: 'Setup Everything'
description: 'Node.js、Docker、AWS CLI、データベースをセットアップ'
```

### 入力の設計

**必須入力は最小限に、デフォルト値を提供**

```yaml
# ✅ 良い例
inputs:
  node-version:
    description: 'Node.jsバージョン'
    required: false
    default: '18'        # 合理的なデフォルト

  cache-enabled:
    description: 'キャッシュを有効化'
    required: false
    default: 'true'      # 一般的に有効

# ❌ 悪い例
inputs:
  node-version:
    required: true       # 常に指定を強制
  cache-enabled:
    required: true       # デフォルトなし
```

### 出力の設計

**有用な情報を出力として提供**

```yaml
# ✅ 良い例: 有用な出力
outputs:
  cache-hit:
    description: 'キャッシュがヒットしたか'
    value: ${{ steps.cache.outputs.cache-hit }}

  node-version:
    description: 'インストールされたNode.jsバージョン'
    value: ${{ steps.setup.outputs.node-version }}

  install-duration:
    description: 'インストール時間（秒）'
    value: ${{ steps.measure.outputs.duration }}

# ❌ 悪い例: 出力なし
outputs: {}
```

---

## コードの品質

### エラーハンドリング

**すべてのステップで適切なエラーハンドリングを実装**

```yaml
# ✅ 良い例
steps:
  - name: Validate inputs
    shell: bash
    run: |
      set -e  # エラー時に停止

      if [ -z "${{ inputs.api-url }}" ]; then
        echo "::error::api-url is required"
        exit 1
      fi

      if ! curl -f "${{ inputs.api-url }}/health" > /dev/null 2>&1; then
        echo "::error::API is not reachable at ${{ inputs.api-url }}"
        exit 1
      fi

  - name: Deploy
    shell: bash
    run: |
      set -e

      if ! ./deploy.sh; then
        echo "::error::Deployment failed"
        exit 1
      fi

      echo "::notice::Deployment successful"

# ❌ 悪い例
steps:
  - run: ./deploy.sh  # エラーチェックなし
    shell: bash
```

### ログとデバッグ

**明確で有用なログメッセージを提供**

```yaml
# ✅ 良い例
steps:
  - name: Deploy
    shell: bash
    run: |
      echo "::group::Deployment Configuration"
      echo "Environment: ${{ inputs.environment }}"
      echo "Version: ${{ inputs.version }}"
      echo "Dry Run: ${{ inputs.dry-run }}"
      echo "::endgroup::"

      echo "Starting deployment..."

      if [ "${{ inputs.dry-run }}" = "true" ]; then
        echo "::notice::Running in DRY RUN mode"
        ./deploy.sh --dry-run
      else
        ./deploy.sh
      fi

      echo "::notice::Deployment completed successfully"

# ❌ 悪い例
steps:
  - run: ./deploy.sh  # ログなし
    shell: bash
```

### スクリプトの整理

**複雑なロジックは外部スクリプトに分離**

```yaml
# ✅ 良い例
steps:
  - name: Run deployment
    shell: bash
    run: |
      # 簡潔な呼び出し
      "${{ github.action_path }}/scripts/deploy.sh" \
        --env "${{ inputs.environment }}" \
        --version "${{ inputs.version }}"

# scripts/deploy.sh に複雑なロジックを配置

# ❌ 悪い例: action.yml内に200行のスクリプト
steps:
  - name: Deploy
    shell: bash
    run: |
      # 200行の複雑なスクリプト...
      if [ ... ]; then
        # さらに複雑なロジック...
      fi
```

---

## パフォーマンス最適化

### キャッシュの活用

**依存関係のキャッシュで実行時間を短縮**

```yaml
# ✅ 良い例
steps:
  - name: Setup Node with cache
    uses: actions/setup-node@v4
    with:
      node-version: ${{ inputs.node-version }}
      cache: 'pnpm'  # npmキャッシュを有効化

  - name: Cache dependencies
    id: cache
    uses: actions/cache@v4
    with:
      path: |
        node_modules
        .pnpm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-

  - name: Install
    if: steps.cache.outputs.cache-hit != 'true'
    run: pnpm ci
    shell: bash
```

### 条件付き実行

**不要なステップをスキップ**

```yaml
# ✅ 良い例
steps:
  - name: Check if build needed
    id: check
    shell: bash
    run: |
      if [ -f "dist/bundle.js" ] && [ "dist/bundle.js" -nt "src/index.js" ]; then
        echo "build-needed=false" >> $GITHUB_OUTPUT
      else
        echo "build-needed=true" >> $GITHUB_OUTPUT
      fi

  - name: Build
    if: steps.check.outputs.build-needed == 'true'
    run: pnpm run build
    shell: bash

  - name: Use cached build
    if: steps.check.outputs.build-needed == 'false'
    run: echo "::notice::Using cached build"
    shell: bash
```

### 並列実行の検討

**独立したステップは並列化できないため、ワークフローレベルで並列化**

```yaml
# Composite Actionでは並列化不可
# 代わりにワークフローで複数ジョブに分割

# workflow.yml
jobs:
  test-unit:
    steps:
      - uses: ./.github/actions/test
        with:
          type: unit

  test-integration:
    steps:
      - uses: ./.github/actions/test
        with:
          type: integration
```

---

## セキュリティ

### シークレットの扱い

**シークレットはワークフローから環境変数として渡す**

```yaml
# ワークフロー (workflow.yml)
jobs:
  deploy:
    steps:
      - uses: ./.github/actions/deploy
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
          AWS_ACCESS_KEY: ${{ secrets.AWS_ACCESS_KEY }}

# Composite Action (action.yml)
runs:
  using: 'composite'
  steps:
    - name: Validate secrets
      shell: bash
      run: |
        if [ -z "$API_TOKEN" ]; then
          echo "::error::API_TOKEN is required"
          exit 1
        fi

    - name: Deploy
      shell: bash
      env:
        API_TOKEN: ${{ env.API_TOKEN }}  # 環境変数から取得
      run: |
        curl -H "Authorization: Bearer $API_TOKEN" ...
```

### 入力の検証

**すべての入力を検証してインジェクション攻撃を防ぐ**

```yaml
# ✅ 良い例
steps:
  - name: Validate inputs
    shell: bash
    run: |
      set -e

      # 環境名の検証
      VALID_ENVS="dev staging prod"
      if ! echo "$VALID_ENVS" | grep -w "${{ inputs.environment }}" > /dev/null; then
        echo "::error::Invalid environment: ${{ inputs.environment }}"
        echo "::error::Must be one of: $VALID_ENVS"
        exit 1
      fi

      # バージョン形式の検証
      if ! echo "${{ inputs.version }}" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' > /dev/null; then
        echo "::error::Invalid version format: ${{ inputs.version }}"
        echo "::error::Must match semver format (e.g., 1.2.3)"
        exit 1
      fi

# ❌ 悪い例
steps:
  - run: ./deploy.sh ${{ inputs.environment }}  # 検証なし
    shell: bash
```

### コマンドインジェクションの防止

**変数を適切にクォートして使用**

```yaml
# ✅ 良い例
steps:
  - shell: bash
    run: |
      MESSAGE="${{ inputs.message }}"  # 変数に代入
      echo "Message: $MESSAGE"         # 安全に使用

      # または
      echo "Message: ${{ inputs.message }}" | cat  # パイプで安全に

# ❌ 悪い例
steps:
  - run: echo ${{ inputs.message }}  # インジェクションの可能性
    shell: bash
```

---

## バージョニングと公開

### セマンティックバージョニング

**セマンティックバージョニングに従う**

- **MAJOR** (1.x.x): 破壊的変更
- **MINOR** (x.1.x): 後方互換な機能追加
- **PATCH** (x.x.1): 後方互換なバグ修正

```yaml
# action.yml
name: 'My Action'
# バージョンはGitタグで管理

# タグの例
# v1.0.0 - 初回リリース
# v1.1.0 - 新機能追加（後方互換）
# v1.1.1 - バグ修正
# v2.0.0 - 破壊的変更
```

### メジャーバージョンタグの更新

**メジャーバージョンタグを常に最新に保つ**

```bash
# リリースワークフロー
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3

# メジャーバージョンタグを更新
git tag -fa v1 -m "Update v1 to v1.2.3"
git push origin v1 --force
```

### 変更ログの維持

**CHANGELOG.md で変更を追跡**

```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- キャッシュ戦略の改善
- タイムアウト設定のサポート

### Changed
- デフォルトNode.jsバージョンを18に変更

### Fixed
- Windows環境でのパス処理の問題を修正

### Deprecated
- `old-input` パラメータ（v2.0.0で削除予定）

## [1.1.0] - 2023-12-01
...
```

---

## テストとデバッグ

### ローカルテスト

**ローカルワークフローでアクションをテスト**

```yaml
# .github/workflows/test-action.yml
name: Test Action

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # ローカルアクションをテスト
      - name: Test action
        id: test
        uses: ./  # リポジトリルートのaction.yml
        with:
          node-version: '18'
          cache-enabled: 'true'

      # 出力を検証
      - name: Verify outputs
        shell: bash
        run: |
          echo "Cache hit: ${{ steps.test.outputs.cache-hit }}"

          if [ -z "${{ steps.test.outputs.cache-hit }}" ]; then
            echo "::error::cache-hit output is missing"
            exit 1
          fi
```

### デバッグモード

**詳細なログでデバッグ**

```yaml
steps:
  - name: Debug information
    if: runner.debug == '1'  # ACTIONS_STEP_DEBUG=trueで有効化
    shell: bash
    run: |
      echo "::group::Debug Information"
      echo "Inputs:"
      echo "  node-version: ${{ inputs.node-version }}"
      echo "  cache-enabled: ${{ inputs.cache-enabled }}"
      echo ""
      echo "Environment:"
      echo "  RUNNER_OS: ${{ runner.os }}"
      echo "  RUNNER_ARCH: ${{ runner.arch }}"
      echo "  GITHUB_WORKSPACE: ${{ github.workspace }}"
      echo "::endgroup::"
```

### 単体テストパターン

**個別のステップをテスト可能に**

```yaml
# action.yml
runs:
  using: 'composite'
  steps:
    - name: Validate
      id: validate
      shell: bash
      run: ${{ github.action_path }}/scripts/validate.sh

    - name: Process
      id: process
      shell: bash
      run: ${{ github.action_path }}/scripts/process.sh

# scripts/validate.sh をユニットテストで検証可能
# scripts/process.sh をユニットテストで検証可能
```

---

## ドキュメンテーション

### README.md

**包括的なドキュメントを提供**

```markdown
# Setup Node with Cache

Node.jsのセットアップとnpmキャッシュの設定を行うComposite Action

## Usage

```yaml
- uses: owner/setup-node-cache@v1
  with:
    node-version: '18'
    cache-enabled: 'true'
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `node-version` | Node.jsバージョン | No | `18` |
| `cache-enabled` | キャッシュを有効化 | No | `true` |

## Outputs

| Name | Description |
|------|-------------|
| `cache-hit` | キャッシュがヒットしたか |
| `node-version` | インストールされたバージョン |

## Examples

### 基本的な使用

```yaml
- uses: owner/setup-node-cache@v1
```

### カスタマイズ

```yaml
- uses: owner/setup-node-cache@v1
  with:
    node-version: '20'
    cache-enabled: 'false'
```

## License

MIT
```

### インラインドキュメント

**action.yml内に詳細な説明を記述**

```yaml
name: 'Setup Node with Cache'
description: |
  Node.jsのセットアップとnpmキャッシュの設定を行います。

  このアクションは以下を実行します:
  1. 指定されたバージョンのNode.jsをセットアップ
  2. npmキャッシュを有効化（オプション）
  3. セットアップ情報を出力

inputs:
  node-version:
    description: |
      Node.jsのバージョン。
      セマンティックバージョニング形式（例: '18', '18.x', '18.12.0'）
    required: false
    default: '18'

  cache-enabled:
    description: |
      npmキャッシュを有効化するかどうか。
      'true'でキャッシュを有効化、'false'で無効化。
    required: false
    default: 'true'
```

---

## 組織全体のパターン

### 命名規則

**一貫した命名規則を使用**

```
.github/actions/
├── setup-node-cache/      # setup-* : 環境セットアップ
├── build-docker-image/    # build-* : ビルド処理
├── deploy-to-aws/         # deploy-* : デプロイ
├── notify-slack/          # notify-* : 通知
└── validate-pr/           # validate-* : 検証
```

### 共通パターンライブラリ

**組織共通のアクションを作成**

```yaml
# 組織リポジトリ: company/github-actions

.github/actions/
├── setup-environments/     # 共通環境セットアップ
├── security-scan/          # セキュリティスキャン
├── deploy-kubernetes/      # K8sデプロイ
└── post-metrics/           # メトリクス送信

# 使用例
- uses: company/github-actions/.github/actions/setup-environments@v1
  with:
    environment: production
```

### バージョン管理戦略

**メジャーバージョンの使用を推奨**

```yaml
# ✅ 推奨: メジャーバージョン（自動更新）
- uses: owner/action@v1

# ⚠️ 注意: 完全バージョン（手動更新が必要）
- uses: owner/action@v1.2.3

# ❌ 非推奨: ブランチ（不安定）
- uses: owner/action@main
```

---

## トラブルシューティング

### よくある問題と解決策

#### 問題: shell プロパティが見つからない

```
Error: Required property is missing: shell
```

**解決策**:
```yaml
# ❌ エラー
- run: echo "test"

# ✅ 修正
- run: echo "test"
  shell: bash
```

#### 問題: outputs が空

**解決策**:
```yaml
# ステップIDと出力を正しく設定
- id: my-step
  run: echo "result=value" >> $GITHUB_OUTPUT
  shell: bash

outputs:
  result:
    value: ${{ steps.my-step.outputs.result }}
```

#### 問題: 環境変数が後続ステップで使えない

**解決策**:
```yaml
# $GITHUB_ENV を使用
- run: echo "MY_VAR=value" >> $GITHUB_ENV
  shell: bash

# 後続ステップで使用可能
- run: echo "$MY_VAR"
  shell: bash
```

#### 問題: パスが見つからない

**解決策**:
```yaml
# 絶対パスを使用
- run: |
    SCRIPT="${{ github.action_path }}/scripts/deploy.sh"
    "$SCRIPT"
  shell: bash
```
