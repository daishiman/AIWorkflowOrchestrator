/**
 * @file 異常系テスト
 * @description CONV-07-01 Phase 6: クエリ分類器の異常系テスト
 */

import { describe, expect, it, vi } from "vitest";
import { LLMQueryClassifier } from "../llm-query-classifier";
import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";
import type { ILLMProvider } from "../../extraction/interfaces";

describe("異常系テスト", () => {
  describe("LLMレスポンス異常", () => {
    it("空文字列のレスポンスでフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: { text: "" },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global"); // フォールバック
      }
    });

    it("不完全なJSONでフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: { text: '{ "type": "local", "confidence":' },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
    });

    it("無効なtype値でフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "invalid_type",
              confidence: 0.8,
              extractedEntities: [],
              keywords: [],
              intent: "",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("テスト");
      expect(result.success).toBe(true);
    });

    it("LLMがsuccessfalseを返した場合フォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: false,
          error: new Error("API Error"),
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });

    it("LLMが例外をスローした場合フォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockRejectedValue(new Error("Network Error")),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("概要を教えて");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });

    it("配列がnullのJSONでフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.8,
              extractedEntities: null,
              keywords: null,
              intent: "test",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ");
      expect(result.success).toBe(true);
    });

    it("必須フィールドが欠けているJSONでフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              // confidence missing
              extractedEntities: [],
              keywords: [],
              intent: "",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("概要");
      expect(result.success).toBe(true);
    });
  });

  describe("特殊文字入力", () => {
    const classifier = new RuleBasedQueryClassifier();

    it("絵文字を含むクエリを処理できる", async () => {
      const result = await classifier.classify("👍 Reactについて教えて 🚀");
      expect(result.success).toBe(true);
    });

    it("改行を含むクエリを処理できる", async () => {
      const result = await classifier.classify("全体の\nテーマは\n？");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });

    it("タブ文字を含むクエリを処理できる", async () => {
      const result = await classifier.classify("React\tと\tVueの違い");
      expect(result.success).toBe(true);
    });

    it("制御文字を含むクエリを処理できる", async () => {
      const result = await classifier.classify("テスト\r\n入力");
      expect(result.success).toBe(true);
    });

    it("URLを含むクエリを処理できる", async () => {
      const result = await classifier.classify(
        "https://example.com について教えて",
      );
      expect(result.success).toBe(true);
    });

    it("HTMLタグを含むクエリを処理できる", async () => {
      const result = await classifier.classify("<script>alert(1)</script>とは");
      expect(result.success).toBe(true);
    });

    it("SQLインジェクションパターンを含むクエリを処理できる", async () => {
      const result = await classifier.classify(
        "'; DROP TABLE users; -- について",
      );
      expect(result.success).toBe(true);
    });

    it("Unicode特殊文字を含むクエリを処理できる", async () => {
      const result = await classifier.classify("全角ｶﾀｶﾅと半角の違い");
      expect(result.success).toBe(true);
    });

    it("サロゲートペアを含むクエリを処理できる", async () => {
      const result = await classifier.classify("𠀋について教えて");
      expect(result.success).toBe(true);
    });
  });

  describe("useLLMオプション", () => {
    it("useLLM=falseの場合はLLMを呼び出さない", async () => {
      const mockLLMProvider = {
        generate: vi.fn(),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("全体のテーマは？", {
        useLLM: false,
      });

      expect(result.success).toBe(true);
      expect(mockLLMProvider.generate).not.toHaveBeenCalled();
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });
  });
});
