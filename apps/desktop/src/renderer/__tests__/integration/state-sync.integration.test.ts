import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../../store";

describe("State Sync - agent slice", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.getState().setCurrentView("dashboard");
    useAppStore.getState().resetAgentState();
  });

  describe("agentSliceとnavigationSliceの連携", () => {
    it("should sync agent state with navigation", () => {
      // Navigate to agent view
      useAppStore.getState().setCurrentView("agent");
      expect(useAppStore.getState().currentView).toBe("agent");

      // Set agent state
      useAppStore.getState().setLoading(true);
      expect(useAppStore.getState().isLoading).toBe(true);

      // Verify both states are accessible
      expect(useAppStore.getState().currentView).toBe("agent");
      expect(useAppStore.getState().isLoading).toBe(true);
    });

    it("should persist skill selection across view changes", () => {
      const skill = {
        id: "skill-1",
        name: "Persistent Skill",
        slug: "persistent-skill",
        description: "Should persist",
        path: "/path",
        triggers: ["test"],
        anchors: [],
      };

      // Set up in agent view
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setSkills([skill]);
      useAppStore.getState().selectSkill(skill);

      // Change to multiple views
      useAppStore.getState().setCurrentView("dashboard");
      useAppStore.getState().setCurrentView("editor");
      useAppStore.getState().setCurrentView("chat");

      // Verify selection persists
      expect(useAppStore.getState().selectedSkill).toEqual(skill);
    });

    it("should maintain execution state across navigation", () => {
      // Start execution in agent view
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setExecutionStatus("executing");
      useAppStore.getState().setCurrentExecutionId("exec-456");
      useAppStore.getState().appendOutput("Step 1");
      useAppStore.getState().appendOutput("Step 2");

      // Navigate through views
      useAppStore.getState().setCurrentView("graph");
      useAppStore.getState().setCurrentView("settings");
      useAppStore.getState().setCurrentView("dashboard");

      // Verify execution state is intact
      expect(useAppStore.getState().executionStatus).toBe("executing");
      expect(useAppStore.getState().currentExecutionId).toBe("exec-456");
      expect(useAppStore.getState().executionOutput).toEqual([
        "Step 1",
        "Step 2",
      ]);
    });
  });

  describe("状態独立性", () => {
    it("should not affect navigation when agent state changes", () => {
      useAppStore.getState().setCurrentView("agent");
      const initialView = useAppStore.getState().currentView;

      // Change agent state
      useAppStore.getState().setSkills([
        {
          id: "skill-1",
          name: "Test",
          slug: "test",
          description: "Test",
          path: "/path",
          triggers: [],
          anchors: [],
        },
      ]);
      useAppStore.getState().setSkillFilter("test");
      useAppStore.getState().setLoading(true);
      useAppStore.getState().setError("test error");

      // View should not change
      expect(useAppStore.getState().currentView).toBe(initialView);
    });

    it("should not affect agent state when navigating", () => {
      const skill = {
        id: "skill-1",
        name: "Stable Skill",
        slug: "stable-skill",
        description: "Should not change",
        path: "/path",
        triggers: ["stable"],
        anchors: [],
      };

      // Set up agent state
      useAppStore.getState().setSkills([skill]);
      useAppStore.getState().selectSkill(skill);
      useAppStore.getState().setSkillFilter("stable");

      // Navigate rapidly
      const views = [
        "dashboard",
        "editor",
        "chat",
        "graph",
        "settings",
      ] as const;
      for (const view of views) {
        useAppStore.getState().setCurrentView(view);
      }

      // Verify agent state unchanged
      expect(useAppStore.getState().skills).toHaveLength(1);
      expect(useAppStore.getState().selectedSkill).toEqual(skill);
      expect(useAppStore.getState().skillFilter).toBe("stable");
    });
  });

  describe("リセット動作", () => {
    it("should reset agent state without affecting navigation", () => {
      // Set up state
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setSkills([
        {
          id: "skill-1",
          name: "Test",
          slug: "test",
          description: "Test",
          path: "/path",
          triggers: [],
          anchors: [],
        },
      ]);
      useAppStore.getState().setExecutionStatus("executing");

      // Reset agent state
      useAppStore.getState().resetAgentState();

      // View should remain
      expect(useAppStore.getState().currentView).toBe("agent");
      // Agent state should be reset
      expect(useAppStore.getState().skills).toEqual([]);
      expect(useAppStore.getState().executionStatus).toBe("idle");
    });

    it("should clear execution without affecting skills", () => {
      const skill = {
        id: "skill-1",
        name: "Preserved Skill",
        slug: "preserved-skill",
        description: "Should remain",
        path: "/path",
        triggers: [],
        anchors: [],
      };

      // Set up state
      useAppStore.getState().setSkills([skill]);
      useAppStore.getState().selectSkill(skill);
      useAppStore.getState().setExecutionStatus("executing");
      useAppStore.getState().setCurrentExecutionId("exec-789");
      useAppStore.getState().appendOutput("Output");

      // Clear execution
      useAppStore.getState().clearExecution();

      // Skills should be preserved
      expect(useAppStore.getState().skills).toHaveLength(1);
      expect(useAppStore.getState().selectedSkill).toEqual(skill);
      // Execution should be cleared
      expect(useAppStore.getState().executionStatus).toBe("idle");
      expect(useAppStore.getState().currentExecutionId).toBeNull();
      expect(useAppStore.getState().executionOutput).toEqual([]);
    });
  });

  describe("同時更新", () => {
    it("should handle simultaneous navigation and agent state updates", () => {
      // Simulate simultaneous updates
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setSkills([
        {
          id: "skill-1",
          name: "Concurrent",
          slug: "concurrent",
          description: "Test",
          path: "/path",
          triggers: [],
          anchors: [],
        },
      ]);

      useAppStore.getState().setCurrentView("dashboard");
      useAppStore.getState().setSkillFilter("concurrent");

      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setLoading(true);

      // All states should be correct
      expect(useAppStore.getState().currentView).toBe("agent");
      expect(useAppStore.getState().skills).toHaveLength(1);
      expect(useAppStore.getState().skillFilter).toBe("concurrent");
      expect(useAppStore.getState().isLoading).toBe(true);
    });

    it("should handle batch updates correctly", () => {
      // Batch-like updates
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setSkills([
        {
          id: "s1",
          name: "Skill 1",
          slug: "skill-1",
          description: "D1",
          path: "/p1",
          triggers: [],
          anchors: [],
        },
        {
          id: "s2",
          name: "Skill 2",
          slug: "skill-2",
          description: "D2",
          path: "/p2",
          triggers: [],
          anchors: [],
        },
      ]);
      useAppStore.getState().selectSkill({
        id: "s1",
        name: "Skill 1",
        slug: "skill-1",
        description: "D1",
        path: "/p1",
        triggers: [],
        anchors: [],
      });
      useAppStore.getState().setSkillFilter("Skill");
      useAppStore.getState().setSkillCategory("testing");

      // Verify all updates applied
      expect(useAppStore.getState().skills).toHaveLength(2);
      expect(useAppStore.getState().selectedSkill?.id).toBe("s1");
      expect(useAppStore.getState().skillFilter).toBe("Skill");
      expect(useAppStore.getState().skillCategory).toBe("testing");
    });
  });

  describe("エラー状態連携", () => {
    it("should maintain error state across navigation", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setError("Test error");

      useAppStore.getState().setCurrentView("dashboard");
      useAppStore.getState().setCurrentView("editor");

      expect(useAppStore.getState().error).toBe("Test error");
    });

    it("should allow clearing error from any view", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setError("Error to clear");

      useAppStore.getState().setCurrentView("dashboard");
      useAppStore.getState().setError(null);

      expect(useAppStore.getState().error).toBeNull();
    });
  });
});
