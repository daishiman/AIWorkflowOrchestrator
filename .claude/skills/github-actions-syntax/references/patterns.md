# GitHub Actions 実装パターン

> 18-skills.md §3.5 準拠
> **相対パス**: `references/patterns.md`

---

## 概要

GitHub Actionsワークフローの実装パターン集。マトリックス戦略、条件付き実行、キャッシング、並列処理などの実践的なパターンを提供。

---

## パターン1: マトリックス戦略

### 目的

複数の環境・バージョンでテストを並列実行

### 実装

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
        exclude:
          - os: windows-latest
            node: 18
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - run: npm test

      - if: matrix.coverage
        run: npm run coverage
```

---

## パターン2: 条件付き実行

### 目的

特定の条件でのみジョブ/ステップを実行

### 実装

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 前のステップが成功した場合のみ
      - if: success()
        run: ./deploy.sh

      # 失敗した場合のみ
      - if: failure()
        run: ./notify-failure.sh

      # 常に実行
      - if: always()
        run: ./cleanup.sh
```

### 条件式

| 式            | 説明             |
| ------------- | ---------------- |
| `success()`   | 前ステップが成功 |
| `failure()`   | 前ステップが失敗 |
| `always()`    | 常に実行         |
| `cancelled()` | キャンセル時     |

---

## パターン3: キャッシング

### 目的

依存関係のキャッシュで実行時間を短縮

### 実装

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm" # 自動キャッシュ

      # または手動キャッシュ
      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: npm-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            npm-

      - run: npm ci
```

### キャッシュ戦略

| キー戦略               | 用途               |
| ---------------------- | ------------------ |
| `hashFiles('**/lock')` | ロックファイル依存 |
| `github.sha`           | コミット依存       |
| `github.run_id`        | 実行依存           |

---

## パターン4: アーティファクト共有

### 目的

ジョブ間でビルド成果物を共有

### 実装

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/

      - run: ./deploy.sh
```

---

## パターン5: 同時実行制御

### 目的

同一ブランチでの複数実行を制御

### 実装

```yaml
name: Deploy

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

### 制御オプション

| オプション           | 説明               |
| -------------------- | ------------------ |
| `group`              | 同時実行グループ名 |
| `cancel-in-progress` | 実行中をキャンセル |

---

## パターン6: 再利用可能ワークフロー

### 目的

ワークフローを再利用可能な形で定義

### 呼び出される側

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
    secrets:
      NPM_TOKEN:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 呼び出す側

```yaml
jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: "20"
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## パターン7: 環境別デプロイ

### 目的

承認フロー付きの段階的デプロイ

### 実装

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: ./deploy.sh staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - run: ./deploy.sh production
```

---

## パターン8: ステップ出力

### 目的

ステップ間でデータを受け渡し

### 実装

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}
    steps:
      - id: version
        run: echo "value=$(cat VERSION)" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **構文リファレンス**: See [syntax-reference.md](syntax-reference.md)
