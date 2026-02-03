/**
 * SkillImprover 追加テスト
 * Phase 6: テスト拡充 - バックアップ・改善タイプ・エラーハンドリング
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/phase-06-test-expansion.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import type { SkillAnalysis, Suggestion } from "@repo/shared";
import { SkillImprover } from "../SkillImprover";

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

describe("SkillImprover - Additional Coverage", () => {
  const testSkillsDir = "/test/skills";

  const mockQuery = vi.fn();

  const createMockAnalysis = (
    overrides?: Partial<SkillAnalysis>,
  ): SkillAnalysis => ({
    skillName: "test-skill",
    overallScore: 75,
    categories: [
      {
        name: "prompt",
        score: 70,
        details: "改善の余地あり",
        issues: [],
      },
    ],
    suggestions: [
      {
        type: "prompt",
        priority: "medium",
        description: "プロンプトをより具体的に",
        autoFixable: true,
      },
    ],
    risks: [],
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.cp).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue("# Test Content");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("backup operations", () => {
    it("SI-ADD-01: should create timestamped backup", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: "# Improved Content",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      await improver.applyImprovements("test-skill", createMockAnalysis(), {
        autoFix: true,
      });

      // Assert
      expect(fs.cp).toHaveBeenCalledWith(
        expect.stringContaining("test-skill"),
        expect.stringMatching(/test-skill\.backup\.\d{4}-\d{2}-\d{2}T/),
        expect.anything(),
      );
    });

    it("SI-ADD-02: should restore from latest backup", async () => {
      // Arrange
      vi.mocked(fs.readdir).mockResolvedValue([
        "test-skill.backup.2024-01-01T00-00-00",
        "test-skill.backup.2024-01-02T00-00-00",
        "test-skill.backup.2024-01-03T00-00-00",
      ] as any);

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      await improver.restoreFromBackup("test-skill");

      // Assert
      expect(fs.cp).toHaveBeenCalledWith(
        expect.stringContaining("2024-01-03"), // 最新
        expect.stringContaining("test-skill"),
        expect.anything(),
      );
    });

    it("SI-ADD-03: should throw when no backup exists", async () => {
      // Arrange
      vi.mocked(fs.readdir).mockResolvedValue([
        "other-skill.backup.2024-01-01T00-00-00",
      ] as any);

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(improver.restoreFromBackup("test-skill")).rejects.toThrow(
        /バックアップが見つかりません/,
      );
    });

    it("SI-ADD-04: should handle backup with only one entry", async () => {
      // Arrange
      vi.mocked(fs.readdir).mockResolvedValue([
        "test-skill.backup.2024-01-01T00-00-00",
      ] as any);

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      await improver.restoreFromBackup("test-skill");

      // Assert
      expect(fs.cp).toHaveBeenCalledWith(
        expect.stringContaining("2024-01-01"),
        expect.stringContaining("test-skill"),
        expect.anything(),
      );
    });
  });

  describe("improvement types", () => {
    it("SI-ADD-05: should apply prompt improvement via AI (always uses AI)", async () => {
      // Arrange
      const suggestion: Suggestion = {
        type: "prompt",
        priority: "high",
        description: "プロンプト改善",
        autoFixable: true,
        // 実装はcurrentCode/suggestedCodeを使わず、常にAIに改善を依頼
      };

      mockQuery.mockResolvedValueOnce({
        content: "# Improved Content",
      });

      const analysis = createMockAnalysis({ suggestions: [suggestion] });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements("test-skill", analysis, {
        autoFix: true,
      });

      // Assert
      expect(result.applied.length).toBe(1);
      expect(result.applied[0].result).toBe("success");
      expect(mockQuery).toHaveBeenCalled();
    });

    it("SI-ADD-06: should apply prompt improvement via AI", async () => {
      // Arrange
      const suggestion: Suggestion = {
        type: "prompt",
        priority: "high",
        description: "プロンプト改善（AIによる）",
        autoFixable: true,
        // currentCode/suggestedCode なし → AI経由
      };

      mockQuery.mockResolvedValueOnce({
        content: "# AI Generated Content",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions: [suggestion] }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(1);
      expect(mockQuery).toHaveBeenCalled();
    });

    it("SI-ADD-07: should apply structure improvement", async () => {
      // Arrange
      const suggestion: Suggestion = {
        type: "structure",
        priority: "medium",
        description: "ディレクトリ構造改善",
        autoFixable: true,
      };

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          create: [{ path: "agents/helper.md", content: "# Helper" }],
          modify: [],
          delete: [],
        }),
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions: [suggestion] }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(1);
      expect(fs.mkdir).toHaveBeenCalled();
    });

    it("SI-ADD-08: should apply documentation improvement", async () => {
      // Arrange
      const suggestion: Suggestion = {
        type: "documentation",
        priority: "low",
        description: "README追加",
        autoFixable: true,
      };

      mockQuery.mockResolvedValueOnce({
        content: "# README\n\nスキルの使い方...",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions: [suggestion] }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(1);
    });

    it("SI-ADD-09: should apply security improvement", async () => {
      // Arrange
      const suggestion: Suggestion = {
        type: "security",
        priority: "high",
        description: "危険なコマンドの削除",
        autoFixable: true,
      };

      mockQuery.mockResolvedValueOnce({
        content: "# セキュア化されたコンテンツ",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions: [suggestion] }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(1);
    });

    it("SI-ADD-10: should skip non-autoFixable suggestions", async () => {
      // Arrange
      const suggestion: Suggestion = {
        type: "prompt",
        priority: "high",
        description: "手動対応が必要",
        autoFixable: false,
      };

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions: [suggestion] }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(0);
      expect(result.skipped.length).toBe(1);
    });
  });

  describe("error handling", () => {
    it("SI-ADD-11: should continue on partial failure", async () => {
      // Arrange: 2つの提案、1つ目は成功、2つ目は失敗
      const suggestions: Suggestion[] = [
        {
          type: "prompt",
          priority: "high",
          description: "改善1",
          autoFixable: true,
        },
        {
          type: "prompt",
          priority: "medium",
          description: "改善2",
          autoFixable: true,
        },
      ];

      mockQuery
        .mockResolvedValueOnce({ content: "# Success" })
        .mockRejectedValueOnce(new Error("SDK Error"));

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(1);
      expect(result.errors.length).toBe(1);
    });

    it("SI-ADD-12: should handle file system write errors", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: "# Improved Content",
      });
      // writeFileが最初にバックアップ後にエラーを投げる
      vi.mocked(fs.writeFile).mockRejectedValueOnce(
        new Error("EACCES: permission denied"),
      );

      const suggestion: Suggestion = {
        type: "prompt",
        priority: "high",
        description: "改善",
        autoFixable: true,
      };

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions: [suggestion] }),
        { autoFix: true },
      );

      // Assert
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain("EACCES");
    });

    it("SI-ADD-13: should handle backup creation failure", async () => {
      // Arrange
      vi.mocked(fs.cp).mockRejectedValueOnce(new Error("ENOSPC"));

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(
        improver.applyImprovements("test-skill", createMockAnalysis(), {
          autoFix: true,
        }),
      ).rejects.toThrow("ENOSPC");
    });
  });

  describe("options filtering - additional cases", () => {
    it("SI-ADD-14: should apply all when no filter specified", async () => {
      // Arrange
      const suggestions: Suggestion[] = [
        {
          type: "prompt",
          priority: "high",
          description: "改善1",
          autoFixable: true,
        },
        {
          type: "structure",
          priority: "medium",
          description: "改善2",
          autoFixable: true,
        },
      ];

      mockQuery
        .mockResolvedValueOnce({ content: "# P1" })
        .mockResolvedValueOnce({
          content: JSON.stringify({ create: [], modify: [], delete: [] }),
        });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions }),
        { autoFix: true }, // types/minPriority フィルタなし
      );

      // Assert
      expect(result.applied.length).toBe(2);
    });

    it("SI-ADD-15: should filter by multiple types", async () => {
      // Arrange
      const suggestions: Suggestion[] = [
        {
          type: "prompt",
          priority: "high",
          description: "P",
          autoFixable: true,
        },
        {
          type: "structure",
          priority: "high",
          description: "S",
          autoFixable: true,
        },
        {
          type: "documentation",
          priority: "high",
          description: "D",
          autoFixable: true,
        },
      ];

      mockQuery
        .mockResolvedValueOnce({ content: "# P" })
        .mockResolvedValueOnce({ content: "# D" });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions }),
        { autoFix: true, types: ["prompt", "documentation"] },
      );

      // Assert
      expect(result.applied.length).toBe(2);
      expect(result.skipped.some((s) => s.type === "structure")).toBe(true);
    });

    it("SI-ADD-16: should filter by high priority only", async () => {
      // Arrange
      const suggestions: Suggestion[] = [
        {
          type: "prompt",
          priority: "high",
          description: "H",
          autoFixable: true,
        },
        {
          type: "prompt",
          priority: "medium",
          description: "M",
          autoFixable: true,
        },
        {
          type: "prompt",
          priority: "low",
          description: "L",
          autoFixable: true,
        },
      ];

      mockQuery.mockResolvedValueOnce({ content: "# H" });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions }),
        { autoFix: true, minPriority: "high" },
      );

      // Assert
      expect(result.applied.length).toBe(1);
      expect(result.skipped.length).toBe(2);
    });
  });

  describe("boundary value tests", () => {
    it("SI-ADD-17: should handle very long skill name", async () => {
      // Arrange
      const longName = "a".repeat(200);
      mockQuery.mockResolvedValueOnce({ content: "# Content" });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        longName,
        createMockAnalysis({ skillName: longName }),
        { autoFix: true },
      );

      // Assert
      expect(result.skillName).toBe(longName);
    });

    it("SI-ADD-18: should handle many suggestions (10+)", async () => {
      // Arrange
      const suggestions: Suggestion[] = Array.from({ length: 10 }, (_, i) => ({
        type: "prompt" as const,
        priority: "medium" as const,
        description: `改善${i}`,
        autoFixable: true,
      }));

      for (let i = 0; i < 10; i++) {
        mockQuery.mockResolvedValueOnce({ content: `# Content ${i}` });
      }

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        createMockAnalysis({ suggestions }),
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(10);
    });
  });
});
