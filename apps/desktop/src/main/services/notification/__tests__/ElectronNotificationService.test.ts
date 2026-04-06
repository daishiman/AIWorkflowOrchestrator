/**
 * ElectronNotificationService ユニットテスト
 *
 * TASK-NOTIFICATION-SERVICE-001
 * Phase 4: テスト作成（TDD Red → Phase 5 で Green）
 *
 * TC-E-01: notify() が Notification コンストラクタを正しい引数で呼ぶ
 * TC-E-02: notify() が show() を呼ぶ
 * TC-E-03: Notification.isSupported() が false のとき show() を呼ばない
 * TC-E-04: notify() を連続で複数回呼んでも show() がそれぞれ呼ばれる（Phase 6）
 * TC-E-05: title または body に空文字を渡しても Notification コンストラクタに渡る（Phase 6）
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("ElectronNotificationService", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TC-E-01: notify() calls Notification constructor with correct title and body", async () => {
    const show = vi.fn();
    const MockNotification = vi.fn().mockImplementation(() => ({ show }));
    MockNotification.isSupported = vi.fn().mockReturnValue(true);

    vi.doMock("electron", () => ({
      Notification: MockNotification,
    }));

    const { ElectronNotificationService } =
      await import("../ElectronNotificationService");

    const service = new ElectronNotificationService();
    service.notify("スキル作成完了", "my-skill");

    expect(MockNotification).toHaveBeenCalledWith({
      title: "スキル作成完了",
      body: "my-skill",
    });
  });

  it("TC-E-02: notify() calls show() on the Notification instance", async () => {
    const show = vi.fn();
    const MockNotification = vi.fn().mockImplementation(() => ({ show }));
    MockNotification.isSupported = vi.fn().mockReturnValue(true);

    vi.doMock("electron", () => ({
      Notification: MockNotification,
    }));

    const { ElectronNotificationService } =
      await import("../ElectronNotificationService");

    const service = new ElectronNotificationService();
    service.notify("title", "body");

    expect(show).toHaveBeenCalledTimes(1);
  });

  it("TC-E-03: notify() does not call show() when Notification.isSupported() returns false", async () => {
    const show = vi.fn();
    const MockNotification = vi.fn().mockImplementation(() => ({ show }));
    MockNotification.isSupported = vi.fn().mockReturnValue(false);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.doMock("electron", () => ({
      Notification: MockNotification,
    }));

    const { ElectronNotificationService } =
      await import("../ElectronNotificationService");

    const service = new ElectronNotificationService();
    service.notify("title", "body");

    expect(show).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it("TC-E-04: notify() can be called multiple times independently", async () => {
    const show = vi.fn();
    const MockNotification = vi.fn().mockImplementation(() => ({ show }));
    MockNotification.isSupported = vi.fn().mockReturnValue(true);

    vi.doMock("electron", () => ({
      Notification: MockNotification,
    }));

    const { ElectronNotificationService } =
      await import("../ElectronNotificationService");

    const service = new ElectronNotificationService();
    service.notify("title1", "body1");
    service.notify("title2", "body2");
    service.notify("title3", "body3");

    expect(show).toHaveBeenCalledTimes(3);
  });

  it("TC-E-05: notify() passes empty strings to Notification constructor", async () => {
    const show = vi.fn();
    const MockNotification = vi.fn().mockImplementation(() => ({ show }));
    MockNotification.isSupported = vi.fn().mockReturnValue(true);

    vi.doMock("electron", () => ({
      Notification: MockNotification,
    }));

    const { ElectronNotificationService } =
      await import("../ElectronNotificationService");

    const service = new ElectronNotificationService();
    service.notify("", "");

    expect(MockNotification).toHaveBeenCalledWith({ title: "", body: "" });
  });
});
