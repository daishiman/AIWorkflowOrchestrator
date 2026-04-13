/**
 * @file wizard-exports.test.ts
 * @description wizard barrel contract ガードテスト
 * @task UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
 *
 * DescribeStep が wizard/index.ts から再露出しないことを保証する。
 * DescribeStepProps の type-only 再導入は wizard-exports.typecheck.ts で検出する。
 */

import { describe, it, expect } from "vitest";
import * as WizardExports from "../index";

describe("wizard barrel contract", () => {
  // ──────────────────────────────────────────────────────────────
  // DescribeStep 非存在の確認
  // W2-seq-03b / UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 で削除済み
  // type-only export の監視は wizard-exports.typecheck.ts に分離済み
  // ──────────────────────────────────────────────────────────────
  it("DescribeStep がエクスポートされていないこと", () => {
    expect(WizardExports).not.toHaveProperty("DescribeStep");
  });

  it("DescribeStepProps がランタイム export として現れないこと", () => {
    // type-only export の再導入は compile-time guard で別途検出する
    expect(WizardExports).not.toHaveProperty("DescribeStepProps");
  });

  // ──────────────────────────────────────────────────────────────
  // 現在の公開 export が壊れていないことの確認
  // ──────────────────────────────────────────────────────────────
  it("StepIndicator がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("StepIndicator");
  });

  it("SkillInfoStep がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("SkillInfoStep");
  });

  it("ConversationRoundStep がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("ConversationRoundStep");
  });

  it("InterviewProgressBar がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("InterviewProgressBar");
  });

  it("ApplySummaryCard がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("ApplySummaryCard");
  });

  it("GenerateStep がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("GenerateStep");
  });

  it("CompleteStep がエクスポートされていること", () => {
    expect(WizardExports).toHaveProperty("CompleteStep");
  });
});
