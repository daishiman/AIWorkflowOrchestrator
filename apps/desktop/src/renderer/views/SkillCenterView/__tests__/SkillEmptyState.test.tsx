import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SkillEmptyState } from "../components/SkillEmptyState";

describe("SkillEmptyState", () => {
  const mockOnClearFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no-skills バリアントでEmptyStateが表示される", () => {
    render(
      <SkillEmptyState variant="no-skills" onClearFilter={mockOnClearFilter} />,
    );

    // ゼロステート: ツールが未追加の場合のメッセージ
    expect(
      screen.getByText(/ツールがまだありません|ツールを探して追加/),
    ).toBeInTheDocument();
  });

  it("no-results バリアントで検索キーワードが表示される", () => {
    render(
      <SkillEmptyState
        variant="no-results"
        keyword="テストキーワード"
        onClearFilter={mockOnClearFilter}
      />,
    );

    // 検索結果が0件の場合のメッセージ
    expect(screen.getByText(/テストキーワード/)).toBeInTheDocument();
  });

  it("フィルタークリアボタンがonClearFilterを呼ぶ", () => {
    render(
      <SkillEmptyState
        variant="no-results"
        keyword="検索語"
        onClearFilter={mockOnClearFilter}
      />,
    );

    // フィルタークリアボタンを探してクリック
    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(mockOnClearFilter).toHaveBeenCalledTimes(1);
  });

  it("keyword なしの no-results でデフォルトテキスト", () => {
    render(
      <SkillEmptyState
        variant="no-results"
        onClearFilter={mockOnClearFilter}
      />,
    );

    // キーワードなしの場合はデフォルトの「見つかりませんでした」テキスト
    expect(
      screen.getByText(/一致するツールが見つかりません|見つかりませんでした/),
    ).toBeInTheDocument();
  });
});
