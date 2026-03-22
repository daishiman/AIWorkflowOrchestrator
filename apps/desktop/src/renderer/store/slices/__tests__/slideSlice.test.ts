/**
 * slideSlice のユニットテスト
 * Wave C: スライド機能の Renderer 側状態管理をテスト
 * @module renderer/store/slices/__tests__/slideSlice.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useSlideStore,
  useSlideSyncStatus,
  useSlideIsWatching,
  useSlideSyncDirection,
  useSlideIsHandoff,
  useSlideSyncProgress,
  useSlideSyncError,
  useSlideHandoffGuidance,
} from "../slideSlice";
import type { SyncStatus, SyncDirection, HandoffGuidance } from "@repo/shared";

// ============================================================================
// Tests
// ============================================================================

describe("slideSlice", () => {
  beforeEach(() => {
    // Reset store to initial state before each test (P9 prevention)
    useSlideStore.setState({
      syncStatus: "synced",
      isWatching: false,
      syncDirection: "forward",
      syncProgress: null,
      syncError: null,
      isHandoff: false,
      handoffGuidance: null,
    });
  });

  // ==========================================================================
  // Initial values
  // ==========================================================================
  describe("initial values", () => {
    it("should have syncStatus as 'synced'", () => {
      const state = useSlideStore.getState();
      expect(state.syncStatus).toBe("synced");
    });

    it("should have isWatching as false", () => {
      const state = useSlideStore.getState();
      expect(state.isWatching).toBe(false);
    });

    it("should have syncDirection as 'forward'", () => {
      const state = useSlideStore.getState();
      expect(state.syncDirection).toBe("forward");
    });

    it("should have syncProgress as null", () => {
      const state = useSlideStore.getState();
      expect(state.syncProgress).toBeNull();
    });

    it("should have syncError as null", () => {
      const state = useSlideStore.getState();
      expect(state.syncError).toBeNull();
    });

    it("should have isHandoff as false", () => {
      const state = useSlideStore.getState();
      expect(state.isHandoff).toBe(false);
    });

    it("should have handoffGuidance as null", () => {
      const state = useSlideStore.getState();
      expect(state.handoffGuidance).toBeNull();
    });
  });

  // ==========================================================================
  // Actions: setSyncStatus
  // ==========================================================================
  describe("setSyncStatus", () => {
    it("should update syncStatus to 'syncing'", () => {
      useSlideStore.getState().setSyncStatus("syncing");
      expect(useSlideStore.getState().syncStatus).toBe("syncing");
    });

    it("should update syncStatus to 'out-of-sync'", () => {
      useSlideStore.getState().setSyncStatus("out-of-sync");
      expect(useSlideStore.getState().syncStatus).toBe("out-of-sync");
    });

    it("should update syncStatus to 'error'", () => {
      useSlideStore.getState().setSyncStatus("error");
      expect(useSlideStore.getState().syncStatus).toBe("error");
    });

    const allStatuses: SyncStatus[] = [
      "synced",
      "out-of-sync",
      "syncing",
      "error",
    ];
    for (const status of allStatuses) {
      it(`should accept valid SyncStatus: ${status}`, () => {
        useSlideStore.getState().setSyncStatus(status);
        expect(useSlideStore.getState().syncStatus).toBe(status);
      });
    }
  });

  // ==========================================================================
  // Actions: setIsWatching
  // ==========================================================================
  describe("setIsWatching", () => {
    it("should update isWatching to true", () => {
      useSlideStore.getState().setIsWatching(true);
      expect(useSlideStore.getState().isWatching).toBe(true);
    });

    it("should update isWatching to false", () => {
      useSlideStore.getState().setIsWatching(true);
      useSlideStore.getState().setIsWatching(false);
      expect(useSlideStore.getState().isWatching).toBe(false);
    });
  });

  // ==========================================================================
  // Actions: setSyncDirection
  // ==========================================================================
  describe("setSyncDirection", () => {
    it("should update syncDirection to 'reverse'", () => {
      useSlideStore.getState().setSyncDirection("reverse");
      expect(useSlideStore.getState().syncDirection).toBe("reverse");
    });

    it("should update syncDirection to 'forward'", () => {
      useSlideStore.getState().setSyncDirection("reverse");
      useSlideStore.getState().setSyncDirection("forward");
      expect(useSlideStore.getState().syncDirection).toBe("forward");
    });

    const allDirections: SyncDirection[] = ["forward", "reverse"];
    for (const direction of allDirections) {
      it(`should accept valid SyncDirection: ${direction}`, () => {
        useSlideStore.getState().setSyncDirection(direction);
        expect(useSlideStore.getState().syncDirection).toBe(direction);
      });
    }
  });

  // ==========================================================================
  // Actions: setSyncProgress
  // ==========================================================================
  describe("setSyncProgress", () => {
    it("should set sync progress with percent and message", () => {
      const progress = { percent: 50, message: "Processing..." };
      useSlideStore.getState().setSyncProgress(progress);

      const state = useSlideStore.getState();
      expect(state.syncProgress).toEqual(progress);
      expect(state.syncProgress?.percent).toBe(50);
      expect(state.syncProgress?.message).toBe("Processing...");
    });

    it("should clear sync progress with null", () => {
      useSlideStore
        .getState()
        .setSyncProgress({ percent: 75, message: "Almost done" });
      useSlideStore.getState().setSyncProgress(null);

      expect(useSlideStore.getState().syncProgress).toBeNull();
    });

    it("should update progress values", () => {
      useSlideStore
        .getState()
        .setSyncProgress({ percent: 25, message: "Starting..." });
      useSlideStore
        .getState()
        .setSyncProgress({ percent: 100, message: "Complete" });

      const state = useSlideStore.getState();
      expect(state.syncProgress?.percent).toBe(100);
      expect(state.syncProgress?.message).toBe("Complete");
    });
  });

  // ==========================================================================
  // Actions: setSyncError
  // ==========================================================================
  describe("setSyncError", () => {
    it("should set sync error with code and message", () => {
      const error = { code: "SLIDE_E007", message: "Sync failed" };
      useSlideStore.getState().setSyncError(error);

      const state = useSlideStore.getState();
      expect(state.syncError).toEqual(error);
      expect(state.syncError?.code).toBe("SLIDE_E007");
      expect(state.syncError?.message).toBe("Sync failed");
    });

    it("should clear sync error with null", () => {
      useSlideStore
        .getState()
        .setSyncError({ code: "SLIDE_E007", message: "Error" });
      useSlideStore.getState().setSyncError(null);

      expect(useSlideStore.getState().syncError).toBeNull();
    });
  });

  // ==========================================================================
  // Actions: setHandoffGuidance
  // ==========================================================================
  describe("setHandoffGuidance", () => {
    const mockGuidance: HandoffGuidance = {
      terminalCommand: 'claude --project "/test" --phase hearing',
      contextSummary: "Hearing phase execution",
      reason: "No API key configured",
    };

    it("should set handoffGuidance and isHandoff to true", () => {
      useSlideStore.getState().setHandoffGuidance(mockGuidance);

      const state = useSlideStore.getState();
      expect(state.handoffGuidance).toEqual(mockGuidance);
      expect(state.isHandoff).toBe(true);
    });

    it("should clear handoffGuidance and set isHandoff to false with null", () => {
      useSlideStore.getState().setHandoffGuidance(mockGuidance);
      useSlideStore.getState().setHandoffGuidance(null);

      const state = useSlideStore.getState();
      expect(state.handoffGuidance).toBeNull();
      expect(state.isHandoff).toBe(false);
    });

    it("should expose terminalCommand, contextSummary, and reason", () => {
      useSlideStore.getState().setHandoffGuidance(mockGuidance);

      const state = useSlideStore.getState();
      expect(state.handoffGuidance?.terminalCommand).toBe(
        mockGuidance.terminalCommand,
      );
      expect(state.handoffGuidance?.contextSummary).toBe(
        mockGuidance.contextSummary,
      );
      expect(state.handoffGuidance?.reason).toBe(mockGuidance.reason);
    });
  });

  // ==========================================================================
  // Actions: clearHandoff
  // ==========================================================================
  describe("clearHandoff", () => {
    it("should clear isHandoff and handoffGuidance", () => {
      // Set handoff state first
      useSlideStore.getState().setHandoffGuidance({
        terminalCommand: "claude --project /test",
        contextSummary: "Test",
        reason: "Test reason",
      });

      expect(useSlideStore.getState().isHandoff).toBe(true);

      // Clear
      useSlideStore.getState().clearHandoff();

      const state = useSlideStore.getState();
      expect(state.isHandoff).toBe(false);
      expect(state.handoffGuidance).toBeNull();
    });

    it("should be safe to call when already cleared", () => {
      useSlideStore.getState().clearHandoff();

      const state = useSlideStore.getState();
      expect(state.isHandoff).toBe(false);
      expect(state.handoffGuidance).toBeNull();
    });
  });

  // ==========================================================================
  // Individual selectors
  // ==========================================================================
  describe("individual selectors", () => {
    it("useSlideSyncStatus should return syncStatus", () => {
      useSlideStore.getState().setSyncStatus("syncing");

      const { result } = renderHook(() => useSlideSyncStatus());
      expect(result.current).toBe("syncing");
    });

    it("useSlideIsWatching should return isWatching", () => {
      useSlideStore.getState().setIsWatching(true);

      const { result } = renderHook(() => useSlideIsWatching());
      expect(result.current).toBe(true);
    });

    it("useSlideSyncDirection should return syncDirection", () => {
      useSlideStore.getState().setSyncDirection("reverse");

      const { result } = renderHook(() => useSlideSyncDirection());
      expect(result.current).toBe("reverse");
    });

    it("useSlideIsHandoff should return isHandoff", () => {
      useSlideStore.getState().setHandoffGuidance({
        terminalCommand: "cmd",
        contextSummary: "summary",
        reason: "reason",
      });

      const { result } = renderHook(() => useSlideIsHandoff());
      expect(result.current).toBe(true);
    });

    it("useSlideSyncProgress should return syncProgress", () => {
      const progress = { percent: 42, message: "Working..." };
      useSlideStore.getState().setSyncProgress(progress);

      const { result } = renderHook(() => useSlideSyncProgress());
      expect(result.current).toEqual(progress);
    });

    it("useSlideSyncError should return syncError", () => {
      const error = { code: "SLIDE_E001", message: "Error" };
      useSlideStore.getState().setSyncError(error);

      const { result } = renderHook(() => useSlideSyncError());
      expect(result.current).toEqual(error);
    });

    it("useSlideHandoffGuidance should return handoffGuidance", () => {
      const guidance: HandoffGuidance = {
        terminalCommand: "claude --project /test",
        contextSummary: "Test context",
        reason: "Test reason",
      };
      useSlideStore.getState().setHandoffGuidance(guidance);

      const { result } = renderHook(() => useSlideHandoffGuidance());
      expect(result.current).toEqual(guidance);
    });

    it("selectors should update when state changes", () => {
      const { result: statusResult } = renderHook(() => useSlideSyncStatus());
      expect(statusResult.current).toBe("synced");

      act(() => {
        useSlideStore.getState().setSyncStatus("error");
      });

      expect(statusResult.current).toBe("error");
    });
  });
});
