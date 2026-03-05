import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createNotificationSlice,
  type NotificationSlice,
  type Notification,
} from "./notificationSlice";

function buildNotification(
  overrides: Partial<Omit<Notification, "id" | "isRead">> = {},
): Omit<Notification, "id" | "isRead"> {
  return {
    type: "info",
    title: "test",
    timestamp: new Date().toISOString(),
    source: { kind: "system", eventType: "test" },
    ...overrides,
  };
}

describe("notificationSlice", () => {
  let store: NotificationSlice;
  let mockSet: (
    fn:
      | Partial<NotificationSlice>
      | ((state: NotificationSlice) => Partial<NotificationSlice>),
  ) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    const state: Partial<NotificationSlice> = {};
    mockSet = (fn) => {
      const partial = typeof fn === "function" ? fn(store) : fn;
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createNotificationSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  it("初期状態を持つ", () => {
    expect(store.notifications).toEqual([]);
    expect(store.unreadCount).toBe(0);
    expect(store.isPopoverOpen).toBe(false);
    expect(store.expandedNotificationId).toBeNull();
  });

  it("通知追加時に未読数が増える", () => {
    store.addNotification(buildNotification());

    expect(store.notifications).toHaveLength(1);
    expect(store.unreadCount).toBe(1);
    expect(store.notifications[0].isRead).toBe(false);
    expect(store.notifications[0].id).toBeTypeOf("string");
  });

  it("markAsReadで未読数が減る", () => {
    store.addNotification(buildNotification({ title: "n1" }));
    const id = store.notifications[0].id;

    store.markAsRead(id);

    expect(store.notifications[0].isRead).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it("markAllAsReadで全件既読になる", () => {
    store.addNotification(buildNotification({ title: "n1" }));
    store.addNotification(buildNotification({ title: "n2" }));

    store.markAllAsRead();

    expect(store.notifications.every((n) => n.isRead)).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it("deleteNotificationで対象通知を削除する", () => {
    store.addNotification(buildNotification({ title: "n1" }));
    store.addNotification(buildNotification({ title: "n2" }));
    const targetId = store.notifications[0].id;

    store.deleteNotification(targetId);

    expect(store.notifications).toHaveLength(1);
    expect(store.notifications[0].id).not.toBe(targetId);
  });

  it("100件超過で既読の古い通知から削除する", () => {
    for (let i = 0; i < 100; i++) {
      store.addNotification(buildNotification({ title: `n${i}` }));
    }

    const oldestId = store.notifications[store.notifications.length - 1].id;
    store.markAsRead(oldestId);

    store.addNotification(buildNotification({ title: "overflow" }));

    expect(store.notifications).toHaveLength(100);
    expect(store.notifications.some((n) => n.id === oldestId)).toBe(false);
  });

  it("setPopoverOpenとsetExpandedNotificationIdが動作する", () => {
    store.setPopoverOpen(true);
    expect(store.isPopoverOpen).toBe(true);

    store.addNotification(buildNotification({ title: "n1" }));
    const id = store.notifications[0].id;
    store.setExpandedNotificationId(id);

    expect(store.expandedNotificationId).toBe(id);
  });

  it("clearAllNotificationsで全削除される", () => {
    store.addNotification(buildNotification({ title: "n1" }));
    store.addNotification(buildNotification({ title: "n2" }));

    store.clearAllNotifications();

    expect(store.notifications).toEqual([]);
    expect(store.unreadCount).toBe(0);
    expect(store.expandedNotificationId).toBeNull();
  });
});
