/**
 * @file SkillAnalysisView.test.tsx
 * @description SkillAnalysisView organism コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-B
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P47準拠: 子コンポーネントのスタイル定数はimportして検証
 */

import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSkillAPI,
  setupMockElectronAPI,
  type MockSkillAPI,
} from "./helpers/mock-electron-api";
import {
  createMockAnalysis,
  createMockImprovementResult,
  createMockSuggestion,
} from "./helpers/test-data-factory";
import { SkillAnalysisView } from "../SkillAnalysisView";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// ============================================
// Test Suite
// ============================================

describe("SkillAnalysisView", () => {
  let mockSkillAPI: MockSkillAPI;
  let mockOnClose: ReturnType<typeof vi.fn>;
  let defaultAnalysis: SkillAnalysis;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSkillAPI = createMockSkillAPI();
    setupMockElectronAPI(mockSkillAPI);
    mockOnClose = vi.fn();
    defaultAnalysis = createMockAnalysis();

    // デフォルト: analyze は正常に解決する
    mockSkillAPI.analyze.mockResolvedValue(defaultAnalysis);
    // デフォルト: applyImprovements は正常に解決する
    mockSkillAPI.applyImprovements.mockResolvedValue(
      createMockImprovementResult(),
    );
    // デフォルト: autoImprove は正常に解決する
    mockSkillAPI.autoImprove.mockResolvedValue(createMockImprovementResult());

    // window.confirm モック
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  // ------------------------------------------
  // 1. 初期ローディング状態を表示する
  // ------------------------------------------
  it("初期ローディング状態を表示する", async () => {
    // analyze を遅延させてローディング状態を観察
    mockSkillAPI.analyze.mockReturnValue(new Promise(() => {}));

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

    expect(mockSkillAPI.analyze).toHaveBeenCalledTimes(1);
    expect(mockSkillAPI.analyze).toHaveBeenCalledWith("test-skill");
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
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("総合スコア")).toBeInTheDocument();

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

  // ------------------------------------------
  // 4. 分析失敗時のエラー表示
  // ------------------------------------------
  it("分析失敗時のエラー表示", async () => {
    mockSkillAPI.analyze.mockRejectedValue(new Error("分析に失敗しました"));

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
    // 初回は失敗
    mockSkillAPI.analyze.mockRejectedValueOnce(new Error("分析に失敗しました"));
    // 2回目は成功
    mockSkillAPI.analyze.mockResolvedValueOnce(defaultAnalysis);

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(mockSkillAPI.analyze).toHaveBeenCalledTimes(1);

    // 再試行ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("再試行"));
    });

    expect(mockSkillAPI.analyze).toHaveBeenCalledTimes(2);

    // 分析結果が表示される
    await waitFor(() => {
      expect(screen.getByText("72")).toBeInTheDocument();
    });
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

    // チェックボックスをクリック → 選択状態に
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });

    expect(checkboxes[0]).toBeChecked();

    // もう一度クリック → 選択解除
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

    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledTimes(1);
    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledWith("test-skill", [
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

    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledWith("test-skill", [
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
    mockSkillAPI.analyze.mockResolvedValue(
      createMockAnalysis({
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
      }),
    );

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

    // autoImprove が呼ばれた
    expect(mockSkillAPI.autoImprove).toHaveBeenCalledTimes(1);
    expect(mockSkillAPI.autoImprove).toHaveBeenCalledWith("test-skill");
  });

  // ------------------------------------------
  // 9. 改善適用中のdisabled状態
  // ------------------------------------------
  it("改善適用中のdisabled状態", async () => {
    // applyImprovements を遅延させる
    mockSkillAPI.applyImprovements.mockReturnValue(new Promise(() => {}));

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

    // 「選択を適用」ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
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
    mockSkillAPI.analyze.mockResolvedValue(
      createMockAnalysis({
        suggestions: [],
      }),
    );

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
  it("改善適用後に分析結果を再取得する", async () => {
    const updatedAnalysis = createMockAnalysis({
      overallScore: 85,
    });

    // 初回 analyze
    mockSkillAPI.analyze.mockResolvedValueOnce(defaultAnalysis);
    // applyImprovements 成功後の再 analyze
    mockSkillAPI.analyze.mockResolvedValueOnce(updatedAnalysis);

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 初回スコア確認
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(mockSkillAPI.analyze).toHaveBeenCalledTimes(1);

    // 提案を選択して適用
    const checkboxes = screen.getAllByRole("checkbox");
    await act(async () => {
      fireEvent.click(checkboxes[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    // applyImprovements 成功後に analyze が再呼び出しされる
    await waitFor(() => {
      expect(mockSkillAPI.analyze).toHaveBeenCalledTimes(2);
    });

    // 更新後のスコアが表示される
    await waitFor(() => {
      expect(screen.getByText("85")).toBeInTheDocument();
    });
  });

  // ============================================
  // Phase 6: 境界値テスト
  // ============================================

  // ------------------------------------------
  // 13. 空のcategories配列の場合
  // ------------------------------------------
  it("空のcategories配列の場合", async () => {
    mockSkillAPI.analyze.mockResolvedValue(
      createMockAnalysis({
        categories: [],
      }),
    );

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // 総合スコアは表示される
    expect(screen.getByText("72")).toBeInTheDocument();
    // カテゴリ別分析の見出しは表示されない
    expect(screen.queryByText("カテゴリ別分析")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 14. 空のrisks配列の場合
  // ------------------------------------------
  it("空のrisks配列の場合", async () => {
    mockSkillAPI.analyze.mockResolvedValue(
      createMockAnalysis({
        risks: [],
      }),
    );

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
    mockSkillAPI.analyze.mockRejectedValue(
      new Error("ネットワークエラーが発生しました"),
    );

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
  it("applyImprovements が例外を投げた場合", async () => {
    mockSkillAPI.applyImprovements.mockRejectedValue(
      new Error("改善適用に失敗"),
    );

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

    // applyImprovements が呼ばれた
    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledTimes(1);

    // エラー後もコンポーネントがクラッシュしない（ボタンが再度有効化される）
    await waitFor(() => {
      const applyButton = screen.getByText("選択を適用");
      expect(applyButton).not.toBeDisabled();
    });
  });

  // ------------------------------------------
  // 17. autoImprove が例外を投げた場合
  // ------------------------------------------
  it("autoImprove が例外を投げた場合", async () => {
    mockSkillAPI.autoImprove.mockRejectedValue(new Error("全自動改善に失敗"));

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText("全自動改善"));
    });

    expect(mockSkillAPI.autoImprove).toHaveBeenCalledTimes(1);

    // エラー後もボタンが再度有効化される
    await waitFor(() => {
      const autoButton = screen.getByText("全自動改善");
      expect(autoButton).not.toBeDisabled();
    });
  });

  // ------------------------------------------
  // 18. analyze がnullを返した場合
  // ------------------------------------------
  it("analyze がnullを返した場合", async () => {
    mockSkillAPI.analyze.mockResolvedValue(null);

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // analysis が null のため分析結果は表示されない
    // エラーでもないため、エラーメッセージも表示されない
    expect(screen.queryByText("総合スコア")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 19. 改善結果にerrorsが含まれる場合の表示
  // ------------------------------------------
  it("改善結果にerrorsが含まれる場合の表示", async () => {
    const resultWithErrors = createMockImprovementResult({
      errors: [
        {
          suggestion: createMockSuggestion({
            description: "失敗した提案",
          }),
          error: "ファイルが見つかりません",
        },
      ],
    });
    mockSkillAPI.applyImprovements.mockResolvedValue(resultWithErrors);

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

    // applyImprovements が呼ばれた
    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledTimes(1);

    // 改善適用後に再分析が呼ばれる（エラーがあっても）
    await waitFor(() => {
      expect(mockSkillAPI.analyze).toHaveBeenCalledTimes(2);
    });
  });

  // ------------------------------------------
  // 20. 分析中に閉じるボタンをクリックする
  // ------------------------------------------
  it("分析中に閉じるボタンをクリックする", async () => {
    mockSkillAPI.analyze.mockReturnValue(new Promise(() => {}));

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
  // 21. 改善適用中に再度適用ボタンをクリックする → disabled
  // ------------------------------------------
  it("改善適用中に再度適用ボタンをクリックする → disabled", async () => {
    mockSkillAPI.applyImprovements.mockReturnValue(new Promise(() => {}));

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

    // 適用ボタンクリック
    await act(async () => {
      fireEvent.click(screen.getByText("選択を適用"));
    });

    // ボタンがdisabledになっている
    const applyButton = screen.getByText("選択を適用");
    expect(applyButton).toBeDisabled();

    // 再度クリックしても呼ばれない
    await act(async () => {
      fireEvent.click(applyButton);
    });

    // applyImprovements は1回のみ呼ばれる
    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 22. エラー状態から再試行→成功のフロー
  // ------------------------------------------
  it("エラー状態から再試行→成功のフロー", async () => {
    // 初回はエラー
    mockSkillAPI.analyze.mockRejectedValueOnce(new Error("一時的なエラー"));
    // 2回目は成功
    mockSkillAPI.analyze.mockResolvedValueOnce(defaultAnalysis);

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // エラー表示確認
    expect(screen.getByRole("alert")).toHaveTextContent("一時的なエラー");
    expect(screen.getByText("再試行")).toBeInTheDocument();

    // 再試行
    await act(async () => {
      fireEvent.click(screen.getByText("再試行"));
    });

    // 成功後の表示確認
    await waitFor(() => {
      expect(screen.getByText("72")).toBeInTheDocument();
    });

    // エラーが消えている
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("再試行")).not.toBeInTheDocument();
  });

  // ============================================
  // Phase 6: a11y テスト
  // ============================================

  // ------------------------------------------
  // 23. エラーメッセージに role="alert" がある
  // ------------------------------------------
  it('エラーメッセージに role="alert" がある', async () => {
    mockSkillAPI.analyze.mockRejectedValue(new Error("テストエラー"));

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
    expect(mockSkillAPI.analyze).toHaveBeenCalledWith("test-skill");

    // 2. ScoreDisplay: 総合スコアとカテゴリ別分析が表示
    expect(screen.getByText("72")).toBeInTheDocument();
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
  // 27. 提案選択→適用→再分析の完全フロー
  // ------------------------------------------
  it("提案選択→適用→再分析の完全フロー", async () => {
    const improvedAnalysis = createMockAnalysis({
      overallScore: 90,
      suggestions: [],
      risks: [],
    });

    mockSkillAPI.analyze.mockResolvedValueOnce(defaultAnalysis);
    mockSkillAPI.analyze.mockResolvedValueOnce(improvedAnalysis);
    mockSkillAPI.applyImprovements.mockResolvedValue(
      createMockImprovementResult(),
    );

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // Step 1: 初回分析結果を確認
    expect(screen.getByText("72")).toBeInTheDocument();

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
    expect(mockSkillAPI.applyImprovements).toHaveBeenCalledWith("test-skill", [
      defaultAnalysis.suggestions[0],
      defaultAnalysis.suggestions[1],
    ]);

    // Step 5: 再分析結果が反映される
    await waitFor(() => {
      expect(screen.getByText("90")).toBeInTheDocument();
    });

    // Step 6: 改善後は提案が空
    expect(screen.getByText("改善提案はありません")).toBeInTheDocument();
    // リスクも空
    expect(screen.getByText("リスクは検出されていません")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 28. 全自動改善→確認→実行→再分析の完全フロー
  // ------------------------------------------
  it("全自動改善→確認→実行→再分析の完全フロー", async () => {
    const improvedAnalysis = createMockAnalysis({
      overallScore: 95,
      suggestions: [],
      risks: [],
    });

    mockSkillAPI.analyze.mockResolvedValueOnce(defaultAnalysis);
    mockSkillAPI.analyze.mockResolvedValueOnce(improvedAnalysis);
    mockSkillAPI.autoImprove.mockResolvedValue(createMockImprovementResult());

    await act(async () => {
      render(
        <SkillAnalysisView skillName="test-skill" onClose={mockOnClose} />,
      );
    });

    // Step 1: 初回分析結果を確認
    expect(screen.getByText("72")).toBeInTheDocument();

    // Step 2: 全自動改善ボタンクリック
    await act(async () => {
      fireEvent.click(screen.getByText("全自動改善"));
    });

    // Step 3: 確認ダイアログが表示された
    expect(window.confirm).toHaveBeenCalledWith("全自動改善を実行しますか？");

    // Step 4: autoImprove が呼ばれた
    expect(mockSkillAPI.autoImprove).toHaveBeenCalledWith("test-skill");

    // Step 5: 再分析結果が反映される
    await waitFor(() => {
      expect(screen.getByText("95")).toBeInTheDocument();
    });

    // Step 6: 改善後は提案もリスクも空
    expect(screen.getByText("改善提案はありません")).toBeInTheDocument();
    expect(screen.getByText("リスクは検出されていません")).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: 追加ブランチカバレッジテスト
  // ============================================

  // ------------------------------------------
  // 29. Error以外の例外がデフォルトメッセージで表示される
  // ------------------------------------------
  it("Error以外の例外がデフォルトメッセージで表示される", async () => {
    // 文字列を投げる（Error インスタンスではない）
    mockSkillAPI.analyze.mockRejectedValue("文字列エラー");

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

    // 選択なしの状態で適用ボタンはdisabledだが、念のためAPI呼び出しも確認
    const applyButton = screen.getByText("選択を適用");
    expect(applyButton).toBeDisabled();

    // disabled でも fireEvent.click は発火するが、handleApplySelected の早期リターンでAPIは呼ばれない
    await act(async () => {
      fireEvent.click(applyButton);
    });

    expect(mockSkillAPI.applyImprovements).not.toHaveBeenCalled();
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
    expect(mockSkillAPI.autoImprove).not.toHaveBeenCalled();
  });
});
