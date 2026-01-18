/**
 * skillAPI Tests
 *
 * TDD Red Phase: These tests verify that the preload skillAPI
 * passes arguments in the correct object format to IPC handlers.
 *
 * Bug: The current implementation passes arguments directly (e.g., skillIds array)
 * instead of wrapping them in objects (e.g., { skillIds }).
 *
 * Expected to FAIL until the fix is implemented.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Define the window type extension for tests
declare global {
  interface Window {
    electronAPI?: {
      invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
    };
  }
}

// Mock OperationResult type (used for type documentation)
interface _OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
}

describe("skillAPI argument format tests", () => {
  let mockInvoke: ReturnType<typeof vi.fn>;
  let originalElectronAPI: typeof window.electronAPI;

  beforeEach(() => {
    // Store original
    originalElectronAPI = window.electronAPI;

    // Create mock invoke function
    mockInvoke = vi.fn().mockResolvedValue({ success: true });

    // Set up electronAPI mock
    window.electronAPI = {
      invoke: mockInvoke,
    };
  });

  afterEach(() => {
    // Restore original
    window.electronAPI = originalElectronAPI;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("import method", () => {
    it("should call IPC with object format { skillIds }", async () => {
      // Given: skillAPIをインポート
      const { skillAPI } = await import("../index");

      // When: import メソッドを呼び出す
      await skillAPI.import(["skill-1", "skill-2"]);

      // Then: IPCがオブジェクト形式で呼び出される
      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill-1", "skill-2"],
      });
    });

    it("should call IPC with object format for empty array", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.import([]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: [],
      });
    });

    it("should call IPC with object format for single skill", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.import(["single-skill"]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["single-skill"],
      });
    });
  });

  describe("remove method", () => {
    it("should call IPC with object format { skillId }", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.remove("skill-to-remove");

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: "skill-to-remove",
      });
    });

    it("should call IPC with object format for any valid skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.remove("another-skill-id");

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: "another-skill-id",
      });
    });
  });

  describe("getDetail method", () => {
    it("should call IPC with object format { skillId }", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { id: "skill-1", name: "Test Skill" },
      });

      const { skillAPI } = await import("../index");

      await skillAPI.getDetail("skill-1");

      expect(mockInvoke).toHaveBeenCalledWith("skill:get-detail", {
        skillId: "skill-1",
      });
    });

    it("should call IPC with object format for any skillId", async () => {
      mockInvoke.mockResolvedValue({ success: false, error: "Not found" });

      const { skillAPI } = await import("../index");

      await skillAPI.getDetail("nonexistent-skill");

      expect(mockInvoke).toHaveBeenCalledWith("skill:get-detail", {
        skillId: "nonexistent-skill",
      });
    });
  });

  describe("listAvailable method (no args - should work)", () => {
    it("should call IPC without arguments", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: [] });

      const { skillAPI } = await import("../index");

      await skillAPI.listAvailable();

      expect(mockInvoke).toHaveBeenCalledWith("skill:list-available");
    });
  });

  describe("listImported method (no args - should work)", () => {
    it("should call IPC without arguments", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: [] });

      const { skillAPI } = await import("../index");

      await skillAPI.listImported();

      expect(mockInvoke).toHaveBeenCalledWith("skill:list-imported");
    });
  });

  describe("non-Electron environment fallback", () => {
    // These tests require fresh module imports without electronAPI
    // We use vi.resetModules() BEFORE setting window state, then import

    it("import should return success fallback when electronAPI is not available", async () => {
      // Reset modules first, then modify window, then import
      vi.resetModules();
      // Delete the electronAPI from window (don't just set undefined)
      delete (window as Window & { electronAPI?: unknown }).electronAPI;

      const { skillAPI: freshSkillAPI } = await import("../index");

      const result = await freshSkillAPI.import(["skill-1"]);

      expect(result).toEqual({ success: true });
    });

    it("remove should return success fallback when electronAPI is not available", async () => {
      vi.resetModules();
      delete (window as Window & { electronAPI?: unknown }).electronAPI;

      const { skillAPI: freshSkillAPI } = await import("../index");

      const result = await freshSkillAPI.remove("skill-1");

      expect(result).toEqual({ success: true });
    });

    it("getDetail should return error fallback when electronAPI is not available", async () => {
      vi.resetModules();
      delete (window as Window & { electronAPI?: unknown }).electronAPI;

      const { skillAPI: freshSkillAPI } = await import("../index");

      const result = await freshSkillAPI.getDetail("skill-1");

      expect(result).toEqual({ success: false, error: "Skill not found" });
    });
  });
});

/**
 * Phase 6: Edge Case Tests
 * 境界値やエッジケースのテスト
 */
describe("skillAPI edge cases", () => {
  let mockInvoke: ReturnType<typeof vi.fn>;
  let originalElectronAPI: typeof window.electronAPI;

  beforeEach(() => {
    originalElectronAPI = window.electronAPI;
    mockInvoke = vi.fn().mockResolvedValue({ success: true });
    window.electronAPI = { invoke: mockInvoke };
  });

  afterEach(() => {
    window.electronAPI = originalElectronAPI;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("import edge cases", () => {
    it("should handle special characters in skill ids (Japanese)", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.import(["skill-with-日本語", "スキル名"]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill-with-日本語", "スキル名"],
      });
    });

    it("should handle special characters in skill ids (slashes, dots)", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.import(["skill/with/slash", "skill.with.dot"]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill/with/slash", "skill.with.dot"],
      });
    });

    it("should handle very long skill ids", async () => {
      const { skillAPI } = await import("../index");
      const longId = "a".repeat(1000);

      await skillAPI.import([longId]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: [longId],
      });
    });

    it("should handle large array of skill ids", async () => {
      const { skillAPI } = await import("../index");
      const manyIds = Array.from({ length: 100 }, (_, i) => `skill-${i}`);

      await skillAPI.import(manyIds);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: manyIds,
      });
    });

    it("should handle whitespace in skill ids", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.import(["skill with spaces", "  leading-trailing  "]);

      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill with spaces", "  leading-trailing  "],
      });
    });
  });

  describe("remove edge cases", () => {
    it("should handle empty string skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.remove("");

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", { skillId: "" });
    });

    it("should handle special characters in skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.remove("skill@#$%^&*()");

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: "skill@#$%^&*()",
      });
    });

    it("should handle very long skillId", async () => {
      const { skillAPI } = await import("../index");
      const longId = "x".repeat(500);

      await skillAPI.remove(longId);

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: longId,
      });
    });

    it("should handle Unicode characters in skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.remove("skill-🔧-emoji");

      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: "skill-🔧-emoji",
      });
    });
  });

  describe("getDetail edge cases", () => {
    it("should handle empty string skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.getDetail("");

      expect(mockInvoke).toHaveBeenCalledWith("skill:get-detail", {
        skillId: "",
      });
    });

    it("should handle URL-like skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.getDetail("https://example.com/skill");

      expect(mockInvoke).toHaveBeenCalledWith("skill:get-detail", {
        skillId: "https://example.com/skill",
      });
    });

    it("should handle path-like skillId", async () => {
      const { skillAPI } = await import("../index");

      await skillAPI.getDetail("/path/to/skill.json");

      expect(mockInvoke).toHaveBeenCalledWith("skill:get-detail", {
        skillId: "/path/to/skill.json",
      });
    });
  });
});

/**
 * Phase 6: Error Handling Tests
 * 異常系のテスト（IPCエラー、タイムアウト等）
 */
describe("skillAPI error handling", () => {
  let mockInvoke: ReturnType<typeof vi.fn>;
  let originalElectronAPI: typeof window.electronAPI;

  beforeEach(() => {
    originalElectronAPI = window.electronAPI;
    mockInvoke = vi.fn();
    window.electronAPI = { invoke: mockInvoke };
  });

  afterEach(() => {
    window.electronAPI = originalElectronAPI;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("import error handling", () => {
    it("should propagate IPC error", async () => {
      mockInvoke.mockRejectedValue(new Error("IPC Error"));
      const { skillAPI } = await import("../index");

      await expect(skillAPI.import(["skill-1"])).rejects.toThrow("IPC Error");
    });

    it("should handle operation failure response", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Import failed: duplicate skill",
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.import(["skill-1"]);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Import failed: duplicate skill");
    });

    it("should handle timeout error", async () => {
      mockInvoke.mockRejectedValue(new Error("Request timed out"));
      const { skillAPI } = await import("../index");

      await expect(skillAPI.import(["skill-1"])).rejects.toThrow(
        "Request timed out",
      );
    });
  });

  describe("remove error handling", () => {
    it("should propagate IPC error", async () => {
      mockInvoke.mockRejectedValue(new Error("IPC connection lost"));
      const { skillAPI } = await import("../index");

      await expect(skillAPI.remove("skill-1")).rejects.toThrow(
        "IPC connection lost",
      );
    });

    it("should handle operation failure response", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Skill not found",
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.remove("nonexistent-skill");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Skill not found");
    });

    it("should handle permission denied error", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Permission denied: cannot remove system skill",
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.remove("system-skill");

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Permission denied: cannot remove system skill",
      );
    });
  });

  describe("getDetail error handling", () => {
    it("should propagate IPC error", async () => {
      mockInvoke.mockRejectedValue(new Error("Channel not found"));
      const { skillAPI } = await import("../index");

      await expect(skillAPI.getDetail("skill-1")).rejects.toThrow(
        "Channel not found",
      );
    });

    it("should handle null data in successful response", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: null,
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.getDetail("nonexistent");

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle not found error response", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Skill with id 'invalid-id' not found",
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.getDetail("invalid-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Skill with id 'invalid-id' not found");
    });
  });

  describe("listAvailable error handling", () => {
    it("should propagate IPC error", async () => {
      mockInvoke.mockRejectedValue(new Error("Network error"));
      const { skillAPI } = await import("../index");

      await expect(skillAPI.listAvailable()).rejects.toThrow("Network error");
    });

    it("should handle empty list as valid response", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: [],
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.listAvailable();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("listImported error handling", () => {
    it("should propagate IPC error", async () => {
      mockInvoke.mockRejectedValue(new Error("Database error"));
      const { skillAPI } = await import("../index");

      await expect(skillAPI.listImported()).rejects.toThrow("Database error");
    });

    it("should handle operation failure response", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Failed to load imported skills",
      });
      const { skillAPI } = await import("../index");

      const result = await skillAPI.listImported();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to load imported skills");
    });
  });
});

/**
 * Phase 6: Integration Test Scenarios (Unit Test Level)
 * 連続操作のシナリオテスト
 */
describe("skillAPI integration scenarios", () => {
  let mockInvoke: ReturnType<typeof vi.fn>;
  let originalElectronAPI: typeof window.electronAPI;

  beforeEach(() => {
    originalElectronAPI = window.electronAPI;
    mockInvoke = vi.fn();
    window.electronAPI = { invoke: mockInvoke };
  });

  afterEach(() => {
    window.electronAPI = originalElectronAPI;
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("full skill import flow", () => {
    it("should complete: list available → import → list imported", async () => {
      const availableSkills = [
        { id: "skill-1", name: "Skill 1", description: "Test" },
        { id: "skill-2", name: "Skill 2", description: "Test" },
      ];

      mockInvoke
        .mockResolvedValueOnce({ success: true, data: availableSkills })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({
          success: true,
          data: [availableSkills[0]],
        });

      const { skillAPI } = await import("../index");

      // Step 1: List available skills
      const available = await skillAPI.listAvailable();
      expect(available.success).toBe(true);
      expect(available.data).toHaveLength(2);

      // Step 2: Import first skill
      const imported = await skillAPI.import(["skill-1"]);
      expect(imported.success).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill-1"],
      });

      // Step 3: Verify imported skill appears in list
      const importedList = await skillAPI.listImported();
      expect(importedList.success).toBe(true);
      expect(importedList.data).toHaveLength(1);
    });
  });

  describe("full skill removal flow", () => {
    it("should complete: list imported → get detail → remove → verify removal", async () => {
      const importedSkill = {
        id: "skill-1",
        name: "Skill 1",
        description: "Test",
      };

      mockInvoke
        .mockResolvedValueOnce({ success: true, data: [importedSkill] })
        .mockResolvedValueOnce({ success: true, data: importedSkill })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true, data: [] });

      const { skillAPI } = await import("../index");

      // Step 1: List imported skills
      const imported = await skillAPI.listImported();
      expect(imported.success).toBe(true);
      expect(imported.data).toHaveLength(1);

      // Step 2: Get detail of the skill
      const detail = await skillAPI.getDetail("skill-1");
      expect(detail.success).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("skill:get-detail", {
        skillId: "skill-1",
      });

      // Step 3: Remove the skill
      const removed = await skillAPI.remove("skill-1");
      expect(removed.success).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: "skill-1",
      });

      // Step 4: Verify removal
      const afterRemoval = await skillAPI.listImported();
      expect(afterRemoval.success).toBe(true);
      expect(afterRemoval.data).toHaveLength(0);
    });
  });

  describe("bulk import and selective removal", () => {
    it("should handle multiple imports followed by selective removal", async () => {
      mockInvoke
        .mockResolvedValueOnce({ success: true }) // import 3 skills
        .mockResolvedValueOnce({ success: true }) // remove skill-2
        .mockResolvedValueOnce({
          success: true,
          data: [
            { id: "skill-1", name: "Skill 1" },
            { id: "skill-3", name: "Skill 3" },
          ],
        }); // list imported

      const { skillAPI } = await import("../index");

      // Import multiple skills
      await skillAPI.import(["skill-1", "skill-2", "skill-3"]);
      expect(mockInvoke).toHaveBeenCalledWith("skill:import", {
        skillIds: ["skill-1", "skill-2", "skill-3"],
      });

      // Remove one skill
      await skillAPI.remove("skill-2");
      expect(mockInvoke).toHaveBeenCalledWith("skill:remove", {
        skillId: "skill-2",
      });

      // Verify remaining skills
      const remaining = await skillAPI.listImported();
      expect(remaining.data).toHaveLength(2);
      expect(remaining.data?.map((s: Skill) => s.id)).toEqual([
        "skill-1",
        "skill-3",
      ]);
    });
  });

  describe("error recovery scenario", () => {
    it("should continue operation after transient error", async () => {
      mockInvoke
        .mockRejectedValueOnce(new Error("Transient network error"))
        .mockResolvedValueOnce({ success: true }); // Retry succeeds

      const { skillAPI } = await import("../index");

      // First attempt fails
      await expect(skillAPI.import(["skill-1"])).rejects.toThrow(
        "Transient network error",
      );

      // Retry succeeds
      const result = await skillAPI.import(["skill-1"]);
      expect(result.success).toBe(true);
    });
  });
});
