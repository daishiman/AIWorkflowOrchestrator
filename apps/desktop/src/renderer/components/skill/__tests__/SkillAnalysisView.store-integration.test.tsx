/**
 * @file SkillAnalysisView.store-integration.test.tsx
 * @description SkillAnalysisView Store統合テスト
 * @task TASK-10A-F Phase 4
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 * P40準拠: apps/desktop ディレクトリから実行
 *
 * Store action経由での分析・改善フローを検証。
 * window.electronAPI直接呼び出しが発生しないことを保証する。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillAnalysisView } from "../SkillAnalysisView";
import { createMockAnalysis } from "./helpers/test-data-factory";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// Store セレクタモック
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearAnalysis = vi.fn();

let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;

vi.mock("../../../store", () => ({
  useCurrentAnalysis: () => mockCurrentAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useClearSkillError: () => mockClearSkillError,
  useClearAnalysis: () => mockClearAnalysis,
}));

// window.electronAPI スパイ
const spyAnalyze = vi.fn();
const spyApplyImprovements = vi.fn();
const spyAutoImprove = vi.fn();

describe("SkillAnalysisView Store統合", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let defaultAnalysis: SkillAnalysis;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    defaultAnalysis = createMockAnalysis();

    // Reset store mock state
    mockCurrentAnalysis = defaultAnalysis;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;

    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockResolvedValue(undefined);
    mockAutoImproveSkill.mockResolvedValue(undefined);

    (window as Record<string, unknown>).electronAPI = {
      skill: {
        analyze: spyAnalyze,
        applyImprovements: spyApplyImprovements,
        autoImprove: spyAutoImprove,
      },
    };

    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    delete (window as Record<string, unknown>).electronAPI;
  });

  describe("store action 経由の分析", () => {
    it("マウント時に store.analyzeSkill が呼ばれる（window.electronAPI.skill.analyze は直接呼ばれない）", async () => {
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");
      expect(spyAnalyze).not.toHaveBeenCalled();
    });

    it("store の currentAnalysis が設定されると分析結果が表示される", async () => {
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(screen.getByText("72")).toBeInTheDocument();
      expect(screen.getByText("総合スコア")).toBeInTheDocument();
    });

    it("store の isAnalyzing が true のとき分析中表示", async () => {
      mockIsAnalyzing = true;
      mockCurrentAnalysis = null;
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(screen.getByText("分析中...")).toBeInTheDocument();
    });

    it("store の skillError が設定されるとエラーメッセージが表示される", async () => {
      mockSkillError = "分析エラーが発生";
      mockCurrentAnalysis = null;
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(screen.getByRole("alert")).toHaveTextContent("分析エラーが発生");
    });
  });

  describe("store action 経由の改善適用", () => {
    it("「選択を適用」クリックで store.applySkillImprovements が呼ばれる", async () => {
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      const checkboxes = screen.getAllByRole("checkbox");
      await act(async () => {
        fireEvent.click(checkboxes[0]);
      });
      await act(async () => {
        fireEvent.click(screen.getByText("選択を適用"));
      });
      expect(mockApplySkillImprovements).toHaveBeenCalledTimes(1);
      expect(spyApplyImprovements).not.toHaveBeenCalled();
    });

    it("store の isImproving が true のときボタンが disabled", async () => {
      mockIsImproving = true;
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(screen.getByText("選択を適用")).toBeDisabled();
      expect(screen.getByText("全自動改善")).toBeDisabled();
    });
  });

  describe("store action 経由の全自動改善", () => {
    it("「全自動改善」クリックで store.autoImproveSkill が呼ばれる", async () => {
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByText("全自動改善"));
      });
      expect(mockAutoImproveSkill).toHaveBeenCalledWith("test-skill");
      expect(spyAutoImprove).not.toHaveBeenCalled();
    });

    it("window.confirm でキャンセルした場合 store.autoImproveSkill は呼ばれない", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      await act(async () => {
        fireEvent.click(screen.getByText("全自動改善"));
      });
      expect(mockAutoImproveSkill).not.toHaveBeenCalled();
    });
  });

  describe("提案選択のローカル状態管理", () => {
    it("提案チェックボックスのトグルがローカル state で管理される", async () => {
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).not.toBeChecked();
      await act(async () => {
        fireEvent.click(checkboxes[0]);
      });
      expect(checkboxes[0]).toBeChecked();
    });
  });

  describe("アクセシビリティ", () => {
    it("エラーメッセージに role='alert' が設定される", async () => {
      mockSkillError = "テストエラー";
      mockCurrentAnalysis = null;
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("閉じるボタンに aria-label='閉じる' が設定される", async () => {
      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });
      expect(screen.getByLabelText("閉じる")).toBeInTheDocument();
    });
  });
});
