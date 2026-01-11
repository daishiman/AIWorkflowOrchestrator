import { describe, it, expect, beforeEach } from "vitest";
import { createAgentSlice, type AgentSlice } from "../agentSlice";
import type { Skill } from "@repo/shared/types/skill";

describe("agentSlice", () => {
  let store: AgentSlice;
  let mockSet: (fn: (state: AgentSlice) => Partial<AgentSlice>) => void;
  let mockGet: () => AgentSlice;

  beforeEach(() => {
    // Create a simple mock store
    const state: Partial<AgentSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<AgentSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };
    mockGet = () => store;

    // Initialize the slice
    store = createAgentSlice(mockSet as never, mockGet as never, {} as never);
  });

  // Mock skill for testing
  const mockSkill: Skill = {
    id: "test-skill-001",
    name: "Test Skill",
    slug: "test-skill",
    description: "A test skill for unit testing",
    path: "/path/to/skill",
    triggers: ["test", "unit"],
    anchors: [],
    category: "testing",
  };

  const mockSkill2: Skill = {
    id: "test-skill-002",
    name: "Another Skill",
    slug: "another-skill",
    description: "Another test skill",
    path: "/path/to/another-skill",
    triggers: ["another"],
    anchors: [],
  };

  describe("初期状態", () => {
    it("should initialize with empty skills array", () => {
      expect(store.skills).toEqual([]);
    });

    it("should initialize with isLoading false", () => {
      expect(store.isLoading).toBe(false);
    });

    it("should initialize with error null", () => {
      expect(store.error).toBeNull();
    });

    it("should initialize with idle execution status", () => {
      expect(store.executionStatus).toBe("idle");
    });

    it("should initialize with selectedSkill null", () => {
      expect(store.selectedSkill).toBeNull();
    });

    it("should initialize with empty skillFilter", () => {
      expect(store.skillFilter).toBe("");
    });

    it("should initialize with skillCategory null", () => {
      expect(store.skillCategory).toBeNull();
    });

    it("should initialize with currentExecutionId null", () => {
      expect(store.currentExecutionId).toBeNull();
    });

    it("should initialize with empty executionOutput", () => {
      expect(store.executionOutput).toEqual([]);
    });
  });

  describe("スキル操作", () => {
    it("should set skills", () => {
      store.setSkills([mockSkill, mockSkill2]);
      expect(store.skills).toEqual([mockSkill, mockSkill2]);
    });

    it("should set skills to empty array", () => {
      store.setSkills([mockSkill]);
      store.setSkills([]);
      expect(store.skills).toEqual([]);
    });

    it("should select skill", () => {
      store.selectSkill(mockSkill);
      expect(store.selectedSkill).toEqual(mockSkill);
    });

    it("should clear selected skill", () => {
      store.selectSkill(mockSkill);
      store.selectSkill(null);
      expect(store.selectedSkill).toBeNull();
    });

    it("should set skill filter", () => {
      store.setSkillFilter("test");
      expect(store.skillFilter).toBe("test");
    });

    it("should set skill filter to empty string", () => {
      store.setSkillFilter("test");
      store.setSkillFilter("");
      expect(store.skillFilter).toBe("");
    });

    it("should set skill category", () => {
      store.setSkillCategory("testing");
      expect(store.skillCategory).toBe("testing");
    });

    it("should clear skill category", () => {
      store.setSkillCategory("testing");
      store.setSkillCategory(null);
      expect(store.skillCategory).toBeNull();
    });
  });

  describe("実行操作", () => {
    it("should set execution status to executing", () => {
      store.setExecutionStatus("executing");
      expect(store.executionStatus).toBe("executing");
    });

    it("should set execution status to completed", () => {
      store.setExecutionStatus("completed");
      expect(store.executionStatus).toBe("completed");
    });

    it("should set execution status to error", () => {
      store.setExecutionStatus("error");
      expect(store.executionStatus).toBe("error");
    });

    it("should set execution status to aborted", () => {
      store.setExecutionStatus("aborted");
      expect(store.executionStatus).toBe("aborted");
    });

    it("should set current execution id", () => {
      store.setCurrentExecutionId("exec-123");
      expect(store.currentExecutionId).toBe("exec-123");
    });

    it("should clear current execution id", () => {
      store.setCurrentExecutionId("exec-123");
      store.setCurrentExecutionId(null);
      expect(store.currentExecutionId).toBeNull();
    });

    it("should append output", () => {
      store.appendOutput("Line 1");
      expect(store.executionOutput).toEqual(["Line 1"]);
    });

    it("should append multiple outputs", () => {
      store.appendOutput("Line 1");
      store.appendOutput("Line 2");
      store.appendOutput("Line 3");
      expect(store.executionOutput).toEqual(["Line 1", "Line 2", "Line 3"]);
    });

    it("should clear execution", () => {
      store.setExecutionStatus("executing");
      store.setCurrentExecutionId("exec-123");
      store.appendOutput("Output");
      store.clearExecution();
      expect(store.executionStatus).toBe("idle");
      expect(store.currentExecutionId).toBeNull();
      expect(store.executionOutput).toEqual([]);
    });
  });

  describe("共通操作", () => {
    it("should set loading state to true", () => {
      store.setLoading(true);
      expect(store.isLoading).toBe(true);
    });

    it("should set loading state to false", () => {
      store.setLoading(true);
      store.setLoading(false);
      expect(store.isLoading).toBe(false);
    });

    it("should set error", () => {
      store.setError("Something went wrong");
      expect(store.error).toBe("Something went wrong");
    });

    it("should clear error", () => {
      store.setError("Something went wrong");
      store.setError(null);
      expect(store.error).toBeNull();
    });

    it("should reset agent state", () => {
      // Set various states
      store.setSkills([mockSkill]);
      store.selectSkill(mockSkill);
      store.setSkillFilter("test");
      store.setSkillCategory("testing");
      store.setExecutionStatus("executing");
      store.setCurrentExecutionId("exec-123");
      store.appendOutput("Output");
      store.setLoading(true);
      store.setError("Error");

      // Reset
      store.resetAgentState();

      // Verify all reset to initial state
      expect(store.skills).toEqual([]);
      expect(store.selectedSkill).toBeNull();
      expect(store.skillFilter).toBe("");
      expect(store.skillCategory).toBeNull();
      expect(store.executionStatus).toBe("idle");
      expect(store.currentExecutionId).toBeNull();
      expect(store.executionOutput).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe("境界値テスト", () => {
    it("should handle skills array with many items", () => {
      const manySkills = Array.from({ length: 100 }, (_, i) => ({
        ...mockSkill,
        id: `skill-${i}`,
        name: `Skill ${i}`,
      }));
      store.setSkills(manySkills);
      expect(store.skills).toHaveLength(100);
    });

    it("should handle skills array with 1000 items", () => {
      const manySkills = Array.from({ length: 1000 }, (_, i) => ({
        ...mockSkill,
        id: `skill-${i}`,
        name: `Skill ${i}`,
      }));
      store.setSkills(manySkills);
      expect(store.skills).toHaveLength(1000);
    });

    it("should handle long skill filter string", () => {
      const longFilter = "a".repeat(1000);
      store.setSkillFilter(longFilter);
      expect(store.skillFilter).toBe(longFilter);
    });

    it("should handle many output lines", () => {
      for (let i = 0; i < 100; i++) {
        store.appendOutput(`Line ${i}`);
      }
      expect(store.executionOutput).toHaveLength(100);
    });

    it("should handle 1000 output lines", () => {
      for (let i = 0; i < 1000; i++) {
        store.appendOutput(`Line ${i}`);
      }
      expect(store.executionOutput).toHaveLength(1000);
    });

    it("should handle very long output line", () => {
      const longLine = "x".repeat(10000);
      store.appendOutput(longLine);
      expect(store.executionOutput[0]).toBe(longLine);
      expect(store.executionOutput[0].length).toBe(10000);
    });

    it("should handle long error message", () => {
      const longError = "Error: " + "x".repeat(1000);
      store.setError(longError);
      expect(store.error).toBe(longError);
    });

    it("should handle empty string error", () => {
      store.setError("");
      expect(store.error).toBe("");
    });

    it("should handle Japanese characters in filter", () => {
      store.setSkillFilter("テスト検索");
      expect(store.skillFilter).toBe("テスト検索");
    });

    it("should handle emoji in filter", () => {
      store.setSkillFilter("🎉🚀");
      expect(store.skillFilter).toBe("🎉🚀");
    });

    it("should handle regex special characters in filter", () => {
      const specialChars = ".*+?^${}()|[]\\";
      store.setSkillFilter(specialChars);
      expect(store.skillFilter).toBe(specialChars);
    });
  });

  describe("エッジケース", () => {
    it("should handle empty skills array", () => {
      store.setSkills([mockSkill]);
      store.setSkills([]);
      expect(store.skills).toEqual([]);
    });

    it("should handle duplicate skill selection", () => {
      store.selectSkill(mockSkill);
      store.selectSkill(mockSkill);
      expect(store.selectedSkill).toEqual(mockSkill);
    });

    it("should handle selecting same skill twice", () => {
      store.selectSkill(mockSkill);
      const firstSelection = store.selectedSkill;
      store.selectSkill(mockSkill);
      expect(store.selectedSkill).toEqual(firstSelection);
    });

    it("should handle very long output strings without memory error", () => {
      const veryLongOutput = "x".repeat(100000);
      store.appendOutput(veryLongOutput);
      expect(store.executionOutput[0].length).toBe(100000);
    });

    it("should handle rapid state changes", () => {
      for (let i = 0; i < 100; i++) {
        store.setExecutionStatus("executing");
        store.setExecutionStatus("idle");
      }
      expect(store.executionStatus).toBe("idle");
    });

    it("should handle rapid filter changes", () => {
      for (let i = 0; i < 100; i++) {
        store.setSkillFilter(`filter-${i}`);
      }
      expect(store.skillFilter).toBe("filter-99");
    });

    it("should handle special characters in skill filter", () => {
      store.setSkillFilter("<script>alert('xss')</script>");
      expect(store.skillFilter).toBe("<script>alert('xss')</script>");
    });

    it("should handle null skill category", () => {
      store.setSkillCategory(null);
      expect(store.skillCategory).toBeNull();
    });

    it("should handle setting category to null after value", () => {
      store.setSkillCategory("testing");
      store.setSkillCategory(null);
      expect(store.skillCategory).toBeNull();
    });

    it("should handle executing state reset while in progress", () => {
      store.setExecutionStatus("executing");
      store.setCurrentExecutionId("exec-123");
      store.appendOutput("Running...");
      store.resetAgentState();
      expect(store.executionStatus).toBe("idle");
      expect(store.currentExecutionId).toBeNull();
      expect(store.executionOutput).toEqual([]);
    });

    it("should handle consecutive error settings", () => {
      store.setError("Error 1");
      store.setError("Error 2");
      store.setError("Error 3");
      expect(store.error).toBe("Error 3");
    });

    it("should handle empty output line", () => {
      store.appendOutput("");
      expect(store.executionOutput).toEqual([""]);
    });

    it("should handle whitespace-only filter", () => {
      store.setSkillFilter("   ");
      expect(store.skillFilter).toBe("   ");
    });
  });

  describe("エラーハンドリング", () => {
    it("should handle error state correctly", () => {
      store.setError("Something went wrong");
      expect(store.error).toBe("Something went wrong");
    });

    it("should not clear error when clearExecution is called", () => {
      store.setError("Error occurred");
      store.setExecutionStatus("executing");
      store.appendOutput("Some output");
      store.clearExecution();
      // clearExecution only clears execution-related state, not error
      expect(store.error).toBe("Error occurred");
    });

    it("should not lose output when error occurs", () => {
      store.appendOutput("Line 1");
      store.appendOutput("Line 2");
      store.setError("Error occurred");
      expect(store.executionOutput).toEqual(["Line 1", "Line 2"]);
    });

    it("should clear error with resetAgentState", () => {
      store.setError("Error occurred");
      store.resetAgentState();
      expect(store.error).toBeNull();
    });

    it("should handle error during execution", () => {
      store.setExecutionStatus("executing");
      store.setCurrentExecutionId("exec-123");
      store.appendOutput("Running...");
      store.setError("Execution failed");
      store.setExecutionStatus("error");
      expect(store.executionStatus).toBe("error");
      expect(store.error).toBe("Execution failed");
      expect(store.executionOutput).toEqual(["Running..."]);
    });

    it("should allow setting error and loading simultaneously", () => {
      store.setError("Error");
      store.setLoading(true);
      expect(store.error).toBe("Error");
      expect(store.isLoading).toBe(true);
    });
  });

  describe("状態遷移テスト", () => {
    it("should transition from idle to executing", () => {
      expect(store.executionStatus).toBe("idle");
      store.setExecutionStatus("executing");
      expect(store.executionStatus).toBe("executing");
    });

    it("should transition from executing to completed", () => {
      store.setExecutionStatus("executing");
      store.setExecutionStatus("completed");
      expect(store.executionStatus).toBe("completed");
    });

    it("should transition from executing to error", () => {
      store.setExecutionStatus("executing");
      store.setExecutionStatus("error");
      expect(store.executionStatus).toBe("error");
    });

    it("should transition from executing to aborted", () => {
      store.setExecutionStatus("executing");
      store.setExecutionStatus("aborted");
      expect(store.executionStatus).toBe("aborted");
    });

    it("should transition from completed back to idle", () => {
      store.setExecutionStatus("completed");
      store.setExecutionStatus("idle");
      expect(store.executionStatus).toBe("idle");
    });

    it("should transition from error back to idle", () => {
      store.setExecutionStatus("error");
      store.setExecutionStatus("idle");
      expect(store.executionStatus).toBe("idle");
    });

    it("should transition from aborted back to idle", () => {
      store.setExecutionStatus("aborted");
      store.setExecutionStatus("idle");
      expect(store.executionStatus).toBe("idle");
    });
  });
});
