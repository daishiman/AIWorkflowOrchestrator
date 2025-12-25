/**
 * マイグレーション実行スクリプト
 *
 * 開発環境でのマイグレーション実行を自動化する
 *
 * @example
 * ```bash
 * # スクリプトとして実行
 * pnpm tsx src/db/migrate.ts
 *
 * # または関数として使用
 * import { runMigrations } from './migrate';
 * await runMigrations();
 * ```
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as path from "path";
import { fileURLToPath } from "url";

import { getDatabaseEnv, getDatabaseUrl, isCloudMode } from "./env.js";

// ESM環境での__dirname取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * マイグレーションフォルダのパス
 * packages/shared/drizzle/migrations
 */
const MIGRATIONS_FOLDER = path.resolve(__dirname, "../../drizzle/migrations");

/**
 * libSQLクライアントのシングルトン
 */
let client: ReturnType<typeof createClient> | null = null;

/**
 * データベースクライアントを初期化
 */
function initializeClient(): ReturnType<typeof createClient> {
  if (client) {
    return client;
  }

  const env = getDatabaseEnv();
  const url = getDatabaseUrl(env);

  const config: { url: string; authToken?: string } = { url };

  // クラウドモードの場合は認証トークンを追加
  if (isCloudMode(env) && env.TURSO_AUTH_TOKEN) {
    config.authToken = env.TURSO_AUTH_TOKEN;
  }

  client = createClient(config);
  return client;
}

/**
 * データベース接続をクローズ
 */
export function closeDatabase(): void {
  if (client) {
    client.close();
    client = null;
    console.log("Database connection closed.");
  }
}

/**
 * マイグレーションを実行
 *
 * @throws Error - マイグレーション失敗時
 */
export async function runMigrations(): Promise<void> {
  console.log("Starting database migrations...");
  console.log(`Migrations folder: ${MIGRATIONS_FOLDER}`);

  const libsqlClient = initializeClient();
  const db = drizzle(libsqlClient);

  try {
    await migrate(db, {
      migrationsFolder: MIGRATIONS_FOLDER,
    });
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

/**
 * メイン関数（直接実行時）
 */
async function main(): Promise<void> {
  try {
    await runMigrations();
    console.log("All migrations applied successfully.");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// 直接実行された場合のみmain()を実行
// ESM環境での判定
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main();
}
