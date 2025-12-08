/**
 * カスタムプロトコルハンドラーのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  CUSTOM_PROTOCOL,
  AUTH_CALLBACK_PATH,
  isAuthCallbackUrl,
  registerAsDefaultProtocolClient,
  setupCustomProtocol,
  setupMacOSProtocolHandler,
  setupWindowsLinuxProtocolHandler,
  processLaunchUrl,
} from "./customProtocol";
import type { ProtocolSetupOptions } from "./customProtocol";

// Electron モジュールをモック
vi.mock("electron", () => ({
  app: {
    setAsDefaultProtocolClient: vi.fn(() => true),
    requestSingleInstanceLock: vi.fn(() => true),
    quit: vi.fn(),
    on: vi.fn(),
    whenReady: vi.fn(() => Promise.resolve()),
  },
  BrowserWindow: vi.fn(),
}));

// process.argv と process.defaultApp をモック
const originalArgv = process.argv;
const originalDefaultApp = (process as { defaultApp?: boolean }).defaultApp;
const _originalExecPath = process.execPath;

describe("customProtocol", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // process 値をリセット
    process.argv = originalArgv;
    (process as { defaultApp?: boolean }).defaultApp = originalDefaultApp;
  });

  afterEach(() => {
    process.argv = originalArgv;
    (process as { defaultApp?: boolean }).defaultApp = originalDefaultApp;
  });

  describe("定数", () => {
    it("CUSTOM_PROTOCOL が aiworkflow である", () => {
      expect(CUSTOM_PROTOCOL).toBe("aiworkflow");
    });

    it("AUTH_CALLBACK_PATH が /auth/callback である", () => {
      expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
    });
  });

  describe("isAuthCallbackUrl", () => {
    it("有効な認証コールバック URL を true と判定する", () => {
      expect(
        isAuthCallbackUrl("aiworkflow://auth/callback#access_token=xxx"),
      ).toBe(true);
      expect(
        isAuthCallbackUrl(
          "aiworkflow://auth/callback?code=xxx#access_token=xxx",
        ),
      ).toBe(true);
      expect(isAuthCallbackUrl("aiworkflow://auth/callback")).toBe(true);
    });

    it("無効な URL を false と判定する", () => {
      expect(isAuthCallbackUrl("aiworkflow://other/path")).toBe(false);
      expect(isAuthCallbackUrl("http://auth/callback")).toBe(false);
      expect(isAuthCallbackUrl("https://example.com/auth/callback")).toBe(
        false,
      );
      expect(isAuthCallbackUrl("")).toBe(false);
      expect(isAuthCallbackUrl("aiworkflow://")).toBe(false);
    });

    it("大文字小文字を区別する", () => {
      expect(isAuthCallbackUrl("AIWORKFLOW://auth/callback")).toBe(false);
      expect(isAuthCallbackUrl("aiworkflow://AUTH/CALLBACK")).toBe(false);
    });
  });

  describe("registerAsDefaultProtocolClient", () => {
    it("開発環境（defaultApp = true）で正しく登録する", async () => {
      const { app } = await import("electron");
      (process as { defaultApp?: boolean }).defaultApp = true;
      process.argv = ["/path/to/electron", "/path/to/script.js"];

      const result = registerAsDefaultProtocolClient();

      expect(app.setAsDefaultProtocolClient).toHaveBeenCalledWith(
        "aiworkflow",
        process.execPath,
        ["/path/to/script.js"],
      );
      expect(result).toBe(true);
    });

    it("本番環境（defaultApp = undefined）で正しく登録する", async () => {
      const { app } = await import("electron");
      (process as { defaultApp?: boolean }).defaultApp = undefined;

      const result = registerAsDefaultProtocolClient();

      expect(app.setAsDefaultProtocolClient).toHaveBeenCalledWith("aiworkflow");
      expect(result).toBe(true);
    });
  });

  describe("setupCustomProtocol", () => {
    it("シングルインスタンスロックを取得できた場合 true を返す", async () => {
      const { app } = await import("electron");
      vi.mocked(app.requestSingleInstanceLock).mockReturnValue(true);

      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
        onAuthCallback: vi.fn(),
      };

      const result = setupCustomProtocol(options);

      expect(result).toBe(true);
      expect(app.requestSingleInstanceLock).toHaveBeenCalled();
      expect(app.setAsDefaultProtocolClient).toHaveBeenCalled();
    });

    it("シングルインスタンスロックを取得できなかった場合 false を返す", async () => {
      const { app } = await import("electron");
      vi.mocked(app.requestSingleInstanceLock).mockReturnValue(false);

      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
      };

      const result = setupCustomProtocol(options);

      expect(result).toBe(false);
      expect(app.quit).toHaveBeenCalled();
    });

    it("macOS と Windows/Linux のイベントハンドラーを登録する", async () => {
      const { app } = await import("electron");
      vi.mocked(app.requestSingleInstanceLock).mockReturnValue(true);

      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
      };

      setupCustomProtocol(options);

      // open-url (macOS) と second-instance (Windows/Linux) の両方が登録される
      const onCalls = vi.mocked(app.on).mock.calls;
      const eventNames = onCalls.map((call) => call[0]);

      expect(eventNames).toContain("open-url");
      expect(eventNames).toContain("second-instance");
    });
  });

  describe("setupMacOSProtocolHandler", () => {
    it("open-url イベントハンドラーを登録する", async () => {
      const { app } = await import("electron");

      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
      };

      setupMacOSProtocolHandler(options);

      expect(app.on).toHaveBeenCalledWith("open-url", expect.any(Function));
    });
  });

  describe("setupWindowsLinuxProtocolHandler", () => {
    it("second-instance イベントハンドラーを登録する", async () => {
      const { app } = await import("electron");

      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
      };

      setupWindowsLinuxProtocolHandler(options);

      expect(app.on).toHaveBeenCalledWith(
        "second-instance",
        expect.any(Function),
      );
    });
  });

  describe("processLaunchUrl", () => {
    it("コマンドライン引数にプロトコル URL がある場合、whenReady 後に処理する", async () => {
      const { app } = await import("electron");
      process.argv = [
        "/path/to/app",
        "aiworkflow://auth/callback#access_token=xxx",
      ];

      const mockCallback = vi.fn();
      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
        onAuthCallback: mockCallback,
      };

      processLaunchUrl(options);

      expect(app.whenReady).toHaveBeenCalled();
    });

    it("コマンドライン引数にプロトコル URL がない場合、何もしない", async () => {
      const { app } = await import("electron");
      process.argv = ["/path/to/app"];

      const options: ProtocolSetupOptions = {
        getMainWindow: () => null,
      };

      processLaunchUrl(options);

      expect(app.whenReady).not.toHaveBeenCalled();
    });
  });

  describe("URL パース", () => {
    it("ハッシュフラグメントからトークンを正しく抽出できる", () => {
      const url =
        "aiworkflow://auth/callback#access_token=abc123&refresh_token=xyz789&expires_in=3600";
      const hashIndex = url.indexOf("#");
      const hashParams = new URLSearchParams(url.substring(hashIndex + 1));

      expect(hashParams.get("access_token")).toBe("abc123");
      expect(hashParams.get("refresh_token")).toBe("xyz789");
      expect(hashParams.get("expires_in")).toBe("3600");
    });

    it("クエリパラメータとハッシュフラグメントが混在する URL を処理できる", () => {
      const url =
        "aiworkflow://auth/callback?type=recovery#access_token=abc123&refresh_token=xyz789";
      const hashIndex = url.indexOf("#");
      const hashParams = new URLSearchParams(url.substring(hashIndex + 1));

      expect(hashParams.get("access_token")).toBe("abc123");
      expect(hashParams.get("refresh_token")).toBe("xyz789");
    });

    it("エラーコードを含む URL を処理できる", () => {
      const url =
        "aiworkflow://auth/callback#error=access_denied&error_description=User%20denied%20access";
      const hashIndex = url.indexOf("#");
      const hashParams = new URLSearchParams(url.substring(hashIndex + 1));

      expect(hashParams.get("error")).toBe("access_denied");
      expect(hashParams.get("error_description")).toBe("User denied access");
    });
  });
});
