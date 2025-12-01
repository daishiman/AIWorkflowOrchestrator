# プロジェクトタイプ別テンプレート選択ガイド

プロジェクトの特性に応じた最適なワークフローテンプレートの選択方法。

## 選択マトリックス

| プロジェクトタイプ | テンプレート | キャッシング | テストコマンド | ビルド成果物 |
|-------------------|-------------|-------------|---------------|-------------|
| **Node.js (pnpm)** | `nodejs-template.yaml` | `~/.pnpm` | `pnpm test` | `dist/`, `build/` |
| **Node.js (pnpm)** | `nodejs-template.yaml` | `~/.pnpm-store` | `pnpm test` | `dist/`, `build/` |
| **Node.js (yarn)** | `nodejs-template.yaml` | `~/.yarn` | `yarn test` | `dist/`, `build/` |
| **Python (pip)** | `ci-template.yaml` | `~/.cache/pip` | `pytest` | `dist/`, `*.whl` |
| **Python (poetry)** | `ci-template.yaml` | `~/.cache/pypoetry` | `poetry run pytest` | `dist/` |
| **Go** | `ci-template.yaml` | `~/go/pkg/mod` | `go test ./...` | バイナリファイル |
| **Rust** | `ci-template.yaml` | `~/.cargo` | `cargo test` | `target/release/` |
| **Docker** | `docker-template.yaml` | Docker layer cache | - | イメージ |
| **Mono-repo** | カスタム + `matrix-builds` | プロジェクト別 | 複数 | 複数 |

---

## 1. Node.jsプロジェクト

### パッケージマネージャー検出

```bash
# ロックファイルでパッケージマネージャーを判定
if [ -f "pnpm-lock.yaml" ]; then
  PKG_MANAGER="pnpm"
elif [ -f "yarn.lock" ]; then
  PKG_MANAGER="yarn"
elif [ -f "package-lock.json" ]; then
  PKG_MANAGER="pnpm"
fi
```

### npm使用時

```yaml
name: Node.js CI (pnpm)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm ci

      - name: Run linter
        run: pnpm run lint

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm run build
```

### pnpm使用時

```yaml
name: Node.js CI (pnpm)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build
```

### yarn使用時

```yaml
name: Node.js CI (yarn)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run linter
        run: yarn lint

      - name: Run tests
        run: yarn test

      - name: Build
        run: yarn build
```

### モノレポ対応 (Turborepo/Nx)

```yaml
name: Monorepo CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Turborepo/Nxのキャッシュに必要

      - uses: pnpm/action-setup@v4
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Turborepoの場合
      - name: Run Turborepo tasks
        run: pnpm turbo run lint test build

      # Nxの場合
      # - name: Run Nx tasks
      #   run: pnpm nx affected --target=test --parallel=3
```

---

## 2. Pythonプロジェクト

### pip使用時

```yaml
name: Python CI (pip)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt  # テスト依存関係

      - name: Run linter
        run: |
          pip install flake8
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

      - name: Run type checker
        run: |
          pip install mypy
          mypy src/

      - name: Run tests
        run: pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### poetry使用時

```yaml
name: Python CI (poetry)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11', '3.12']
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}

      - name: Install Poetry
        uses: snok/install-poetry@v1
        with:
          version: 1.7.0
          virtualenvs-create: true
          virtualenvs-in-project: true

      - name: Load cached venv
        uses: actions/cache@v4
        with:
          path: .venv
          key: venv-${{ runner.os }}-${{ matrix.python-version }}-${{ hashFiles('**/poetry.lock') }}

      - name: Install dependencies
        run: poetry install --no-interaction

      - name: Run linter
        run: poetry run flake8

      - name: Run type checker
        run: poetry run mypy src/

      - name: Run tests
        run: poetry run pytest --cov=src --cov-report=xml
```

### Django プロジェクト

```yaml
name: Django CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: python manage.py migrate
      - run: python manage.py test
```

---

## 3. Dockerプロジェクト

### シングルイメージビルド

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### マルチステージビルド最適化

```yaml
# Dockerfile例
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm ci
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 4. Goプロジェクト

```yaml
name: Go CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        go-version: ['1.20', '1.21', '1.22']
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go-version }}
          cache: true

      - name: Download dependencies
        run: go mod download

      - name: Run tests
        run: go test -v -race -coverprofile=coverage.txt -covermode=atomic ./...

      - name: Run linter
        uses: golangci/golangci-lint-action@v4
        with:
          version: latest

      - name: Build
        run: go build -v ./...

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

---

## 5. Rustプロジェクト

```yaml
name: Rust CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - name: Cache cargo registry
        uses: actions/cache@v4
        with:
          path: ~/.cargo/registry
          key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo index
        uses: actions/cache@v4
        with:
          path: ~/.cargo/git
          key: ${{ runner.os }}-cargo-git-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo build
        uses: actions/cache@v4
        with:
          path: target
          key: ${{ runner.os }}-cargo-build-target-${{ hashFiles('**/Cargo.lock') }}

      - name: Run formatter check
        run: cargo fmt -- --check

      - name: Run linter
        run: cargo clippy -- -D warnings

      - name: Run tests
        run: cargo test --verbose

      - name: Build release
        run: cargo build --release --verbose
```

---

## プロジェクト特性別の追加考慮事項

### フロントエンドフレームワーク

**React/Vue/Angular**:
- E2Eテスト (Playwright/Cypress)
- ビルド成果物の静的ホスティング (GitHub Pages/Vercel)
- バンドルサイズ分析

**Next.js/Nuxt**:
- SSR/SSGビルド検証
- 環境変数の管理
- Vercel/Netlifyへのデプロイ統合

### バックエンドフレームワーク

**Express/Fastify**:
- APIテスト (Supertest)
- データベースマイグレーション
- コンテナイメージビルド

**Django/Flask**:
- データベースサービス (PostgreSQL/MySQL)
- 静的ファイル収集
- セキュリティチェック (Bandit)

### データベース依存

**PostgreSQL/MySQL必要**:
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

**Redis必要**:
```yaml
services:
  redis:
    image: redis:7
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
```

---

## テンプレート選択フローチャート

```
プロジェクトルートを確認
    ↓
package.json 存在？
    ├─ Yes → Node.jsテンプレート
    │         ↓
    │       ロックファイルチェック
    │         ├─ pnpm-lock.yaml → pnpm設定
    │         ├─ yarn.lock → yarn設定
    │         └─ package-lock.json → npm設定
    │
    └─ No → requirements.txt / pyproject.toml 存在？
              ├─ Yes → Pythonテンプレート
              │         ↓
              │       pyproject.toml 存在？
              │         ├─ Yes → poetry設定
              │         └─ No → pip設定
              │
              └─ No → Dockerfile 存在？
                        ├─ Yes → Dockerテンプレート
                        └─ No → 他言語チェック
                                  ├─ go.mod → Goテンプレート
                                  ├─ Cargo.toml → Rustテンプレート
                                  ├─ composer.json → PHPテンプレート
                                  └─ build.gradle → Javaテンプレート
```

---

## まとめ

適切なテンプレート選択のために:

1. **プロジェクト構造を確認**: ロックファイル、設定ファイルから言語・ツールを特定
2. **依存関係を把握**: データベース、キャッシュなどの外部サービス要否
3. **CI/CDフローを設計**: テスト → ビルド → デプロイの各段階を明確化
4. **段階的に拡張**: 基本テンプレートから開始し、プロジェクト成長に応じて機能追加

各プロジェクトの特性に合わせてテンプレートをカスタマイズし、効率的なCI/CDパイプラインを構築してください。
