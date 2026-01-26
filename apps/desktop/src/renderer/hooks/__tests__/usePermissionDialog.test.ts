/**
 * @file usePermissionDialog.test.ts
 * @description usePermissionDialog React Hook ユニットテスト
 * @phase Phase 5: 実装（TDD: Green）
 * @task TASK-4-2-permission-resolver-ipc-handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SkillPermissionRequest } from "@repo/shared";
import { usePermissionDialog } from "../usePermissionDialog";

// window.skillAPI モック
const mockSkillAPI = {
  onPermissionRequest: vi.fn(),
  sendPermissionResponse: vi.fn(),
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
};

describe("usePermissionDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("skillAPI", mockSkillAPI);
    mockSkillAPI.onPermissionRequest.mockReturnValue(() => {});
    mockSkillAPI.sendPermissionResponse.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe("初期化", () => {
    it("should initialize with null currentRequest", () => {
      const { result } = renderHook(() => usePermissionDialog());

      expect(result.current.currentRequest).toBeNull();
    });

    it("should initialize with closed state (isOpen = false)", () => {
      const { result } = renderHook(() => usePermissionDialog());

      expect(result.current.isOpen).toBe(false);
    });

    it("should initialize with empty requestQueue", () => {
      const { result } = renderHook(() => usePermissionDialog());

      expect(result.current.requestQueue).toEqual([]);
    });

    it("should initialize with isResponding = false", () => {
      const { result } = renderHook(() => usePermissionDialog());

      expect(result.current.isResponding).toBe(false);
    });
  });

  describe("購読管理", () => {
    it("should subscribe to permission requests on mount", () => {
      renderHook(() => usePermissionDialog());

      expect(mockSkillAPI.onPermissionRequest).toHaveBeenCalled();
    });

    it("should unsubscribe on unmount", () => {
      const unsubscribe = vi.fn();
      mockSkillAPI.onPermissionRequest.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => usePermissionDialog());

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("リクエスト処理", () => {
    it("should open dialog when request is received", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls" },
      };

      const { result } = renderHook(() => usePermissionDialog());

      // リクエスト受信をシミュレート
      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      expect(result.current.currentRequest).toEqual(request);
      expect(result.current.isOpen).toBe(true);
    });

    it("should queue multiple requests", async () => {
      const request1: SkillPermissionRequest = {
        executionId: "exec-1",
        requestId: "req-1",
        toolName: "Bash",
        args: {},
      };
      const request2: SkillPermissionRequest = {
        executionId: "exec-2",
        requestId: "req-2",
        toolName: "Read",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request1);
        callback(request2);
      });

      expect(result.current.requestQueue.length).toBe(2);
      expect(result.current.currentRequest).toEqual(request1);
    });

    it("should show next request after responding to current", async () => {
      const request1: SkillPermissionRequest = {
        executionId: "exec-1",
        requestId: "req-1",
        toolName: "Bash",
        args: {},
      };
      const request2: SkillPermissionRequest = {
        executionId: "exec-2",
        requestId: "req-2",
        toolName: "Read",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request1);
        callback(request2);
      });

      await act(async () => {
        await result.current.respond(true);
      });

      expect(result.current.currentRequest).toEqual(request2);
    });
  });

  describe("応答処理", () => {
    it("should send approved response", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      await act(async () => {
        await result.current.respond(true);
      });

      expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: undefined,
      });
    });

    it("should send denied response on close", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      await act(async () => {
        await result.current.close();
      });

      expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: false,
        rememberChoice: undefined,
      });
    });

    it("should close dialog after responding", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      await act(async () => {
        await result.current.respond(true);
      });

      // キューが空なのでダイアログが閉じる
      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentRequest).toBeNull();
    });

    it("should set isResponding during response processing", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      // 遅延を持たせたモック
      mockSkillAPI.sendPermissionResponse.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100),
          ),
      );

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      // 応答開始
      let respondPromise: Promise<void>;
      act(() => {
        respondPromise = result.current.respond(true);
      });

      // 処理中は isResponding=true
      expect(result.current.isResponding).toBe(true);

      // 完了を待つ
      await act(async () => {
        await respondPromise;
      });

      expect(result.current.isResponding).toBe(false);
    });

    it("should not respond if no current request", async () => {
      const { result } = renderHook(() => usePermissionDialog());

      await act(async () => {
        await result.current.respond(true);
      });

      expect(mockSkillAPI.sendPermissionResponse).not.toHaveBeenCalled();
    });
  });

  describe("エッジケース", () => {
    it("should handle rapid request sequence", async () => {
      const requests: SkillPermissionRequest[] = Array.from(
        { length: 10 },
        (_, i) => ({
          executionId: `exec-${i}`,
          requestId: `req-${i}`,
          toolName: `Tool-${i}`,
          args: {},
        }),
      );

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];

      // 高速で連続リクエスト
      act(() => {
        requests.forEach((req) => callback(req));
      });

      expect(result.current.requestQueue.length).toBe(10);
      expect(result.current.currentRequest).toEqual(requests[0]);
    });

    it("should handle rememberChoice option", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      await act(async () => {
        await result.current.respond(true, true); // rememberChoice = true
      });

      expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: true,
      });
    });

    it("should cleanup properly on unmount during pending request", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      const unsubscribe = vi.fn();
      mockSkillAPI.onPermissionRequest.mockReturnValue(unsubscribe);

      const { result, unmount } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      expect(result.current.currentRequest).not.toBeNull();

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it("should handle API error gracefully", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: {},
      };

      mockSkillAPI.sendPermissionResponse.mockRejectedValue(
        new Error("IPC Error"),
      );

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      // エラーが発生してもクラッシュしない
      await act(async () => {
        await expect(result.current.respond(true)).rejects.toThrow("IPC Error");
      });

      // isResponding は false に戻る
      expect(result.current.isResponding).toBe(false);
    });

    it("should process queue in order after error", async () => {
      const request1: SkillPermissionRequest = {
        executionId: "exec-1",
        requestId: "req-1",
        toolName: "Bash",
        args: {},
      };
      const request2: SkillPermissionRequest = {
        executionId: "exec-2",
        requestId: "req-2",
        toolName: "Read",
        args: {},
      };

      mockSkillAPI.sendPermissionResponse
        .mockRejectedValueOnce(new Error("IPC Error"))
        .mockResolvedValue({ success: true });

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request1);
        callback(request2);
      });

      // 最初のレスポンスでエラー
      await act(async () => {
        try {
          await result.current.respond(true);
        } catch {
          // エラーは期待通り
        }
      });

      // キューの最初の要素は処理されていないのでまだ request1
      expect(result.current.currentRequest?.requestId).toBe("req-1");
    });

    it("should handle empty toolName", async () => {
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "",
        args: {},
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      expect(result.current.currentRequest?.toolName).toBe("");
      expect(result.current.isOpen).toBe(true);
    });

    it("should handle request with complex args structure", async () => {
      const complexArgs = {
        nested: {
          deeply: {
            value: [1, 2, 3],
          },
        },
        array: ["a", "b", "c"],
        nullValue: null,
      };

      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "ComplexTool",
        args: complexArgs,
      };

      const { result } = renderHook(() => usePermissionDialog());

      const callback = mockSkillAPI.onPermissionRequest.mock.calls[0][0];
      act(() => {
        callback(request);
      });

      expect(result.current.currentRequest?.args).toEqual(complexArgs);
    });
  });
});
