/**
 * データベース環境変数定義
 *
 * Zodスキーマによる型安全な環境変数管理
 */
import { z } from "zod";

/**
 * データベースモード
 */
export const DatabaseMode = {
  LOCAL: "local",
  CLOUD: "cloud",
} as const;

/**
 * データベース環境変数スキーマ
 */
export const databaseEnvSchema = z
  .object({
    /**
     * データベース接続URL
     * file:xxx (ローカル) または libsql://xxx (クラウド)
     */
    TURSO_DATABASE_URL: z.string().optional(),

    /**
     * 認証トークン
     * クラウドモードでは必須
     */
    TURSO_AUTH_TOKEN: z.string().optional(),

    /**
     * ローカルDBファイルパス
     */
    LOCAL_DB_PATH: z.string().optional(),

    /**
     * データベースモード
     */
    DATABASE_MODE: z.enum(["local", "cloud"]).optional().default("local"),
  })
  .refine(
    (data) => {
      // クラウドモードの場合、AUTH_TOKENが必須
      if (data.DATABASE_MODE === "cloud") {
        return !!data.TURSO_AUTH_TOKEN;
      }
      // URLがクラウドURL形式の場合もAUTH_TOKENが必須
      if (data.TURSO_DATABASE_URL?.startsWith("libsql://")) {
        return !!data.TURSO_AUTH_TOKEN;
      }
      return true;
    },
    {
      message: "TURSO_AUTH_TOKEN is required for cloud mode",
      path: ["TURSO_AUTH_TOKEN"],
    },
  );

/**
 * データベース環境変数の型
 */
export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

/**
 * 環境変数を検証
 * @throws ZodError - 検証失敗時
 */
export function validateDatabaseEnv(
  env: Record<string, string | undefined> = process.env,
): DatabaseEnv {
  return databaseEnvSchema.parse(env);
}

/**
 * 環境変数を安全に取得（検証失敗時はデフォルト値を使用）
 */
export function getDatabaseEnv(
  env: Record<string, string | undefined> = process.env,
): DatabaseEnv {
  const result = databaseEnvSchema.safeParse(env);
  if (result.success) {
    return result.data;
  }
  // デフォルト値を返す
  return {
    TURSO_DATABASE_URL: undefined,
    TURSO_AUTH_TOKEN: undefined,
    LOCAL_DB_PATH: undefined,
    DATABASE_MODE: "local",
  };
}

/**
 * データベース接続URLを取得
 * 優先順位: TURSO_DATABASE_URL > LOCAL_DB_PATH > デフォルト
 */
export function getDatabaseUrl(env: DatabaseEnv): string {
  if (env.TURSO_DATABASE_URL) {
    return env.TURSO_DATABASE_URL;
  }
  if (env.LOCAL_DB_PATH) {
    return `file:${env.LOCAL_DB_PATH}`;
  }
  return "file:local.db";
}

/**
 * クラウドモードかどうかを判定
 */
export function isCloudMode(env: DatabaseEnv): boolean {
  if (env.DATABASE_MODE === "cloud") {
    return true;
  }
  if (env.TURSO_DATABASE_URL?.startsWith("libsql://")) {
    return true;
  }
  if (env.TURSO_DATABASE_URL?.startsWith("https://")) {
    return true;
  }
  return false;
}
