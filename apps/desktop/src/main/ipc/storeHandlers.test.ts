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
import {
  registerStoreHandlers,
  registerUserSettingsHandlers,
} from "./storeHandlers";

describe("storeHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
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

describe("registerUserSettingsHandlers", () => {
  let settingsHandlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    settingsHandlers = new Map();

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        settingsHandlers.set(channel, handler);
      },
    );

    registerUserSettingsHandlers();
  });

  // TC-01: ネストオブジェクトの部分更新でフィールドが保持される
  it("TC-01: ネストオブジェクトの部分更新で同一親キー配下のフィールドが保持される", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ theme: { color: "dark", size: "medium" } });

    await handler({}, { theme: { color: "light" } });

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      theme: { color: "light", size: "medium" },
    });
  });

  // TC-02: トップレベルフィールドの上書きが従来通り動作する
  it("TC-02: トップレベルフィールドの上書きが従来通り動作する", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ language: "ja", theme: { color: "dark" } });

    await handler({}, { language: "en" });

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      language: "en",
      theme: { color: "dark" },
    });
  });

  // TC-03: 配列フィールドは上書き動作になる（マージしない）
  it("TC-03: 配列フィールドは上書き動作になる（マージしない）", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ providers: ["a", "b"] });

    await handler({}, { providers: ["c"] });

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      providers: ["c"],
    });
  });

  // TC-04: null ペイロードは上書き扱い
  it("TC-04: null ペイロードは上書き扱いになる", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ theme: { color: "dark" } });

    await handler({}, { theme: null });

    expect(mockSet).toHaveBeenCalledWith("user-settings", { theme: null });
  });

  // TC-05: 存在しない子キーが追加される
  it("TC-05: 存在しない子キーが追加される", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ theme: { color: "dark" } });

    await handler({}, { theme: { size: "large" } });

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      theme: { color: "dark", size: "large" },
    });
  });

  // TC-06: 3 階層以上のネストオブジェクトのマージ
  it("TC-06: 3 階層以上のネストオブジェクトのマージ", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ a: { b: { c: "old", d: "keep" } } });

    await handler({}, { a: { b: { c: "new" } } });

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      a: { b: { c: "new", d: "keep" } },
    });
  });

  // TC-07: 空オブジェクトを patch した場合
  it("TC-07: 空オブジェクトを patch した場合は変化なし", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ theme: { color: "dark" } });

    await handler({}, {});

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      theme: { color: "dark" },
    });
  });

  // TC-08: patch が空オブジェクトの子を持つ場合
  it("TC-08: patch に空オブジェクトの子を持つ場合は変化なし", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ theme: { color: "dark" } });

    await handler({}, { theme: {} });

    expect(mockSet).toHaveBeenCalledWith("user-settings", {
      theme: { color: "dark" },
    });
  });

  // TC-09: undefined 値のキーは省略される
  it("TC-09: undefined 値のキーは省略され基底値が維持される", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    mockGet.mockReturnValue({ language: "ja" });

    await handler({}, { language: undefined });

    expect(mockSet).toHaveBeenCalledWith("user-settings", { language: "ja" });
  });

  it("TC-10: update 後に get で同じ値が返る", async () => {
    expect(settingsHandlers.has(IPC_CHANNELS.USER_SETTINGS_UPDATE)).toBe(true);
    expect(settingsHandlers.has(IPC_CHANNELS.USER_SETTINGS_GET)).toBe(true);

    const updateHandler = settingsHandlers.get(
      IPC_CHANNELS.USER_SETTINGS_UPDATE,
    )!;
    const getHandler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_GET)!;
    const mergedSettings = {
      theme: { color: "light", size: "medium" },
      language: "ja",
    };

    mockGet.mockReturnValue({
      theme: { color: "dark", size: "medium" },
      language: "ja",
    });

    await updateHandler({}, { theme: { color: "light" } });

    expect(mockSet).toHaveBeenCalledWith("user-settings", mergedSettings);

    mockGet.mockReturnValueOnce(mergedSettings);
    const getResult = await getHandler({});

    expect(getResult).toEqual({
      success: true,
      data: mergedSettings,
    });
  });

  it("TC-11: 非 plain object の payload は validation error を返す", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;

    const result = await handler({}, []);

    expect(result).toEqual({
      success: false,
      error: "Validation error: settings:update payload must be a plain object",
    });
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("TC-12: 危険キーを無視し prototype pollution を防ぐ", async () => {
    const handler = settingsHandlers.get(IPC_CHANNELS.USER_SETTINGS_UPDATE)!;
    const maliciousPayload = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"prototype":{"polluted":true}}',
    ) as Record<string, unknown>;

    mockGet.mockReturnValue({});

    await handler({}, maliciousPayload);

    expect(mockSet).toHaveBeenCalledWith("user-settings", {});

    const savedValue = mockSet.mock.calls.at(-1)?.[1];
    expect(savedValue).toEqual({});
    expect(Object.getPrototypeOf(savedValue as object)).toBe(Object.prototype);
  });
});
