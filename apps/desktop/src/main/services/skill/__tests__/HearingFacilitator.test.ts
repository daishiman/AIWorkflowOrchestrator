/**
 * HearingFacilitator ユニットテスト
 * Phase 6: Test Expansion（実クラス使用）
 * テストID: HF-001 ~ HF-006, HF-EX-001 ~ HF-EX-002
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HearingFacilitator } from "../HearingFacilitator";

describe("HearingFacilitator", () => {
  let facilitator: HearingFacilitator;

  beforeEach(() => {
    vi.clearAllMocks();
    facilitator = new HearingFacilitator();
  });

  describe("generateInitialQuestion()", () => {
    it("HF-001: 初回呼び出しで初期質問を生成する", () => {
      const question = facilitator.generateInitialQuestion();
      expect(question).toBeDefined();
      expect(typeof question).toBe("string");
      expect(question.length).toBeGreaterThan(0);
    });

    it("HF-002: ユーザーの回答に基づいて次の質問を導出する", () => {
      facilitator.generateInitialQuestion();
      const nextQuestion =
        facilitator.processAnswer("タスク管理ツールを作りたい");
      expect(nextQuestion).toBeDefined();
      expect(typeof nextQuestion).toBe("string");
    });
  });

  describe("completeInterview()", () => {
    it("HF-003: 全質問完了後にインタビュー結果を集約する", () => {
      facilitator.generateInitialQuestion();
      facilitator.processAnswer("タスク管理ツール");
      const result = facilitator.completeInterview();
      expect(result).toBeDefined();
      expect(result.purpose).toBeDefined();
      expect(result.features).toBeDefined();
      expect(Array.isArray(result.features)).toBe(true);
    });

    it("HF-005: InterviewResult に purpose/features/inputs/outputs/toolsNeeded/abstractionLevel を含む", () => {
      facilitator.generateInitialQuestion();
      facilitator.processAnswer("ビルド自動化ツール");
      const result = facilitator.completeInterview();
      expect(result.purpose).toBe("ビルド自動化ツール");
      expect(Array.isArray(result.features)).toBe(true);
      expect(Array.isArray(result.inputs)).toBe(true);
      expect(Array.isArray(result.outputs)).toBe(true);
      expect(Array.isArray(result.toolsNeeded)).toBe(true);
      expect(typeof result.abstractionLevel).toBe("string");
    });
  });

  describe("バリデーション", () => {
    it("HF-004: 空の回答に対してバリデーションエラーをスローする", () => {
      facilitator.generateInitialQuestion();
      expect(() => facilitator.processAnswer("")).toThrow();
    });

    it("HF-004: スペースのみの回答に対してもバリデーションエラーをスローする", () => {
      facilitator.generateInitialQuestion();
      expect(() => facilitator.processAnswer("   ")).toThrow();
    });

    it("HF-006: 最大質問数（10）到達時に強制完了する", () => {
      facilitator.generateInitialQuestion();

      // processAnswerを繰り返し、nullが返るかisComplete()がtrueになるまで続ける
      let questionCount = 1;
      let nextQuestion: string | null = facilitator.processAnswer(
        `回答 ${questionCount}`,
      );
      questionCount++;

      while (nextQuestion !== null && questionCount < 15) {
        nextQuestion = facilitator.processAnswer(`回答 ${questionCount}`);
        questionCount++;
      }

      // 最大10問のため、10回以下で完了するはず
      expect(facilitator.isComplete()).toBe(true);
      expect(facilitator.getQuestionCount()).toBeLessThanOrEqual(10);
    });
  });

  describe("validateAnswer()", () => {
    it("有効な回答にはisValid: trueを返す", () => {
      const result = facilitator.validateAnswer("有効な回答");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("空文字列にはisValid: falseを返す", () => {
      const result = facilitator.validateAnswer("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("スペースのみにはisValid: falseを返す", () => {
      const result = facilitator.validateAnswer("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("拡張テスト", () => {
    it("HF-EX-001: processAnswer: 回答から複数のfeaturesを抽出する", () => {
      facilitator.generateInitialQuestion();
      // purpose質問への回答
      facilitator.processAnswer("コード分析ツール");

      // features質問への回答（カテゴリに基づく質問が生成される）
      facilitator.processAnswer(
        "コード品質チェック、依存関係解析、パフォーマンス計測",
      );

      const result = facilitator.completeInterview();
      expect(result.features).toBeDefined();
      expect(result.features.length).toBeGreaterThanOrEqual(1);
      // features カテゴリの回答が結果に含まれることを確認
      const allFeaturesText = result.features.join(" ");
      expect(allFeaturesText.length).toBeGreaterThan(0);
    });

    it("HF-EX-002: completeInterview: constraintsカテゴリの回答がなくてもエラーにならない", () => {
      facilitator.generateInitialQuestion();
      // purposeのみ回答
      facilitator.processAnswer("テストツール");

      // constraintsカテゴリの質問に到達する前にcompleteInterviewを呼ぶ
      const result = facilitator.completeInterview();
      expect(result).toBeDefined();
      expect(result.purpose).toBe("テストツール");
      // features, inputs, outputs, toolsNeeded は配列であること
      expect(Array.isArray(result.features)).toBe(true);
      expect(Array.isArray(result.inputs)).toBe(true);
      expect(Array.isArray(result.outputs)).toBe(true);
      expect(Array.isArray(result.toolsNeeded)).toBe(true);
    });
  });
});
