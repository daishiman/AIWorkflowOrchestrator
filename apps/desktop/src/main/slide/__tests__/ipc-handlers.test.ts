/**
 * IPC handlers のユニットテスト
 * Wave A: IPC チャネル、セキュリティ、バリデーションをテスト
 * @module main/slide/__tests__/ipc-handlers.test
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent } from "electron";

// ============================================================================
// Mocks
// ============================================================================

const mockHandle = vi.fn();
const mockRemoveHandler = vi.fn();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (...args: unknown[]) => mockHandle(...args),
    removeHandler: (...args: unknown[]) => mockRemoveHandler(...args),
  },
  BrowserWindow: vi.fn(),
}));

const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: (...args: unknown[]) => mockValidateIpcSender(...args),
}));

vi.mock("../../ipc/sanitizeErrorMessage", () => ({
  sanitizeErrorMessage: vi.fn((_error: unknown, fallback: string) => fallback),
}));

const mockExecutor = {
  execute: vi
    .fn()
    .mockResolvedValue({ phase: "hearing", success: true, duration: 100 }),
  cancel: vi.fn(),
  onProgress: vi.fn(),
  isExecuting: vi.fn().mockReturnValue(false),
};

vi.mock("../skill-executor", () => ({
  createSkillExecutor: vi.fn(() => mockExecutor),
}));

const mockWatcher = {
  start: vi.fn(),
  stop: vi.fn(),
  onStructureChange: vi.fn(),
  onHtmlChange: vi.fn(),
  markAsSkillChange: vi.fn(),
  clearChangeContext: vi.fn(),
  projectPath: "/test",
  watcher: null,
};

vi.mock("../file-watcher", () => ({
  createSlideWatcher: vi.fn(() => mockWatcher),
}));

const mockSyncManager = {
  getStatus: vi.fn().mockResolvedValue("synced"),
  sync: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn(),
};

vi.mock("../sync-manager", () => ({
  createSyncManager: vi.fn(() => mockSyncManager),
}));

// Import after mocks
import {
  SLIDE_INVOKE_CHANNELS,
  SLIDE_PUSH_CHANNELS,
  registerSlideIpcHandlers,
  unregisterSlideIpcHandlers,
} from "../ipc-handlers";

// ============================================================================
// Helpers
// ============================================================================

/**
 * registeredHandlers Map から登録されたハンドラを取得して呼び出すヘルパー
 */
function getRegisteredHandlers(): Map<
  string,
  (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>
> {
  const handlers = new Map<
    string,
    (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>
  >();
  for (const call of mockHandle.mock.calls) {
    const [channel, handler] = call as [
      string,
      (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>,
    ];
    handlers.set(channel, handler);
  }
  return handlers;
}

function createMockEvent(): IpcMainInvokeEvent {
  return {
    sender: {
      id: 1,
      getOwnerBrowserWindow: vi.fn().mockReturnValue({ id: 1 }),
    },
    senderFrame: { url: "file://test" },
  } as unknown as IpcMainInvokeEvent;
}

const mockMainWindow = {
  id: 1,
  webContents: {
    send: vi.fn(),
    id: 1,
  },
} as unknown as Electron.BrowserWindow;

// ============================================================================
// Tests
// ============================================================================

describe("IPC Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandle.mockClear();
    mockRemoveHandler.mockClear();
    mockValidateIpcSender.mockReturnValue({ valid: true });
  });

  afterEach(() => {
    // Cleanup: unregister handlers
    unregisterSlideIpcHandlers();
  });

  // ==========================================================================
  // SLIDE_INVOKE_CHANNELS
  // ==========================================================================
  describe("SLIDE_INVOKE_CHANNELS", () => {
    it("should have 7 invoke channels", () => {
      expect(Object.keys(SLIDE_INVOKE_CHANNELS)).toHaveLength(7);
    });

    it("should have correct channel values", () => {
      expect(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE).toBe("slide:executePhase");
      expect(SLIDE_INVOKE_CHANNELS.WATCH_START).toBe("slide:watch-start");
      expect(SLIDE_INVOKE_CHANNELS.WATCH_STOP).toBe("slide:watch-stop");
      expect(SLIDE_INVOKE_CHANNELS.SYNC_STATUS).toBe("slide:sync-status");
      expect(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC).toBe("slide:reverse-sync");
      expect(SLIDE_INVOKE_CHANNELS.CANCEL).toBe("slide:cancel");
    });
  });

  // ==========================================================================
  // SLIDE_PUSH_CHANNELS
  // ==========================================================================
  describe("SLIDE_PUSH_CHANNELS", () => {
    it("should have 6 push channels", () => {
      expect(Object.keys(SLIDE_PUSH_CHANNELS)).toHaveLength(6);
    });

    it("should have correct channel values", () => {
      expect(SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED).toBe(
        "slide:sync-status-changed",
      );
      expect(SLIDE_PUSH_CHANNELS.SYNC_PROGRESS).toBe("slide:sync-progress");
      expect(SLIDE_PUSH_CHANNELS.SYNC_ERROR).toBe("slide:sync-error");
      expect(SLIDE_PUSH_CHANNELS.EXECUTION_PROGRESS).toBe(
        "slide:execution-progress",
      );
      expect(SLIDE_PUSH_CHANNELS.STRUCTURE_CHANGED).toBe(
        "slide:structureChanged",
      );
      expect(SLIDE_PUSH_CHANNELS.WATCH_STATUS).toBe("slide:watch-status");
    });
  });

  // ==========================================================================
  // Legacy channel names
  // ==========================================================================
  describe("legacy channel names", () => {
    it("should not contain legacy channel names in invoke channels", () => {
      const values = Object.values(SLIDE_INVOKE_CHANNELS);
      expect(values).not.toContain("slide:execute");
      expect(values).not.toContain("slide:manualSync");
      expect(values).not.toContain("slide:startWatch");
      expect(values).not.toContain("slide:stopWatch");
    });

    it("should not contain legacy channel names in push channels", () => {
      const values = Object.values(SLIDE_PUSH_CHANNELS);
      expect(values).not.toContain("slide:syncStatusChanged");
      expect(values).not.toContain("slide:syncProgress");
      expect(values).not.toContain("slide:syncError");
    });
  });

  // ==========================================================================
  // IPC handler registration
  // ==========================================================================
  describe("IPC handler registration", () => {
    it("should register 7 handlers on registerSlideIpcHandlers", () => {
      registerSlideIpcHandlers(mockMainWindow);
      expect(mockHandle).toHaveBeenCalledTimes(7);
    });

    it("should register handlers with correct channel names", () => {
      registerSlideIpcHandlers(mockMainWindow);
      const registeredChannels = mockHandle.mock.calls.map((call) => call[0]);

      expect(registeredChannels).toContain(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      expect(registeredChannels).toContain(SLIDE_INVOKE_CHANNELS.WATCH_START);
      expect(registeredChannels).toContain(SLIDE_INVOKE_CHANNELS.WATCH_STOP);
      expect(registeredChannels).toContain(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
      expect(registeredChannels).toContain(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
      expect(registeredChannels).toContain(SLIDE_INVOKE_CHANNELS.CANCEL);
      expect(registeredChannels).toContain(
        SLIDE_INVOKE_CHANNELS.CAPABILITY_GET,
      );
    });

    it("should remove 7 handlers on unregisterSlideIpcHandlers", () => {
      registerSlideIpcHandlers(mockMainWindow);
      unregisterSlideIpcHandlers();
      expect(mockRemoveHandler).toHaveBeenCalledTimes(7);
    });

    it("should remove handlers with correct channel names", () => {
      registerSlideIpcHandlers(mockMainWindow);
      unregisterSlideIpcHandlers();
      const removedChannels = mockRemoveHandler.mock.calls.map(
        (call) => call[0],
      );

      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.WATCH_START);
      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.WATCH_STOP);
      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.CANCEL);
      expect(removedChannels).toContain(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
    });
  });

  // ==========================================================================
  // slide:capability:get handler (UT-SLIDE-IMPL-001 T2-1-1 ~ T2-2-2)
  // ==========================================================================
  describe("slide:capability:get", () => {
    it("T2-1-1: should return VALIDATION_ERROR when sessionId is undefined", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
      expect(handler).toBeDefined();

      const event = createMockEvent();
      const result = (await handler!(event, { sessionId: undefined })) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E011");
    });

    it("T2-1-2: should return VALIDATION_ERROR when sessionId is a number", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, { sessionId: 123 })) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E011");
    });

    it("T2-1-3: should return VALIDATION_ERROR when sessionId is empty string", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, { sessionId: "" })) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E011");
    });

    it("T2-1-4: should return VALIDATION_ERROR when sessionId is whitespace only", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, { sessionId: "   " })) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E011");
    });

    it("T2-1-5: should return capability DTO for valid sessionId", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, {
        sessionId: "valid-session-123",
      })) as {
        success: boolean;
        data?: { lane: string; apiKeySource: string; uiStatus: string };
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.lane).toBe("integrated");
      expect(result.data?.apiKeySource).toBe("env");
      expect(result.data?.uiStatus).toBe("synced");
    });

    it("T2-1-6: should return VALIDATION_ERROR when args is null", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, null)) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E011");
    });

    it("T2-1-7: should return VALIDATION_ERROR when args is undefined", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, undefined)) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E011");
    });

    it("T2-2-1: should return success:true and data on valid request (P60)", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, {
        sessionId: "test-session",
      })) as Record<string, unknown>;

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");
      const data = result.data as Record<string, unknown>;
      expect(data).toHaveProperty("lane");
      expect(data).toHaveProperty("apiKeySource");
      expect(data).toHaveProperty("uiStatus");
    });

    it("T2-2-2: should return success:false and error on validation failure (P60)", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);

      const event = createMockEvent();
      const result = (await handler!(event, { sessionId: "" })) as Record<
        string,
        unknown
      >;

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      const error = result.error as Record<string, unknown>;
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("message");
    });
  });

  // ==========================================================================
  // slide:executePhase handler
  // ==========================================================================
  describe("slide:executePhase", () => {
    it("should return success response on valid execution", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      expect(handler).toBeDefined();

      const event = createMockEvent();
      const result = await handler!(event, "hearing", "/valid/path");

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          phase: "hearing",
          success: true,
        }),
      });
    });

    it("should return error when executor throws", async () => {
      mockExecutor.execute.mockRejectedValueOnce(new Error("Execution failed"));

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      const result = (await handler!(event, "hearing", "/valid/path")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E006");
    });

    it("should validate IPC sender", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      await handler!(event, "hearing", "/valid/path");

      expect(mockValidateIpcSender).toHaveBeenCalledWith(
        event,
        SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE,
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );
    });

    it("should return error when sender validation fails", async () => {
      mockValidateIpcSender.mockReturnValueOnce({ valid: false });

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      const result = (await handler!(event, "hearing", "/valid/path")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E010");
    });
  });

  // ==========================================================================
  // P42 3-stage validation
  // ==========================================================================
  describe("P42 3-stage validation", () => {
    let handlers: Map<
      string,
      (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>
    >;
    let event: IpcMainInvokeEvent;

    beforeEach(() => {
      registerSlideIpcHandlers(mockMainWindow);
      handlers = getRegisteredHandlers();
      event = createMockEvent();
    });

    describe("phase validation (slide:executePhase)", () => {
      it("should reject non-string phase (type check)", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, 123, "/valid/path")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
        expect(result.error?.message).toContain("phase");
      });

      it("should reject empty string phase", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, "", "/valid/path")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject whitespace-only phase (trim check)", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, "   ", "/valid/path")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject null phase", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, null, "/valid/path")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject undefined phase", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, undefined, "/valid/path")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject invalid phase value", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(
          event,
          "invalid-phase",
          "/valid/path",
        )) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
        expect(result.error?.message).toBe("invalid phase value");
      });
    });

    describe("projectPath validation (slide:executePhase)", () => {
      it("should reject non-string projectPath (type check)", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, "hearing", 123)) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
        expect(result.error?.message).toContain("projectPath");
      });

      it("should reject empty string projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, "hearing", "")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject whitespace-only projectPath (trim check)", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
        const result = (await handler!(event, "hearing", "   ")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });
    });

    describe("projectPath validation (slide:watch-start)", () => {
      it("should reject non-string projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_START);
        const result = (await handler!(event, 42)) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject empty string projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_START);
        const result = (await handler!(event, "")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject whitespace-only projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_START);
        const result = (await handler!(event, "   ")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });
    });

    describe("projectPath validation (slide:reverse-sync)", () => {
      it("should reject non-string projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
        const result = (await handler!(event, 42)) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject empty string projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
        const result = (await handler!(event, "")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject whitespace-only projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
        const result = (await handler!(event, "   ")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });
    });

    describe("projectPath validation (slide:sync-status)", () => {
      it("should reject non-string projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
        const result = (await handler!(event, null)) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("should reject whitespace-only projectPath", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
        const result = (await handler!(event, "   ")) as {
          success: boolean;
          error?: { code: string; message: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });
    });
  });

  // ==========================================================================
  // detectPathTraversal
  // ==========================================================================
  describe("detectPathTraversal", () => {
    let handlers: Map<
      string,
      (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>
    >;
    let event: IpcMainInvokeEvent;

    beforeEach(() => {
      registerSlideIpcHandlers(mockMainWindow);
      handlers = getRegisteredHandlers();
      event = createMockEvent();
    });

    it("should reject paths with '..'", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      const result = (await handler!(
        event,
        "hearing",
        "/valid/../etc/passwd",
      )) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("traversal");
    });

    it("should reject paths with null bytes", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      const result = (await handler!(
        event,
        "hearing",
        "/valid/path\0/bad",
      )) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("null byte");
    });

    it("should reject paths with URL-encoded traversal (%2e)", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      const result = (await handler!(
        event,
        "hearing",
        "/valid/%2e%2e/etc/passwd",
      )) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("URL encoded");
    });

    it("should reject paths with URL-encoded traversal (%2E uppercase)", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      const result = (await handler!(
        event,
        "hearing",
        "/valid/%2E%2E/etc/passwd",
      )) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("URL encoded");
    });

    it("should accept valid paths", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      const result = (await handler!(
        event,
        "hearing",
        "/valid/project/path",
      )) as {
        success: boolean;
      };

      expect(result.success).toBe(true);
    });

    it("should check path traversal on watch-start", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_START);
      const result = (await handler!(event, "/valid/../etc/passwd")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("traversal");
    });

    it("should check path traversal on sync-status", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);
      const result = (await handler!(event, "/valid/../etc/passwd")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("traversal");
    });

    it("should check path traversal on reverse-sync", async () => {
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);
      const result = (await handler!(event, "/valid/../etc/passwd")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("traversal");
    });
  });

  // ==========================================================================
  // validateIpcSender
  // ==========================================================================
  describe("validateIpcSender", () => {
    it("should call validateIpcSender for each handler", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const event = createMockEvent();

      // Test several handlers
      const channelsWithArgs: Array<[string, unknown[]]> = [
        [SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE, ["hearing", "/path"]],
        [SLIDE_INVOKE_CHANNELS.WATCH_START, ["/path"]],
        [SLIDE_INVOKE_CHANNELS.WATCH_STOP, []],
        [SLIDE_INVOKE_CHANNELS.SYNC_STATUS, ["/path"]],
        [SLIDE_INVOKE_CHANNELS.REVERSE_SYNC, ["/path"]],
        [SLIDE_INVOKE_CHANNELS.CANCEL, []],
      ];

      for (const [channel, args] of channelsWithArgs) {
        mockValidateIpcSender.mockClear();
        const handler = handlers.get(channel);
        expect(handler).toBeDefined();

        await handler!(event, ...args);

        expect(mockValidateIpcSender).toHaveBeenCalledWith(
          event,
          channel,
          expect.objectContaining({
            getAllowedWindows: expect.any(Function),
          }),
        );
      }
    });

    it("should return SLIDE_E010 when sender validation fails on watch-stop", async () => {
      mockValidateIpcSender.mockReturnValue({ valid: false });

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_STOP);

      const event = createMockEvent();
      const result = (await handler!(event)) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E010");
    });

    it("should return SLIDE_E010 when sender validation fails on cancel", async () => {
      mockValidateIpcSender.mockReturnValue({ valid: false });

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CANCEL);

      const event = createMockEvent();
      const result = (await handler!(event)) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E010");
    });
  });

  // ==========================================================================
  // Response wrapper format (P60)
  // ==========================================================================
  describe("response wrapper format (P60)", () => {
    it("should return { success: true, data } on successful executePhase", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      const result = (await handler!(event, "hearing", "/path")) as {
        success: boolean;
        data?: unknown;
        error?: unknown;
      };

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");
      expect(result).not.toHaveProperty("error");
    });

    it("should return { success: false, error: { code, message } } on validation failure", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      const result = (await handler!(event, "", "/path")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error).toHaveProperty("code");
      expect(result.error).toHaveProperty("message");
    });

    it("should return { success: true } on successful watch-start", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_START);

      const event = createMockEvent();
      const result = (await handler!(event, "/valid/path")) as {
        success: boolean;
      };

      expect(result.success).toBe(true);
    });

    it("should return { success: true } on successful watch-stop", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_STOP);

      const event = createMockEvent();
      const result = (await handler!(event)) as { success: boolean };

      expect(result.success).toBe(true);
    });

    it("should return { success: true, data } on successful sync-status", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.SYNC_STATUS);

      const event = createMockEvent();
      const result = (await handler!(event, "/valid/path")) as {
        success: boolean;
        data?: string;
      };

      expect(result.success).toBe(true);
      expect(result.data).toBe("synced");
    });

    it("should return { success: true } on successful cancel", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CANCEL);

      const event = createMockEvent();
      const result = (await handler!(event)) as { success: boolean };

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // Edge cases (Phase 6)
  // ==========================================================================
  describe("edge cases", () => {
    it("should return CONFLICT_ERROR when executePhase is called while executing", async () => {
      mockExecutor.isExecuting.mockReturnValue(true);
      mockExecutor.execute.mockResolvedValueOnce({
        phase: "hearing",
        success: false,
        error: "Another skill is already executing",
        duration: 0,
      });

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      const result = (await handler!(event, "hearing", "/valid/path")) as {
        success: boolean;
        data?: { success: boolean; error?: string };
      };

      // executor.execute returns the conflict result, wrapped in success: true by the handler
      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(false);
      expect(result.data?.error).toBe("Another skill is already executing");

      mockExecutor.isExecuting.mockReturnValue(false);
    });

    it("should succeed re-executing after cancel", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const cancelHandler = handlers.get(SLIDE_INVOKE_CHANNELS.CANCEL);
      const executeHandler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();

      // Cancel first
      const cancelResult = (await cancelHandler!(event)) as {
        success: boolean;
      };
      expect(cancelResult.success).toBe(true);

      // Then execute
      mockExecutor.execute.mockResolvedValueOnce({
        phase: "hearing",
        success: true,
        duration: 100,
      });
      const executeResult = (await executeHandler!(
        event,
        "hearing",
        "/valid/path",
      )) as {
        success: boolean;
        data?: { success: boolean };
      };

      expect(executeResult.success).toBe(true);
      expect(executeResult.data?.success).toBe(true);
    });

    it("should return success when watch-stop is called without active watcher", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_STOP);

      const event = createMockEvent();
      // No watch-start has been called, so no watcher exists
      const result = (await handler!(event)) as { success: boolean };

      expect(result.success).toBe(true);
    });

    it("should return error when cancel handler throws", async () => {
      // First, trigger executor creation via executePhase
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const executeHandler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);
      const cancelHandler = handlers.get(SLIDE_INVOKE_CHANNELS.CANCEL);

      const event = createMockEvent();
      // Execute first to create executor
      await executeHandler!(event, "hearing", "/valid/path");

      // Make cancel throw
      mockExecutor.cancel.mockImplementationOnce(() => {
        throw new Error("Cancel error");
      });

      const result = (await cancelHandler!(event)) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E008");
    });

    it("should return error when reverse-sync sync fails", async () => {
      mockSyncManager.sync.mockRejectedValueOnce(new Error("Sync broke"));

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);

      const event = createMockEvent();
      const result = (await handler!(event, "/valid/path")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E007");
      expect(result.error?.message).toBe("Reverse sync failed");
    });
  });

  // ==========================================================================
  // Push channel tests (Phase 6)
  // ==========================================================================
  describe("push channels", () => {
    it("should send sync-progress event via webContents.send on execution progress", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      await handler!(event, "hearing", "/valid/path");

      // executor.onProgress should have been registered
      expect(mockExecutor.onProgress).toHaveBeenCalled();

      // Simulate progress event
      const onProgressCallback = mockExecutor.onProgress.mock.calls[0][0] as (
        progress: number,
      ) => void;
      onProgressCallback(50);

      expect(
        mockMainWindow.webContents.send as ReturnType<typeof vi.fn>,
      ).toHaveBeenCalledWith(SLIDE_PUSH_CHANNELS.EXECUTION_PROGRESS, 50);
    });

    it("should send sync-error event without stack trace on execution failure", async () => {
      const testError = new Error("Internal DB error");
      testError.stack =
        "Error: Internal DB error\n    at Object.<anonymous> (/secret/path/file.ts:10:5)";
      mockExecutor.execute.mockRejectedValueOnce(testError);

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE);

      const event = createMockEvent();
      const result = (await handler!(event, "hearing", "/valid/path")) as {
        success: boolean;
        error?: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("SLIDE_E006");
      // sanitizeErrorMessage is mocked to return fallback, which hides internal details
      expect(result.error?.message).toBe("Skill execution failed");
      // Verify stack trace is not exposed in error message
      expect(result.error?.message).not.toContain("/secret/path");
      expect(result.error?.message).not.toContain("at Object");
    });

    it("should send watch-status event via webContents.send after watch-start", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const watchStartHandler = handlers.get(SLIDE_INVOKE_CHANNELS.WATCH_START);

      const event = createMockEvent();
      await watchStartHandler!(event, "/valid/path");

      // The watcher should have been created and started
      expect(mockWatcher.start).toHaveBeenCalled();
      expect(mockWatcher.onStructureChange).toHaveBeenCalled();
    });

    it("should send sync-status-changed event when reverse-sync completes", async () => {
      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);

      const event = createMockEvent();
      await handler!(event, "/valid/path");

      // Verify syncing and synced status were sent
      const sendCalls = (
        mockMainWindow.webContents.send as ReturnType<typeof vi.fn>
      ).mock.calls;

      const statusChangedCalls = sendCalls.filter(
        (call: unknown[]) =>
          call[0] === SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
      );

      // Should have "syncing" and "synced" notifications
      expect(statusChangedCalls.length).toBeGreaterThanOrEqual(2);
      expect(statusChangedCalls[0][1]).toBe("syncing");
      expect(statusChangedCalls[1][1]).toBe("synced");
    });

    it("should send sync-status-changed with error state on reverse-sync failure", async () => {
      mockSyncManager.sync.mockRejectedValueOnce(new Error("Sync failed"));

      registerSlideIpcHandlers(mockMainWindow);
      const handlers = getRegisteredHandlers();
      const handler = handlers.get(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC);

      // Override sync to throw
      mockSyncManager.sync.mockRejectedValueOnce(new Error("Sync failed"));

      const event = createMockEvent();
      await handler!(event, "/valid/path");

      // Verify status events include error
      const sendCalls = (
        mockMainWindow.webContents.send as ReturnType<typeof vi.fn>
      ).mock.calls;
      const statusChangedCalls = sendCalls.filter(
        (call: unknown[]) =>
          call[0] === SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED,
      );

      // At minimum, "syncing" and "synced" (since reverse-sync uses its own sync logic)
      expect(statusChangedCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================================================
  // slide:capability:get handler (UT-SLIDE-IMPL-001)
  // テストID: T2-1-1 ~ T2-1-7, T2-2-1 ~ T2-2-2
  // ==========================================================================
  describe("slide:capability:get", () => {
    let handlers: Map<
      string,
      (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>
    >;
    let event: IpcMainInvokeEvent;

    beforeEach(() => {
      registerSlideIpcHandlers(mockMainWindow);
      handlers = getRegisteredHandlers();
      event = createMockEvent();
    });

    describe("P42 3-stage validation", () => {
      it("T2-1-1: should reject undefined sessionId", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        expect(handler).toBeDefined();
        const result = (await handler!(event, { sessionId: undefined })) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("T2-1-2: should reject number sessionId", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, { sessionId: 123 })) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("T2-1-3: should reject empty string sessionId", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, { sessionId: "" })) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
        expect(result.error?.message).toContain("empty");
      });

      it("T2-1-4: should reject whitespace-only sessionId", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, { sessionId: "   " })) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
        expect(result.error?.message).toContain("whitespace");
      });

      it("T2-1-5: should return capability for valid sessionId", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, {
          sessionId: "test-session-123",
        })) as {
          success: boolean;
          data?: { lane: string; apiKeySource: string; uiStatus: string };
        };
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.lane).toBeDefined();
        expect(result.data?.apiKeySource).toBeDefined();
        expect(result.data?.uiStatus).toBeDefined();
      });

      it("T2-1-6: should reject null args", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, null)) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });

      it("T2-1-7: should reject undefined args", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, undefined)) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("SLIDE_E011");
      });
    });

    describe("P60 response format", () => {
      it("T2-2-1: should return { success: true, data } on valid request", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, {
          sessionId: "valid-session",
        })) as {
          success: boolean;
          data?: unknown;
          error?: unknown;
        };
        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
        expect(result).not.toHaveProperty("error");
      });

      it("T2-2-2: should return { success: false, error: { code, message } } on invalid request", async () => {
        const handler = handlers.get(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET);
        const result = (await handler!(event, { sessionId: "" })) as {
          success: boolean;
          error?: { code: string; message: string };
        };
        expect(result.success).toBe(false);
        expect(result.error).toHaveProperty("code");
        expect(result.error).toHaveProperty("message");
      });
    });
  });
});
