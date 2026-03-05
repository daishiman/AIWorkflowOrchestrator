import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationCenter } from "./index";
import { useAppStore } from "../../../store";

const mockGetHistory = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
const mockClear = vi.fn();
const mockOnNew = vi.fn();
const mockUnsubscribe = vi.fn();

function setupElectronApi() {
  Object.defineProperty(window, "electronAPI", {
    value: {
      notification: {
        getHistory: mockGetHistory,
        markRead: mockMarkRead,
        markAllRead: mockMarkAllRead,
        clear: mockClear,
        onNew: mockOnNew,
      },
    },
    configurable: true,
    writable: true,
  });
}

describe("NotificationCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.getState().clearAllNotifications();
    useAppStore.getState().setPopoverOpen(false);

    mockGetHistory.mockResolvedValue({
      success: true,
      data: {
        notifications: [
          {
            id: "n-1",
            type: "info",
            title: "通知テスト",
            detail: "Detail",
            timestamp: "2026-03-05T12:00:00.000Z",
            isRead: false,
            source: { kind: "system", eventType: "test" },
          },
        ],
        totalCount: 1,
      },
    });
    mockMarkRead.mockResolvedValue({ success: true, data: { updated: true } });
    mockMarkAllRead.mockResolvedValue({
      success: true,
      data: { updatedCount: 1 },
    });
    mockClear.mockResolvedValue({ success: true, data: { deletedCount: 1 } });
    mockOnNew.mockReturnValue(mockUnsubscribe);

    setupElectronApi();
  });

  it("初期同期で通知履歴を読み込み、ポップオーバー表示できる", async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenCalledWith({ limit: 100, offset: 0 });
    });

    fireEvent.click(screen.getByTestId("notification-bell-button"));

    expect(screen.getByTestId("notification-popover")).toBeInTheDocument();
    expect(screen.getByText("通知テスト")).toBeInTheDocument();
    expect(screen.getByTestId("notification-badge")).toBeInTheDocument();
  });

  it("既読操作でIPC呼び出しを行う", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));

    const markReadButton = await screen.findByRole("button", {
      name: "既読にする",
    });
    fireEvent.click(markReadButton);

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledWith({ notificationId: "n-1" });
    });
  });

  it("unmount時に購読解除する", async () => {
    const { unmount } = render(<NotificationCenter />);

    await waitFor(() => {
      expect(mockOnNew).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
