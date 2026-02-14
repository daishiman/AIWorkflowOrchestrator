/**
 * SkillImportManager Persistence Tests - Type Validation & Restart Simulation
 *
 * TDD Phase 4: Red Phase - TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
 *
 * @description テストシナリオ:
 *   - TV-01〜TV-06: 型バリデーションテスト
 *   - PC-01〜PC-05: 永続化サイクルテスト（再起動シミュレーション）
 *
 * @see docs/30-workflows/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-04-test-creation.md
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

describe("SkillImportManager - Type Validation (TASK-FIX-4-2)", () => {
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    path?: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockStore = {
      get: vi.fn(),
      set: vi.fn(),
      path: "/mock/path/skill-imports.json",
    };
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("Type Validation on Initialization", () => {
    it("TV-01: should fallback to empty array when store returns null", async () => {
      // Arrange
      mockStore.get.mockReturnValue(null);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-02: should fallback to empty array when store returns undefined", async () => {
      // Arrange
      mockStore.get.mockReturnValue(undefined);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-03: should fallback to empty array when store returns string", async () => {
      // Arrange
      mockStore.get.mockReturnValue("invalid-string-data");

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-04: should fallback to empty array when store returns object", async () => {
      // Arrange
      mockStore.get.mockReturnValue({ key: "value" });

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("TV-05: should filter out non-string elements from array", async () => {
      // Arrange
      mockStore.get.mockReturnValue([
        "skill-1",
        123,
        null,
        "skill-2",
        undefined,
        { id: "skill-3" },
      ]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      const ids = manager.getImportedSkillIds();
      expect(ids).toEqual(["skill-1", "skill-2"]);
      expect(ids).toHaveLength(2);
    });

    it("TV-06: should correctly load valid string array", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1", "skill-2", "skill-3"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([
        "skill-1",
        "skill-2",
        "skill-3",
      ]);
    });
  });

  describe("Persistence Cycle (Restart Simulation)", () => {
    it("PC-01: should restore data after store re-initialization", async () => {
      // Arrange: Simulate persistent storage
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: First instance - import
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      await manager1.importSkills(["skill-1"]);

      // Simulate app restart - create new instance with same store state
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).toContain("skill-1");
    });

    it("PC-02: should restore multiple imports after re-initialization", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: Import multiple skills
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      await manager1.importSkills(["skill-1", "skill-2", "skill-3"]);

      // Simulate restart
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).toHaveLength(3);
      expect(manager2.getImportedSkillIds()).toEqual(
        expect.arrayContaining(["skill-1", "skill-2", "skill-3"]),
      );
    });

    it("PC-03: should preserve removal state after re-initialization", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: Import then remove
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      await manager1.importSkills(["skill-1", "skill-2"]);
      await manager1.removeSkill("skill-1");

      // Simulate restart
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).not.toContain("skill-1");
      expect(manager2.getImportedSkillIds()).toContain("skill-2");
    });

    it("PC-04: should use default when store throws on initialization", async () => {
      // Arrange
      mockStore.get.mockImplementation(() => {
        throw new Error("Store read error");
      });

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("PC-05: should maintain empty state after re-initialization", async () => {
      // Arrange
      const persistedData: string[] = [];
      mockStore.get.mockImplementation(() => [...persistedData]);
      mockStore.set.mockImplementation((key: string, value: string[]) => {
        if (key === "importedSkillIds") {
          persistedData.length = 0;
          persistedData.push(...value);
        }
      });

      // Act: Create instance without importing
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager1 = new SkillImportManager(mockStore as never);
      expect(manager1.getImportedSkillIds()).toEqual([]);

      // Simulate restart
      vi.resetModules();
      const module2 = await import("../SkillImportManager");
      const manager2 = new module2.SkillImportManager(mockStore as never);

      // Assert
      expect(manager2.getImportedSkillIds()).toEqual([]);
    });
  });
});
