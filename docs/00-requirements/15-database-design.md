# データベース設計（Turso + Drizzle ORM）

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 15.1 データベース統一アーキテクチャ

### 採用技術

| 技術               | 役割           | 理由                                         |
| ------------------ | -------------- | -------------------------------------------- |
| **Turso**          | クラウドDB     | libSQL（SQLite互換）エッジDB、グローバル分散 |
| **libSQL**         | 基盤技術       | SQLiteのOSSフォーク、ローカル/クラウド互換   |
| **@libsql/client** | 接続ライブラリ | ローカルファイル・リモートDB両対応           |
| **Drizzle ORM**    | ORM            | SQLライク構文、軽量、型推論、SQLite完全対応  |

### 統一構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                    データベース統一アーキテクチャ                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【共通】                                                       │
│   ┌─────────────────────────────────────────────┐               │
│   │     packages/shared/infrastructure/db/       │               │
│   │                                             │               │
│   │  schema.ts   ← 統一スキーマ定義              │               │
│   │  client.ts   ← DB接続クライアント            │               │
│   │  migrations/ ← マイグレーション              │               │
│   └─────────────────────────────────────────────┘               │
│                    ↓                                            │
│   ┌─────────────────────┬───────────────────────┐               │
│   │  デスクトップアプリ   │   バックエンドAPI      │               │
│   │                     │                       │               │
│   │  file:./data/app.db │  libsql://...turso.io │               │
│   │  ← オフライン動作    │  ← クラウド接続       │               │
│   └─────────────────────┴───────────────────────┘               │
│              ↕                                                  │
│   ┌─────────────────────────────────────────────┐               │
│   │        Turso Embedded Replicas              │               │
│   │        （ローカル↔クラウド自動同期）          │               │
│   └─────────────────────────────────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15.2 環境別接続設定

### 接続URL形式

| 環境                       | 接続URL                      | 認証               |
| -------------------------- | ---------------------------- | ------------------ |
| ローカル開発（ファイル）   | `file:./data/local.db`       | 不要               |
| ローカル開発（Turso接続）  | `libsql://db-name.turso.io`  | `TURSO_AUTH_TOKEN` |
| デスクトップアプリ         | `file:${appDataPath}/app.db` | 不要               |
| バックエンドAPI（Railway） | `libsql://db-name.turso.io`  | `TURSO_AUTH_TOKEN` |

### 環境変数

| 変数名               | 説明                | 例                              |
| -------------------- | ------------------- | ------------------------------- |
| `TURSO_DATABASE_URL` | データベース接続URL | `libsql://ai-workflow.turso.io` |
| `TURSO_AUTH_TOKEN`   | 認証トークン        | `eyJ...`                        |

### 接続クライアント実装例

```typescript
// packages/shared/infrastructure/db/client.ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("TURSO_DATABASE_URL is required");
  }

  // ローカルファイルの場合はauthToken不要
  const isLocalFile = url.startsWith("file:");

  const client = createClient({
    url,
    authToken: isLocalFile ? undefined : authToken,
  });

  return drizzle(client, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
```

---

## 15.3 Drizzle スキーマ定義

### 基本構造

```typescript
// packages/shared/infrastructure/db/schema.ts
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================
// ワークフロー
// ============================================
export const workflows = sqliteTable("workflows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(),
  userId: text("user_id").notNull(),
  status: text("status", {
    enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "RETRYING"],
  })
    .notNull()
    .default("PENDING"),
  inputPayload: text("input_payload", { mode: "json" }),
  outputPayload: text("output_payload", { mode: "json" }),
  errorLog: text("error_log"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// ============================================
// ユーザー設定
// ============================================
export const userSettings = sqliteTable("user_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  preferences: text("preferences", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ============================================
// 同期メタデータ（オプション）
// ============================================
export const syncMetadata = sqliteTable("sync_metadata", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tableName: text("table_name").notNull(),
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
  syncStatus: text("sync_status", {
    enum: ["PENDING", "SYNCING", "COMPLETED", "FAILED"],
  })
    .notNull()
    .default("PENDING"),
});
```

### 型エクスポート

```typescript
// packages/shared/infrastructure/db/types.ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { workflows, userSettings, syncMetadata } from "./schema";

// Select types (読み取り)
export type Workflow = InferSelectModel<typeof workflows>;
export type UserSettings = InferSelectModel<typeof userSettings>;
export type SyncMetadata = InferSelectModel<typeof syncMetadata>;

// Insert types (書き込み)
export type NewWorkflow = InferInsertModel<typeof workflows>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;
export type NewSyncMetadata = InferInsertModel<typeof syncMetadata>;
```

---

## 15.4 マイグレーション管理

### Drizzle Kit 設定

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/shared/infrastructure/db/schema.ts",
  out: "./packages/shared/infrastructure/db/migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

### マイグレーションコマンド

| コマンド                    | 説明                             |
| --------------------------- | -------------------------------- |
| `pnpm drizzle-kit generate` | マイグレーションファイル生成     |
| `pnpm drizzle-kit push`     | スキーマを直接DBに適用（開発用） |
| `pnpm drizzle-kit migrate`  | マイグレーション実行（本番用）   |
| `pnpm drizzle-kit studio`   | DB管理UIを起動                   |

### マイグレーション原則

| 原則             | 説明                                         |
| ---------------- | -------------------------------------------- |
| バージョン管理   | すべてのスキーマ変更はマイグレーションで管理 |
| ロールバック可能 | 必要に応じてロールバックできる設計           |
| データ移行分離   | スキーマ変更とデータ移行を分離               |
| 本番適用         | ダウンタイム最小化を意識                     |

---

## 15.5 Repository パターン

### 実装例

```typescript
// packages/shared/infrastructure/db/repositories/workflow.repository.ts
import { eq, and, isNull, desc } from "drizzle-orm";
import { DbClient } from "../client";
import { workflows } from "../schema";
import type { Workflow, NewWorkflow } from "../types";

export class WorkflowRepository {
  constructor(private db: DbClient) {}

  async create(data: NewWorkflow): Promise<Workflow> {
    const [result] = await this.db.insert(workflows).values(data).returning();
    return result;
  }

  async findById(id: string): Promise<Workflow | null> {
    const result = await this.db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), isNull(workflows.deletedAt)))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string): Promise<Workflow[]> {
    return this.db
      .select()
      .from(workflows)
      .where(and(eq(workflows.userId, userId), isNull(workflows.deletedAt)))
      .orderBy(desc(workflows.createdAt));
  }

  async updateStatus(
    id: string,
    status: Workflow["status"],
    errorLog?: string,
  ): Promise<Workflow | null> {
    const [result] = await this.db
      .update(workflows)
      .set({
        status,
        errorLog,
        updatedAt: new Date(),
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      })
      .where(eq(workflows.id, id))
      .returning();
    return result ?? null;
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(workflows)
      .set({ deletedAt: new Date() })
      .where(eq(workflows.id, id));
  }
}
```

---

## 15.6 同期戦略（Embedded Replicas）

### 概要

Turso の Embedded Replicas 機能を使用して、ローカルSQLiteとクラウドTursを自動同期します。

```typescript
// デスクトップアプリでの同期設定例
import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:./data/app.db", // ローカルファイル
  syncUrl: process.env.TURSO_DATABASE_URL, // 同期先
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 60, // 60秒ごとに同期
});

// 手動同期
await client.sync();
```

### 同期フロー

```
┌────────────────────────────────────────────────────────────────┐
│                     同期フロー                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. オフライン時                                                │
│     └─ ローカルSQLiteに読み書き（file:）                        │
│                                                                │
│  2. オンライン復帰時                                            │
│     └─ client.sync() で差分をTursoに送信                        │
│                                                                │
│  3. 定期同期（バックグラウンド）                                 │
│     └─ syncInterval で自動同期                                  │
│                                                                │
│  4. 競合解決                                                    │
│     └─ Last-Write-Wins（最終書き込み優先）                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 15.7 インデックス設計

### 推奨インデックス

```typescript
// schema.ts に追加
import { index } from "drizzle-orm/sqlite-core";

export const workflowsStatusIndex = index("idx_workflows_status").on(
  workflows.status,
);

export const workflowsUserIdIndex = index("idx_workflows_user_id").on(
  workflows.userId,
);

export const workflowsCreatedAtIndex = index("idx_workflows_created_at").on(
  workflows.createdAt,
);

export const workflowsTypeStatusIndex = index("idx_workflows_type_status").on(
  workflows.type,
  workflows.status,
);
```

### インデックス方針

| 対象       | 説明                                   |
| ---------- | -------------------------------------- |
| 検索条件   | WHERE句で頻繁に使用するカラム          |
| ソートキー | ORDER BY で使用するカラム              |
| 複合検索   | 複数カラムでの検索には複合インデックス |

---

## 15.8 Turso 無料枠と制限

| 項目           | 無料枠          |
| -------------- | --------------- |
| ストレージ     | 500 MB          |
| 読み取り       | 10億行/月       |
| 書き込み       | 2500万行/月     |
| データベース数 | 500             |
| ロケーション   | 1（追加は有料） |

### 料金プラン（参考）

| プラン     | 月額     | 特徴                         |
| ---------- | -------- | ---------------------------- |
| Starter    | 無料     | 個人開発、プロトタイプ       |
| Scaler     | $29〜    | 本番アプリ、追加ロケーション |
| Enterprise | 要問合せ | SLA、サポート                |

---

## 関連ドキュメント

- [テクノロジースタック](./03-technology-stack.md)
- [アーキテクチャ設計](./05-architecture.md)
- [環境変数](./13-environment-variables.md)
- [Railwayデプロイガイド](../30-workflows/deployment/setup-guide-railway-backend.md)
