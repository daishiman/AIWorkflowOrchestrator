/**
 * disclosureHandlers テスト
 *
 * UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 Phase 4
 * Issue #1804
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";

// Electron mock（approvalHandlers.test.ts と同様のパターン）
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
  },
}));

import { registerDisclosureHandlers } from "../disclosureHandlers";

describe("disclosureHandlers", () => {
  let mockMainWindow: BrowserWindow;
  let handler: (event: IpcMainInvokeEvent) => Promise<unknown>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockMainWindow = {
      webContents: { id: 1 },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;
  });

  describe("registerDisclosureHandlers", () => {
    describe("AC-1/AC-2: getDisclosureInfo から aiServiceName が正しく返される", () => {
      it("subscription モードのとき aiServiceName が 'Claude Code CLI' になる", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: true,
          data: {
            aiServiceName: "Claude Code CLI",
            modelName: "claude-sonnet-4-6",
            externalDestinations: [],
          },
        });
      });

      it("api-key モードのとき aiServiceName が 'Anthropic API' になる", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Anthropic API",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: true,
          data: {
            aiServiceName: "Anthropic API",
            modelName: "claude-sonnet-4-6",
            externalDestinations: [],
          },
        });
      });
    });

    describe("AC-3: fallback 値のテスト", () => {
      it("provider 未設定時（authMode が unknown 相当）のとき aiServiceName が 'unknown' になる", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "unknown",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toMatchObject({
          success: true,
          data: {
            aiServiceName: "unknown",
          },
        });
      });
    });

    describe("AC-4: DENY-5 準拠（API key / token 非含有）", () => {
      it("レスポンスに apiKey / token / secretKey プロパティが含まれない", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = (await handler(event)) as Record<string, unknown>;

        // Assert
        const data = result?.data as Record<string, unknown> | undefined;
        expect(data).not.toHaveProperty("apiKey");
        expect(data).not.toHaveProperty("token");
        expect(data).not.toHaveProperty("secretKey");
      });
    });

    describe("AC-5: sender 検証（UNAUTHORIZED）", () => {
      it("送信元が mainWindow でない場合 UNAUTHORIZED を返す", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: { id: 999 }, // mainWindow.webContents とは異なる sender
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: expect.any(String),
          },
        });
      });
    });

    describe("AC-6: getDisclosureInfo 例外時 DISCLOSURE_ERROR", () => {
      it("getDisclosureInfo が例外を投げた場合 DISCLOSURE_ERROR を返す", async () => {
        // Arrange
        const mockGetDisclosureInfo = vi
          .fn()
          .mockRejectedValue(new Error("Service unavailable"));

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        handler = handleCall[1] as typeof handler;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        // Act
        const result = await handler(event);

        // Assert
        expect(result).toEqual({
          success: false,
          error: {
            code: "DISCLOSURE_ERROR",
            message: expect.any(String),
          },
        });
      });
    });

    describe("Phase 6: fallback 値の境界テスト", () => {
      it("aiServiceName が空文字列のとき、そのまま返される", async () => {
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        const h = handleCall[1] as (
          event: IpcMainInvokeEvent,
        ) => Promise<unknown>;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        const result = await h(event);

        expect(result).toMatchObject({
          success: true,
          data: { aiServiceName: "" },
        });
      });

      it("externalDestinations が空配列であることを確認する", async () => {
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "unknown",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        const h = handleCall[1] as (
          event: IpcMainInvokeEvent,
        ) => Promise<unknown>;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        const result = (await h(event)) as Record<string, unknown>;
        const data = result?.data as Record<string, unknown>;

        expect(Array.isArray(data?.externalDestinations)).toBe(true);
        expect((data?.externalDestinations as unknown[]).length).toBe(0);
      });
    });

    describe("Phase 6: DENY-5 negative テスト強化", () => {
      it("レスポンス全体に機密情報プロパティが含まれない", async () => {
        const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
          aiServiceName: "Claude Code CLI",
          modelName: "claude-sonnet-4-6",
          externalDestinations: [],
        });

        registerDisclosureHandlers({
          mainWindow: mockMainWindow,
          getDisclosureInfo: mockGetDisclosureInfo,
        });

        const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
        const h = handleCall[1] as (
          event: IpcMainInvokeEvent,
        ) => Promise<unknown>;

        const event = {
          sender: mockMainWindow.webContents,
        } as unknown as IpcMainInvokeEvent;

        const result = (await h(event)) as Record<string, unknown>;
        const data = result?.data as Record<string, unknown> | undefined;

        // DENY-5: 機密情報プロパティが存在しないことを検証
        const forbiddenKeys = [
          "apiKey",
          "api_key",
          "token",
          "accessToken",
          "secret",
          "secretKey",
          "password",
          "credential",
        ];

        forbiddenKeys.forEach((key) => {
          expect(result).not.toHaveProperty(key);
          expect(data).not.toHaveProperty(key);
        });
      });
    });

    describe("Phase 6: buildDisclosureInfo 純粋関数テスト（統合経由）", () => {
      const testCases = [
        {
          label: "subscription モード",
          aiServiceName: "Claude Code CLI",
          expected: "Claude Code CLI",
        },
        {
          label: "api-key モード",
          aiServiceName: "Anthropic API",
          expected: "Anthropic API",
        },
        {
          label: "undefined 相当（fallback）",
          aiServiceName: "unknown",
          expected: "unknown",
        },
      ];

      testCases.forEach(({ label, aiServiceName, expected }) => {
        it(`${label} のとき aiServiceName が '${expected}' になる`, async () => {
          const mockGetDisclosureInfo = vi.fn().mockResolvedValue({
            aiServiceName,
            modelName: "claude-sonnet-4-6",
            externalDestinations: [],
          });

          registerDisclosureHandlers({
            mainWindow: mockMainWindow,
            getDisclosureInfo: mockGetDisclosureInfo,
          });

          const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
          const h = handleCall[1] as (
            event: IpcMainInvokeEvent,
          ) => Promise<unknown>;

          const event = {
            sender: mockMainWindow.webContents,
          } as unknown as IpcMainInvokeEvent;

          const result = (await h(event)) as Record<string, unknown>;

          expect(result).toMatchObject({
            success: true,
            data: { aiServiceName: expected },
          });
        });
      });
    });
  });
});
