import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TabSwitcher } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

const tabs = [
  { id: "overview", label: "概要" },
  { id: "code", label: "コード", badge: 2 },
  { id: "config", label: "設定", disabled: true },
];

describe("TabSwitcher", () => {
  it("tablistとtabをレンダリングする", () => {
    render(
      <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
    );

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("activeTabにaria-selected=trueを設定する", () => {
    render(<TabSwitcher tabs={tabs} activeTab="code" onTabChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "コード 2件" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("有効タブクリックでonTabChangeを呼ぶ", () => {
    const onTabChange = vi.fn();
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={onTabChange}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "コード 2件" }));
    expect(onTabChange).toHaveBeenCalledWith("code");
  });

  it("disabledタブはクリックしてもonTabChangeを呼ばない", () => {
    const onTabChange = vi.fn();
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={onTabChange}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "設定" }));
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it("pillバリアントでアクティブ時にbg-tertiaryを持つ", () => {
    render(
      <TabSwitcher
        tabs={tabs}
        activeTab="overview"
        onTabChange={vi.fn()}
        variant="pill"
      />,
    );

    expect(screen.getByRole("tab", { name: "概要" })).toHaveClass(
      "bg-[var(--bg-tertiary)]",
    );
  });

  it("3テーマでレンダリングできる", () => {
    expect(() => {
      renderWithAllThemes(
        <TabSwitcher tabs={tabs} activeTab="overview" onTabChange={vi.fn()} />,
      );
    }).not.toThrow();
  });
});
