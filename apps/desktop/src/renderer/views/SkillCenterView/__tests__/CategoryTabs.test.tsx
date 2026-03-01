import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryTabs, CATEGORIES } from "../components/CategoryTabs";

describe("CategoryTabs", () => {
  const mockOnCategoryChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("カテゴリタブが表示される", () => {
    render(
      <CategoryTabs
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />,
    );

    // CATEGORIES定数に定義されたカテゴリが全て表示される
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(CATEGORIES.length);
  });

  it("選択中のタブにaria-selected='true'が設定される", () => {
    const selectedCategory = CATEGORIES[0].id;

    render(
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={mockOnCategoryChange}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    // 選択中のタブにaria-selected="true"が設定されている
    const selectedTab = tabs.find(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    expect(selectedTab).toBeDefined();
  });

  it("タブクリックでonCategoryChangeが呼ばれる", () => {
    render(
      <CategoryTabs
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    // 最初のタブをクリック
    fireEvent.click(tabs[0]);

    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
    expect(mockOnCategoryChange).toHaveBeenCalledWith(CATEGORIES[0].id);
  });

  it("role='tablist'が設定されている", () => {
    render(
      <CategoryTabs
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />,
    );

    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
  });

  it("矢印キーでフォーカスが移動する（右矢印/左矢印）", () => {
    render(
      <CategoryTabs
        selectedCategory={CATEGORIES[0].id}
        onCategoryChange={mockOnCategoryChange}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    // 最初のタブにフォーカス
    tabs[0].focus();

    // 右矢印キーを押す
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    // フォーカスが次のタブに移動することを検証
    expect(document.activeElement).toBe(tabs[1]);

    // 左矢印キーを押す
    fireEvent.keyDown(tabs[1], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("Enter/Spaceでタブが選択される", () => {
    render(
      <CategoryTabs
        selectedCategory={null}
        onCategoryChange={mockOnCategoryChange}
      />,
    );

    const tabs = screen.getAllByRole("tab");
    tabs[1].focus();

    // Enterキーでタブを選択
    fireEvent.keyDown(tabs[1], { key: "Enter" });
    expect(mockOnCategoryChange).toHaveBeenCalledWith(CATEGORIES[1].id);

    mockOnCategoryChange.mockClear();

    // Spaceキーでもタブを選択
    fireEvent.keyDown(tabs[1], { key: " " });
    expect(mockOnCategoryChange).toHaveBeenCalledWith(CATEGORIES[1].id);
  });
});
