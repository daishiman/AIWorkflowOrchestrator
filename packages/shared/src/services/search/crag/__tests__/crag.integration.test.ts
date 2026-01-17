/**
 * @file CRAG 統合テスト
 * @description CONV-07-06: Corrective RAG - 統合テスト（LLM連携・データフロー・エラーハンドリング）
 *
 * TDD Phase: Red - 実装前のテスト作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockLLMClient,
  createMockFusedResults,
  createMockWebSearcher,
  LLM_RESPONSES,
  WEB_SEARCH_RESULTS,
} from "./test-helpers";

// =============================================================================
// テスト対象のインポート
// =============================================================================

import { RelevanceEvaluator } from "../relevance-evaluator";
import { CorrectiveRAG } from "../corrective-rag";

// =============================================================================
// LLM連携統合テスト
// =============================================================================

describe("CRAG Integration - LLM連携", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LLMプロンプト送信", () => {
    it("正しい形式のプロンプトをLLMに送信する (INT-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      // Act
      await evaluator.evaluate("test query", results);

      // Assert
      expect(mockLLM.complete).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(mockLLM.complete).mock.calls[0][0];
      expect(callArgs.prompt).toContain("test query");
      expect(callArgs.prompt).toContain("relevance");
      expect(callArgs.temperature).toBe(0);
      expect(callArgs.maxTokens).toBeLessThanOrEqual(500);
    });

    it("検索結果をプロンプトに含める (INT-001b)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(3);

      // Act
      await evaluator.evaluate("query", results);

      // Assert
      const callArgs = vi.mocked(mockLLM.complete).mock.calls[0][0];
      // 検索結果のコンテンツがプロンプトに含まれている
      expect(callArgs.prompt).toContain("Test content");
    });
  });

  describe("LLMレスポンス処理", () => {
    it("JSONレスポンスを正しくパースする (INT-002)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [
            { score: 8, reason: "Good match" },
            { score: 6, reason: "Partial match" },
          ],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      // Act
      const evaluation = await evaluator.evaluate("query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.individualScores).toHaveLength(2);
        expect(evaluation.data.individualScores[0].score).toBeCloseTo(0.8, 1);
        expect(evaluation.data.individualScores[1].score).toBeCloseTo(0.6, 1);
      }
    });

    it("LLM APIエラーをResult.err()で伝播する (INT-004)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        shouldFail: true,
        error: new Error("LLM service unavailable"),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      // Act
      const evaluation = await evaluator.evaluate("query", results);

      // Assert
      expect(evaluation.success).toBe(false);
    });

    it("パース失敗時にデフォルト値を適用する (INT-005)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: "Invalid JSON response",
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      // Act
      const evaluation = await evaluator.evaluate("query", results);

      // Assert
      // パースエラー時はフォールバック値を使用
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.overallScore).toBeCloseTo(0.5, 1);
      }
    });
  });
});

// =============================================================================
// データフロー統合テスト
// =============================================================================

describe("CRAG Integration - データフロー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("完全なデータフロー", () => {
    it("入力から出力まで正しくデータが流れる (FLOW-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const crag = new CorrectiveRAG(evaluator, null, {});
      const inputResults = createMockFusedResults(3);

      // Act
      const output = await crag.process("test query", inputResults);

      // Assert
      expect(output.success).toBe(true);
      if (output.success) {
        expect(output.data.evaluation.relevanceScore).toBeGreaterThan(0.7);
        expect(output.data.evaluation.action).toBe("correct");
        expect(output.data.results).toHaveLength(3);
      }
    });

    it("FusedSearchResultのメタデータが保持される (FLOW-002)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const crag = new CorrectiveRAG(evaluator, null, {});
      const inputResults = createMockFusedResults(2);

      // Act
      const output = await crag.process("query", inputResults);

      // Assert
      expect(output.success).toBe(true);
      if (output.success) {
        // メタデータが保持されている
        output.data.results.forEach((result, i) => {
          expect(result.metadata).toEqual(inputResults[i].metadata);
        });
      }
    });

    it("LLMスコア（0-10）を正規化スコア（0-1）に変換する (FLOW-003)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: 7, reason: "Good" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(1);

      // Act
      const evaluation = await evaluator.evaluate("query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // LLMスコア7（0-10）が0.7（0-1）に正規化される
        expect(evaluation.data.individualScores[0].score).toBeCloseTo(0.7, 1);
      }
    });
  });
});

// =============================================================================
// エラーハンドリング統合テスト
// =============================================================================

describe("CRAG Integration - エラーハンドリング", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("LLM API障害", () => {
    it("LLM API障害時にResult.err()を返す（例外をthrowしない） (ERR-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        shouldFail: true,
        error: new Error("LLM service unavailable"),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const crag = new CorrectiveRAG(evaluator, null, {});
      const results = createMockFusedResults(2);

      // Act & Assert
      // 例外がthrowされないことを確認
      await expect(crag.process("query", results)).resolves.toBeDefined();

      const output = await crag.process("query", results);
      expect(output.success).toBe(false);
    });
  });

  describe("Web検索API障害", () => {
    it("Web検索API障害時にResult.err()を返す (ERR-002)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.LOW_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const mockWebSearcher = createMockWebSearcher({
        shouldFail: true,
        error: new Error("Web search API unavailable"),
      });
      const crag = new CorrectiveRAG(evaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const output = await crag.process("query", results);

      // Assert
      expect(output.success).toBe(false);
    });
  });

  describe("不正なLLMレスポンス", () => {
    it("不正なJSONでフォールバック処理が機能する (ERR-003)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: "Not a valid JSON",
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const crag = new CorrectiveRAG(evaluator, null, {});
      const results = createMockFusedResults(2);

      // Act
      const output = await crag.process("query", results);

      // Assert
      // フォールバック処理が機能して結果が返される
      expect(output.success).toBe(true);
      if (output.success) {
        // デフォルトスコア（0.5）でambiguousと判定
        expect(output.data.evaluation.action).toBe("ambiguous");
      }
    });
  });
});

// =============================================================================
// Web検索連携統合テスト
// =============================================================================

describe("CRAG Integration - Web検索連携", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("incorrect時のWeb検索", () => {
    it("incorrect判定時にWeb検索を実行する (WEB-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.LOW_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(evaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      await crag.process("test query", results);

      // Assert
      expect(mockWebSearcher.search).toHaveBeenCalledTimes(1);
      expect(mockWebSearcher.search).toHaveBeenCalledWith(
        "test query",
        expect.any(Number),
      );
    });

    it("augmentedContextが正しく構築される (WEB-002)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.LOW_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const mockWebSearcher = createMockWebSearcher({
        results: [
          {
            title: "Test Title",
            url: "https://example.com",
            snippet: "Test snippet content",
          },
        ],
      });
      const crag = new CorrectiveRAG(evaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const output = await crag.process("query", results);

      // Assert
      expect(output.success).toBe(true);
      if (output.success) {
        expect(output.data.augmentedContext).toContain("Test Title");
        expect(output.data.augmentedContext).toContain("Test snippet");
      }
    });

    it("enableWebSearch=falseでWeb検索が呼ばれない (WEB-004)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.LOW_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(evaluator, mockWebSearcher, {
        enableWebSearch: false, // 無効
      });
      const results = createMockFusedResults(2);

      // Act
      await crag.process("query", results);

      // Assert
      expect(mockWebSearcher.search).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// パイプライン統合テスト
// =============================================================================

describe("CRAG Integration - パイプライン", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("correct → correct結果返却のパイプライン", async () => {
    // Arrange
    const mockLLM = createMockLLMClient({
      response: LLM_RESPONSES.HIGH_RELEVANCE,
    });
    const evaluator = new RelevanceEvaluator(mockLLM);
    const crag = new CorrectiveRAG(evaluator, null, {});
    const results = createMockFusedResults(3);

    // Act
    const output = await crag.process("query", results);

    // Assert
    expect(output.success).toBe(true);
    if (output.success) {
      expect(output.data.evaluation.action).toBe("correct");
      expect(output.data.results).toHaveLength(3);
      expect(output.data.augmentedContext).toBeUndefined();
    }
  });

  it("incorrect → Web検索 → augmentedContextのパイプライン", async () => {
    // Arrange
    const mockLLM = createMockLLMClient({
      response: LLM_RESPONSES.LOW_RELEVANCE,
    });
    const evaluator = new RelevanceEvaluator(mockLLM);
    const mockWebSearcher = createMockWebSearcher({
      results: WEB_SEARCH_RESULTS.STANDARD,
    });
    const crag = new CorrectiveRAG(evaluator, mockWebSearcher, {
      enableWebSearch: true,
    });
    const results = createMockFusedResults(2);

    // Act
    const output = await crag.process("query", results);

    // Assert
    expect(output.success).toBe(true);
    if (output.success) {
      expect(output.data.evaluation.action).toBe("incorrect");
      expect(output.data.results).toHaveLength(0);
      expect(output.data.augmentedContext).toBeDefined();
    }
  });

  it("ambiguous → フィルタリングのパイプライン", async () => {
    // Arrange
    const mockLLM = createMockLLMClient({
      response: LLM_RESPONSES.MIXED_RELEVANCE,
    });
    const evaluator = new RelevanceEvaluator(mockLLM);
    const crag = new CorrectiveRAG(evaluator, null, {});
    const results = createMockFusedResults(3);

    // Act
    const output = await crag.process("query", results);

    // Assert
    expect(output.success).toBe(true);
    if (output.success) {
      expect(output.data.evaluation.action).toBe("ambiguous");
      // フィルタ後の結果数は入力より少ない可能性
      expect(output.data.results.length).toBeLessThanOrEqual(3);
    }
  });
});
