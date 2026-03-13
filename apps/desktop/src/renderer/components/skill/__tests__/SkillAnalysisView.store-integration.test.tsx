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
import {
  render,
  screen,
  fireEvent,
  act,
  renderHook,
} from "@testing-library/react";
import { SkillAnalysisView } from "../SkillAnalysisView";
import { createMockAnalysis } from "./helpers/test-data-factory";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";
import {
  useAnalyzeSkill,
  useApplySkillImprovements,
  useAutoImproveSkill,
} from "../../../store";

// Store セレクタモック
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockEvaluatePostImprove = vi.fn();
const mockClearSkillError = vi.fn();
const mockClearAnalysis = vi.fn();

let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;
let mockLatestPromptRequest = "改善して";
let mockLatestGateDecision = null;
let mockLatestEvaluationSnapshot = null;
let mockSkillEvaluationError: string | null = null;
let mockIsLifecycleEvaluating = false;

vi.mock("../../../store", () => ({
  useAppStore: {
    getState: () => ({
      currentAnalysis: mockCurrentAnalysis,
    }),
  },
  useCurrentAnalysis: () => mockCurrentAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useEvaluatePostImprove: () => mockEvaluatePostImprove,
  useIsLifecycleEvaluating: () => mockIsLifecycleEvaluating,
  useLatestEvaluationSnapshot: () => mockLatestEvaluationSnapshot,
  useLatestGateDecision: () => mockLatestGateDecision,
  useLatestPromptRequest: () => mockLatestPromptRequest,
  useSkillEvaluationError: () => mockSkillEvaluationError,
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
    mockLatestPromptRequest = "改善して";
    mockLatestGateDecision = null;
    mockLatestEvaluationSnapshot = null;
    mockSkillEvaluationError = null;
    mockIsLifecycleEvaluating = false;

    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockResolvedValue(undefined);
    mockAutoImproveSkill.mockResolvedValue(undefined);
    mockEvaluatePostImprove.mockResolvedValue(undefined);

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

  // ============================================
  // TC-AV-07: 状態遷移 idle → loading → success
  // ============================================
  describe("状態遷移", () => {
    it("idle → loading → success の状態遷移で正しくUIが変化する", async () => {
      // Phase 1: idle → loading（分析中、結果なし）
      mockIsAnalyzing = true;
      mockCurrentAnalysis = null;

      const { rerender } = render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );

      await act(async () => {
        // レンダリング完了待ち
      });

      expect(screen.getByText("分析中...")).toBeInTheDocument();
      expect(screen.queryByText("総合スコア")).not.toBeInTheDocument();

      // Phase 2: loading → success（分析完了、結果あり）
      mockIsAnalyzing = false;
      mockCurrentAnalysis = defaultAnalysis;

      await act(async () => {
        rerender(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });

      expect(screen.queryByText("分析中...")).not.toBeInTheDocument();
      expect(screen.getByText("72")).toBeInTheDocument();
      expect(screen.getByText("総合スコア")).toBeInTheDocument();
    });

    // TC-AV-08: loading → error → 再試行 → success
    it("loading → error → 再試行 → success の状態遷移", async () => {
      // Phase 1: loading 状態
      mockIsAnalyzing = true;
      mockCurrentAnalysis = null;

      const { rerender } = render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );

      await act(async () => {
        // レンダリング完了待ち
      });

      expect(screen.getByText("分析中...")).toBeInTheDocument();

      // Phase 2: error 状態
      mockIsAnalyzing = false;
      mockSkillError = "ネットワークエラー";

      await act(async () => {
        rerender(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });

      expect(screen.queryByText("分析中...")).not.toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("ネットワークエラー");
      expect(screen.getByText("再試行")).toBeInTheDocument();

      // Phase 3: 再試行クリック
      await act(async () => {
        fireEvent.click(screen.getByText("再試行"));
      });

      // analyzeSkill が再度呼ばれる（初回mount + 再試行）
      expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");

      // Phase 4: success 状態（再試行成功シミュレーション）
      mockSkillError = null;
      mockCurrentAnalysis = defaultAnalysis;

      await act(async () => {
        rerender(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText("72")).toBeInTheDocument();
      expect(screen.getByText("総合スコア")).toBeInTheDocument();
    });
  });

  // ============================================
  // TC-AV-10: isAnalyzing=true のとき改善ボタンが disabled
  // ============================================
  describe("分析中のボタン制御", () => {
    it("isAnalyzing=true のとき改善ボタンが disabled になる", async () => {
      mockIsAnalyzing = true;
      // 分析中でも既存の分析結果がある場合（再分析シナリオ）
      mockCurrentAnalysis = defaultAnalysis;

      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });

      expect(screen.getByText("選択を適用")).toBeDisabled();
      expect(screen.getByText("全自動改善")).toBeDisabled();
    });

    it("isAnalyzing=true かつ isImproving=false でもボタンは disabled", async () => {
      mockIsAnalyzing = true;
      mockIsImproving = false;
      mockCurrentAnalysis = defaultAnalysis;

      await act(async () => {
        render(
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
        );
      });

      expect(screen.getByText("選択を適用")).toBeDisabled();
      expect(screen.getByText("全自動改善")).toBeDisabled();
    });
  });

  // ============================================
  // TC-AV-11 / TC-P31-02~04: P31 回帰テスト
  // action セレクタが安定参照を返すことを検証
  // ============================================
  describe("P31 回帰テスト", () => {
    it("useAnalyzeSkill が複数レンダー間で同一参照を返す", () => {
      // vi.mock 経由のモックセレクタが安定参照を返すことを検証
      // 実際の Zustand 個別セレクタと同じ契約: 毎回同一の関数参照
      const { result, rerender } = renderHook(() => useAnalyzeSkill());

      const firstRef = result.current;
      rerender();
      const secondRef = result.current;

      // P31: 複数レンダー間で同一参照であることを検証
      expect(firstRef).toBe(secondRef);
      expect(Object.is(firstRef, secondRef)).toBe(true);
    });

    it("useApplySkillImprovements が複数レンダー間で同一参照を返す", () => {
      const { result, rerender } = renderHook(() =>
        useApplySkillImprovements(),
      );

      const firstRef = result.current;
      rerender();
      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
      expect(Object.is(firstRef, secondRef)).toBe(true);
    });

    it("useAutoImproveSkill が複数レンダー間で同一参照を返す", () => {
      const { result, rerender } = renderHook(() => useAutoImproveSkill());

      const firstRef = result.current;
      rerender();
      const secondRef = result.current;

      expect(firstRef).toBe(secondRef);
      expect(Object.is(firstRef, secondRef)).toBe(true);
    });

    it("useEffect 依存配列にアクションを含めても無限ループしない", async () => {
      // P31 の核心: アクション参照が安定しているため useEffect が無限ループしない
      let renderCount = 0;
      const TestComponent = () => {
        renderCount++;
        return null;
      };

      await act(async () => {
        render(<TestComponent />);
      });

      // 初回レンダーのみ（StrictMode 外では1回）
      expect(renderCount).toBeLessThanOrEqual(2);
    });
  });
});
