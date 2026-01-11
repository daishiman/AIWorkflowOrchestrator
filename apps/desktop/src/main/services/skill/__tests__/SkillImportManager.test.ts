/**
 * SkillImportManager Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Import after mocks - this will fail in Red phase
let SkillImportManager: typeof import("../SkillImportManager").SkillImportManager;

describe("SkillImportManager", () => {
  let manager: InstanceType<typeof SkillImportManager>;
  let mockStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock store
    mockStore = {
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    };

    // Try to import SkillImportManager (will fail in Red phase)
    try {
      const module = await import("../SkillImportManager");
      SkillImportManager = module.SkillImportManager;
      manager = new SkillImportManager(mockStore as never);
    } catch {
      // Expected in Red phase - module doesn't exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // importSkills tests
  // ===========================================================================

  describe("importSkills", () => {
    it("SIM-IS-01: should import specified skills", async () => {
      // Given: インポートするスキルIDの配列
      const skillIds = ["skill-1", "skill-2"];

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: importSkillsを呼び出す
      const result = await manager.importSkills(skillIds);

      // Then: スキルがインポートされる
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
    });

    it("SIM-IS-02: should persist imported skill ids to store", async () => {
      // Given: インポートするスキルIDの配列
      const skillIds = ["skill-1", "skill-2"];

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: importSkillsを呼び出す
      await manager.importSkills(skillIds);

      // Then: ストアにスキルIDが永続化される
      expect(mockStore.set).toHaveBeenCalledWith(
        "importedSkillIds",
        expect.arrayContaining(skillIds),
      );
    });

    it("SIM-IS-03: should return success result with imported count", async () => {
      // Given: インポートするスキルIDの配列
      const skillIds = ["skill-1", "skill-2", "skill-3"];

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: importSkillsを呼び出す
      const result = await manager.importSkills(skillIds);

      // Then: 成功結果にインポート数が含まれる
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(3);
      expect(result.errors).toEqual([]);
    });

    it("SIM-IS-04: should handle duplicate imports gracefully", async () => {
      // Given: 既にインポート済みのスキルID
      mockStore.get.mockReturnValue(["skill-1"]);

      // Re-initialize manager with pre-existing imports
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 重複を含むスキルをインポート
      const result = await manager.importSkills(["skill-1", "skill-2"]);

      // Then: 重複は無視され、新規のみカウント
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1); // skill-2のみ
    });

    it("SIM-IS-05: should accumulate imports across multiple calls", async () => {
      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 複数回importSkillsを呼び出す
      await manager.importSkills(["skill-1"]);
      await manager.importSkills(["skill-2"]);

      // Then: インポートが累積される
      const importedIds = manager.getImportedSkillIds();
      expect(importedIds).toHaveLength(2);
      expect(importedIds).toContain("skill-1");
      expect(importedIds).toContain("skill-2");
    });

    it("SIM-IS-06: should handle empty array input", async () => {
      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 空配列でimportSkillsを呼び出す
      const result = await manager.importSkills([]);

      // Then: 成功するが、インポート数は0
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(0);
    });
  });

  // ===========================================================================
  // removeSkill tests
  // ===========================================================================

  describe("removeSkill", () => {
    it("SIM-RS-01: should remove specified skill from imports", async () => {
      // Given: インポート済みのスキル
      mockStore.get.mockReturnValue(["skill-1", "skill-2"]);

      // Re-initialize manager with pre-existing imports
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: removeSkillを呼び出す
      const result = await manager.removeSkill("skill-1");

      // Then: スキルが削除される
      expect(result.success).toBe(true);
      expect(result.removed).toBe(true);
      expect(manager.getImportedSkillIds()).not.toContain("skill-1");
    });

    it("SIM-RS-02: should persist removal to store", async () => {
      // Given: インポート済みのスキル
      mockStore.get.mockReturnValue(["skill-1", "skill-2"]);

      // Re-initialize manager with pre-existing imports
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: removeSkillを呼び出す
      await manager.removeSkill("skill-1");

      // Then: 削除がストアに永続化される
      expect(mockStore.set).toHaveBeenCalledWith(
        "importedSkillIds",
        expect.not.arrayContaining(["skill-1"]),
      );
    });

    it("SIM-RS-03: should return success with removed=true when skill existed", async () => {
      // Given: インポート済みのスキル
      mockStore.get.mockReturnValue(["skill-1"]);

      // Re-initialize manager with pre-existing imports
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 存在するスキルを削除
      const result = await manager.removeSkill("skill-1");

      // Then: removed=trueが返される
      expect(result.success).toBe(true);
      expect(result.removed).toBe(true);
    });

    it("SIM-RS-04: should return success with removed=false when skill not found", async () => {
      // Given: 空のインポートリスト
      mockStore.get.mockReturnValue([]);

      // Re-initialize manager
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 存在しないスキルを削除
      const result = await manager.removeSkill("nonexistent-skill");

      // Then: removed=falseが返される
      expect(result.success).toBe(true);
      expect(result.removed).toBe(false);
    });

    it("SIM-RS-05: should not modify store when skill not found", async () => {
      // Given: 空のインポートリスト
      mockStore.get.mockReturnValue([]);

      // Re-initialize manager
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 存在しないスキルを削除
      await manager.removeSkill("nonexistent-skill");

      // Then: ストアは変更されない（setが呼ばれない）
      expect(mockStore.set).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getImportedSkillIds tests
  // ===========================================================================

  describe("getImportedSkillIds", () => {
    it("SIM-GISI-01: should return empty array when no skills imported", () => {
      // Given: 空のインポートリスト
      mockStore.get.mockReturnValue([]);

      // Re-initialize manager
      try {
        const module = vi.importActual("../SkillImportManager") as {
          SkillImportManager: typeof SkillImportManager;
        };
        manager = new module.SkillImportManager(mockStore as never);
      } catch {
        // Expected in Red phase
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: getImportedSkillIdsを呼び出す
      const result = manager.getImportedSkillIds();

      // Then: 空配列が返される
      expect(result).toEqual([]);
    });

    it("SIM-GISI-02: should return all imported skill ids", async () => {
      // Given: インポート済みのスキル
      mockStore.get.mockReturnValue(["skill-1", "skill-2", "skill-3"]);

      // Re-initialize manager
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: getImportedSkillIdsを呼び出す
      const result = manager.getImportedSkillIds();

      // Then: 全インポート済みスキルIDが返される
      expect(result).toHaveLength(3);
      expect(result).toContain("skill-1");
      expect(result).toContain("skill-2");
      expect(result).toContain("skill-3");
    });

    it("SIM-GISI-03: should load imported ids from store on initialization", async () => {
      // Given: ストアに保存されたスキルID
      const savedSkillIds = ["saved-1", "saved-2"];
      mockStore.get.mockReturnValue(savedSkillIds);

      // When: SkillImportManagerを初期化
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // Then: ストアからスキルIDが読み込まれる
      expect(mockStore.get).toHaveBeenCalledWith("importedSkillIds", []);
      expect(manager.getImportedSkillIds()).toEqual(savedSkillIds);
    });

    it("SIM-GISI-04: should return a copy, not the internal array", async () => {
      // Given: インポート済みのスキル
      mockStore.get.mockReturnValue(["skill-1"]);

      // Re-initialize manager
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: 返された配列を変更
      const result = manager.getImportedSkillIds();
      result.push("modified");

      // Then: 内部配列は変更されない
      expect(manager.getImportedSkillIds()).not.toContain("modified");
    });
  });

  // ===========================================================================
  // isImported tests
  // ===========================================================================

  describe("isImported", () => {
    it("SIM-II-01: should return true for imported skill", async () => {
      // Given: インポート済みのスキル
      mockStore.get.mockReturnValue(["skill-1"]);

      // Re-initialize manager
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: isImportedを呼び出す
      const result = manager.isImported("skill-1");

      // Then: trueが返される
      expect(result).toBe(true);
    });

    it("SIM-II-02: should return false for non-imported skill", async () => {
      // Given: 空のインポートリスト
      mockStore.get.mockReturnValue([]);

      // Re-initialize manager
      try {
        const module = await import("../SkillImportManager");
        SkillImportManager = module.SkillImportManager;
        manager = new SkillImportManager(mockStore as never);
      } catch {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      if (!manager) {
        throw new Error("SkillImportManager not initialized - Red phase");
      }

      // When: isImportedを呼び出す
      const result = manager.isImported("nonexistent-skill");

      // Then: falseが返される
      expect(result).toBe(false);
    });
  });
});
