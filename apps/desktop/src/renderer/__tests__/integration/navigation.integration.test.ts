import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../../store";

describe("Navigation Integration - agent view", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.getState().setCurrentView("dashboard");
    useAppStore.getState().resetAgentState();
  });

  describe("ビュー遷移", () => {
    it("should navigate from dashboard to agent view", () => {
      // Start from dashboard
      useAppStore.getState().setCurrentView("dashboard");
      expect(useAppStore.getState().currentView).toBe("dashboard");

      // Navigate to agent
      useAppStore.getState().setCurrentView("agent");
      expect(useAppStore.getState().currentView).toBe("agent");
    });

    it("should navigate from agent view to dashboard", () => {
      // Start from agent
      useAppStore.getState().setCurrentView("agent");
      expect(useAppStore.getState().currentView).toBe("agent");

      // Navigate to dashboard
      useAppStore.getState().setCurrentView("dashboard");
      expect(useAppStore.getState().currentView).toBe("dashboard");
    });

    it("should navigate from agent view to editor", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setCurrentView("editor");
      expect(useAppStore.getState().currentView).toBe("editor");
    });

    it("should navigate from agent view to chat", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setCurrentView("chat");
      expect(useAppStore.getState().currentView).toBe("chat");
    });

    it("should navigate from agent view to graph", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setCurrentView("graph");
      expect(useAppStore.getState().currentView).toBe("graph");
    });

    it("should navigate from agent view to settings", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setCurrentView("settings");
      expect(useAppStore.getState().currentView).toBe("settings");
    });
  });

  describe("状態保持", () => {
    it("should preserve agent state during navigation to other views", () => {
      // Set up agent state
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setSkills([
        {
          id: "skill-1",
          name: "Test Skill",
          slug: "test-skill",
          description: "Description",
          path: "/path",
          triggers: ["test"],
          anchors: [],
        },
      ]);
      useAppStore.getState().setSkillFilter("test");

      // Navigate away
      useAppStore.getState().setCurrentView("dashboard");
      expect(useAppStore.getState().currentView).toBe("dashboard");

      // Verify agent state is preserved
      expect(useAppStore.getState().skills).toHaveLength(1);
      expect(useAppStore.getState().skillFilter).toBe("test");

      // Navigate back
      useAppStore.getState().setCurrentView("agent");
      expect(useAppStore.getState().skills[0].name).toBe("Test Skill");
    });

    it("should preserve selected skill during navigation", () => {
      const skill = {
        id: "skill-1",
        name: "Test Skill",
        slug: "test-skill",
        description: "Description",
        path: "/path",
        triggers: ["test"],
        anchors: [],
      };

      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setSkills([skill]);
      useAppStore.getState().selectSkill(skill);

      // Navigate away and back
      useAppStore.getState().setCurrentView("editor");
      useAppStore.getState().setCurrentView("agent");

      expect(useAppStore.getState().selectedSkill).toEqual(skill);
    });

    it("should preserve execution state during navigation", () => {
      useAppStore.getState().setCurrentView("agent");
      useAppStore.getState().setExecutionStatus("executing");
      useAppStore.getState().setCurrentExecutionId("exec-123");
      useAppStore.getState().appendOutput("Running...");

      // Navigate away
      useAppStore.getState().setCurrentView("dashboard");

      // Verify execution state is preserved
      expect(useAppStore.getState().executionStatus).toBe("executing");
      expect(useAppStore.getState().currentExecutionId).toBe("exec-123");
      expect(useAppStore.getState().executionOutput).toContain("Running...");
    });
  });

  describe("連続遷移", () => {
    it("should handle rapid view changes", () => {
      const views = [
        "dashboard",
        "agent",
        "editor",
        "agent",
        "chat",
        "agent",
        "graph",
        "agent",
        "settings",
        "agent",
      ] as const;

      for (const view of views) {
        useAppStore.getState().setCurrentView(view);
      }

      expect(useAppStore.getState().currentView).toBe("agent");
    });

    it("should handle multiple navigation cycles", () => {
      for (let i = 0; i < 10; i++) {
        useAppStore.getState().setCurrentView("dashboard");
        useAppStore.getState().setCurrentView("agent");
      }

      expect(useAppStore.getState().currentView).toBe("agent");
    });
  });

  describe("ViewType一貫性", () => {
    it("should accept 'agent' as valid ViewType", () => {
      // This should not throw
      useAppStore.getState().setCurrentView("agent");
      expect(useAppStore.getState().currentView).toBe("agent");
    });

    it("should list agent in all views cycle", () => {
      const allViews = [
        "dashboard",
        "editor",
        "chat",
        "graph",
        "settings",
        "agent",
      ] as const;

      for (const view of allViews) {
        useAppStore.getState().setCurrentView(view);
        expect(useAppStore.getState().currentView).toBe(view);
      }
    });
  });
});
