/**
 * 検索・置換機能 定数定義
 */

/**
 * 検索デバウンス時間（ファイル内検索用）
 * 高速なレスポンスのため短めに設定
 */
export const FILE_SEARCH_DEBOUNCE_MS = 150;

/**
 * 検索デバウンス時間（ワークスペース検索用）
 * ファイル探索を伴うため長めに設定
 */
export const WORKSPACE_SEARCH_DEBOUNCE_MS = 300;

/**
 * スクロール時のオフセット行数
 * マッチを画面の中央付近に表示するため
 */
export const SCROLL_OFFSET_LINES = 3;

/**
 * デフォルトのフォントサイズ（px）
 * 行の高さ推定のフォールバック用
 */
export const DEFAULT_FONT_SIZE_PX = 14;

/**
 * 行の高さ倍率
 * フォントサイズに対する行の高さの比率
 */
export const LINE_HEIGHT_MULTIPLIER = 1.5;
