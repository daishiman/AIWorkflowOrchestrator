/**
 * defaultExcludePatterns - デフォルト除外パターン
 *
 * ワークスペース検索・置換で共通使用
 */

/**
 * ワークスペース検索のデフォルト除外パターン
 */
export const DEFAULT_EXCLUDE_PATTERNS: readonly string[] = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/coverage/**",
];

/**
 * 除外パターンをデフォルトとマージ
 */
export function mergeExcludePatterns(exclude?: string[]): string[] {
  if (!exclude) {
    return [...DEFAULT_EXCLUDE_PATTERNS];
  }
  return [...DEFAULT_EXCLUDE_PATTERNS, ...exclude];
}
