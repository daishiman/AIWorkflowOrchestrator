/**
 * キーボードユーティリティ
 *
 * プラットフォーム依存のキーボードショートカット判定を提供する。
 *
 * @module SkillEditorView/utils/keyboardUtils
 */

/**
 * プラットフォームに応じた保存ショートカット判定
 * - macOS: Cmd+S (metaKey)
 * - Windows/Linux: Ctrl+S (ctrlKey)
 */
export const isPlatformSaveKey = (e: KeyboardEvent): boolean =>
  (e.metaKey || e.ctrlKey) && e.key === "s";
