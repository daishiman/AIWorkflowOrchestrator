# コンテキストオブジェクト

## 概要

GitHub Actionsのコンテキストオブジェクトは、ワークフロー実行時に利用可能な情報を提供します。
各コンテキストは特定の情報ドメインを担当し、ワークフローの動的な制御を可能にします。

## 主要コンテキスト一覧

| コンテキスト | スコープ | 用途 |
|-------------|---------|------|
| `github` | すべて | イベント情報、リポジトリ、アクター |
| `env` | すべて | 環境変数 |
| `vars` | すべて | 設定変数（Configuration variables） |
| `job` | ジョブ、ステップ | ジョブ実行情報 |
| `jobs` | 再利用可能ワークフロー | 呼び出し元ジョブ情報 |
| `steps` | ステップ | ステップ出力、結果 |
| `runner` | すべて | ランナー環境情報 |
| `secrets` | すべて | シークレット |
| `strategy` | すべて | マトリクス戦略情報 |
| `matrix` | すべて | 現在のマトリクス値 |
| `needs` | すべて | 依存ジョブの出力 |
| `inputs` | workflow_dispatch/call | ワークフロー入力 |

## github コンテキスト

ワークフローをトリガーしたイベントに関する情報を提供します。

### 主要プロパティ

#### イベント情報

```yaml
github.event_name          # イベントタイプ（push, pull_request, etc.）
github.event               # イベントペイロード全体（オブジェクト）
github.event_path          # イベントペイロードのファイルパス
```

#### リポジトリ情報

```yaml
github.repository          # owner/repo形式（例: octocat/Hello-World）
github.repository_owner    # リポジトリオーナー（例: octocat）
github.repository_id       # リポジトリID
github.repository_owner_id # オーナーID
```

#### ブランチ・タグ・コミット情報

```yaml
github.ref                 # 完全なgit ref（例: refs/heads/main, refs/tags/v1.0）
github.ref_name            # ブランチ名またはタグ名（例: main, v1.0）
github.ref_type            # refのタイプ（branch, tag）
github.sha                 # トリガーとなったコミットSHA
github.head_ref            # PRのheadブランチ（PRイベント時のみ）
github.base_ref            # PRのbaseブランチ（PRイベント時のみ）
```

#### アクター情報

```yaml
github.actor               # ワークフローをトリガーしたユーザー
github.actor_id            # アクターのユーザーID
github.triggering_actor    # ワークフロー実行を開始したユーザー
```

#### ワークフロー実行情報

```yaml
github.run_id              # ワークフロー実行の一意なID
github.run_number          # このワークフローの実行回数（1から開始）
github.run_attempt         # 再実行回数（1から開始）
github.workflow            # ワークフロー名
github.workflow_ref        # ワークフローファイルのref
github.workflow_sha        # ワークフローファイルのSHA
github.job                 # 現在のジョブID
github.action              # 実行中のアクションのID
github.action_path         # アクションのパス
github.action_ref          # アクションのref
```

#### API・サーバー情報

```yaml
github.api_url             # GitHub API URL（デフォルト: https://api.github.com）
github.server_url          # GitHub server URL（デフォルト: https://github.com）
github.graphql_url         # GitHub GraphQL API URL
```

#### その他

```yaml
github.workspace           # ランナー上のワークスペースパス
github.retention_days      # アーティファクト保持日数
github.token               # 自動生成されるGITHUB_TOKENへの参照
```

### 使用例

```yaml
# ブランチ判定
- if: github.ref == 'refs/heads/main'
  run: echo "Main branch"

- if: github.ref_name == 'develop'
  run: echo "Develop branch"

# タグ判定
- if: github.ref_type == 'tag'
  run: echo "Tag: ${{ github.ref_name }}"

# イベントタイプ判定
- if: github.event_name == 'pull_request'
  run: echo "Pull request event"

# PRの情報
- if: github.event_name == 'pull_request'
  run: |
    echo "PR from ${{ github.head_ref }} to ${{ github.base_ref }}"
    echo "PR number: ${{ github.event.pull_request.number }}"

# コミットメッセージの確認
- if: contains(github.event.head_commit.message, '[skip ci]')
  run: echo "Skipping CI"

# アクター情報
- run: echo "Triggered by ${{ github.actor }}"

# イメージタグ生成
- name: Build Docker image
  run: |
    docker build -t ${{ github.repository }}:${{ github.sha }} .
    docker tag ${{ github.repository }}:${{ github.sha }} \
               ${{ github.repository }}:${{ github.ref_name }}
```

## env コンテキスト

環境変数を参照します。ワークフロー、ジョブ、ステップレベルで定義された環境変数にアクセスできます。

### 特性

- `env:`で設定された環境変数を参照
- デフォルトの`GITHUB_*`環境変数も含む
- スコープに応じた優先順位（ステップ > ジョブ > ワークフロー）

### 使用例

```yaml
env:
  NODE_VERSION: '18'
  DEPLOY_ENV: 'production'

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      BUILD_TYPE: 'release'
    steps:
      - if: env.DEPLOY_ENV == 'production'
        run: echo "Production deployment"

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - env:
          STEP_VAR: 'local'
        run: |
          echo "Node: ${{ env.NODE_VERSION }}"
          echo "Build: ${{ env.BUILD_TYPE }}"
          echo "Step: ${{ env.STEP_VAR }}"
```

### GITHUB_* 環境変数

```yaml
# 自動設定される環境変数も参照可能
- run: |
    echo "Workspace: ${{ env.GITHUB_WORKSPACE }}"
    echo "Actor: ${{ env.GITHUB_ACTOR }}"
    echo "Repository: ${{ env.GITHUB_REPOSITORY }}"
```

## vars コンテキスト

リポジトリまたは組織レベルで設定された設定変数（Configuration variables）を参照します。

### 特性

- Settings > Secrets and variables > Actions > Variables で設定
- 機密情報でない設定値に使用（機密情報は`secrets`を使用）
- 再利用可能な設定値の一元管理

### 使用例

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Use configuration variable
        run: |
          echo "API Endpoint: ${{ vars.API_ENDPOINT }}"
          echo "Environment: ${{ vars.DEPLOY_ENVIRONMENT }}"

      - if: vars.ENABLE_CACHE == 'true'
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## job コンテキスト

現在のジョブに関する情報を提供します。

### 主要プロパティ

```yaml
job.status                 # ジョブステータス（success, failure, cancelled）
job.container.id           # コンテナID
job.container.network      # コンテナネットワークID
job.services               # サービスコンテナ情報
```

### 使用例

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    container: node:18
    steps:
      - name: Check job status
        if: job.status == 'success'
        run: echo "Job succeeded"

      - name: Container info
        run: echo "Container ID: ${{ job.container.id }}"
```

## steps コンテキスト

前のステップの出力と実行結果を参照します。

### 主要プロパティ

```yaml
steps.<step_id>.outputs.<output_name>    # ステップ出力
steps.<step_id>.conclusion               # ステップ結論（success, failure, skipped）
steps.<step_id>.outcome                  # ステップ結果（continueに関係なく）
```

### 使用例

```yaml
steps:
  - id: version
    run: |
      VERSION=$(cat VERSION)
      echo "VERSION=$VERSION" >> $GITHUB_OUTPUT

  - id: build
    run: npm run build

  - name: Use version
    if: success()
    run: echo "Version: ${{ steps.version.outputs.VERSION }}"

  - name: Check build result
    if: steps.build.conclusion == 'success'
    run: echo "Build succeeded"

  - name: Conditional on multiple steps
    if: |
      steps.version.conclusion == 'success' &&
      steps.build.conclusion == 'success'
    run: echo "Both steps succeeded"
```

## runner コンテキスト

ワークフローを実行しているランナーに関する情報を提供します。

### 主要プロパティ

```yaml
runner.name                # ランナー名
runner.os                  # OS（Linux, Windows, macOS）
runner.arch                # アーキテクチャ（X86, X64, ARM, ARM64）
runner.temp                # 一時ディレクトリパス
runner.tool_cache          # ツールキャッシュディレクトリパス
runner.debug               # デバッグモード有効化フラグ
runner.environment         # ランナー環境（github-hosted, self-hosted）
```

### 使用例

```yaml
steps:
  - name: OS-specific command
    if: runner.os == 'Linux'
    run: apt-get update

  - name: Windows command
    if: runner.os == 'Windows'
    run: choco install nodejs

  - name: Architecture check
    if: runner.arch == 'ARM64'
    run: echo "ARM64 architecture"

  - name: Use temp directory
    run: echo "Temp: ${{ runner.temp }}"

  - name: Debug mode check
    if: runner.debug == '1'
    run: echo "Debug mode enabled"
```

## secrets コンテキスト

リポジトリ、環境、組織のシークレットにアクセスします。

### 特性

- Settings > Secrets and variables > Actions > Secrets で設定
- 値はマスクされログに表示されない
- 式内で直接使用可能

### 使用例

```yaml
steps:
  - name: Use secret
    env:
      API_KEY: ${{ secrets.API_KEY }}
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
    run: |
      echo "::add-mask::$API_KEY"
      curl -H "Authorization: Bearer $API_KEY" https://api.example.com

  - name: Conditional deployment
    if: secrets.DEPLOY_KEY != null
    run: echo "Deploy key available"

  - name: Docker login
    uses: docker/login-action@v3
    with:
      username: ${{ secrets.DOCKER_USERNAME }}
      password: ${{ secrets.DOCKER_PASSWORD }}
```

## needs コンテキスト

依存するジョブの出力と結果にアクセスします。

### 主要プロパティ

```yaml
needs.<job_id>.outputs.<output_name>    # ジョブ出力
needs.<job_id>.result                   # ジョブ結果（success, failure, cancelled, skipped）
```

### 使用例

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.VERSION }}
      artifact-name: ${{ steps.artifact.outputs.NAME }}
    steps:
      - id: version
        run: echo "VERSION=1.0.0" >> $GITHUB_OUTPUT
      - id: artifact
        run: echo "NAME=myapp-${{ github.sha }}" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: needs.build.result == 'success'
    steps:
      - name: Deploy version
        run: |
          echo "Deploying version: ${{ needs.build.outputs.version }}"
          echo "Artifact: ${{ needs.build.outputs.artifact-name }}"

  cleanup:
    needs: [build, deploy]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Cleanup based on results
        run: |
          if [ "${{ needs.build.result }}" == "failure" ]; then
            echo "Build failed, cleaning up"
          fi
          if [ "${{ needs.deploy.result }}" == "success" ]; then
            echo "Deploy succeeded"
          fi
```

## matrix コンテキスト

マトリクス戦略の現在の値にアクセスします。

### 使用例

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node: 20
            extra: true
    runs-on: ${{ matrix.os }}
    steps:
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - name: OS-specific setup
        if: matrix.os == 'ubuntu-latest'
        run: sudo apt-get update

      - name: Extra test
        if: matrix.extra == true
        run: npm run extra-test

      - name: Display matrix values
        run: |
          echo "OS: ${{ matrix.os }}"
          echo "Node: ${{ matrix.node }}"
```

## inputs コンテキスト

`workflow_dispatch`または`workflow_call`で定義された入力値にアクセスします。

### workflow_dispatch の例

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      dry-run:
        description: 'Perform dry run'
        required: false
        type: boolean
        default: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        if: inputs.dry-run == false
        run: |
          echo "Deploying to ${{ inputs.environment }}"

      - name: Dry run
        if: inputs.dry-run == true
        run: echo "Dry run for ${{ inputs.environment }}"
```

### workflow_call の例

```yaml
# reusable-workflow.yml
on:
  workflow_call:
    inputs:
      version:
        required: true
        type: string
      tag:
        required: false
        type: string
        default: 'latest'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Build
        run: |
          echo "Building version ${{ inputs.version }}"
          echo "Tag: ${{ inputs.tag }}"

# caller-workflow.yml
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable-workflow.yml
    with:
      version: '1.0.0'
      tag: 'stable'
```

## strategy コンテキスト

マトリクス戦略の設定情報にアクセスします。

### 主要プロパティ

```yaml
strategy.fail-fast         # fail-fast設定
strategy.job-index         # マトリクス内のジョブインデックス
strategy.job-total         # マトリクスの総ジョブ数
strategy.max-parallel      # 最大並列数
```

### 使用例

```yaml
jobs:
  test:
    strategy:
      matrix:
        version: [1, 2, 3]
      fail-fast: false
      max-parallel: 2
    runs-on: ubuntu-latest
    steps:
      - name: Display strategy info
        run: |
          echo "Job ${{ strategy.job-index }} of ${{ strategy.job-total }}"
          echo "Fail fast: ${{ strategy.fail-fast }}"
          echo "Max parallel: ${{ strategy.max-parallel }}"
```

## 参考資料

- GitHub公式ドキュメント: [Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)
- GitHub公式ドキュメント: [Environment variables](https://docs.github.com/en/actions/learn-github-actions/variables)
