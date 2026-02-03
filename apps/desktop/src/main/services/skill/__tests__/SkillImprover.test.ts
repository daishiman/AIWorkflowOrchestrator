/**
 * SkillImprover テスト
 * TDD: Green Phase - 実装に合わせてテストを更新
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import type {
  SkillAnalysis,
  Suggestion,
  ImprovementOptions,
} from "@repo/shared";
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

describe("SkillImprover", () => {
  const testSkillsDir = "/test/skills";

  const mockAnalysis: SkillAnalysis = {
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
      {
        type: "documentation",
        priority: "low",
        description: "使用例を追加",
        autoFixable: false,
      },
    ],
    risks: [],
  };

  // モックquery関数
  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのモック設定
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.cp).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("applyImprovements", () => {
    it("SI-01: should apply auto-fixable improvements", async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue("# Test SKILL.md\nContent");

      mockQuery.mockResolvedValueOnce({
        content: "# Improved SKILL.md\n\nBetter content",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);
      const options: ImprovementOptions = { autoFix: true };

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        mockAnalysis,
        options,
      );

      // Assert
      expect(result.applied.length).toBe(1);
      expect(result.applied[0].suggestion.type).toBe("prompt");
      expect(result.skipped.length).toBe(1);
      expect(result.skipped[0].type).toBe("documentation");
    });

    it("SI-02: should execute prompt improvement", async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue("# Old Content");

      mockQuery.mockResolvedValueOnce({
        content: "# Improved SKILL.md\n\nBetter prompt content",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      const singlePromptAnalysis: SkillAnalysis = {
        ...mockAnalysis,
        suggestions: [
          {
            type: "prompt",
            priority: "high",
            description: "改善1",
            autoFixable: true,
          },
        ],
      };

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        singlePromptAnalysis,
        { autoFix: true },
      );

      // Assert
      expect(fs.writeFile).toHaveBeenCalled();
      expect(result.applied.length).toBe(1);
      expect(result.applied[0].result).toBe("success");
    });

    it("SI-03: should execute structure improvement", async () => {
      // Arrange
      const structureSuggestion: Suggestion = {
        type: "structure",
        priority: "medium",
        description: "エージェントファイルを追加",
        autoFixable: true,
      };

      const structureAnalysis: SkillAnalysis = {
        ...mockAnalysis,
        suggestions: [structureSuggestion],
      };

      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          create: [{ path: "agents/helper.md", content: "# Helper Agent" }],
          modify: [],
          delete: [],
        }),
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        structureAnalysis,
        { autoFix: true },
      );

      // Assert
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
      expect(result.applied.length).toBe(1);
    });

    it("SI-04: should create backup before improvements", async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue("# Content");

      mockQuery.mockResolvedValueOnce({
        content: "# Improved Content",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      await improver.applyImprovements("test-skill", mockAnalysis, {
        autoFix: true,
      });

      // Assert - バックアップディレクトリに fs.cp が呼ばれたことを確認
      expect(fs.cp).toHaveBeenCalledWith(
        expect.stringContaining("test-skill"),
        expect.stringContaining(".backup"),
        expect.anything(),
      );
    });

    it("SI-05: should handle errors during improvement", async () => {
      // Arrange: 最初の改善は成功、2番目は失敗
      vi.mocked(fs.readFile).mockResolvedValue("# Content");

      mockQuery
        .mockResolvedValueOnce({ content: "# improved content" })
        .mockRejectedValueOnce(new Error("SDK Error"));

      const analysisWithMultiple: SkillAnalysis = {
        ...mockAnalysis,
        suggestions: [
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
        ],
      };

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        analysisWithMultiple,
        { autoFix: true },
      );

      // Assert
      expect(result.applied.length).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain("SDK Error");
    });

    it("SI-06: should handle empty suggestions", async () => {
      // Arrange
      const emptyAnalysis: SkillAnalysis = {
        ...mockAnalysis,
        suggestions: [],
      };

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        emptyAnalysis,
      );

      // Assert
      expect(result.applied).toEqual([]);
      expect(result.skipped).toEqual([]);
      expect(result.errors).toEqual([]);
    });
  });

  describe("restoreFromBackup", () => {
    it("should restore from latest backup", async () => {
      // Arrange
      vi.mocked(fs.readdir).mockResolvedValue([
        "test-skill.backup.2024-01-01T00-00-00",
        "test-skill.backup.2024-01-02T00-00-00",
      ] as any);

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act
      await improver.restoreFromBackup("test-skill");

      // Assert
      expect(fs.cp).toHaveBeenCalledWith(
        expect.stringContaining("2024-01-02"), // 最新のバックアップ
        expect.stringContaining("test-skill"),
        expect.anything(),
      );
    });

    it("should throw error if backup does not exist", async () => {
      // Arrange
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      const improver = new SkillImprover(testSkillsDir, mockQuery);

      // Act & Assert
      await expect(improver.restoreFromBackup("test-skill")).rejects.toThrow(
        /バックアップが見つかりません/,
      );
    });
  });

  describe("options filtering", () => {
    it("should filter by types", async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue("# Content");

      // documentationタイプのみをフィルタするが、autoFixable=falseなのでスキップされる
      const improver = new SkillImprover(testSkillsDir, mockQuery);
      const options: ImprovementOptions = {
        types: ["documentation"],
        autoFix: true,
      };

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        mockAnalysis,
        options,
      );

      // Assert
      // promptタイプはフィルタで除外されてskippedに入る
      // documentationタイプはフィルタを通過するがautoFixable=falseなのでスキップ
      expect(result.skipped.some((s) => s.type === "prompt")).toBe(true);
      expect(result.skipped.some((s) => s.type === "documentation")).toBe(true);
      expect(result.applied.length).toBe(0);
    });

    it("should filter by minPriority", async () => {
      // Arrange
      vi.mocked(fs.readFile).mockResolvedValue("# Content");

      mockQuery.mockResolvedValueOnce({
        content: "# Improved",
      });

      const improver = new SkillImprover(testSkillsDir, mockQuery);
      const options: ImprovementOptions = {
        minPriority: "medium",
        autoFix: true,
      };

      // Act
      const result = await improver.applyImprovements(
        "test-skill",
        mockAnalysis,
        options,
      );

      // Assert
      // lowプライオリティはスキップされる
      expect(result.skipped.some((s) => s.priority === "low")).toBe(true);
    });
  });
});
