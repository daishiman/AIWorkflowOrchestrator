/**
 * Drizzle ORM 接続設定テンプレート (Turso/libSQL)
 *
 * このファイルをコピーして、プロジェクトに合わせて設定してください。
 *
 * 対応環境:
 * - Turso (Edge-hosted SQLite)
 * - Local SQLite
 * - Embedded Replicas
 * - Vercel Edge / Cloudflare Workers
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import * as schema from "./schema";

// =============================================================================
// 環境設定
// =============================================================================

type Environment = "development" | "staging" | "production" | "test";

interface ReplicaConfig {
  syncUrl: string;
  authToken: string;
  syncInterval: number; // 秒単位
}

const replicaConfigs: Record<Environment, ReplicaConfig | null> = {
  development: null, // ローカルファイルのみ
  test: null, // テスト用ローカル
  staging: {
    syncUrl: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
    syncInterval: 30, // 30秒ごとに同期
  },
  production: {
    syncUrl: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
    syncInterval: 60, // 1分ごとに同期
  },
};

function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || "development";
  if (["development", "staging", "production", "test"].includes(env)) {
    return env as Environment;
  }
  return "development";
}

// =============================================================================
// 接続URL
// =============================================================================

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  throw new Error(
    "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required",
  );
}

// =============================================================================
// 接続パターン 1: リモート接続のみ（シンプル）
// =============================================================================

let remoteClient: Client | null = null;

function getRemoteClient(): Client {
  if (!remoteClient) {
    remoteClient = createClient({
      url: TURSO_DATABASE_URL!,
      authToken: TURSO_AUTH_TOKEN!,
    });
  }
  return remoteClient;
}

// リモート接続を使用するDrizzleインスタンス
export const dbRemote = drizzle(getRemoteClient(), { schema });

// =============================================================================
// 接続パターン 2: 組み込みレプリカ（超高速読み取り）
// =============================================================================

let replicaClient: Client | null = null;

function getReplicaClient(): Client {
  if (!replicaClient) {
    const env = getEnvironment();
    const replicaConfig = replicaConfigs[env];

    if (replicaConfig) {
      // 本番/ステージング: 組み込みレプリカを使用
      replicaClient = createClient({
        url: "file:///tmp/local-replica.db", // ローカルレプリカ
        syncUrl: replicaConfig.syncUrl,
        authToken: replicaConfig.authToken,
        syncInterval: replicaConfig.syncInterval,
      });

      console.log(
        `[DB] Embedded replica enabled (sync every ${replicaConfig.syncInterval}s)`,
      );
    } else {
      // 開発/テスト: リモート接続のみ
      replicaClient = createClient({
        url: TURSO_DATABASE_URL!,
        authToken: TURSO_AUTH_TOKEN!,
      });

      console.log("[DB] Using remote connection (no replica)");
    }
  }
  return replicaClient;
}

// レプリカを使用するDrizzleインスタンス
export const dbReplica = drizzle(getReplicaClient(), { schema });

// =============================================================================
// 接続パターン 3: Edge環境用（Vercel Edge/Cloudflare Workers）
// =============================================================================

/**
 * Edge環境用のクライアント作成
 * @libsql/client/web を使用すること
 */
export function createEdgeClient() {
  // Edge環境では @libsql/client/web をimportする
  // import { createClient } from '@libsql/client/web';

  return createClient({
    url: TURSO_DATABASE_URL!,
    authToken: TURSO_AUTH_TOKEN!,
  });
}

// =============================================================================
// 環境に応じた自動選択
// =============================================================================

/**
 * 実行環境に応じて最適な接続を選択
 *
 * - 本番/ステージング: レプリカ接続（高速読み取り）
 * - 開発/テスト: リモート接続（シンプル）
 * - Edge環境: Edge用クライアント
 */
export function getDb() {
  // Edge環境の検出
  const isEdge =
    typeof globalThis.EdgeRuntime !== "undefined" ||
    typeof (globalThis as any).WebSocketPair !== "undefined";

  if (isEdge) {
    return drizzle(createEdgeClient(), { schema });
  }

  // 環境に応じてレプリカまたはリモートを選択
  const env = getEnvironment();
  if (env === "production" || env === "staging") {
    return dbReplica; // レプリカで高速化
  }

  return dbRemote; // 開発/テスト用シンプル接続
}

// デフォルトエクスポート
export const db = getDb();

// =============================================================================
// ヘルスチェック
// =============================================================================

export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  latencyMs: number;
  error?: string;
  replicaSync?: {
    enabled: boolean;
    lastSync?: Date;
  };
}> {
  const start = Date.now();

  try {
    const client = getReplicaClient();

    // シンプルなクエリで接続確認
    await client.execute("SELECT 1");

    // レプリカ情報の取得
    const env = getEnvironment();
    const replicaConfig = replicaConfigs[env];

    return {
      status: "healthy",
      latencyMs: Date.now() - start,
      replicaSync: {
        enabled: replicaConfig !== null,
        lastSync: replicaConfig ? new Date() : undefined,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// 手動同期（レプリカ使用時）
// =============================================================================

/**
 * レプリカを手動で同期
 * 重要な更新直後に即座に同期したい場合に使用
 */
export async function syncReplica(): Promise<void> {
  const client = getReplicaClient();

  if ("sync" in client && typeof client.sync === "function") {
    try {
      await client.sync();
      console.log("[DB] Manual replica sync completed");
    } catch (error) {
      console.error("[DB] Replica sync failed:", error);
      throw error;
    }
  } else {
    console.warn("[DB] Replica sync not available (using remote connection)");
  }
}

// =============================================================================
// クリーンアップ
// =============================================================================

/**
 * アプリケーション終了時に接続をクローズ
 */
export async function closeConnections(): Promise<void> {
  const promises: Promise<void>[] = [];

  if (remoteClient && "close" in remoteClient) {
    promises.push(
      (remoteClient.close as () => Promise<void>)().then(() => {
        console.log("[DB] Remote connection closed");
        remoteClient = null;
      }),
    );
  }

  if (
    replicaClient &&
    replicaClient !== remoteClient &&
    "close" in replicaClient
  ) {
    promises.push(
      (replicaClient.close as () => Promise<void>)().then(() => {
        console.log("[DB] Replica connection closed");
        replicaClient = null;
      }),
    );
  }

  await Promise.all(promises);
}

// プロセス終了時のクリーンアップ
if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    await closeConnections();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closeConnections();
    process.exit(0);
  });
}

// =============================================================================
// drizzle.config.ts 用の設定
// =============================================================================

/**
 * drizzle-kit用の設定
 *
 * drizzle.config.tsで使用:
 *
 * ```typescript
 * import type { Config } from 'drizzle-kit';
 *
 * export default {
 *   schema: './src/db/schema.ts',
 *   out: './drizzle',
 *   driver: 'turso',
 *   dbCredentials: {
 *     url: process.env.TURSO_DATABASE_URL!,
 *     authToken: process.env.TURSO_AUTH_TOKEN!,
 *   },
 * } satisfies Config;
 * ```
 */

// =============================================================================
// 使用例
// =============================================================================

/*
// 基本的なクエリ
import { db } from './db';
import { users } from './schema';

// Select
const allUsers = await db.select().from(users);

// Insert
await db.insert(users).values({ name: 'John', email: 'john@example.com' });

// Update
await db.update(users).set({ name: 'Jane' }).where(eq(users.id, 1));

// Delete
await db.delete(users).where(eq(users.id, 1));

// トランザクション
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'User 1' });
  await tx.insert(users).values({ name: 'User 2' });
});

// レプリカ手動同期（重要な更新後）
await syncReplica();

// ヘルスチェック
const health = await checkDatabaseHealth();
console.log('Database status:', health.status);
*/
