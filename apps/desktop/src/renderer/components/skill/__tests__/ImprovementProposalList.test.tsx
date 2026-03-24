import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RuntimeSkillCreatorImproveSuggestion } from "@repo/shared/types";
import {
  ImprovementProposalList,
  type ImprovementProposalListProps,
} from "../ImprovementProposalList";

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

describe("ImprovementProposalList", () => {
  let mockOnToggle: ReturnType<typeof vi.fn>;
  let mockOnSelectAll: ReturnType<typeof vi.fn>;
  let mockOnDeselectAll: ReturnType<typeof vi.fn>;
  let mockOnApply: ReturnType<typeof vi.fn>;
  let suggestions: RuntimeSkillCreatorImproveSuggestion[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnToggle = vi.fn();
    mockOnSelectAll = vi.fn();
    mockOnDeselectAll = vi.fn();
    mockOnApply = vi.fn();
    suggestions = [
      createMockSuggestion({ section: "## 目的" }),
      createMockSuggestion({ section: "## 制約事項" }),
      createMockSuggestion({ section: "## 入力形式" }),
    ];
  });

  function renderList(overrides?: Partial<ImprovementProposalListProps>) {
    const props: ImprovementProposalListProps = {
      suggestions,
      selectedIndices: new Set<number>(),
      onToggle: mockOnToggle,
      onSelectAll: mockOnSelectAll,
      onDeselectAll: mockOnDeselectAll,
      onApply: mockOnApply,
      isApplying: false,
      selectedCount: 0,
      ...overrides,
    };
    return render(<ImprovementProposalList {...props} />);
  }

  // L-1: 空リスト表示
  it("suggestions=[] で「提案なし」メッセージが表示される", () => {
    renderList({ suggestions: [] });

    expect(screen.getByText("改善提案はありません")).toBeInTheDocument();
  });

  // L-2: 複数提案の表示
  it("3件の suggestions が全てレンダリングされる", () => {
    renderList();

    expect(screen.getByText("## 目的")).toBeInTheDocument();
    expect(screen.getByText("## 制約事項")).toBeInTheDocument();
    expect(screen.getByText("## 入力形式")).toBeInTheDocument();
  });

  // L-3: 全選択ボタン
  it("「全て選択」ボタン押下で onSelectAll が呼ばれる", () => {
    renderList();

    fireEvent.click(screen.getByRole("button", { name: "全て選択" }));
    expect(mockOnSelectAll).toHaveBeenCalledTimes(1);
  });

  // L-4: 全解除ボタン
  it("「全て解除」ボタン押下で onDeselectAll が呼ばれる", () => {
    renderList();

    fireEvent.click(screen.getByRole("button", { name: "全て解除" }));
    expect(mockOnDeselectAll).toHaveBeenCalledTimes(1);
  });

  // L-5: 適用ボタン: 有効
  it("selectedCount > 0 で「適用」ボタンが有効", () => {
    renderList({ selectedCount: 2, selectedIndices: new Set([0, 1]) });

    const applyButton = screen.getByRole("button", {
      name: /選択した提案を適用/,
    });
    expect(applyButton).not.toBeDisabled();
  });

  // L-6: 適用ボタン: 無効
  it("selectedCount === 0 で「適用」ボタンが disabled", () => {
    renderList({ selectedCount: 0 });

    const applyButton = screen.getByRole("button", {
      name: /選択した提案を適用/,
    });
    expect(applyButton).toBeDisabled();
  });

  // L-7: 適用中の状態
  it("isApplying=true でボタンが disabled + ローディング表示", () => {
    renderList({ isApplying: true, selectedCount: 2 });

    // aria-label はアクセシブル名に優先するため、/選択した提案を適用/ で検索
    const applyButton = screen.getByRole("button", {
      name: /選択した提案を適用/,
    });
    expect(applyButton).toBeDisabled();
    expect(applyButton).toHaveTextContent("適用中...");
  });

  // L-8: 適用ボタン押下
  it("「適用」ボタン押下で onApply が呼ばれる", () => {
    renderList({ selectedCount: 1, selectedIndices: new Set([0]) });

    const applyButton = screen.getByRole("button", {
      name: /選択した提案を適用/,
    });
    fireEvent.click(applyButton);
    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  // L-9: 20件以上の大量提案
  it("20件以上の提案がスクロール可能なリストとして表示される", () => {
    const largeSuggestions = Array.from({ length: 20 }, (_, i) =>
      createMockSuggestion({ section: `## Section ${i}` }),
    );
    renderList({ suggestions: largeSuggestions });

    const list = screen.getByRole("list", { name: "改善提案一覧" });
    expect(list.className).toContain("overflow-y-auto");
    expect(screen.getByText("## Section 0")).toBeInTheDocument();
    expect(screen.getByText("## Section 19")).toBeInTheDocument();
  });

  // L-10: 全選択後に1件解除
  it("全選択後に1件トグルで onToggle が呼ばれる", () => {
    renderList({
      selectedIndices: new Set([0, 1, 2]),
      selectedCount: 3,
    });

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(mockOnToggle).toHaveBeenCalledWith(1);
  });

  // L-11: 適用中に他の操作無効
  it("isApplying=true で全選択/全解除/チェックボックスが disabled", () => {
    renderList({ isApplying: true, selectedCount: 1 });

    expect(screen.getByRole("button", { name: "全て選択" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "全て解除" })).toBeDisabled();

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });
});
