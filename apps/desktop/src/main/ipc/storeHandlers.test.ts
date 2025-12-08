import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mutable mock functions that can be accessed after resetModules
const mockGet = vi.fn();
const mockSet = vi.fn();

// Mock electron-store BEFORE any imports
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
  })),
}));

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  app: {
    getPath: vi.fn((name: string) => {
      const paths: Record<string, string> = {
        documents: "/Users/test/Documents",
        userData: "/Users/test/Library/Application Support",
        home: "/Users/test",
      };
      return paths[name] || "";
    }),
  },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((str: string) => Buffer.from(`encrypted:${str}`)),
    decryptString: vi.fn((buf: Buffer) =>
      buf.toString().replace("encrypted:", ""),
    ),
  },
}));

// Import after mocks are set up
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { registerStoreHandlers } from "./storeHandlers";

describe("storeHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerStoreHandlers();
  });

  describe("registerStoreHandlers", () => {
    it("STORE_GETハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.STORE_GET)).toBe(true);
    });

    it("STORE_SETハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.STORE_SET)).toBe(true);
    });

    it("STORE_GET_SECUREハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.STORE_GET_SECURE)).toBe(true);
    });

    it("STORE_SET_SECUREハンドラーを登録する", () => {
      expect(handlers.has(IPC_CHANNELS.STORE_SET_SECURE)).toBe(true);
    });
  });

  describe("STORE_GET handler", () => {
    it("ストアから値を取得する", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_GET)!;
      mockGet.mockReturnValue("stored-value");

      const result = (await handler({}, { key: "testKey" })) as {
        success: boolean;
        data: string;
      };

      expect(result).toEqual({
        success: true,
        data: "stored-value",
      });
      expect(mockGet).toHaveBeenCalledWith("testKey", undefined);
    });

    it("デフォルト値を使用する", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_GET)!;
      mockGet.mockReturnValue("default-value");

      await handler(
        {},
        {
          key: "testKey",
          defaultValue: "default-value",
        },
      );

      expect(mockGet).toHaveBeenCalledWith("testKey", "default-value");
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_GET)!;
      mockGet.mockImplementation(() => {
        throw new Error("Store error");
      });

      const result = await handler({}, { key: "testKey" });

      expect(result).toEqual({
        success: false,
        error: "Store error",
      });
    });
  });

  describe("STORE_SET handler", () => {
    it("ストアに値を設定する", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_SET)!;

      const result = await handler(
        {},
        {
          key: "testKey",
          value: "testValue",
        },
      );

      expect(result).toEqual({ success: true });
      expect(mockSet).toHaveBeenCalledWith("testKey", "testValue");
    });

    it("オブジェクト値を設定できる", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_SET)!;
      const objectValue = { nested: { value: 123 } };

      await handler(
        {},
        {
          key: "testKey",
          value: objectValue,
        },
      );

      expect(mockSet).toHaveBeenCalledWith("testKey", objectValue);
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_SET)!;
      mockSet.mockImplementation(() => {
        throw new Error("Store error");
      });

      const result = await handler(
        {},
        {
          key: "testKey",
          value: "testValue",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Store error",
      });
    });
  });

  describe("STORE_GET_SECURE handler", () => {
    it("値がない場合は空文字を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_GET_SECURE)!;
      mockGet.mockReturnValue(undefined);

      const result = await handler({}, { key: "apiKey" });

      expect(result).toEqual({
        success: true,
        data: "",
      });
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_GET_SECURE)!;
      mockGet.mockImplementation(() => {
        throw new Error("Secure store error");
      });

      const result = await handler({}, { key: "apiKey" });

      expect(result).toEqual({
        success: false,
        error: "Secure store error",
      });
    });
  });

  describe("STORE_SET_SECURE handler", () => {
    it("値を保存する", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_SET_SECURE)!;
      mockSet.mockImplementation(() => undefined);

      const result = await handler(
        {},
        {
          key: "apiKey",
          value: "secret-key",
        },
      );

      expect(result).toEqual({ success: true });
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.STORE_SET_SECURE)!;
      mockSet.mockImplementation(() => {
        throw new Error("Secure store error");
      });

      const result = await handler(
        {},
        {
          key: "apiKey",
          value: "secret-key",
        },
      );

      expect(result).toEqual({
        success: false,
        error: "Secure store error",
      });
    });
  });
});
