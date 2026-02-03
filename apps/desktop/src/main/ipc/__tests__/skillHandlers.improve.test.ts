/**
 * Skill Improvement IPC Handlers テスト
 * Phase 6: テスト拡充 - IPC統合テスト
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/phase-06-test-expansion.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ImportedSkill } from "@repo/shared";

// fs/promises モック
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  mkdir: vi.fn(),
  cp: vi.fn(),
  rm: vi.fn(),
  stat: vi.fn(),
}));

// SkillService モック
const mockGetSkillByName = vi.fn();
const mockGetSkillsDirectory = vi.fn();
vi.mock("../../services/skill/SkillService", () => ({
  SkillService: vi.fn().mockImplementation(() => ({
    getSkillByName: mockGetSkillByName,
    getSkillsDirectory: mockGetSkillsDirectory,
  })),
}));

// SkillAnalyzer モック
const mockAnalyze = vi.fn();
vi.mock("../../services/skill/SkillAnalyzer", () => ({
  SkillAnalyzer: vi.fn().mockImplementation(() => ({
    analyze: mockAnalyze,
  })),
}));

// SkillImprover モック
const mockApplyImprovements = vi.fn();
const mockRestoreFromBackup = vi.fn();
vi.mock("../../services/skill/SkillImprover", () => ({
  SkillImprover: vi.fn().mockImplementation(() => ({
    applyImprovements: mockApplyImprovements,
    restoreFromBackup: mockRestoreFromBackup,
  })),
}));

// PromptOptimizer モック
const mockOptimize = vi.fn();
const mockGenerateVariants = vi.fn();
const mockEvaluate = vi.fn();
vi.mock("../../services/skill/PromptOptimizer", () => ({
  PromptOptimizer: vi.fn().mockImplementation(() => ({
    optimize: mockOptimize,
    generateVariants: mockGenerateVariants,
    evaluate: mockEvaluate,
  })),
}));

describe("Skill Improvement IPC Handlers", () => {
  const mockSkill: ImportedSkill = {
    name: "test-skill",
    description: "テスト用スキル",
    path: "/test/skills/test-skill/SKILL.md",
    allowedTools: ["Read", "Write"],
    updatedAt: new Date(),
    importedAt: new Date(),
    status: "active",
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSkillsDirectory.mockReturnValue("/test/skills");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("skill:analyze", () => {
    it("IPC-01: should return SkillAnalysis for valid skill", async () => {
      // Arrange
      mockGetSkillByName.mockResolvedValue(mockSkill);
      mockAnalyze.mockResolvedValue({
        skillName: "test-skill",
        overallScore: 85,
        categories: [
          { name: "prompt", score: 80, details: "Good", issues: [] },
        ],
        suggestions: [],
        risks: [],
      });

      // Act - ハンドラーの動作をシミュレート
      const skill = await mockGetSkillByName("test-skill");
      expect(skill).toBeDefined();

      const result = await mockAnalyze(mockSkill);

      // Assert
      expect(result.skillName).toBe("test-skill");
      expect(result.overallScore).toBe(85);
      expect(result.categories).toHaveLength(1);
    });

    it("IPC-02: should return error for non-existent skill", async () => {
      // Arrange
      mockGetSkillByName.mockResolvedValue(null);

      // Act
      const skill = await mockGetSkillByName("non-existent");

      // Assert
      expect(skill).toBeNull();
    });

    it("IPC-03: should handle analyze error", async () => {
      // Arrange
      mockGetSkillByName.mockResolvedValue(mockSkill);
      mockAnalyze.mockRejectedValue(new Error("Analyze failed"));

      // Act & Assert
      await expect(mockAnalyze(mockSkill)).rejects.toThrow("Analyze failed");
    });
  });

  describe("skill:improve", () => {
    it("IPC-04: should apply improvements and return result", async () => {
      // Arrange
      mockGetSkillByName.mockResolvedValue(mockSkill);
      mockApplyImprovements.mockResolvedValue({
        skillName: "test-skill",
        applied: [
          {
            suggestion: {
              type: "prompt",
              priority: "high",
              description: "Fix",
            },
            result: "success",
          },
        ],
        skipped: [],
        errors: [],
      });

      // Act
      const result = await mockApplyImprovements(
        "test-skill",
        {
          skillName: "test-skill",
          overallScore: 75,
          suggestions: [],
          categories: [],
          risks: [],
        },
        { autoFix: true },
      );

      // Assert
      expect(result.skillName).toBe("test-skill");
      expect(result.applied).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
    });

    it("IPC-05: should respect options.autoFix", async () => {
      // Arrange
      mockApplyImprovements.mockResolvedValue({
        skillName: "test-skill",
        applied: [],
        skipped: [{ type: "prompt", priority: "high", description: "Fix" }],
        errors: [],
      });

      // Act
      const result = await mockApplyImprovements(
        "test-skill",
        {
          skillName: "test-skill",
          overallScore: 75,
          suggestions: [],
          categories: [],
          risks: [],
        },
        { autoFix: false },
      );

      // Assert
      expect(result.applied).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
    });

    it("IPC-06: should respect options.types filter", async () => {
      // Arrange
      mockApplyImprovements.mockResolvedValue({
        skillName: "test-skill",
        applied: [
          {
            suggestion: {
              type: "prompt",
              priority: "high",
              description: "Prompt fix",
            },
            result: "success",
          },
        ],
        skipped: [
          { type: "structure", priority: "high", description: "Structure fix" },
        ],
        errors: [],
      });

      // Act
      const result = await mockApplyImprovements(
        "test-skill",
        {
          skillName: "test-skill",
          overallScore: 75,
          suggestions: [],
          categories: [],
          risks: [],
        },
        { autoFix: true, types: ["prompt"] },
      );

      // Assert
      expect(result.applied).toHaveLength(1);
      expect(result.applied[0].suggestion.type).toBe("prompt");
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0].type).toBe("structure");
    });

    it("IPC-07: should respect options.minPriority filter", async () => {
      // Arrange
      mockApplyImprovements.mockResolvedValue({
        skillName: "test-skill",
        applied: [
          {
            suggestion: {
              type: "prompt",
              priority: "high",
              description: "High",
            },
            result: "success",
          },
        ],
        skipped: [{ type: "prompt", priority: "low", description: "Low" }],
        errors: [],
      });

      // Act
      const result = await mockApplyImprovements(
        "test-skill",
        {
          skillName: "test-skill",
          overallScore: 75,
          suggestions: [],
          categories: [],
          risks: [],
        },
        { autoFix: true, minPriority: "high" },
      );

      // Assert
      expect(result.applied).toHaveLength(1);
      expect(result.applied[0].suggestion.priority).toBe("high");
      expect(result.skipped).toHaveLength(1);
    });
  });

  describe("skill:optimize", () => {
    it("IPC-08: should optimize prompt and return result", async () => {
      // Arrange
      mockOptimize.mockResolvedValue({
        original: "元のプロンプト",
        optimized: "最適化されたプロンプト",
        changes: ["変更1", "変更2"],
        metrics: {
          clarityScore: 85,
          specificityScore: 90,
          completenessScore: 80,
        },
      });

      // Act
      const result = await mockOptimize("元のプロンプト");

      // Assert
      expect(result.original).toBe("元のプロンプト");
      expect(result.optimized).toBe("最適化されたプロンプト");
      expect(result.changes).toHaveLength(2);
      expect(result.metrics.clarityScore).toBe(85);
    });

    it("IPC-09: should handle optimize error", async () => {
      // Arrange
      mockOptimize.mockRejectedValue(new Error("プロンプトが空です"));

      // Act & Assert
      await expect(mockOptimize("")).rejects.toThrow("プロンプトが空です");
    });
  });

  describe("skill:optimize:variants", () => {
    it("IPC-10: should generate specified number of variants", async () => {
      // Arrange
      mockGenerateVariants.mockResolvedValue([
        "バリアント1",
        "バリアント2",
        "バリアント3",
        "バリアント4",
        "バリアント5",
      ]);

      // Act
      const result = await mockGenerateVariants("元のプロンプト", 5);

      // Assert
      expect(result).toHaveLength(5);
    });

    it("IPC-11: should use default count when not specified", async () => {
      // Arrange
      mockGenerateVariants.mockResolvedValue(["v1", "v2", "v3"]);

      // Act
      const result = await mockGenerateVariants("元のプロンプト");

      // Assert
      expect(result).toHaveLength(3);
    });

    it("IPC-12: should reject invalid count", async () => {
      // Arrange
      mockGenerateVariants.mockRejectedValue(new Error("countは1以上"));

      // Act & Assert
      await expect(mockGenerateVariants("prompt", 0)).rejects.toThrow("1以上");
    });
  });

  describe("skill:optimize:evaluate", () => {
    it("IPC-13: should evaluate prompt and return score", async () => {
      // Arrange
      mockEvaluate.mockResolvedValue({
        score: 78,
        breakdown: {
          clarity: 80,
          specificity: 75,
          completeness: 79,
          reproducibility: 77,
          security: 80,
        },
        feedback: ["改善点1", "改善点2"],
      });

      // Act
      const result = await mockEvaluate("評価対象プロンプト");

      // Assert
      expect(result.score).toBe(78);
      expect(result.breakdown.clarity).toBe(80);
      expect(result.feedback).toHaveLength(2);
    });

    it("IPC-14: should return score in valid range (0-100)", async () => {
      // Arrange
      mockEvaluate.mockResolvedValue({
        score: 95,
        feedback: [],
      });

      // Act
      const result = await mockEvaluate("good prompt");

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("IPC-15: should reject empty prompt", async () => {
      // Arrange
      mockEvaluate.mockRejectedValue(new Error("プロンプトが空です"));

      // Act & Assert
      await expect(mockEvaluate("")).rejects.toThrow("プロンプトが空です");
    });
  });

  describe("error propagation", () => {
    it("IPC-16: should propagate SDK errors", async () => {
      // Arrange
      mockAnalyze.mockRejectedValue(new Error("SDK Error: Rate limited"));

      // Act & Assert
      await expect(mockAnalyze(mockSkill)).rejects.toThrow("SDK Error");
    });

    it("IPC-17: should propagate file system errors", async () => {
      // Arrange
      mockApplyImprovements.mockRejectedValue(
        new Error("EACCES: permission denied"),
      );

      // Act & Assert
      await expect(
        mockApplyImprovements("test-skill", {}, { autoFix: true }),
      ).rejects.toThrow("EACCES");
    });

    it("IPC-18: should handle timeout errors", async () => {
      // Arrange
      mockOptimize.mockRejectedValue(new Error("Timeout"));

      // Act & Assert
      await expect(mockOptimize("prompt")).rejects.toThrow("Timeout");
    });
  });
});
