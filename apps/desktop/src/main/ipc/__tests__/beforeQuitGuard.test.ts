/**
 * beforeQuitGuard ユニットテスト
 *
 * TASK-NOTIFICATION-SERVICE-001
 * Phase 4: テスト作成（TDD Red → Phase 5 で Green）
 *
 * TC-B-01: 実行中に before-quit が発火したとき event.preventDefault() が呼ばれる
 * TC-B-02: 実行中でないとき event.preventDefault() が呼ばれない
 * TC-B-03: registerBeforeQuitGuard の戻り値でリスナーが外れる（Phase 6）
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { registerBeforeQuitGuard } from "../beforeQuitGuard";

type MockApp = {
  on: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  exit: ReturnType<typeof vi.fn>;
  emit: (event: string, ...args: unknown[]) => void;
};

function createMockApp(): MockApp {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  return {
    on: vi
      .fn()
      .mockImplementation(
        (event: string, handler: (...args: unknown[]) => void) => {
          listeners[event] = listeners[event] ?? [];
          listeners[event].push(handler);
        },
      ),
    removeListener: vi.fn(),
    exit: vi.fn(),
    emit: (event: string, ...args: unknown[]) => {
      (listeners[event] ?? []).forEach((handler) => handler(...args));
    },
  };
}

function createMockDialog() {
  return {
    showMessageBox: vi.fn().mockResolvedValue({ response: 1 }), // キャンセル（デフォルト）
  };
}

describe("registerBeforeQuitGuard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("TC-B-01: before-quit guard calls event.preventDefault() when execution is running", () => {
    const mockApp = createMockApp();
    const mockDialog = createMockDialog();
    const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(true) };

    registerBeforeQuitGuard({
      app: mockApp as never,
      dialog: mockDialog as never,
      facade: mockFacade as never,
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockApp.emit("before-quit", mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("TC-B-02: before-quit guard does not call event.preventDefault() when no execution is running", () => {
    const mockApp = createMockApp();
    const mockDialog = createMockDialog();
    const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(false) };

    registerBeforeQuitGuard({
      app: mockApp as never,
      dialog: mockDialog as never,
      facade: mockFacade as never,
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockApp.emit("before-quit", mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it("TC-B-03: registerBeforeQuitGuard returns cleanup that removes the listener", () => {
    const mockApp = createMockApp();
    const mockDialog = createMockDialog();
    const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(false) };

    const cleanup = registerBeforeQuitGuard({
      app: mockApp as never,
      dialog: mockDialog as never,
      facade: mockFacade as never,
    });

    cleanup();

    expect(mockApp.removeListener).toHaveBeenCalledWith(
      "before-quit",
      expect.any(Function),
    );
  });

  it("TC-B-04: before-quit guard calls app.exit(0) when user selects exit", async () => {
    const mockApp = createMockApp();
    const mockDialog = {
      showMessageBox: vi.fn().mockResolvedValue({ response: 0 }),
    };
    const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(true) };

    registerBeforeQuitGuard({
      app: mockApp as never,
      dialog: mockDialog as never,
      facade: mockFacade as never,
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockApp.emit("before-quit", mockEvent);

    await Promise.resolve();

    expect(mockApp.exit).toHaveBeenCalledWith(0);
  });

  it("TC-B-05: before-quit guard logs warning when dialog rejects", async () => {
    const mockApp = createMockApp();
    const mockDialog = {
      showMessageBox: vi.fn().mockRejectedValue(new Error("dialog error")),
    };
    const mockFacade = { hasRunningExecution: vi.fn().mockReturnValue(true) };
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    registerBeforeQuitGuard({
      app: mockApp as never,
      dialog: mockDialog as never,
      facade: mockFacade as never,
    });

    const mockEvent = { preventDefault: vi.fn() };
    mockApp.emit("before-quit", mockEvent);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("beforeQuitGuard"),
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});
