import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ContextBridge, IpcRenderer } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

const mockInvoke = vi.fn();
const mockOn = vi.fn();
const mockRemoveListener = vi.fn();
const mockExposeInMainWorld = vi.fn();

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  } as Partial<IpcRenderer>,
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld,
  } as Partial<ContextBridge>,
}));

async function loadElectronAPI() {
  vi.resetModules();
  await import("../index");
  const call = mockExposeInMainWorld.mock.calls.find(
    ([name]) => name === "electronAPI",
  );
  return (
    call?.[1] ??
    (global.window as unknown as { electronAPI?: unknown })?.electronAPI
  );
}

describe("authMode preload contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ success: true });
  });

  it("auth-mode invoke チャネルが whitelist に残っている", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_MODE_GET);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_MODE_SET);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_MODE_STATUS);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_MODE_VALIDATE);
  });

  it("auth-mode changed イベントが whitelist に残っている", () => {
    expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.AUTH_MODE_CHANGED);
  });

  it("get が AUTH_MODE_GET をそのまま invoke する", async () => {
    const electronAPI = await loadElectronAPI();

    await electronAPI.authMode.get();

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.AUTH_MODE_GET);
  });

  it("validate が optional request を AUTH_MODE_VALIDATE へ渡す", async () => {
    const electronAPI = await loadElectronAPI();

    await electronAPI.authMode.validate({ mode: "api-key" });

    expect(mockInvoke).toHaveBeenCalledWith(IPC_CHANNELS.AUTH_MODE_VALIDATE, {
      mode: "api-key",
    });
  });

  it("validate 未指定時も AUTH_MODE_VALIDATE を呼ぶ", async () => {
    const electronAPI = await loadElectronAPI();

    await electronAPI.authMode.validate();

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.AUTH_MODE_VALIDATE,
      undefined,
    );
  });

  it("onModeChanged が shared event payload を受け取り cleanup できる", async () => {
    const electronAPI = await loadElectronAPI();
    const callback = vi.fn();

    const cleanup = electronAPI.authMode.onModeChanged(callback);
    const listener = mockOn.mock.calls[0]?.[1];
    const payload = {
      previousMode: "subscription",
      mode: "api-key",
      status: {
        mode: "api-key",
        isValid: false,
        hasCredentials: false,
        message: "APIキーが設定されていません",
        errorCode: "auth-mode/no-api-key",
        guidance: "設定画面でAPIキーを入力してください",
        lastCheckedAt: Date.now(),
      },
      changedAt: Date.now(),
    };

    listener?.({}, payload);
    cleanup();

    expect(callback).toHaveBeenCalledWith(payload);
    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.AUTH_MODE_CHANGED,
      listener,
    );
  });
});
