import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  RuntimeSkillCreatorImproveSuggestion,
  ApplyImprovementResult,
} from "@repo/shared/types";
import { ImprovementProposalPanel } from "../ImprovementProposalPanel";

function createMockSuggestion(
  overrides?: Partial<RuntimeSkillCreatorImproveSuggestion>,
): RuntimeSkillCreatorImproveSuggestion {
  return {
    section: "## 目的",
    before: "変更前テキスト",
    after: "変更後テキスト",
    reason: "変更理由",
    ...overrides,
  };
}

const mockApplyRuntimeImprovement = vi.fn();

describe("ImprovementProposal 統合テスト", () => {
  let suggestions: RuntimeSkillCreatorImproveSuggestion[];
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnApplyComplete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockOnApplyComplete = vi.fn();
    suggestions = [
      createMockSuggestion({ section: "## 目的" }),
      createMockSuggestion({ section: "## 制約事項" }),
      createMockSuggestion({ section: "## 入力形式" }),
    ];

    Object.defineProperty(window, "electronAPI", {
      value: {
        skillCreator: {
          applyRuntimeImprovement: mockApplyRuntimeImprovement,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  // I-1: 提案選択→適用フロー
  it("I-1: チェックボックスで選択→適用ボタン押下→結果画面に遷移", async () => {
    const result: ApplyImprovementResult = {
      applied: 1,
      skipped: 0,
      skippedDetails: [],
      errors: [],
    };
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: true,
      data: result,
    });

    render(
      <ImprovementProposalPanel
        skillName="test-skill"
        suggestions={suggestions}
        onClose={mockOnClose}
        onApplyComplete={mockOnApplyComplete}
      />,
    );

    // 1件目を選択
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    // 適用ボタン押下
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    // 結果表示に遷移
    expect(screen.getByText(/1/)).toBeInTheDocument();
    expect(mockOnApplyComplete).toHaveBeenCalledWith(result);
  });

  // I-2: 全選択→適用→結果表示
  it("I-2: 全選択→適用で全提案が IPC に送られ、結果が表示される", async () => {
    const result: ApplyImprovementResult = {
      applied: 3,
      skipped: 0,
      skippedDetails: [],
      errors: [],
    };
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: true,
      data: result,
    });

    render(
      <ImprovementProposalPanel
        skillName="test-skill"
        suggestions={suggestions}
        onClose={mockOnClose}
        onApplyComplete={mockOnApplyComplete}
      />,
    );

    // 全選択
    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    // 適用
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    // 3件全てが IPC に送られた
    expect(mockApplyRuntimeImprovement).toHaveBeenCalledWith(
      "test-skill",
      suggestions,
    );
    // 結果表示
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  // I-3: エラー時のフォールバック
  it("I-3: IPC 通信失敗時にエラーメッセージが表示される", async () => {
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: false,
      error: "ネットワークエラー",
    });

    render(
      <ImprovementProposalPanel
        skillName="test-skill"
        suggestions={suggestions}
        onClose={mockOnClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    expect(screen.getByText("ネットワークエラー")).toBeInTheDocument();
    // 提案リストは引き続き表示される（結果画面に遷移しない）
    expect(screen.getByText("## 目的")).toBeInTheDocument();
  });

  // I-4: エラー後の再選択→再試行
  it("I-4: IPC 失敗→エラー閉じ→再選択→再適用が成功する", async () => {
    // 1回目: 失敗
    mockApplyRuntimeImprovement.mockResolvedValueOnce({
      success: false,
      error: "一時的なエラー",
    });

    render(
      <ImprovementProposalPanel
        skillName="test-skill"
        suggestions={suggestions}
        onClose={mockOnClose}
        onApplyComplete={mockOnApplyComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    expect(screen.getByText("一時的なエラー")).toBeInTheDocument();

    // エラーを閉じる
    fireEvent.click(screen.getByRole("button", { name: "エラーを閉じる" }));
    expect(screen.queryByText("一時的なエラー")).not.toBeInTheDocument();

    // 2回目: 成功
    const successResult: ApplyImprovementResult = {
      applied: 3,
      skipped: 0,
      skippedDetails: [],
      errors: [],
    };
    mockApplyRuntimeImprovement.mockResolvedValueOnce({
      success: true,
      data: successResult,
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    expect(mockOnApplyComplete).toHaveBeenCalledWith(successResult);
  });

  // I-5: 部分選択→全解除→再選択→適用
  it("I-5: 部分選択→全解除→再選択→適用で正しい提案が送信される", async () => {
    const result: ApplyImprovementResult = {
      applied: 2,
      skipped: 0,
      skippedDetails: [],
      errors: [],
    };
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: true,
      data: result,
    });

    render(
      <ImprovementProposalPanel
        skillName="test-skill"
        suggestions={suggestions}
        onClose={mockOnClose}
        onApplyComplete={mockOnApplyComplete}
      />,
    );

    // 1件目を選択
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    // 全解除
    fireEvent.click(screen.getByRole("button", { name: "全て解除" }));

    // 2件目と3件目を選択
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    // 適用
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    // 2件目と3件目が送信された
    expect(mockApplyRuntimeImprovement).toHaveBeenCalledWith("test-skill", [
      suggestions[1],
      suggestions[2],
    ]);
  });
});
