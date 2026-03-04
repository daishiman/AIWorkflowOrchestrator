import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SlideInPanel } from "../index";

describe("SlideInPanel", () => {
  it("isOpen=trueでパネルを表示する", () => {
    render(
      <SlideInPanel isOpen onClose={vi.fn()} side="right" title="詳細">
        <div>panel-content</div>
      </SlideInPanel>,
    );
    expect(screen.getByRole("dialog", { name: "詳細" })).toBeInTheDocument();
    expect(screen.getByText("panel-content")).toBeInTheDocument();
  });

  it("isOpen=falseでパネルを表示しない", () => {
    render(
      <SlideInPanel isOpen={false} onClose={vi.fn()} side="right">
        <div>panel-content</div>
      </SlideInPanel>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("side=right/leftで位置クラスを切り替える", () => {
    const { rerender } = render(
      <SlideInPanel isOpen onClose={vi.fn()} side="right" title="右">
        <div>panel-content</div>
      </SlideInPanel>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("right-0");

    rerender(
      <SlideInPanel isOpen onClose={vi.fn()} side="left" title="左">
        <div>panel-content</div>
      </SlideInPanel>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("left-0");
  });

  it("EscapeキーでonCloseを呼び出す", () => {
    const handleClose = vi.fn();
    render(
      <SlideInPanel isOpen onClose={handleClose} side="right">
        <button type="button">inside</button>
      </SlideInPanel>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("showOverlay=trueでオーバーレイを表示しクリックで閉じる", () => {
    const handleClose = vi.fn();
    render(
      <SlideInPanel isOpen onClose={handleClose} side="right" showOverlay>
        <div>panel-content</div>
      </SlideInPanel>,
    );

    fireEvent.click(screen.getByTestId("slide-in-panel-overlay"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("width指定をスタイルに反映する", () => {
    render(
      <SlideInPanel
        isOpen
        onClose={vi.fn()}
        side="right"
        width="520px"
        title="詳細"
      >
        <div>panel-content</div>
      </SlideInPanel>,
    );
    expect(screen.getByRole("dialog")).toHaveStyle({
      width: "min(100vw, 520px)",
    });
  });

  it("title未指定時はaria-labelを設定する", () => {
    render(
      <SlideInPanel isOpen onClose={vi.fn()} side="right">
        <div>panel-content</div>
      </SlideInPanel>,
    );
    expect(
      screen.getByRole("dialog", { name: "サイドパネル" }),
    ).toBeInTheDocument();
  });

  it("フォーカストラップが機能する", () => {
    render(
      <SlideInPanel isOpen onClose={vi.fn()} side="right" title="詳細">
        <button type="button">first</button>
        <button type="button">last</button>
      </SlideInPanel>,
    );

    const closeButton = screen.getByRole("button", { name: "閉じる" });
    const lastButton = screen.getByRole("button", { name: "last" });

    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(lastButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab" });
    expect(closeButton).toHaveFocus();
  });

  it("閉じたあとにフォーカスを復元する", () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <>
        <button type="button">opener</button>
        <SlideInPanel isOpen={false} onClose={handleClose} side="right">
          <div>panel-content</div>
        </SlideInPanel>
      </>,
    );

    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();

    rerender(
      <>
        <button type="button">opener</button>
        <SlideInPanel isOpen onClose={handleClose} side="right">
          <button type="button">inside</button>
        </SlideInPanel>
      </>,
    );

    rerender(
      <>
        <button type="button">opener</button>
        <SlideInPanel isOpen={false} onClose={handleClose} side="right">
          <div>panel-content</div>
        </SlideInPanel>
      </>,
    );

    expect(opener).toHaveFocus();
  });

  describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
    it("レンダリングできる", () => {
      document.documentElement.setAttribute("data-theme", theme);
      render(
        <SlideInPanel isOpen onClose={vi.fn()} side="right" title="詳細">
          <div>panel-content</div>
        </SlideInPanel>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
