/**
 * @file SkillAnalysisView.test.tsx
 * @description SkillAnalysisView organism コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-B, TASK-10A-F (Store統合)
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P47準拠: 子コンポーネントのスタイル定数はimportして検証
 * TASK-10A-F: window.electronAPI直接呼び出しからStore action経由に移行
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockAnalysis,
  createMockSuggestion,
} from "./helpers/test-data-factory";
import { SkillAnalysisView } from "../SkillAnalysisView";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// ============================================
// Store セレクタモック（TASK-10A-F: Store action経由に統一）
// ============================================
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
let mockLatestPromptRequest: string | null = "改善して";
let mockLatestGateDecision: {
  status: string;
  totalScore: number;
  summary: string;
  nextSurface: string;
  stage: string;
  blockingIssues: string[];
  recommended: boolean;
} | null = null;
let mockLatestEvaluationSnapshot: {
  stage: string;
  deltaFromPrevious?: number;
} | null = null;
let mockSkillEvaluationError: string | null = null;
let mockIsLifecycleEvaluating = false;

const getOverallScoreElement = (score: number | string) => {
  const scoreText = String(score);
  return screen
    .getAllByText(scoreText)
    .find((element) => element.className.includes("text-4xl"));
};

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
  useLatestPromptRequest: () => mockLatestPromptRequest,
  useLatestGateDecision: () => mockLatestGateDecision,
  useLatestEvaluationSnapshot: () => mockLatestEvaluationSnapshot,
  useSkillEvaluationError: () => mockSkillEvaluationError,
  useIsLifecycleEvaluating: () => mockIsLifecycleEvaluating,
  useClearSkillError: () => mockClearSkillError,
  useClearAnalysis: () => mockClearAnalysis,
}));

// ============================================
// Test Suite
// ============================================

describe("SkillAnalysisView", () => {
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
    mockEvaluatePostImprove.mockResolvedValue(undefined);
    mockLatestPromptRequest = "改善して";
    mockLatestGateDecision = {
      status: "save_with_warning",
      totalScore: 72,
      summary: "保存は可能ですが、改善余地が残っています。",
      nextSurface: "skillCenter",
      stage: "post_create",
      blockingIssues: [],
      recommended: false,
    };
    mockLatestEvaluationSnapshot = {
      stage: "post_create",
      deltaFromPrevious: 4,
    };
    mockSkillEvaluationError = null;
    mockIsLifecycleEvaluating = false;

    // window.confirm モック
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  // ------------------------------------------
  // 1. 初期ローディング状態を表示する
  // ------------------------------------------
  it("初期ローディング状態を表示する", async () => {
    mockIsAnalyzing = true;
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByText("分析中...")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. 分析APIを自動呼び出しする
  // ------------------------------------------
  it("分析APIを自動呼び出しする", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");
  });

  // ------------------------------------------
  // 3. 分析結果の正常表示
  // ------------------------------------------
  it("分析結果の正常表示", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // ScoreDisplay が描画される（総合スコア表示）
    expect(getOverallScoreElement(72)).toBeInTheDocument();
    expect(screen.getByText("総合スコア")).toBeInTheDocument();
    expect(screen.getByTestId("skill-evaluation-panel")).toBeInTheDocument();
    expect(screen.getByTestId("skill-evaluation-summary")).toHaveTextContent(
      "保存は可能ですが、改善余地が残っています。",
    );

    // SuggestionList が描画される（提案の説明テキスト）
    expect(screen.getByText("高優先度: セキュリティ改善")).toBeInTheDocument();
    expect(screen.getByText("中優先度: 構造改善")).toBeInTheDocument();
    expect(screen.getByText("低優先度: ドキュメント追加")).toBeInTheDocument();

    // RiskPanel が描画される（リスクの説明テキスト）
    expect(screen.getByText("重要なセキュリティリスク")).toBeInTheDocument();
    expect(
      screen.getByText("中程度のパフォーマンスリスク"),
    ).toBeInTheDocument();
  });

  it("StrictMode 下でも初回分析が完了してローディングが解除される", async () => {
    await act(async () => {
      render(
        <StrictMode>
          <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />
        </StrictMode>,
      );
    });

    expect(getOverallScoreElement(72)).toBeInTheDocument();
    expect(screen.queryByText("分析中...")).not.toBeInTheDocument();
  });

  it("再評価ボタンで post_improve 評価を実行する", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("skill-evaluation-reevaluate"));
    });

    expect(mockEvaluatePostImprove).toHaveBeenCalledWith({
      skillName: "test-skill",
      prompt: "改善して",
      skillAnalysis: defaultAnalysis,
    });
  });

  // ------------------------------------------
  // 4. 分析失敗時のエラー表示
  // ------------------------------------------
  it("分析失敗時のエラー表示", async () => {
    mockSkillError = "分析に失敗しました";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("分析に失敗しました");

    // 再試行ボタンが表示される
    expect(screen.getByText("再試行")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 5. 再試行ボタンで分析を再実行する
  // ------------------------------------------
  it("再試行ボタンで分析を再実行する", async () => {
    mockSkillError = "分析に失敗しました";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // 再試行ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("再試行"));
    });

    // analyzeSkill が呼ばれた（初回mount + 再試行）
    expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");
  });

  // ------------------------------------------
  // 6. 提案選択のトグル動作
  // ------------------------------------------
  it("提案選択のトグル動作", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);

    // 初期状態: 全て未選択
    expect(checkboxes[0]).not.toBeChecked();

    // チェックボックスをクリック -> 選択状態に
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });

    expect(checkboxes[0]).toBeChecked();

    // もう一度クリック -> 選択解除
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });

    expect(checkboxes[0]).not.toBeChecked();
  });

  // ------------------------------------------
  // 7. 選択した改善を適用する
  // ------------------------------------------
  it("選択した改善を適用する", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 提案を選択
    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    await act(async () => {
      fireEvent.click(checkboxes[2]);
    });

    // 「選択を適用」ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    expect(mockApplySkillImprovements).toHaveBeenCalledTimes(1);
    expect(mockApplySkillImprovements).toHaveBeenCalledWith("test-skill", [
      defaultAnalysis.suggestions[0],
      defaultAnalysis.suggestions[2],
    ]);
  });

  it("自動修正可能を選択で autoFixable のみ一括選択できる", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "自動修正可能を選択" }),
      );
    });

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();

    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    expect(mockApplySkillImprovements).toHaveBeenCalledWith("test-skill", [
      defaultAnalysis.suggestions[0],
      defaultAnalysis.suggestions[2],
    ]);
  });

  it("自動修正可能を選択は既存選択を上書きする", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[1]);
    });
    expect(checkboxes[1]).toBeChecked();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "自動修正可能を選択" }),
      );
    });

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it("autoFixable が0件のとき一括選択ボタンは disabled", async () => {
    mockCurrentAnalysis = createMockAnalysis({
      suggestions: [
        createMockSuggestion({
          priority: "high",
          autoFixable: false,
          description: "非自動修正 1",
        }),
        createMockSuggestion({
          priority: "low",
          autoFixable: false,
          description: "非自動修正 2",
        }),
      ],
    });

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const button = screen.getByRole("button", { name: "自動修正可能を選択" });
    expect(button).toBeDisabled();
  });

  // ------------------------------------------
  // 8. 全自動改善を実行する
  // ------------------------------------------
  it("全自動改善を実行する", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 「全自動改善」ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("全自動改善"));
    });

    // window.confirm が呼ばれた
    expect(window.confirm).toHaveBeenCalledWith("全自動改善を実行しますか？");

    // autoImproveSkill が呼ばれた
    expect(mockAutoImproveSkill).toHaveBeenCalledTimes(1);
    expect(mockAutoImproveSkill).toHaveBeenCalledWith("test-skill");
  });

  // ------------------------------------------
  // 9. 改善適用中のdisabled状態
  // ------------------------------------------
  it("改善適用中のdisabled状態", async () => {
    mockIsImproving = true;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // ボタンがdisabled状態になる
    const applyButton = screen.getByText("選択を適用");
    const autoButton = screen.getByText("全自動改善");
    expect(applyButton).toBeDisabled();
    expect(autoButton).toBeDisabled();
  });

  // ------------------------------------------
  // 10. onClose呼び出し
  // ------------------------------------------
  it("onClose呼び出し", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const closeButton = screen.getByLabelText("閉じる");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 11. 空の提案リスト時の表示
  // ------------------------------------------
  it("空の提案リスト時の表示", async () => {
    mockCurrentAnalysis = createMockAnalysis({
      suggestions: [],
    });

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByText("改善提案はありません")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 12. 改善適用後に分析結果を再取得する
  // ------------------------------------------
  it("改善適用後にstore.applySkillImprovementsが呼ばれる", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 提案を選択して適用
    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    expect(mockApplySkillImprovements).toHaveBeenCalledTimes(1);
  });

  // ============================================
  // Phase 6: 境界値テスト
  // ============================================

  // ------------------------------------------
  // 13. 空のcategories配列の場合
  // ------------------------------------------
  it("空のcategories配列の場合", async () => {
    mockCurrentAnalysis = createMockAnalysis({
      categories: [],
    });

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 総合スコアは表示される
    expect(getOverallScoreElement(72)).toBeInTheDocument();
    // カテゴリ別分析の見出しは表示されない
    expect(screen.queryByText("カテゴリ別分析")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 14. 空のrisks配列の場合
  // ------------------------------------------
  it("空のrisks配列の場合", async () => {
    mockCurrentAnalysis = createMockAnalysis({
      risks: [],
    });

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // RiskPanel は「リスクは検出されていません」を表示
    expect(screen.getByText("リスクは検出されていません")).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: 異常系テスト
  // ============================================

  // ------------------------------------------
  // 15. analyze が例外を投げた場合のエラー表示
  // ------------------------------------------
  it("analyze が例外を投げた場合のエラー表示", async () => {
    mockSkillError = "ネットワークエラーが発生しました";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("ネットワークエラーが発生しました");
  });

  // ------------------------------------------
  // 16. applyImprovements が例外を投げた場合
  // ------------------------------------------
  it("applyImprovements が例外を投げた場合もコンポーネントがクラッシュしない", async () => {
    mockApplySkillImprovements.mockRejectedValue(new Error("改善適用に失敗"));

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 提案を選択して適用
    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    // applySkillImprovements が呼ばれた
    expect(mockApplySkillImprovements).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 17. autoImprove が例外を投げた場合
  // ------------------------------------------
  it("autoImprove が例外を投げた場合もコンポーネントがクラッシュしない", async () => {
    mockAutoImproveSkill.mockRejectedValue(new Error("全自動改善に失敗"));

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("全自動改善"));
    });

    expect(mockAutoImproveSkill).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 18. analyze がnullを返した場合
  // ------------------------------------------
  it("analyze がnullを返した場合", async () => {
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // analysis が null のため分析結果は表示されない
    expect(screen.queryByText("総合スコア")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 20. 分析中に閉じるボタンをクリックする
  // ------------------------------------------
  it("分析中に閉じるボタンをクリックする", async () => {
    mockIsAnalyzing = true;
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 分析中状態を確認
    expect(screen.getByText("分析中...")).toBeInTheDocument();

    // 閉じるボタンは常にクリック可能
    const closeButton = screen.getByLabelText("閉じる");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 22. エラー状態で再試行ボタンが表示される
  // ------------------------------------------
  it("エラー状態で再試行ボタンが表示される", async () => {
    mockSkillError = "一時的なエラー";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // エラー表示確認
    expect(screen.getByRole("alert")).toHaveTextContent("一時的なエラー");
    expect(screen.getByText("再試行")).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: a11y テスト
  // ============================================

  // ------------------------------------------
  // 23. エラーメッセージに role="alert" がある
  // ------------------------------------------
  it('エラーメッセージに role="alert" がある', async () => {
    mockSkillError = "テストエラー";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent("テストエラー");
  });

  // ------------------------------------------
  // 24. ボタンの disabled 状態が正しい
  // ------------------------------------------
  it("ボタンの disabled 状態が正しい", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 初期状態: 選択なしのため「選択を適用」はdisabled
    const applyButton = screen.getByText("選択を適用");
    expect(applyButton).toBeDisabled();

    // 全自動改善は初期状態でenabled
    const autoButton = screen.getByText("全自動改善");
    expect(autoButton).not.toBeDisabled();

    // 提案を選択すると「選択を適用」がenabled
    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });

    expect(applyButton).not.toBeDisabled();
  });

  // ------------------------------------------
  // 25. 閉じるボタンに aria-label がある
  // ------------------------------------------
  it("閉じるボタンに aria-label がある", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const closeButton = screen.getByLabelText("閉じる");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute("aria-label", "閉じる");
  });

  // ============================================
  // Phase 6: 統合テスト
  // ============================================

  // ------------------------------------------
  // 26. 分析→ScoreDisplay→SuggestionList→RiskPanel表示の一連フロー
  // ------------------------------------------
  it("分析→ScoreDisplay→SuggestionList→RiskPanel表示の一連フロー", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 1. 分析APIが呼ばれた
    expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");

    // 2. ScoreDisplay: 総合スコアとカテゴリ別分析が表示
    expect(getOverallScoreElement(72)).toBeInTheDocument();
    expect(screen.getByText("総合スコア")).toBeInTheDocument();
    expect(screen.getByText("カテゴリ別分析")).toBeInTheDocument();
    expect(screen.getByText("Code Quality")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();

    // 3. SuggestionList: 優先度別グループと提案が表示
    expect(screen.getByText("高優先度: セキュリティ改善")).toBeInTheDocument();
    expect(screen.getByText("中優先度: 構造改善")).toBeInTheDocument();
    expect(screen.getByText("低優先度: ドキュメント追加")).toBeInTheDocument();

    // 4. RiskPanel: リスク情報が表示
    expect(screen.getByText("重要なセキュリティリスク")).toBeInTheDocument();
    expect(
      screen.getByText("中程度のパフォーマンスリスク"),
    ).toBeInTheDocument();

    // 5. フッターのボタンが表示
    expect(screen.getByText("選択を適用")).toBeInTheDocument();
    expect(screen.getByText("全自動改善")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 27. 提案選択→適用でstore actionが呼ばれる
  // ------------------------------------------
  it("提案選択→適用でstore actionが呼ばれる", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // Step 1: 初回分析結果を確認
    expect(getOverallScoreElement(72)).toBeInTheDocument();

    // Step 2: 提案を2件選択
    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    await act(async () => {
      fireEvent.click(checkboxes[1]);
    });

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    // Step 3: 適用実行
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    // Step 4: 改善APIが正しい引数で呼ばれた
    expect(mockApplySkillImprovements).toHaveBeenCalledWith("test-skill", [
      defaultAnalysis.suggestions[0],
      defaultAnalysis.suggestions[1],
    ]);
  });

  // ------------------------------------------
  // 28. 全自動改善→確認→store actionが呼ばれる
  // ------------------------------------------
  it("全自動改善→確認→store actionが呼ばれる", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 全自動改善ボタンクリック
    await act(async () => {
      fireEvent.click(screen.getByText("全自動改善"));
    });

    // 確認ダイアログが表示された
    expect(window.confirm).toHaveBeenCalledWith("全自動改善を実行しますか？");

    // autoImproveSkill が呼ばれた
    expect(mockAutoImproveSkill).toHaveBeenCalledWith("test-skill");
  });

  // ============================================
  // Phase 6: 追加ブランチカバレッジテスト
  // ============================================

  // ------------------------------------------
  // TC-AV-B04: analysis.score が 0 の場合に正しく表示される
  // ------------------------------------------
  it("TC-AV-B04: analysis.score が 0 の場合に正しく表示される", async () => {
    mockCurrentAnalysis = createMockAnalysis({
      overallScore: 0,
    });

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("総合スコア")).toBeInTheDocument();
  });

  // ------------------------------------------
  // TC-AV-B05: analysis.score が 100 の場合に正しく表示される
  // ------------------------------------------
  it("TC-AV-B05: analysis.score が 100 の場合に正しく表示される", async () => {
    mockCurrentAnalysis = createMockAnalysis({
      overallScore: 100,
    });

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("総合スコア")).toBeInTheDocument();
  });

  // ------------------------------------------
  // TC-AV-E05: 再試行ボタンクリック後に clearSkillError が呼ばれる
  // ------------------------------------------
  it("TC-AV-E05: 再試行ボタンクリック後にanalyzeSkillが再実行される", async () => {
    mockSkillError = "分析に失敗しました";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // エラーが表示されていることを確認
    expect(screen.getByRole("alert")).toHaveTextContent("分析に失敗しました");

    // 再試行前の呼び出し回数を記録
    const callCountBefore = mockAnalyzeSkill.mock.calls.length;

    // 再試行ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("再試行"));
    });

    // analyzeSkill が再度呼ばれた
    expect(mockAnalyzeSkill.mock.calls.length).toBeGreaterThan(callCountBefore);
    expect(
      mockAnalyzeSkill.mock.calls[mockAnalyzeSkill.mock.calls.length - 1][0],
    ).toBe("test-skill");
  });

  // ------------------------------------------
  // 29. Error以外の例外がストアのskillErrorで表示される
  // ------------------------------------------
  it("skillErrorが設定されるとデフォルトメッセージで表示される", async () => {
    mockSkillError = "分析中にエラーが発生しました";
    mockCurrentAnalysis = null;

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("分析中にエラーが発生しました");
  });

  // ------------------------------------------
  // 30. 選択なしで適用ボタンをクリックしてもAPIが呼ばれない
  // ------------------------------------------
  it("選択なしで適用ボタンをクリックしてもAPIが呼ばれない", async () => {
    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 選択なしの状態で適用ボタンはdisabled
    const applyButton = screen.getByText("選択を適用");
    expect(applyButton).toBeDisabled();

    // disabled でも fireEvent.click は発火するが、handleApplySelected の早期リターンでAPIは呼ばれない
    await act(async () => {
      fireEvent.click(applyButton);
    });

    expect(mockApplySkillImprovements).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // 31. 全自動改善でconfirmキャンセル時にAPIが呼ばれない
  // ------------------------------------------
  it("全自動改善でconfirmキャンセル時にAPIが呼ばれない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("全自動改善"));
    });

    expect(window.confirm).toHaveBeenCalledWith("全自動改善を実行しますか？");
    expect(mockAutoImproveSkill).not.toHaveBeenCalled();
  });
});
