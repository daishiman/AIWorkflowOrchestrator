/**
 * @file RelevanceEvaluator ユニットテスト
 * @description CONV-07-06: Corrective RAG - RelevanceEvaluator TDD テスト
 *
 * TDD Phase: Red - 実装前のテスト作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FusedSearchResult } from "../../fusion/types";
import {
  createMockLLMClient,
  createMockFusedResults,
  LLM_RESPONSES,
} from "./test-helpers";

// =============================================================================
// テスト対象のインポート
// =============================================================================

import { RelevanceEvaluator } from "../relevance-evaluator";

// =============================================================================
// テストスイート
// =============================================================================

describe("RelevanceEvaluator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("evaluate", () => {
    // -------------------------------------------------------------------------
    // RE-001: 高関連性結果を"correct"と評価する
    // -------------------------------------------------------------------------
    it("高関連性の結果を'correct'と評価する (RE-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(3, { min: 0.8, max: 0.9 });

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe("correct");
        expect(evaluation.data.overallScore).toBeGreaterThanOrEqual(0.7);
      }
    });

    // -------------------------------------------------------------------------
    // RE-002: 低関連性結果を"incorrect"と評価する
    // -------------------------------------------------------------------------
    it("低関連性の結果を'incorrect'と評価する (RE-002)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.LOW_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2, { min: 0.1, max: 0.2 });

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe("incorrect");
        expect(evaluation.data.overallScore).toBeLessThanOrEqual(0.3);
      }
    });

    // -------------------------------------------------------------------------
    // RE-003: 混在した関連性を"ambiguous"と評価する
    // -------------------------------------------------------------------------
    it("混在した関連性を'ambiguous'と評価する (RE-003)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.MIXED_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(3, { min: 0.3, max: 0.8 });

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe("ambiguous");
        expect(evaluation.data.overallScore).toBeGreaterThan(0.3);
        expect(evaluation.data.overallScore).toBeLessThan(0.7);
      }
    });

    // -------------------------------------------------------------------------
    // RE-004: 空の結果を"incorrect"と評価する
    // -------------------------------------------------------------------------
    it("空の結果を'incorrect'と評価する (RE-004)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({});
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results: FusedSearchResult[] = [];

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe("incorrect");
        expect(evaluation.data.overallScore).toBe(0);
        expect(evaluation.data.individualScores).toHaveLength(0);
      }
    });

    // -------------------------------------------------------------------------
    // RE-005: LLM API失敗時にResult.err()を返す
    // -------------------------------------------------------------------------
    it("LLM API失敗時にResult.err()を返す (RE-005)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        shouldFail: true,
        error: new Error("LLM API timeout"),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(false);
      if (!evaluation.success) {
        expect(evaluation.error.message).toContain("LLM");
      }
    });

    // -------------------------------------------------------------------------
    // RE-006: 個別スコアを正しく計算する
    // -------------------------------------------------------------------------
    it("個別スコアを正しく計算する (RE-006)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [
            { score: 8, reason: "Good match" },
            { score: 6, reason: "Partial match" },
            { score: 4, reason: "Weak match" },
          ],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(3);

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.individualScores).toHaveLength(3);
        // スコアは0-10を0-1に正規化
        expect(evaluation.data.individualScores[0].score).toBeCloseTo(0.8, 1);
        expect(evaluation.data.individualScores[1].score).toBeCloseTo(0.6, 1);
        expect(evaluation.data.individualScores[2].score).toBeCloseTo(0.4, 1);
        // 各スコアにreasonとchunkIdが含まれる
        evaluation.data.individualScores.forEach((s) => {
          expect(s.reason).toBeDefined();
          expect(s.chunkId).toBeDefined();
        });
      }
    });

    // -------------------------------------------------------------------------
    // RE-007: 全体スコアを加重平均で計算する
    // -------------------------------------------------------------------------
    it("全体スコアを加重平均で計算する (RE-007)", async () => {
      // Arrange: weights = [1/1, 1/2, 1/3] = [1, 0.5, 0.333]
      // scores = [0.9, 0.8, 0.7]
      // weighted = (0.9*1 + 0.8*0.5 + 0.7*0.333) / (1 + 0.5 + 0.333)
      //          = (0.9 + 0.4 + 0.233) / 1.833 ≈ 0.837
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.WEIGHTED_TEST,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(3);

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // 加重平均: (0.9*1 + 0.8*0.5 + 0.7*0.333) / (1 + 0.5 + 0.333) ≈ 0.837
        expect(evaluation.data.overallScore).toBeGreaterThan(0.8);
        expect(evaluation.data.overallScore).toBeLessThan(0.9);
      }
    });

    // -------------------------------------------------------------------------
    // RE-008: カスタム閾値で評価する
    // -------------------------------------------------------------------------
    it("カスタム閾値で評価する (RE-008)", async () => {
      // Arrange: スコア0.75でデフォルトならcorrect、0.8閾値ならambiguous
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: 7.5, reason: "Good" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM, {
        correctThreshold: 0.8, // 0.7から0.8に引き上げ
        incorrectThreshold: 0.3,
      });
      const results = createMockFusedResults(1);

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.overallScore).toBeCloseTo(0.75, 1);
        expect(evaluation.data.action).toBe("ambiguous"); // 0.8未満なのでambiguous
      }
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================

  describe("境界値テスト - スコア閾値", () => {
    it.each([
      [0.69, "ambiguous"],
      [0.7, "correct"],
      [0.71, "correct"],
    ] as const)(
      "スコア%pで%sと判定する（correct閾値）",
      async (score, expected) => {
        const mockLLM = createMockLLMClient({
          response: JSON.stringify({
            evaluations: [{ score: score * 10, reason: "Test" }],
          }),
        });
        const evaluator = new RelevanceEvaluator(mockLLM);
        const results = createMockFusedResults(1);

        const evaluation = await evaluator.evaluate("query", results);

        expect(evaluation.success).toBe(true);
        if (evaluation.success) {
          expect(evaluation.data.action).toBe(expected);
        }
      },
    );

    it.each([
      [0.29, "incorrect"],
      [0.3, "incorrect"],
      [0.31, "ambiguous"],
    ] as const)(
      "スコア%pで%sと判定する（incorrect閾値）",
      async (score, expected) => {
        const mockLLM = createMockLLMClient({
          response: JSON.stringify({
            evaluations: [{ score: score * 10, reason: "Test" }],
          }),
        });
        const evaluator = new RelevanceEvaluator(mockLLM);
        const results = createMockFusedResults(1);

        const evaluation = await evaluator.evaluate("query", results);

        expect(evaluation.success).toBe(true);
        if (evaluation.success) {
          expect(evaluation.data.action).toBe(expected);
        }
      },
    );
  });

  describe("境界値テスト - 配列サイズ", () => {
    it("単一要素を正しく処理する", async () => {
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.SINGLE_HIGH,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(1);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.individualScores).toHaveLength(1);
      }
    });

    it("最大評価数（5件）まで評価する", async () => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: Array(5)
            .fill(null)
            .map(() => ({ score: 7, reason: "Good" })),
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM, { maxEvaluate: 5 });
      const results = createMockFusedResults(5);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.individualScores).toHaveLength(5);
      }
    });

    it("最大評価数を超える場合は上位のみ評価する", async () => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: Array(5)
            .fill(null)
            .map(() => ({ score: 7, reason: "Good" })),
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM, { maxEvaluate: 5 });
      const results = createMockFusedResults(10); // 10件だが5件のみ評価

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // 10件入力しても5件のみ評価される
        expect(evaluation.data.individualScores).toHaveLength(5);
      }
    });
  });

  // ===========================================================================
  // エラーハンドリングテスト
  // ===========================================================================

  describe("エラーハンドリング", () => {
    it("不正なJSONレスポンス時にフォールバックする", async () => {
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.INVALID_JSON,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      const evaluation = await evaluator.evaluate("query", results);

      // パースエラー時はフォールバック値（score: 0.5）を使用
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.overallScore).toBeCloseTo(0.5, 1);
        expect(evaluation.data.action).toBe("ambiguous");
      }
    });

    it("空の評価配列時にフォールバックする", async () => {
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.EMPTY_EVALUATIONS,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // 評価がない場合はデフォルトスコアを使用
        expect(evaluation.data.overallScore).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ===========================================================================
  // 追加カバレッジテスト (Phase 6)
  // ===========================================================================

  describe("追加カバレッジテスト", () => {
    // -------------------------------------------------------------------------
    // RE-009: LLMが返す評価数が不足している場合にフォールバック補完する
    // -------------------------------------------------------------------------
    it("LLM評価数が不足している場合にフォールバック補完する (RE-009)", async () => {
      // LLMが2件の結果に対して1件しか評価を返さない
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: 8, reason: "Good match" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(3); // 3件の結果

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // 3件分の評価が返される（不足分はフォールバック値5で補完）
        expect(evaluation.data.individualScores).toHaveLength(3);
        // 最初の1件はLLMからの評価
        expect(evaluation.data.individualScores[0].score).toBeCloseTo(0.8, 1);
        // 残りの2件はフォールバック値（5/10 = 0.5）
        expect(evaluation.data.individualScores[1].score).toBeCloseTo(0.5, 1);
        expect(evaluation.data.individualScores[2].score).toBeCloseTo(0.5, 1);
      }
    });

    // -------------------------------------------------------------------------
    // RE-010: 評価配列が空でオブジェクト構造が不正な場合のフォールバック
    // -------------------------------------------------------------------------
    it("評価配列が欠損している場合にフォールバックする (RE-010)", async () => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          // evaluations配列がない
          otherField: "value",
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // フォールバック処理が適用される
        expect(evaluation.data.overallScore).toBeCloseTo(0.5, 1);
        expect(evaluation.data.action).toBe("ambiguous");
      }
    });

    // -------------------------------------------------------------------------
    // RE-011: JSONパースが例外をスローする場合のフォールバック
    // -------------------------------------------------------------------------
    it("JSONパースが例外をスローする場合にフォールバックする (RE-011)", async () => {
      const mockLLM = createMockLLMClient({
        response: "{ invalid json without closing brace",
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // パースエラー時はフォールバック値（score: 5）を使用
        expect(evaluation.data.overallScore).toBeCloseTo(0.5, 1);
        expect(evaluation.data.action).toBe("ambiguous");
        // 個別スコアもフォールバック値
        expect(evaluation.data.individualScores).toHaveLength(2);
        evaluation.data.individualScores.forEach((s) => {
          expect(s.score).toBeCloseTo(0.5, 1);
          expect(s.reason).toContain("fallback");
        });
      }
    });

    // -------------------------------------------------------------------------
    // RE-012: スコアが範囲外の場合のクランプ処理
    // -------------------------------------------------------------------------
    it("スコアが0未満の場合に0にクランプする (RE-012a)", async () => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: -5, reason: "Negative score" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(1);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // 負の値は0にクランプ
        expect(evaluation.data.individualScores[0].score).toBe(0);
      }
    });

    it("スコアが10を超える場合に1にクランプする (RE-012b)", async () => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: 15, reason: "Over max score" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(1);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        // 10を超える値は1にクランプ
        expect(evaluation.data.individualScores[0].score).toBe(1);
      }
    });
  });

  // ===========================================================================
  // LLMプロンプト検証テスト
  // ===========================================================================

  describe("LLMプロンプト検証", () => {
    it("正しい形式のプロンプトをLLMに送信する", async () => {
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      await evaluator.evaluate("test query about TypeScript", results);

      // LLMが呼び出されたことを確認
      expect(mockLLM.complete).toHaveBeenCalledTimes(1);

      // プロンプトの内容を検証
      const callArgs = vi.mocked(mockLLM.complete).mock.calls[0][0];
      expect(callArgs.prompt).toContain("test query about TypeScript");
      expect(callArgs.temperature).toBe(0);
      expect(callArgs.maxTokens).toBeLessThanOrEqual(500);
    });

    it("検索結果のコンテンツがプロンプトに含まれる", async () => {
      const mockLLM = createMockLLMClient({
        response: LLM_RESPONSES.HIGH_RELEVANCE,
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2);

      await evaluator.evaluate("query", results);

      const callArgs = vi.mocked(mockLLM.complete).mock.calls[0][0];
      // 検索結果のコンテンツがプロンプトに含まれている
      expect(callArgs.prompt).toContain("Test content");
    });
  });
});
