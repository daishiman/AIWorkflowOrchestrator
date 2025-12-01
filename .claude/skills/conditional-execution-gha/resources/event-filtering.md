# イベントフィルタリングと条件付きトリガー

## イベントフィルタリングの基礎

GitHub Actions では、`on:` セクションでイベントフィルターを使用して、特定の条件下でのみワークフローをトリガーできます。

## ブランチフィルター

### push イベントでのブランチフィルタリング

```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'releases/**'  # releases/ で始まるすべてのブランチ
```

**ワイルドカードパターン**:
- `*` - 0個以上の文字（スラッシュ以外）
- `**` - 0個以上の文字（スラッシュを含む）
- `?` - 1文字
- `[abc]` - 括弧内のいずれか1文字
- `[0-9]` - 範囲内のいずれか1文字

```yaml
on:
  push:
    branches:
      - main
      - 'feature/*'        # feature/xxx にマッチ
      - 'feature/**'       # feature/xxx/yyy にもマッチ
      - 'releases/v[0-9].*'  # releases/v1.x, releases/v2.x など
```

### ブランチの除外

```yaml
on:
  push:
    branches:
      - '**'  # すべてのブランチ
    branches-ignore:
      - 'feature/**'
      - 'test/**'
      - 'renovate/**'
```

**重要**: `branches` と `branches-ignore` は同時に使用できません。

### pull_request イベントでのブランチフィルタリング

```yaml
on:
  pull_request:
    branches:
      - main
      - develop
    # PRのベースブランチ（マージ先）でフィルタリング
```

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main
```

## パスフィルター

### 特定ファイル/ディレクトリの変更時のみトリガー

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
```

```yaml
on:
  pull_request:
    paths:
      - '**.ts'       # すべての .ts ファイル
      - '**.tsx'      # すべての .tsx ファイル
      - 'tsconfig.json'
```

### パスの除外

```yaml
on:
  push:
    paths-ignore:
      - '*.md'
      - 'docs/**'
      - '.github/**'
      - '!.github/workflows/**'  # .github/workflows は除外しない
```

**除外の否定**: `!` を使用して除外から除外できます。

```yaml
on:
  push:
    paths:
      - 'src/**'
      - '!src/test/**'  # src/ 配下だが src/test/ は除外
```

### パスとブランチの組み合わせ

```yaml
on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'src/**'
      - 'package.json'
```

**動作**: main または develop ブランチで、かつ src/ 配下または package.json が変更された場合のみトリガー。

## タグフィルター

### リリースタグでのトリガー

```yaml
on:
  push:
    tags:
      - 'v*.*.*'      # v1.0.0, v2.3.4 など
      - 'v*.*.*-rc.*' # v1.0.0-rc.1 など
```

```yaml
on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'  # セマンティックバージョン
```

### タグの除外

```yaml
on:
  push:
    tags:
      - 'v*'
    tags-ignore:
      - 'v*-beta'
      - 'v*-alpha'
```

### タグとブランチの使い分け

```yaml
# タグとブランチを分けて定義
on:
  push:
    branches:
      - main
      - develop
    tags:
      - 'v*.*.*'
```

## イベントアクションフィルター

### pull_request イベントのアクションフィルタリング

```yaml
on:
  pull_request:
    types:
      - opened        # PR作成時
      - synchronize   # PRへの新しいコミット
      - reopened      # PR再オープン時
      - labeled       # ラベル追加時
      - unlabeled     # ラベル削除時
      - ready_for_review  # Draft解除時
```

**デフォルトアクション**: `types` 未指定時は `opened`, `synchronize`, `reopened`。

### issue イベント

```yaml
on:
  issues:
    types:
      - opened
      - labeled
      - closed
```

### release イベント

```yaml
on:
  release:
    types:
      - published   # リリース公開時
      - created     # リリース作成時
      - prereleased # プレリリース時
```

## イベントベースの条件分岐

### PRラベルによる条件分岐

```yaml
on:
  pull_request:
    types: [labeled, unlabeled, opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run unit tests (常に実行)
        run: pnpm test

      - name: Run e2e tests (ラベル付き時のみ)
        if: contains(github.event.pull_request.labels.*.name, 'test:e2e')
        run: pnpm run test:e2e

      - name: Run performance tests (ラベル付き時のみ)
        if: contains(github.event.pull_request.labels.*.name, 'test:perf')
        run: pnpm run test:perf
```

### イベントアクションによる条件分岐

```yaml
on:
  pull_request:
    types: [opened, closed, synchronize]

jobs:
  handle-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Welcome message (PR作成時のみ)
        if: github.event.action == 'opened'
        run: echo "Welcome! Thanks for your PR."

      - name: Cleanup (PRクローズ時のみ)
        if: github.event.action == 'closed'
        run: ./cleanup-preview.sh

      - name: Run tests (同期時のみ)
        if: github.event.action == 'synchronize'
        run: pnpm test
```

### PRマージ検出

```yaml
on:
  pull_request:
    types: [closed]

jobs:
  post-merge:
    # PRがマージされて閉じられた場合のみ実行
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - run: echo "PR was merged!"
```

## 複雑なフィルタリングパターン

### モノレポでのパス別ジョブ実行

```yaml
on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # 差分検出に必要

      - name: Check if frontend changed
        id: frontend_changed
        run: |
          if git diff HEAD^ HEAD --name-only | grep -q '^packages/frontend/'; then
            echo "changed=true" >> $GITHUB_OUTPUT
          else
            echo "changed=false" >> $GITHUB_OUTPUT
          fi

      - name: Build frontend
        if: steps.frontend_changed.outputs.changed == 'true'
        run: pnpm run build:frontend

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Check if backend changed
        id: backend_changed
        run: |
          if git diff HEAD^ HEAD --name-only | grep -q '^packages/backend/'; then
            echo "changed=true" >> $GITHUB_OUTPUT
          else
            echo "changed=false" >> $GITHUB_OUTPUT
          fi

      - name: Build backend
        if: steps.backend_changed.outputs.changed == 'true'
        run: pnpm run build:backend
```

### 環境別デプロイメント

```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'release/**'

jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    environment: development
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to dev"

  deploy-staging:
    if: startsWith(github.ref, 'refs/heads/release/')
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to staging"

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    environment: production
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to prod"
```

### ファイルタイプ別のワークフロー

```yaml
on:
  pull_request:
    paths:
      - '**.ts'
      - '**.tsx'
      - '**.js'
      - '**.jsx'
      - '**.md'
      - '**.json'

jobs:
  lint-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Check for code changes
        id: code_changed
        run: |
          if git diff HEAD^ HEAD --name-only | grep -qE '\.(ts|tsx|js|jsx)$'; then
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Lint code
        if: steps.code_changed.outputs.changed == 'true'
        run: pnpm run lint

  lint-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Check for doc changes
        id: docs_changed
        run: |
          if git diff HEAD^ HEAD --name-only | grep -q '\.md$'; then
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Lint markdown
        if: steps.docs_changed.outputs.changed == 'true'
        run: pnpm run lint:md
```

## 外部アクションを使った高度なフィルタリング

### dorny/paths-filter アクション

```yaml
on:
  pull_request:

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      backend: ${{ steps.filter.outputs.backend }}
      docs: ${{ steps.filter.outputs.docs }}
    steps:
      - uses: actions/checkout@v4

      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'apps/frontend/**'
              - 'packages/ui/**'
            backend:
              - 'apps/backend/**'
              - 'packages/api/**'
            docs:
              - 'docs/**'
              - '**.md'

  test-frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run test:frontend

  test-backend:
    needs: detect-changes
    if: needs.detect-changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run test:backend
```

## schedule イベントでの条件分岐

```yaml
on:
  schedule:
    - cron: '0 2 * * 1-5'  # 平日午前2時
    - cron: '0 6 * * 0,6'  # 週末午前6時

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Weekday backup (短時間)
        if: github.event.schedule == '0 2 * * 1-5'
        run: ./backup-incremental.sh

      - name: Weekend backup (完全)
        if: github.event.schedule == '0 6 * * 0,6'
        run: ./backup-full.sh
```

## workflow_dispatch での入力による条件分岐

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - development
          - staging
          - production
      skip_tests:
        description: 'Skip tests'
        type: boolean
        default: false

jobs:
  test:
    if: inputs.skip_tests == false
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test

  deploy:
    needs: test
    if: always()  # テストがスキップされても実行
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to dev
        if: inputs.environment == 'development'
        run: ./deploy-dev.sh

      - name: Deploy to staging
        if: inputs.environment == 'staging'
        run: ./deploy-staging.sh

      - name: Deploy to production
        if: inputs.environment == 'production'
        run: ./deploy-prod.sh
```

## ベストプラクティス

### 1. フィルターは on: レベルで定義

```yaml
# ✅ on: レベルでフィルタリング（効率的）
on:
  push:
    branches: [main]
    paths: ['src/**']

# ❌ if: 条件でフィルタリング（非効率）
on: push
jobs:
  build:
    if: github.ref == 'refs/heads/main'
```

**理由**: `on:` レベルのフィルターは、ワークフローが開始される前に評価されるため効率的。

### 2. paths-ignore より paths を優先

```yaml
# ✅ 明示的に対象を指定
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'

# ⚠️ 除外ベース（意図しないトリガーのリスク）
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '*.md'
```

### 3. ブランチ保護と組み合わせる

```yaml
on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

jobs:
  required-checks:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test
      - run: pnpm run lint
```

**GitHub設定**: main ブランチに required-checks を必須ステータスチェックとして設定。

### 4. モノレポではパスフィルターを活用

```yaml
on:
  pull_request:
    paths:
      - 'packages/frontend/**'
      - 'packages/backend/**'

jobs:
  detect-changes:
    # dorny/paths-filter で効率的に変更検出
```

### 5. 複雑な条件はスクリプトで処理

```yaml
steps:
  - name: Complex condition check
    id: check
    run: |
      # 複雑なロジックをシェルスクリプトで実装
      if [[ "${{ github.ref }}" == "refs/heads/main" ]] && \
         [[ "${{ github.event_name }}" == "push" ]] && \
         [[ $(git log -1 --pretty=%B) != *"[skip ci]"* ]]; then
        echo "should_run=true" >> $GITHUB_OUTPUT
      else
        echo "should_run=false" >> $GITHUB_OUTPUT
      fi

  - name: Execute
    if: steps.check.outputs.should_run == 'true'
    run: ./execute.sh
```
