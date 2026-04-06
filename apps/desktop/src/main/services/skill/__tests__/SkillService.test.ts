/**
 * SkillService Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 * SkillService is a Facade that integrates SkillScanner, SkillParser, and SkillImportManager.
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const {
  mockFsAccess,
  mockFsMkdir,
  mockFsWriteFile,
  mockSkillCreatorCreateSkill,
} = vi.hoisted(() => ({
  mockFsAccess: vi.fn(),
  mockFsMkdir: vi.fn(),
  mockFsWriteFile: vi.fn(),
  mockSkillCreatorCreateSkill: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: {
    access: mockFsAccess,
    mkdir: mockFsMkdir,
    writeFile: mockFsWriteFile,
  },
}));

vi.mock("../SkillCreatorService", () => ({
  SkillCreatorService: class MockSkillCreatorService {
    createSkill = mockSkillCreatorCreateSkill;
    constructor(_skillsDir?: string, _workflowsDir?: string) {}
  },
}));

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

interface _SkillScanResult {
  skills: Skill[];
  errors: Array<{
    path: string;
    error: string;
    code: string;
  }>;
  scannedAt: Date;
}

interface _ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

interface _RemoveResult {
  success: boolean;
  removed: boolean;
}

// Import after mocks - this will fail in Red phase
let SkillService: typeof import("../SkillService").SkillService;

describe("SkillService", () => {
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
    mockFsAccess.mockReset();
    mockFsMkdir.mockReset();
    mockFsWriteFile.mockReset();
    mockSkillCreatorCreateSkill.mockReset();

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
      getImportedSkillIds: vi.fn().mockReturnValue([]),
      isImported: vi.fn().mockReturnValue(false),
    };

    mockFsAccess.mockRejectedValue(new Error("ENOENT"));
    mockFsMkdir.mockResolvedValue(undefined);
    mockFsWriteFile.mockResolvedValue(undefined);
    mockSkillCreatorCreateSkill.mockImplementation(
      async (options: { name: string }) => `/test/skills/${options.name}`,
    );

    // Try to import SkillService (will fail in Red phase)
    try {
      const module = await import("../SkillService");
      SkillService = module.SkillService;
      service = new SkillService(
        mockScanner as never,
        mockParser as never,
        mockImportManager as never,
      );
    } catch {
      // Expected in Red phase - module doesn't exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // scanAvailableSkills tests
  // ===========================================================================

  describe("scanAvailableSkills", () => {
    it("SS-SAS-01: should return all skills with metadata", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを呼び出す
      const result = await service.scanAvailableSkills();

      // Then: 全スキルがメタデータ付きで返される
      expect(result.skills).toHaveLength(2);
      expect(result.skills[0].name).toBe("Skill One");
      expect(result.skills[1].name).toBe("Skill Two");
    });

    it("SS-SAS-02: should cache skills after first fetch", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを2回呼び出す
      await service.scanAvailableSkills();
      await service.scanAvailableSkills();

      // Then: スキャンは1回のみ実行される
      expect(mockScanner.scanDirectory).toHaveBeenCalledTimes(1);
    });

    it("SS-SAS-03: should use cache on subsequent calls", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを複数回呼び出す
      const result1 = await service.scanAvailableSkills();
      const result2 = await service.scanAvailableSkills();

      // Then: 同じ結果が返される（キャッシュ使用）
      expect(result1.skills).toEqual(result2.skills);
      expect(mockParser.parse).toHaveBeenCalledTimes(2); // 初回のみ
    });

    it("SS-SAS-04: should force refresh when forceRefresh=true", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: forceRefresh=trueで呼び出す
      await service.scanAvailableSkills();
      await service.scanAvailableSkills(true);

      // Then: スキャンが再実行される
      expect(mockScanner.scanDirectory).toHaveBeenCalledTimes(2);
    });

    it("SS-SAS-05: should collect errors for invalid skills", async () => {
      // Given: 一部のスキルの解析に失敗
      mockParser.parse.mockImplementation((path: string) => {
        if (path.includes("skill-one")) return Promise.resolve(sampleSkill1);
        return Promise.reject(new Error("Parse error"));
      });

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを呼び出す
      const result = await service.scanAvailableSkills();

      // Then: エラーが収集される
      expect(result.skills).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("PARSE_ERROR");
    });

    it("SS-SAS-06: should include scannedAt timestamp", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを呼び出す
      const result = await service.scanAvailableSkills();

      // Then: scannedAtタイムスタンプが含まれる
      expect(result.scannedAt).toBeInstanceOf(Date);
    });

    it("SS-SAS-07: should handle empty scan result", async () => {
      // Given: スキルが見つからない
      mockScanner.scanDirectory.mockResolvedValue([]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: scanAvailableSkillsを呼び出す
      const result = await service.scanAvailableSkills();

      // Then: 空の結果が返される
      expect(result.skills).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("SS-SAS-08: should handle scanner errors", async () => {
      // Given: スキャナーがエラーをスロー
      mockScanner.scanDirectory.mockRejectedValue(
        new Error("Directory access denied"),
      );

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When & Then: エラーがスローされる
      await expect(service.scanAvailableSkills()).rejects.toThrow();
    });
  });

  // ===========================================================================
  // getImportedSkills tests
  // ===========================================================================

  describe("getImportedSkills", () => {
    it("SS-GIS-01: should return only imported skills", async () => {
      // Given: 一部のスキルがインポート済み
      mockImportManager.getImportedSkillIds.mockReturnValue(["skill-id-1"]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getImportedSkillsを呼び出す
      const result = await service.getImportedSkills();

      // Then: インポート済みスキルのみ返される
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("skill-id-1");
    });

    it("SS-GIS-02: should return empty array when no skills imported", async () => {
      // Given: インポート済みスキルがない
      mockImportManager.getImportedSkillIds.mockReturnValue([]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getImportedSkillsを呼び出す
      const result = await service.getImportedSkills();

      // Then: 空配列が返される
      expect(result).toEqual([]);
    });

    it("SS-GIS-03: should return full skill objects (not just ids)", async () => {
      // Given: インポート済みスキル
      mockImportManager.getImportedSkillIds.mockReturnValue(["skill-id-1"]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getImportedSkillsを呼び出す
      const result = await service.getImportedSkills();

      // Then: 完全なSkillオブジェクトが返される
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("description");
      expect(result[0]).toHaveProperty("triggers");
      expect(result[0]).toHaveProperty("anchors");
    });

    it("SS-GIS-04: should trigger scan if cache is empty", async () => {
      // Given: キャッシュが空
      mockImportManager.getImportedSkillIds.mockReturnValue(["skill-id-1"]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getImportedSkillsを呼び出す
      await service.getImportedSkills();

      // Then: スキャンが実行される
      expect(mockScanner.scanDirectory).toHaveBeenCalled();
    });

    it("SS-GIS-05: should filter out non-existent skill ids", async () => {
      // Given: 存在しないスキルIDがインポート済みリストに含まれる
      mockImportManager.getImportedSkillIds.mockReturnValue([
        "skill-id-1",
        "nonexistent-id",
      ]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: getImportedSkillsを呼び出す
      const result = await service.getImportedSkills();

      // Then: 存在するスキルのみ返される
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("skill-id-1");
    });

    it("SS-GIS-06: should resolve imported skills by name for backward compatibility", async () => {
      // Given: import manager が name 形式で保持している
      mockImportManager.getImportedSkillIds.mockReturnValue(["Skill One"]);

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When
      const result = await service.getImportedSkills();

      // Then: name一致で取得できる
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Skill One");
      expect(result[0].id).toBe("skill-id-1");
    });
  });

  // ===========================================================================
  // importSkills tests
  // ===========================================================================

  describe("importSkills", () => {
    it("SS-IS-01: should delegate to import manager", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: importSkillsを呼び出す
      await service.importSkills(["skill-id-1"]);

      // Then: インポートマネージャーに委譲される
      expect(mockImportManager.importSkills).toHaveBeenCalledWith([
        "skill-id-1",
      ]);
    });

    it("SS-IS-02: should return import result", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: importSkillsを呼び出す
      const result = await service.importSkills(["skill-id-1"]);

      // Then: インポート結果が返される
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
    });

    it("SS-IS-03: should handle multiple skill ids", async () => {
      // Given: 複数のスキルIDをインポート
      mockImportManager.importSkills.mockResolvedValue({
        success: true,
        importedCount: 2,
        errors: [],
      });

      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: 複数スキルをインポート
      const result = await service.importSkills(["skill-id-1", "skill-id-2"]);

      // Then: 両方がインポートされる
      expect(result.importedCount).toBe(2);
    });
  });

  // ===========================================================================
  // removeSkill tests
  // ===========================================================================

  describe("removeSkill", () => {
    it("SS-RS-01: should delegate to import manager", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: removeSkillを呼び出す
      await service.removeSkill("skill-id-1");

      // Then: インポートマネージャーに委譲される
      expect(mockImportManager.removeSkill).toHaveBeenCalledWith("skill-id-1");
    });

    it("SS-RS-02: should return remove result", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: removeSkillを呼び出す
      const result = await service.removeSkill("skill-id-1");

      // Then: 削除結果が返される
      expect(result.success).toBe(true);
      expect(result.removed).toBe(true);
    });
  });

  // ===========================================================================
  // getSkillById tests
  // ===========================================================================

  describe("getSkillById", () => {
    it("SS-GSBI-01: should return skill when found", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First scan to populate cache
      await service.scanAvailableSkills();

      // When: getSkillByIdを呼び出す
      const result = await service.getSkillById("skill-id-1");

      // Then: スキルオブジェクトが返される
      expect(result).not.toBeNull();
      expect(result?.id).toBe("skill-id-1");
      expect(result?.name).toBe("Skill One");
    });

    it("SS-GSBI-02: should return null when skill not found", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First scan to populate cache
      await service.scanAvailableSkills();

      // When: 存在しないIDで呼び出す
      const result = await service.getSkillById("nonexistent-id");

      // Then: nullが返される
      expect(result).toBeNull();
    });

    it("SS-GSBI-03: should use cache for lookup", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First scan to populate cache
      await service.scanAvailableSkills();
      mockScanner.scanDirectory.mockClear();

      // When: getSkillByIdを呼び出す
      await service.getSkillById("skill-id-1");

      // Then: キャッシュが使用される（再スキャンなし）
      expect(mockScanner.scanDirectory).not.toHaveBeenCalled();
    });

    it("SS-GSBI-04: should trigger scan if cache is empty", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When: キャッシュが空の状態でgetSkillByIdを呼び出す
      await service.getSkillById("skill-id-1");

      // Then: スキャンが実行される
      expect(mockScanner.scanDirectory).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // clearCache tests
  // ===========================================================================

  describe("clearCache", () => {
    it("SS-CC-01: should clear the internal cache", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First populate cache
      await service.scanAvailableSkills();

      // When: clearCacheを呼び出す
      service.clearCache();

      // Then: キャッシュがクリアされる（次回スキャンが実行される）
      mockScanner.scanDirectory.mockClear();
      await service.scanAvailableSkills();
      expect(mockScanner.scanDirectory).toHaveBeenCalled();
    });

    it("SS-CC-02: should cause next scanAvailableSkills to re-scan", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // First populate cache
      await service.scanAvailableSkills();
      expect(mockScanner.scanDirectory).toHaveBeenCalledTimes(1);

      // When: clearCacheを呼び出す
      service.clearCache();

      // Then: 次のスキャンで再スキャンが実行される
      await service.scanAvailableSkills();
      expect(mockScanner.scanDirectory).toHaveBeenCalledTimes(2);
    });

    it("SS-CC-03: should not throw when cache is already empty", () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      // When & Then: 空キャッシュでclearCacheを呼び出してもエラーにならない
      expect(() => service.clearCache()).not.toThrow();
    });
  });

  // ===========================================================================
  // toWizardSkillName regression tests
  // ===========================================================================

  describe("toWizardSkillName regression", () => {
    const getToWizardSkillName = () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }
      return (
        service as unknown as {
          toWizardSkillName(input: string): string;
        }
      ).toWizardSkillName.bind(service);
    };

    it("SS-TWSN-01: 日本語入力はフォールバック可能な形式へ正規化される", () => {
      const toWizardSkillName = getToWizardSkillName();
      const result = toWizardSkillName("マイスキル");
      expect(result).toBe("new-skill");
      expect(result).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it("SS-TWSN-02: 大文字は小文字化される", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("My Skill")).toBe("my-skill");
    });

    it("SS-TWSN-03: アンダースコアはハイフンに変換される", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("my_skill")).toBe("my-skill");
    });

    it("SS-TWSN-04: 既存の英小文字ハイフンは維持される", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("test-skill")).toBe("test-skill");
    });

    it("SS-TWSN-05: 空文字は new-skill にフォールバックする", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("")).toBe("new-skill");
    });

    it("SS-TWSN-06: 先頭ハイフンは除去される", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("-skill")).toBe("skill");
    });

    it("SS-TWSN-07: 末尾ハイフンは除去される", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("skill-")).toBe("skill");
    });

    it("SS-TWSN-08: 52文字の入力は50文字にスライスされる", () => {
      const toWizardSkillName = getToWizardSkillName();
      const result = toWizardSkillName("a".repeat(52));
      expect(result).toBe("a".repeat(50));
      expect(result.length).toBe(50);
    });

    it("SS-TWSN-09: 数字のみの入力はそのまま通る", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("123")).toBe("123");
    });

    it('SS-TWSN-10: 特殊文字のみは "new-skill" にフォールバックする', () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("!!!")).toBe("new-skill");
    });

    it("SS-TWSN-11: 混在入力は kebab-case に正規化される", () => {
      const toWizardSkillName = getToWizardSkillName();
      expect(toWizardSkillName("My_テスト-Skill123")).toBe("my-skill123");
    });
  });

  describe("createSkillFromWizard collision resolution", () => {
    it("SS-CSW-01: new-skill が存在する場合は new-skill-2 を選ぶ", async () => {
      if (!service) {
        throw new Error("SkillService not initialized - Red phase");
      }

      mockFsAccess.mockImplementation(async (candidatePath: string) => {
        if (candidatePath.endsWith("/new-skill")) {
          return undefined;
        }
        throw new Error("ENOENT");
      });

      const result = await service.createSkillFromWizard("マイスキル", {
        generateTasks: false,
        addAgents: false,
        addReferences: false,
      });

      expect(mockSkillCreatorCreateSkill).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "new-skill-2",
          description: "マイスキル",
          mode: "create",
          generateTasks: false,
        }),
      );
      expect(result.path).toBe("/test/skills/new-skill-2");
    });
  });
});
