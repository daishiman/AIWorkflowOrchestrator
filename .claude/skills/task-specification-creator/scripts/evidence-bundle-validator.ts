/**
 * evidence-bundle-validator.ts
 *
 * 2workflow同時監査の証跡集約バンドル検証ユーティリティ。
 * 4つのバリデーション関数を提供する。
 */

import { existsSync, statSync } from "fs";
import { basename } from "path";

/** ファイル名の最大長（ext4/NTFS 共通） */
const MAX_FILENAME_LENGTH = 255;

// ── 型定義 ──────────────────────────────────────

export interface WorkflowResult {
  workflowName: string;
  timestamp: string;
  totalSpecs: number;
  passedSpecs: number;
  failedSpecs: number;
  violations: { file: string; rule: string; message: string }[];
}

export interface ChecklistItem {
  taskId: string;
  label: string;
  isChecked: boolean;
}

export interface ChecklistValidationResult {
  status: "complete" | "incomplete";
  missingItems: string[];
}

export interface ViolationEvaluation {
  verdict: "pass" | "fail";
  currentViolations: number;
  baseline: number;
}

export interface ScreenshotVerification {
  exists: boolean;
  capturedAt: string | null;
}

// ── 関数 ────────────────────────────────────────

/**
 * verify-all-specs / validate-phase-output の出力を共通スキーマにパースする。
 *
 * 入力は JSON 文字列を想定。パース失敗時はデフォルト値を持つ WorkflowResult を返す。
 */
export function parseWorkflowResult(rawOutput: string): WorkflowResult {
  const parsed = JSON.parse(rawOutput);
  const workflowName = String(parsed.workflowName ?? "");
  if (workflowName.trim() === "") {
    throw new Error("workflowName must be a non-empty string");
  }

  return {
    workflowName,
    timestamp: String(parsed.timestamp ?? new Date().toISOString()),
    totalSpecs: Number(parsed.totalSpecs ?? 0),
    passedSpecs: Number(parsed.passedSpecs ?? 0),
    failedSpecs: Number(parsed.failedSpecs ?? 0),
    violations: Array.isArray(parsed.violations)
      ? parsed.violations.map(
          (v: Record<string, unknown>) =>
            ({
              file: String(v.file ?? ""),
              rule: String(v.rule ?? ""),
              message: String(v.message ?? ""),
            }) as WorkflowResult["violations"][number],
        )
      : [],
  };
}

/**
 * チェックリスト全項目の記入状態を検証し、未記入項目を返す。
 */
export function validateChecklist(
  checklist: ChecklistItem[],
): ChecklistValidationResult {
  if (checklist.length === 0) {
    return { status: "incomplete", missingItems: [] };
  }

  const missingItems = checklist
    .filter((item) => !item.isChecked)
    .map((item) => item.label);

  return {
    status: missingItems.length === 0 ? "complete" : "incomplete",
    missingItems,
  };
}

/**
 * currentViolations === 0 で合格判定し、baseline は監視値として分離記録する。
 */
export function evaluateViolations(
  current: number,
  baseline: number,
): ViolationEvaluation {
  if (current < 0) {
    throw new Error("currentViolations must be non-negative");
  }

  return {
    verdict: current === 0 ? "pass" : "fail",
    currentViolations: current,
    baseline,
  };
}

/**
 * 画像ファイルの実在確認と更新日時の取得を行う。
 */
export function verifyScreenshot(filePath: string): ScreenshotVerification {
  if (filePath.includes("..")) {
    throw new Error("directory traversal is not allowed");
  }

  const fileName = basename(filePath);
  if (fileName.length > MAX_FILENAME_LENGTH) {
    throw new Error(
      `filename exceeds ${MAX_FILENAME_LENGTH} characters: ${fileName.length}`,
    );
  }

  if (!existsSync(filePath)) {
    return { exists: false, capturedAt: null };
  }

  const stats = statSync(filePath);
  return {
    exists: true,
    capturedAt: stats.mtime.toISOString(),
  };
}
