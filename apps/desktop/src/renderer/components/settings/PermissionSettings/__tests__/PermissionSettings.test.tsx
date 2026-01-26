/**
 * PermissionSettings コンポーネントテスト
 *
 * TASK-3-1-E: rememberChoice機能永続化
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PermissionSettings } from "../index";
import type { AllowedToolEntry } from "@repo/shared";

// Mock permissionAPI
const mockGetAllowedTools = vi.fn();
const mockRevokeTool = vi.fn();
const mockClearAll = vi.fn();

const mockPermissionAPI = {
  getAllowedTools: mockGetAllowedTools,
  revokeTool: mockRevokeTool,
  clearAll: mockClearAll,
};

describe("PermissionSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup window.permissionAPI mock
    Object.defineProperty(window, "permissionAPI", {
      value: mockPermissionAPI,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("初期表示", () => {
    it("ローディング状態が表示される", () => {
      mockGetAllowedTools.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<PermissionSettings />);

      const container = screen.getByTestId("permission-settings");
      expect(container).toHaveAttribute("aria-busy", "true");
    });

    it("許可済みツールが存在しない場合、空状態が表示される", async () => {
      mockGetAllowedTools.mockResolvedValue({ tools: [] });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });

      expect(
        screen.getByText("No tools have been allowed yet."),
      ).toBeInTheDocument();
    });

    it("許可済みツール一覧が表示される", async () => {
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
        { toolName: "Read", allowedAt: "2025-01-25T11:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByTestId("tool-item-Bash")).toBeInTheDocument();
      });

      expect(screen.getByText("Bash")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
      expect(screen.getByText("2 tools allowed")).toBeInTheDocument();
    });

    it("カスタムクラス名が適用される", async () => {
      mockGetAllowedTools.mockResolvedValue({ tools: [] });

      render(<PermissionSettings className="custom-class" />);

      await waitFor(() => {
        expect(screen.getByTestId("permission-settings")).toHaveClass(
          "custom-class",
        );
      });
    });
  });

  describe("ツール許可取り消し", () => {
    it("Revokeボタンクリックでツールの許可が取り消される", async () => {
      const user = userEvent.setup();
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools
        .mockResolvedValueOnce({ tools })
        .mockResolvedValueOnce({ tools: [] });
      mockRevokeTool.mockResolvedValue({ success: true });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByTestId("tool-item-Bash")).toBeInTheDocument();
      });

      const revokeButton = screen.getByRole("button", {
        name: /revoke permission for bash/i,
      });
      await user.click(revokeButton);

      await waitFor(() => {
        expect(mockRevokeTool).toHaveBeenCalledWith("Bash");
      });

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("取り消し中はボタンがdisabledになる", async () => {
      const user = userEvent.setup();
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });
      mockRevokeTool.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByTestId("tool-item-Bash")).toBeInTheDocument();
      });

      const revokeButton = screen.getByRole("button", {
        name: /revoke permission for bash/i,
      });
      await user.click(revokeButton);

      await waitFor(() => {
        expect(revokeButton).toBeDisabled();
        expect(revokeButton).toHaveAttribute("aria-busy", "true");
        expect(revokeButton).toHaveTextContent("Revoking...");
      });
    });

    it("取り消し失敗時にエラーが表示される", async () => {
      const user = userEvent.setup();
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });
      mockRevokeTool.mockResolvedValue({ success: false });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByTestId("tool-item-Bash")).toBeInTheDocument();
      });

      const revokeButton = screen.getByRole("button", {
        name: /revoke permission for bash/i,
      });
      await user.click(revokeButton);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to revoke permission for Bash"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("全許可クリア", () => {
    it("Clear Allボタンクリックで全ての許可がクリアされる", async () => {
      const user = userEvent.setup();
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
        { toolName: "Read", allowedAt: "2025-01-25T11:00:00.000Z" },
      ];
      mockGetAllowedTools
        .mockResolvedValueOnce({ tools })
        .mockResolvedValueOnce({ tools: [] });
      mockClearAll.mockResolvedValue({ success: true, clearedCount: 2 });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByText("Bash")).toBeInTheDocument();
      });

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearAllButton);

      await waitFor(() => {
        expect(mockClearAll).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });

    it("空の場合はClear Allボタンが表示されない", async () => {
      mockGetAllowedTools.mockResolvedValue({ tools: [] });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /clear all/i }),
      ).not.toBeInTheDocument();
    });

    it("クリア中はボタンがdisabledになる", async () => {
      const user = userEvent.setup();
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });
      mockClearAll.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByText("Bash")).toBeInTheDocument();
      });

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearAllButton);

      await waitFor(() => {
        expect(clearAllButton).toBeDisabled();
        expect(clearAllButton).toHaveAttribute("aria-busy", "true");
        expect(clearAllButton).toHaveTextContent("Clearing...");
      });
    });

    it("クリア失敗時にエラーが表示される", async () => {
      const user = userEvent.setup();
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });
      mockClearAll.mockResolvedValue({ success: false, clearedCount: 0 });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByText("Bash")).toBeInTheDocument();
      });

      const clearAllButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearAllButton);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to clear all permissions"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("API呼び出し失敗時にエラーが表示される", async () => {
      mockGetAllowedTools.mockRejectedValue(new Error("Network error"));

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load permission settings"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("アクセシビリティ", () => {
    it("ツールリストに適切なラベルがある", async () => {
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(
          screen.getByRole("list", { name: /allowed tools/i }),
        ).toBeInTheDocument();
      });
    });

    it("Revokeボタンに適切なaria-labelがある", async () => {
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /revoke permission for bash/i }),
        ).toBeInTheDocument();
      });
    });

    it("エラーメッセージにrole=alertがある", async () => {
      mockGetAllowedTools.mockRejectedValue(new Error("Network error"));

      render(<PermissionSettings />);

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toHaveTextContent("Failed to load permission settings");
      });
    });
  });

  describe("日付フォーマット", () => {
    it("ISO日付が人間が読める形式で表示される", async () => {
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "2025-01-25T10:00:00.000Z" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });

      render(<PermissionSettings />);

      await waitFor(() => {
        // Just check that the date is displayed (format depends on locale)
        expect(screen.getByText(/Allowed:/)).toBeInTheDocument();
      });
    });

    it("不正な日付文字列でもエラーにならない", async () => {
      const tools: AllowedToolEntry[] = [
        { toolName: "Bash", allowedAt: "invalid-date" },
      ];
      mockGetAllowedTools.mockResolvedValue({ tools });

      render(<PermissionSettings />);

      await waitFor(() => {
        expect(screen.getByText("Bash")).toBeInTheDocument();
      });

      // Should display "Invalid Date" or the original string if parsing fails
      // (toLocaleString returns "Invalid Date" for invalid Date objects)
      expect(screen.getByText(/Allowed:/)).toBeInTheDocument();
    });
  });
});
