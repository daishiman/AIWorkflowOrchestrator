/**
 * SkillImportManager Error Handling Tests
 *
 * Phase 6: Test Expansion - TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
 *
 * @description テストシナリオ:
 *   - EX-01〜EX-05: 異常系テスト
 *   - 永続化エラーからのリカバリテスト
 *   - 並行操作テスト
 *
 * @see docs/30-workflows/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-06-test-expansion.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import log from "electron-log";

vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("SkillImportManager - Error Handling Tests (TASK-FIX-4-2)", () => {
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

  describe("Store Error Scenarios", () => {
    it("EX-01: should handle store.set() throwing error", async () => {
      // Arrange
      mockStore.set.mockImplementation(() => {
        throw new Error("Disk full");
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act & Assert: Should not throw, but persist fails silently
      await expect(manager.importSkills(["skill-1"])).resolves.not.toThrow();

      // In-memory state should be updated even if persist fails
      expect(manager.getImportedSkillIds()).toContain("skill-1");
    });

    it("EX-02: should handle store.get() throwing error on init", async () => {
      // Arrange
      mockStore.get.mockImplementation(() => {
        throw new Error("Store corrupted");
      });

      // Act & Assert: Should not throw, falls back to empty
      const { SkillImportManager } = await import("../SkillImportManager");
      expect(() => new SkillImportManager(mockStore as never)).not.toThrow();

      const manager = new SkillImportManager(mockStore as never);
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("EX-03: should handle store returning function", async () => {
      // Arrange
      mockStore.get.mockReturnValue(() => ["skill-1"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Function is not a valid array
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("EX-04: should handle store returning Date object", async () => {
      // Arrange
      mockStore.get.mockReturnValue(new Date());

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("EX-05: should handle store returning number", async () => {
      // Arrange
      mockStore.get.mockReturnValue(42);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });
  });

  describe("Additional Error Scenarios", () => {
    it("should handle store returning RegExp", async () => {
      // Arrange
      mockStore.get.mockReturnValue(/test/);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("should handle store returning Symbol", async () => {
      // Arrange
      mockStore.get.mockReturnValue(Symbol("test"));

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("should handle store returning Map", async () => {
      // Arrange
      mockStore.get.mockReturnValue(new Map([["key", "value"]]));

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert
      expect(manager.getImportedSkillIds()).toEqual([]);
    });

    it("should handle store returning Set", async () => {
      // Arrange
      mockStore.get.mockReturnValue(new Set(["skill-1", "skill-2"]));

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Assert: Set is not an array
      expect(manager.getImportedSkillIds()).toEqual([]);
    });
  });

  describe("Persist Error Recovery", () => {
    it("should continue operation after persist error", async () => {
      // Arrange
      let persistCallCount = 0;
      mockStore.set.mockImplementation(() => {
        persistCallCount++;
        if (persistCallCount === 1) {
          throw new Error("First persist failed");
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: First import fails to persist
      await manager.importSkills(["skill-1"]);

      // Second import should still work
      await manager.importSkills(["skill-2"]);

      // Assert
      expect(manager.getImportedSkillIds()).toContain("skill-1");
      expect(manager.getImportedSkillIds()).toContain("skill-2");
      expect(persistCallCount).toBe(2);
    });

    it("should not corrupt in-memory state on persist error", async () => {
      // Arrange
      mockStore.set.mockImplementation(() => {
        throw new Error("Persist always fails");
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Multiple operations
      await manager.importSkills(["skill-1", "skill-2"]);
      await manager.removeSkill("skill-1");
      await manager.importSkills(["skill-3"]);

      // Assert: In-memory state is correct
      const ids = manager.getImportedSkillIds();
      expect(ids).not.toContain("skill-1");
      expect(ids).toContain("skill-2");
      expect(ids).toContain("skill-3");
    });

    it("should handle intermittent persist failures", async () => {
      // Arrange
      let callCount = 0;
      mockStore.set.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          throw new Error("Intermittent failure");
        }
      });

      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Multiple operations
      await manager.importSkills(["skill-1"]); // success
      await manager.importSkills(["skill-2"]); // fail
      await manager.importSkills(["skill-3"]); // success
      await manager.importSkills(["skill-4"]); // fail

      // Assert: All in-memory state is correct
      const ids = manager.getImportedSkillIds();
      expect(ids).toHaveLength(4);
      expect(ids).toContain("skill-1");
      expect(ids).toContain("skill-2");
      expect(ids).toContain("skill-3");
      expect(ids).toContain("skill-4");
    });
  });

  describe("Concurrent Operations", () => {
    it("CC-01: should handle concurrent import operations", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Concurrent imports
      const results = await Promise.all([
        manager.importSkills(["skill-1"]),
        manager.importSkills(["skill-2"]),
        manager.importSkills(["skill-3"]),
      ]);

      // Assert: All should succeed
      expect(results.every((r) => r.success)).toBe(true);
      expect(manager.getImportedSkillIds()).toHaveLength(3);
    });

    it("CC-02: should handle import during remove", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);
      await manager.importSkills(["skill-1", "skill-2"]);

      // Act: Concurrent import and remove
      const [removeResult, importResult] = await Promise.all([
        manager.removeSkill("skill-1"),
        manager.importSkills(["skill-3"]),
      ]);

      // Assert
      expect(removeResult.success).toBe(true);
      expect(importResult.success).toBe(true);
      expect(manager.getImportedSkillIds()).not.toContain("skill-1");
      expect(manager.getImportedSkillIds()).toContain("skill-2");
      expect(manager.getImportedSkillIds()).toContain("skill-3");
    });

    it("CC-03: should handle rapid successive operations", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never);

      // Act: Rapid operations - import even numbers, remove them after
      const operations: Promise<unknown>[] = [];
      for (let i = 0; i < 50; i++) {
        operations.push(manager.importSkills([`skill-${i}`]));
      }
      await Promise.all(operations);

      // Remove half of them
      const removeOps: Promise<unknown>[] = [];
      for (let i = 0; i < 50; i += 2) {
        removeOps.push(manager.removeSkill(`skill-${i}`));
      }
      await Promise.all(removeOps);

      // Assert: Odd-indexed skills should remain
      const ids = manager.getImportedSkillIds();
      expect(ids).toHaveLength(25);
      expect(ids).toContain("skill-1");
      expect(ids).toContain("skill-49");
      expect(ids).not.toContain("skill-0");
      expect(ids).not.toContain("skill-48");
    });
  });

  describe("Constructor Options", () => {
    it("should accept debug option", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");

      // Act & Assert: Should not throw
      expect(
        () => new SkillImportManager(mockStore as never, { debug: true }),
      ).not.toThrow();
      expect(
        () => new SkillImportManager(mockStore as never, { debug: false }),
      ).not.toThrow();
    });

    it("should work without options", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");

      // Act & Assert: Should not throw
      expect(() => new SkillImportManager(mockStore as never)).not.toThrow();
    });
  });

  describe("Debug Mode Coverage", () => {
    it("should log store path in debug mode", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1"]);

      // Act
      const { SkillImportManager } = await import("../SkillImportManager");
      new SkillImportManager(mockStore as never, { debug: true });

      // Assert
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] Store path:",
        "/mock/path/skill-imports.json",
      );
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] Loaded imported IDs:",
        1,
        "items",
      );
    });

    it("should log import operations in debug mode", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never, {
        debug: true,
      });

      // Act
      await manager.importSkills(["skill-1", "skill-2"]);

      // Assert
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] importSkills called with:",
        ["skill-1", "skill-2"],
      );
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] importSkills result:",
        2,
        "new imports",
      );
    });

    it("should log remove operations in debug mode", async () => {
      // Arrange
      mockStore.get.mockReturnValue(["skill-1"]);
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never, {
        debug: true,
      });
      vi.mocked(log.debug).mockClear();

      // Act
      await manager.removeSkill("skill-1");

      // Assert
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] removeSkill called with:",
        "skill-1",
      );
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] removeSkill result:",
        true,
      );
    });

    it("should log persist operations in debug mode", async () => {
      // Arrange
      const { SkillImportManager } = await import("../SkillImportManager");
      const manager = new SkillImportManager(mockStore as never, {
        debug: true,
      });

      // Act
      await manager.importSkills(["skill-1"]);

      // Assert
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] Persisting:",
        1,
        "items",
      );
      expect(log.debug).toHaveBeenCalledWith(
        "[SkillImportManager] Persist successful",
      );
    });
  });
});
