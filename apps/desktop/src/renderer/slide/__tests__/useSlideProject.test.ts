/**
 * useSlideProjectフックのユニットテスト
 * @module renderer/slide/__tests__/useSlideProject.test
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlideProject } from "../useSlideProject";
import { useSlideProjectStore } from "../store";

// window.slideApiをモック
const mockSlideApi = {
  startWatching: vi.fn(),
  stopWatching: vi.fn(),
  getSyncStatus: vi.fn(),
  executePhase: vi.fn(),
  manualSync: vi.fn(),
  cancelExecution: vi.fn(),
  onStructureChange: vi.fn((_callback: (data: unknown) => void) => vi.fn()),
  onSyncStatusChange: vi.fn((_callback: (status: string) => void) => vi.fn()),
  onExecutionProgress: vi.fn((_callback: (progress: number) => void) =>
    vi.fn(),
  ),
};

// グローバルwindowオブジェクトにslideApiを追加
beforeEach(() => {
  (globalThis as any).slideApi = mockSlideApi;

  (window as any).slideApi = mockSlideApi;
});

describe("useSlideProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store
    useSlideProjectStore.getState().reset();
    // Reset default mock implementations
    mockSlideApi.startWatching.mockResolvedValue({ success: true });
    mockSlideApi.stopWatching.mockResolvedValue({ success: true });
    mockSlideApi.getSyncStatus.mockResolvedValue({
      success: true,
      data: "synced",
    });
    mockSlideApi.executePhase.mockResolvedValue({
      success: true,
      data: {
        phase: "hearing",
        success: true,
        duration: 1000,
      },
    });
    mockSlideApi.manualSync.mockResolvedValue({ success: true });
    mockSlideApi.cancelExecution.mockResolvedValue({ success: true });
    // Reset event listener mocks to return unsubscribe functions
    mockSlideApi.onStructureChange.mockReturnValue(vi.fn());
    mockSlideApi.onSyncStatusChange.mockReturnValue(vi.fn());
    mockSlideApi.onExecutionProgress.mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initial state", () => {
    it("should return correct initial values", () => {
      const { result } = renderHook(() => useSlideProject());

      expect(result.current.project).toBeNull();
      expect(result.current.syncStatus).toBe("synced");
      expect(result.current.currentPhase).toBe("idle");
      expect(result.current.isWatching).toBe(false);
      expect(result.current.executionProgress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.isExecuting).toBe(false);
      expect(result.current.hasProject).toBe(false);
    });
  });

  describe("openProject", () => {
    it("should open project and start watching", async () => {
      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.openProject("/test/project");
      });

      expect(mockSlideApi.startWatching).toHaveBeenCalledWith("/test/project");
      expect(result.current.project).toEqual({ path: "/test/project" });
      expect(result.current.isWatching).toBe(true);
      expect(result.current.hasProject).toBe(true);
    });

    it("should fetch initial sync status", async () => {
      mockSlideApi.getSyncStatus.mockResolvedValue({
        success: true,
        data: "out-of-sync",
      });

      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.openProject("/test/project");
      });

      expect(mockSlideApi.getSyncStatus).toHaveBeenCalledWith("/test/project");
      expect(result.current.syncStatus).toBe("out-of-sync");
    });

    it("should handle start watching failure", async () => {
      mockSlideApi.startWatching.mockResolvedValue({
        success: false,
        error: { message: "Watch failed" },
      });

      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.openProject("/test/project");
      });

      expect(result.current.error).toBe("Watch failed");
      expect(result.current.isWatching).toBe(false);
    });

    it("should handle exception during open", async () => {
      mockSlideApi.startWatching.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.openProject("/test/project");
      });

      expect(result.current.error).toBe("Network error");
    });
  });

  describe("closeProject", () => {
    it("should close project and stop watching", async () => {
      const { result } = renderHook(() => useSlideProject());

      // First open a project
      await act(async () => {
        await result.current.openProject("/test/project");
      });

      // Then close it
      await act(async () => {
        await result.current.closeProject();
      });

      expect(mockSlideApi.stopWatching).toHaveBeenCalled();
      expect(result.current.project).toBeNull();
      expect(result.current.hasProject).toBe(false);
    });

    it("should reset state on close", async () => {
      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.openProject("/test/project");
        await result.current.closeProject();
      });

      expect(result.current.isWatching).toBe(false);
      expect(result.current.syncStatus).toBe("synced");
      expect(result.current.currentPhase).toBe("idle");
    });
  });

  describe("executePhase", () => {
    it("should execute skill phase successfully", async () => {
      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.openProject("/test/project");
      });

      let executionResult;
      await act(async () => {
        executionResult = await result.current.executePhase("hearing");
      });

      expect(mockSlideApi.executePhase).toHaveBeenCalledWith(
        "hearing",
        "/test/project",
      );
      expect(executionResult).toEqual({
        phase: "hearing",
        success: true,
        duration: 1000,
      });
    });

    it("should return null when no project is open", async () => {
      const { result } = renderHook(() => useSlideProject());

      let executionResult;
      await act(async () => {
        executionResult = await result.current.executePhase("hearing");
      });

      expect(executionResult).toBeNull();
      expect(result.current.error).toBe("No project is open");
    });

    it("should handle execution failure", async () => {
      mockSlideApi.executePhase.mockResolvedValue({
        success: false,
        error: { message: "Execution failed" },
      });

      const { result } = renderHook(() => useSlideProject());

      // Open project first, then execute separately to allow store update
      await act(async () => {
        await result.current.openProject("/test/project");
      });

      await act(async () => {
        await result.current.executePhase("hearing");
      });

      expect(result.current.error).toBe("Execution failed");
      expect(result.current.currentPhase).toBe("idle");
    });

    it("should handle execution exception", async () => {
      mockSlideApi.executePhase.mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() => useSlideProject());

      // Open project first, then execute separately to allow store update
      await act(async () => {
        await result.current.openProject("/test/project");
      });

      await act(async () => {
        await result.current.executePhase("hearing");
      });

      expect(result.current.error).toBe("API error");
      expect(result.current.currentPhase).toBe("idle");
    });
  });

  describe("manualSync", () => {
    it("should perform manual sync", async () => {
      const { result } = renderHook(() => useSlideProject());

      // Open project first, then sync separately to allow store update
      await act(async () => {
        await result.current.openProject("/test/project");
      });

      await act(async () => {
        await result.current.manualSync();
      });

      expect(mockSlideApi.manualSync).toHaveBeenCalledWith("/test/project");
      expect(result.current.syncStatus).toBe("synced");
    });

    it("should handle sync failure", async () => {
      mockSlideApi.manualSync.mockResolvedValue({
        success: false,
        error: { message: "Sync failed" },
      });

      const { result } = renderHook(() => useSlideProject());

      // Open project first, then sync separately to allow store update
      await act(async () => {
        await result.current.openProject("/test/project");
      });

      await act(async () => {
        await result.current.manualSync();
      });

      expect(result.current.error).toBe("Sync failed");
      expect(result.current.syncStatus).toBe("error");
    });

    it("should do nothing when no project is open", async () => {
      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.manualSync();
      });

      expect(mockSlideApi.manualSync).not.toHaveBeenCalled();
    });
  });

  describe("cancelExecution", () => {
    it("should cancel execution", async () => {
      const { result } = renderHook(() => useSlideProject());

      await act(async () => {
        await result.current.cancelExecution();
      });

      expect(mockSlideApi.cancelExecution).toHaveBeenCalled();
      expect(result.current.currentPhase).toBe("idle");
    });
  });

  describe("event listeners", () => {
    it("should subscribe to events on mount", () => {
      renderHook(() => useSlideProject());

      expect(mockSlideApi.onStructureChange).toHaveBeenCalled();
      expect(mockSlideApi.onSyncStatusChange).toHaveBeenCalled();
      expect(mockSlideApi.onExecutionProgress).toHaveBeenCalled();
    });

    it("should unsubscribe from events on unmount", () => {
      const unsubscribeMock = vi.fn();
      mockSlideApi.onStructureChange.mockReturnValue(unsubscribeMock);
      mockSlideApi.onSyncStatusChange.mockReturnValue(unsubscribeMock);
      mockSlideApi.onExecutionProgress.mockReturnValue(unsubscribeMock);

      const { unmount } = renderHook(() => useSlideProject());

      unmount();

      expect(unsubscribeMock).toHaveBeenCalledTimes(3);
    });

    it("should update sync status on sync status change event", async () => {
      let syncStatusCallback: (status: string) => void = vi.fn();
      mockSlideApi.onSyncStatusChange.mockImplementation((callback: any) => {
        syncStatusCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useSlideProject());

      act(() => {
        syncStatusCallback("out-of-sync");
      });

      expect(result.current.syncStatus).toBe("out-of-sync");
    });

    it("should update progress on execution progress event", () => {
      let progressCallback: (progress: number) => void = vi.fn();
      mockSlideApi.onExecutionProgress.mockImplementation((callback: any) => {
        progressCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useSlideProject());

      act(() => {
        progressCallback(50);
      });

      expect(result.current.executionProgress).toBe(50);
    });
  });
});
