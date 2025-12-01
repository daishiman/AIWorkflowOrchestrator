# GitHub Actions Workflow Syntax Complete Reference

このドキュメントは、GitHub Actions ワークフロー構文の完全なリファレンスです。

## 目次

1. [トップレベル構文](#トップレベル構文)
2. [イベントトリガー詳細](#イベントトリガー詳細)
3. [ジョブ構文詳細](#ジョブ構文詳細)
4. [ステップ構文詳細](#ステップ構文詳細)
5. [式と演算子](#式と演算子)
6. [コンテキスト変数](#コンテキスト変数)
7. [フィルターパターン](#フィルターパターン)

---

## トップレベル構文

### name

ワークフローの名前を定義します。

```yaml
name: CI Workflow
```

- **型**: 文字列
- **必須**: いいえ
- **デフォルト**: ファイル名

### on

ワークフローのトリガーイベントを定義します。

```yaml
# 単一イベント
on: push

# 複数イベント
on: [push, pull_request]

# 詳細設定
on:
  push:
    branches: [main]
```

- **型**: 文字列、配列、またはオブジェクト
- **必須**: はい

### permissions

ワークフロー全体のデフォルトパーミッションを設定します。

```yaml
permissions:
  contents: read
  pull-requests: write

# またはすべて無効化
permissions: {}

# またはすべて読み取り専用
permissions: read-all

# またはすべて書き込み可能
permissions: write-all
```

- **型**: オブジェクト
- **必須**: いいえ

### env

ワークフロー全体で使用する環境変数を定義します。

```yaml
env:
  NODE_ENV: production
  API_URL: https://api.example.com
```

- **型**: オブジェクト
- **必須**: いいえ

### defaults

ワークフロー全体のデフォルト設定を定義します。

```yaml
defaults:
  run:
    shell: bash
    working-directory: ./src
```

- **型**: オブジェクト
- **必須**: いいえ

### concurrency

同時実行制御を定義します。

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- **型**: オブジェクト
- **必須**: いいえ

### jobs

実行するジョブを定義します。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello"
```

- **型**: オブジェクト
- **必須**: はい

---

## イベントトリガー詳細

### push

プッシュイベントでトリガーします。

```yaml
on:
  push:
    branches:
      - main
      - 'releases/**'
      - '!experimental'
    tags:
      - v*.*.*
    paths:
      - 'src/**'
      - '!src/docs/**'
    paths-ignore:
      - '**.md'
```

**フィルター**:
- `branches`: ブランチフィルター
- `branches-ignore`: 除外ブランチフィルター
- `tags`: タグフィルター
- `tags-ignore`: 除外タグフィルター
- `paths`: パスフィルター
- `paths-ignore`: 除外パスフィルター

### pull_request

PRイベントでトリガーします。

```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened
      - closed
    branches:
      - main
    paths:
      - 'src/**'
```

**types**:
- `assigned`, `unassigned`
- `labeled`, `unlabeled`
- `opened`, `edited`, `closed`, `reopened`
- `synchronize` (新しいコミットがプッシュされた)
- `converted_to_draft`
- `ready_for_review`
- `locked`, `unlocked`
- `review_requested`, `review_request_removed`

### workflow_dispatch

手動トリガーを有効にします。

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: false
        type: string
      enable-debug:
        description: 'Enable debug mode'
        required: false
        type: boolean
        default: false
```

**input types**:
- `string`: 文字列入力
- `choice`: 選択肢
- `boolean`: チェックボックス
- `environment`: 環境選択

### schedule

cronスケジュールでトリガーします。

```yaml
on:
  schedule:
    # 毎日 UTC 0:00
    - cron: '0 0 * * *'
    # 毎週月曜日 9:00
    - cron: '0 9 * * MON'
    # 毎月1日 0:00
    - cron: '0 0 1 * *'
```

**cron構文**:
```
┌───────────── 分 (0 - 59)
│ ┌───────────── 時 (0 - 23)
│ │ ┌───────────── 日 (1 - 31)
│ │ │ ┌───────────── 月 (1 - 12 または JAN-DEC)
│ │ │ │ ┌───────────── 曜日 (0 - 6 または SUN-SAT)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### workflow_call

再利用可能ワークフローとして呼び出し可能にします。

```yaml
on:
  workflow_call:
    inputs:
      config-path:
        required: true
        type: string
      static-analysis:
        required: false
        type: boolean
        default: false
    secrets:
      deploy-token:
        required: true
      api-key:
        required: false
    outputs:
      build-version:
        description: "Built version"
        value: ${{ jobs.build.outputs.version }}
```

### release

リリースイベントでトリガーします。

```yaml
on:
  release:
    types:
      - published
      - created
      - edited
      - deleted
      - prereleased
      - released
```

### issues

Issueイベントでトリガーします。

```yaml
on:
  issues:
    types:
      - opened
      - edited
      - closed
      - reopened
      - labeled
      - unlabeled
```

### issue_comment

Issueコメントでトリガーします。

```yaml
on:
  issue_comment:
    types:
      - created
      - edited
      - deleted
```

### repository_dispatch

外部APIからのトリガーを受け付けます。

```yaml
on:
  repository_dispatch:
    types:
      - deploy-production
      - rebuild-cache
```

---

## ジョブ構文詳細

### runs-on

ジョブを実行するランナーを指定します。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    # runs-on: ubuntu-22.04
    # runs-on: ubuntu-20.04
    # runs-on: windows-latest
    # runs-on: windows-2022
    # runs-on: windows-2019
    # runs-on: macos-latest
    # runs-on: macos-13
    # runs-on: macos-12

    # セルフホストランナー
    # runs-on: [self-hosted, linux, x64]

    # マトリックスから選択
    # runs-on: ${{ matrix.os }}
```

**GitHub-hostedランナー**:
- `ubuntu-latest` (ubuntu-22.04)
- `ubuntu-22.04`
- `ubuntu-20.04`
- `windows-latest` (windows-2022)
- `windows-2022`
- `windows-2019`
- `macos-latest` (macos-13)
- `macos-13`
- `macos-12`

### needs

ジョブの依存関係を定義します。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

  test:
    needs: build
    runs-on: ubuntu-latest

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
```

### if

ジョブの実行条件を定義します。

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

  conditional:
    if: |
      github.event_name == 'push' &&
      !contains(github.event.head_commit.message, '[skip ci]')
    runs-on: ubuntu-latest
```

### permissions

ジョブのパーミッションを定義します。

```yaml
jobs:
  build:
    permissions:
      contents: read
      packages: write
      pull-requests: write
    runs-on: ubuntu-latest
```

### environment

デプロイ環境を指定します。

```yaml
jobs:
  deploy:
    environment:
      name: production
      url: https://example.com
    runs-on: ubuntu-latest
```

**環境設定**:
- 承認フロー
- シークレット
- 保護ルール
- デプロイメント履歴

### concurrency

ジョブレベルの同時実行制御を定義します。

```yaml
jobs:
  deploy:
    concurrency:
      group: production-deploy
      cancel-in-progress: false
    runs-on: ubuntu-latest
```

### outputs

ジョブの出力を定義します。

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}
      artifact-id: ${{ steps.upload.outputs.artifact-id }}
    steps:
      - id: get-version
        run: echo "version=1.0.0" >> $GITHUB_OUTPUT
```

### strategy

マトリックスビルド戦略を定義します。

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
            experimental: true
        exclude:
          - os: macos-latest
            node: 16
      fail-fast: false
      max-parallel: 3
    runs-on: ${{ matrix.os }}
```

**strategy設定**:
- `matrix`: マトリックス定義
- `fail-fast`: 1つ失敗で全停止 (デフォルト: true)
- `max-parallel`: 最大並列数

### timeout-minutes

ジョブのタイムアウトを設定します。

```yaml
jobs:
  build:
    timeout-minutes: 30
    runs-on: ubuntu-latest
```

- **デフォルト**: 360分 (6時間)
- **最大**: 360分

### continue-on-error

ジョブが失敗しても続行します。

```yaml
jobs:
  experimental:
    continue-on-error: true
    runs-on: ubuntu-latest
```

### container

コンテナ内でジョブを実行します。

```yaml
jobs:
  build:
    container:
      image: node:18
      env:
        NODE_ENV: production
      ports:
        - 3000
      volumes:
        - /data:/data
      options: --cpus 2 --memory 4g
    runs-on: ubuntu-latest
```

### services

サービスコンテナを定義します。

```yaml
jobs:
  test:
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    runs-on: ubuntu-latest
```

---

## ステップ構文詳細

### name

ステップの名前を定義します。

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```

### id

ステップの識別子を定義します。出力参照に使用します。

```yaml
steps:
  - id: build-step
    run: echo "output=value" >> $GITHUB_OUTPUT

  - run: echo ${{ steps.build-step.outputs.output }}
```

### uses

アクションを実行します。

```yaml
steps:
  # パブリックアクション (バージョン指定)
  - uses: actions/checkout@v4

  # パブリックアクション (コミットSHA)
  - uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab

  # パブリックアクション (ブランチ)
  - uses: actions/checkout@main

  # 同じリポジトリのアクション
  - uses: ./.github/actions/my-action

  # Docker Hub
  - uses: docker://node:18

  # Docker Registry
  - uses: docker://ghcr.io/owner/image:tag
```

### with

アクションへの入力を定義します。

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0
      submodules: true
      token: ${{ secrets.GITHUB_TOKEN }}
```

### run

コマンドを実行します。

```yaml
steps:
  # 単一コマンド
  - run: echo "Hello"

  # 複数行
  - run: |
      echo "Building..."
      pnpm install
      pnpm run build

  # 複数コマンド (1行)
  - run: pnpm install && pnpm run build
```

### shell

実行シェルを指定します。

```yaml
steps:
  - run: echo "Hello"
    shell: bash

  - run: Write-Output "Hello"
    shell: pwsh

  - run: print("Hello")
    shell: python
```

**利用可能なシェル**:
- `bash`
- `pwsh` (PowerShell Core)
- `python`
- `sh`
- `cmd` (Windows)
- `powershell` (Windows PowerShell)

### working-directory

作業ディレクトリを指定します。

```yaml
steps:
  - run: pnpm install
    working-directory: ./frontend
```

### env

ステップの環境変数を定義します。

```yaml
steps:
  - run: echo $MY_VAR
    env:
      MY_VAR: value
      API_KEY: ${{ secrets.API_KEY }}
```

### if

ステップの実行条件を定義します。

```yaml
steps:
  - name: Deploy
    if: github.ref == 'refs/heads/main'
    run: make deploy

  - name: On success
    if: success()
    run: echo "Succeeded"

  - name: On failure
    if: failure()
    run: echo "Failed"

  - name: Always
    if: always()
    run: echo "Always runs"
```

### continue-on-error

ステップが失敗しても続行します。

```yaml
steps:
  - name: Might fail
    continue-on-error: true
    run: exit 1

  - name: Still runs
    run: echo "Running"
```

### timeout-minutes

ステップのタイムアウトを設定します。

```yaml
steps:
  - name: Long running task
    timeout-minutes: 10
    run: ./long-task.sh
```

---

## 式と演算子

### 比較演算子

```yaml
# 等価
if: github.ref == 'refs/heads/main'

# 不等価
if: github.actor != 'dependabot[bot]'

# より大きい
if: github.event.pull_request.additions > 100

# より小さい
if: github.event.pull_request.changed_files < 10

# 以上
if: github.run_number >= 100

# 以下
if: github.event.issue.comments <= 5
```

### 論理演算子

```yaml
# AND
if: github.ref == 'refs/heads/main' && github.event_name == 'push'

# OR
if: github.event_name == 'push' || github.event_name == 'pull_request'

# NOT
if: "!cancelled()"
```

### 関数

```yaml
# contains: 文字列含有チェック
if: contains(github.event.head_commit.message, '[skip ci]')

# startsWith: 前方一致
if: startsWith(github.ref, 'refs/tags/')

# endsWith: 後方一致
if: endsWith(github.ref, '/main')

# format: 文字列フォーマット
run: echo ${{ format('Hello {0} {1}', 'world', '!') }}

# join: 配列結合
run: echo ${{ join(github.event.pull_request.labels.*.name, ', ') }}

# toJSON: JSON変換
run: echo ${{ toJSON(github.event) }}

# fromJSON: JSON解析
run: echo ${{ fromJSON('{"key":"value"}').key }}

# hashFiles: ファイルハッシュ
- uses: actions/cache@v4
  with:
    key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

### ステータスチェック関数

```yaml
# success: すべて成功
if: success()

# failure: いずれか失敗
if: failure()

# cancelled: キャンセルされた
if: cancelled()

# always: 常に実行
if: always()
```

---

## コンテキスト変数

### github コンテキスト

```yaml
steps:
  - run: |
      echo "Repository: ${{ github.repository }}"
      echo "Ref: ${{ github.ref }}"
      echo "SHA: ${{ github.sha }}"
      echo "Actor: ${{ github.actor }}"
      echo "Event: ${{ github.event_name }}"
      echo "Workflow: ${{ github.workflow }}"
      echo "Run ID: ${{ github.run_id }}"
      echo "Run Number: ${{ github.run_number }}"
      echo "Job: ${{ github.job }}"
```

**主要プロパティ**:
- `github.repository`: リポジトリ名 (owner/repo)
- `github.ref`: ブランチまたはタグ参照
- `github.sha`: コミットSHA
- `github.actor`: ワークフローをトリガーしたユーザー
- `github.event_name`: イベント名
- `github.workflow`: ワークフロー名
- `github.run_id`: ワークフロー実行ID
- `github.run_number`: 実行番号

### env コンテキスト

```yaml
env:
  MY_VAR: value

steps:
  - run: echo ${{ env.MY_VAR }}
```

### job コンテキスト

```yaml
steps:
  - run: |
      echo "Status: ${{ job.status }}"
      echo "Container: ${{ job.container.id }}"
```

### steps コンテキスト

```yaml
steps:
  - id: step1
    run: echo "output=value" >> $GITHUB_OUTPUT

  - run: echo ${{ steps.step1.outputs.output }}
  - run: echo ${{ steps.step1.outcome }}
  - run: echo ${{ steps.step1.conclusion }}
```

### runner コンテキスト

```yaml
steps:
  - run: |
      echo "OS: ${{ runner.os }}"
      echo "Arch: ${{ runner.arch }}"
      echo "Temp: ${{ runner.temp }}"
      echo "Tool Cache: ${{ runner.tool_cache }}"
```

**runner.os値**:
- `Linux`
- `Windows`
- `macOS`

### secrets コンテキスト

```yaml
steps:
  - run: echo "Token is set"
    env:
      API_TOKEN: ${{ secrets.API_TOKEN }}
```

### needs コンテキスト

```yaml
jobs:
  job1:
    outputs:
      output1: ${{ steps.step1.outputs.value }}

  job2:
    needs: job1
    steps:
      - run: echo ${{ needs.job1.outputs.output1 }}
      - run: echo ${{ needs.job1.result }}
```

### strategy と matrix コンテキスト

```yaml
strategy:
  matrix:
    os: [ubuntu, windows]
    node: [16, 18]

steps:
  - run: echo ${{ matrix.os }}
  - run: echo ${{ matrix.node }}
```

### inputs コンテキスト (workflow_dispatch)

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        required: true

jobs:
  deploy:
    steps:
      - run: echo ${{ inputs.environment }}
```

---

## フィルターパターン

### ブランチフィルター

```yaml
on:
  push:
    branches:
      # 完全一致
      - main
      - develop

      # ワイルドカード
      - 'releases/**'
      - 'feature/*'

      # 除外
      - '!experimental'

      # 複数パターン
      - 'releases/**'
      - '!releases/old/**'
```

### パスフィルター

```yaml
on:
  push:
    paths:
      # 特定ディレクトリ
      - 'src/**'
      - 'tests/**'

      # 特定ファイル
      - 'package.json'
      - 'package-lock.json'

      # パターン
      - '**.js'
      - '**.ts'

      # 除外
      - '!src/docs/**'
      - '!**.md'
```

### タグフィルター

```yaml
on:
  push:
    tags:
      # セマンティックバージョン
      - 'v*.*.*'
      - 'v[0-9]+.[0-9]+.[0-9]+'

      # プレリリース
      - 'v*.*.*-alpha.*'
      - 'v*.*.*-beta.*'
```

### ワイルドカードパターン

- `*`: 0個以上の文字 (スラッシュ以外)
- `**`: 0個以上の文字 (スラッシュ含む)
- `?`: 1文字
- `[abc]`: a, b, c のいずれか
- `[a-z]`: a から z のいずれか
- `!`: 否定

---

## よく使うパターン集

### 条件付きデプロイ

```yaml
jobs:
  deploy:
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      !contains(github.event.head_commit.message, '[skip deploy]')
    runs-on: ubuntu-latest
    steps:
      - run: make deploy
```

### マトリックスビルドの特定組み合わせ

```yaml
strategy:
  matrix:
    os: [ubuntu, windows, macos]
    node: [16, 18, 20]
    exclude:
      - os: macos
        node: 16
    include:
      - os: ubuntu
        node: 20
        experimental: true
```

### 依存ジョブの条件付き実行

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test

  deploy:
    needs: test
    if: success() && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: make deploy
```

### 複雑な環境変数設定

```yaml
env:
  GLOBAL_VAR: global

jobs:
  build:
    env:
      JOB_VAR: job
    steps:
      - name: Print vars
        env:
          STEP_VAR: step
        run: |
          echo "Global: $GLOBAL_VAR"
          echo "Job: $JOB_VAR"
          echo "Step: $STEP_VAR"
```

---

## まとめ

このリファレンスは、GitHub Actions ワークフロー構文の完全な仕様を提供します。

**重要なポイント**:
1. YAML構文の正確性 (インデント、引用符)
2. 式評価の理解 (コンテキスト変数、関数)
3. フィルターパターンの活用
4. 条件分岐の適切な使用
5. マトリックス戦略の効果的な利用

詳細は公式ドキュメントを参照してください:
https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
