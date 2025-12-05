# ジョブとステップ定義詳細

## ジョブ基本構造

```yaml
jobs:
  job-id:
    name: "Job Display Name"
    runs-on: ubuntu-latest
    timeout-minutes: 30
    continue-on-error: false
    steps:
      - name: Step name
        run: echo "Hello"
```

## runs-on オプション

### GitHub-hosted ランナー

```yaml
runs-on: ubuntu-latest    # ubuntu-22.04
runs-on: ubuntu-20.04
runs-on: windows-latest   # windows-2022
runs-on: windows-2019
runs-on: macos-latest     # macos-14
runs-on: macos-13
runs-on: macos-12
```

### Self-hosted ランナー

```yaml
runs-on: self-hosted
runs-on: [self-hosted, linux, x64]
runs-on: [self-hosted, windows, gpu]
```

## ジョブ依存関係 (needs)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: make build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: make test

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    if: success()
    steps:
      - run: make deploy
```

## ジョブ出力 (outputs)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}
      sha: ${{ steps.get-sha.outputs.sha }}
    steps:
      - id: get-version
        run: echo "version=1.0.0" >> $GITHUB_OUTPUT
      - id: get-sha
        run: echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.version }}"
```

## コンテナ実行

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: node:18-alpine
      env:
        NODE_ENV: production
      ports:
        - 80
      volumes:
        - my_docker_volume:/volume_mount
      options: --cpus 2 --memory 4g
```

## サービスコンテナ

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    # SQLite/Tursoの場合はサービスコンテナ不要、環境変数のみで接続
    # env:
    #   TURSO_DATABASE_URL: ${{ secrets.TURSO_DATABASE_URL }}
    #   TURSO_AUTH_TOKEN: ${{ secrets.TURSO_AUTH_TOKEN }}

    services:
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: --health-cmd "redis-cli ping"
```

## ステップ定義

### uses (アクション使用)

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4
    with:
      fetch-depth: 0
      submodules: recursive
      token: ${{ secrets.PAT }}

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: "pnpm"
      registry-url: "https://pnpm.pkg.github.com"
```

### run (コマンド実行)

```yaml
steps:
  - name: Single command
    run: echo "Hello"

  - name: Multiple commands
    run: |
      echo "Step 1"
      echo "Step 2"
      pnpm install
      pnpm test

  - name: With shell
    shell: bash
    run: |
      set -euxo pipefail
      make build
```

### shell オプション

| shell        | 説明               |
| ------------ | ------------------ |
| `bash`       | Bashシェル         |
| `pwsh`       | PowerShell Core    |
| `python`     | Python実行         |
| `sh`         | POSIX シェル       |
| `cmd`        | Windows cmd        |
| `powershell` | Windows PowerShell |

### working-directory

```yaml
steps:
  - name: Build frontend
    run: pnpm run build
    working-directory: ./frontend

  - name: Build backend
    run: cargo build
    working-directory: ./backend
```

### env (環境変数)

```yaml
steps:
  - name: With environment variables
    env:
      NODE_ENV: production
      API_URL: ${{ secrets.API_URL }}
    run: |
      echo "Environment: $NODE_ENV"
      curl $API_URL
```

### id (ステップID)

```yaml
steps:
  - name: Get version
    id: version
    run: echo "value=$(cat VERSION)" >> $GITHUB_OUTPUT

  - name: Use version
    run: echo "Version is ${{ steps.version.outputs.value }}"
```

### if (条件分岐)

```yaml
steps:
  - name: On main branch
    if: github.ref == 'refs/heads/main'
    run: echo "Main branch"

  - name: On PR
    if: github.event_name == 'pull_request'
    run: echo "Pull request"

  - name: On success
    if: success()
    run: echo "Previous steps succeeded"

  - name: On failure
    if: failure()
    run: echo "A step failed"

  - name: Always
    if: always()
    run: echo "Always runs"
```

### continue-on-error

```yaml
steps:
  - name: Might fail
    continue-on-error: true
    run: exit 1

  - name: Still runs
    run: echo "Previous step failed but we continue"
```

### timeout-minutes

```yaml
steps:
  - name: Long running task
    timeout-minutes: 60
    run: ./long-script.sh
```

## GitHub出力

### GITHUB_OUTPUT

```yaml
steps:
  - name: Set output
    id: step1
    run: |
      echo "name=value" >> $GITHUB_OUTPUT
      echo "json={\"key\":\"value\"}" >> $GITHUB_OUTPUT

  - name: Use output
    run: |
      echo "${{ steps.step1.outputs.name }}"
      echo "${{ fromJSON(steps.step1.outputs.json).key }}"
```

### GITHUB_ENV

```yaml
steps:
  - name: Set env
    run: echo "MY_VAR=my_value" >> $GITHUB_ENV

  - name: Use env
    run: echo "$MY_VAR"
```

### GITHUB_PATH

```yaml
steps:
  - name: Add to PATH
    run: echo "/my/custom/bin" >> $GITHUB_PATH

  - name: Use custom binary
    run: my-custom-command
```

### GITHUB_STEP_SUMMARY

```yaml
steps:
  - name: Add summary
    run: |
      echo "## Build Summary" >> $GITHUB_STEP_SUMMARY
      echo "- Tests: 100 passed" >> $GITHUB_STEP_SUMMARY
      echo "- Coverage: 85%" >> $GITHUB_STEP_SUMMARY
```
