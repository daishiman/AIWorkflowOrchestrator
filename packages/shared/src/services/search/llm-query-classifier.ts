/**
 * @file LLMクエリ分類器
 * @description CONV-07-01: LLMを使用した高精度クエリ分類
 */

import { ok } from "../../types/rag/result";
import type { Result } from "../../types/rag/result";
import type { ILLMProvider } from "../extraction/interfaces";
import {
  DEFAULT_CLASSIFICATION_OPTIONS,
  SEARCH_WEIGHTS,
  queryClassificationSchema,
  type IQueryClassifier,
  type QueryClassification,
  type QueryClassificationOptions,
  type QueryType,
  type SearchWeights,
} from "./types";

// =============================================================================
// Prompt Template
// =============================================================================

const CLASSIFICATION_PROMPT = `あなたは検索クエリ分類の専門家です。以下のクエリを分析し、JSONフォーマットで結果を返してください。

## クエリタイプ
- local: 特定のエンティティ・事実・概念についての質問（例: "Reactとは？", "useStateの使い方"）
- global: ドキュメント全体のテーマ・概要・傾向についての質問（例: "全体のテーマは？", "概要を教えて"）
- relationship: 複数エンティティ間の関係・比較・影響についての質問（例: "AとBの違いは？", "XがYに与える影響"）
- hybrid: 上記に明確に分類できない複合的な質問

## 出力フォーマット（JSON）
{
  "type": "local" | "global" | "relationship" | "hybrid",
  "confidence": 0.0〜1.0,
  "extractedEntities": ["エンティティ名", ...],
  "relationHint": "comparison" | "causation" | "association" | null,
  "keywords": ["キーワード", ...],
  "intent": "クエリの意図を1文で説明"
}

## クエリ
{{QUERY}}

## 回答（JSONのみ）`;

// =============================================================================
// Implementation
// =============================================================================

/**
 * LLMを使用したクエリ分類器
 */
export class LLMQueryClassifier implements IQueryClassifier {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackClassifier: IQueryClassifier,
  ) {}

  /**
   * クエリを分類
   */
  async classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>> {
    const resolvedOptions = {
      ...DEFAULT_CLASSIFICATION_OPTIONS,
      ...options,
    };

    // useLLM=falseの場合はフォールバック
    if (!resolvedOptions.useLLM) {
      return this.fallbackClassifier.classify(query, options);
    }

    try {
      // LLM呼び出し
      const prompt = CLASSIFICATION_PROMPT.replace("{{QUERY}}", query);
      const llmResult = await this.llmProvider.generate(prompt, {
        temperature: 0.1,
        responseFormat: "json",
      });

      // LLMエラー時はフォールバック
      if (!llmResult.success) {
        return this.fallbackClassifier.classify(query, options);
      }

      // JSONパース
      let parsed: unknown;
      try {
        parsed = JSON.parse(llmResult.data.text);
      } catch {
        // パースエラー時はフォールバック
        return this.fallbackClassifier.classify(query, options);
      }

      // スキーマバリデーション
      const validationResult = queryClassificationSchema.safeParse(parsed);
      if (!validationResult.success) {
        // バリデーションエラー時はフォールバック
        return this.fallbackClassifier.classify(query, options);
      }

      const classification = validationResult.data;

      // 信頼度チェック
      if (classification.confidence < resolvedOptions.minConfidence) {
        // 信頼度が低い場合はhybridにフォールバック
        return ok({
          ...classification,
          type: "hybrid",
          confidence: classification.confidence,
        });
      }

      return ok(classification);
    } catch {
      // 予期しないエラー時はフォールバック
      return this.fallbackClassifier.classify(query, options);
    }
  }

  /**
   * クエリタイプに応じた検索重みを取得
   */
  getSearchWeights(type: QueryType): SearchWeights {
    return SEARCH_WEIGHTS[type];
  }
}
