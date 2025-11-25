# ローカル開発環境

## 概要

docker-composeを使用したローカル開発環境の構築方法を説明します。
効率的な開発体験と本番環境との一貫性を両立します。

## docker-compose 基本

### 基本構成

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
```

### コマンド

```bash
# 起動
docker compose up

# バックグラウンド起動
docker compose up -d

# 再ビルドして起動
docker compose up --build

# 停止
docker compose down

# 停止してボリュームも削除
docker compose down -v

# ログ確認
docker compose logs -f app

# コンテナに入る
docker compose exec app sh
```

## 開発環境パターン

### パターン1: ホットリロード付き開発

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - WATCHPACK_POLLING=true  # ファイル監視（Docker環境用）
    volumes:
      - .:/app
      - /app/node_modules  # node_modulesはコンテナ内のものを使用
    command: pnpm dev
```

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 依存関係インストール
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# ソースコードはボリュームマウント
# COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

### パターン2: フルスタック開発

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: pnpm dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### パターン3: 開発・本番分離

```yaml
# docker-compose.yml (共通)
version: '3.8'

services:
  app:
    build:
      context: .
      target: ${BUILD_TARGET:-development}
    ports:
      - "3000:3000"
```

```yaml
# docker-compose.dev.yml (開発用オーバーライド)
version: '3.8'

services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: pnpm dev
```

```yaml
# docker-compose.prod.yml (本番用オーバーライド)
version: '3.8'

services:
  app:
    build:
      target: runner
    environment:
      - NODE_ENV=production
```

**使用方法**:
```bash
# 開発
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# 本番（テスト用）
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 環境変数管理

### .env ファイル

```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env.local
```

```bash
# .env.local
DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
REDIS_URL=redis://redis:6379
API_KEY=dev-api-key
```

### 環境ごとの分離

```
.env              # 共通（バージョン管理対象）
.env.local        # ローカル（バージョン管理対象外）
.env.production   # 本番参照用（シークレットなし）
```

## ボリュームパターン

### ソースコードのマウント

```yaml
volumes:
  # ソースコードをマウント（ホットリロード用）
  - .:/app
  # node_modulesはコンテナ内のものを使用
  - /app/node_modules
```

### データの永続化

```yaml
services:
  db:
    volumes:
      # 名前付きボリューム（永続化）
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 初期化スクリプト

```yaml
services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data
      # 初期化SQL
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

## ヘルスチェック

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

## ネットワーク

### カスタムネットワーク

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true  # 外部からアクセス不可
```

## 便利なツール

### pgAdmin（PostgreSQL GUI）

```yaml
services:
  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "8080:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    depends_on:
      - db
```

### Redis Commander

```yaml
services:
  redis-commander:
    image: rediscommander/redis-commander:latest
    ports:
      - "8081:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379
    depends_on:
      - redis
```

### Mailhog（メールテスト）

```yaml
services:
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
```

## Makefile 統合

```makefile
# Makefile

.PHONY: dev up down logs shell db-shell

# 開発サーバー起動
dev:
	docker compose up

# バックグラウンド起動
up:
	docker compose up -d

# 停止
down:
	docker compose down

# ログ確認
logs:
	docker compose logs -f app

# アプリコンテナに入る
shell:
	docker compose exec app sh

# DBコンテナに入る
db-shell:
	docker compose exec db psql -U postgres -d myapp

# 再ビルド
rebuild:
	docker compose up --build

# クリーン（ボリュームも削除）
clean:
	docker compose down -v
	docker system prune -f

# マイグレーション
migrate:
	docker compose exec app pnpm db:migrate

# シード
seed:
	docker compose exec app pnpm db:seed
```

## トラブルシューティング

### ファイル変更が反映されない

**症状**: ホットリロードが動作しない

**対応**:
```yaml
environment:
  - WATCHPACK_POLLING=true  # webpack
  - CHOKIDAR_USEPOLLING=true  # chokidar
```

### node_modules の問題

**症状**: 依存関係エラー

**対応**:
```bash
# ボリュームを削除して再ビルド
docker compose down -v
docker compose up --build
```

### ポートの競合

**症状**: ポートが使用中エラー

**対応**:
```bash
# 使用中のポートを確認
lsof -i :3000

# ポートを変更
ports:
  - "3001:3000"
```

### パーミッションエラー

**症状**: ファイル書き込みエラー

**対応**:
```yaml
# ユーザーIDを合わせる
user: "${UID:-1000}:${GID:-1000}"
```

## ベストプラクティス

### すべきこと

1. **本番と同じベースイメージ**
   - 開発と本番で同じNodeバージョン

2. **データの永続化**
   - 名前付きボリュームを使用

3. **ヘルスチェック**
   - 依存サービスの起動順序を制御

### 避けるべきこと

1. **本番の認証情報**
   - ❌ 本番のAPIキーをローカルで使用
   - ✅ 開発用の認証情報を使用

2. **不要なサービス**
   - ❌ 使わないサービスを起動
   - ✅ 必要なサービスのみ

3. **大きなボリューム**
   - ❌ node_modulesをホストにマウント
   - ✅ 匿名ボリュームを使用
