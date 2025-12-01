# マルチステージビルド

## 概要

マルチステージビルドは、ビルド環境と実行環境を分離することで、
最終イメージのサイズを大幅に削減するテクニックです。

## 基本概念

### 従来のビルド

```
ビルドツール + 依存関係 + ソースコード + 成果物
= 大きなイメージ（1GB+）
```

### マルチステージビルド

```
ステージ1: ビルドツール + 依存関係 + ソースコード → 成果物
ステージ2: 実行環境 + 成果物のみ
= 小さなイメージ（100-300MB）
```

## 基本構文

```dockerfile
# ビルドステージ
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN pnpm ci && pnpm run build

# 実行ステージ
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

## パターン

### パターン1: Node.js API

```dockerfile
# syntax=docker/dockerfile:1

# =====================================
# ベースステージ
# =====================================
FROM node:20-alpine AS base
WORKDIR /app
# pnpmを有効化
RUN corepack enable && corepack prepare pnpm@latest --activate

# =====================================
# 依存関係ステージ
# =====================================
FROM base AS deps
# ネイティブモジュールビルドに必要な場合
RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# =====================================
# ビルドステージ
# =====================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 本番用依存関係のみ再インストール
RUN pnpm install --frozen-lockfile --prod

# =====================================
# 実行ステージ
# =====================================
FROM base AS runner
ENV NODE_ENV=production

# セキュリティ: 非rootユーザー
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# 必要なファイルのみコピー
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

USER appuser
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### パターン2: Next.js

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# =====================================
# 依存関係
# =====================================
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# =====================================
# ビルド
# =====================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js テレメトリを無効化
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && pnpm build

# =====================================
# 実行（スタンドアロン）
# =====================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# スタンドアロン出力をコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**注意**: Next.js設定が必要

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
};
```

### パターン3: TypeScript + esbuild

```dockerfile
# syntax=docker/dockerfile:1

# =====================================
# ビルドステージ
# =====================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

# esbuildでバンドル（依存関係を含む）
RUN pnpm exec esbuild src/index.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile=dist/index.js

# =====================================
# 実行ステージ（最小）
# =====================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# バンドルされた単一ファイルのみコピー
COPY --from=builder --chown=appuser:nodejs /app/dist/index.js ./

USER appuser
EXPOSE 3000

CMD ["node", "index.js"]
```

### パターン4: モノレポ（Turborepo）

```dockerfile
# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable

# =====================================
# プルーニング
# =====================================
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo

COPY . .
RUN turbo prune --scope=@myapp/api --docker

# =====================================
# 依存関係
# =====================================
FROM base AS deps
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# =====================================
# ビルド
# =====================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build --filter=@myapp/api

# =====================================
# 実行
# =====================================
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules

USER appuser
CMD ["node", "dist/index.js"]
```

## 外部イメージからのコピー

```dockerfile
# 他のイメージから直接コピー
COPY --from=nginx:alpine /etc/nginx/nginx.conf /etc/nginx/

# 公開イメージのバイナリを使用
COPY --from=busybox:musl /bin/busybox /bin/busybox
```

## サイズ比較

### 実際の例

| アプリ | シングルステージ | マルチステージ | 削減率 |
|-------|-----------------|---------------|--------|
| Node.js API | 1.1GB | 180MB | 84% |
| Next.js | 1.4GB | 250MB | 82% |
| TypeScript Bundle | 800MB | 120MB | 85% |

## デバッグ

### 中間ステージのビルド

```bash
# 特定のステージまでビルド
docker build --target builder -t myapp:builder .

# 中間ステージに入って確認
docker run -it myapp:builder sh
```

### ステージの確認

```bash
# イメージの履歴を確認
docker history myapp:latest

# 各レイヤーのサイズを確認
docker inspect myapp:latest | jq '.[0].RootFS.Layers'
```

## ベストプラクティス

### すべきこと

1. **ベースステージを共有**
   ```dockerfile
   FROM node:20-alpine AS base
   # 共通設定

   FROM base AS deps
   FROM base AS builder
   FROM base AS runner
   ```

2. **本番依存関係のみ含める**
   ```dockerfile
   RUN pnpm install --frozen-lockfile --prod
   ```

3. **最小限のファイルをコピー**
   ```dockerfile
   COPY --from=builder /app/dist ./dist
   # node_modulesは本番用のみ
   ```

### 避けるべきこと

1. **開発依存関係を含める**
   - テストツール
   - linter
   - TypeScript

2. **ソースコードを含める**
   - 必要なのはビルド成果物のみ

3. **不要なファイルをコピー**
   - README、ドキュメント
   - 設定ファイル（不要なもの）

## トラブルシューティング

### ビルドが失敗する

**症状**: 中間ステージでエラー

**対応**:
```bash
# 特定ステージまでビルドして確認
docker build --target deps -t debug .
docker run -it debug sh
```

### ファイルが見つからない

**症状**: COPYでファイルが見つからない

**対応**:
```dockerfile
# ステージでファイルの存在を確認
RUN ls -la /app/dist
```

### イメージが大きい

**症状**: マルチステージでも大きい

**対応**:
1. 本番依存関係のみか確認
2. node_modulesの不要なファイルを確認
3. ベースイメージを見直し
