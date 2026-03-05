import type { StateCreator } from "zustand";
import type {
  Notification,
  NotificationSource,
  NotificationType,
} from "../types";

const MAX_NOTIFICATIONS = 100;

export interface NotificationSlice {
  notifications: Notification[];
  unreadCount: number;
  isPopoverOpen: boolean;
  expandedNotificationId: string | null;

  addNotification: (notification: Omit<Notification, "id" | "isRead">) => void;
  ingestNotification: (notification: Notification) => void;
  setNotificationHistory: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setPopoverOpen: (isOpen: boolean) => void;
  setExpandedNotificationId: (id: string | null) => void;
  clearAllNotifications: () => void;
}

function calculateUnreadCount(notifications: Notification[]): number {
  return notifications.filter((notification) => !notification.isRead).length;
}

function trimNotifications(notifications: Notification[]): Notification[] {
  if (notifications.length <= MAX_NOTIFICATIONS) {
    return notifications;
  }

  const unread = notifications.filter((notification) => !notification.isRead);
  const read = notifications.filter((notification) => notification.isRead);

  return [
    ...unread,
    ...read.slice(0, Math.max(MAX_NOTIFICATIONS - unread.length, 0)),
  ].slice(0, MAX_NOTIFICATIONS);
}

function toPersistedTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return new Date().toISOString();
  }

  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : timestamp;
}

function normalizeNotification(notification: Notification): Notification {
  return {
    ...notification,
    id: notification.id || crypto.randomUUID(),
    timestamp: toPersistedTimestamp(notification.timestamp),
    isRead: notification.isRead === true,
  };
}

function normalizeNotificationList(
  notifications: Notification[],
): Notification[] {
  return notifications
    .map(normalizeNotification)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

function syncNotificationState(
  notifications: Notification[],
): Pick<NotificationSlice, "notifications" | "unreadCount"> {
  const nextNotifications = trimNotifications(notifications);
  return {
    notifications: nextNotifications,
    unreadCount: calculateUnreadCount(nextNotifications),
  };
}

export function createNotification(
  input: Omit<Notification, "id" | "isRead"> & {
    source: NotificationSource;
    type: NotificationType;
  },
): Notification {
  return {
    id: crypto.randomUUID(),
    type: input.type,
    title: input.title,
    detail: input.detail,
    timestamp: toPersistedTimestamp(input.timestamp),
    isRead: false,
    source: input.source,
  };
}

export const createNotificationSlice: StateCreator<
  NotificationSlice,
  [],
  [],
  NotificationSlice
> = (set) => ({
  notifications: [],
  unreadCount: 0,
  isPopoverOpen: false,
  expandedNotificationId: null,

  addNotification: (notification) => {
    set((state) => {
      const added = createNotification(notification);
      return syncNotificationState([added, ...state.notifications]);
    });
  },

  ingestNotification: (notification) => {
    set((state) => {
      const normalized = normalizeNotification(notification);
      const deduped = state.notifications.filter(
        (item) => item.id !== normalized.id,
      );
      return syncNotificationState([normalized, ...deduped]);
    });
  },

  setNotificationHistory: (notifications) => {
    set(() => syncNotificationState(normalizeNotificationList(notifications)));
  },

  markAsRead: (id) => {
    set((state) => {
      const nextNotifications = state.notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      );

      return {
        notifications: nextNotifications,
        unreadCount: calculateUnreadCount(nextNotifications),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const nextNotifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      return {
        notifications: nextNotifications,
        unreadCount: 0,
      };
    });
  },

  deleteNotification: (id) => {
    set((state) => {
      const nextNotifications = state.notifications.filter(
        (notification) => notification.id !== id,
      );

      return {
        ...syncNotificationState(nextNotifications),
        expandedNotificationId:
          state.expandedNotificationId === id
            ? null
            : state.expandedNotificationId,
      };
    });
  },

  setPopoverOpen: (isOpen) => {
    set({ isPopoverOpen: isOpen });
  },

  setExpandedNotificationId: (id) => {
    set({ expandedNotificationId: id });
  },

  clearAllNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      expandedNotificationId: null,
    });
  },
});
