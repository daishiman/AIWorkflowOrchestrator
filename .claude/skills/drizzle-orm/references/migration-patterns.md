# Drizzle ORM マイグレーションパターン

## 概要

DrizzleORMを使用したデータベースマイグレーションの戦略とベストプラクティス。

## drizzle-kit コマンド

### マイグレーション生成

```bash
# SQLite
pnpm drizzle-kit generate:sqlite --schema=./src/db/schema/*.ts

# PostgreSQL
pnpm drizzle-kit generate:pg --schema=./src/db/schema/*.ts

# MySQL
pnpm drizzle-kit generate:mysql --schema=./src/db/schema/*.ts
```

### マイグレーション実行

```bash
# マイグレーション適用
pnpm drizzle-kit push:sqlite
pnpm drizzle-kit push:pg
pnpm drizzle-kit push:mysql

# マイグレーション確認（ドライラン）
pnpm drizzle-kit push:sqlite --dry-run
```

### スキーマ確認

```bash
# スタジオ（GUI）
pnpm drizzle-kit studio

# スキーマの差分確認
pnpm drizzle-kit check:sqlite
```

## drizzle.config.ts

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  driver: "better-sqlite3", // or 'pg' | 'mysql2'
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;
```

## プログラマティックマイグレーション

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

// マイグレーション実行
migrate(db, { migrationsFolder: "./drizzle" });
```

## マイグレーション戦略

### 破壊的変更の回避

```sql
-- NG: カラム削除（データ消失）
ALTER TABLE users DROP COLUMN old_field;

-- OK: 段階的廃止
-- Step 1: 新カラム追加
ALTER TABLE users ADD COLUMN new_field TEXT;
-- Step 2: データ移行（アプリケーションで実施）
-- Step 3: 古いカラムをnullable化
-- Step 4: 十分な期間後に削除
```

### カラムリネーム

```sql
-- NG: 直接リネーム（一部DBで未サポート）
ALTER TABLE users RENAME COLUMN old_name TO new_name;

-- OK: 段階的変更
-- Step 1: 新カラム追加
ALTER TABLE users ADD COLUMN new_name TEXT;
-- Step 2: データコピー
UPDATE users SET new_name = old_name;
-- Step 3: アプリケーション更新
-- Step 4: 古いカラム削除
```

### インデックス追加

```sql
-- 本番環境では CONCURRENTLY を使用（PostgreSQL）
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- SQLiteではテーブルロックが発生するため、低負荷時に実施
CREATE INDEX idx_users_email ON users(email);
```

## マイグレーションファイル構造

```
drizzle/
├── 0000_initial.sql           # 初期スキーマ
├── 0001_add_users_table.sql   # ユーザーテーブル追加
├── 0002_add_posts_table.sql   # 投稿テーブル追加
├── 0003_add_index.sql         # インデックス追加
└── meta/
    └── _journal.json          # マイグレーション履歴
```

## ロールバック戦略

DrizzleORMは自動ロールバックをサポートしていないため、手動で対応:

```typescript
// マイグレーションファイルと対になるロールバックSQLを用意
// drizzle/rollback/0001_add_users_table.sql
DROP TABLE IF EXISTS users;
```

```typescript
// ロールバック実行スクリプト
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";

async function rollback(db: Database, migrationNumber: string) {
  const rollbackSql = readFileSync(
    `./drizzle/rollback/${migrationNumber}.sql`,
    "utf-8",
  );
  await db.execute(sql.raw(rollbackSql));
}
```

## 環境別マイグレーション

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

const env = process.env.NODE_ENV || "development";

const configs: Record<string, Config> = {
  development: {
    schema: "./src/db/schema/*.ts",
    out: "./drizzle",
    driver: "better-sqlite3",
    dbCredentials: { url: "./dev.db" },
  },
  production: {
    schema: "./src/db/schema/*.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: { url: process.env.DATABASE_URL! },
  },
};

export default configs[env];
```

## チェックリスト

- [ ] マイグレーションファイルはバージョン管理されている
- [ ] 本番適用前にステージング環境でテストした
- [ ] ロールバック手順を用意している
- [ ] 破壊的変更は段階的に実施する計画がある
- [ ] 大量データへの影響を考慮している
- [ ] ダウンタイムの有無を確認している
