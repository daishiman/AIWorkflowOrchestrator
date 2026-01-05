# GitHub Actions 構文リファレンス

> 18-skills.md §3.5 準拠
> **相対パス**: `references/syntax-reference.md`

---

## 概要

GitHub Actionsワークフローの完全な構文リファレンス。全キーとオプションを網羅。

---

## ワークフローキー

### name

```yaml
name: My Workflow
```

### run-name

```yaml
run-name: Deploy to ${{ inputs.environment }}
```

### on

```yaml
on:
  push:
    branches: [main]
    tags: ["v*"]
    paths: ["src/**"]
    paths-ignore: ["docs/**"]

  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]

  schedule:
    - cron: "0 0 * * *"

  workflow_call:
    inputs:
      config:
        type: string
        required: true
    secrets:
      TOKEN:
        required: true
```

### permissions

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
  packages: write
  actions: read
  checks: write
  deployments: write
  id-token: write
  security-events: write
  statuses: write
```

権限レベル: `read`, `write`, `none`

### env

```yaml
env:
  CI: true
  NODE_ENV: production
```

### defaults

```yaml
defaults:
  run:
    shell: bash
    working-directory: ./app
```

### concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## jobs キー

### jobs.<job_id>

```yaml
jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [setup]
    if: github.ref == 'refs/heads/main'
    timeout-minutes: 30
    continue-on-error: false
```

### runs-on

```yaml
runs-on: ubuntu-latest
runs-on: windows-latest
runs-on: macos-latest
runs-on: [self-hosted, linux]
runs-on: ${{ matrix.os }}
```

### needs

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

### strategy

```yaml
strategy:
  fail-fast: false
  max-parallel: 2
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]
    include:
      - os: ubuntu-latest
        node: 20
        experimental: true
    exclude:
      - os: windows-latest
        node: 18
```

### environment

```yaml
environment: production

environment:
  name: production
  url: https://example.com
```

### outputs

```yaml
jobs:
  build:
    outputs:
      artifact-id: ${{ steps.upload.outputs.artifact-id }}
```

### services

```yaml
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
```

### container

```yaml
container:
  image: node:20
  env:
    NODE_ENV: test
  ports:
    - 3000
  volumes:
    - /data:/data
  options: --cpus 1
```

---

## steps キー

### uses

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0
      token: ${{ secrets.PAT }}
```

### run

```yaml
steps:
  - run: npm test
    working-directory: ./app
    shell: bash
    env:
      CI: true
```

### 共通キー

```yaml
steps:
  - id: step-id
    name: Step Name
    if: success()
    continue-on-error: false
    timeout-minutes: 10
```

---

## 式と関数

### 比較演算子

| 演算子 | 例                      |
| ------ | ----------------------- |
| `==`   | `github.ref == 'main'`  |
| `!=`   | `github.actor != 'bot'` |
| `<`    | `matrix.node < 20`      |
| `>`    | `matrix.node > 18`      |
| `<=`   | `matrix.node <= 20`     |
| `>=`   | `matrix.node >= 18`     |
| `&&`   | `a == 1 && b == 2`      |
| `\|\|` | `a == 1 \|\| b == 2`    |
| `!`    | `!cancelled()`          |

### 関数

| 関数           | 説明                    |
| -------------- | ----------------------- |
| `contains()`   | 文字列/配列に含まれるか |
| `startsWith()` | 文字列で始まるか        |
| `endsWith()`   | 文字列で終わるか        |
| `format()`     | 文字列フォーマット      |
| `join()`       | 配列を結合              |
| `toJSON()`     | JSONに変換              |
| `fromJSON()`   | JSONからパース          |
| `hashFiles()`  | ファイルハッシュ        |

### ステータスチェック

| 関数          | 説明             |
| ------------- | ---------------- |
| `success()`   | 前ステップが成功 |
| `failure()`   | 前ステップが失敗 |
| `always()`    | 常に実行         |
| `cancelled()` | キャンセル時     |

---

## シェル

| シェル       | 説明               |
| ------------ | ------------------ |
| `bash`       | Bash（デフォルト） |
| `pwsh`       | PowerShell Core    |
| `python`     | Python             |
| `sh`         | POSIX shell        |
| `cmd`        | Windows CMD        |
| `powershell` | Windows PowerShell |

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **実装パターン**: See [patterns.md](patterns.md)
