/**
 * Drizzle Kit設定ファイル
 *
 * @description
 * マイグレーション生成とデータベーススキーマ管理のための設定。
 * Turso（libSQL/SQLite）を対象としたスキーマ定義を使用。
 *
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */

import type { Config } from "drizzle-kit";

export default {
  /**
   * スキーマ定義ファイルのパス（ビルド後のJavaScriptファイルを参照）
   */
  schema: "./dist/src/db/schema/*.js",

  /**
   * マイグレーションファイルの出力先
   */
  out: "./drizzle/migrations",

  /**
   * データベース方言（SQLite/libSQL）
   */
  dialect: "sqlite",

  /**
   * マイグレーション生成時の詳細ログ
   */
  verbose: true,

  /**
   * マイグレーション生成時に厳密モードを有効化
   */
  strict: true,
} satisfies Config;
