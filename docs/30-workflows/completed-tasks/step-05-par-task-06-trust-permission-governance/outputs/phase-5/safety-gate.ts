// apps/desktop/src/main/permissions/ への追加内容（正本）
// Task-06 Phase 5 成果物: SafetyGrade / SafetyGateResult / SafetyGatePort / SafetyCheckId / SafetyCheckDetail 型定義

import type { ToolRiskLevel } from "../constants/security";

/**
 * 公開前安全性チェックの総合グレード。
 * Task-08（スキル公開）が本型を参照してブロック判定を行う。
 *
 * 優先度: UNSAFE > SAFE_WITH_WARNINGS > SAFE
 * 複数ルールが同時適用された場合、最も厳しいグレードが採用される。
 *
 * グレード別の Task-08 の動作:
 * - SAFE: 公開処理を続行する
 * - SAFE_WITH_WARNINGS: 警告ダイアログを表示してユーザー確認後に公開する
 * - UNSAFE: 公開処理をブロックし、修正が必要であることをユーザーに通知する
 */
export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

/**
 * 安全性チェック ID の種別。
 * TC-R-001 のデシジョンテーブル対応。
 *
 * | チェックID               | 期待 overallGrade  | 判定条件                                       |
 * | ------------------------ | ------------------ | ---------------------------------------------- |
 * | CRITICAL_TOOL_REQUIRED   | UNSAFE             | Critical ツールを1件以上要求する               |
 * | PROTECTED_PATH_ACCESS    | UNSAFE             | PROTECTED_PATHS に Write/Edit を要求する       |
 * | HIGH_TOOL_REQUIRED       | SAFE_WITH_WARNINGS | High ツールを要求するが Critical ではない      |
 * | NO_PERMANENT_APPROVAL    | SAFE_WITH_WARNINGS | 全ツールが session or approve_once のみ        |
 * | ALL_LOW_TOOLS            | SAFE               | 全ツールが Low リスク                          |
 *
 * グレード優先度ルール（TC-R-002 の複合チェック対応）:
 * - details 内に status:"blocked" が1件以上 → overallGrade = "UNSAFE"
 * - status:"blocked" なし かつ status:"warned" が1件以上 → overallGrade = "SAFE_WITH_WARNINGS"
 * - 全チェックが status:"passed" → overallGrade = "SAFE"
 */
export type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";

/**
 * 個別安全性チェック結果。
 *
 * message 品質基準:
 * - 曖昧表現禁止（「問題があります」「適切ではありません」等は使用不可）
 * - 具体的な操作・パス・理由を含める
 * - 例（OK）: "ツール Bash が PROTECTED_PATH /etc/passwd に書き込みを要求しています"
 * - 例（NG）: "危険なツールが検出されました"
 */
export interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  /** チェック対象のツール名 */
  toolName: string;
  /** ツールのリスクレベル（TOOL_RISK_CONFIG から取得） */
  riskLevel: ToolRiskLevel;
  /**
   * チェック結果ステータス。
   * - passed: このチェックは問題なし（overallGrade への影響なし）
   * - warned: 警告あり（他に blocked がなければ SAFE_WITH_WARNINGS）
   * - blocked: ブロック（overallGrade が UNSAFE になる）
   */
  status: "passed" | "warned" | "blocked";
  /**
   * ユーザー向けメッセージ。
   * 曖昧表現禁止。具体的な操作・パス・理由を含める。
   */
  message: string;
}

/**
 * 公開前安全性チェックの全結果。
 * Task-08 がこの型を受け取り、overallGrade で公開可否を判定する。
 *
 * evaluatedAt の用途:
 * - キャッシュ有効期間の判定（5分以内なら再評価を省略可能）
 * - 監査ログへの記録
 */
export interface SafetyGateResult {
  /** 評価対象のスキル名 */
  skillName: string;
  /** チェック実行タイムスタンプ（Unix ms） */
  evaluatedAt: number;
  /**
   * 総合グレード。
   * details 内の status を集約して決定する（個別上書き不可）。
   */
  overallGrade: SafetyGrade;
  /**
   * 個別チェック結果の一覧。
   * 空配列は「チェック対象ツールが存在しない」を意味し、overallGrade = "SAFE" となる。
   */
  details: SafetyCheckDetail[];
}

/**
 * 安全性チェック関数の契約インターフェース。
 * TC-T-005 の検証対象。
 *
 * Task-08 は本インターフェースを通じて Task-06 の安全性チェックを呼び出す。
 * インターフェースとして定義することで、テスト時にモックを注入可能にする。
 *
 * 実装クラス: SafetyGateService（Task-06 Phase 5 以降で実装）
 * モック実装: MockSafetyGate（テストファイルで inline 定義）
 */
export interface SafetyGatePort {
  /**
   * 指定スキルの公開前安全性チェックを実行する。
   * @param skillName - チェック対象のスキル名
   * @returns チェック結果（キャッシュ可能。evaluatedAt で鮮度を確認すること）
   */
  evaluate(skillName: string): Promise<SafetyGateResult>;
}
