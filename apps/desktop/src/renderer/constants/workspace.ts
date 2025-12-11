/**
 * Workspace Constants
 *
 * ワークスペース機能で使用する定数を定義します。
 *
 * @module workspace-constants
 */

/**
 * 永続化スキーマのバージョン
 * @description マイグレーション時に使用
 */
export const WORKSPACE_SCHEMA_VERSION = 1 as const;

/**
 * ファイルツリーの最大ネスト深度
 * @description スタックオーバーフロー防止
 */
export const MAX_TREE_DEPTH = 10;

/**
 * electron-storeのキー
 */
export const WORKSPACE_STORE_KEY = "workspace";
