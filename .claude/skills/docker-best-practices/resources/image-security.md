# イメージセキュリティ

## 概要

コンテナセキュリティは、イメージのビルド時点から始まります。
このドキュメントでは、セキュアなイメージを構築するためのベストプラクティスを説明します。

## 非rootユーザー

### なぜ重要か

rootユーザーでコンテナを実行すると：
- コンテナ脱出時のリスク増大
- ホストシステムへの影響範囲拡大
- 最小権限の原則に違反

### 実装方法

#### Alpine

```dockerfile
# グループとユーザーを作成
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# ファイルの所有者を設定
COPY --chown=appuser:appgroup . .

# ユーザーを切り替え
USER appuser
```

#### Debian/Ubuntu

```dockerfile
# グループとユーザーを作成
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/sh appuser

# ファイルの所有者を設定
COPY --chown=appuser:appgroup . .

# ユーザーを切り替え
USER appuser
```

### 権限設定

```dockerfile
# 必要なディレクトリの権限を設定
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app/data && \
    chmod 755 /app/data

# 書き込み可能なディレクトリを限定
VOLUME ["/app/data"]
```

## ベースイメージのセキュリティ

### 信頼できるイメージの選択

```dockerfile
# ✅ 公式イメージを使用
FROM node:20-alpine

# ✅ 検証済みのイメージを使用
FROM docker.io/library/node:20-alpine

# ❌ 出所不明のイメージは避ける
FROM random-user/node:latest
```

### バージョン固定

```dockerfile
# ✅ 具体的なバージョンを指定
FROM node:20.10.0-alpine3.18

# ⚠️ マイナーバージョンまで指定（許容）
FROM node:20.10-alpine

# ❌ latestは避ける
FROM node:latest
```

### ダイジェストによる固定

```dockerfile
# 最も確実な方法（イメージの内容が保証される）
FROM node:20-alpine@sha256:abc123def456...
```

## 脆弱性スキャン

### Docker Scout

```bash
# イメージのスキャン
docker scout cves myapp:latest

# 詳細なレポート
docker scout cves --format sarif myapp:latest

# 推奨修正
docker scout recommendations myapp:latest
```

### Trivy

```bash
# インストール
brew install trivy

# イメージスキャン
trivy image myapp:latest

# 重大な脆弱性のみ
trivy image --severity CRITICAL,HIGH myapp:latest

# CI/CD用（失敗条件付き）
trivy image --exit-code 1 --severity CRITICAL myapp:latest
```

### GitHub Actions での自動スキャン

```yaml
name: Container Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t myapp:test .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:test'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

## シークレット管理

### 絶対にしてはいけないこと

```dockerfile
# ❌ ENVでシークレットを設定
ENV API_KEY=sk-xxxxx
ENV DATABASE_PASSWORD=secret123

# ❌ ARGでシークレットを渡す（履歴に残る）
ARG SECRET_KEY
ENV SECRET_KEY=${SECRET_KEY}

# ❌ COPYでシークレットファイルを含める
COPY .env /app/.env
COPY secrets/ /app/secrets/
```

### 正しいアプローチ

```dockerfile
# ✅ 実行時に環境変数として渡す
# docker run -e API_KEY=xxx myapp

# ✅ Docker secretsを使用（Swarm/Compose）
# docker secret create api_key ./api_key.txt
```

### BuildKit シークレット

```dockerfile
# syntax=docker/dockerfile:1

# ビルド時のみ使用するシークレット（イメージに残らない）
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) \
    pnpm install

# ビルドコマンド
# DOCKER_BUILDKIT=1 docker build --secret id=npm_token,src=./npm_token.txt .
```

## ネットワークセキュリティ

### 最小限のポート公開

```dockerfile
# 必要なポートのみ公開
EXPOSE 3000

# ❌ 不要なポートは公開しない
# EXPOSE 22 5432 27017
```

### ヘルスチェック

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 最小イメージ

### Distroless

```dockerfile
# ビルドステージ
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm ci --only=production
COPY . .
RUN pnpm run build

# 本番ステージ（最小イメージ）
FROM gcr.io/distroless/nodejs20-debian12
COPY --from=builder /app/dist /app
COPY --from=builder /app/node_modules /app/node_modules
WORKDIR /app
CMD ["index.js"]
```

### Scratch（静的バイナリ用）

```dockerfile
# Goアプリケーションの例
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o /app/main

# 最小イメージ
FROM scratch
COPY --from=builder /app/main /main
ENTRYPOINT ["/main"]
```

## ファイルシステムセキュリティ

### 読み取り専用ルートファイルシステム

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:latest
    read_only: true
    tmpfs:
      - /tmp
      - /app/cache
```

```bash
# docker run
docker run --read-only --tmpfs /tmp myapp:latest
```

### ファイル権限

```dockerfile
# 実行ファイルに必要最小限の権限
RUN chmod 500 /app/entrypoint.sh

# 設定ファイルは読み取り専用
RUN chmod 400 /app/config/*

# ログディレクトリは書き込み可能
RUN chmod 700 /app/logs
```

## セキュリティチェックリスト

### ビルド時

- [ ] 公式/検証済みベースイメージを使用
- [ ] バージョンを固定
- [ ] 非rootユーザーを作成
- [ ] 不要なパッケージを削除
- [ ] シークレットをイメージに含めない
- [ ] .dockerignoreで機密ファイルを除外

### スキャン

- [ ] 脆弱性スキャンを実施
- [ ] CRITICAL/HIGHの脆弱性を解消
- [ ] CI/CDに自動スキャンを組み込み

### 実行時

- [ ] 非rootユーザーで実行
- [ ] 読み取り専用ファイルシステム（可能な場合）
- [ ] 最小限のポートを公開
- [ ] リソース制限を設定

## トラブルシューティング

### 権限エラー

**症状**: ファイル書き込みでpermission denied

**対応**:
```dockerfile
# 書き込み先の権限を設定
RUN mkdir -p /app/data && chown appuser:appgroup /app/data
```

### パッケージの脆弱性

**症状**: スキャンで脆弱性検出

**対応**:
```dockerfile
# ベースイメージを更新
FROM node:20-alpine

# パッケージを更新
RUN apk upgrade --no-cache
```

### 実行時のシークレットエラー

**症状**: 環境変数が設定されていない

**対応**:
```bash
# 実行時に渡す
docker run -e API_KEY=$API_KEY myapp

# ファイルから読み込み
docker run --env-file .env myapp
```
