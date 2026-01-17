/**
 * @file CorrectiveRAG ユニットテスト
 * @description CONV-07-06: Corrective RAG - CorrectiveRAG TDD テスト
 *
 * TDD Phase: Red - 実装前のテスト作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ChunkId } from "../../../../types/rag/branded";
import type { FusedSearchResult } from "../../fusion/types";
import {
  createMockEvaluator,
  createMockFusedResults,
  createMockWebSearcher,
  WEB_SEARCH_RESULTS,
} from "./test-helpers";

// =============================================================================
// テスト対象のインポート
// =============================================================================

import { CorrectiveRAG } from "../corrective-rag";

// =============================================================================
// テストスイート
// =============================================================================

describe("CorrectiveRAG", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("process", () => {
    // -------------------------------------------------------------------------
    // CR-001: correct判定時に結果をそのまま返す
    // -------------------------------------------------------------------------
    it("'correct'評価時に結果をそのまま返す (CR-001)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "correct",
        overallScore: 0.85,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        enableWebSearch: false,
      });
      const results = createMockFusedResults(3);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.evaluation.action).toBe("correct");
        expect(processed.data.results).toHaveLength(3);
        expect(processed.data.results).toEqual(results);
        expect(processed.data.augmentedContext).toBeUndefined();
      }
    });

    // -------------------------------------------------------------------------
    // CR-002: incorrect判定+Web検索有効でaugmentedContextを設定
    // -------------------------------------------------------------------------
    it("'incorrect'評価時にWeb検索で補強する (CR-002)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.15,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.evaluation.action).toBe("incorrect");
        expect(processed.data.results).toHaveLength(0);
        expect(processed.data.augmentedContext).toBeDefined();
        expect(processed.data.augmentedContext).toContain("TypeScript");
      }
    });

    // -------------------------------------------------------------------------
    // CR-003: incorrect判定+Web検索無効で空結果を返す
    // -------------------------------------------------------------------------
    it("'incorrect'評価時（Web検索無効）に空の結果を返す (CR-003)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        enableWebSearch: false,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.evaluation.action).toBe("incorrect");
        expect(processed.data.results).toHaveLength(0);
        expect(processed.data.augmentedContext).toBeUndefined();
      }
    });

    // -------------------------------------------------------------------------
    // CR-004: ambiguous判定時に低スコア結果をフィルタする
    // -------------------------------------------------------------------------
    it("'ambiguous'評価時に低スコア結果をフィルタする (CR-004)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "ambiguous",
        overallScore: 0.5,
        individualScores: [
          { chunkId: "chunk-0" as ChunkId, score: 0.6, reason: "Good" },
          { chunkId: "chunk-1" as ChunkId, score: 0.3, reason: "Weak" }, // フィルタ対象
          { chunkId: "chunk-2" as ChunkId, score: 0.5, reason: "OK" },
        ],
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        ambiguousFilterThreshold: 0.4, // 0.4未満をフィルタ
      });
      const results = createMockFusedResults(3);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.evaluation.action).toBe("ambiguous");
        expect(processed.data.results).toHaveLength(2); // 0.3のものがフィルタされる
      }
    });

    // -------------------------------------------------------------------------
    // CR-005: ambiguous判定+結果不足時にWeb検索で補強
    // -------------------------------------------------------------------------
    it("'ambiguous'評価時に結果不足でWeb検索で補強する (CR-005)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "ambiguous",
        overallScore: 0.5,
        individualScores: [
          { chunkId: "chunk-0" as ChunkId, score: 0.5, reason: "OK" },
        ],
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
        minResultsBeforeWebSearch: 3, // 3件未満でWeb検索
      });
      const results = createMockFusedResults(1);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.augmentedContext).toBeDefined();
      }
    });

    // -------------------------------------------------------------------------
    // CR-006: Knowledge Refinement有効時に不要情報を除去
    // -------------------------------------------------------------------------
    it("Knowledge Refinement有効時に不要情報を除去する (CR-006)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "correct",
        overallScore: 0.8,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        enableRefinement: true,
      });
      const results = createMockFusedResults(3);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        // refinementが実行された場合、correctionsにrefineアクションが含まれる
        const hasRefineAction = processed.data.evaluation.corrections.some(
          (c) => c.type === "refine",
        );
        expect(hasRefineAction).toBe(true);
      }
    });

    // -------------------------------------------------------------------------
    // CR-007: 評価エラー時にResult.err()を返す
    // -------------------------------------------------------------------------
    it("評価エラー時にResult.err()を返す (CR-007)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        shouldFail: true,
        error: new Error("Evaluation failed"),
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {});
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(false);
      if (!processed.success && processed.error) {
        expect(processed.error.message).toContain("Evaluation failed");
      }
    });
  });

  // ===========================================================================
  // correctionsアクション検証
  // ===========================================================================

  describe("corrections アクション", () => {
    it("correct時にkeepアクションを記録する", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "correct",
        overallScore: 0.9,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {});
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        const hasKeepAction = processed.data.evaluation.corrections.some(
          (c) => c.type === "keep",
        );
        expect(hasKeepAction).toBe(true);
      }
    });

    it("incorrect時にdiscardアクションを記録する", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        enableWebSearch: false,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        const hasDiscardAction = processed.data.evaluation.corrections.some(
          (c) => c.type === "discard",
        );
        expect(hasDiscardAction).toBe(true);
      }
    });

    it("Web検索実行時にweb_searchアクションを記録する", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        const hasWebSearchAction = processed.data.evaluation.corrections.some(
          (c) => c.type === "web_search",
        );
        expect(hasWebSearchAction).toBe(true);
      }
    });
  });

  // ===========================================================================
  // Web検索連携テスト
  // ===========================================================================

  describe("Web検索連携", () => {
    it("incorrect時にWeb検索を呼び出す", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
        webSearchLimit: 5,
      });
      const results = createMockFusedResults(2);

      // Act
      await crag.process("test query", results);

      // Assert
      expect(mockWebSearcher.search).toHaveBeenCalledTimes(1);
      expect(mockWebSearcher.search).toHaveBeenCalledWith("test query", 5);
    });

    it("Web検索無効時はWeb検索を呼び出さない", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: false, // 無効
      });
      const results = createMockFusedResults(2);

      // Act
      await crag.process("test query", results);

      // Assert
      expect(mockWebSearcher.search).not.toHaveBeenCalled();
    });

    it("Web検索失敗時にエラーを伝播する", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        shouldFail: true,
        error: new Error("Web search failed"),
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      // Web検索失敗時もResult型でエラーを返す（例外をthrowしない）
      // オプション：エラーを無視して空結果を返すか、エラーを伝播するか
      // ここではエラーを伝播する設計を想定
      expect(processed.success).toBe(false);
    });

    it("augmentedContextに検索結果を正しく構築する", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: [
          {
            title: "Test Result",
            url: "https://example.com",
            snippet: "Test snippet content",
          },
        ],
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.augmentedContext).toContain("Test Result");
        expect(processed.data.augmentedContext).toContain("Test snippet");
      }
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================

  describe("境界値テスト", () => {
    it("空の入力結果を処理する", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {});
      const results: FusedSearchResult[] = [];

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.results).toHaveLength(0);
      }
    });

    it("ambiguousFilterThreshold境界でフィルタする", async () => {
      // Arrange: 閾値0.4でちょうど0.4のスコアは保持される
      const mockEvaluator = createMockEvaluator({
        action: "ambiguous",
        overallScore: 0.5,
        individualScores: [
          { chunkId: "chunk-0" as ChunkId, score: 0.4, reason: "Border" }, // 境界
          { chunkId: "chunk-1" as ChunkId, score: 0.39, reason: "Below" }, // 閾値未満
        ],
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        ambiguousFilterThreshold: 0.4,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        // 0.4は保持、0.39は除外
        expect(processed.data.results).toHaveLength(1);
      }
    });

    it("minResultsBeforeWebSearch境界でWeb検索実行", async () => {
      // Arrange: minResults=3で、フィルタ後2件ならWeb検索
      const mockEvaluator = createMockEvaluator({
        action: "ambiguous",
        overallScore: 0.5,
        individualScores: [
          { chunkId: "chunk-0" as ChunkId, score: 0.5, reason: "OK" },
          { chunkId: "chunk-1" as ChunkId, score: 0.5, reason: "OK" },
        ],
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
        minResultsBeforeWebSearch: 3, // 3件未満でWeb検索
      });
      const results = createMockFusedResults(2);

      // Act
      await crag.process("query", results);

      // Assert: 2件 < 3件なのでWeb検索が呼ばれる
      expect(mockWebSearcher.search).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 追加カバレッジテスト (Phase 6)
  // ===========================================================================

  describe("追加カバレッジテスト", () => {
    // -------------------------------------------------------------------------
    // CR-008: 空の入力結果 + Web検索有効で補強を試みる
    // -------------------------------------------------------------------------
    it("空の入力結果でWeb検索有効時にaugmentedContextを返す (CR-008)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: WEB_SEARCH_RESULTS.STANDARD,
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results: FusedSearchResult[] = [];

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        expect(processed.data.results).toHaveLength(0);
        expect(processed.data.augmentedContext).toBeDefined();
        expect(processed.data.evaluation.corrections).toContainEqual(
          expect.objectContaining({ type: "web_search" }),
        );
      }
    });

    // -------------------------------------------------------------------------
    // CR-009: Web検索結果が空の場合の処理
    // -------------------------------------------------------------------------
    it("Web検索結果が空の場合はaugmentedContextを設定しない (CR-009)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: [], // 空の検索結果
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        // Web検索結果が空なのでaugmentedContextは空文字列
        expect(processed.data.augmentedContext).toBe("");
      }
    });

    // -------------------------------------------------------------------------
    // CR-010: webSearcherがnullの場合のperformWebSearch
    // -------------------------------------------------------------------------
    it("webSearcherがnullでWeb検索有効時はWeb検索をスキップ (CR-010)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      // webSearcherをnullにして、enableWebSearchをtrueにする
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        // webSearcherがnullなのでaugmentedContextは設定されない
        expect(processed.data.augmentedContext).toBeUndefined();
      }
    });

    // -------------------------------------------------------------------------
    // CR-011: 複数Web検索結果のフォーマット検証
    // -------------------------------------------------------------------------
    it("複数Web検索結果を正しくフォーマットする (CR-011)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: [
          {
            title: "First Result",
            url: "https://first.example.com",
            snippet: "First snippet",
          },
          {
            title: "Second Result",
            url: "https://second.example.com",
            snippet: "Second snippet",
          },
        ],
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        const context = processed.data.augmentedContext!;
        // [1] First Result のフォーマット
        expect(context).toContain("[1]");
        expect(context).toContain("First Result");
        expect(context).toContain("https://first.example.com");
        expect(context).toContain("First snippet");
        // [2] Second Result のフォーマット
        expect(context).toContain("[2]");
        expect(context).toContain("Second Result");
        expect(context).toContain("https://second.example.com");
        expect(context).toContain("Second snippet");
      }
    });

    // -------------------------------------------------------------------------
    // CR-012: ambiguous時のWeb検索が成功しても結果が空の場合
    // -------------------------------------------------------------------------
    it("ambiguous時Web検索が空結果ならaugmentedContextを設定しない (CR-012)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "ambiguous",
        overallScore: 0.5,
        individualScores: [
          { chunkId: "chunk-0" as ChunkId, score: 0.5, reason: "OK" },
        ],
      });
      const mockWebSearcher = createMockWebSearcher({
        results: [], // 空の検索結果
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
        minResultsBeforeWebSearch: 3,
      });
      const results = createMockFusedResults(1);

      // Act
      const processed = await crag.process("query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success && processed.data) {
        // Web検索結果が空なのでaugmentedContextは設定されない
        expect(processed.data.augmentedContext).toBeUndefined();
      }
    });
  });

  // ===========================================================================
  // evaluator呼び出し検証
  // ===========================================================================

  describe("evaluator呼び出し", () => {
    it("evaluatorを正しく呼び出す", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "correct",
        overallScore: 0.8,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {});
      const results = createMockFusedResults(3);

      // Act
      await crag.process("test query", results);

      // Assert
      expect(mockEvaluator.evaluate).toHaveBeenCalledTimes(1);
      expect(mockEvaluator.evaluate).toHaveBeenCalledWith(
        "test query",
        results,
      );
    });
  });
});
