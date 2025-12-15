/**
 * generateId - ユニークID生成
 *
 * トランザクション、バックアップ、Undo操作で共通使用
 *
 * @remarks
 * crypto.randomUUID()を使用して衝突リスクを排除
 */

import { randomUUID } from "crypto";

/**
 * プレフィックス付きユニークIDを生成
 * @param prefix IDのプレフィックス (例: "tx", "backup", "undo")
 * @returns プレフィックス付きUUID (例: "tx-550e8400-e29b-41d4-a716-446655440000")
 */
export function generateId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

/**
 * UUIDのみを生成（プレフィックスなし）
 * @returns UUID v4形式の文字列
 */
export function generateUUID(): string {
  return randomUUID();
}
