import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useAppStore } from "../../../store";
import { GlobalNavStrip } from "./index";

describe("GlobalNavStrip", () => {
  beforeEach(() => {
    useAppStore.setState({
      responsiveMode: "desktop",
      isNavExpanded: true,
      isMobileMoreOpen: false,
    });
  });

  it("9項目を3セクションで描画する", () => {
    const { container } = render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={vi.fn()}
        mode="desktop"
      />,
    );

    expect(container.querySelectorAll('[data-nav-item="true"]')).toHaveLength(
      9,
    );
    expect(screen.getAllByRole("group")).toHaveLength(3);
  });

  it("アクティブなビューに aria-current を付与する", () => {
    render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={vi.fn()}
        mode="desktop"
      />,
    );

    expect(
      screen.getByRole("button", { name: "ダッシュボード" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("ArrowDown と End でフォーカス移動できる", () => {
    const { container } = render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={vi.fn()}
        mode="desktop"
      />,
    );
    const navItems = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-nav-item="true"]'),
    );

    navItems[0]?.focus();
    fireEvent.keyDown(navItems[0] as HTMLButtonElement, { key: "ArrowDown" });
    expect(navItems[1]).toHaveFocus();

    fireEvent.keyDown(navItems[1] as HTMLButtonElement, { key: "End" });
    expect(navItems[8]).toHaveFocus();

    fireEvent.keyDown(navItems[8] as HTMLButtonElement, { key: "Home" });
    expect(navItems[0]).toHaveFocus();
  });

  it("折りたたみボタンで uiSlice の展開状態を切り替える", () => {
    render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={vi.fn()}
        mode="desktop"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "ナビゲーションを折りたたむ" }),
    );
    expect(useAppStore.getState().isNavExpanded).toBe(false);
  });

  it("ロゴとナビ項目クリックで onViewChange を呼び出す", () => {
    const onViewChange = vi.fn();
    render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={onViewChange}
        mode="desktop"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "ダッシュボードへ移動" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "設定" }));

    expect(onViewChange).toHaveBeenNthCalledWith(1, "dashboard");
    expect(onViewChange).toHaveBeenNthCalledWith(2, "settings");
  });

  it("tablet では強制的に collapsed 幅になる", () => {
    useAppStore.setState({
      responsiveMode: "tablet",
      isNavExpanded: true,
    });

    render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={vi.fn()}
        mode="desktop"
      />,
    );

    expect(screen.getByRole("navigation")).toHaveStyle({ width: "56px" });
    expect(screen.queryByText("⌘+1")).not.toBeInTheDocument();
  });

  it("mode=mobile では MobileNavBar 互換表示に切り替える", () => {
    useAppStore.setState({ responsiveMode: "mobile" });

    render(
      <GlobalNavStrip
        currentView="dashboard"
        onViewChange={vi.fn()}
        mode="mobile"
      />,
    );

    expect(screen.getByRole("button", { name: "その他" })).toBeInTheDocument();
  });
});
