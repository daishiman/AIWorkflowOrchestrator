import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppDock, type ViewType } from "./index";

describe("AppDock", () => {
  const defaultProps = {
    currentView: "dashboard" as ViewType,
    onViewChange: vi.fn(),
    mode: "desktop" as const,
  };

  describe("レンダリング", () => {
    it("ナビゲーションをレンダリングする", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("aria-labelを設定する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Main navigation",
      );
    });

    it("5つのナビゲーションアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(5);
    });
  });

  describe("ナビゲーションアイテム", () => {
    it("Dashboardアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    });

    it("Editorアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("Editor")).toBeInTheDocument();
    });

    it("Chatアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("Chat")).toBeInTheDocument();
    });

    it("Graphアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("Graph")).toBeInTheDocument();
    });

    it("Settingsアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("Settings")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("ナビゲーションアイテムクリック時にonViewChangeを呼び出す", () => {
      const handleViewChange = vi.fn();
      render(<AppDock {...defaultProps} onViewChange={handleViewChange} />);
      fireEvent.click(screen.getByLabelText("Editor"));
      expect(handleViewChange).toHaveBeenCalledWith("editor");
    });

    it("各ビューへの切り替えが可能", () => {
      const handleViewChange = vi.fn();
      render(<AppDock {...defaultProps} onViewChange={handleViewChange} />);

      fireEvent.click(screen.getByLabelText("Chat"));
      expect(handleViewChange).toHaveBeenCalledWith("chat");

      fireEvent.click(screen.getByLabelText("Graph"));
      expect(handleViewChange).toHaveBeenCalledWith("graph");

      fireEvent.click(screen.getByLabelText("Settings"));
      expect(handleViewChange).toHaveBeenCalledWith("settings");
    });
  });

  describe("現在のビュー", () => {
    it("現在のビューがアクティブ状態になる", () => {
      render(<AppDock {...defaultProps} currentView="dashboard" />);
      expect(screen.getByLabelText("Dashboard")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("他のビューは非アクティブ状態", () => {
      render(<AppDock {...defaultProps} currentView="dashboard" />);
      expect(screen.getByLabelText("Editor")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });

  describe("デスクトップモード", () => {
    it("デスクトップモードで縦方向レイアウト", () => {
      render(<AppDock {...defaultProps} mode="desktop" />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("w-20");
      expect(nav).toHaveClass("h-full");
      expect(nav).toHaveClass("flex-col");
    });

    it("デスクトップモードでロゴを表示する", () => {
      render(<AppDock {...defaultProps} mode="desktop" />);
      expect(screen.getByLabelText("Knowledge Studio")).toBeInTheDocument();
    });

    it("デスクトップモードで右ボーダーを表示する", () => {
      render(<AppDock {...defaultProps} mode="desktop" />);
      expect(screen.getByRole("navigation")).toHaveClass("border-r");
    });
  });

  describe("モバイルモード", () => {
    it("モバイルモードで横方向レイアウト", () => {
      render(<AppDock {...defaultProps} mode="mobile" />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("h-[70px]");
      expect(nav).toHaveClass("w-full");
      expect(nav).toHaveClass("flex-row");
    });

    it("モバイルモードでロゴを表示しない", () => {
      render(<AppDock {...defaultProps} mode="mobile" />);
      expect(
        screen.queryByLabelText("Knowledge Studio"),
      ).not.toBeInTheDocument();
    });

    it("モバイルモードで下ボーダーを表示する", () => {
      render(<AppDock {...defaultProps} mode="mobile" />);
      expect(screen.getByRole("navigation")).toHaveClass("border-t");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(AppDock.displayName).toBe("AppDock");
    });
  });
});
