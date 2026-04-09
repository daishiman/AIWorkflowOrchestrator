/**
 * @file SkillCreateWizard.test.tsx
 * @description SkillCreateWizard 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 *
 * W2-seq-03a 新設計:
 * - 3ステップ構成（SkillInfoStep / ConversationRoundStep / CompleteStep）
 * - Step 0 → Step 1 で inferSmartDefaults を呼び出す
 * - Step 1 → Step 2 で createSkill を呼び出す
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";
import type { SmartDefaultResult } from "@repo/shared/types/skillCreator";

const mockCreateSkill = vi.fn();
const mockClearGenerationState = vi.fn();
const mockUseWorkflowSnapshot = vi.fn(() => null);
const mockInferSmartDefaults = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useClearGenerationState: () => mockClearGenerationState,
  useWorkflowSnapshot: () => mockUseWorkflowSnapshot(),
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({
    stage: "idle" as const,
    percent: 0,
    message: "",
    previewContent: null,
    error: null,
    isGenerating: false,
  }),
}));

vi.mock("../../../hooks/useCancelGeneration", () => ({
  useCancelGeneration: () => ({ cancelGeneration: vi.fn() }),
}));

vi.mock(
  "../../../../../../../packages/shared/src/services/skillCreator/index.ts",
  () => ({
    inferSmartDefaults: (...args: unknown[]) => mockInferSmartDefaults(...args),
  }),
);

const defaultSmartDefaults: SmartDefaultResult = {
  who: "チームメンバー",
  input: "テキスト",
  timing: "定期実行",
  output: "通知",
  tool: "Slack",
  format: "Markdown",
  inferenceLog: ["mock"],
};

function renderWizard(onClose = vi.fn()) {
  render(<SkillCreateWizard onClose={onClose} />);
  return onClose;
}

function fillStep0(
  purpose = "Slack通知を毎日送るための目的説明",
  category = "外部連携",
) {
  fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
    target: { value: purpose },
  });
  fireEvent.click(screen.getByRole("button", { name: category }));
}

async function advanceToStep1() {
  fillStep0();
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  await act(async () => {
    await Promise.resolve();
  });
}

async function advanceToComplete() {
  await advanceToStep1();
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "生成する" }));
  });
  await act(async () => {
    await mockCreateSkill.mock.results[0]?.value;
  });
}

describe("SkillCreateWizard", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/mock/skills/new-skill");
    mockInferSmartDefaults.mockReturnValue(defaultSmartDefaults);
    mockUseWorkflowSnapshot.mockReturnValue(null);
  });

  describe("初期表示", () => {
    it("Step 0（スキル情報入力）が最初に表示される", () => {
      renderWizard(mockOnClose);

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByText("目的・背景")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByTestId("skill-create-wizard")).toHaveAttribute(
        "data-route-kind",
        "destination",
      );
    });
  });

  describe("ステップ遷移", () => {
    it("Step 0 → Step 1 で inferSmartDefaults が呼ばれ、結果が Step 1 に渡る", async () => {
      renderWizard(mockOnClose);

      fillStep0();
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      // Slack+毎日 → timing="scheduled"="定期実行" が自動選択される
      expect(screen.getByRole("button", { name: "定期実行" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        screen.getByRole("button", { name: "次のページ" }),
      ).toBeInTheDocument();
    });

    it("Step 1 から Step 0 に戻ると formData が保持される", async () => {
      renderWizard(mockOnClose);

      const purpose = "保持テストの入力データ";
      fillStep0(purpose);
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });

      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue(
        purpose,
      );
    });

    it("Step 1 の生成完了後に Step 2（CompleteStep）が表示される", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      expect(screen.getByTestId("wizard-step-complete")).toBeInTheDocument();
      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-execute"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-create-another"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toHaveTextContent("Slack Webhook URL を設定する");
    });
  });

  describe("完了画面", () => {
    it("今すぐ実行する / エディタで開く で onClose が呼ばれる", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      fireEvent.click(screen.getByTestId("complete-step-action-execute"));
      fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it("別のスキルを作るで Step 0 に戻り、入力がリセットされる", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      fireEvent.click(
        screen.getByTestId("complete-step-action-create-another"),
      );

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue("");
      expect(screen.queryByTestId("complete-step-header")).toBeNull();
    });

    it("👎 で Step 0 に戻り、formData が保持される", async () => {
      const purpose = "テストスキルの説明文字列";
      renderWizard(mockOnClose);

      fillStep0(purpose);
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });
      fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue(
        purpose,
      );
    });
  });

  describe("エラー表示", () => {
    it("createSkill が失敗した場合はエラーが表示される", async () => {
      mockCreateSkill.mockRejectedValue(new Error("生成失敗"));
      renderWizard(mockOnClose);

      await advanceToStep1();
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("生成失敗")).toBeInTheDocument();
    });

    it("createSkill が空文字を返した場合はフォールバックエラーが表示される", async () => {
      mockCreateSkill.mockResolvedValue("");
      renderWizard(mockOnClose);

      await advanceToStep1();
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });
  });
});
