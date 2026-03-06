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

    it("9個のナビゲーションアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(9);
    });
  });

  describe("ナビゲーションアイテム", () => {
    it("Dashboardアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("ダッシュボード")).toBeInTheDocument();
    });

    it("Workspaceアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("ワークスペース")).toBeInTheDocument();
    });

    it("Chatアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("チャット")).toBeInTheDocument();
    });

    it("Graphアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("グラフ")).toBeInTheDocument();
    });

    it("Agentアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("エージェント")).toBeInTheDocument();
    });

    it("Skillsアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("スキルセンター")).toBeInTheDocument();
    });

    it("Settingsアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("設定")).toBeInTheDocument();
    });

    it("Historyアイテムを表示する", () => {
      render(<AppDock {...defaultProps} />);
      expect(screen.getByLabelText("履歴検索")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("ナビゲーションアイテムクリック時にonViewChangeを呼び出す", () => {
      const handleViewChange = vi.fn();
      render(<AppDock {...defaultProps} onViewChange={handleViewChange} />);
      fireEvent.click(screen.getByLabelText("ワークスペース"));
      expect(handleViewChange).toHaveBeenCalledWith("workspace");
    });

    it("各ビューへの切り替えが可能", () => {
      const handleViewChange = vi.fn();
      render(<AppDock {...defaultProps} onViewChange={handleViewChange} />);

      fireEvent.click(screen.getByLabelText("チャット"));
      expect(handleViewChange).toHaveBeenCalledWith("chat");

      fireEvent.click(screen.getByLabelText("グラフ"));
      expect(handleViewChange).toHaveBeenCalledWith("graph");

      fireEvent.click(screen.getByLabelText("エージェント"));
      expect(handleViewChange).toHaveBeenCalledWith("agent");

      fireEvent.click(screen.getByLabelText("スキルセンター"));
      expect(handleViewChange).toHaveBeenCalledWith("skillCenter");

      fireEvent.click(screen.getByLabelText("履歴検索"));
      expect(handleViewChange).toHaveBeenCalledWith("historySearch");

      fireEvent.click(screen.getByLabelText("エディタ"));
      expect(handleViewChange).toHaveBeenCalledWith("editor");

      fireEvent.click(screen.getByLabelText("設定"));
      expect(handleViewChange).toHaveBeenCalledWith("settings");
    });
  });

  describe("現在のビュー", () => {
    it("現在のビューがアクティブ状態になる", () => {
      render(<AppDock {...defaultProps} currentView="dashboard" />);
      expect(screen.getByLabelText("ダッシュボード")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("他のビューは非アクティブ状態", () => {
      render(<AppDock {...defaultProps} currentView="dashboard" />);
      expect(screen.getByLabelText("エディタ")).toHaveAttribute(
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
