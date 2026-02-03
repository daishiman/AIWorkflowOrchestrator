/**
 * SkillAnalyzer 追加テスト
 * Phase 6: テスト拡充 - エッジケース・エラーハンドリング
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/phase-06-test-expansion.md
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

describe("SkillAnalyzer - Additional Coverage", () => {
  const testSkillsDir = "/test/skills";

  const createMockSkill = (overrides?: Partial<ImportedSkill>): ImportedSkill =>
    ({
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
      ...overrides,
    }) as ImportedSkill;

  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("collectFiles - edge cases", () => {
    it("SA-ADD-01: should handle nested directories", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readdir).mockResolvedValue([
        "SKILL.md",
        "agents",
        "scripts",
      ] as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test Skill\n\n## 概要\nテスト\n\n## 使い方\n使い方",
      );

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          categories: [],
          suggestions: [],
          risks: [],
        }),
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act
      const result = await analyzer.analyze(createMockSkill());

      // Assert
      expect(result).toBeDefined();
      expect(result.skillName).toBe("test-skill");
    });

    it("SA-ADD-02: should handle empty SKILL.md", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue("");
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
      const result = await analyzer.analyze(createMockSkill());

      // Assert
      // 空のSKILL.mdは問題ありとして検出されるはず
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("SA-ADD-03: should handle SKILL.md with only whitespace", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue("   \n\n\t  ");
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
      const result = await analyzer.analyze(createMockSkill());

      // Assert
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("performStaticAnalysis - detailed checks", () => {
    it("SA-ADD-04: should detect missing frontmatter", async () => {
      // Arrange
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
      const result = await analyzer.analyze(createMockSkill());

      // Assert
      expect(result.suggestions.some((s) => s.type === "structure")).toBe(true);
    });

    it("SA-ADD-05: should detect missing required sections", async () => {
      // Arrange: 概要セクションがない
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test Skill",
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
      const result = await analyzer.analyze(createMockSkill());

      // Assert
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("SA-ADD-06: should calculate correct score based on issues", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方",
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
      const result = await analyzer.analyze(createMockSkill());

      // Assert
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe("performAIAnalysis - error handling", () => {
    it("SA-ADD-07: should gracefully handle SDK timeout with fallback", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方",
      );
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md"] as any);

      mockQuery.mockRejectedValueOnce(new Error("Timeout"));

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act - 実装はSDKエラー時にフォールバックして静的分析のみを返す
      const result = await analyzer.analyze(createMockSkill());

      // Assert - エラーでもスコアは返る
      expect(result).toBeDefined();
      expect(result.skillName).toBe("test-skill");
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it("SA-ADD-08: should gracefully handle malformed JSON response with fallback", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方",
      );
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md"] as any);

      mockQuery.mockResolvedValueOnce({
        content: "not valid json",
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act - 実装はSDKエラー時にフォールバックして静的分析のみを返す
      const result = await analyzer.analyze(createMockSkill());

      // Assert - エラーでもスコアは返る（静的分析のみ）
      expect(result).toBeDefined();
      expect(result.skillName).toBe("test-skill");
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it("SA-ADD-09: should gracefully handle rate limiting with fallback", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方",
      );
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md"] as any);

      mockQuery.mockRejectedValueOnce(new Error("Rate limit exceeded"));

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act - 実装はSDKエラー時にフォールバックして静的分析のみを返す
      const result = await analyzer.analyze(createMockSkill());

      // Assert - エラーでもスコアは返る
      expect(result).toBeDefined();
      expect(result.skillName).toBe("test-skill");
    });

    it("SA-ADD-10: should handle partial JSON response", async () => {
      // Arrange
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: test\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方",
      );
      vi.mocked(fs.readdir).mockResolvedValue(["SKILL.md"] as any);

      // categories は存在するが suggestions がない
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          categories: [
            { name: "prompt", score: 80, details: "Good", issues: [] },
          ],
        }),
      });

      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act
      const result = await analyzer.analyze(createMockSkill());

      // Assert - デフォルト値が適用されるはず
      expect(result.suggestions).toBeDefined();
      expect(result.risks).toBeDefined();
    });
  });

  describe("boundary value tests", () => {
    it("SA-ADD-11: should handle very long skill name", async () => {
      // Arrange
      const longName = "a".repeat(200);
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        `---\nname: ${longName}\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方`,
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
      const result = await analyzer.analyze(
        createMockSkill({ name: longName }),
      );

      // Assert
      expect(result.skillName).toBe(longName);
    });

    it("SA-ADD-12: should reject skill name with dangerous special characters", async () => {
      // Arrange
      const analyzer = new SkillAnalyzer(testSkillsDir, mockQuery);

      // Act & Assert - 実装は < > : " | ? * を無効な文字としてブロック
      await expect(
        analyzer.analyze(createMockSkill({ name: "skill<script>" })),
      ).rejects.toThrow(/無効な文字/);
    });

    it("SA-ADD-13: should handle skill name with unicode characters", async () => {
      // Arrange
      const unicodeName = "日本語スキル-テスト";
      vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
      vi.mocked(fs.readFile).mockResolvedValue(
        `---\nname: ${unicodeName}\n---\n# Test\n\n## 概要\nテスト\n\n## 使い方\n使い方`,
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
      const result = await analyzer.analyze(
        createMockSkill({ name: unicodeName }),
      );

      // Assert
      expect(result.skillName).toBe(unicodeName);
    });
  });
});
