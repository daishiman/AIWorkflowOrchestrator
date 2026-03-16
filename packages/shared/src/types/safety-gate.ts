/**
 * Safety Gate Types - スキル公開前安全性チェックの型定義
 *
 * UT-06-003: SafetyGatePort concrete class implementation
 *
 * @module safety-gate
 */

/**
 * ツール操作のリスクレベル分類
 */
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

/**
 * ツールリスク設定
 */
export interface ToolRiskConfig {
  level: ToolRiskLevel;
  allowApproveOnce: boolean;
  allowPermanent: boolean;
  autoDenyDefault: boolean;
  headerColorToken: string;
  dialogWidth: 400 | 480 | 640;
}

/**
 * ツールリスクレベル別設定マップ
 */
export const TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig> = {
  critical: {
    level: "critical",
    allowApproveOnce: false,
    allowPermanent: false,
    autoDenyDefault: true,
    headerColorToken: "--status-destructive",
    dialogWidth: 640,
  },
  high: {
    level: "high",
    allowApproveOnce: true,
    allowPermanent: false,
    autoDenyDefault: false,
    headerColorToken: "--status-warning",
    dialogWidth: 480,
  },
  medium: {
    level: "medium",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-caution",
    dialogWidth: 400,
  },
  low: {
    level: "low",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-info",
    dialogWidth: 400,
  },
};

/**
 * 安全性チェックの総合グレード
 */
export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

/**
 * 安全性チェックの種別ID
 */
export type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";

/**
 * 個別チェック結果の詳細
 */
export interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "passed" | "warned" | "blocked";
  message: string;
}

/**
 * 安全性チェックの総合結果
 */
export interface SafetyGateResult {
  skillName: string;
  evaluatedAt: number;
  overallGrade: SafetyGrade;
  details: SafetyCheckDetail[];
}

/**
 * SafetyGate ポートインターフェース
 */
export interface SafetyGatePort {
  evaluate(skillName: string): Promise<SafetyGateResult>;
}
