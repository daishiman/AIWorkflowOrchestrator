import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  RuntimeSkillCreatorImproveSuggestion,
  ApplyImprovementResult,
} from "@repo/shared/types";
import {
  ImprovementProposalPanel,
  type ImprovementProposalPanelProps,
} from "../ImprovementProposalPanel";

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

const mockApplyResult: ApplyImprovementResult = {
  applied: 2,
  skipped: 0,
  skippedDetails: [],
  errors: [],
};

const mockApplyRuntimeImprovement = vi.fn();

describe("ImprovementProposalPanel", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnApplyComplete: ReturnType<typeof vi.fn>;
  let suggestions: RuntimeSkillCreatorImproveSuggestion[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockOnApplyComplete = vi.fn();
    suggestions = [
      createMockSuggestion({ section: "## 目的" }),
      createMockSuggestion({ section: "## 制約事項" }),
    ];

    Object.defineProperty(window, "skillCreatorAPI", {
      value: {
        applyRuntimeImprovement: mockApplyRuntimeImprovement,
      },
      writable: true,
      configurable: true,
    });
  });

  function renderPanel(overrides?: Partial<ImprovementProposalPanelProps>) {
    const props: ImprovementProposalPanelProps = {
      skillName: "test-skill",
      suggestions,
      onClose: mockOnClose,
      onApplyComplete: mockOnApplyComplete,
      ...overrides,
    };
    return render(<ImprovementProposalPanel {...props} />);
  }

  // P-1: 初期レンダリング
  it("suggestions が全提案として表示される", () => {
    renderPanel();

    expect(screen.getByText("## 目的")).toBeInTheDocument();
    expect(screen.getByText("## 制約事項")).toBeInTheDocument();
  });

  // P-2: 選択トグル
  it("チェックボックス操作で selectedIndices が更新される", () => {
    renderPanel();

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    // 1件選択後、適用ボタンにカウントが表示される
    expect(
      screen.getByRole("button", { name: /選択した提案を適用/ }),
    ).not.toBeDisabled();
  });

  // P-3: 全選択・全解除
  it("全選択→全解除で selectedIndices が切り替わる", () => {
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "全て解除" }));
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  // P-4: 適用成功時の結果表示
  it("選択→適用で IPC 呼び出し後、結果が表示される", async () => {
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: true,
      data: mockApplyResult,
    });

    renderPanel();

    // 全選択
    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    // 適用ボタン押下
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    // IPC が正しい引数で呼ばれたことを確認
    expect(mockApplyRuntimeImprovement).toHaveBeenCalledWith(
      "test-skill",
      suggestions,
    );

    // 結果表示に遷移
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(mockOnApplyComplete).toHaveBeenCalledWith(mockApplyResult);
  });

  // P-5: 適用エラー時のエラーメッセージ
  it("IPC 呼び出しが失敗した場合、エラーメッセージが表示される", async () => {
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: false,
      error: "Runtime Skill Creator は現在利用できません",
    });

    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    expect(
      screen.getByText("Runtime Skill Creator は現在利用できません"),
    ).toBeInTheDocument();
  });

  // P-6: IPC 呼び出しが例外を投げた場合の catch パス
  it("IPC が例外を投げた場合、エラーメッセージが表示され再試行可能", async () => {
    mockApplyRuntimeImprovement.mockRejectedValue(new Error("Network timeout"));

    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    expect(screen.getByText("Network timeout")).toBeInTheDocument();
    // isApplying が false に戻り、再試行可能
    expect(
      screen.getByRole("button", { name: /選択した提案を適用/ }),
    ).not.toBeDisabled();
  });

  // P-7: エラー閉じるボタン
  it("エラーメッセージの閉じるボタンでエラーが消える", async () => {
    mockApplyRuntimeImprovement.mockResolvedValue({
      success: false,
      error: "テストエラー",
    });

    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /選択した提案を適用/ }),
      );
    });

    expect(screen.getByText("テストエラー")).toBeInTheDocument();

    // エラー閉じるボタンを押下
    fireEvent.click(screen.getByRole("button", { name: "エラーを閉じる" }));

    expect(screen.queryByText("テストエラー")).not.toBeInTheDocument();
  });

  // P-8: パネル閉じるボタン
  it("パネルの閉じるボタンで onClose が呼ばれる", () => {
    renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "パネルを閉じる" }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
