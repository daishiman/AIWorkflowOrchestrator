# CONV-04-01: Drizzle ORM セットアップ

## 概要

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | CONV-04-01                |
| タスク名 | Drizzle ORM セットアップ  |
| 依存     | CONV-03-02                |
| 規模     | 小                        |
| 出力場所 | `packages/shared/src/db/` |

## 目的

libSQL/Tursoと統合するDrizzle ORMの基盤設定を行う。
すべてのデータベーステーブル実装（CONV-04-02〜06）の基盤となる。

## 成果物

### 1. 依存パッケージインストール

```bash
# packages/shared ディレクトリで実行
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

### 2. Drizzle設定ファイル

```typescript
// packages/shared/drizzle.config.ts

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  driver: "libsql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### 3. データベースクライアント

```typescript
// packages/shared/src/db/client.ts

import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import * as schema from "./schema";

/**
 * データベース接続設定
 */
export interface DatabaseConfig {
  readonly url: string;
  readonly authToken?: string;
  readonly syncUrl?: string; // Turso embedded replica用
  readonly syncInterval?: number;
}

/**
 * デフォルト設定
 */
const defaultConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL || "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
};

/**
 * libSQLクライアントインスタンス
 */
let libsqlClient: Client | null = null;

/**
 * libSQLクライアント取得
 */
export const getLibSQLClient = (
  config: DatabaseConfig = defaultConfig,
): Client => {
  if (!libsqlClient) {
    libsqlClient = createClient({
      url: config.url,
      authToken: config.authToken,
      syncUrl: config.syncUrl,
      syncInterval: config.syncInterval,
    });
  }
  return libsqlClient;
};

/**
 * Drizzle ORMインスタンス
 */
export const db = drizzle(getLibSQLClient(), { schema });

/**
 * データベース型（スキーマ付き）
 */
export type Database = typeof db;

/**
 * トランザクション実行
 */
export const withTransaction = async <T>(
  fn: (tx: Database) => Promise<T>,
): Promise<T> => {
  return db.transaction(async (tx) => {
    return fn(tx as unknown as Database);
  });
};

/**
 * データベース接続クローズ
 */
export const closeDatabase = async (): Promise<void> => {
  if (libsqlClient) {
    libsqlClient.close();
    libsqlClient = null;
  }
};

/**
 * ヘルスチェック
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const client = getLibSQLClient();
    await client.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
};

/**
 * マイグレーション実行（開発用）
 */
export const runMigrations = async (): Promise<void> => {
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  await migrate(db, { migrationsFolder: "./drizzle" });
};
```

### 4. 基本スキーマ定義（共通カラム）

```typescript
// packages/shared/src/db/schema/common.ts

import { sql } from "drizzle-orm";
import { text, integer } from "drizzle-orm/sqlite-core";

/**
 * UUID主キー
 */
export const uuidPrimaryKey = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

/**
 * タイムスタンプカラム
 */
export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

/**
 * メタデータカラム（JSON）
 */
export const metadataColumn = () =>
  text("metadata", { mode: "json" })
    .$type<Record<string, unknown>>()
    .default({});

/**
 * 論理削除カラム
 */
export const softDelete = {
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
};
```

### 5. スキーマインデックス

```typescript
// packages/shared/src/db/schema/index.ts

// 共通エクスポート
export * from "./common";

// テーブル定義（後続タスクで追加）
// export * from './files';        // CONV-04-02
// export * from './chunks';       // CONV-04-03
// export * from './graph';        // CONV-04-05
```

### 6. マイグレーションスクリプト

```typescript
// packages/shared/src/db/migrate.ts

import { db, runMigrations, closeDatabase } from "./client";

const main = async () => {
  console.log("Running migrations...");

  try {
    await runMigrations();
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

main();
```

### 7. package.jsonスクリプト追加

```json
// packages/shared/package.json に追加
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop"
  }
}
```

### 8. 環境変数定義

```typescript
// packages/shared/src/db/env.ts

import { z } from "zod";

/**
 * データベース環境変数スキーマ
 */
export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).default("file:local.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  DATABASE_SYNC_URL: z.string().url().optional(),
  DATABASE_SYNC_INTERVAL: z.coerce.number().int().min(1000).optional(),
});

/**
 * 環境変数検証
 */
export const validateDatabaseEnv = () => {
  const result = databaseEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid database environment variables:");
    console.error(result.error.format());
    throw new Error("Database environment validation failed");
  }

  return result.data;
};

/**
 * 型安全な環境変数取得
 */
export const getDatabaseEnv = () => validateDatabaseEnv();
```

### 9. ユーティリティ関数

```typescript
// packages/shared/src/db/utils.ts

import { sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * COALESCE SQL関数
 */
export const coalesce = <T>(column: SQLiteColumn, defaultValue: T): SQL<T> =>
  sql`COALESCE(${column}, ${defaultValue})`;

/**
 * JSON配列長取得
 */
export const jsonArrayLength = (column: SQLiteColumn): SQL<number> =>
  sql`json_array_length(${column})`;

/**
 * 現在のUnixタイムスタンプ
 */
export const currentTimestamp = (): SQL<number> => sql`(unixepoch())`;

/**
 * ページネーションヘルパー
 */
export const paginate = (limit: number, offset: number) => ({
  limit,
  offset,
});

/**
 * バッチ処理ヘルパー
 */
export const batchProcess = async <T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>,
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
};

/**
 * 重複排除INSERT（UPSERT）
 */
export const onConflictDoNothing = () => sql`ON CONFLICT DO NOTHING`;

/**
 * 重複時更新（UPSERT）
 */
export const onConflictDoUpdate = (columns: SQLiteColumn[]) =>
  sql`ON CONFLICT DO UPDATE SET ${sql.join(
    columns.map((col) => sql`${col} = excluded.${col}`),
    sql`, `,
  )}`;
```

### 10. バレルエクスポート

```typescript
// packages/shared/src/db/index.ts

export * from "./client";
export * from "./env";
export * from "./utils";
export * from "./schema";
```

## ディレクトリ構造

```
packages/shared/
├── drizzle.config.ts           # Drizzle設定
├── drizzle/                    # マイグレーションファイル（自動生成）
└── src/db/
    ├── index.ts                # バレルエクスポート
    ├── client.ts               # DBクライアント
    ├── env.ts                  # 環境変数
    ├── utils.ts                # ユーティリティ
    ├── migrate.ts              # マイグレーションスクリプト
    └── schema/
        ├── index.ts            # スキーマエクスポート
        └── common.ts           # 共通カラム定義
```

## 受け入れ条件

- [ ] `drizzle-orm`, `@libsql/client`, `drizzle-kit` がインストールされている
- [ ] `drizzle.config.ts` が作成されている
- [ ] libSQLクライアントが正常に接続できる
- [ ] トランザクション実行関数が実装されている
- [ ] ヘルスチェック関数が実装されている
- [ ] 共通カラム（timestamps, metadata, softDelete）が定義されている
- [ ] 環境変数スキーマが定義・検証されている
- [ ] `db:generate`, `db:migrate`, `db:push`, `db:studio` スクリプトが動作する
- [ ] ユーティリティ関数（paginate, batchProcess等）が実装されている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-03-02: ファイル・変換スキーマ定義（型情報）

### このタスクに依存するもの

- CONV-04-02: files/conversions テーブル実装
- CONV-04-03: content_chunks テーブル + FTS5
- CONV-04-04: DiskANN ベクトルインデックス設定
- CONV-04-05: Knowledge Graph テーブル群
- CONV-04-06: Repository パターン実装

## 備考

- libSQLはSQLite互換だが、Tursoでのリモート同期機能を持つ
- Embedded Replicaを使用することで、ローカルSQLiteとクラウドの同期が可能
- FTS5やベクトル拡張は後続タスク（04-03, 04-04）で設定
- 本タスクではテーブル定義は行わず、基盤設定のみ実施
