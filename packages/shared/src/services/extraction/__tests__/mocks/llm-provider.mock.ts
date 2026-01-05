/**
 * LLMプロバイダーのモック
 * テスト用にLLMの動作をシミュレート
 */

import { ok, err, type Result } from "../../../../types/rag/result";

export interface LLMGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "text" | "json";
}

export interface LLMGenerateResult {
  text: string;
  tokensUsed: number;
}

export interface ILLMProvider {
  readonly modelId: string;
  generate(
    prompt: string,
    options?: LLMGenerateOptions,
  ): Promise<Result<LLMGenerateResult, Error>>;
}

/**
 * 成功レスポンスを返すモック
 */
export const createMockLLMProvider = (
  responseEntities: Array<{
    name: string;
    normalizedName: string;
    type: string;
    description?: string;
    aliases?: string[];
    confidence: number;
  }> = [],
): ILLMProvider => {
  return {
    modelId: "mock-model-1.0",
    generate: async () => {
      return ok({
        text: JSON.stringify({ entities: responseEntities }),
        tokensUsed: 100,
      });
    },
  };
};

/**
 * エラーを返すモック
 */
export const createErrorMockLLMProvider = (
  errorMessage: string = "LLM Error",
): ILLMProvider => {
  return {
    modelId: "mock-error-model",
    generate: async () => {
      return err(new Error(errorMessage));
    },
  };
};

/**
 * 不正なJSONを返すモック
 */
export const createInvalidJsonMockLLMProvider = (): ILLMProvider => {
  return {
    modelId: "mock-invalid-json-model",
    generate: async () => {
      return ok({
        text: "This is not valid JSON {{{",
        tokensUsed: 50,
      });
    },
  };
};

/**
 * 遅延応答するモック
 */
export const createDelayedMockLLMProvider = (
  delayMs: number,
  responseEntities: Array<{
    name: string;
    normalizedName: string;
    type: string;
    confidence: number;
  }> = [],
): ILLMProvider => {
  return {
    modelId: "mock-delayed-model",
    generate: async () => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return ok({
        text: JSON.stringify({ entities: responseEntities }),
        tokensUsed: 100,
      });
    },
  };
};

/**
 * テスト用のデフォルトエンティティレスポンス
 */
export const defaultMockEntities = [
  {
    name: "TypeScript",
    normalizedName: "typescript",
    type: "technology",
    description: "A typed superset of JavaScript",
    aliases: ["TS"],
    confidence: 0.95,
  },
  {
    name: "Microsoft",
    normalizedName: "microsoft",
    type: "organization",
    description: "Technology company",
    aliases: ["MS", "MSFT"],
    confidence: 0.9,
  },
  {
    name: "React",
    normalizedName: "react",
    type: "framework",
    description: "JavaScript library for building UIs",
    aliases: ["React.js", "ReactJS"],
    confidence: 0.85,
  },
];
