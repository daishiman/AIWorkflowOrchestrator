/**
 * SkillService.executeSkill Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 * Tests for the SkillService.executeSkill method.
 *
 * @see docs/30-workflows/skill-execution-implementation/outputs/phase-2/skill-service-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Types from design
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Array<{
    source: string;
    application: string;
    purpose: string;
  }>;
  category?: string;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date;
}

interface _SkillRunResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

// Import after mocks - this will fail in Red phase
let SkillService: typeof import("../SkillService").SkillService;

describe("SkillService.executeSkill", () => {
  let service: InstanceType<typeof SkillService>;
  let mockScanner: {
    scanDirectory: ReturnType<typeof vi.fn>;
    setBasePath: ReturnType<typeof vi.fn>;
    getBasePath: ReturnType<typeof vi.fn>;
  };
  let mockParser: {
    parse: ReturnType<typeof vi.fn>;
  };
  let mockImportManager: {
    importSkills: ReturnType<typeof vi.fn>;
    removeSkill: ReturnType<typeof vi.fn>;
    getImportedSkillIds: ReturnType<typeof vi.fn>;
    isImported: ReturnType<typeof vi.fn>;
  };

  // Sample skill data
  const sampleSkill1: Skill = {
    id: "skill-id-1",
    name: "Skill One",
    slug: "skill-one",
    description: "First test skill",
    path: "/test/skills/skill-one/SKILL.md",
    triggers: ["trigger1", "trigger2"],
    anchors: [
      { source: "Source 1", application: "App 1", purpose: "Purpose 1" },
    ],
    category: "testing",
    lastModified: new Date("2026-01-11T00:00:00Z"),
  };

  const sampleSkill2: Skill = {
    id: "skill-id-2",
    name: "Skill Two",
    slug: "skill-two",
    description: "Second test skill",
    path: "/test/skills/skill-two/SKILL.md",
    triggers: ["trigger3"],
    anchors: [],
    category: "development",
    lastModified: new Date("2026-01-11T01:00:00Z"),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mocks
    mockScanner = {
      scanDirectory: vi
        .fn()
        .mockResolvedValue([
          "/test/skills/skill-one/SKILL.md",
          "/test/skills/skill-two/SKILL.md",
        ]),
      setBasePath: vi.fn(),
      getBasePath: vi.fn().mockReturnValue("/test/skills"),
    };

    mockParser = {
      parse: vi.fn().mockImplementation((path: string) => {
        if (path.includes("skill-one")) return Promise.resolve(sampleSkill1);
        if (path.includes("skill-two")) return Promise.resolve(sampleSkill2);
        return Promise.reject(new Error("Unknown skill"));
      }),
    };

    mockImportManager = {
      importSkills: vi.fn().mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      }),
      removeSkill: vi.fn().mockResolvedValue({
        success: true,
        removed: true,
      }),
      getImportedSkillIds: vi.fn().mockReturnValue(["skill-id-1"]),
      isImported: vi
        .fn()
        .mockImplementation((id: string) => id === "skill-id-1"),
    };

    // Try to import SkillService (will fail in Red phase if executeSkill not implemented)
    try {
      const module = await import("../SkillService");
      SkillService = module.SkillService;
      service = new SkillService(
        mockScanner as never,
        mockParser as never,
        mockImportManager as never,
      );
    } catch {
      // Expected in Red phase - executeSkill method doesn't exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // TC-4-008: スキルを実行して成功結果を返す
  // ===========================================================================

  describe("TC-4-008: スキルを実行して成功結果を返す", () => {
    it("should execute skill and return SkillRunResult with success status", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First scan to populate cache
      await service.scanAvailableSkills();

      // When: executeSkillを呼び出す
      const result = await service.executeSkill("skill-id-1");

      // Then: 成功結果が返される
      expect(result).toBeDefined();
      expect(result.executionId).toBeDefined();
      expect(result.status).toBe("success");
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it("should include executionId in result", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      const result = await service.executeSkill("skill-id-1");

      expect(result.executionId).toBeDefined();
      expect(typeof result.executionId).toBe("string");
      expect(result.executionId.length).toBeGreaterThan(0);
    });

    it("should include output in success result", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      const result = await service.executeSkill("skill-id-1");

      expect(result.status).toBe("success");
      // Output may be optional but should be string if present
      if (result.output !== undefined) {
        expect(typeof result.output).toBe("string");
      }
    });

    it("should record startedAt before completedAt", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      const result = await service.executeSkill("skill-id-1");

      expect(result.startedAt.getTime()).toBeLessThanOrEqual(
        result.completedAt.getTime(),
      );
    });

    it("should accept optional params", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      // When: paramsを渡して実行
      const params = { key: "value" };
      const result = await service.executeSkill("skill-id-1", params);

      // Then: 成功結果が返される
      expect(result.status).toBe("success");
    });
  });

  // ===========================================================================
  // TC-4-009: 存在しないスキルでエラーを返す
  // ===========================================================================

  describe("TC-4-009: 存在しないスキルでエラーを返す", () => {
    it("should throw error for non-existent skillId", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      // When & Then: 存在しないスキルIDでエラーがスローされる
      await expect(service.executeSkill("nonexistent-id")).rejects.toThrow(
        "スキルが見つかりません",
      );
    });

    it("should throw error for empty skillId", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When & Then: 空のスキルIDでエラーがスローされる
      await expect(service.executeSkill("")).rejects.toThrow();
    });
  });

  // ===========================================================================
  // Additional test cases
  // ===========================================================================

  describe("import validation", () => {
    it("should throw error when skill is not imported", async () => {
      // Given: skill-id-2はインポートされていない
      mockImportManager.getImportedSkillIds.mockReturnValue(["skill-id-1"]);
      mockImportManager.isImported.mockImplementation(
        (id: string) => id === "skill-id-1",
      );

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      // When & Then: インポートされていないスキルでエラーがスローされる
      await expect(service.executeSkill("skill-id-2")).rejects.toThrow(
        "スキルがインポートされていません",
      );
    });

    it("should execute when skill is imported", async () => {
      // Given: skill-id-1はインポート済み
      mockImportManager.getImportedSkillIds.mockReturnValue(["skill-id-1"]);
      mockImportManager.isImported.mockReturnValue(true);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      // When: インポート済みスキルを実行
      const result = await service.executeSkill("skill-id-1");

      // Then: 成功
      expect(result.status).toBe("success");
    });
  });

  describe("execution result structure", () => {
    it("should return result with all required fields", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      const result = await service.executeSkill("skill-id-1");

      // Check all required fields
      expect(result).toHaveProperty("executionId");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("startedAt");
      expect(result).toHaveProperty("completedAt");
    });

    it("should generate unique executionId for each execution", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      // When: 同じスキルを2回実行
      const result1 = await service.executeSkill("skill-id-1");
      const result2 = await service.executeSkill("skill-id-1");

      // Then: executionIdが異なる
      expect(result1.executionId).not.toBe(result2.executionId);
    });
  });

  describe("cache behavior", () => {
    it("should trigger scan if cache is empty", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: キャッシュが空の状態でexecuteSkillを呼び出す
      await service.executeSkill("skill-id-1");

      // Then: スキャンが実行される
      expect(mockScanner.scanDirectory).toHaveBeenCalled();
    });

    it("should use cache if already populated", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First call populates cache
      await service.scanAvailableSkills();
      mockScanner.scanDirectory.mockClear();

      // When: executeSkillを呼び出す
      await service.executeSkill("skill-id-1");

      // Then: 再スキャンなし（キャッシュ使用）
      expect(mockScanner.scanDirectory).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TC-6-004: 不正な形式のパラメータで実行（Phase 6）
  // ===========================================================================

  describe("TC-6-004: 不正な形式のパラメータで実行", () => {
    it("should handle null params gracefully", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      // When: nullを明示的に渡す（undefinedとして扱われる）
      const result = await service.executeSkill(
        "skill-id-1",
        null as unknown as Record<string, unknown>,
      );

      // Then: 成功結果が返される
      expect(result.status).toBe("success");
    });

    it("should handle params with undefined values", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      await service.scanAvailableSkills();

      const params = { key: undefined, other: "value" } as Record<
        string,
        unknown
      >;
      const result = await service.executeSkill("skill-id-1", params);

      expect(result.status).toBe("success");
    });
  });

  // ===========================================================================
  // TC-6-005: キャッシュにないスキルの実行（Phase 6）
  // ===========================================================================

  describe("TC-6-005: キャッシュにないスキルの実行", () => {
    it("should scan and find skill if cache is empty", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // Given: キャッシュがクリアされた状態
      service.clearCache();

      // When: スキルを実行
      const result = await service.executeSkill("skill-id-1");

      // Then: スキャン後に成功
      expect(mockScanner.scanDirectory).toHaveBeenCalled();
      expect(result.status).toBe("success");
    });
  });
});
