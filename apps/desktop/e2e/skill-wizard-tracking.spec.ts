/**
 * @file skill-wizard-tracking.spec.ts
 * @description スキルウィザード trackEvent の E2E UI 到達確認テスト
 * @task UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
 *
 * AC-1: InfoStep → ConversationRoundStep 遷移の E2E 確認（TC-03相当）
 * AC-2: 👍 ボタン → skill_skeleton_quality_feedback(satisfied=true) 発火確認（TC-05相当）
 * AC-3: 👎 ボタン → skill_skeleton_quality_feedback(satisfied=false) 発火確認（TC-06相当）
 * AC-4: execute クリック → skill_wizard_next_action(execute) 発火確認（TC-08相当）
 * AC-5: open_editor クリック → skill_wizard_next_action(open_editor) 発火確認（TC-09相当）
 * AC-6: create_another クリック → skill_wizard_next_action(create_another) 発火確認（TC-11相当）
 * AC-7: 「もう一度作成」後 InfoStep に戻ること確認（TC-12相当）
 */

import { test, expect, type Page } from "@playwright/test";
import {
  assertEventFired,
  clearTrackedEvents,
  injectOnboardingStoreMock,
  initTrackingCapture,
} from "./helpers/wizard-tracking-stub";

// ===== ヘルパー関数 =====

async function navigateToWizard(page: Page): Promise<void> {
  await injectOnboardingStoreMock(page, {
    hasCompleted: true,
    userName: "E2E User",
    selectedStarterTool: "workspace",
  });
  await page.goto("/");

  const dashboardView = page.getByTestId("dashboard-view");
  await expect(dashboardView).toBeVisible({ timeout: 10_000 });

  const skillCenterButton = page.getByTestId(
    "dashboard-suggestion-skill-center",
  );
  await expect(skillCenterButton).toBeVisible({ timeout: 10_000 });
  await skillCenterButton.click();

  await expect(page.getByTestId("skill-center-view")).toBeVisible({
    timeout: 10_000,
  });

  const managementButton = page.getByTestId("header-management-cta");
  await expect(managementButton).toBeVisible({ timeout: 10_000 });
  await managementButton.click();

  await expect(page.getByTestId("skill-management-panel")).toBeVisible({
    timeout: 10_000,
  });

  const openWizardButton = page.getByTestId("skill-management-create-button");
  await expect(openWizardButton).toBeVisible({ timeout: 10_000 });
  await openWizardButton.click();

  await expect(page.getByTestId("skill-create-wizard")).toBeVisible({
    timeout: 10_000,
  });
}

/**
 * InfoStep（Step 0）のフォームを入力して「次へ」をクリックし、
 * ConversationRoundStep（Step 1）が表示されるまで待機する。
 */
async function fillInfoStep(page: Page): Promise<void> {
  // スキル名入力
  const nameInput = page.getByLabel(/スキル名/);
  await nameInput.fill("E2Eテストスキル");

  // 目的・背景入力（10文字以上）
  const purposeInput = page.getByLabel(/目的.*背景/);
  await purposeInput.fill(
    "E2Eテスト用のスキルです。十分な文字数を記述します。",
  );

  // カテゴリ選択
  await page.getByRole("button", { name: "自動化" }).click();

  // 「次へ」ボタンクリック
  await page.getByRole("button", { name: "次へ" }).click();

  // ConversationRoundStep が表示されるまで待機
  await expect(
    page
      .getByTestId("wizard-step-conversation-round")
      .or(page.getByTestId("conversation-round-step")),
  ).toBeVisible({ timeout: 10_000 });
}

/**
 * ConversationRoundStep（Step 1）をスキップして GenerateStep（Step 2）に進み、
 * 生成完了後に CompleteStep（Step 3）が表示されるまで待機する。
 */
async function generateSkill(page: Page): Promise<void> {
  await page.getByRole("button", { name: "今すぐ生成する" }).click();
  const confirmGenerateButton = page.getByRole("button", {
    name: /^生成する$/,
  });
  await expect(confirmGenerateButton).toBeVisible({ timeout: 10_000 });
  await confirmGenerateButton.click();

  // CompleteStep が表示されるまで待機（最大 30 秒）
  await expect(page.getByTestId("complete-step")).toBeVisible({
    timeout: 30_000,
  });
}

// ===== テストスイート =====

test.describe("スキルウィザード trackEvent E2E UI 到達確認", () => {
  // TC-03: AC-1 対応
  test("TC-03: InfoStep → ConversationRoundStep 遷移後にトラッキングが到達可能な状態になる (AC-1)", async ({
    page,
  }) => {
    await initTrackingCapture(page);
    await navigateToWizard(page);
    await assertEventFired(page, "skill_wizard_started");
    await clearTrackedEvents(page);

    await fillInfoStep(page);

    // ConversationRoundStep が visible であることを確認
    await expect(
      page
        .getByTestId("wizard-step-conversation-round")
        .or(page.getByTestId("conversation-round-step")),
    ).toBeVisible();
  });

  // CompleteStep 到達テスト群（TC-05/06/08/09/11/12）
  test.describe("CompleteStep での trackEvent 発火確認", () => {
    test.beforeEach(async ({ page }) => {
      await initTrackingCapture(page);
      await navigateToWizard(page);
      await fillInfoStep(page);
      await generateSkill(page);
      await assertEventFired(page, "skill_wizard_step1_completed", {
        method: "skip",
      });
      await clearTrackedEvents(page);
    });

    // TC-05: AC-2 対応
    test("TC-05: 👍 ボタン押下で skill_skeleton_quality_feedback(satisfied=true) が発火する (AC-2)", async ({
      page,
    }) => {
      await page.getByTestId("complete-step-feedback-satisfied").click();
      await assertEventFired(page, "skill_skeleton_quality_feedback", {
        satisfied: true,
      });
    });

    // TC-06: AC-3 対応
    test("TC-06: 👎 ボタン押下で skill_skeleton_quality_feedback(satisfied=false) が発火する (AC-3)", async ({
      page,
    }) => {
      await page.getByTestId("complete-step-feedback-unsatisfied").click();
      await assertEventFired(page, "skill_skeleton_quality_feedback", {
        satisfied: false,
      });
    });

    // TC-08: AC-4 対応
    test("TC-08: execute クリックで skill_wizard_next_action(execute) が発火する (AC-4)", async ({
      page,
    }) => {
      await page.getByTestId("complete-step-action-execute").click();
      await assertEventFired(page, "skill_wizard_next_action", {
        action: "execute",
      });
    });

    // TC-09: AC-5 対応
    test("TC-09: open_editor クリックで skill_wizard_next_action(open_editor) が発火する (AC-5)", async ({
      page,
    }) => {
      await page.getByTestId("complete-step-action-open-editor").click();
      await assertEventFired(page, "skill_wizard_next_action", {
        action: "open_editor",
      });
    });

    // TC-11: AC-6 対応
    test("TC-11: create_another クリックで skill_wizard_next_action(create_another) が発火する (AC-6)", async ({
      page,
    }) => {
      await page.getByTestId("complete-step-action-create-another").click();
      await assertEventFired(page, "skill_wizard_next_action", {
        action: "create_another",
      });
    });

    // TC-12: AC-7 対応
    test("TC-12: 「もう一度作成」後 InfoStep に戻ること確認 (AC-7)", async ({
      page,
    }) => {
      await page.getByTestId("complete-step-action-create-another").click();

      await expect(page.getByTestId("wizard-step-info")).toBeVisible();
    });
  });
});
