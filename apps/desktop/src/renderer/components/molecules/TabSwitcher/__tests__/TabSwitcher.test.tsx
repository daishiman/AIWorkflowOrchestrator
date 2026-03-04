import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TabSwitcher, type TabSwitcherTab } from "../index";

describe("TabSwitcher", () => {
  const tabs: TabSwitcherTab[] = [
    { id: "overview", label: "概要", icon: "layout-grid" },
    { id: "disabled", label: "無効", disabled: true },
    { id: "code", label: "コード", badge: 3 },
  ];

  it("タブを表示する", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );
    expect(screen.getByRole("tab", { name: /概要/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /コード/ })).toBeInTheDocument();
  });

  it("タブクリックでonTabChangeを呼び出す", () => {
    const handleTabChange = vi.fn();

    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={handleTabChange}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: /コード/ }));

    expect(handleTabChange).toHaveBeenCalledWith("code");
  });

  it("disabledタブはクリックできない", () => {
    const handleTabChange = vi.fn();

    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={handleTabChange}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: /無効/ }));

    expect(handleTabChange).not.toHaveBeenCalled();
  });

  it("activeTabに対応するタブがaria-selected=trueを持つ", () => {
    render(<TabSwitcher tabs={tabs} activeTab="code" onTabChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: /コード/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /概要/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("variant=pillでpillスタイルを描画する", () => {
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={vi.fn()}
        variant="pill"
      />,
    );

    expect(screen.getByRole("tablist")).toHaveClass("rounded-full");
    expect(screen.getByRole("tab", { name: /概要/ })).toHaveClass(
      "rounded-full",
    );
  });

  it("badgeを表示する", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("role=tablist / role=tab を持つ", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab").length).toBe(3);
  });

  it("ArrowRightで次の有効タブへフォーカス移動（disabledスキップ）", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );

    const overviewTab = screen.getByTestId("tab-overview");
    const codeTab = screen.getByTestId("tab-code");
    overviewTab.focus();

    fireEvent.keyDown(overviewTab, { key: "ArrowRight" });

    expect(codeTab).toHaveFocus();
  });

  it("Home/Endで先頭・末尾の有効タブへフォーカス移動する", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );

    const overviewTab = screen.getByTestId("tab-overview");
    const codeTab = screen.getByTestId("tab-code");
    codeTab.focus();

    fireEvent.keyDown(codeTab, { key: "Home" });
    expect(overviewTab).toHaveFocus();

    fireEvent.keyDown(overviewTab, { key: "End" });
    expect(codeTab).toHaveFocus();
  });

  it("Enter/Spaceでフォーカス中タブをアクティブ化する", () => {
    const handleTabChange = vi.fn();
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={handleTabChange}
      />,
    );

    const codeTab = screen.getByTestId("tab-code");
    codeTab.focus();
    fireEvent.keyDown(codeTab, { key: "Enter" });
    fireEvent.keyDown(codeTab, { key: " " });

    expect(handleTabChange).toHaveBeenCalledWith("code");
    expect(handleTabChange).toHaveBeenCalledTimes(2);
  });

  it("mobile向けに横スクロールクラスを持つ", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );
    expect(screen.getByRole("tablist")).toHaveClass("overflow-x-auto");
  });

  describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
    it("レンダリングできる", () => {
      document.documentElement.setAttribute("data-theme", theme);
      render(
        <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
      );
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });
  });
});
