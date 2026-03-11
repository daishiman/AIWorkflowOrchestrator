import React, { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { Bell, ChevronDown, Trash2, X } from "lucide-react";
import { EmptyState } from "../../atoms";
import { useAppStore, useResponsiveMode } from "../../../store";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled]):not([tabindex='-1'])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "不明な時刻";
  }

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });
  const ranges = [
    { limit: 60, unit: "second" as const, divisor: 1 },
    { limit: 60 * 60, unit: "minute" as const, divisor: 60 },
    { limit: 60 * 60 * 24, unit: "hour" as const, divisor: 60 * 60 },
    { limit: 60 * 60 * 24 * 7, unit: "day" as const, divisor: 60 * 60 * 24 },
  ];

  for (const range of ranges) {
    if (Math.abs(diffSeconds) < range.limit) {
      return formatter.format(
        Math.round(diffSeconds / range.divisor),
        range.unit,
      );
    }
  }

  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message !== "") {
    return error.message;
  }
  return "通知処理に失敗しました";
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
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
  const deleteNotification = useAppStore((state) => state.deleteNotification);
  const ingestNotification = useAppStore((state) => state.ingestNotification);
  const setNotificationHistory = useAppStore(
    (state) => state.setNotificationHistory,
  );
  const responsiveMode = useResponsiveMode();

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const firstActionRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);
  const previousUnreadRef = useRef(unreadCount);
  const pointerStateRef = useRef<{
    id: string;
    startX: number;
    currentX: number;
  } | null>(null);

  const [statusMessage, setStatusMessage] = useState("");
  const [deleteRevealId, setDeleteRevealId] = useState<string | null>(null);
  const [isBellAnimating, setIsBellAnimating] = useState(false);
  const titleId = useId();

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
      setStatusMessage(`新しいお知らせ: ${event.notification.title}`);
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
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setPopoverOpen(false);
        setDeleteRevealId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isPopoverOpen, setPopoverOpen]);

  useEffect(() => {
    if (!isPopoverOpen) {
      if (wasOpenRef.current) {
        triggerRef.current?.focus();
        wasOpenRef.current = false;
      }
      setDeleteRevealId(null);
      return;
    }

    wasOpenRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      firstActionRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isPopoverOpen]);

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPopoverOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(popoverRef.current);
      if (focusableElements.length === 0) {
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopoverOpen, setPopoverOpen]);

  useEffect(() => {
    if (unreadCount <= previousUnreadRef.current) {
      previousUnreadRef.current = unreadCount;
      return;
    }

    setIsBellAnimating(true);
    const timeoutId = window.setTimeout(() => {
      setIsBellAnimating(false);
    }, 400);

    previousUnreadRef.current = unreadCount;
    return () => window.clearTimeout(timeoutId);
  }, [unreadCount]);

  const unreadBadge =
    unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null;

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
        setStatusMessage("お知らせを既読にしました");
      }
    } catch (error) {
      setStatusMessage(toErrorMessage(error));
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
        setStatusMessage("すべて既読にしました");
      }
    } catch (error) {
      setStatusMessage(toErrorMessage(error));
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.electronAPI?.notification) {
      return;
    }

    try {
      const result = await window.electronAPI.notification.delete({
        notificationId: id,
      });
      if (result.success && result.data?.deleted) {
        deleteNotification(id);
        setDeleteRevealId(null);
        setStatusMessage("お知らせを削除しました");
      }
    } catch (error) {
      setStatusMessage(toErrorMessage(error));
    }
  };

  const handleItemClick = async (id: string, isRead: boolean) => {
    setExpandedNotificationId(expandedNotificationId === id ? null : id);
    setDeleteRevealId(null);
    if (!isRead) {
      await handleMarkAsRead(id);
    }
  };

  const handlePointerStart = (id: string, clientX: number) => {
    pointerStateRef.current = {
      id,
      startX: clientX,
      currentX: clientX,
    };
  };

  const handlePointerMove = (id: string, clientX: number) => {
    if (!pointerStateRef.current || pointerStateRef.current.id !== id) {
      return;
    }

    pointerStateRef.current.currentX = clientX;
    const delta = clientX - pointerStateRef.current.startX;

    if (delta <= -48) {
      setDeleteRevealId(id);
    } else if (delta >= 24 && deleteRevealId === id) {
      setDeleteRevealId(null);
    }
  };

  const handlePointerEnd = () => {
    pointerStateRef.current = null;
  };

  const popover = isPopoverOpen ? (
    <div
      className={clsx(
        "fixed inset-0 z-50",
        responsiveMode === "mobile"
          ? "bg-[rgba(10,11,15,0.18)]"
          : "pointer-events-none",
      )}
      data-testid="notification-popover-overlay"
    >
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className={clsx(
          "pointer-events-auto overflow-hidden rounded-[24px] border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-2xl",
          "transition-all duration-200",
          responsiveMode === "mobile"
            ? "absolute left-1/2 top-20 w-[min(360px,calc(100vw-24px))] -translate-x-1/2"
            : "absolute right-6 top-20 w-[360px] max-w-[calc(100vw-24px)]",
        )}
        data-testid="notification-popover"
      >
        <div className="border-b border-[var(--border-primary)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                id={titleId}
                className="text-sm font-semibold tracking-[0.02em] text-[var(--text-primary)]"
              >
                お知らせ
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                未読 {unreadCount} 件
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                ref={firstActionRef}
                type="button"
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]",
                  "border border-[var(--border-primary)] bg-[var(--bg-secondary)] transition-colors duration-200",
                  "hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                )}
                onClick={() => void handleMarkAllAsRead()}
              >
                すべて既読
              </button>
              <button
                type="button"
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-primary)]",
                  "bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors duration-200",
                  "hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                )}
                aria-label="お知らせを閉じる"
                onClick={() => setPopoverOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-3 py-3">
          {notifications.length === 0 ? (
            <div className="h-[240px]">
              <EmptyState
                title="お知らせはありません"
                description="新しい更新やシステムイベントが届くと、ここに表示されます。"
                icon="sparkles"
                mood="celebrating"
                compact={true}
              />
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((notification) => {
                const expanded = expandedNotificationId === notification.id;
                const revealed = deleteRevealId === notification.id;

                return (
                  <li
                    key={notification.id}
                    className="relative overflow-hidden rounded-[20px]"
                  >
                    <button
                      type="button"
                      className={clsx(
                        "relative z-10 flex w-full items-start gap-3 rounded-[20px] border border-[var(--border-primary)]",
                        "bg-[var(--bg-secondary)] px-4 py-3 text-left transition-all duration-200",
                        "hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
                        revealed && "-translate-x-[80px]",
                      )}
                      data-testid={`notification-item-${notification.id}`}
                      onClick={() =>
                        void handleItemClick(
                          notification.id,
                          notification.isRead,
                        )
                      }
                      onPointerDown={(event) =>
                        handlePointerStart(notification.id, event.clientX)
                      }
                      onPointerMove={(event) =>
                        handlePointerMove(notification.id, event.clientX)
                      }
                      onPointerUp={handlePointerEnd}
                      onPointerCancel={handlePointerEnd}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "mt-1 h-2 w-2 shrink-0 rounded-full transition-opacity duration-200",
                          notification.isRead
                            ? "opacity-0"
                            : "bg-[var(--status-primary)] shadow-[0_0_0_4px_rgba(59,130,246,0.12)]",
                        )}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span
                              className={clsx(
                                "block truncate text-sm font-medium",
                                notification.isRead
                                  ? "text-[var(--text-secondary)] opacity-80"
                                  : "text-[var(--text-primary)]",
                              )}
                            >
                              {notification.title}
                            </span>
                            <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                              {formatRelativeTime(notification.timestamp)}
                            </span>
                          </span>

                          <span className="mt-0.5 shrink-0 text-[var(--text-secondary)]">
                            <ChevronDown
                              size={16}
                              className={clsx(
                                "transition-transform duration-200",
                                expanded && "rotate-180",
                              )}
                            />
                          </span>
                        </span>

                        {expanded && notification.detail ? (
                          <span className="mt-3 block rounded-2xl bg-[var(--bg-primary)] px-3 py-2 text-xs leading-6 text-[var(--text-secondary)]">
                            {notification.detail}
                          </span>
                        ) : null}
                      </span>
                    </button>

                    <button
                      type="button"
                      aria-label={`${notification.title}を削除`}
                      data-testid={`notification-delete-${notification.id}`}
                      tabIndex={revealed ? 0 : -1}
                      className={clsx(
                        "absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-r-[20px]",
                        "bg-[var(--status-error)] text-white transition-opacity duration-200",
                        revealed
                          ? "opacity-100"
                          : "pointer-events-none opacity-0",
                      )}
                      onClick={() =>
                        void handleDeleteNotification(notification.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" data-testid="notification-center">
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full",
          "border border-[var(--border-primary)] bg-[var(--bg-secondary)]",
          "text-[var(--text-primary)] transition-colors duration-200",
          "hover:bg-[var(--bg-tertiary)]",
          isBellAnimating && "animate-[bell-swing_400ms_ease-in-out]",
        )}
        aria-label="お知らせを開く"
        aria-haspopup="dialog"
        aria-expanded={isPopoverOpen}
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

      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </div>

      {typeof document !== "undefined" && popover
        ? createPortal(popover, document.body)
        : null}
    </div>
  );
};

NotificationCenter.displayName = "NotificationCenter";
