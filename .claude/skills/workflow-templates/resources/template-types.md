# テンプレートタイプ詳細

GitHub Actionsワークフローテンプレートの3つの主要なタイプとその使用方法。

## 1. 組織テンプレート (Organization Templates)

### 概要
組織全体で標準化されたワークフローテンプレートを提供する仕組み。

### 配置場所
```
.github/
└── workflow-templates/
    ├── ci-nodejs.yml
    ├── ci-nodejs.properties.json
    ├── cd-production.yml
    └── cd-production.properties.json
```

### プロパティファイル (.properties.json)

```json
{
  "name": "Node.js CI Template",
  "description": "Continuous Integration for Node.js projects",
  "iconName": "nodejs",
  "categories": ["CI", "Node.js"],
  "filePatterns": ["package.json"]
}
```

**プロパティ項目**:
- `name`: テンプレート名（UI表示用）
- `description`: 説明文
- `iconName`: アイコン識別子（octicon名）
- `categories`: カテゴリタグ（検索・フィルタ用）
- `filePatterns`: 自動提案のためのファイルパターン

### 利用方法

1. **リポジトリUI経由**:
   - Actions タブ → New workflow → 組織テンプレートセクション

2. **自動提案**:
   - `filePatterns` にマッチするファイルがある場合、自動的にサジェスト

### ベストプラクティス

```yaml
# ✅ Good: パラメータ化されたテンプレート
name: Node.js CI

on:
  push:
    branches: [$default-branch]  # GitHub UIが自動置換
  pull_request:
    branches: [$default-branch]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'  # プロジェクトに応じて変更
          cache: 'pnpm'
```

```yaml
# ❌ Bad: ハードコードされた値
name: Node.js CI

on:
  push:
    branches: [main]  # 組織内のブランチ戦略と合わない可能性
```

### 管理戦略

- **バージョニング**: テンプレートファイル名にバージョンを含める（`ci-nodejs-v2.yml`）
- **廃止プロセス**: 古いテンプレートには `.deprecated` サフィックスを追加
- **ドキュメント**: 各テンプレートにコメントで使用方法を記載
- **レビューサイクル**: 四半期ごとにテンプレートを見直し

---

## 2. スターターワークフロー (Starter Workflows)

### 概要
GitHubが公式に提供するプロジェクトタイプ別の最適化されたワークフローテンプレート。

### 提供元
- GitHub公式リポジトリ: [actions/starter-workflows](https://github.com/actions/starter-workflows)
- カテゴリ: CI、Deployment、Automation、Pages、Security

### 主要なスターターワークフロー

#### CI系

**Node.js**:
```yaml
name: Node.js CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      - run: pnpm ci
      - run: pnpm run build --if-present
      - run: pnpm test
```

**Python**:
```yaml
name: Python application

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: pytest
```

**Docker**:
```yaml
name: Docker Image CI

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build the Docker image
        run: docker build . --file Dockerfile --tag my-image:$(date +%s)
```

#### Deployment系

**AWS**:
```yaml
name: Deploy to Amazon ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
```

### カスタマイズポイント

1. **トリガー条件**:
   - ブランチ名をプロジェクトに合わせる
   - スケジュール実行を追加
   - パス条件でビルドを最適化

2. **ランタイムバージョン**:
   - Node.js、Python、Rubyなどのバージョン
   - マトリックスビルドの範囲

3. **依存関係管理**:
   - パッケージマネージャーの選択（pnpm/yarn/pnpm）
   - キャッシュ戦略

4. **テストコマンド**:
   - プロジェクト固有のスクリプト
   - 環境変数の設定

---

## 3. 再利用可能パターン (Reusable Patterns)

### 概要
複数のワークフローで共通して使用される処理をパターン化したもの。

### パターンタイプ

#### A. Composite Action化

**ユースケース**: 複数ステップの定型処理

```yaml
# .github/actions/setup-node-with-cache/action.yml
name: Setup Node.js with cache
description: Node.js環境のセットアップとキャッシング

inputs:
  node-version:
    description: 'Node.js version'
    required: true
  package-manager:
    description: 'Package manager (pnpm/yarn/pnpm)'
    required: false
    default: 'pnpm'

runs:
  using: composite
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: ${{ inputs.package-manager }}

    - name: Install dependencies
      shell: bash
      run: |
        case "${{ inputs.package-manager }}" in
          pnpm) pnpm ci ;;
          yarn) yarn install --frozen-lockfile ;;
          pnpm) pnpm install --frozen-lockfile ;;
        esac
```

**使用例**:
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-node-with-cache
    with:
      node-version: '20'
      package-manager: 'pnpm'
  - run: pnpm test
```

#### B. Reusable Workflow化

**ユースケース**: ワークフロー全体の再利用

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      run-e2e:
        required: false
        type: boolean
        default: false
    secrets:
      NPM_TOKEN:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: pnpm ci
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: pnpm test
      - if: ${{ inputs.run-e2e }}
        run: pnpm run test:e2e
```

**呼び出し側**:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20'
      run-e2e: true
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### C. テンプレート変数パターン

**プロジェクト固有値の抽出**:

```yaml
# Template
env:
  NODE_VERSION: '20'          # ← プロジェクトに応じて変更
  DOCKER_REGISTRY: 'ghcr.io'  # ← プロジェクトに応じて変更
  APP_NAME: 'my-app'          # ← プロジェクトに応じて変更

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
```

### 再利用パターン選択基準

| パターン | 適用場面 | メリット | デメリット |
|---------|---------|---------|----------|
| **Composite Action** | 複数ステップの定型処理 | 簡単に組み込める | ジョブレベルの制御不可 |
| **Reusable Workflow** | ワークフロー全体の再利用 | 完全な独立性 | 呼び出しオーバーヘッド |
| **テンプレート変数** | 軽微なカスタマイズ | シンプル | 構造的な再利用は困難 |

---

## テンプレート選択フローチャート

```
プロジェクト開始
    ↓
組織テンプレートが存在？
    ├─ Yes → 組織テンプレートを使用
    │         ↓
    │       プロジェクト固有にカスタマイズ
    │
    └─ No → プロジェクトタイプを特定
              ↓
          GitHubスターターワークフローから選択
              ↓
          共通処理が多い？
              ├─ Yes → Composite Action / Reusable Workflow化
              └─ No → そのまま使用
```

---

## まとめ

- **組織テンプレート**: 組織全体の標準化に最適
- **スターターワークフロー**: 新規プロジェクトの迅速な立ち上げに最適
- **再利用可能パターン**: 複数プロジェクト間でのコード共有に最適

適切なテンプレートタイプを選択することで、効率的かつ保守性の高いCI/CDパイプラインを構築できます。
