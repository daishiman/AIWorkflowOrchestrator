/**
 * @vitest-environment happy-dom
 *
 * useSkillPermission Hook Tests
 *
 * TASK-3-1-D: Tests for the useSkillPermission hook
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useSkillPermission
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSkillPermission } from "../useSkillPermission";
import type { SkillPermissionRequest } from "@repo/shared/types/skill";

// Mock skillAPI
const mockOnPermission = vi.fn();
const mockRespondPermission = vi.fn();

const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
  onPermission: mockOnPermission,
  respondPermission: mockRespondPermission,
};

describe("useSkillPermission", () => {
  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    mockOnPermission.mockReturnValue(vi.fn());
    mockRespondPermission.mockResolvedValue(true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with null pendingPermission", () => {
      const { result } = renderHook(() => useSkillPermission());

      expect(result.current.pendingPermission).toBeNull();
    });

    it("should register permission listener on mount", () => {
      renderHook(() => useSkillPermission());

      expect(mockOnPermission).toHaveBeenCalledTimes(1);
      expect(mockOnPermission).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should cleanup permission listener on unmount", () => {
      const cleanup = vi.fn();
      mockOnPermission.mockReturnValue(cleanup);

      const { unmount } = renderHook(() => useSkillPermission());
      unmount();

      expect(cleanup).toHaveBeenCalled();
    });

    it("should handle missing skillAPI gracefully", () => {
      vi.stubGlobal("skillAPI", undefined);

      const { result } = renderHook(() => useSkillPermission());

      expect(result.current.pendingPermission).toBeNull();
      expect(mockOnPermission).not.toHaveBeenCalled();
    });

    it("should handle missing onPermission method", () => {
      vi.stubGlobal("skillAPI", { ...mockSkillAPI, onPermission: undefined });

      const { result } = renderHook(() => useSkillPermission());

      expect(result.current.pendingPermission).toBeNull();
    });
  });

  describe("permission request handling", () => {
    it("should update pendingPermission when request is received", () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      const mockRequest: SkillPermissionRequest = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "echo test" },
        reason: "Test command",
      };

      act(() => {
        capturedCallback?.(mockRequest);
      });

      expect(result.current.pendingPermission).toEqual(mockRequest);
    });

    it("should handle multiple sequential requests", () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      const request1: SkillPermissionRequest = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "cmd1" },
      };

      const request2: SkillPermissionRequest = {
        executionId: "exec-002",
        requestId: "req-002",
        toolName: "Write",
        args: { path: "/tmp/test.txt" },
      };

      act(() => {
        capturedCallback?.(request1);
      });
      expect(result.current.pendingPermission).toEqual(request1);

      act(() => {
        capturedCallback?.(request2);
      });
      expect(result.current.pendingPermission).toEqual(request2);
    });
  });

  describe("handleApprove", () => {
    it("should call respondPermission with approved=true", async () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      const mockRequest: SkillPermissionRequest = {
        executionId: "exec-001",
        requestId: "req-approve-001",
        toolName: "Bash",
        args: { command: "echo test" },
      };

      act(() => {
        capturedCallback?.(mockRequest);
      });

      await act(async () => {
        result.current.handleApprove(false);
      });

      expect(mockRespondPermission).toHaveBeenCalledWith({
        requestId: "req-approve-001",
        approved: true,
        rememberChoice: false,
      });
    });

    it("should pass rememberChoice=true when specified", async () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-remember",
          toolName: "Bash",
          args: {},
        });
      });

      await act(async () => {
        result.current.handleApprove(true);
      });

      expect(mockRespondPermission).toHaveBeenCalledWith({
        requestId: "req-remember",
        approved: true,
        rememberChoice: true,
      });
    });

    it("should clear pendingPermission after approval", async () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-clear",
          toolName: "Bash",
          args: {},
        });
      });

      expect(result.current.pendingPermission).not.toBeNull();

      await act(async () => {
        result.current.handleApprove(false);
      });

      expect(result.current.pendingPermission).toBeNull();
    });

    it("should do nothing if no pending permission", async () => {
      const { result } = renderHook(() => useSkillPermission());

      await act(async () => {
        result.current.handleApprove(false);
      });

      expect(mockRespondPermission).not.toHaveBeenCalled();
    });

    it("should handle IPC error gracefully", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockRespondPermission.mockRejectedValue(new Error("IPC failed"));

      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-error",
          toolName: "Bash",
          args: {},
        });
      });

      await act(async () => {
        result.current.handleApprove(false);
        // Wait for promise rejection to be handled
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(consoleError).toHaveBeenCalledWith(
        "[useSkillPermission] Failed to respond:",
        expect.any(Error),
      );

      consoleError.mockRestore();
    });
  });

  describe("handleDeny", () => {
    it("should call respondPermission with approved=false", async () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-deny-001",
          toolName: "Bash",
          args: { command: "rm -rf /" },
        });
      });

      await act(async () => {
        result.current.handleDeny(false);
      });

      expect(mockRespondPermission).toHaveBeenCalledWith({
        requestId: "req-deny-001",
        approved: false,
        rememberChoice: false,
      });
    });

    it("should pass rememberChoice=true when specified", async () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-deny-remember",
          toolName: "Bash",
          args: {},
        });
      });

      await act(async () => {
        result.current.handleDeny(true);
      });

      expect(mockRespondPermission).toHaveBeenCalledWith({
        requestId: "req-deny-remember",
        approved: false,
        rememberChoice: true,
      });
    });

    it("should clear pendingPermission after denial", async () => {
      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-clear-deny",
          toolName: "Bash",
          args: {},
        });
      });

      expect(result.current.pendingPermission).not.toBeNull();

      await act(async () => {
        result.current.handleDeny(false);
      });

      expect(result.current.pendingPermission).toBeNull();
    });

    it("should do nothing if no pending permission", async () => {
      const { result } = renderHook(() => useSkillPermission());

      await act(async () => {
        result.current.handleDeny(false);
      });

      expect(mockRespondPermission).not.toHaveBeenCalled();
    });

    it("should handle IPC error gracefully", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockRespondPermission.mockRejectedValue(new Error("IPC failed"));

      let capturedCallback: ((request: SkillPermissionRequest) => void) | null =
        null;
      mockOnPermission.mockImplementation((cb) => {
        capturedCallback = cb;
        return vi.fn();
      });

      const { result } = renderHook(() => useSkillPermission());

      act(() => {
        capturedCallback?.({
          executionId: "exec-001",
          requestId: "req-deny-error",
          toolName: "Bash",
          args: {},
        });
      });

      await act(async () => {
        result.current.handleDeny(false);
        // Wait for promise rejection to be handled
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(consoleError).toHaveBeenCalledWith(
        "[useSkillPermission] Failed to respond:",
        expect.any(Error),
      );

      consoleError.mockRestore();
    });
  });
});
