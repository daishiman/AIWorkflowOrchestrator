import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MobileDrawer } from "./index";

describe("MobileDrawer", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  describe("レンダリング", () => {
    it("open=falseの場合、何もレンダリングしない", () => {
      const { container } = render(
        <MobileDrawer open={false} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("open=trueの場合、ドロワーをレンダリングする", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("閉じるボタンが表示される", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      expect(
        screen.getByRole("button", { name: "閉じる" }),
      ).toBeInTheDocument();
    });

    it("aria-modal属性が設定される", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("カスタムclassNameが適用される", () => {
      render(
        <MobileDrawer open={true} onClose={onClose} className="custom-drawer">
          <div>Content</div>
        </MobileDrawer>,
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("custom-drawer");
    });
  });

  describe("インタラクション", () => {
    it("閉じるボタンクリックでonCloseが呼ばれる", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("オーバーレイクリックでonCloseが呼ばれる", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      // aria-hidden="true" のオーバーレイをクリック
      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();
      fireEvent.click(overlay!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Escapeキーでoncloseが呼ばれる", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("open=falseの場合、Escapeキーでoncloseは呼ばれない", () => {
      render(
        <MobileDrawer open={false} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("body overflow", () => {
    it("open時にbody.style.overflowがhiddenになる", () => {
      render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("アンマウント時にbody.style.overflowがリセットされる", () => {
      const { unmount } = render(
        <MobileDrawer open={true} onClose={onClose}>
          <div>Content</div>
        </MobileDrawer>,
      );
      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(MobileDrawer.displayName).toBe("MobileDrawer");
    });
  });
});
