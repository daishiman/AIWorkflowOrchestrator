/**
 * Drizzle ORM 接続設定テンプレート
 *
 * このファイルをコピーして、プロジェクトに合わせて設定してください。
 *
 * 対応環境:
 * - Neon (Serverless PostgreSQL)
 * - Supabase
 * - Self-hosted PostgreSQL
 * - Vercel Edge / Cloudflare Workers
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { neon, Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// =============================================================================
// 環境設定
// =============================================================================

type Environment = 'development' | 'staging' | 'production' | 'test';

interface PoolConfig {
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const poolConfigs: Record<Environment, PoolConfig> = {
  development: {
    max: 5,
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
  test: {
    max: 3,
    min: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  },
  staging: {
    max: 20,
    min: 5,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  },
  production: {
    max: 50,
    min: 10,
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 15000,
  },
};

function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development';
  if (['development', 'staging', 'production', 'test'].includes(env)) {
    return env as Environment;
  }
  return 'development';
}

function getPoolConfig(): PoolConfig {
  return poolConfigs[getEnvironment()];
}

// =============================================================================
// 接続URL
// =============================================================================

// 直接接続（マイグレーション用）
const DATABASE_URL_DIRECT = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;

// プーラー経由接続（アプリケーション用）
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// =============================================================================
// 接続パターン 1: WebSocket (Lambda, 長いコネクション向け)
// =============================================================================

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const config = getPoolConfig();
    pool = new Pool({
      connectionString: DATABASE_URL,
      ...config,
    });

    // 接続イベントのロギング
    pool.on('connect', () => {
      console.log('[DB] New connection established');
    });

    pool.on('error', (err) => {
      console.error('[DB] Pool error:', err);
    });

    pool.on('remove', () => {
      console.log('[DB] Connection removed from pool');
    });
  }
  return pool;
}

// WebSocket接続を使用するDrizzleインスタンス
export const dbWebSocket = drizzle(getPool(), { schema });

// =============================================================================
// 接続パターン 2: HTTP (Edge Functions, Cloudflare Workers向け)
// =============================================================================

const sql = neon(DATABASE_URL);

// HTTP接続を使用するDrizzleインスタンス
export const dbHttp = drizzleHttp(sql, { schema });

// =============================================================================
// 環境に応じた自動選択
// =============================================================================

/**
 * 実行環境に応じて最適な接続を選択
 *
 * - Edge環境: HTTP接続
 * - Node.js環境: WebSocket接続
 */
export function getDb() {
  // Edge環境の検出
  const isEdge = typeof globalThis.EdgeRuntime !== 'undefined' ||
                 typeof (globalThis as any).WebSocketPair !== 'undefined';

  if (isEdge) {
    return dbHttp;
  }

  return dbWebSocket;
}

// デフォルトエクスポート
export const db = getDb();

// =============================================================================
// ヘルスチェック
// =============================================================================

export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    // シンプルなクエリで接続確認
    await sql`SELECT 1`;

    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// クリーンアップ
// =============================================================================

/**
 * アプリケーション終了時に接続をクローズ
 */
export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] Connection pool closed');
  }
}

// プロセス終了時のクリーンアップ
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeConnections();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
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
 *   driver: 'pg',
 *   dbCredentials: {
 *     connectionString: process.env.DATABASE_URL_DIRECT!,
 *   },
 * } satisfies Config;
 * ```
 *
 * 注意: マイグレーションには直接接続(DATABASE_URL_DIRECT)を使用
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
*/
