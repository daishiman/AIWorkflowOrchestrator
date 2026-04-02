/**
 * ElectronNotificationService - Electron macOS 通知実装
 *
 * TASK-NOTIFICATION-SERVICE-001
 * AC-2: new Notification({ title, body }).show() を呼ぶ
 *
 * macOS MVP 実装。Windows/Linux 対応は別タスク（feat-notification-cross-platform）。
 */

import { Notification } from "electron";
import type { INotificationService } from "./INotificationService";

export class ElectronNotificationService implements INotificationService {
  notify(title: string, body: string): void {
    if (!Notification.isSupported()) {
      console.warn(
        "[ElectronNotificationService] Notification is not supported on this platform",
      );
      return;
    }
    new Notification({ title, body }).show();
  }
}
