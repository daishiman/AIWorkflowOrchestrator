import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useAppStore } from "../../../store";
import { MobileNavBar } from "./index";

describe("MobileNavBar", () => {
  beforeEach(() => {
    useAppStore.setState({
      responsiveMode: "mobile",
      isMobileMoreOpen: false,
    });
  });

  it("主要5項目と More ボタンを表示する", () => {
    render(<MobileNavBar currentView="dashboard" onViewChange={vi.fn()} />);

    expect(screen.getByLabelText("ダッシュボード")).toBeInTheDocument();
    expect(screen.getByText("ダッシュ")).toBeInTheDocument();
    expect(screen.getByLabelText("ワークスペース")).toBeInTheDocument();
    expect(screen.getByText("ワーク")).toBeInTheDocument();
    expect(screen.getByLabelText("チャット")).toBeInTheDocument();
    expect(screen.getByLabelText("エージェント")).toBeInTheDocument();
    expect(screen.getByText("実行")).toBeInTheDocument();
    expect(screen.getByLabelText("スキルセンター")).toBeInTheDocument();
    expect(screen.getByText("スキル")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "その他" })).toBeInTheDocument();
    expect(screen.queryByText("履歴検索")).not.toBeInTheDocument();
  });

  it("More メニューで残り5項目を表示し、選択時に onViewChange を呼ぶ", () => {
    const onViewChange = vi.fn();
    render(
      <MobileNavBar currentView="dashboard" onViewChange={onViewChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "その他" }));

    const menu = screen.getByRole("menu", {
      name: "その他のナビゲーション",
    });
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(5);

    fireEvent.click(within(menu).getByRole("menuitem", { name: /履歴検索/ }));
    expect(onViewChange).toHaveBeenCalledWith("historySearch");
  });

  it("主要項目クリックで onViewChange を呼び出し、Escape で More を閉じる", () => {
    const onViewChange = vi.fn();
    render(
      <MobileNavBar currentView="dashboard" onViewChange={onViewChange} />,
    );

    fireEvent.click(screen.getByLabelText("ワークスペース"));
    expect(onViewChange).toHaveBeenCalledWith("workspace");

    fireEvent.click(screen.getByRole("button", { name: "その他" }));
    expect(
      screen.getByRole("menu", { name: "その他のナビゲーション" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("menu", { name: "その他のナビゲーション" }),
    ).not.toBeInTheDocument();
  });

  it("More メニューは外側クリックで閉じる", () => {
    render(<MobileNavBar currentView="dashboard" onViewChange={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: "その他" });
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "その他のナビゲーション" });
    expect(menu).toBeInTheDocument();

    fireEvent.mouseDown(menu);
    expect(menu).toBeInTheDocument();

    fireEvent.mouseDown(trigger);
    expect(menu).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Enter" });
    expect(menu).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(
      screen.queryByRole("menu", { name: "その他のナビゲーション" }),
    ).not.toBeInTheDocument();
  });

  it("secondary view がアクティブなとき More を現在地表示する", () => {
    render(<MobileNavBar currentView="settings" onViewChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "その他" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
