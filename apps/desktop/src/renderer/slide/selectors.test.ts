import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlideProjectStore } from "./store";

const mockUseHandoffGuidance = vi.fn();
vi.mock("../store", () => ({
  useHandoffGuidance: () => mockUseHandoffGuidance(),
}));

import {
  useSyncStatus,
  useIsWatching,
  useProjectPath,
  useExecutionProgress,
  useSlideError,
  useLastSyncAt,
  useCurrentPhase,
  useSlideUIStatus,
} from "./selectors";

describe("Slide selectors", () => {
  beforeEach(() => {
    act(() => {
      useSlideProjectStore.getState().reset();
    });
    mockUseHandoffGuidance.mockReturnValue(null);
  });

  describe("useSyncStatus", () => {
    it("returns initial syncStatus", () => {
      const { result } = renderHook(() => useSyncStatus());
      expect(result.current).toBe("synced");
    });

    it("reflects store changes", () => {
      const { result } = renderHook(() => useSyncStatus());
      act(() => {
        useSlideProjectStore.getState().setSyncStatus("syncing");
      });
      expect(result.current).toBe("syncing");
    });
  });

  describe("useIsWatching", () => {
    it("returns initial isWatching", () => {
      const { result } = renderHook(() => useIsWatching());
      expect(result.current).toBe(false);
    });

    it("reflects store changes", () => {
      const { result } = renderHook(() => useIsWatching());
      act(() => {
        useSlideProjectStore.getState().setWatching(true);
      });
      expect(result.current).toBe(true);
    });
  });

  describe("useProjectPath", () => {
    it("returns initial projectPath", () => {
      const { result } = renderHook(() => useProjectPath());
      expect(result.current).toBeNull();
    });

    it("reflects store changes", () => {
      const { result } = renderHook(() => useProjectPath());
      act(() => {
        useSlideProjectStore.getState().setProject("/test/path");
      });
      expect(result.current).toBe("/test/path");
    });
  });

  describe("useExecutionProgress", () => {
    it("returns initial executionProgress", () => {
      const { result } = renderHook(() => useExecutionProgress());
      expect(result.current).toBe(0);
    });

    it("reflects store changes", () => {
      const { result } = renderHook(() => useExecutionProgress());
      act(() => {
        useSlideProjectStore.getState().setProgress(50);
      });
      expect(result.current).toBe(50);
    });
  });

  describe("useSlideError", () => {
    it("returns initial error", () => {
      const { result } = renderHook(() => useSlideError());
      expect(result.current).toBeNull();
    });

    it("reflects store changes", () => {
      const { result } = renderHook(() => useSlideError());
      act(() => {
        useSlideProjectStore.getState().setError("test error");
      });
      expect(result.current).toBe("test error");
    });
  });

  describe("useLastSyncAt", () => {
    it("returns initial lastSyncAt", () => {
      const { result } = renderHook(() => useLastSyncAt());
      expect(result.current).toBeNull();
    });
  });

  describe("useCurrentPhase", () => {
    it("returns initial currentPhase", () => {
      const { result } = renderHook(() => useCurrentPhase());
      expect(result.current).toBe("idle");
    });
  });

  describe("useSlideUIStatus", () => {
    it("returns synced when no error and not executing", () => {
      const { result } = renderHook(() => useSlideUIStatus());
      expect(result.current).toBe("synced");
    });

    it("returns running when syncing", () => {
      act(() => {
        useSlideProjectStore.getState().setSyncStatus("syncing");
      });
      const { result } = renderHook(() => useSlideUIStatus());
      expect(result.current).toBe("running");
    });

    it("returns degraded when error exists", () => {
      act(() => {
        useSlideProjectStore.getState().setError("some error");
      });
      const { result } = renderHook(() => useSlideUIStatus());
      expect(result.current).toBe("degraded");
    });

    it("returns running when executing", () => {
      act(() => {
        useSlideProjectStore.getState().setPhase("structure");
      });
      const { result } = renderHook(() => useSlideUIStatus());
      expect(result.current).toBe("running");
    });

    it("returns guidance when handoff guidance exists", () => {
      mockUseHandoffGuidance.mockReturnValue({
        terminalCommand: "claude --resume slide-runtime",
        contextSummary: "continue the slide sync",
        reason: "Claude API キーの設定が必要です",
      });
      const { result } = renderHook(() => useSlideUIStatus());
      expect(result.current).toBe("guidance");
    });
  });
});
