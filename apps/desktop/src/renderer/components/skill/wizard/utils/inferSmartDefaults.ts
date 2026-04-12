/**
 * @file inferSmartDefaults.ts
 * @description Step 0 の入力から Q1〜Q6 の初期値を推論する純粋関数
 * @task UT-SKILL-WIZARD-W2-seq-03a
 *
 * Phase 8 リファクタリング: SkillCreateWizard.tsx から分離
 */

import type {
  SkillInfoFormData,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";

/**
 * Step 0 の入力から Q1〜Q6 の初期値を推論する純粋関数。
 * - purpose に "Slack" → tool = "slack"
 * - purpose に "GitHub" → tool = "github"
 * - purpose に "Notion" → tool = "notion"
 * - purpose に "毎日/毎週/定期/スケジュール" → timing = "scheduled"
 * - purpose に "リアルタイム/即座/すぐに" → timing = "realtime"
 * - category === "code-support" → format = "code"
 * - category === "data-analysis" → format = "structured"
 */
export function inferSmartDefaults(
  data: SkillInfoFormData,
): SmartDefaultResult {
  const purpose = data.purpose ?? "";
  const purposeLower = purpose.toLowerCase();
  const inferenceLog: string[] = [];
  const result: SmartDefaultResult = {
    who: null,
    input: null,
    timing: null,
    output: null,
    tool: null,
    format: null,
  };

  // ツール推論（大文字小文字を区別しない）
  if (purposeLower.includes("slack")) {
    result.tool = "slack";
    inferenceLog.push("purpose に 'slack' を検出 → tool = 'slack'");
  } else if (purposeLower.includes("github")) {
    result.tool = "github";
    inferenceLog.push("purpose に 'github' を検出 → tool = 'github'");
  } else if (purposeLower.includes("notion")) {
    result.tool = "notion";
    inferenceLog.push("purpose に 'notion' を検出 → tool = 'notion'");
  }

  // タイミング推論
  if (/毎日|毎週|定期|スケジュール/.test(purpose)) {
    result.timing = "scheduled";
    inferenceLog.push(
      "purpose に定期実行キーワードを検出 → timing = 'scheduled'",
    );
  } else if (/リアルタイム|即座|すぐに/.test(purpose)) {
    result.timing = "realtime";
    inferenceLog.push(
      "purpose にリアルタイムキーワードを検出 → timing = 'realtime'",
    );
  }

  // フォーマット推論
  if (data.category === "code-support") {
    result.format = "code";
    inferenceLog.push("category = 'code-support' → format = 'code'");
  } else if (data.category === "data-analysis") {
    result.format = "structured";
    inferenceLog.push("category = 'data-analysis' → format = 'structured'");
  }

  return { ...result, inferenceLog };
}
