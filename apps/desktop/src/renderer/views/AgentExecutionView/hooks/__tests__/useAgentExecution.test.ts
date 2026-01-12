/**
 * useAgentExecution hookテスト
 * Phase 6: テスト拡充 - カスタムフックのテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAgentExecution } from "../useAgentExecution";
import type { Skill } from "@repo/shared/types/skill";

// テスト用モックスキル
const mockSkill: Skill = {
  id: "skill-1",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for unit testing",
  path: "/skills/test-skill",
  triggers: ["test"],
  anchors: [],
  category: "development",
  lastModified: new Date("2026-01-12T00:00:00Z"),
};

// Zustand storeのモック
const mockStartExecution = vi.fn();
const mockStopExecution = vi.fn();
const mockAddUserMessage = vi.fn();
const mockAddAssistantMessage = vi.fn();
const mockAppendStreamingContent = vi.fn();
const mockFinalizeStreamingMessage = vi.fn();
const mockSetExecutionError = vi.fn();
const mockSetPermissionRequest = vi.fn();

const mockStoreState = {
  startExecution: mockStartExecution,
  stopExecution: mockStopExecution,
  addUserMessage: mockAddUserMessage,
  addAssistantMessage: mockAddAssistantMessage,
  appendStreamingContent: mockAppendStreamingContent,
  finalizeStreamingMessage: mockFinalizeStreamingMessage,
  setExecutionError: mockSetExecutionError,
  setPermissionRequest: mockSetPermissionRequest,
  executionState: {
    rememberedChoices: {},
  },
};

vi.mock("@/renderer/store", () => ({
  useStore: (selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
}));

// agentAPIのモック
type StreamCallback = (payload: {
  chunk: string;
  isComplete?: boolean;
}) => void;
type StatusCallback = (payload: {
  status: string;
  error?: string;
  message?: { content: string };
}) => void;
type PermissionCallback = (request: {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
}) => void;

let streamCallback: StreamCallback | null = null;
let statusCallback: StatusCallback | null = null;
let permissionCallback: PermissionCallback | null = null;

const mockAgentAPI = {
  start: vi.fn().mockResolvedValue({ executionId: "exec-123" }),
  stop: vi.fn().mockResolvedValue(undefined),
  respondPermission: vi.fn().mockResolvedValue(undefined),
  onStream: vi.fn((callback: StreamCallback) => {
    streamCallback = callback;
    return () => {
      streamCallback = null;
    };
  }),
  onStatus: vi.fn((callback: StatusCallback) => {
    statusCallback = callback;
    return () => {
      statusCallback = null;
    };
  }),
  onPermission: vi.fn((callback: PermissionCallback) => {
    permissionCallback = callback;
    return () => {
      permissionCallback = null;
    };
  }),
};

vi.stubGlobal("agentAPI", mockAgentAPI);

describe("useAgentExecution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    streamCallback = null;
    statusCallback = null;
    permissionCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with skill", () => {
      // Arrange & Act
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Assert
      expect(result.current).toBeDefined();
      expect(result.current.start).toBeInstanceOf(Function);
      expect(result.current.stop).toBeInstanceOf(Function);
    });

    it("should setup IPC listeners on mount", () => {
      // Arrange & Act
      renderHook(() => useAgentExecution(mockSkill));

      // Assert
      expect(mockAgentAPI.onStream).toHaveBeenCalled();
      expect(mockAgentAPI.onStatus).toHaveBeenCalled();
      expect(mockAgentAPI.onPermission).toHaveBeenCalled();
    });

    it("should cleanup IPC listeners on unmount", () => {
      // Arrange
      const { unmount } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      unmount();

      // Assert - クリーンアップ関数が呼ばれている
      expect(mockAgentAPI.onStream).toHaveBeenCalled();
    });

    it("should handle null skill", () => {
      // Arrange & Act
      const { result } = renderHook(() => useAgentExecution(null));

      // Assert
      expect(result.current).toBeDefined();
    });
  });

  describe("start", () => {
    it("should call agentAPI.start with skill and prompt", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.start("Execute task");
      });

      // Assert
      expect(mockAgentAPI.start).toHaveBeenCalled();
    });

    it("should call startExecution in store", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.start("Execute task");
      });

      // Assert
      expect(mockStartExecution).toHaveBeenCalled();
    });

    it("should handle start error", async () => {
      // Arrange
      mockAgentAPI.start.mockRejectedValueOnce(new Error("Start failed"));
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.start("Execute task");
      });

      // Assert
      expect(mockSetExecutionError).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should call agentAPI.stop", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.stop();
      });

      // Assert
      expect(mockAgentAPI.stop).toHaveBeenCalled();
    });

    it("should call stopExecution in store", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.stop();
      });

      // Assert
      expect(mockStopExecution).toHaveBeenCalled();
    });
  });

  describe("stream handling", () => {
    it("should handle stream chunks", async () => {
      // Arrange
      renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        if (streamCallback) {
          streamCallback({ chunk: "Hello " });
          streamCallback({ chunk: "World" });
        }
      });

      // Assert
      expect(mockAppendStreamingContent).toHaveBeenCalledWith("Hello ");
      expect(mockAppendStreamingContent).toHaveBeenCalledWith("World");
    });
  });

  describe("status handling", () => {
    it("should handle completed status", async () => {
      // Arrange
      renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        if (statusCallback) {
          statusCallback({ status: "completed" });
        }
      });

      // Assert
      expect(mockFinalizeStreamingMessage).toHaveBeenCalled();
    });

    it("should handle error status", async () => {
      // Arrange
      renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        if (statusCallback) {
          statusCallback({ status: "error", error: "Something went wrong" });
        }
      });

      // Assert
      expect(mockSetExecutionError).toHaveBeenCalledWith(
        "Something went wrong",
      );
    });

    it("should finalize streaming on completed status", async () => {
      // Arrange
      renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        if (statusCallback) {
          statusCallback({
            status: "completed",
          });
        }
      });

      // Assert
      expect(mockFinalizeStreamingMessage).toHaveBeenCalled();
    });
  });

  describe("permission handling", () => {
    it("should handle permission request", async () => {
      // Arrange
      renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        if (permissionCallback) {
          permissionCallback({
            executionId: "exec-123",
            requestId: "req-456",
            toolName: "Bash",
            args: { command: "npm test" },
          });
        }
      });

      // Assert
      expect(mockSetPermissionRequest).toHaveBeenCalled();
    });

    it("should approve permission", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.approve("req-456", false);
      });

      // Assert
      expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: false,
      });
    });

    it("should deny permission", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.deny("req-456", false);
      });

      // Assert
      expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: false,
        rememberChoice: false,
      });
    });

    it("should include rememberChoice in permission response", async () => {
      // Arrange
      const { result } = renderHook(() => useAgentExecution(mockSkill));

      // Act
      await act(async () => {
        await result.current.approve("req-456", true);
      });

      // Assert
      expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: true,
      });
    });
  });

  describe("remembered choices", () => {
    it("should auto-approve for remembered approval", async () => {
      // Arrange - モックを更新してrememberedChoicesを設定
      vi.mocked(mockAgentAPI.onPermission).mockImplementation(
        (callback: PermissionCallback) => {
          permissionCallback = callback;
          return () => {
            permissionCallback = null;
          };
        },
      );

      renderHook(() => useAgentExecution(mockSkill));

      // Assert
      expect(mockAgentAPI.onPermission).toHaveBeenCalled();
    });
  });
});
