/**
 * agentSlice Handoff State Tests (TDD Red Phase)
 * @module agentSlice.handoff.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "../../index";
import type { HandoffGuidance } from "../../../features/workspace-chat-edit/types";

const mockGuidance: HandoffGuidance = {
  terminalCommand: "claude --continue 'Fix the bug in auth.ts'",
  contextSummary: "auth.ts L45-60, authentication flow refactor",
  reason:
    "This operation requires file system access that is not available in the current environment.",
};

describe("agentSlice Handoff State", () => {
  beforeEach(() => {
    // P9: Store state reset between tests
    const store = useAppStore.getState();
    store.clearHandoffGuidance();
  });

  describe("initial state", () => {
    it("handoffGuidance is null by default", () => {
      const state = useAppStore.getState();
      expect(state.handoffGuidance).toBeNull();
    });
  });

  describe("setHandoffGuidance", () => {
    it("stores guidance object", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setHandoffGuidance(mockGuidance);
      });

      expect(result.current.handoffGuidance).toEqual(mockGuidance);
    });

    it("overwrites previous guidance", () => {
      const { result } = renderHook(() => useAppStore());
      const newGuidance: HandoffGuidance = {
        terminalCommand: "claude --help",
        contextSummary: "General help",
        reason: "Different reason",
      };

      act(() => {
        result.current.setHandoffGuidance(mockGuidance);
      });
      act(() => {
        result.current.setHandoffGuidance(newGuidance);
      });

      expect(result.current.handoffGuidance).toEqual(newGuidance);
    });
  });

  describe("clearHandoffGuidance", () => {
    it("resets guidance to null", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setHandoffGuidance(mockGuidance);
      });
      expect(result.current.handoffGuidance).not.toBeNull();

      act(() => {
        result.current.clearHandoffGuidance();
      });
      expect(result.current.handoffGuidance).toBeNull();
    });
  });

  describe("useHandoffGuidance selector", () => {
    it("returns guidance from individual selector", async () => {
      const { useHandoffGuidance } = await import("../../index");
      const { result: guidanceResult } = renderHook(() => useHandoffGuidance());
      expect(guidanceResult.current).toBeNull();

      act(() => {
        useAppStore.getState().setHandoffGuidance(mockGuidance);
      });

      expect(guidanceResult.current).toEqual(mockGuidance);
    });
  });
});
