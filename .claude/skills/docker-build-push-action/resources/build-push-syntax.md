# docker/build-push-action 完全構文リファレンス

## 概要

`docker/build-push-action`の完全な構文とオプション、BuildKit機能、マルチプラットフォームビルドの詳細を提供します。

## 基本構文

### 必須パラメータ

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .              # ビルドコンテキスト（必須）
    push: true              # プッシュ有効化
```

### 完全パラメータリスト

```yaml
- name: Build and push (Full options)
  uses: docker/build-push-action@v5
  with:
    # === コンテキスト設定 ===
    context: .                          # ビルドコンテキストのパス
    file: ./Dockerfile                  # Dockerfileのパス（デフォルト: ./Dockerfile）

    # === ターゲット・プラットフォーム ===
    target: production                  # マルチステージビルドのターゲット
    platforms: linux/amd64,linux/arm64  # ビルド対象プラットフォーム

    # === タグ・レジストリ ===
    tags: |                             # イメージタグ（複数指定可）
      ghcr.io/user/repo:latest
      ghcr.io/user/repo:1.2.3
    labels: |                           # OCI準拠ラベル
      org.opencontainers.image.title=MyApp
      org.opencontainers.image.version=1.2.3

    # === プッシュ制御 ===
    push: true                          # レジストリへプッシュ
    load: false                         # ローカルDockerデーモンへロード（pushと排他）
    outputs: type=docker,dest=/tmp/image.tar  # カスタム出力

    # === BuildKit機能 ===
    builder: mybuilder                  # 使用するBuildxビルダー
    cache-from: type=gha                # キャッシュ読み込み元
    cache-to: type=gha,mode=max         # キャッシュ書き込み先

    # === ビルド引数 ===
    build-args: |                       # ビルド時の変数
      NODE_ENV=production
      API_URL=${{ secrets.API_URL }}
    secrets: |                          # ビルド時のSecret（BuildKit）
      GIT_AUTH_TOKEN=${{ secrets.GIT_TOKEN }}

    # === ネットワーク・セキュリティ ===
    network: host                       # ビルド時のネットワークモード
    no-cache: false                     # キャッシュ無効化
    pull: false                         # ベースイメージの強制pull

    # === SSH・Git ===
    ssh: default=${{ env.SSH_AUTH_SOCK }}  # SSHエージェント転送

    # === その他 ===
    allow: |                            # セキュリティ関連の許可
      network.host
      security.insecure
    provenance: false                   # SLSA Provenanceメタデータ（v4+）
    sbom: false                         # SBOM生成（v4+）
```

## BuildKit高度な機能

### キャッシュ戦略

#### GitHub Actionsキャッシュ（推奨）

```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```

**特徴**:
- GitHub Actions標準キャッシュ（無料枠10GB）
- `mode=max`: 全中間レイヤーをキャッシュ（最大再利用）
- `mode=min`: 最終レイヤーのみ（ストレージ節約）

#### レジストリキャッシュ

```yaml
cache-from: type=registry,ref=ghcr.io/user/repo:buildcache
cache-to: type=registry,ref=ghcr.io/user/repo:buildcache,mode=max
```

**特徴**:
- マルチランナー環境で共有可能
- ストレージ制限なし
- 認証が必要

#### ローカルキャッシュ

```yaml
cache-from: type=local,src=/tmp/.buildx-cache
cache-to: type=local,dest=/tmp/.buildx-cache,mode=max
```

**特徴**:
- セルフホストランナー向け
- 永続ストレージが必要

#### インラインキャッシュ

```yaml
cache-from: type=registry,ref=ghcr.io/user/repo:latest
cache-to: type=inline
```

**特徴**:
- イメージ自体にキャッシュを埋め込み
- 追加のストレージ不要
- イメージサイズが増加

### マルチステージビルド最適化

```yaml
- name: Build with specific target
  uses: docker/build-push-action@v5
  with:
    context: .
    target: production              # マルチステージの特定ステージのみビルド
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Dockerfile例**:
```dockerfile
# ベースステージ
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# 開発依存関係インストール
FROM base AS development
RUN npm ci

# ビルドステージ
FROM development AS build
COPY . .
RUN npm run build

# 本番ステージ（最終イメージ）
FROM base AS production
RUN npm ci --production
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

### Secretsのセキュアな使用

```yaml
- name: Build with secrets
  uses: docker/build-push-action@v5
  with:
    context: .
    secrets: |
      GIT_AUTH_TOKEN=${{ secrets.GIT_TOKEN }}
      NPM_TOKEN=${{ secrets.NPM_TOKEN }}
```

**Dockerfile内での使用**:
```dockerfile
# マウント型Secret（ビルド後にイメージに残らない）
RUN --mount=type=secret,id=GIT_AUTH_TOKEN \
    git config --global url."https://$(cat /run/secrets/GIT_AUTH_TOKEN)@github.com/".insteadOf "https://github.com/"

RUN --mount=type=secret,id=NPM_TOKEN \
    echo "//registry.npmjs.org/:_authToken=$(cat /run/secrets/NPM_TOKEN)" > ~/.npmrc && \
    npm ci
```

### SSHエージェント転送

```yaml
- name: Build with SSH
  uses: docker/build-push-action@v5
  with:
    context: .
    ssh: default=${{ env.SSH_AUTH_SOCK }}
```

**Dockerfile内での使用**:
```dockerfile
# プライベートリポジトリからのclone
RUN --mount=type=ssh \
    git clone git@github.com:user/private-repo.git
```

## マルチプラットフォームビルド

### QEMUセットアップ（必須）

```yaml
steps:
  - name: Set up QEMU
    uses: docker/setup-qemu-action@v3

  - name: Set up Docker Buildx
    uses: docker/setup-buildx-action@v3

  - name: Build multi-platform
    uses: docker/build-push-action@v5
    with:
      context: .
      platforms: linux/amd64,linux/arm64,linux/arm/v7
      push: true
      tags: ghcr.io/user/repo:latest
```

### 対応プラットフォーム

| プラットフォーム | 説明 | 用途 |
|----------------|------|------|
| `linux/amd64` | x86_64アーキテクチャ | 標準サーバー、PC |
| `linux/arm64` | ARM 64bit | ARM64サーバー、Apple Silicon |
| `linux/arm/v7` | ARM 32bit v7 | Raspberry Pi等 |
| `linux/arm/v6` | ARM 32bit v6 | 古いRaspberry Pi |
| `linux/386` | x86 32bit | レガシーシステム |
| `linux/ppc64le` | PowerPC 64bit LE | IBM Power |
| `linux/s390x` | IBM System z | メインフレーム |

### プラットフォーム別条件分岐

```dockerfile
# プラットフォーム別のパッケージインストール
FROM --platform=$BUILDPLATFORM node:20-alpine AS base
ARG TARGETPLATFORM
ARG BUILDPLATFORM

RUN echo "Building for $TARGETPLATFORM on $BUILDPLATFORM"

# ARM64の場合の最適化例
RUN if [ "$TARGETPLATFORM" = "linux/arm64" ]; then \
      # ARM64専用の最適化 \
      apk add --no-cache some-arm64-package; \
    fi
```

### マルチプラットフォームビルド最適化

```yaml
- name: Build multi-platform (optimized)
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    # プラットフォーム間でキャッシュ共有
    build-args: |
      BUILDKIT_MULTI_PLATFORM=1
```

## メタデータとタグ生成

### docker/metadata-actionとの連携

```yaml
- name: Extract metadata
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: |
      ghcr.io/${{ github.repository }}
      docker.io/${{ github.repository }}
    tags: |
      # ブランチベース
      type=ref,event=branch
      # PRベース
      type=ref,event=pr
      # セマンティックバージョニング
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=semver,pattern={{major}}
      # Git SHA
      type=sha,prefix=sha-
      # 日付ベース
      type=schedule,pattern={{date 'YYYYMMDD'}}
      # 手動: latestタグ（mainブランチのみ）
      type=raw,value=latest,enable={{is_default_branch}}
    labels: |
      org.opencontainers.image.title=${{ github.event.repository.name }}
      org.opencontainers.image.description=${{ github.event.repository.description }}
      org.opencontainers.image.url=${{ github.event.repository.html_url }}
      org.opencontainers.image.source=${{ github.event.repository.clone_url }}
      org.opencontainers.image.version=${{ steps.meta.outputs.version }}
      org.opencontainers.image.created=${{ steps.meta.outputs.created }}
      org.opencontainers.image.revision=${{ github.sha }}
      org.opencontainers.image.licenses=${{ github.event.repository.license.spdx_id }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
```

### 条件付きプッシュ

```yaml
- name: Build and conditionally push
  uses: docker/build-push-action@v5
  with:
    context: .
    # PRではビルドのみ、mainブランチでプッシュ
    push: ${{ github.event_name != 'pull_request' }}
    # またはブランチ別条件
    push: ${{ github.ref == 'refs/heads/main' }}
```

## 出力とエクスポート

### ローカルDockerデーモンへロード

```yaml
- name: Build and load
  uses: docker/build-push-action@v5
  with:
    context: .
    load: true              # ローカルにロード（pushと排他）
    tags: myapp:test
```

### tarアーカイブへエクスポート

```yaml
- name: Build and export
  uses: docker/build-push-action@v5
  with:
    context: .
    outputs: type=docker,dest=/tmp/myimage.tar
    tags: myapp:latest

- name: Upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: docker-image
    path: /tmp/myimage.tar
```

### OCI形式でエクスポート

```yaml
- name: Build OCI image
  uses: docker/build-push-action@v5
  with:
    context: .
    outputs: type=oci,dest=/tmp/myimage-oci.tar
```

## パフォーマンス最適化

### 並列ビルド

```yaml
# 複数イメージの並列ビルド
jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: docker/build-push-action@v5
        with:
          context: ./backend
          tags: ghcr.io/user/backend:latest

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: docker/build-push-action@v5
        with:
          context: ./frontend
          tags: ghcr.io/user/frontend:latest
```

### BuildKitログの最適化

```yaml
- name: Build with plain logs
  uses: docker/build-push-action@v5
  with:
    context: .
    # プレーンログ（デバッグ用）
    build-args: |
      BUILDKIT_PROGRESS=plain
```

### no-cache使用（完全リビルド）

```yaml
- name: Build without cache
  uses: docker/build-push-action@v5
  with:
    context: .
    no-cache: true          # キャッシュ無効化
    pull: true              # ベースイメージを強制pull
```

## トラブルシューティング

### ビルドログの詳細出力

```yaml
- name: Build with verbose logs
  uses: docker/build-push-action@v5
  with:
    context: .
    build-args: |
      BUILDKIT_PROGRESS=plain
```

### キャッシュのクリア

```yaml
# キャッシュを使わずビルド
- name: Build without cache
  uses: docker/build-push-action@v5
  with:
    context: .
    no-cache: true
    pull: true
```

### プラットフォーム別デバッグ

```yaml
- name: Build single platform for debug
  uses: docker/build-push-action@v5
  with:
    context: .
    platforms: linux/amd64  # 1プラットフォームのみ
    load: true              # ローカルロードでテスト
```

## ベストプラクティス

### レイヤーキャッシュ最適化

**Dockerfileの順序**:
```dockerfile
# 1. ベースイメージ
FROM node:20-alpine

# 2. 変更の少ない依存関係ファイル
WORKDIR /app
COPY package*.json ./

# 3. 依存関係インストール（キャッシュ効果大）
RUN npm ci

# 4. ソースコードコピー（変更頻度高）
COPY . .

# 5. ビルド
RUN npm run build

# 6. 起動コマンド
CMD ["node", "dist/index.js"]
```

### セキュリティ

```yaml
- name: Secure build
  uses: docker/build-push-action@v5
  with:
    context: .
    # Secretsはマウント型で使用（イメージに残らない）
    secrets: |
      NPM_TOKEN=${{ secrets.NPM_TOKEN }}
    # Provenanceメタデータを含める（v4+）
    provenance: true
    # SBOMを生成（v4+）
    sbom: true
    # セキュリティスキャン前提
    push: false
    load: true
```

### マルチレジストリ対応

```yaml
- name: Build and push to multiple registries
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:latest
      docker.io/${{ secrets.DOCKERHUB_USERNAME }}/${{ github.event.repository.name }}:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## 参考資料

- [docker/build-push-action 公式ドキュメント](https://github.com/docker/build-push-action)
- [BuildKit ドキュメント](https://docs.docker.com/build/buildkit/)
- [docker/metadata-action](https://github.com/docker/metadata-action)
- [マルチプラットフォームビルド](https://docs.docker.com/build/building/multi-platform/)
