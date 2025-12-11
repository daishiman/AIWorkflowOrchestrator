# Dockerfile 最適化

## 概要

効率的なDockerfileは、小さなイメージサイズ、高速なビルド、
セキュアな実行環境を実現します。

## ベースイメージ選択

### Node.js イメージ比較

| イメージ         | サイズ | 用途             |
| ---------------- | ------ | ---------------- |
| node:20          | ~1GB   | 開発、フルツール |
| node:20-slim     | ~200MB | 本番、基本機能   |
| node:20-alpine   | ~180MB | 本番、最小構成   |
| node:20-bookworm | ~400MB | glibc必要時      |

### 選択基準

```
ネイティブモジュールあり？
├─ Yes → glibcが必要か？
│   ├─ Yes → node:20-slim
│   └─ No → node:20-alpine
└─ No → node:20-alpine
```

### 推奨

```dockerfile
# 本番環境向け
FROM node:20-alpine

# ネイティブモジュールが必要な場合
FROM node:20-slim

# 開発環境向け（フルツール必要時のみ）
FROM node:20
```

## レイヤーキャッシュ

### 基本原則

```
変更頻度: 低 → 高

1. システムパッケージ（ほぼ変更なし）
2. 依存関係（時々変更）
3. ソースコード（頻繁に変更）
```

### 悪い例

```dockerfile
# ❌ ソースコードの変更で依存関係も再インストール
COPY . .
RUN pnpm install
RUN pnpm build
```

### 良い例

```dockerfile
# ✅ 依存関係ファイルを先にコピー
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ソースコードは後からコピー
COPY . .
RUN pnpm build
```

## パッケージインストール

### APK（Alpine）

```dockerfile
# ✅ キャッシュを削除してサイズ削減
RUN apk add --no-cache \
    python3 \
    make \
    g++
```

### APT（Debian/Ubuntu）

```dockerfile
# ✅ キャッシュを削除
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ && \
    rm -rf /var/lib/apt/lists/*
```

## RUN命令の最適化

### 悪い例

```dockerfile
# ❌ 各RUNが別レイヤー = イメージサイズ増大
RUN apk add python3
RUN apk add make
RUN apk add g++
```

### 良い例

```dockerfile
# ✅ 1つのRUNにまとめる
RUN apk add --no-cache \
    python3 \
    make \
    g++
```

### 一時ファイルの削除

```dockerfile
# ビルドに必要なパッケージを追加→使用→削除
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ && \
    pnpm install --frozen-lockfile && \
    apk del .build-deps
```

## COPY vs ADD

### COPY（推奨）

```dockerfile
# ✅ 明示的で予測可能
COPY package.json ./
COPY src/ ./src/
```

### ADD（特殊な場合のみ）

```dockerfile
# リモートURLからダウンロード
ADD https://example.com/file.tar.gz /app/

# tarファイルの自動展開
ADD archive.tar.gz /app/
```

### 推奨

```dockerfile
# 基本的にはCOPYを使用
COPY package.json pnpm-lock.yaml ./
COPY src/ ./src/

# URLからのダウンロードはcurlを使用（より明示的）
RUN curl -o file.tar.gz https://example.com/file.tar.gz && \
    tar xzf file.tar.gz && \
    rm file.tar.gz
```

## .dockerignore

### 必須の除外項目

```
# 依存関係
node_modules

# バージョン管理
.git
.gitignore

# 環境ファイル
.env
.env.*
!.env.example

# ビルド成果物
dist
build
.next
out

# 開発ツール
.vscode
.idea
*.log

# テスト
coverage
__tests__
*.test.ts
*.spec.ts

# ドキュメント
*.md
!README.md
docs

# Docker関連
Dockerfile*
docker-compose*
.docker
```

## 環境変数

### ビルド時変数（ARG）

```dockerfile
# ビルド時に値を渡す
ARG NODE_ENV=production
ARG APP_VERSION=1.0.0

# 環境変数として設定
ENV NODE_ENV=${NODE_ENV}
ENV APP_VERSION=${APP_VERSION}
```

### 実行時変数（ENV）

```dockerfile
# 固定値
ENV PORT=3000
ENV NODE_ENV=production

# デフォルト値（実行時に上書き可能）
ENV LOG_LEVEL=info
```

### シークレットの取り扱い

```dockerfile
# ❌ イメージにシークレットを含めない
ENV API_KEY=secret123

# ✅ 実行時に渡す
# docker run -e API_KEY=secret123 myapp
```

## ワーキングディレクトリ

```dockerfile
# ✅ WORKDIRを使用
WORKDIR /app

# ❌ RUN cd は避ける（スコープが限定される）
RUN cd /app && pnpm install
```

## Node.js 固有の最適化

### pnpm 設定

```dockerfile
# pnpmのインストール（corepack使用）
RUN corepack enable && corepack prepare pnpm@latest --activate

# 依存関係インストール
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
```

### pnpm 設定

```dockerfile
# 依存関係インストール
COPY package.json package-lock.json ./
RUN pnpm ci --only=production
```

### Next.js 固有

```dockerfile
# スタンドアロン出力の有効化
# next.config.js: output: 'standalone'

# スタンドアロンビルド
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

CMD ["node", "server.js"]
```

## 完全な例

### Node.js API

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# 依存関係インストール
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ビルド
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# 本番
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

USER appuser
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

## ビルドコマンド

```bash
# 基本ビルド
docker build -t myapp:latest .

# ビルド引数を渡す
docker build \
  --build-arg NODE_ENV=production \
  --build-arg APP_VERSION=1.2.3 \
  -t myapp:1.2.3 .

# キャッシュなしでビルド
docker build --no-cache -t myapp:latest .

# 特定のステージまでビルド
docker build --target builder -t myapp:builder .
```

## ベストプラクティスチェックリスト

- [ ] 公式ベースイメージを使用
- [ ] 適切なタグを指定（latestは避ける）
- [ ] マルチステージビルドを使用
- [ ] レイヤーキャッシュを活用
- [ ] .dockerignoreを設定
- [ ] 非rootユーザーで実行
- [ ] 不要なパッケージを削除
- [ ] シークレットをイメージに含めない
