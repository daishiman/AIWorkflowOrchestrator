import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RuntimeSkillCreatorImproveSuggestion } from "@repo/shared/types";
import {
  ImprovementProposalItem,
  diffStyles,
  type ImprovementProposalItemProps,
} from "../ImprovementProposalItem";

function createMockSuggestion(
  overrides?: Partial<RuntimeSkillCreatorImproveSuggestion>,
): RuntimeSkillCreatorImproveSuggestion {
  return {
    section: "## 目的",
    before: "このスキルは処理を行います。",
    after: "このスキルは入力テキストを解析し、構造化データに変換します。",
    reason: "目的を具体的に記述することで、利用者の理解度が向上する",
    ...overrides,
  };
}

describe("ImprovementProposalItem", () => {
  let defaultProps: ImprovementProposalItemProps;
  let mockOnToggle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnToggle = vi.fn();
    defaultProps = {
      suggestion: createMockSuggestion(),
      index: 0,
      isSelected: false,
      onToggle: mockOnToggle,
    };
  });

  // C-1: 正常レンダリング
  it("section/before/after/reason が全て表示される", () => {
    render(<ImprovementProposalItem {...defaultProps} />);

    expect(screen.getByText("## 目的")).toBeInTheDocument();
    expect(
      screen.getByText("このスキルは処理を行います。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "このスキルは入力テキストを解析し、構造化データに変換します。",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "目的を具体的に記述することで、利用者の理解度が向上する",
      ),
    ).toBeInTheDocument();
  });

  // C-2: チェックボックス選択状態
  it("isSelected=true でチェック済みになる", () => {
    render(<ImprovementProposalItem {...defaultProps} isSelected={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  // C-3: チェックボックス未選択状態
  it("isSelected=false で未チェックになる", () => {
    render(<ImprovementProposalItem {...defaultProps} isSelected={false} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  // C-4: トグルコールバック
  it("チェックボックス操作で onToggle(index) が呼ばれる", () => {
    render(<ImprovementProposalItem {...defaultProps} index={2} />);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(2);
  });

  // C-5: diff スタイル適用（P47 準拠: diffStyles import）
  it("before に赤系、after に緑系のスタイルクラスが適用される", () => {
    render(<ImprovementProposalItem {...defaultProps} />);

    const beforeBlock = screen
      .getByText("このスキルは処理を行います。")
      .closest("pre");
    const afterBlock = screen
      .getByText("このスキルは入力テキストを解析し、構造化データに変換します。")
      .closest("pre");

    for (const cls of diffStyles.before.split(" ")) {
      expect(beforeBlock?.className).toContain(cls);
    }
    for (const cls of diffStyles.after.split(" ")) {
      expect(afterBlock?.className).toContain(cls);
    }
  });

  // C-6: 長文テキストの表示
  it("before/after が長文でもレイアウトが崩れない", () => {
    const longText = "長い文章".repeat(50);
    render(
      <ImprovementProposalItem
        {...defaultProps}
        suggestion={createMockSuggestion({ before: longText, after: longText })}
      />,
    );

    const preElements = screen.getAllByText(longText);
    expect(preElements).toHaveLength(2);
  });

  // C-7: アクセシビリティ
  it("チェックボックスに aria-label が付与されている", () => {
    render(<ImprovementProposalItem {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "## 目的の改善提案を選択");
  });

  // C-8: before/after に改行含む
  it("before/after に改行含むテキストが pre ブロックで正しく表示される", () => {
    const multiLineText = "line1\nline2\nline3";
    const { container } = render(
      <ImprovementProposalItem
        {...defaultProps}
        suggestion={createMockSuggestion({
          before: multiLineText,
          after: multiLineText,
        })}
      />,
    );

    // testing-library はテキスト正規化で改行を空白に変換するため、
    // pre 要素を直接取得して textContent を検証する
    const preElements = container.querySelectorAll("pre");
    expect(preElements).toHaveLength(2);
    preElements.forEach((el) => {
      expect(el.textContent).toBe(multiLineText);
    });
  });

  // C-9: section が長文
  it("長いセクション名でもレイアウトが崩れない", () => {
    const longSection = "## " + "非常に長いセクション名".repeat(10);
    render(
      <ImprovementProposalItem
        {...defaultProps}
        suggestion={createMockSuggestion({ section: longSection })}
      />,
    );

    expect(screen.getByText(longSection)).toBeInTheDocument();
  });

  // C-10a: disabled prop
  it("disabled=true でチェックボックスが無効化される", () => {
    render(<ImprovementProposalItem {...defaultProps} disabled={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  // C-10: reason が空文字列
  it("reason が空文字列の場合、理由セクションが非表示になる", () => {
    render(
      <ImprovementProposalItem
        {...defaultProps}
        suggestion={createMockSuggestion({ reason: "" })}
      />,
    );

    // reason テキストが表示されていないことを確認
    const reasonElements = screen.queryAllByText(/./);
    const hasReasonParagraph = reasonElements.some(
      (el) =>
        el.tagName === "P" &&
        el.classList.contains("text-[var(--text-secondary)]"),
    );
    expect(hasReasonParagraph).toBe(false);
  });
});
