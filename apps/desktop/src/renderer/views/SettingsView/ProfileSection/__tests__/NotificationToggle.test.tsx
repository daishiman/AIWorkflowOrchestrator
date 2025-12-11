/**
 * NotificationToggle コンポーネントテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationToggle } from "../NotificationToggle";
import type { NotificationSettings } from "@repo/shared/types/auth";

describe("NotificationToggle", () => {
  const mockOnChange = vi.fn();
  const defaultNotificationSettings: NotificationSettings = {
    email: true,
    desktop: true,
    sound: true,
    workflowComplete: true,
    workflowError: true,
  };
  const defaultProps = {
    value: defaultNotificationSettings,
    onChange: mockOnChange,
    disabled: false,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("通知設定セクションをレンダリングする", () => {
      render(<NotificationToggle {...defaultProps} />);
      expect(screen.getByTestId("notification-toggle")).toBeInTheDocument();
    });

    it("セクションタイトル「通知設定」を表示する", () => {
      render(<NotificationToggle {...defaultProps} />);
      expect(screen.getByText("通知設定")).toBeInTheDocument();
    });

    it("5つのトグルを表示する", () => {
      render(<NotificationToggle {...defaultProps} />);
      expect(screen.getByText("メール通知")).toBeInTheDocument();
      expect(screen.getByText("デスクトップ通知")).toBeInTheDocument();
      expect(screen.getByText("通知音")).toBeInTheDocument();
      expect(screen.getByText("ワークフロー完了")).toBeInTheDocument();
      expect(screen.getByText("ワークフローエラー")).toBeInTheDocument();
    });
  });

  describe("トグル操作", () => {
    it("メール通知トグルをクリックするとonChangeが呼ばれる", async () => {
      render(<NotificationToggle {...defaultProps} />);
      const emailCheckbox = screen.getByRole("checkbox", {
        name: /メール通知/i,
      });
      await userEvent.click(emailCheckbox);
      expect(mockOnChange).toHaveBeenCalledWith({ email: false });
    });

    it("オフの設定をオンにする", async () => {
      const offSettings = { ...defaultNotificationSettings, email: false };
      render(<NotificationToggle {...defaultProps} value={offSettings} />);
      const emailCheckbox = screen.getByRole("checkbox", {
        name: /メール通知/i,
      });
      await userEvent.click(emailCheckbox);
      expect(mockOnChange).toHaveBeenCalledWith({ email: true });
    });
  });

  describe("一括操作", () => {
    it("「すべて有効」ボタンを表示する", () => {
      render(<NotificationToggle {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /すべて有効/i }),
      ).toBeInTheDocument();
    });

    it("「すべて無効」ボタンを表示する", () => {
      render(<NotificationToggle {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /すべて無効/i }),
      ).toBeInTheDocument();
    });

    it("「すべて無効」をクリックすると全ての通知がオフになる", async () => {
      render(<NotificationToggle {...defaultProps} />);
      const disableAllButton = screen.getByRole("button", {
        name: /すべて無効/i,
      });
      await userEvent.click(disableAllButton);
      expect(mockOnChange).toHaveBeenCalledWith({
        email: false,
        desktop: false,
        sound: false,
        workflowComplete: false,
        workflowError: false,
      });
    });

    it("全て有効の時は「すべて有効」ボタンが無効化される", () => {
      render(<NotificationToggle {...defaultProps} />);
      const enableAllButton = screen.getByRole("button", {
        name: /すべて有効/i,
      });
      expect(enableAllButton).toBeDisabled();
    });

    it("全て無効の時は「すべて無効」ボタンが無効化される", () => {
      const allOffSettings: NotificationSettings = {
        email: false,
        desktop: false,
        sound: false,
        workflowComplete: false,
        workflowError: false,
      };
      render(<NotificationToggle {...defaultProps} value={allOffSettings} />);
      const disableAllButton = screen.getByRole("button", {
        name: /すべて無効/i,
      });
      expect(disableAllButton).toBeDisabled();
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中はトグルが無効化される", () => {
      render(<NotificationToggle {...defaultProps} isLoading={true} />);
      const emailCheckbox = screen.getByRole("checkbox", {
        name: /メール通知/i,
      });
      expect(emailCheckbox).toBeDisabled();
    });

    it("ローディングインジケーターを表示する", () => {
      render(<NotificationToggle {...defaultProps} isLoading={true} />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it('role="group"を持つ', () => {
      render(<NotificationToggle {...defaultProps} />);
      expect(
        screen.getByRole("group", { name: /通知設定/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("classNameを追加できる", () => {
      render(<NotificationToggle {...defaultProps} className="custom-class" />);
      expect(screen.getByTestId("notification-toggle")).toHaveClass(
        "custom-class",
      );
    });

    it("compactモードで説明テキストを非表示にできる", () => {
      render(<NotificationToggle {...defaultProps} compact />);
      expect(
        screen.queryByText("重要な通知をメールで受け取る"),
      ).not.toBeInTheDocument();
    });
  });
});
