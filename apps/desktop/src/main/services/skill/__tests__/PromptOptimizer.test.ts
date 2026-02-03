/**
 * PromptOptimizer テスト
 * TDD: Green Phase - 実装に合わせてテストを更新
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PromptOptimizer } from "../PromptOptimizer";

describe("PromptOptimizer", () => {
  // モックquery関数
  const mockQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("optimize", () => {
    it("PO-01: should optimize prompt and return result", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          optimized: "最適化されたプロンプト",
          changes: ["曖昧な表現を具体化", "出力形式を明確化"],
          metrics: {
            clarityScore: 85,
            specificityScore: 90,
            completenessScore: 80,
          },
        }),
      });

      const optimizer = new PromptOptimizer(mockQuery);
      const inputPrompt = "ファイルを読んで";

      // Act
      const result = await optimizer.optimize(inputPrompt);

      // Assert
      expect(result).toBeDefined();
      expect(result.original).toBe(inputPrompt);
      expect(result.optimized).toBe("最適化されたプロンプト");
      expect(result.changes.length).toBe(2);
      expect(result.metrics.clarityScore).toBe(85);
      expect(result.metrics.specificityScore).toBe(90);
      expect(result.metrics.completenessScore).toBe(80);
    });

    it("PO-04: should throw error for empty prompt", async () => {
      // Arrange
      const optimizer = new PromptOptimizer(mockQuery);

      // Act & Assert
      await expect(optimizer.optimize("")).rejects.toThrow(
        /プロンプトが空です/,
      );
      await expect(optimizer.optimize("   ")).rejects.toThrow(
        /プロンプトが空です/,
      );
    });

    it("PO-05: should handle very long prompt (10000 chars)", async () => {
      // Arrange
      const longPrompt = "a".repeat(10000);
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          optimized: "optimized long prompt",
          changes: ["shortened"],
          metrics: {
            clarityScore: 70,
            specificityScore: 60,
            completenessScore: 80,
          },
        }),
      });

      const optimizer = new PromptOptimizer(mockQuery);

      // Act
      const result = await optimizer.optimize(longPrompt);

      // Assert
      expect(result).toBeDefined();
      expect(result.original).toBe(longPrompt);
    });
  });

  describe("generateVariants", () => {
    it("PO-02: should generate multiple variants", async () => {
      // Arrange
      const variants = [
        "バリアント1: 簡潔版",
        "バリアント2: 詳細版",
        "バリアント3: 構造化版",
      ];
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify(variants),
      });

      const optimizer = new PromptOptimizer(mockQuery);
      const inputPrompt = "コードをレビューして";

      // Act
      const result = await optimizer.generateVariants(inputPrompt, 3);

      // Assert
      expect(result).toEqual(variants);
      expect(result.length).toBe(3);
    });

    it("should use default count of 3", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify(["v1", "v2", "v3"]),
      });

      const optimizer = new PromptOptimizer(mockQuery);

      // Act
      const result = await optimizer.generateVariants("prompt");

      // Assert
      expect(result.length).toBe(3);
    });

    it("should throw error for invalid count", async () => {
      // Arrange
      const optimizer = new PromptOptimizer(mockQuery);

      // Act & Assert
      await expect(optimizer.generateVariants("prompt", 0)).rejects.toThrow(
        /1以上/,
      );
      await expect(optimizer.generateVariants("prompt", -1)).rejects.toThrow(
        /1以上/,
      );
    });
  });

  describe("evaluate", () => {
    it("PO-03: should evaluate prompt and return score", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          score: 75,
          breakdown: {
            clarity: 80,
            specificity: 70,
            completeness: 75,
            reproducibility: 75,
            security: 80,
          },
          feedback: [
            "出力形式を明確にするとよい",
            "具体的な例を追加するとよい",
          ],
        }),
      });

      const optimizer = new PromptOptimizer(mockQuery);
      const inputPrompt = "このファイルを分析して";

      // Act
      const result = await optimizer.evaluate(inputPrompt);

      // Assert
      expect(result).toBeDefined();
      expect(result.score).toBe(75);
      expect(result.feedback.length).toBe(2);
    });

    it("should throw error for empty prompt in evaluate", async () => {
      // Arrange
      const optimizer = new PromptOptimizer(mockQuery);

      // Act & Assert
      await expect(optimizer.evaluate("")).rejects.toThrow(
        /プロンプトが空です/,
      );
    });

    it("should return score in valid range (0-100)", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: JSON.stringify({
          score: 85,
          feedback: [],
        }),
      });

      const optimizer = new PromptOptimizer(mockQuery);

      // Act
      const result = await optimizer.evaluate("test prompt");

      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe("SDK error handling", () => {
    it("should handle SDK timeout", async () => {
      // Arrange
      mockQuery.mockRejectedValueOnce(new Error("Timeout"));

      const optimizer = new PromptOptimizer(mockQuery);

      // Act & Assert
      await expect(optimizer.optimize("prompt")).rejects.toThrow("Timeout");
    });

    it("should handle malformed JSON response", async () => {
      // Arrange
      mockQuery.mockResolvedValueOnce({
        content: "not valid json",
      });

      const optimizer = new PromptOptimizer(mockQuery);

      // Act & Assert
      await expect(optimizer.optimize("prompt")).rejects.toThrow(/パース/);
    });
  });
});
