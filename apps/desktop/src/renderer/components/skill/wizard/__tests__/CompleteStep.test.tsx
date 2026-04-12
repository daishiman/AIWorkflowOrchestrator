/**
 * @file CompleteStep.test.tsx
 * @description CompleteStep コンポーネント ユニットテスト
 * @phase Phase 4+6: テスト作成・拡充（TDD）
 * @task UT-SKILL-WIZARD-W1-par-02c
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompleteStep } from "../CompleteStep";
import type { CompleteStepProps } from "../CompleteStep";
import * as trackEventModule from "../../../../utils/trackEvent";

const mockTrackEvent = vi
  .spyOn(trackEventModule, "trackEvent")
  .mockImplementation(() => {});

// ------------------------------------------
// テスト用デフォルト Props
// ------------------------------------------
const defaultProps: CompleteStepProps = {
  hasExternalIntegration: false,
  onQualityFeedback: vi.fn(),
};

const renderCompleteStep = (props?: Partial<CompleteStepProps>) =>
  render(<CompleteStep {...defaultProps} {...props} />);

// ==========================================================
// Phase 4: 基本テスト
// ==========================================================
describe("CompleteStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------
  // 1. 基本レンダリング
  // ------------------------------------------
  describe("基本レンダリング", () => {
    it("完了ヘッダーが表示される", () => {
      renderCompleteStep();

      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(
        screen.getByText("スキルの骨格を生成しました"),
      ).toBeInTheDocument();
    });

    it("👍フィードバックボタンが表示される", () => {
      renderCompleteStep();

      expect(
        screen.getByTestId("complete-step-feedback-satisfied"),
      ).toBeInTheDocument();
    });

    it("👎フィードバックボタンが表示される", () => {
      renderCompleteStep();

      expect(
        screen.getByTestId("complete-step-feedback-unsatisfied"),
      ).toBeInTheDocument();
    });

    it("ネクストアクション3カードが全て表示される", () => {
      renderCompleteStep();

      expect(
        screen.getByTestId("complete-step-action-execute"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-create-another"),
      ).toBeInTheDocument();
    });

    it("skillPath が null でもレンダリングできる", () => {
      expect(() => renderCompleteStep({ skillPath: null })).not.toThrow();
    });

    it("ルートコンテナにdata-testidが付与されている", () => {
      renderCompleteStep();

      expect(screen.getByTestId("complete-step")).toBeInTheDocument();
    });

    it("skillPath が指定された場合に表示される", () => {
      renderCompleteStep({ skillPath: "/mock/skills/slack-notifier" });

      expect(
        screen.getByTestId("complete-step-skill-path"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("/mock/skills/slack-notifier"),
      ).toBeInTheDocument();
    });

    it("skillPath が未指定の場合は表示されない", () => {
      renderCompleteStep();

      expect(screen.queryByTestId("complete-step-skill-path")).toBeNull();
    });
  });

  // ------------------------------------------
  // 2. 品質フィードバック
  // ------------------------------------------
  describe("品質フィードバック", () => {
    it("👍クリックでonQualityFeedback(true)が呼ばれる", () => {
      const onQualityFeedback = vi.fn();
      renderCompleteStep({ onQualityFeedback });

      fireEvent.click(screen.getByTestId("complete-step-feedback-satisfied"));

      expect(onQualityFeedback).toHaveBeenCalledTimes(1);
      expect(onQualityFeedback).toHaveBeenCalledWith(true);
    });

    it("👎クリックでonQualityFeedback(false)が呼ばれる", () => {
      const onQualityFeedback = vi.fn();
      renderCompleteStep({ onQualityFeedback });

      fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

      expect(onQualityFeedback).toHaveBeenCalledTimes(1);
      expect(onQualityFeedback).toHaveBeenCalledWith(false);
    });

    it("👎クリックでonRetryが呼ばれる", () => {
      const onRetry = vi.fn();
      renderCompleteStep({ onRetry });

      fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("onRetryが未指定でも👎クリックでonQualityFeedbackだけ呼ばれる", () => {
      const onQualityFeedback = vi.fn();
      renderCompleteStep({ onQualityFeedback, onRetry: undefined });

      fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

      expect(onQualityFeedback).toHaveBeenCalledTimes(1);
      expect(onQualityFeedback).toHaveBeenCalledWith(false);
    });

    it("フィードバック送信後は二重送信されない", () => {
      const onQualityFeedback = vi.fn();
      renderCompleteStep({ onQualityFeedback });

      const btn = screen.getByTestId("complete-step-feedback-satisfied");
      fireEvent.click(btn);
      fireEvent.click(btn);

      expect(onQualityFeedback).toHaveBeenCalledTimes(1);
    });
  });

  // ------------------------------------------
  // 3. ネクストアクションカード
  // ------------------------------------------
  describe("ネクストアクションカード", () => {
    it("「今すぐ実行する」カードクリックでonExecuteNowが呼ばれる", () => {
      const onExecuteNow = vi.fn();
      renderCompleteStep({ onExecuteNow });

      fireEvent.click(screen.getByTestId("complete-step-action-execute"));

      expect(onExecuteNow).toHaveBeenCalledTimes(1);
    });

    it("「エディタで開く」カードクリックでonOpenInEditorが呼ばれる", () => {
      const onOpenInEditor = vi.fn();
      renderCompleteStep({ onOpenInEditor });

      fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));

      expect(onOpenInEditor).toHaveBeenCalledTimes(1);
    });

    it("「別のスキルを作る」カードクリックでonCreateAnotherが呼ばれる", () => {
      const onCreateAnother = vi.fn();
      renderCompleteStep({ onCreateAnother });

      fireEvent.click(
        screen.getByTestId("complete-step-action-create-another"),
      );

      expect(onCreateAnother).toHaveBeenCalledTimes(1);
    });

    it("onExecuteNowが未指定の場合カードがdisabledになる", () => {
      renderCompleteStep({ onExecuteNow: undefined });

      expect(screen.getByTestId("complete-step-action-execute")).toBeDisabled();
    });

    it("onOpenInEditorが未指定の場合カードがdisabledになる", () => {
      renderCompleteStep({ onOpenInEditor: undefined });

      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).toBeDisabled();
    });

    it("onCreateAnotherが未指定の場合カードがdisabledになる", () => {
      renderCompleteStep({ onCreateAnother: undefined });

      expect(
        screen.getByTestId("complete-step-action-create-another"),
      ).toBeDisabled();
    });

    it("ハンドラが指定されている場合カードはdisabledでない", () => {
      renderCompleteStep({
        onExecuteNow: vi.fn(),
        onOpenInEditor: vi.fn(),
        onCreateAnother: vi.fn(),
      });

      expect(
        screen.getByTestId("complete-step-action-execute"),
      ).not.toBeDisabled();
      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).not.toBeDisabled();
      expect(
        screen.getByTestId("complete-step-action-create-another"),
      ).not.toBeDisabled();
    });
  });

  // ------------------------------------------
  // 4. 外部連携チェックリスト
  // ------------------------------------------
  describe("外部連携チェックリスト", () => {
    it("hasExternalIntegration=trueの場合チェックリストが表示される", () => {
      renderCompleteStep({ hasExternalIntegration: true });

      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toBeInTheDocument();
    });

    it("hasExternalIntegration=falseの場合チェックリストが非表示", () => {
      renderCompleteStep({ hasExternalIntegration: false });

      expect(
        screen.queryByTestId("complete-step-external-checklist"),
      ).not.toBeInTheDocument();
    });

    it("Webhookチェックボックスをクリックでトグルできる", () => {
      renderCompleteStep({ hasExternalIntegration: true });

      const checkbox = screen.getByTestId("complete-step-check-webhook");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("テスト実行チェックボックスをクリックでトグルできる", () => {
      renderCompleteStep({ hasExternalIntegration: true });

      const checkbox = screen.getByTestId("complete-step-check-test-run");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  // ==========================================================
  // Phase 6: エッジケース
  // ==========================================================
  describe("エッジケース", () => {
    it("skillPath=nullでも正常にレンダリングされる", () => {
      expect(() => renderCompleteStep({ skillPath: null })).not.toThrow();
      expect(screen.getByTestId("complete-step")).toBeInTheDocument();
    });

    it("externalToolNameが未指定の場合にデフォルト名が表示される", () => {
      renderCompleteStep({
        hasExternalIntegration: true,
        externalToolName: undefined,
      });

      expect(screen.getByText(/外部ツール/)).toBeInTheDocument();
    });

    it("externalToolNameが指定されている場合にその名前が表示される", () => {
      renderCompleteStep({
        hasExternalIntegration: true,
        externalToolName: "Slack",
      });

      expect(screen.getByText(/Slack/)).toBeInTheDocument();
    });

    it("全てのオプショナルPropsが未指定でも正常動作する", () => {
      expect(() =>
        renderCompleteStep({
          onExecuteNow: undefined,
          onOpenInEditor: undefined,
          onCreateAnother: undefined,
          onRetry: undefined,
        }),
      ).not.toThrow();
    });

    it("非常に長いexternalToolNameでもUI崩れなし", () => {
      renderCompleteStep({
        hasExternalIntegration: true,
        externalToolName: "非常に長いSlack Webhook URLを持つ外部連携ツール",
      });

      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toBeInTheDocument();
    });
  });

  // ==========================================================
  // Phase 6: 統合シナリオ
  // ==========================================================
  describe("統合シナリオ", () => {
    it("リカバリーフロー全体が正しく動作する", () => {
      const onQualityFeedback = vi.fn();
      const onRetry = vi.fn();
      renderCompleteStep({ onQualityFeedback, onRetry });

      fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

      expect(onQualityFeedback).toHaveBeenCalledWith(false);
      expect(onRetry).toHaveBeenCalledTimes(1);
      // 二重送信防止: フィードバックボタンがdisabledになる
      expect(
        screen.getByTestId("complete-step-feedback-satisfied"),
      ).toBeDisabled();
      expect(
        screen.getByTestId("complete-step-feedback-unsatisfied"),
      ).toBeDisabled();
    });

    it("外部連携ありで全チェック完了後の状態が正しい", () => {
      renderCompleteStep({ hasExternalIntegration: true });

      const webhookCheck = screen.getByTestId("complete-step-check-webhook");
      const testRunCheck = screen.getByTestId("complete-step-check-test-run");

      fireEvent.click(webhookCheck);
      fireEvent.click(testRunCheck);

      expect(webhookCheck).toBeChecked();
      expect(testRunCheck).toBeChecked();
    });

    it("ネクストアクション → フィードバックの順で操作しても正常動作する", () => {
      const onExecuteNow = vi.fn();
      const onQualityFeedback = vi.fn();
      renderCompleteStep({ onExecuteNow, onQualityFeedback });

      fireEvent.click(screen.getByTestId("complete-step-action-execute"));
      fireEvent.click(screen.getByTestId("complete-step-feedback-satisfied"));

      expect(onExecuteNow).toHaveBeenCalledTimes(1);
      expect(onQualityFeedback).toHaveBeenCalledWith(true);
    });
  });

  // ==========================================================
  // Phase 6: アクセシビリティ
  // ==========================================================
  describe("アクセシビリティ", () => {
    it("完了ヘッダーにrole=statusが付与されている", () => {
      renderCompleteStep();

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("フィードバックボタンにaria-labelが付与されている", () => {
      renderCompleteStep();

      expect(
        screen.getByTestId("complete-step-feedback-satisfied"),
      ).toHaveAttribute("aria-label", "期待通り");
      expect(
        screen.getByTestId("complete-step-feedback-unsatisfied"),
      ).toHaveAttribute("aria-label", "イメージと違う、やり直す");
    });

    it("disabled状態のカードにaria-disabledが付与されている", () => {
      renderCompleteStep({
        onExecuteNow: undefined,
        onOpenInEditor: undefined,
        onCreateAnother: undefined,
      });

      expect(
        screen.getByTestId("complete-step-action-execute"),
      ).toHaveAttribute("aria-disabled", "true");
      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).toHaveAttribute("aria-disabled", "true");
      expect(
        screen.getByTestId("complete-step-action-create-another"),
      ).toHaveAttribute("aria-disabled", "true");
    });

    it("チェックボックスにaria-checkedが反映される", () => {
      renderCompleteStep({ hasExternalIntegration: true });

      const webhookCheck = screen.getByTestId("complete-step-check-webhook");
      expect(webhookCheck).toHaveAttribute("aria-checked", "false");

      fireEvent.click(webhookCheck);
      expect(webhookCheck).toHaveAttribute("aria-checked", "true");
    });
  });

  // ==========================================================
  // Phase 6: スナップショット
  // ==========================================================
  describe("スナップショット", () => {
    it("標準表示のスナップショットが一致する", () => {
      const { container } = renderCompleteStep({
        hasExternalIntegration: false,
      });
      expect(container).toMatchSnapshot();
    });

    it("外部連携あり表示のスナップショットが一致する", () => {
      const { container } = renderCompleteStep({
        hasExternalIntegration: true,
        externalToolName: "Slack",
      });
      expect(container).toMatchSnapshot();
    });
  });

  // ==========================================================
  // Phase 4+6: 計装テスト（trackEvent / W3-seq-04）
  // ==========================================================
  describe("計装（trackEvent）", () => {
    it("TC-CS-01: 今すぐ実行するクリック時に skill_wizard_next_action action:execute が発火する", () => {
      const onExecuteNow = vi.fn();
      renderCompleteStep({ onExecuteNow });
      fireEvent.click(screen.getByTestId("complete-step-action-execute"));
      expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
        action: "execute",
      });
      expect(onExecuteNow).toHaveBeenCalledTimes(1);
    });

    it("TC-CS-02: エディタで開くクリック時に skill_wizard_next_action action:edit が発火する", () => {
      const onOpenInEditor = vi.fn();
      renderCompleteStep({ onOpenInEditor });
      fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));
      expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
        action: "edit",
      });
      expect(onOpenInEditor).toHaveBeenCalledTimes(1);
    });

    it("TC-CS-03: 別のスキルを作るクリック時に skill_wizard_next_action action:close が発火する", () => {
      const onCreateAnother = vi.fn();
      renderCompleteStep({ onCreateAnother });
      fireEvent.click(
        screen.getByTestId("complete-step-action-create-another"),
      );
      expect(mockTrackEvent).toHaveBeenCalledWith("skill_wizard_next_action", {
        action: "close",
      });
      expect(onCreateAnother).toHaveBeenCalledTimes(1);
    });

    it("TC-CS-04: 閉じるボタンクリック時に skill_wizard_next_action が発火しない", () => {
      const onClose = vi.fn();
      renderCompleteStep({ onClose });
      fireEvent.click(screen.getByText("閉じる"));
      expect(mockTrackEvent).not.toHaveBeenCalledWith(
        "skill_wizard_next_action",
        expect.anything(),
      );
    });

    it("TC-CS-05: 同じネクストアクションを連打しても 1 回だけ発火する", () => {
      const onExecuteNow = vi.fn();
      renderCompleteStep({ onExecuteNow });

      const button = screen.getByTestId("complete-step-action-execute");
      fireEvent.click(button);
      fireEvent.click(button);

      expect(
        mockTrackEvent.mock.calls.filter(
          ([eventName]) => eventName === "skill_wizard_next_action",
        ),
      ).toHaveLength(1);
      expect(onExecuteNow).toHaveBeenCalledTimes(1);
    });
  });
});
