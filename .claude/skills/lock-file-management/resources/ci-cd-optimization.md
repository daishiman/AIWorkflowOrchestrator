# CI/CDでの最適化

## 概要

CI/CD環境での依存関係インストールを最適化することで、
ビルド時間を大幅に短縮し、コストを削減できます。

## キャッシュ戦略

### pnpm + GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test
```

### pnpm + GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm ci

      - name: Build
        run: pnpm run build

      - name: Test
        run: pnpm test
```

### yarn + GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "yarn"

      - name: Install dependencies
        run: yarn install --immutable

      - name: Build
        run: yarn build
```

## 高度なキャッシュ戦略

### 条件付きキャッシュ

```yaml
- name: Cache node_modules
  id: cache-deps
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      ~/.pnpm-store
    key: deps-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

- name: Install dependencies
  if: steps.cache-deps.outputs.cache-hit != 'true'
  run: pnpm install --frozen-lockfile
```

### モノレポでのキャッシュ

```yaml
- name: Setup pnpm cache for monorepo
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm-store
      **/node_modules
    key: monorepo-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      monorepo-${{ runner.os }}-
```

## インストール最適化

### pnpmの設定

```yaml
# .npmrc (CI用の最適化)
# ネットワーク最適化
fetch-retries=3
fetch-retry-mintimeout=20000
fetch-retry-maxtimeout=120000
network-concurrency=16

# 不要な処理をスキップ
ignore-scripts=false
audit=false

# ストア設定
store-dir=~/.pnpm-store
```

### 並列インストール

```yaml
jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Install with high concurrency
        run: pnpm install --frozen-lockfile
        env:
          # 並列ダウンロード数を増加
          PNPM_FETCH_CONCURRENCY: 16
```

### 本番ビルド用の最適化

```yaml
- name: Install production dependencies only
  run: pnpm install --frozen-lockfile --prod

- name: Build
  run: pnpm build
```

## プラットフォーム別の最適化

### GitLab CI

```yaml
# .gitlab-ci.yml
variables:
  PNPM_STORE_DIR: .pnpm-store
  FF_USE_FASTZIP: "true"

cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store/
  policy: pull-push

.node-setup:
  before_script:
    - corepack enable
    - corepack prepare pnpm@latest --activate
    - pnpm config set store-dir $PNPM_STORE_DIR

install:
  extends: .node-setup
  stage: prepare
  script:
    - pnpm install --frozen-lockfile
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

build:
  stage: build
  needs: [install]
  script:
    - pnpm build
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5

jobs:
  build:
    docker:
      - image: cimg/node:20.10

    steps:
      - checkout

      - run:
          name: Install pnpm
          command: corepack enable && corepack prepare pnpm@latest --activate

      - restore_cache:
          keys:
            - pnpm-store-{{ checksum "pnpm-lock.yaml" }}
            - pnpm-store-

      - run:
          name: Install dependencies
          command: pnpm install --frozen-lockfile

      - save_cache:
          key: pnpm-store-{{ checksum "pnpm-lock.yaml" }}
          paths:
            - ~/.pnpm-store

      - run:
          name: Build
          command: pnpm build

workflows:
  build-and-test:
    jobs:
      - build
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-slim AS deps

# pnpmをインストール
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 依存関係ファイルのみコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# ビルドステージ
FROM node:20-slim AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# 本番ステージ
FROM node:20-slim AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

CMD ["node", "dist/index.js"]
```

## パフォーマンス測定

### インストール時間の測定

```yaml
- name: Measure install time
  run: |
    START=$(date +%s)
    pnpm install --frozen-lockfile
    END=$(date +%s)
    echo "Install time: $((END-START)) seconds"
```

### キャッシュヒット率の監視

```yaml
- name: Check cache status
  if: always()
  run: |
    echo "Cache hit: ${{ steps.cache-deps.outputs.cache-hit }}"
```

## ベストプラクティス

### すべきこと

1. **frozen-lockfileを使用**

   ```bash
   pnpm install --frozen-lockfile
   ```

2. **適切なキャッシュキーを設定**

   ```yaml
   key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
   ```

3. **キャッシュの定期的なクリア**
   ```yaml
   # キャッシュのバージョニング
   key: v2-${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
   ```

### 避けるべきこと

1. **キャッシュの過度な保存**
   - node_modules全体のキャッシュは非効率
   - pnpmストアのキャッシュが効率的

2. **毎回のフルインストール**
   - キャッシュを活用しない
   - ビルド時間が長くなる

3. **不安定なキャッシュキー**
   - ハッシュなしのキーは古いキャッシュを使用

## チェックリスト

### CI/CD設定時

- [ ] ロックファイルベースのキャッシュを設定したか？
- [ ] frozen-lockfileオプションを使用しているか？
- [ ] キャッシュのリストアキーを設定したか？
- [ ] 本番ビルドで devDependencies を除外しているか？

### パフォーマンス最適化時

- [ ] インストール時間を測定したか？
- [ ] キャッシュヒット率を確認したか？
- [ ] 並列処理を活用しているか？
- [ ] 不要な処理をスキップしているか？
