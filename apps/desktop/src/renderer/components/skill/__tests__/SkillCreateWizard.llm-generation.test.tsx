/**
 * @vitest-environment happy-dom
 * @file SkillCreateWizard.llm-generation.test.tsx
 * @description SkillCreateWizard テンプレート生成フロー統合テスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-SC-07
 *
 * NOTE: LLM生成モード選択UI（ラジオボタン）は SkillInfoStep へ統合されました。
 * LLM生成フローのテストは将来のウィザード再設計タスクで追加予定。
 * UT-SKILL-WIZARD-W1-par-02a: SkillInfoStep への移行に伴うテスト更新
 *
 * AC-8: テンプレートフロー非破壊
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";

// --- mock 関数定義（vi.mock 巻き上げ前に宣言）---
const mockCreateSkill = vi.fn();
const mockSetIsGenerating = vi.fn();
const mockSetGenerationError = vi.fn();
const mockSetGenerationProgress = vi.fn();
const mockSetCurrentPlanId = vi.fn();
const mockSetCurrentPlanResult = vi.fn();
const mockClearGenerationState = vi.fn();
const mockGetWorkflowState = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useCurrentPlanId: () => null,
  useCurrentPlanResult: () => null,
  useSetIsSkillGenerating: () => mockSetIsGenerating,
  useSetGenerationError: () => mockSetGenerationError,
  useSetGenerationProgress: () => mockSetGenerationProgress,
  useSetCurrentPlanId: () => mockSetCurrentPlanId,
  useSetCurrentPlanResult: () => mockSetCurrentPlanResult,
  useClearGenerationState: () => mockClearGenerationState,
  useWorkflowSnapshot: () => null,
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({
    stage: "idle",
    percent: 0,
    message: "",
    previewContent: null,
    error: null,
    isGenerating: false,
  }),
}));

vi.mock("../../../hooks/useCancelGeneration", () => ({
  useCancelGeneration: () => ({
    cancelGeneration: vi.fn(),
    startGeneration: vi.fn(),
  }),
}));

describe("SkillCreateWizard テンプレート生成フロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSkill.mockResolvedValue("/path/to/skill");
    Object.defineProperty(window, "skillCreatorAPI", {
      value: {
        planSkill: vi.fn(),
        executePlan: vi.fn(),
        getWorkflowState: mockGetWorkflowState,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    Reflect.deleteProperty(window, "skillCreatorAPI");
  });

  // ============================================================
  // AC-8: テンプレートフロー非破壊
  // ============================================================
  describe("AC-8: テンプレートフロー非破壊", () => {
    it("W-7: デフォルト（テンプレートモード）で目的入力後に ConfigureStep に遷移する", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      // SkillInfoStep: 目的・背景フィールドに10文字以上入力
      fireEvent.change(screen.getByLabelText(/目的・背景/), {
        target: { value: "テストスキルの目的説明" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(screen.getByText("タスク生成")).toBeInTheDocument();
    });

    it("W-8: テンプレートモードで createSkill が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/目的・背景/), {
        target: { value: "テストスキルの目的説明" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });

    it("M-3: デフォルトはテンプレートモードで ConfigureStep に遷移する", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);

      fireEvent.change(screen.getByLabelText(/目的・背景/), {
        target: { value: "テストスキルの目的説明" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(
        screen.getByRole("button", { name: "スキルを生成" }),
      ).toBeInTheDocument();
    });
  });

  // ============================================================
  // Step 0 UI 確認（SkillInfoStep）
  // ============================================================
  describe("Step 0: SkillInfoStep UI", () => {
    it("スキル名フィールドが表示される", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      expect(screen.getByLabelText(/スキル名/)).toBeInTheDocument();
    });

    it("目的・背景フィールドが表示される", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      expect(screen.getByLabelText(/目的・背景/)).toBeInTheDocument();
    });

    it("目的が10文字未満のとき「次へ」ボタンは無効", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      fireEvent.change(screen.getByLabelText(/目的・背景/), {
        target: { value: "短い" },
      });
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("目的が10文字以上のとき「次へ」ボタンは有効", () => {
      render(<SkillCreateWizard onClose={vi.fn()} />);
      fireEvent.change(screen.getByLabelText(/目的・背景/), {
        target: { value: "テストスキルの目的説明" },
      });
      fireEvent.click(screen.getByRole("button", { name: "自動化" }));
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });
  });
});
