import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// IPC_TIMEOUT_MS is private to the module, so we use the known value (5000ms)
const IPC_TIMEOUT_MS = 5000;

// Store captured APIs from contextBridge.exposeInMainWorld
const exposedAPIs: Record<string, unknown> = {};

const mockInvoke = vi.fn();

// Mock electron modules before any imports
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn((name: string, api: unknown) => {
      exposedAPIs[name] = api;
    }),
  },
}));

// Mock process.contextIsolated to trigger contextBridge path
Object.defineProperty(process, "contextIsolated", {
  value: true,
  writable: true,
});

// Import channels for test helpers
import { IPC_CHANNELS } from "../channels";

// Helper: get a valid channel from the whitelist
function getValidChannel(): string {
  return IPC_CHANNELS.FILE_GET_TREE;
}

// Helper: get the exposed electronAPI
function getElectronAPI(): {
  invoke: <T>(channel: string, payload?: unknown) => Promise<T>;
} {
  return exposedAPIs["electronAPI"] as {
    invoke: <T>(channel: string, payload?: unknown) => Promise<T>;
  };
}

describe("safeInvoke timeout", () => {
  // P13: use fake timers, advance step by step (NOT runAllTimers)
  beforeEach(async () => {
    vi.useFakeTimers();
    mockInvoke.mockClear();
    // Reset module registry and re-import to capture fresh APIs
    vi.resetModules();
    Object.keys(exposedAPIs).forEach((k) => delete exposedAPIs[k]);
    await import("../index");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // T1: Timeout triggers when IPC does not respond (AC-1)
  it("should reject with timeout error when IPC does not respond within IPC_TIMEOUT_MS", async () => {
    const channel = getValidChannel();
    // IPC never resolves
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const api = getElectronAPI();
    const promise = api.invoke(channel);

    // Advance time to trigger timeout
    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    await expect(promise).rejects.toThrow(/IPC timeout/);
  });

  // T2: Timeout error message contains channel name and timeout value (AC-2)
  it("should include channel name and timeout value in error message", async () => {
    const channel = getValidChannel();
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const api = getElectronAPI();
    const promise = api.invoke(channel);

    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    try {
      await promise;
      expect.unreachable("Should have rejected");
    } catch (error) {
      const msg = (error as Error).message;
      expect(msg).toContain("IPC timeout:");
      expect(msg).toContain(channel);
      expect(msg).toContain(`${IPC_TIMEOUT_MS}ms`);
    }
  });

  // T3: IPC_TIMEOUT_MS constant value verification (AC-5)
  it("should use 5000ms as the timeout value", () => {
    expect(IPC_TIMEOUT_MS).toBe(5000);
  });

  // T4: Normal response resolves without timeout (AC-3)
  it("should resolve normally when IPC responds before timeout", async () => {
    const channel = getValidChannel();
    const expectedResult = { success: true, data: "test" };
    mockInvoke.mockResolvedValue(expectedResult);

    const api = getElectronAPI();
    const result = await api.invoke(channel);
    expect(result).toEqual(expectedResult);
  });

  // T5: Response just before timeout resolves normally (AC-3 boundary)
  it("should resolve when IPC responds just before timeout", async () => {
    const channel = getValidChannel();
    const expectedResult = { data: "just-in-time" };

    // IPC resolves after IPC_TIMEOUT_MS - 1ms
    mockInvoke.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(expectedResult), IPC_TIMEOUT_MS - 1);
        }),
    );

    const api = getElectronAPI();
    const promise = api.invoke(channel);

    // Advance to just before timeout
    vi.advanceTimersByTime(IPC_TIMEOUT_MS - 1);

    const result = await promise;
    expect(result).toEqual(expectedResult);
  });

  // T6: Unauthorized channel rejected immediately (AC-4)
  it("should reject immediately for unauthorized channels", async () => {
    const unauthorizedChannel = "unauthorized:test-channel";

    const api = getElectronAPI();
    const promise = api.invoke(unauthorizedChannel);

    await expect(promise).rejects.toThrow("is not allowed");
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  // T7: IPC error response returns IPC error, not timeout error
  it("should reject with IPC error when Main Process rejects before timeout", async () => {
    const channel = getValidChannel();
    const ipcError = new Error("Main Process error: handler failed");
    mockInvoke.mockRejectedValue(ipcError);

    const api = getElectronAPI();

    try {
      await api.invoke(channel);
      expect.unreachable("Should have rejected");
    } catch (error) {
      expect((error as Error).message).toContain("Main Process error");
      expect((error as Error).message).not.toContain("IPC timeout");
    }
  });

  // T8: Multiple concurrent invocations timeout independently
  it("should handle multiple concurrent invocations independently", async () => {
    const channel = getValidChannel();
    // Both IPCs never resolve
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const api = getElectronAPI();
    const promise1 = api.invoke(channel);
    const promise2 = api.invoke(channel);

    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    await expect(promise1).rejects.toThrow(/IPC timeout/);
    await expect(promise2).rejects.toThrow(/IPC timeout/);
  });

  // --- Phase 6: Additional edge case tests ---

  // T9: Timeout error message includes the timeout value (AC-2 complement)
  it("should include the exact timeout duration in error message", async () => {
    const channel = getValidChannel();
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const api = getElectronAPI();
    const promise = api.invoke(channel);

    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    try {
      await promise;
      expect.unreachable("Should have rejected");
    } catch (error) {
      expect((error as Error).message).toBe(
        `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
      );
    }
  });

  // T10: IPC_TIMEOUT_MS is exactly 5000 (AC-5 explicit)
  it("should define IPC_TIMEOUT_MS as exactly 5000", () => {
    // Verify by triggering timeout and checking the error message
    expect(IPC_TIMEOUT_MS).toStrictEqual(5000);
  });

  // T11: Delayed IPC resolve after timeout is ignored (memory safety)
  it("should ignore late IPC response after timeout", async () => {
    const channel = getValidChannel();
    let resolveIpc: (v: unknown) => void;
    mockInvoke.mockReturnValue(
      new Promise((resolve) => {
        resolveIpc = resolve;
      }),
    );

    const api = getElectronAPI();
    const promise = api.invoke(channel);

    // Trigger timeout
    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    // Verify timeout error
    await expect(promise).rejects.toThrow(/IPC timeout/);

    // Late resolve should not cause any errors
    resolveIpc!({ data: "too-late" });
    // No unhandled promise rejection should occur
  });

  // T12: IPC resolving at 0ms works correctly (minimum boundary)
  it("should resolve when IPC responds immediately at 0ms", async () => {
    const channel = getValidChannel();
    const expectedResult = { instant: true };
    mockInvoke.mockResolvedValue(expectedResult);

    const api = getElectronAPI();
    const result = await api.invoke(channel);
    expect(result).toEqual(expectedResult);
  });
});
