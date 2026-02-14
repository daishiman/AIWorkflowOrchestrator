/**
 * SkillImportManager Boundary Value Tests
 *
 * Phase 6: Test Expansion - TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
 *
 * @description テストシナリオ:
 *   - BV-01〜BV-05: 境界値テスト
 *   - 混合型データ・ネストした配列等のエッジケース
 *
 * @see docs/30-workflows/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-06-test-expansion.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("SkillImportManager - Boundary Value Tests (TASK-FIX-4-2)", () => {
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockStore = {
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
      path: "/mock/path/skill-imports.json",
    };
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("Skill ID Boundary Values", () => {
    it("BV-01: should handle empty string skill ID", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      const result = await manager.importSkills([""]);

      // Assert: Empty string is technically valid but should be handled
      expect(result.success).toBe(true);
      expect(manager.getImportedSkillIds()).toContain("");
    });

    it("BV-02: should handle very long skill ID (10000 chars)", async () => {
      // Arrange
      const longId = "a".repeat(10000);
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      const result = await manager.importSkills([longId]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
      expect(manager.getImportedSkillIds()).toContain(longId);
    });

    it("BV-03: should handle large number of skills (1000)", async () => {
      // Arrange
      const skillIds = Array.from({ length: 1000 }, (_, i) => `skill-${i}`);
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      const result = await manager.importSkills(skillIds);

      // Assert
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1000);

      // Verify persistence
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);
      expect(manager2.getImportedSkillIds()).toHaveLength(1000);
    });

    it("BV-04: should handle empty->add->empty cycle", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Add then remove
      await manager.importSkills(["skill-1"]);
      expect(manager.getImportedSkillIds()).toHaveLength(1);

      await manager.removeSkill("skill-1");
      expect(manager.getImportedSkillIds()).toHaveLength(0);

      // Add again
      await manager.importSkills(["skill-2"]);
      expect(manager.getImportedSkillIds()).toHaveLength(1);

      // Verify persistence after cycle
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);
      expect(manager2.getImportedSkillIds()).toEqual(["skill-2"]);
    });

    it("BV-05: should handle Unicode skill IDs", async () => {
      // Arrange
      const unicodeIds = [
        "skill-japanese-日本語",
        "skill-emoji-rocket-🚀",
        "skill-chinese-中文",
        "skill-korean-한국어",
        "skill-arabic-العربية",
      ];
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      await manager.importSkills(unicodeIds);

      // Assert
      expect(manager.getImportedSkillIds()).toHaveLength(5);

      // Verify persistence
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);
      for (const id of unicodeIds) {
        expect(manager2.getImportedSkillIds()).toContain(id);
      }
    });
  });

  describe("Data Type Edge Cases", () => {
    it("should handle array with mixed valid/invalid types", async () => {
      // Arrange
      mockStore.get.mockReturnValue([
        "valid-1",
        123,
        true,
        false,
        null,
        undefined,
        {},
        [],
        "valid-2",
        NaN,
        Infinity,
      ]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Only string values should remain
      const ids = manager.getImportedSkillIds();
      expect(ids).toEqual(["valid-1", "valid-2"]);
    });

    it("should handle nested arrays in stored data", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1", ["nested-array"], "skill-2"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      const ids = manager.getImportedSkillIds();
      expect(ids).toEqual(["skill-1", "skill-2"]);
    });

    it("should handle number 0 in array (not string)", async () => {
      // Arrange
      mockStore.get.mockReturnValue([0, "skill-1", -1]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Only strings
      expect(manager.getImportedSkillIds()).toEqual(["skill-1"]);
    });

    it("should handle boolean values in array", async () => {
      // Arrange
      mockStore.get.mockReturnValue([true, "skill-1", false, "skill-2"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual(["skill-1", "skill-2"]);
    });

    it("should handle special characters in skill IDs", async () => {
      // Arrange
      const specialIds = [
        "skill/path/to/skill",
        "skill:with:colons",
        "skill@with@at",
        "skill#with#hash",
        "skill?with?question",
        "skill&with&ampersand",
        "skill=with=equals",
      ];
      mockStore.get.mockReturnValue(specialIds);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual(specialIds);
    });
  });

  describe("Duplicate Handling", () => {
    it("should remove duplicates when importing", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act
      await manager.importSkills(["skill-1", "skill-1", "skill-2", "skill-2"]);

      // Assert
      const ids = manager.getImportedSkillIds();
      expect(ids).toHaveLength(2);
      expect(ids).toContain("skill-1");
      expect(ids).toContain("skill-2");
    });

    it("should handle duplicates in stored data", async () => {
      // Arrange: Store contains duplicates (corrupted data)
      mockStore.get.mockReturnValue([
        "skill-1",
        "skill-1",
        "skill-2",
        "skill-1",
      ]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Set automatically deduplicates
      const ids = manager.getImportedSkillIds();
      expect(ids).toHaveLength(2);
    });
  });
});
