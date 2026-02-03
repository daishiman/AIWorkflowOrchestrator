/**
 * SkillAnalyzer テスト
 * TDD: Green Phase - 実装に合わせてテストを更新
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import type { ImportedSkill } from "@repo/shared";
import { SkillAnalyzer } from "../SkillAnalyzer";

// fs/promises モック
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
}));

describe("SkillAnalyzer", () => {
  const testSkillsDir = "/test/skills";

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

  // モックquery関数
  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyze", () => {
    it("SA-01: should return SkillAnalysis for valid skill", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test-skill\n---\n# Test Skill\n\n## 概要\nテスト\n\n## 使い方\n使い方",
      );
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md", "agents"] as any);

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          categories: [
            { name: "prompt", score: 80, details: "Good", issues: [] },
          ],
          suggestions: [],
          risks: [],
        }),
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act
      const result = await analyzer.analyze(mockSkill);

      // Assert
      expect(result).toBeDefined();
      expect(result.skillName).toBe("test-skill");
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.categories).toBeInstanceOf(Array);
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.risks).toBeInstanceOf(Array);
    });

    it("SA-02: should detect SKILL.md issues in static analysis", async () => {
      // Arrange: SKILL.mdにFrontmatterがない
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue("# Test Skill\nNo frontmatter");
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md"] as any);

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          categories: [],
          suggestions: [],
          risks: [],
        }),
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act
      const result = await analyzer.analyze(mockSkill);

      // Assert
      expect(result.suggestions.some((s) => s.type === "structure")).toBe(true);
    });

    it("SA-03: should generate improvement suggestions via AI analysis", async () => {
      // Arrange: SDK応答をモック
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue("---\nname: test\n---\n# Test");
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md", "agents"] as any);

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          categories: [
            {
              name: "prompt",
              score: 75,
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
        }),
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act
      const result = await analyzer.analyze(mockSkill);

      // Assert
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(mockQuery).toHaveBeenCalled();
    });

    it("SA-04: should throw error for non-existent skill", async () => {
      // Arrange: スキルディレクトリが存在しない
      vi.mocked(fs.stat).mockRejectedValue(
        Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
      );

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(analyzer.analyze(mockSkill)).rejects.toThrow(
        /ディレクトリが存在しません/,
      );
    });

    it("SA-05: should throw error for skill without SKILL.md", async () => {
      // Arrange: SKILL.mdがない
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockRejectedValue(
        Object.assign(new Error("ENOENT"), { code: "ENOENT" }),
      );

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(analyzer.analyze(mockSkill)).rejects.toThrow(/SKILL\.md/);
    });

    it("SA-06: should handle empty skill directory", async () => {
      // Arrange: 空のディレクトリ（SKILL.mdのみ）
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test\n\n## 概要\n\n## 使い方",
      );
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md"] as any);

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          categories: [],
          suggestions: [],
          risks: [],
        }),
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act
      const result = await analyzer.analyze(mockSkill);

      // Assert
      // SKILL.md以外のファイルがないという提案があるはず
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("boundary value tests", () => {
    it("should validate skill name is not empty", async () => {
      // Arrange
      const invalidSkill = { ...mockSkill, name: "" };
      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(analyzer.analyze(invalidSkill)).rejects.toThrow(
        /スキル名が空です/,
      );
    });

    it("should validate skill name does not contain special characters", async () => {
      // Arrange
      const invalidSkill = { ...mockSkill, name: "skill<script>" };
      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(analyzer.analyze(invalidSkill)).rejects.toThrow(
        /無効な文字/,
      );
    });
  });
});
