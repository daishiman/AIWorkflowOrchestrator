/**
 * 三点突合検証スクリプト
 *
 * Phase 12 完了判定の三点突合（artifacts.json、changelog、audit結果）を
 * 検証し、全要素がPASSの場合のみ完了を許可する。
 *
 * 本関数はパス文字列を直接比較する簡易版（ファイルI/Oなし）。
 * "completed"/"pending" をartifactsJsonPathとして受け取り、
 * "synced"/"unsynced" をchangelogPathとして受け取る。
 */

import type { AuditResult } from "./types";

export type { AuditResult };

/** 三点突合の入力 */
export interface TripleCheckInput {
  /** artifacts.json のステータス文字列（"completed" | "pending" 等） */
  artifactsJsonPath: string;
  /** changelog の同期ステータス文字列（"synced" | "unsynced" 等） */
  changelogPath: string;
  /** 監査結果 */
  auditResult: AuditResult;
}

/** 各チェック項目の詳細 */
export interface CheckDetail {
  /** 合否ステータス */
  status: "PASS" | "FAIL";
  /** 詳細メッセージ */
  detail: string;
}

/** 三点突合の検証結果 */
export interface TripleCheckResult {
  /** 総合ステータス: 3要素すべてPASSの場合のみ "PASS" */
  overallStatus: "PASS" | "FAIL";
  /** 各チェック項目の結果 */
  checks: {
    artifacts: CheckDetail;
    changelog: CheckDetail;
    audit: CheckDetail;
  };
  /** FAILとなったチェック項目名の配列 */
  failedChecks: string[];
}

/**
 * 三点突合を実行し、Phase 12 完了判定を行う。
 *
 * 判定ロジック:
 * 1. artifacts: artifactsJsonPath === "completed" -> PASS、それ以外 -> FAIL
 * 2. changelog: changelogPath === "synced" -> PASS、それ以外 -> FAIL
 * 3. audit: auditResult.currentViolations.total === 0 -> PASS、それ以外 -> FAIL
 * 4. overallStatus: 3要素すべてPASSの場合のみ "PASS"
 * 5. failedChecks: FAILの要素名の配列
 *
 * @param input - 三点突合の入力データ
 * @returns 三点突合の検証結果
 */
export function validateTripleCheck(
  input: TripleCheckInput,
): TripleCheckResult {
  const failedChecks: string[] = [];

  // 1. artifacts.json のステータス検証
  const artifactsStatus =
    input.artifactsJsonPath === "completed" ? "PASS" : "FAIL";
  const artifactsDetail =
    artifactsStatus === "PASS"
      ? "artifacts.json の Phase 12 ステータスは completed です"
      : `artifacts.json の Phase 12 ステータスが "${input.artifactsJsonPath}" です（"completed" が必要）`;

  if (artifactsStatus === "FAIL") {
    failedChecks.push("artifacts");
  }

  // 2. changelog の同期ステータス検証
  const changelogStatus = input.changelogPath === "synced" ? "PASS" : "FAIL";
  const changelogDetail =
    changelogStatus === "PASS"
      ? "documentation-changelog.md に全変更仕様書が記録されています"
      : `documentation-changelog.md の同期ステータスが "${input.changelogPath}" です（"synced" が必要）`;

  if (changelogStatus === "FAIL") {
    failedChecks.push("changelog");
  }

  // 3. audit 結果の検証
  const auditStatus =
    input.auditResult.currentViolations.total === 0 ? "PASS" : "FAIL";
  const auditDetail =
    auditStatus === "PASS"
      ? "currentViolations.total === 0: 本タスク起因の違反はありません"
      : `currentViolations.total === ${input.auditResult.currentViolations.total}: ${input.auditResult.currentViolations.details.join(", ")}`;

  if (auditStatus === "FAIL") {
    failedChecks.push("audit");
  }

  // 4. 総合判定: 3要素すべてPASSの場合のみ "PASS"
  const overallStatus: "PASS" | "FAIL" =
    failedChecks.length === 0 ? "PASS" : "FAIL";

  return {
    overallStatus,
    checks: {
      artifacts: { status: artifactsStatus, detail: artifactsDetail },
      changelog: { status: changelogStatus, detail: changelogDetail },
      audit: { status: auditStatus, detail: auditDetail },
    },
    failedChecks,
  };
}
