import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NotificationCenter } from "./index";
import { useAppStore } from "../../../store";

const mockGetHistory = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
const mockDelete = vi.fn();
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
        delete: mockDelete,
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
    useAppStore.getState().setExpandedNotificationId(null);
    vi.setSystemTime(new Date("2026-03-05T12:02:00.000Z"));

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
    mockDelete.mockResolvedValue({
      success: true,
      data: { deleted: true },
    });
    mockClear.mockResolvedValue({ success: true, data: { deletedCount: 1 } });
    mockOnNew.mockReturnValue(mockUnsubscribe);

    setupElectronApi();
  });

  it("初期同期で履歴を読み込み、Portal上にお知らせポップオーバーを表示する", async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenCalledWith({ limit: 100, offset: 0 });
    });

    fireEvent.click(screen.getByTestId("notification-bell-button"));

    expect(
      screen.getByRole("dialog", {
        name: "お知らせ",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("通知テスト")).toBeInTheDocument();
    expect(screen.getByTestId("notification-badge")).toBeInTheDocument();
    expect(screen.getByText(/2\s*分前/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "すべて削除" }),
    ).not.toBeInTheDocument();
  });

  it("Bellトリガーはaria属性を更新し、Escapeで閉じてfocusを戻す", async () => {
    render(<NotificationCenter />);
    const bellButton = screen.getByTestId("notification-bell-button");

    fireEvent.click(bellButton);

    expect(bellButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByTestId("notification-popover"),
      ).not.toBeInTheDocument();
    });

    expect(bellButton).toHaveFocus();
    expect(bellButton).toHaveAttribute("aria-expanded", "false");
  });

  it("項目押下で既読IPC呼び出しと詳細展開を行う", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));
    const itemButton = await screen.findByTestId("notification-item-n-1");
    fireEvent.click(itemButton);

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledWith({ notificationId: "n-1" });
    });

    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  it("すべて既読操作でmarkAllRead IPC呼び出しを行う", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));
    fireEvent.click(await screen.findByRole("button", { name: "すべて既読" }));

    await waitFor(() => {
      expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
    });
  });

  it("左スワイプ相当のポインター操作で削除ボタンを出し、delete IPCを呼ぶ", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));
    const itemButton = await screen.findByTestId("notification-item-n-1");

    fireEvent.pointerDown(itemButton, { clientX: 240 });
    fireEvent.pointerMove(itemButton, { clientX: 160 });
    fireEvent.pointerUp(itemButton, { clientX: 160 });

    fireEvent.click(screen.getByTestId("notification-delete-n-1"));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ notificationId: "n-1" });
    });
  });

  it("empty state を表示できる", async () => {
    mockGetHistory.mockResolvedValueOnce({
      success: true,
      data: { notifications: [], totalCount: 0 },
    });

    render(<NotificationCenter />);
    fireEvent.click(screen.getByTestId("notification-bell-button"));

    expect(await screen.findByText("お知らせはありません")).toBeInTheDocument();
  });

  it("outside click でポップオーバーを閉じる", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));
    expect(
      await screen.findByTestId("notification-popover"),
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(
        screen.queryByTestId("notification-popover"),
      ).not.toBeInTheDocument();
    });
  });

  it("Tab wrapでfocus trapを維持する", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByTestId("notification-bell-button"));

    const markAllButton = await screen.findByRole("button", {
      name: "すべて既読",
    });
    const itemButton = screen.getByTestId("notification-item-n-1");

    itemButton.focus();
    fireEvent.keyDown(itemButton, { key: "Tab" });

    expect(markAllButton).toHaveFocus();
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
