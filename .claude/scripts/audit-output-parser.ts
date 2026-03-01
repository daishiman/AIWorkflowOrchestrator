/**
 * 監査出力パーサー
 *
 * audit-unassigned-tasks / verify-all-specs 等の監査コマンドの標準出力を
 * パースし、currentViolations と baselineViolations に分離する。
 *
 * current/baseline分離の判定ルール:
 * - currentViolations.total === 0 の場合のみ PASS
 * - baselineViolations は参照値として記録するが、合否判定には影響しない
 */

import type { AuditResult } from "./types";

export type { AuditResult };

/** パース結果 */
export interface ParseResult {
  /** パースの成否 */
  isValid: boolean;
  /** パース成功時の監査結果 */
  result?: AuditResult;
  /** パース失敗時のエラーメッセージ */
  error?: string;
}

/**
 * 監査コマンドの標準出力をパースし、AuditResult に変換する。
 *
 * @param stdout - 監査コマンドの標準出力（JSON文字列）
 * @returns パース結果
 */
export function parseAuditOutput(stdout: string): ParseResult {
  // 空文字列チェック
  if (typeof stdout !== "string" || stdout.trim() === "") {
    return {
      isValid: false,
      error: "stdout: 空文字列または非文字列が渡されました",
    };
  }

  // JSONパース
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return {
      isValid: false,
      error: `stdout: JSONパースに失敗しました: ${stdout.substring(0, 100)}`,
    };
  }

  // オブジェクト型チェック
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      isValid: false,
      error: "stdout: JSONオブジェクトが必要です",
    };
  }

  const obj = parsed as Record<string, unknown>;

  // currentViolations の検証（必須）
  if (!("currentViolations" in obj) || obj.currentViolations === undefined) {
    return {
      isValid: false,
      error: "currentViolations フィールドが存在しません",
    };
  }

  const currentResult = validateViolationBlock(obj, "currentViolations");
  if (!currentResult.isValid) {
    return { isValid: false, error: currentResult.error };
  }

  // baselineViolations の検証（必須）
  if (!("baselineViolations" in obj) || obj.baselineViolations === undefined) {
    return {
      isValid: false,
      error: "baselineViolations フィールドが存在しません",
    };
  }

  const baselineResult = validateViolationBlock(obj, "baselineViolations");
  if (!baselineResult.isValid) {
    return { isValid: false, error: baselineResult.error };
  }

  return {
    isValid: true,
    result: {
      currentViolations: currentResult.value!,
      baselineViolations: baselineResult.value!,
    },
  };
}

/** violation ブロックのバリデーション結果 */
interface ViolationBlockResult {
  isValid: boolean;
  value?: { total: number; details: string[] };
  error?: string;
}

/**
 * currentViolations / baselineViolations ブロックの構造を検証する。
 */
function validateViolationBlock(
  obj: Record<string, unknown>,
  key: string,
): ViolationBlockResult {
  const block = obj[key];

  if (typeof block !== "object" || block === null || Array.isArray(block)) {
    return {
      isValid: false,
      error: `${key}: オブジェクトが必要です`,
    };
  }

  const blockObj = block as Record<string, unknown>;

  // total の検証
  if (typeof blockObj.total !== "number" || !Number.isInteger(blockObj.total)) {
    return {
      isValid: false,
      error: `${key}.total: 整数が必要です`,
    };
  }

  if (blockObj.total < 0) {
    return {
      isValid: false,
      error: `${key}.total: 0以上の整数が必要です`,
    };
  }

  // details の検証（配列必須）
  if (!Array.isArray(blockObj.details)) {
    return {
      isValid: false,
      error: `${key}.details: 配列が必要です`,
    };
  }

  const details = blockObj.details as unknown[];
  const validDetails = details.filter(
    (d): d is string => typeof d === "string",
  );

  return {
    isValid: true,
    value: {
      total: blockObj.total as number,
      details: validDetails,
    },
  };
}

/**
 * 監査結果を評価し、PASS/FAIL を判定する。
 *
 * 判定ルール:
 * - currentViolations.total === 0 → PASS（本タスク起因の違反なし）
 * - currentViolations.total > 0  → FAIL（本タスク起因の違反あり）
 * - baselineViolations は判定に影響しない（参照値のみ）
 *
 * @param result - 監査結果
 * @returns 評価結果
 */
export function evaluateAuditResult(result: AuditResult): {
  status: "PASS" | "FAIL";
  message: string;
} {
  if (result.currentViolations.total === 0) {
    const baselineNote =
      result.baselineViolations.total > 0
        ? `（baseline: ${result.baselineViolations.total}件は別タスクで対応）`
        : "";
    return {
      status: "PASS",
      message: `currentViolations.total === 0: 本タスク起因の違反はありません${baselineNote}`,
    };
  }

  return {
    status: "FAIL",
    message: `currentViolations.total === ${result.currentViolations.total}: ${result.currentViolations.details.join(", ")}`,
  };
}
