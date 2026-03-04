import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SlideInPanel } from "./index";

describe("SlideInPanel", () => {
  it("isOpen=falseでは表示しない", () => {
    render(
      <SlideInPanel isOpen={false} onClose={vi.fn()} side="right">
        body
      </SlideInPanel>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("isOpen=trueでタイトルと内容を表示する", () => {
    render(
      <SlideInPanel isOpen={true} onClose={vi.fn()} side="right" title="詳細">
        panel-body
      </SlideInPanel>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("詳細")).toBeInTheDocument();
    expect(screen.getByText("panel-body")).toBeInTheDocument();
  });

  it("Escapeで閉じる", () => {
    const onClose = vi.fn();
    render(
      <SlideInPanel isOpen={true} onClose={onClose} side="left">
        body
      </SlideInPanel>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("オーバーレイクリックで閉じる", () => {
    const onClose = vi.fn();
    render(
      <SlideInPanel
        isOpen={true}
        onClose={onClose}
        side="right"
        showOverlay={true}
      >
        body
      </SlideInPanel>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "オーバーレイを閉じる" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("幅指定を適用する", () => {
    render(
      <SlideInPanel isOpen={true} onClose={vi.fn()} side="right" width="512px">
        body
      </SlideInPanel>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveStyle({ width: "512px" });
  });
});
