import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

// MSWサーバー設定
beforeAll(() =>
  server.listen({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);

      // ローカルHTTPサーバー実装を検証するテストでは、MSWを経由せず実サーバーへ到達させる
      if (
        url.hostname === "127.0.0.1" &&
        (url.pathname === "/auth/callback" || url.pathname === "/")
      ) {
        return;
      }

      print.warning();
    },
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// グローバルモック
// scrollIntoView モック（happy-dom/jsdomには実装されていない場合がある）
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = vi.fn();
}

// Clipboard API モック（happy-dom/jsdom両対応）
if (typeof navigator !== "undefined") {
  // happy-domでは既存のclipboardを上書き、jsdomではundefinedなので新規作成
  const clipboardMock = {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  };

  try {
    Object.defineProperty(navigator, "clipboard", {
      value: clipboardMock,
      writable: true,
      configurable: true,
    });
  } catch {
    // happy-domで既にclipboardが定義されている場合は直接上書き
    if (navigator.clipboard) {
      (navigator.clipboard as unknown as typeof clipboardMock).writeText =
        clipboardMock.writeText;
      (navigator.clipboard as unknown as typeof clipboardMock).readText =
        clipboardMock.readText;
    }
  }
}

// window.electronAPI.skill モック（useSkillExecutionフック用）
// beforeAllで設定することで、jsdom環境のセットアップ後に確実に実行
beforeAll(() => {
  if (typeof window !== "undefined") {
    const existingElectronAPI =
      (window as unknown as { electronAPI?: object }).electronAPI || {};
    (window as unknown as { electronAPI: object }).electronAPI = {
      ...existingElectronAPI,
      skill: {
        onStream: vi.fn().mockReturnValue(() => {}),
        onPermissionRequest: vi.fn().mockReturnValue(() => {}),
        sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
        execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
        abort: vi.fn().mockResolvedValue(undefined),
        list: vi.fn().mockResolvedValue([]),
        getImported: vi.fn().mockResolvedValue([]),
        import: vi.fn().mockResolvedValue({}),
        remove: vi.fn().mockResolvedValue(undefined),
        rescan: vi.fn().mockResolvedValue([]),
        onComplete: vi.fn().mockReturnValue(() => {}),
        onError: vi.fn().mockReturnValue(() => {}),
        getExecutionStatus: vi.fn().mockResolvedValue(null),
      },
    };
  }
});

// Electronのモジュールをモック
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));
