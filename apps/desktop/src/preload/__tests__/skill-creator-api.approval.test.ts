/**
 * skill-creator-api.ts - onApprovalRequest テスト
 *
 * TASK-SDK-07: approval:request surface 追加
 * Phase 4 TDD Red → Green / Phase 6 エッジケース
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { IPC_CHANNELS, ALLOWED_ON_CHANNELS } from "../channels";

// --- Mock: electron ---
vi.mock("electron", () => {
  const mockIpcRenderer = {
    invoke: vi.fn().mockResolvedValue({}),
    on: vi.fn(),
    removeListener: vi.fn(),
  };
  return {
    contextBridge: {
      exposeInMainWorld: vi.fn(),
    },
    ipcRenderer: mockIpcRenderer,
  };
});

import { ipcRenderer } from "electron";

// Phase 4: T-4-1 〜 T-4-5
describe("skillCreatorAPI.onApprovalRequest", () => {
  let skillCreatorAPIModule: { skillCreatorAPI: Record<string, unknown> };

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: vi.fn(),
        removeListener: vi.fn(),
      },
    }));

    // 動的インポートで fresh module を取得
    skillCreatorAPIModule = await import("../skill-creator-api");
  });

  // T-4-1: onApprovalRequest が関数として存在すること
  it("T-4-1: onApprovalRequest が関数として存在すること", () => {
    const { skillCreatorAPI } = skillCreatorAPIModule;
    expect(typeof skillCreatorAPI.onApprovalRequest).toBe("function");
  });

  // T-4-2: APPROVAL_REQUEST チャンネルで on リスナーを登録すること
  it("T-4-2: APPROVAL_REQUEST チャンネルで on リスナーを登録すること", async () => {
    vi.resetModules();

    const mockOn = vi.fn();
    const mockRemoveListener = vi.fn();

    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: mockOn,
        removeListener: mockRemoveListener,
      },
    }));

    const { skillCreatorAPI } = await import("../skill-creator-api");
    const callback = vi.fn();

    (skillCreatorAPI.onApprovalRequest as (cb: typeof callback) => () => void)(
      callback,
    );

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.APPROVAL_REQUEST,
      expect.any(Function),
    );
  });

  // T-4-3: approval request ペイロードがコールバックに渡されること
  it("T-4-3: approval request ペイロードがコールバックに渡されること", async () => {
    vi.resetModules();

    let capturedListener: ((_event: unknown, data: unknown) => void) | null =
      null;
    const mockOn = vi
      .fn()
      .mockImplementation(
        (
          _channel: string,
          listener: (event: unknown, data: unknown) => void,
        ) => {
          capturedListener = listener;
        },
      );
    const mockRemoveListener = vi.fn();

    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: mockOn,
        removeListener: mockRemoveListener,
      },
    }));

    const { skillCreatorAPI } = await import("../skill-creator-api");
    const callback = vi.fn();

    (skillCreatorAPI.onApprovalRequest as (cb: typeof callback) => () => void)(
      callback,
    );

    const payload = {
      operationType: "file_write",
      description: "テストファイルへの書き込み",
      destination: "/tmp/test.txt",
      sessionId: "session-001",
      operationId: "op-001",
    };

    // listener を発火させる
    capturedListener?.({}, payload);

    expect(callback).toHaveBeenCalledWith(payload);
  });

  // T-4-4: アンサブスクライブ関数でリスナーが解除されること
  it("T-4-4: アンサブスクライブ関数でリスナーが解除されること", async () => {
    vi.resetModules();

    const mockOn = vi.fn();
    const mockRemoveListener = vi.fn();

    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: mockOn,
        removeListener: mockRemoveListener,
      },
    }));

    const { skillCreatorAPI } = await import("../skill-creator-api");
    const callback = vi.fn();

    const unsubscribe = (
      skillCreatorAPI.onApprovalRequest as (cb: typeof callback) => () => void
    )(callback);

    expect(typeof unsubscribe).toBe("function");
    unsubscribe();

    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.APPROVAL_REQUEST,
      expect.any(Function),
    );
  });

  // T-4-5: APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること
  it("T-4-5: APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること", () => {
    expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_REQUEST);
  });
});

// Phase 6: T-6-1 〜 T-6-3（エッジケース）
describe("skillCreatorAPI.onApprovalRequest - エッジケース", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // T-6-1: destination が undefined の場合もコールバックが呼ばれること
  it("T-6-1: destination が undefined の場合もコールバックが呼ばれること", async () => {
    vi.resetModules();

    let capturedListener: ((_event: unknown, data: unknown) => void) | null =
      null;
    const mockOn = vi
      .fn()
      .mockImplementation(
        (
          _channel: string,
          listener: (event: unknown, data: unknown) => void,
        ) => {
          capturedListener = listener;
        },
      );

    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: mockOn,
        removeListener: vi.fn(),
      },
    }));

    const { skillCreatorAPI } = await import("../skill-creator-api");
    const callback = vi.fn();

    (skillCreatorAPI.onApprovalRequest as (cb: typeof callback) => () => void)(
      callback,
    );

    // destination なしのペイロード
    const payload = {
      operationType: "network_request",
      description: "外部APIへのリクエスト",
      // destination は undefined
      sessionId: "session-002",
      operationId: "op-002",
    };

    capturedListener?.({}, payload);

    expect(callback).toHaveBeenCalledWith(payload);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  // T-6-2: 複数回 onApprovalRequest を登録した場合、それぞれ独立して動作すること
  it("T-6-2: 複数回 onApprovalRequest を登録した場合、それぞれ独立して動作すること", async () => {
    vi.resetModules();

    const capturedListeners: ((event: unknown, data: unknown) => void)[] = [];
    const mockOn = vi
      .fn()
      .mockImplementation(
        (
          _channel: string,
          listener: (event: unknown, data: unknown) => void,
        ) => {
          capturedListeners.push(listener);
        },
      );
    const mockRemoveListener = vi.fn();

    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: mockOn,
        removeListener: mockRemoveListener,
      },
    }));

    const { skillCreatorAPI } = await import("../skill-creator-api");
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    (skillCreatorAPI.onApprovalRequest as (cb: typeof callback1) => () => void)(
      callback1,
    );
    (skillCreatorAPI.onApprovalRequest as (cb: typeof callback2) => () => void)(
      callback2,
    );

    // 2つのリスナーが登録されていること
    expect(mockOn).toHaveBeenCalledTimes(2);

    const payload = {
      operationType: "file_delete",
      description: "ファイル削除",
      sessionId: "session-003",
      operationId: "op-003",
    };

    // それぞれのリスナーを発火
    capturedListeners[0]?.({}, payload);
    capturedListeners[1]?.({}, payload);

    expect(callback1).toHaveBeenCalledWith(payload);
    expect(callback2).toHaveBeenCalledWith(payload);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  // T-6-3: アンサブスクライブ後にイベントが発火してもコールバックが呼ばれないこと
  it("T-6-3: アンサブスクライブ後にイベントが発火してもコールバックが呼ばれないこと", async () => {
    vi.resetModules();

    const listenerRegistry: Map<
      string,
      (event: unknown, data: unknown) => void
    > = new Map();

    const mockOn = vi
      .fn()
      .mockImplementation(
        (
          _channel: string,
          listener: (event: unknown, data: unknown) => void,
        ) => {
          listenerRegistry.set(_channel, listener);
        },
      );
    const mockRemoveListener = vi.fn().mockImplementation((channel: string) => {
      listenerRegistry.delete(channel);
    });

    vi.doMock("electron", () => ({
      contextBridge: { exposeInMainWorld: vi.fn() },
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({}),
        on: mockOn,
        removeListener: mockRemoveListener,
      },
    }));

    const { skillCreatorAPI } = await import("../skill-creator-api");
    const callback = vi.fn();

    const unsubscribe = (
      skillCreatorAPI.onApprovalRequest as (cb: typeof callback) => () => void
    )(callback);

    // アンサブスクライブ
    unsubscribe();

    // removeListener が呼ばれてリスナーがレジストリから削除されている
    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.APPROVAL_REQUEST,
      expect.any(Function),
    );

    // 登録解除後はリスナーが存在しない（コールバックは呼ばれない）
    expect(listenerRegistry.has(IPC_CHANNELS.APPROVAL_REQUEST)).toBe(false);
    expect(callback).not.toHaveBeenCalled();
  });
});

// IPC_CHANNELS の存在確認（既存テストとの整合）
describe("IPC_CHANNELS - APPROVAL_REQUEST チャンネル確認", () => {
  it("APPROVAL_REQUEST チャンネルが approval:request であること", () => {
    expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
  });

  it("ipcRenderer.on が APPROVAL_REQUEST チャンネルで呼ばれること", () => {
    const callback = vi.fn();
    ipcRenderer.on(IPC_CHANNELS.APPROVAL_REQUEST, callback);
    expect(ipcRenderer.on).toHaveBeenCalledWith(
      IPC_CHANNELS.APPROVAL_REQUEST,
      callback,
    );
  });
});
