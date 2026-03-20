/**
 * @file SkillAnalysisView.navigation.test.tsx
 * @description SkillAnalysisView - onNavigateBack / onNavigateToAgent Props 拡張 テスト
 * @task Task 5-1
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * 既存テスト SkillAnalysisView.test.tsx のモックパターンを踏襲
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockAnalysis } from "./helpers/test-data-factory";
import { SkillAnalysisView } from "../SkillAnalysisView";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// ============================================
// Store セレクタモック（既存テストと同一パターン）
// ============================================
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearAnalysis = vi.fn();

let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockPreviousAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;

vi.mock("../../../store", () => ({
  useCurrentAnalysis: () => mockCurrentAnalysis,
  usePreviousAnalysis: () => mockPreviousAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useClearSkillError: () => mockClearSkillError,
  useClearAnalysis: () => mockClearAnalysis,
}));

// ============================================
// Test Suite
// ============================================

describe("SkillAnalysisView - navigation props", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnNavigateBack: ReturnType<typeof vi.fn>;
  let mockOnNavigateToAgent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockOnNavigateBack = vi.fn();
    mockOnNavigateToAgent = vi.fn();

    // Reset store mock state
    mockCurrentAnalysis = createMockAnalysis();
    mockPreviousAnalysis = null;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;

    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockResolvedValue(undefined);
    mockAutoImproveSkill.mockResolvedValue(undefined);

    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  // ------------------------------------------
  // 1. baseline: onClose のみでも描画できること（後方互換）
  // ------------------------------------------
  it("baseline: onClose のみでも描画できること（後方互換）", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByTestId("skill-analysis-view")).toBeInTheDocument();
    expect(screen.getByLabelText("閉じる")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("エージェントに戻る"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("エージェントで再実行"),
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. onNavigateBack がある場合、戻りリンクが表示されること
  // ------------------------------------------
  it("onNavigateBack がある場合、戻りリンクが表示されること", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView
          skillName="test-skill"
          onClose={mockOnClose}
          onNavigateBack={mockOnNavigateBack}
        />,
      );
    });

    const backButton = screen.getByLabelText("エージェントに戻る");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent("戻る");
  });

  // ------------------------------------------
  // 3. onNavigateBack がない場合、戻りリンクが表示されないこと
  // ------------------------------------------
  it("onNavigateBack がない場合、戻りリンクが表示されないこと", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(
      screen.queryByLabelText("エージェントに戻る"),
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 4. onNavigateToAgent がある場合、再実行ボタンが表示されること
  // ------------------------------------------
  it("onNavigateToAgent がある場合、再実行ボタンが表示されること", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView
          skillName="test-skill"
          onClose={mockOnClose}
          onNavigateToAgent={mockOnNavigateToAgent}
        />,
      );
    });

    const rerunButton = screen.getByLabelText("エージェントで再実行");
    expect(rerunButton).toBeInTheDocument();
    expect(rerunButton).toHaveTextContent("エージェントで再実行");
  });

  // ------------------------------------------
  // 5. onNavigateToAgent がない場合、再実行ボタンが表示されないこと
  // ------------------------------------------
  it("onNavigateToAgent がない場合、再実行ボタンが表示されないこと", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(
      screen.queryByLabelText("エージェントで再実行"),
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 6. onNavigateBack クリックでコールバックが呼ばれること
  // ------------------------------------------
  it("onNavigateBack クリックでコールバックが呼ばれること", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView
          skillName="test-skill"
          onClose={mockOnClose}
          onNavigateBack={mockOnNavigateBack}
        />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("エージェントに戻る"));
    });

    expect(mockOnNavigateBack).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 7. onNavigateToAgent クリックでコールバックが呼ばれること
  // ------------------------------------------
  it("onNavigateToAgent クリックでコールバックが呼ばれること", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView
          skillName="test-skill"
          onClose={mockOnClose}
          onNavigateToAgent={mockOnNavigateToAgent}
        />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("エージェントで再実行"));
    });

    expect(mockOnNavigateToAgent).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 8. onNavigateBack / onNavigateToAgent 追加後も onClose が機能すること
  // ------------------------------------------
  it("onNavigateBack / onNavigateToAgent 追加後も onClose が機能すること", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView
          skillName="test-skill"
          onClose={mockOnClose}
          onNavigateBack={mockOnNavigateBack}
          onNavigateToAgent={mockOnNavigateToAgent}
        />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("閉じる"));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnNavigateBack).not.toHaveBeenCalled();
    expect(mockOnNavigateToAgent).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // 9. 戻りリンクと再実行ボタンが Tab 到達可能であること
  // ------------------------------------------
  it("戻りリンクと再実行ボタンが Tab 到達可能であること", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView
          skillName="test-skill"
          onClose={mockOnClose}
          onNavigateBack={mockOnNavigateBack}
          onNavigateToAgent={mockOnNavigateToAgent}
        />,
      );
    });

    const backButton = screen.getByLabelText("エージェントに戻る");
    const rerunButton = screen.getByLabelText("エージェントで再実行");

    // tabIndex が -1 でなければ Tab 到達可能（button はデフォルトで tabIndex=0）
    expect(backButton.tagName).toBe("BUTTON");
    expect(backButton).not.toHaveAttribute("tabindex", "-1");

    expect(rerunButton.tagName).toBe("BUTTON");
    expect(rerunButton).not.toHaveAttribute("tabindex", "-1");
  });
});
