import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  BrowserWindow as BrowserWindowType,
  IpcMainInvokeEvent,
} from "electron";
import type { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlerMap.set(channel, handler);
      },
    ),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

vi.mock(
  "../../infrastructure/security/ipc-validator",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("../../infrastructure/security/ipc-validator")
      >();
    return {
      ...original,
      validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
    };
  },
);

import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../creatorHandlers";
import { validateIpcSender } from "../../infrastructure/security/ipc-validator";

function createMockMainWindow(destroyed = false) {
  return {
    id: 1,
    isDestroyed: vi.fn(() => destroyed),
    webContents: {
      id: 1,
      send: vi.fn(),
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as BrowserWindowType;
}

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

function createMockService(
  status: "ready" | "initializing" | "failed" = "ready",
  failureReason: string | null = null,
) {
  return {
    llmAdapterStatus: status,
    llmAdapterFailureReason: failureReason,
    onAdapterStatusChanged: undefined as
      | ((status: string, reason: string | null) => void)
      | undefined,
  } as unknown as RuntimeSkillCreatorFacade;
}

describe("creatorHandlers - adapterStatus", () => {
  let mainWindow: ReturnType<typeof createMockMainWindow>;
  let service: ReturnType<typeof createMockService>;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
    service = createMockService("ready");
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
    handlerMap.clear();
  });

  // T-IPC-01
  it("registerRuntimeSkillCreatorHandlers 後に get-adapter-status ハンドラが登録される", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)).toBe(
      true,
    );
  });

  // T-IPC-02
  it("ready 状態のとき { success: true, data: { status: 'ready', failureReason: null } } が返る", async () => {
    service = createMockService("ready", null);
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toEqual({
      success: true,
      data: { status: "ready", failureReason: null },
    });
  });

  // T-IPC-03
  it("failed 状態のとき failureReason が payload に含まれる", async () => {
    service = createMockService("failed", "API key is invalid");
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toEqual({
      success: true,
      data: { status: "failed", failureReason: "API key is invalid" },
    });
  });

  // T-IPC-04
  it("runtimeSkillCreatorService が null のとき validationError が返る", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, null);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toMatchObject({ success: false });
  });

  // T-IPC-05
  it("validateIpcSender が正しい引数で呼ばれる", async () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const event = createMockEvent();
    await handler(event);

    expect(validateIpcSender).toHaveBeenCalledWith(
      event,
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
      expect.objectContaining({ getAllowedWindows: expect.any(Function) }),
    );
  });

  // T-IPC-06
  it("unregisterRuntimeSkillCreatorHandlers 後に get-adapter-status ハンドラが削除される", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)).toBe(
      true,
    );

    unregisterRuntimeSkillCreatorHandlers();
    expect(handlerMap.has(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)).toBe(
      false,
    );
  });

  // T-IPC-07
  it("onAdapterStatusChanged が設定され、呼び出し時に webContents.send が実行される", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    expect(typeof service.onAdapterStatusChanged).toBe("function");

    service.onAdapterStatusChanged!("failed", "API key is invalid");

    expect(mainWindow.webContents.send).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
      { status: "failed", failureReason: "API key is invalid" },
    );
  });

  // T-IPC-08
  it("mainWindow.isDestroyed() が true のとき webContents.send が呼ばれない", () => {
    mainWindow = createMockMainWindow(true); // destroyed = true
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    service.onAdapterStatusChanged!("failed", "API key is invalid");

    expect(mainWindow.webContents.send).not.toHaveBeenCalled();
  });

  // T-IPC-09
  it("initializing 状態のとき { status: 'initializing', failureReason: null } が返る", async () => {
    service = createMockService("initializing", null);
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    const result = await handler(createMockEvent());

    expect(result).toEqual({
      success: true,
      data: { status: "initializing", failureReason: null },
    });
  });

  // T-IPC-10
  it("onAdapterStatusChanged が同一状態への遷移でも webContents.send を呼ぶ（冪等性）", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    service.onAdapterStatusChanged!("ready", null);
    service.onAdapterStatusChanged!("ready", null);

    expect(mainWindow.webContents.send).toHaveBeenCalledTimes(2);
  });

  // T-IPC-11
  it("onAdapterStatusChanged が連続して呼ばれたとき各々 webContents.send が呼ばれる", () => {
    registerRuntimeSkillCreatorHandlers(mainWindow, service);
    service.onAdapterStatusChanged!("ready", null);
    service.onAdapterStatusChanged!("failed", "API key error");
    service.onAdapterStatusChanged!("ready", null);

    expect(mainWindow.webContents.send).toHaveBeenCalledTimes(3);
    expect(mainWindow.webContents.send).toHaveBeenNthCalledWith(
      2,
      IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
      { status: "failed", failureReason: "API key error" },
    );
  });

  // T-IPC-12
  it("validateIpcSender が例外をスローしたとき例外が伝播する", () => {
    vi.mocked(validateIpcSender).mockImplementationOnce(() => {
      throw new Error("unauthorized sender");
    });
    registerRuntimeSkillCreatorHandlers(mainWindow, service);

    const handler = handlerMap.get(
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
    )!;
    expect(() => handler(createMockEvent())).toThrow("unauthorized sender");
  });
});
