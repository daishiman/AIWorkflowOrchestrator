# 言語別キャッシュパターン

## 概要

各プログラミング言語とパッケージマネージャーに最適化されたキャッシュ設定パターンを提供します。
依存関係のインストール時間を大幅に短縮し、ワークフローの効率を向上させます。

## Node.js

### pnpm

```yaml
- name: Cache pnpm dependencies
  uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Install dependencies
  run: pnpm ci
```

**node_modules を直接キャッシュする場合:**

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- run: pnpm ci --prefer-offline
```

### Yarn (Classic)

```yaml
- name: Get yarn cache directory
  id: yarn-cache-dir
  run: echo "dir=$(yarn cache dir)" >> $GITHUB_OUTPUT

- name: Cache yarn dependencies
  uses: actions/cache@v4
  with:
    path: ${{ steps.yarn-cache-dir.outputs.dir }}
    key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
    restore-keys: |
      ${{ runner.os }}-yarn-

- name: Install dependencies
  run: yarn install --frozen-lockfile
```

### Yarn Berry (v2+)

```yaml
- name: Cache Yarn Berry
  uses: actions/cache@v4
  with:
    path: |
      .yarn/cache
      .yarn/unplugged
      .yarn/build-state.yml
      .yarn/install-state.gz
    key: ${{ runner.os }}-yarn-berry-${{ hashFiles('**/yarn.lock') }}
    restore-keys: |
      ${{ runner.os }}-yarn-berry-

- run: yarn install --immutable
```

### pnpm

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Get pnpm store directory
  id: pnpm-cache
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

### Bun

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1

- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
    restore-keys: |
      ${{ runner.os }}-bun-

- name: Install dependencies
  run: bun install --frozen-lockfile
```

## Python

### pip

```yaml
- name: Cache pip packages
  uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- name: Install dependencies
  run: pip install -r requirements.txt
```

**複数のrequirementsファイル:**

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

### Poetry

```yaml
- name: Cache Poetry dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pypoetry
      ~/.virtualenvs
    key: ${{ runner.os }}-poetry-${{ hashFiles('**/poetry.lock') }}
    restore-keys: |
      ${{ runner.os }}-poetry-

- name: Install dependencies
  run: poetry install --no-interaction
```

### pipenv

```yaml
- name: Cache pipenv virtualenv
  uses: actions/cache@v4
  with:
    path: ~/.local/share/virtualenvs
    key: ${{ runner.os }}-pipenv-${{ hashFiles('**/Pipfile.lock') }}
    restore-keys: |
      ${{ runner.os }}-pipenv-

- run: pipenv install --deploy
```

### uv (高速パッケージマネージャー)

```yaml
- name: Cache uv packages
  uses: actions/cache@v4
  with:
    path: ~/.cache/uv
    key: ${{ runner.os }}-uv-${{ hashFiles('**/uv.lock') }}
    restore-keys: |
      ${{ runner.os }}-uv-

- run: uv sync
```

## Go

### Go Modules

```yaml
- name: Cache Go modules
  uses: actions/cache@v4
  with:
    path: |
      ~/go/pkg/mod
      ~/.cache/go-build
    key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
    restore-keys: |
      ${{ runner.os }}-go-

- name: Download dependencies
  run: go mod download

- name: Build
  run: go build -v ./...
```

**ビルドキャッシュを含める場合:**

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/go/pkg/mod
      ~/.cache/go-build
    key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}-${{ hashFiles('**/*.go') }}
    restore-keys: |
      ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}-
      ${{ runner.os }}-go-
```

## Rust

### Cargo

```yaml
- name: Cache Cargo registry
  uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/bin/
      ~/.cargo/registry/index/
      ~/.cargo/registry/cache/
      ~/.cargo/git/db/
      target/
    key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
    restore-keys: |
      ${{ runner.os }}-cargo-

- name: Build
  run: cargo build --release
```

**最適化バージョン（ビルドキャッシュ分離）:**

```yaml
# 依存関係キャッシュ
- name: Cache Cargo dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.cargo/registry/index/
      ~/.cargo/registry/cache/
      ~/.cargo/git/db/
    key: ${{ runner.os }}-cargo-deps-${{ hashFiles('**/Cargo.lock') }}

# ビルドキャッシュ
- name: Cache build artifacts
  uses: actions/cache@v4
  with:
    path: target/
    key: ${{ runner.os }}-cargo-build-${{ hashFiles('**/Cargo.lock') }}-${{ hashFiles('**/*.rs') }}
    restore-keys: |
      ${{ runner.os }}-cargo-build-${{ hashFiles('**/Cargo.lock') }}-
      ${{ runner.os }}-cargo-build-
```

### sccache（Rustコンパイルキャッシュ）

```yaml
- name: Install sccache
  run: |
    cargo install sccache --locked
    echo "RUSTC_WRAPPER=sccache" >> $GITHUB_ENV
    echo "SCCACHE_DIR=$HOME/.cache/sccache" >> $GITHUB_ENV

- name: Cache sccache
  uses: actions/cache@v4
  with:
    path: ~/.cache/sccache
    key: ${{ runner.os }}-sccache-${{ hashFiles('**/Cargo.lock') }}
    restore-keys: |
      ${{ runner.os }}-sccache-

- run: cargo build --release
- run: sccache --show-stats
```

## Java / Kotlin

### Maven

```yaml
- name: Cache Maven packages
  uses: actions/cache@v4
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-

- name: Build with Maven
  run: mvn -B package --file pom.xml
```

### Gradle

```yaml
- name: Setup Gradle
  uses: gradle/actions/setup-gradle@v3

- name: Cache Gradle packages
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
    restore-keys: |
      ${{ runner.os }}-gradle-

- name: Build with Gradle
  run: ./gradlew build
```

**Gradle 専用アクション（推奨）:**

```yaml
- name: Setup Gradle
  uses: gradle/actions/setup-gradle@v3
  with:
    cache-read-only: ${{ github.ref != 'refs/heads/main' }}

- run: ./gradlew build
```

## Ruby

### Bundler

```yaml
- name: Cache gems
  uses: actions/cache@v4
  with:
    path: vendor/bundle
    key: ${{ runner.os }}-gems-${{ hashFiles('**/Gemfile.lock') }}
    restore-keys: |
      ${{ runner.os }}-gems-

- name: Bundle install
  run: |
    bundle config path vendor/bundle
    bundle install --jobs 4 --retry 3
```

## PHP

### Composer

```yaml
- name: Get Composer cache directory
  id: composer-cache
  run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT

- name: Cache Composer packages
  uses: actions/cache@v4
  with:
    path: ${{ steps.composer-cache.outputs.dir }}
    key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
    restore-keys: |
      ${{ runner.os }}-composer-

- name: Install dependencies
  run: composer install --prefer-dist --no-progress
```

## Docker

### Docker Layer Caching

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Cache Docker layers
  uses: actions/cache@v4
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: user/app:latest
    cache-from: type=local,src=/tmp/.buildx-cache
    cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max

# キャッシュ肥大化を防ぐ
- name: Move cache
  run: |
    rm -rf /tmp/.buildx-cache
    mv /tmp/.buildx-cache-new /tmp/.buildx-cache
```

### Docker Compose

```yaml
- name: Cache Docker images
  uses: actions/cache@v4
  with:
    path: /tmp/docker-images
    key: ${{ runner.os }}-docker-${{ hashFiles('**/docker-compose.yml') }}
    restore-keys: |
      ${{ runner.os }}-docker-

- name: Load cached images
  run: |
    if [ -d "/tmp/docker-images" ]; then
      docker load -i /tmp/docker-images/images.tar || true
    fi

- name: Build images
  run: docker-compose build

- name: Save images to cache
  run: |
    mkdir -p /tmp/docker-images
    docker save $(docker images -q) -o /tmp/docker-images/images.tar
```

## C/C++

### ccache

```yaml
- name: Install ccache
  run: sudo apt-get install -y ccache

- name: Cache ccache
  uses: actions/cache@v4
  with:
    path: ~/.ccache
    key: ${{ runner.os }}-ccache-${{ hashFiles('**/*.c', '**/*.cpp', '**/*.h') }}
    restore-keys: |
      ${{ runner.os }}-ccache-

- name: Build with ccache
  run: |
    export PATH="/usr/lib/ccache:$PATH"
    cmake -B build -DCMAKE_C_COMPILER_LAUNCHER=ccache -DCMAKE_CXX_COMPILER_LAUNCHER=ccache
    cmake --build build
```

### Conan

```yaml
- name: Cache Conan packages
  uses: actions/cache@v4
  with:
    path: ~/.conan
    key: ${{ runner.os }}-conan-${{ hashFiles('**/conanfile.txt') }}
    restore-keys: |
      ${{ runner.os }}-conan-

- run: conan install . --build=missing
```

## .NET

### NuGet

```yaml
- name: Cache NuGet packages
  uses: actions/cache@v4
  with:
    path: ~/.nuget/packages
    key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj') }}
    restore-keys: |
      ${{ runner.os }}-nuget-

- name: Restore dependencies
  run: dotnet restore
```

## Swift

### Swift Package Manager

```yaml
- name: Cache Swift packages
  uses: actions/cache@v4
  with:
    path: |
      .build
      ~/Library/Caches/org.swift.swiftpm
    key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
    restore-keys: |
      ${{ runner.os }}-spm-

- run: swift build
```

## Elixir

### Mix

```yaml
- name: Cache Mix dependencies
  uses: actions/cache@v4
  with:
    path: |
      deps
      _build
    key: ${{ runner.os }}-mix-${{ hashFiles('**/mix.lock') }}
    restore-keys: |
      ${{ runner.os }}-mix-

- run: mix deps.get
- run: mix compile
```

## Dart / Flutter

### Pub

```yaml
- name: Cache Pub packages
  uses: actions/cache@v4
  with:
    path: |
      ~/.pub-cache
      .dart_tool
    key: ${{ runner.os }}-pub-${{ hashFiles('**/pubspec.lock') }}
    restore-keys: |
      ${{ runner.os }}-pub-

- run: flutter pub get
```

## フロントエンドフレームワーク

### Next.js

```yaml
- name: Cache Next.js build
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-nextjs-

- run: pnpm ci
- run: pnpm run build
```

### Nuxt.js

```yaml
- name: Cache Nuxt build
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      .nuxt
      .output
    key: ${{ runner.os }}-nuxt-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-nuxt-

- run: pnpm ci
- run: pnpm run build
```

### Vite

```yaml
- name: Cache Vite build
  uses: actions/cache@v4
  with:
    path: |
      ~/.pnpm
      node_modules/.vite
    key: ${{ runner.os }}-vite-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-vite-

- run: pnpm ci
- run: pnpm run build
```

## ベストプラクティス

### キーパターンの選択

**完全一致が必要な場合:**
```yaml
key: ${{ runner.os }}-${{ hashFiles('**/lock-file') }}
```

**部分ヒットを許可する場合:**
```yaml
key: ${{ runner.os }}-${{ hashFiles('**/lock-file') }}-${{ github.sha }}
restore-keys: |
  ${{ runner.os }}-${{ hashFiles('**/lock-file') }}-
  ${{ runner.os }}-
```

### 複数レイヤーのキャッシング

```yaml
# Layer 1: パッケージマネージャーキャッシュ（変更頻度: 低）
- uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: pnpm-cache-${{ hashFiles('**/package-lock.json') }}

# Layer 2: node_modules（変更頻度: 中）
- uses: actions/cache@v4
  with:
    path: node_modules
    key: modules-${{ hashFiles('**/package-lock.json') }}

# Layer 3: ビルド成果物（変更頻度: 高）
- uses: actions/cache@v4
  with:
    path: .next/cache
    key: build-${{ hashFiles('**/*.js', '**/*.ts') }}
    restore-keys: build-
```

### パフォーマンス最適化

**大きなnode_modulesは分割:**
```yaml
# 基本依存関係
- uses: actions/cache@v4
  with:
    path: |
      node_modules
      !node_modules/.cache
    key: modules-${{ hashFiles('**/package-lock.json') }}

# キャッシュディレクトリ（頻繁に変更）
- uses: actions/cache@v4
  with:
    path: node_modules/.cache
    key: modules-cache-${{ github.sha }}
    restore-keys: modules-cache-
```
