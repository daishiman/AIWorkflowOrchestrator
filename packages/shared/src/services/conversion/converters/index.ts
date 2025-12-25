/**
 * @file テキストコンバーター エントリーポイント
 * @module @repo/shared/services/conversion/converters
 * @description テキストベースファイル用コンバーターのエクスポートと登録処理
 */

// =============================================================================
// コンバーターのエクスポート
// =============================================================================

export { HTMLConverter } from "./html-converter";
export { CSVConverter } from "./csv-converter";
export { JSONConverter } from "./json-converter";
export { MarkdownConverter } from "./markdown-converter";
export { CodeConverter } from "./code-converter";
export { YAMLConverter } from "./yaml-converter";
export { PlainTextConverter } from "./plain-text-converter";

// =============================================================================
// インポート（登録用）
// =============================================================================

import { globalConverterRegistry } from "../converter-registry";
import { HTMLConverter } from "./html-converter";
import { CSVConverter } from "./csv-converter";
import { JSONConverter } from "./json-converter";
import { MarkdownConverter } from "./markdown-converter";
import { CodeConverter } from "./code-converter";
import { YAMLConverter } from "./yaml-converter";
import { PlainTextConverter } from "./plain-text-converter";

// =============================================================================
// 登録関数
// =============================================================================

/**
 * 登録済みフラグ
 *
 * 二重登録を防止するためのフラグ。
 */
let isRegistered = false;

/**
 * デフォルトコンバーターをグローバルレジストリに登録
 *
 * 優先度順（高い順）:
 * 1. HTMLConverter (priority: 10) - HTML形式の保持が重要
 * 2. MarkdownConverter (priority: 10) - Markdown構造抽出
 * 3. CodeConverter (priority: 10) - コード構造抽出
 * 4. YAMLConverter (priority: 10) - YAML構造抽出
 * 5. JSONConverter (priority: 5) - 構造化データの保持
 * 6. CSVConverter (priority: 5) - 表形式データの保持
 * 7. PlainTextConverter (priority: 0) - フォールバック用
 *
 * この関数はアプリケーション起動時に1回だけ呼び出す。
 * 複数回呼び出しても二重登録はされない。
 *
 * @returns 登録結果
 *
 * @example
 * ```typescript
 * // アプリケーション起動時
 * import { registerDefaultConverters } from './converters';
 *
 * registerDefaultConverters();
 * ```
 */
export function registerDefaultConverters(): {
  success: boolean;
  registeredCount: number;
  skipped: boolean;
} {
  // 二重登録防止
  if (isRegistered) {
    return {
      success: true,
      registeredCount: 0,
      skipped: true,
    };
  }

  // コンバーターインスタンスを生成
  const converters = [
    new HTMLConverter(), // priority: 10
    new MarkdownConverter(), // priority: 10
    new CodeConverter(), // priority: 10
    new YAMLConverter(), // priority: 10
    new JSONConverter(), // priority: 5
    new CSVConverter(), // priority: 5
    new PlainTextConverter(), // priority: 0 (フォールバック)
  ];

  // グローバルレジストリに一括登録
  const result = globalConverterRegistry.registerAll(converters);

  // 登録済みフラグを更新
  if (result.failed === 0) {
    isRegistered = true;
  }

  return {
    success: result.failed === 0,
    registeredCount: result.success,
    skipped: false,
  };
}

/**
 * 登録状態をリセット（テスト用）
 *
 * 二重登録防止フラグをリセットし、再登録を可能にする。
 * 本番環境では使用しないこと。
 *
 * @internal
 */
export function resetRegistrationState(): void {
  isRegistered = false;
}

/**
 * 登録状態を確認
 *
 * @returns 登録済みの場合はtrue
 */
export function isConvertersRegistered(): boolean {
  return isRegistered;
}
