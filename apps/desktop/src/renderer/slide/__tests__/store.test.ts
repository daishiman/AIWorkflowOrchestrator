/**
 * スライドプロジェクトストアのユニットテスト
 * @module renderer/slide/__tests__/store.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import {
  useSlideProjectStore,
  selectIsExecuting,
  selectHasProject,
} from "../store";

describe("useSlideProjectStore", () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useSlideProjectStore.getState().reset();
    });
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useSlideProjectStore.getState();

      expect(state.projectPath).toBeNull();
      expect(state.syncStatus).toBe("synced");
      expect(state.currentPhase).toBe("idle");
      expect(state.lastSyncAt).toBeNull();
      expect(state.isWatching).toBe(false);
      expect(state.executionProgress).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe("setProject", () => {
    it("should set project path", () => {
      const { setProject } = useSlideProjectStore.getState();

      act(() => {
        setProject("/path/to/project");
      });

      const state = useSlideProjectStore.getState();
      expect(state.projectPath).toBe("/path/to/project");
    });

    it("should clear error when setting project", () => {
      const { setError, setProject } = useSlideProjectStore.getState();

      act(() => {
        setError("Previous error");
        setProject("/path/to/project");
      });

      expect(useSlideProjectStore.getState().error).toBeNull();
    });

    it("should allow setting project to null", () => {
      const { setProject } = useSlideProjectStore.getState();

      act(() => {
        setProject("/path/to/project");
        setProject(null);
      });

      expect(useSlideProjectStore.getState().projectPath).toBeNull();
    });
  });

  describe("setSyncStatus", () => {
    it("should set sync status", () => {
      const { setSyncStatus } = useSlideProjectStore.getState();

      act(() => {
        setSyncStatus("out-of-sync");
      });

      expect(useSlideProjectStore.getState().syncStatus).toBe("out-of-sync");
    });

    it("should update lastSyncAt when status is synced", () => {
      const { setSyncStatus } = useSlideProjectStore.getState();

      act(() => {
        setSyncStatus("synced");
      });

      expect(useSlideProjectStore.getState().lastSyncAt).toBeInstanceOf(Date);
    });

    it("should preserve lastSyncAt when status is not synced", () => {
      const { setSyncStatus } = useSlideProjectStore.getState();

      act(() => {
        setSyncStatus("synced");
      });

      const firstSyncAt = useSlideProjectStore.getState().lastSyncAt;

      act(() => {
        setSyncStatus("out-of-sync");
      });

      expect(useSlideProjectStore.getState().lastSyncAt).toBe(firstSyncAt);
    });

    it("should clear error when status is not error", () => {
      const { setError, setSyncStatus } = useSlideProjectStore.getState();

      act(() => {
        setError("Some error");
        setSyncStatus("synced");
      });

      expect(useSlideProjectStore.getState().error).toBeNull();
    });
  });

  describe("setPhase", () => {
    it("should set current phase", () => {
      const { setPhase } = useSlideProjectStore.getState();

      act(() => {
        setPhase("hearing");
      });

      expect(useSlideProjectStore.getState().currentPhase).toBe("hearing");
    });

    it("should reset progress to 0 when phase is idle", () => {
      const { setPhase, setProgress } = useSlideProjectStore.getState();

      act(() => {
        setProgress(50);
        setPhase("idle");
      });

      expect(useSlideProjectStore.getState().executionProgress).toBe(0);
    });

    it("should support all skill phases", () => {
      const { setPhase } = useSlideProjectStore.getState();
      const phases = ["hearing", "structure", "html", "modifier"] as const;

      phases.forEach((phase) => {
        act(() => {
          setPhase(phase);
        });
        expect(useSlideProjectStore.getState().currentPhase).toBe(phase);
      });
    });
  });

  describe("setWatching", () => {
    it("should set watching state to true", () => {
      const { setWatching } = useSlideProjectStore.getState();

      act(() => {
        setWatching(true);
      });

      expect(useSlideProjectStore.getState().isWatching).toBe(true);
    });

    it("should set watching state to false", () => {
      const { setWatching } = useSlideProjectStore.getState();

      act(() => {
        setWatching(true);
        setWatching(false);
      });

      expect(useSlideProjectStore.getState().isWatching).toBe(false);
    });
  });

  describe("setProgress", () => {
    it("should set execution progress", () => {
      const { setProgress } = useSlideProjectStore.getState();

      act(() => {
        setProgress(50);
      });

      expect(useSlideProjectStore.getState().executionProgress).toBe(50);
    });

    it("should allow progress values from 0 to 100", () => {
      const { setProgress } = useSlideProjectStore.getState();

      [0, 25, 50, 75, 100].forEach((progress) => {
        act(() => {
          setProgress(progress);
        });
        expect(useSlideProjectStore.getState().executionProgress).toBe(
          progress,
        );
      });
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      const { setError } = useSlideProjectStore.getState();

      act(() => {
        setError("Test error");
      });

      expect(useSlideProjectStore.getState().error).toBe("Test error");
    });

    it("should set sync status to error when error is set", () => {
      const { setError } = useSlideProjectStore.getState();

      act(() => {
        setError("Test error");
      });

      expect(useSlideProjectStore.getState().syncStatus).toBe("error");
    });

    it("should set sync status to synced when error is cleared", () => {
      const { setError } = useSlideProjectStore.getState();

      act(() => {
        setError("Test error");
        setError(null);
      });

      expect(useSlideProjectStore.getState().syncStatus).toBe("synced");
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      const { setProject, setSyncStatus, setPhase, setWatching, reset } =
        useSlideProjectStore.getState();

      act(() => {
        setProject("/path/to/project");
        setSyncStatus("out-of-sync");
        setPhase("hearing");
        setWatching(true);
        reset();
      });

      const state = useSlideProjectStore.getState();
      expect(state.projectPath).toBeNull();
      expect(state.syncStatus).toBe("synced");
      expect(state.currentPhase).toBe("idle");
      expect(state.isWatching).toBe(false);
    });
  });

  describe("selectors", () => {
    describe("selectIsExecuting", () => {
      it("should return false when phase is idle", () => {
        const state = useSlideProjectStore.getState();
        expect(selectIsExecuting(state)).toBe(false);
      });

      it("should return true when phase is not idle", () => {
        const { setPhase } = useSlideProjectStore.getState();

        act(() => {
          setPhase("hearing");
        });

        const state = useSlideProjectStore.getState();
        expect(selectIsExecuting(state)).toBe(true);
      });
    });

    describe("selectHasProject", () => {
      it("should return false when projectPath is null", () => {
        const state = useSlideProjectStore.getState();
        expect(selectHasProject(state)).toBe(false);
      });

      it("should return true when projectPath is set", () => {
        const { setProject } = useSlideProjectStore.getState();

        act(() => {
          setProject("/path/to/project");
        });

        const state = useSlideProjectStore.getState();
        expect(selectHasProject(state)).toBe(true);
      });
    });
  });
});
