import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SuggestionList,
  priorityStyles,
  type SuggestionListProps,
} from "../SuggestionList";
import { createMockSuggestion } from "./helpers/test-data-factory";
import type { Suggestion } from "@repo/shared/types/skill-improver";

describe("SuggestionList", () => {
  let defaultProps: SuggestionListProps;
  let mockOnToggle: ReturnType<typeof vi.fn>;

  const suggestions: Suggestion[] = [
    createMockSuggestion({
      type: "security",
      priority: "high",
      description: "高優先度: セキュリティ改善",
      autoFixable: true,
    }),
    createMockSuggestion({
      type: "structure",
      priority: "medium",
      description: "中優先度: 構造改善",
      autoFixable: false,
    }),
    createMockSuggestion({
      type: "documentation",
      priority: "low",
      description: "低優先度: ドキュメント追加",
      autoFixable: true,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnToggle = vi.fn();
    defaultProps = {
      suggestions,
      selected: new Set<number>(),
      onToggle: mockOnToggle,
    };
  });

  it("提案リストを表示する", () => {
    render(<SuggestionList {...defaultProps} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("優先度別にグループ化する", () => {
    render(<SuggestionList {...defaultProps} />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent("高優先度");
    expect(headings[1]).toHaveTextContent("中優先度");
    expect(headings[2]).toHaveTextContent("低優先度");
  });

  it("チェックボックスのトグルで onToggle を呼ぶ", () => {
    render(<SuggestionList {...defaultProps} />);

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(0);
  });

  it("選択状態のチェックボックス表示", () => {
    render(
      <SuggestionList {...defaultProps} selected={new Set<number>([0, 2])} />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it("autoFixableバッジを表示する", () => {
    render(<SuggestionList {...defaultProps} />);

    const autoFixBadges = screen.getAllByText("自動修正");
    // suggestions[0] と suggestions[2] が autoFixable: true
    expect(autoFixBadges).toHaveLength(2);
  });

  it("タイプバッジを表示する", () => {
    render(<SuggestionList {...defaultProps} />);

    expect(screen.getByText("security")).toBeInTheDocument();
    expect(screen.getByText("structure")).toBeInTheDocument();
    expect(screen.getByText("documentation")).toBeInTheDocument();
  });

  it("優先度バッジの色分け", () => {
    render(<SuggestionList {...defaultProps} />);

    const highBadge = screen.getByText("high");
    const mediumBadge = screen.getByText("medium");
    const lowBadge = screen.getByText("low");

    // P47準拠: priorityStyles Record定数をimportして検証
    for (const cls of priorityStyles.high.split(" ")) {
      expect(highBadge.className).toContain(cls);
    }
    for (const cls of priorityStyles.medium.split(" ")) {
      expect(mediumBadge.className).toContain(cls);
    }
    for (const cls of priorityStyles.low.split(" ")) {
      expect(lowBadge.className).toContain(cls);
    }
  });

  it("空リスト時のメッセージ表示", () => {
    render(
      <SuggestionList
        suggestions={[]}
        selected={new Set<number>()}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("改善提案はありません")).toBeInTheDocument();
  });

  it("提案の説明テキストを表示する", () => {
    render(<SuggestionList {...defaultProps} />);

    expect(screen.getByText("高優先度: セキュリティ改善")).toBeInTheDocument();
    expect(screen.getByText("中優先度: 構造改善")).toBeInTheDocument();
    expect(screen.getByText("低優先度: ドキュメント追加")).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: 境界値テスト
  // ============================================

  // ------------------------------------------
  // 10. 単一提案のみの表示
  // ------------------------------------------
  it("単一提案のみの表示", () => {
    const singleSuggestion: Suggestion[] = [
      createMockSuggestion({
        type: "security",
        priority: "high",
        description: "唯一の提案",
        autoFixable: true,
      }),
    ];

    render(
      <SuggestionList
        suggestions={singleSuggestion}
        selected={new Set<number>()}
        onToggle={mockOnToggle}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(screen.getByText("唯一の提案")).toBeInTheDocument();

    // 高優先度グループのみ表示される
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("高優先度");
  });

  // ------------------------------------------
  // 11. 同一優先度の複数提案
  // ------------------------------------------
  it("同一優先度の複数提案", () => {
    const samePrioritySuggestions: Suggestion[] = [
      createMockSuggestion({
        type: "security",
        priority: "high",
        description: "セキュリティ改善A",
      }),
      createMockSuggestion({
        type: "structure",
        priority: "high",
        description: "構造改善B",
      }),
      createMockSuggestion({
        type: "performance",
        priority: "high",
        description: "パフォーマンスC",
      }),
    ];

    render(
      <SuggestionList
        suggestions={samePrioritySuggestions}
        selected={new Set<number>()}
        onToggle={mockOnToggle}
      />,
    );

    // 全3件が表示される
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);

    // 高優先度グループのみ存在
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("高優先度");
  });

  // ------------------------------------------
  // 12. 全提案を選択した状態
  // ------------------------------------------
  it("全提案を選択した状態", () => {
    render(
      <SuggestionList
        {...defaultProps}
        selected={new Set<number>([0, 1, 2])}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  // ============================================
  // Phase 6: a11y テスト
  // ============================================

  // ------------------------------------------
  // 13. チェックボックスにaria-labelがある
  // ------------------------------------------
  it("チェックボックスにaria-labelがある", () => {
    render(<SuggestionList {...defaultProps} />);

    const checkboxes = screen.getAllByRole("checkbox");
    for (const checkbox of checkboxes) {
      expect(checkbox).toHaveAttribute("aria-label");
      const label = checkbox.getAttribute("aria-label");
      expect(label).toBeTruthy();
      expect(label!.endsWith("を選択")).toBe(true);
    }
  });

  it("優先度ごとのリストにaria-labelがある", () => {
    render(<SuggestionList {...defaultProps} />);

    expect(
      screen.getByRole("list", { name: "高優先度の改善提案" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "中優先度の改善提案" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "低優先度の改善提案" }),
    ).toBeInTheDocument();
  });

  // ============================================
  // Phase 6: スタイルテスト
  // ============================================

  // ------------------------------------------
  // 14. priorityStyles の3優先度全てが定義されている
  // ------------------------------------------
  it("priorityStyles の3優先度全てが定義されている", () => {
    expect(priorityStyles).toHaveProperty("high");
    expect(priorityStyles).toHaveProperty("medium");
    expect(priorityStyles).toHaveProperty("low");

    // 各スタイルがCSS変数を含む
    expect(priorityStyles.high).toContain("--status-error");
    expect(priorityStyles.medium).toContain("--status-warning");
    expect(priorityStyles.low).toContain("--status-info");
  });
});
