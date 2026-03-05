import React, { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useAppStore } from "../../../store";

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "不明な時刻";
  }
  return date.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message !== "") {
    return error.message;
  }
  return "通知処理に失敗しました";
}

export const NotificationCenter: React.FC = () => {
  const notifications = useAppStore((state) => state.notifications);
  const unreadCount = useAppStore((state) => state.unreadCount);
  const isPopoverOpen = useAppStore((state) => state.isPopoverOpen);
  const expandedNotificationId = useAppStore(
    (state) => state.expandedNotificationId,
  );
  const setPopoverOpen = useAppStore((state) => state.setPopoverOpen);
  const setExpandedNotificationId = useAppStore(
    (state) => state.setExpandedNotificationId,
  );
  const markAsRead = useAppStore((state) => state.markAsRead);
  const markAllAsRead = useAppStore((state) => state.markAllAsRead);
  const clearAllNotifications = useAppStore(
    (state) => state.clearAllNotifications,
  );
  const ingestNotification = useAppStore((state) => state.ingestNotification);
  const setNotificationHistory = useAppStore(
    (state) => state.setNotificationHistory,
  );

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI?.notification) {
      return;
    }

    let mounted = true;

    const syncHistory = async () => {
      try {
        const result = await window.electronAPI.notification.getHistory({
          limit: 100,
          offset: 0,
        });
        if (mounted && result.success && result.data) {
          setNotificationHistory(result.data.notifications);
        }
      } catch {
        // Initial sync failure is non-blocking for UI rendering.
      }
    };

    void syncHistory();

    const unsubscribe = window.electronAPI.notification.onNew((event) => {
      if (!mounted) {
        return;
      }
      ingestNotification(event.notification);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [ingestNotification, setNotificationHistory]);

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        setPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isPopoverOpen, setPopoverOpen]);

  const unreadBadge = useMemo(() => {
    if (unreadCount <= 0) {
      return null;
    }
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  const handleMarkAsRead = async (id: string) => {
    if (!window.electronAPI?.notification) {
      return;
    }
    try {
      const result = await window.electronAPI.notification.markRead({
        notificationId: id,
      });
      if (result.success) {
        markAsRead(id);
      }
    } catch (error) {
      console.error(toErrorMessage(error));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!window.electronAPI?.notification) {
      return;
    }
    try {
      const result = await window.electronAPI.notification.markAllRead();
      if (result.success) {
        markAllAsRead();
      }
    } catch (error) {
      console.error(toErrorMessage(error));
    }
  };

  const handleClearAll = async () => {
    if (!window.electronAPI?.notification) {
      return;
    }
    try {
      const result = await window.electronAPI.notification.clear();
      if (result.success) {
        clearAllNotifications();
      }
    } catch (error) {
      console.error(toErrorMessage(error));
    }
  };

  return (
    <div className="relative" ref={panelRef} data-testid="notification-center">
      <button
        type="button"
        className={clsx(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full",
          "border border-[var(--border-primary)] bg-[var(--bg-secondary)]",
          "text-[var(--text-primary)] transition-colors duration-200",
          "hover:bg-[var(--bg-tertiary)]",
        )}
        aria-label="通知を開く"
        data-testid="notification-bell-button"
        onClick={() => setPopoverOpen(!isPopoverOpen)}
      >
        <Bell size={18} />
        {unreadBadge ? (
          <span
            className={clsx(
              "absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 py-0.5",
              "bg-[var(--status-error)] text-[10px] font-semibold text-white",
              "text-center leading-none",
            )}
            data-testid="notification-badge"
          >
            {unreadBadge}
          </span>
        ) : null}
      </button>

      {isPopoverOpen ? (
        <div
          className={clsx(
            "absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-24px)]",
            "overflow-hidden rounded-xl border border-[var(--border-primary)]",
            "bg-[var(--bg-primary)] shadow-2xl",
          )}
          data-testid="notification-popover"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-primary)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                通知履歴
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                未読 {unreadCount} 件
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                onClick={handleMarkAllAsRead}
                aria-label="すべて既読"
              >
                <CheckCheck size={16} />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                onClick={handleClearAll}
                aria-label="すべて削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
                お知らせはありません
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-primary)]">
                {notifications.map((notification) => {
                  const expanded = expandedNotificationId === notification.id;
                  return (
                    <li key={notification.id} className="px-4 py-3">
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() =>
                          setExpandedNotificationId(
                            expanded ? null : notification.id,
                          )
                        }
                        data-testid={`notification-item-${notification.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p
                              className={clsx(
                                "truncate text-sm font-medium",
                                notification.isRead
                                  ? "text-[var(--text-secondary)]"
                                  : "text-[var(--text-primary)]",
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-secondary)]">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.isRead ? (
                            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[var(--status-primary)]" />
                          ) : null}
                        </div>
                        {expanded && notification.detail ? (
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-[var(--text-secondary)]">
                            {notification.detail}
                          </p>
                        ) : null}
                      </button>
                      {!notification.isRead ? (
                        <button
                          type="button"
                          className="mt-2 rounded-md border border-[var(--border-primary)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                          onClick={() => void handleMarkAsRead(notification.id)}
                        >
                          既読にする
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

NotificationCenter.displayName = "NotificationCenter";
