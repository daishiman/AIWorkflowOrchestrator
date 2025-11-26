# Drizzle Kit コマンドリファレンス

## 基本設定

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // オプション
  verbose: true,
  strict: true,
})
```

### 設定オプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| schema | スキーマファイルのパス | `./src/db/schema/index.ts` |
| out | 出力ディレクトリ | `./drizzle` |
| dialect | データベース種類 | `postgresql`, `mysql`, `sqlite` |
| dbCredentials | 接続情報 | `{ url: '...' }` |
| verbose | 詳細ログ | `true` |
| strict | 厳格モード | `true` |

## 主要コマンド

### drizzle-kit generate

マイグレーションファイルを生成する。

```bash
# 基本
pnpm drizzle-kit generate

# 名前を指定
pnpm drizzle-kit generate --name add_user_email

# カスタム設定ファイル
pnpm drizzle-kit generate --config ./custom-drizzle.config.ts
```

**出力例**:
```
drizzle/
├── 0000_initial_schema.sql
├── 0001_add_user_email.sql
└── meta/
    ├── 0000_snapshot.json
    ├── 0001_snapshot.json
    └── _journal.json
```

### drizzle-kit migrate

マイグレーションを適用する。

```bash
# 基本
pnpm drizzle-kit migrate

# 環境を指定
DATABASE_URL=postgres://... pnpm drizzle-kit migrate
```

### drizzle-kit push

スキーマを直接データベースにプッシュする（マイグレーションファイルなし）。

```bash
# 開発環境向け
pnpm drizzle-kit push

# 強制プッシュ（注意）
pnpm drizzle-kit push --force
```

**使用場面**:
- 開発初期の素早いイテレーション
- プロトタイピング

**注意**: 本番環境では `migrate` を使用すること。

### drizzle-kit pull

既存のデータベースからスキーマを生成する。

```bash
pnpm drizzle-kit pull
```

**使用場面**:
- 既存データベースからDrizzleスキーマを生成
- リバースエンジニアリング

### drizzle-kit studio

GUIでデータベースを操作する。

```bash
pnpm drizzle-kit studio

# ポート指定
pnpm drizzle-kit studio --port 4000
```

**機能**:
- データの閲覧・編集
- SQLクエリの実行
- スキーマの確認

### drizzle-kit check

スキーマの整合性をチェックする。

```bash
pnpm drizzle-kit check
```

### drizzle-kit up

マイグレーションメタデータを最新形式にアップグレード。

```bash
pnpm drizzle-kit up
```

### drizzle-kit drop

マイグレーションを削除する。

```bash
# 対話的に選択
pnpm drizzle-kit drop
```

## package.jsonスクリプト

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:pull": "drizzle-kit pull",
    "db:studio": "drizzle-kit studio",
    "db:check": "drizzle-kit check"
  }
}
```

## 環境別設定

### 複数環境の管理

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

const env = process.env.NODE_ENV || 'development'

const configs = {
  development: {
    url: process.env.DEV_DATABASE_URL,
  },
  staging: {
    url: process.env.STAGING_DATABASE_URL,
  },
  production: {
    url: process.env.DATABASE_URL,
  },
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: configs[env],
})
```

### 環境別実行

```bash
# 開発
NODE_ENV=development pnpm db:migrate

# ステージング
NODE_ENV=staging pnpm db:migrate

# 本番
NODE_ENV=production pnpm db:migrate
```

## マイグレーションファイル

### ファイル構造

```sql
-- drizzle/0001_add_user_email.sql

-- 自動生成されたSQL
ALTER TABLE "users" ADD COLUMN "email" text NOT NULL;

-- カスタムSQL（手動追加可能）
CREATE INDEX "users_email_idx" ON "users" ("email");
```

### メタデータ

```json
// drizzle/meta/_journal.json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1700000000000,
      "tag": "0000_initial_schema",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "7",
      "when": 1700000001000,
      "tag": "0001_add_user_email",
      "breakpoints": true
    }
  ]
}
```

## カスタムマイグレーション

### データ移行を含むマイグレーション

```sql
-- drizzle/0002_migrate_data.sql

-- 1. 新カラム追加（nullable）
ALTER TABLE "users" ADD COLUMN "full_name" text;

-- 2. データ移行
UPDATE "users" SET "full_name" = "first_name" || ' ' || "last_name";

-- 3. NOT NULL制約追加
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;

-- 4. 旧カラム削除（オプション、別マイグレーションで実行推奨）
-- ALTER TABLE "users" DROP COLUMN "first_name";
-- ALTER TABLE "users" DROP COLUMN "last_name";
```

### インデックスの並列作成

```sql
-- drizzle/0003_add_index_concurrently.sql

-- CONCURRENTLY: テーブルロックなしでインデックス作成
-- 注意: トランザクション内では使用不可
CREATE INDEX CONCURRENTLY "users_email_idx" ON "users" ("email");
```

## トラブルシューティング

### 問題1: マイグレーションの不整合

```bash
# メタデータを確認
cat drizzle/meta/_journal.json

# データベースのマイグレーション状態を確認
psql -c "SELECT * FROM drizzle.__drizzle_migrations"
```

### 問題2: 生成されたSQLの修正

```bash
# マイグレーションを生成
pnpm db:generate

# 生成されたファイルを手動で編集
# drizzle/0001_xxx.sql

# 適用
pnpm db:migrate
```

### 問題3: スキーマとDBの差分確認

```bash
# push --dry-runで差分確認
pnpm drizzle-kit push --dry-run
```

## チェックリスト

### マイグレーション生成時

- [ ] スキーマ変更は正しいか？
- [ ] 生成されたSQLを確認したか？
- [ ] 破壊的変更はないか？

### 適用時

- [ ] バックアップは作成したか？
- [ ] ステージングでテストしたか？
- [ ] ロールバック手順は準備したか？
