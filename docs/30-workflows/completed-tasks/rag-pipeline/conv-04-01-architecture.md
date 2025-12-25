# CONV-04-01: Drizzle ORM アーキテクチャ設計書

## 概要

本設計書は、libSQL/Turso と Drizzle ORM を統合するデータベース基盤のアーキテクチャを定義する。
HybridRAG パイプライン構築における全データベース操作の基盤となる。

## 目的

- libSQL/Drizzle ORM 統合のアーキテクチャを明確化
- 型安全性とメンテナンス性の高いDB基盤を構築
- 後続タスク（CONV-04-02〜CONV-08）の実装指針を提供

## システムアーキテクチャ概要

### レイヤー構成図

```
┌─────────────────────────────────────────────────┐
│ アプリケーション層 (apps/web, apps/desktop)      │
│  - APIルート、IPC、ビジネスロジック               │
└─────────────────────────────────────────────────┘
                    ↓ 依存
┌─────────────────────────────────────────────────┐
│ Drizzle ORM抽象化層 (packages/shared/src/db/)   │
│  ┌───────────────┬──────────────┬──────────────┐│
│  │ client.ts     │ env.ts       │ utils.ts     ││
│  │ - DB接続管理  │ - 環境変数   │ - ヘルパー   ││
│  │ - シングルトン│ - Zod検証    │ - pagination ││
│  └───────────────┴──────────────┴──────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ schema/ - Drizzle ORMスキーマ定義            ││
│  │  - common.ts (共通カラム)                    ││
│  │  - chat-history.ts (既存)                    ││
│  │  - files.ts (将来)                           ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
                    ↓ libSQL Client
┌─────────────────────────────────────────────────┐
│ データストア層                                   │
│  ┌──────────────┬────────────────────────────┐  │
│  │ ローカルモード│ クラウドモード              │  │
│  │ file:local.db│ libsql://xxx.turso.io      │  │
│  └──────────────┴────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 設計原則の適用

1. **レイヤードアーキテクチャ準拠**
   - `packages/shared/src/db/` は独立したモジュール
   - apps層への依存は一切なし

2. **依存性逆転原則 (DIP)**
   - インターフェース（LibSQLDatabase型）に依存
   - 具体的な実装詳細は隠蔽

3. **単一責務原則 (SRP)**
   - client.ts: 接続管理のみ
   - env.ts: 環境変数検証のみ
   - utils.ts: ヘルパー関数のみ
   - errors.ts: エラー定義のみ

4. **インターフェース分離原則 (ISP)**
   - 機能ごとに独立したエクスポート
   - 必要な機能のみインポート可能

## 1. クライアント構成 (client.ts)

### 1.1 シングルトンパターン実装

libSQL/Turso は接続プーリングをサポートしないため、シングルトンパターンで単一接続を管理する。

```typescript
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { getDatabaseEnv } from "./env";
import { DatabaseError, DatabaseErrorCode } from "./errors";

// グローバルシングルトンインスタンス
let dbClient: LibSQLDatabase | null = null;

export type DatabaseConfig = {
  url?: string;
  authToken?: string;
};

/**
 * データベースクライアントを初期化（シングルトン）
 * 既に初期化済みの場合は既存インスタンスを返す
 */
export function initializeDatabase(config?: DatabaseConfig): LibSQLDatabase {
  if (dbClient) {
    return dbClient;
  }

  try {
    const env = getDatabaseEnv();
    const url = config?.url || env.DATABASE_URL;
    const authToken = config?.authToken || env.DATABASE_AUTH_TOKEN;

    const client = createClient({
      url,
      authToken,
    });

    dbClient = drizzle(client, { schema });
    return dbClient;
  } catch (error) {
    throw new DatabaseError(
      "Failed to initialize database",
      DatabaseErrorCode.CONNECTION_FAILED,
      error,
    );
  }
}

/**
 * 初期化済みデータベースクライアントを取得
 * 未初期化の場合はエラーをスロー
 */
export function getDatabase(): LibSQLDatabase {
  if (!dbClient) {
    throw new DatabaseError(
      "Database not initialized. Call initializeDatabase() first.",
      DatabaseErrorCode.CONNECTION_FAILED,
    );
  }
  return dbClient;
}

/**
 * データベース接続をクローズ（主にテスト用）
 */
export function closeDatabase(): void {
  dbClient = null;
}
```

### 1.2 接続モード判定ロジック

環境変数 `DATABASE_URL` のプレフィックスで自動判定：

| プレフィックス | モード   | authToken | 説明                    |
| -------------- | -------- | --------- | ----------------------- |
| `file:`        | ローカル | 不要      | SQLite ローカルファイル |
| `libsql:`      | クラウド | 必須      | Turso クラウドDB        |
| `http:`, `ws:` | リモート | 推奨      | libSQL リモートサーバー |

## 2. トランザクション管理方式

### 2.1 Drizzle ORM transaction API 活用

```typescript
import { getDatabase } from "./client";

export type TransactionCallback<T> = (tx: LibSQLDatabase) => Promise<T>;

/**
 * トランザクション内で処理を実行
 * エラー時は自動ロールバック
 */
export async function withTransaction<T>(
  callback: TransactionCallback<T>,
): Promise<T> {
  const db = getDatabase();

  try {
    return await db.transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error) {
    // Drizzle ORM が自動的にロールバック
    throw new DatabaseError(
      "Transaction failed",
      DatabaseErrorCode.TRANSACTION_FAILED,
      error,
    );
  }
}
```

### 2.2 トランザクションネスト対応

Drizzle ORM は**ネストトランザクションをサポートしない**。
複雑なネストが必要な場合は SAVEPOINT の使用を検討（将来課題）。

**現時点の推奨パターン**:

```typescript
// ❌ ネスト不可
await withTransaction(async (tx1) => {
  await withTransaction(async (tx2) => {
    // エラー: ネストトランザクション
  });
});

// ✅ 推奨: トランザクション内で複数操作
await withTransaction(async (tx) => {
  await tx.insert(files).values(fileData);
  await tx.insert(conversions).values(conversionData);
});
```

## 3. 接続管理方式

### 3.1 環境変数による制御 (env.ts)

```typescript
import { z } from "zod";

const DatabaseEnvSchema = z.object({
  DATABASE_URL: z.string().url().default("file:./data/local.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),
});

export type DatabaseEnv = z.infer<typeof DatabaseEnvSchema>;

/**
 * 環境変数を検証して取得
 * DATABASE_URL と TURSO_DATABASE_URL の両方をサポート
 */
export function getDatabaseEnv(): DatabaseEnv {
  const rawEnv = {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      process.env.TURSO_DATABASE_URL ||
      "file:./data/local.db",
    DATABASE_AUTH_TOKEN:
      process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
  };

  try {
    return DatabaseEnvSchema.parse(rawEnv);
  } catch (error) {
    throw new DatabaseError(
      "Invalid database environment variables",
      DatabaseErrorCode.VALIDATION_FAILED,
      error,
    );
  }
}
```

### 3.2 環境変数の優先順位

1. `DATABASE_URL` > `TURSO_DATABASE_URL`
2. `DATABASE_AUTH_TOKEN` > `TURSO_AUTH_TOKEN`
3. デフォルト値: `file:./data/local.db`

## 4. ヘルスチェック機構

### 4.1 生存確認クエリ

```typescript
import { sql } from "drizzle-orm";
import { getDatabase } from "./client";

/**
 * データベース接続の生存確認
 * SELECT 1 クエリで接続可否をチェック
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * ヘルスチェック結果の詳細情報
 */
export type HealthCheckResult = {
  healthy: boolean;
  latency: number; // ミリ秒
  error?: string;
};

export async function getHealthCheckDetails(): Promise<HealthCheckResult> {
  const start = performance.now();

  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);
    const latency = performance.now() - start;

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const latency = performance.now() - start;

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
```

### 4.2 ヘルスチェック要件

| 指標         | 目標値  | 説明                         |
| ------------ | ------- | ---------------------------- |
| レイテンシ   | < 50ms  | SELECT 1 の応答時間          |
| 成功率       | > 99.9% | 正常応答の割合               |
| タイムアウト | 5秒     | ヘルスチェックのタイムアウト |

## 5. エラーハンドリング方針

### 5.1 カスタムエラークラス (errors.ts)

```typescript
export enum DatabaseErrorCode {
  CONNECTION_FAILED = "CONNECTION_FAILED",
  QUERY_FAILED = "QUERY_FAILED",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  MIGRATION_FAILED = "MIGRATION_FAILED",
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: DatabaseErrorCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";

    // スタックトレースにcauseを含める
    if (cause instanceof Error) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  /**
   * エラーを JSON にシリアライズ
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }
}
```

### 5.2 エラー分類とハンドリング戦略

| エラー種別           | コード             | 対処方針                  |
| -------------------- | ------------------ | ------------------------- |
| 接続失敗             | CONNECTION_FAILED  | リトライ（最大3回）       |
| クエリ失敗           | QUERY_FAILED       | ログ記録 + エラー通知     |
| トランザクション失敗 | TRANSACTION_FAILED | 自動ロールバック + 再試行 |
| バリデーション失敗   | VALIDATION_FAILED  | 即座にエラー返却          |
| マイグレーション失敗 | MIGRATION_FAILED   | 手動介入が必要            |

## 6. ファイル構成

### 6.1 ディレクトリツリー

```
packages/shared/
├── src/
│   └── db/
│       ├── index.ts              # バレルエクスポート
│       ├── client.ts             # libSQLクライアント・Drizzle ORM初期化
│       ├── env.ts                # 環境変数Zodスキーマ・検証関数
│       ├── utils.ts              # ユーティリティ関数
│       ├── errors.ts             # カスタムエラークラス
│       ├── migrate.ts            # マイグレーション実行スクリプト
│       ├── schema/
│       │   ├── index.ts          # スキーマバレルエクスポート
│       │   ├── common.ts         # 共通カラム定義
│       │   └── chat-history.ts   # チャット履歴スキーマ（既存）
│       └── __tests__/
│           ├── client.test.ts    # クライアント接続テスト
│           ├── env.test.ts       # 環境変数検証テスト
│           └── utils.test.ts     # ユーティリティ関数テスト
├── drizzle/                      # マイグレーションファイル（Git管理）
│   └── migrations/
│       └── meta/
│           └── _journal.json
└── drizzle.config.ts             # Drizzle Kit設定
```

### 6.2 各ファイルの責務

| ファイル           | 責務                                   | 主要エクスポート                     |
| ------------------ | -------------------------------------- | ------------------------------------ |
| `index.ts`         | バレルエクスポート                     | 全公開API                            |
| `client.ts`        | DB接続管理、シングルトンパターン       | initializeDatabase, getDatabase      |
| `env.ts`           | 環境変数検証、Zodスキーマ              | getDatabaseEnv                       |
| `utils.ts`         | ヘルパー関数、ページネーション         | withTransaction, checkDatabaseHealth |
| `errors.ts`        | カスタムエラークラス、エラーコード定義 | DatabaseError, DatabaseErrorCode     |
| `migrate.ts`       | マイグレーション実行                   | runMigrations                        |
| `schema/common.ts` | 共通カラム定義ヘルパー                 | uuidPrimaryKey, timestamps, etc.     |

## 7. 共通カラム定義 (schema/common.ts)

### 7.1 型安全なヘルパー関数

```typescript
import { text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * UUID主キー
 * crypto.randomUUID() で生成した UUID を格納
 */
export const uuidPrimaryKey = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

/**
 * タイムスタンプカラム
 * ISO 8601 形式（YYYY-MM-DDTHH:MM:SS.sssZ）
 */
export const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%f', 'now') || 'Z')`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%f', 'now') || 'Z')`),
};

/**
 * ソフトデリート
 * NULL: 未削除、ISO 8601文字列: 削除日時
 */
export const softDelete = {
  deletedAt: text("deleted_at"),
};

/**
 * メタデータJSON
 * JSON文字列として格納、パース時にZodで検証推奨
 */
export const metadata = {
  metadata: text("metadata", { mode: "json" })
    .notNull()
    .default(sql`'{}'`),
};

/**
 * バージョン管理（楽観的ロック用）
 */
export const versionColumn = {
  version: integer("version").notNull().default(1),
};
```

### 7.2 使用例

```typescript
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { uuidPrimaryKey, timestamps, softDelete, metadata } from "./common";

export const files = sqliteTable("files", {
  ...uuidPrimaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  ...timestamps,
  ...softDelete,
  ...metadata,
});
```

## 8. マイグレーション設定

### 8.1 Drizzle Kit 設定 (drizzle.config.ts)

```typescript
import { defineConfig } from "drizzle-kit";
import { getDatabaseEnv } from "./src/db/env";

const env = getDatabaseEnv();

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
  // SQLiteのテーブル名をケバブケースに統一
  tablesFilter: ["*"],
});
```

### 8.2 マイグレーション実行スクリプト (migrate.ts)

```typescript
import { migrate } from "drizzle-orm/libsql/migrator";
import { getDatabase } from "./client";
import { DatabaseError, DatabaseErrorCode } from "./errors";

/**
 * マイグレーションを実行
 * 本番環境では自動実行せず、手動でトリガー推奨
 */
export async function runMigrations(): Promise<void> {
  try {
    const db = getDatabase();
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    throw new DatabaseError(
      "Migration failed",
      DatabaseErrorCode.MIGRATION_FAILED,
      error,
    );
  }
}
```

### 8.3 package.json スクリプト追加

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "db:check": "drizzle-kit check"
  }
}
```

## 9. 技術制約への対応

### 9.1 Turso/libSQL の制約

| 制約                       | 対応策                                     |
| -------------------------- | ------------------------------------------ |
| 接続プーリング非対応       | シングルトンパターンで単一接続管理         |
| UUID生成関数なし           | `crypto.randomUUID()` で生成               |
| ネイティブJSON型なし       | `text` 型 + Zod 検証                       |
| ネストトランザクション不可 | フラットなトランザクション設計             |
| SAVEPOINT制限              | 複雑なネストは避け、単純なトランザクション |

### 9.2 TypeScript strict mode 対応

```typescript
// ✅ 推奨: 明示的な型注釈
export function getDatabase(): LibSQLDatabase {
  // ...
}

// ❌ 非推奨: any型の使用
export function getDatabase(): any {
  // ...
}
```

### 9.3 Drizzle ORM バージョン互換性

現在インストール済みのバージョン:

- `drizzle-orm`: ^0.39.0 ✅ (要件: ^0.38.0)
- `drizzle-kit`: ^0.31.8 ✅ (要件: ^0.30.0)

**追加が必要**:

- `@libsql/client`: ^0.14.0 ❌ (未インストール)

## 10. セキュリティ考慮事項

### 10.1 環境変数管理

```bash
# .env.example (Git管理対象)
DATABASE_URL=file:./data/local.db
# DATABASE_AUTH_TOKEN=  # 本番環境のみ設定

# .env (Git管理対象外)
DATABASE_URL=libsql://prod.turso.io
DATABASE_AUTH_TOKEN=eyJhbGc...  # 本番トークン
```

### 10.2 SQLインジェクション対策

Drizzle ORM は**自動的にパラメータ化クエリ**を生成するため、SQLインジェクションのリスクは低い。

```typescript
// ✅ 安全: パラメータバインディング
const result = await db.select().from(files).where(eq(files.name, userInput));

// ❌ 危険: 生SQLに直接埋め込み
const result = await db.execute(
  sql`SELECT * FROM files WHERE name = '${userInput}'`,
);
```

### 10.3 認証トークンの保護

- 環境変数経由でのみ取得
- ログに出力しない（マスキング処理）
- Git リポジトリにコミットしない

## 11. パフォーマンス要件

| 指標                     | 目標値  | 測定方法                  |
| ------------------------ | ------- | ------------------------- |
| クエリレイテンシ         | < 50ms  | SELECT 1 の応答時間       |
| 接続確立時間             | < 100ms | initializeDatabase() 時間 |
| トランザクション実行時間 | < 200ms | 複数INSERT の完了時間     |

## 12. 既存実装との共存

### 12.1 2つのDBレイヤー

```
packages/shared/
├── infrastructure/database/    # 旧実装（better-sqlite3）
│   └── migrations/
└── src/db/                     # 新実装（libSQL/Turso）★ 本タスク
    └── schema/
```

### 12.2 移行戦略

1. **Phase 1** (本タスク): 新DB基盤の構築
2. **Phase 2** (CONV-04-02〜06): 新スキーマの実装
3. **Phase 3** (将来): 旧実装の段階的廃止

## 完了条件

- [ ] アーキテクチャ設計書が作成されている
- [ ] クライアント構成（シングルトンパターン）が設計されている
- [ ] トランザクション管理方式が設計されている
- [ ] 接続管理方式（ローカル/クラウド切り替え）が設計されている
- [ ] ヘルスチェック機構が設計されている
- [ ] エラーハンドリング方針（カスタムエラークラス）が定義されている
- [ ] ファイル構成が明確化されている
- [ ] 共通カラム定義の設計が完了している
- [ ] マイグレーション設定が設計されている
- [ ] セキュリティ考慮事項が明記されている

## 参照

- [要件定義書](./conv-04-01-requirements.md)
- [システム仕様書: データベース設計](../../00-requirements/15-database-design.md)
- [システム仕様書: アーキテクチャ](../../00-requirements/05-architecture.md)
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [libSQL公式ドキュメント](https://docs.turso.tech/libsql)
