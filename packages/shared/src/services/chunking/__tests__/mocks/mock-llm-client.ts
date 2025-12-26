/**
 * MockLLMClient
 *
 * @description テスト用のLLMクライアントモック
 */

import type { ILLMClient } from "../../interfaces";

/**
 * テスト用LLMクライアント
 *
 * Contextual Embeddingsのコンテキスト生成用
 */
export class MockLLMClient implements ILLMClient {
  private shouldFail: boolean = false;
  private responseMap: Map<string, string> = new Map();
  private defaultResponse: string = "Context for this chunk (50 tokens)";

  /**
   * LLMでテキストを生成
   *
   * @param prompt - プロンプト
   * @returns 生成されたテキスト
   */
  async generate(prompt: string): Promise<string> {
    if (this.shouldFail) {
      throw new Error("Failed to generate context from LLM");
    }

    // プロンプトに対する固定レスポンスがあればそれを返す
    if (this.responseMap.has(prompt)) {
      return this.responseMap.get(prompt)!;
    }

    // デフォルトレスポンス
    return this.defaultResponse;
  }

  /**
   * エラーを発生させるモード
   *
   * @param shouldFail - true: エラーを発生, false: 正常動作
   */
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  /**
   * プロンプトに対するレスポンスを設定
   *
   * @param prompt - プロンプト
   * @param response - レスポンス
   */
  setResponse(prompt: string, response: string): void {
    this.responseMap.set(prompt, response);
  }

  /**
   * デフォルトレスポンスを設定
   *
   * @param response - レスポンス
   */
  setDefaultResponse(response: string): void {
    this.defaultResponse = response;
  }

  /**
   * レスポンスマップをクリア
   */
  clearResponses(): void {
    this.responseMap.clear();
  }
}

/**
 * コンテキスト生成をシミュレートするモッククライアント
 *
 * チャンクの内容に基づいてリアルなコンテキストを生成
 */
export class ContextGeneratingLLMClient implements ILLMClient {
  async generate(prompt: string): Promise<string> {
    // プロンプトからチャンク内容を抽出（簡易実装）
    const chunkMatch = prompt.match(/<chunk>(.*?)<\/chunk>/s);
    if (!chunkMatch) {
      return "Context about this document section.";
    }

    const chunkContent = chunkMatch[1].trim();

    // チャンク内容の最初の50文字を使ってコンテキストを生成
    const preview = chunkContent.substring(0, 50);

    return `This chunk discusses "${preview}..." in the context of the broader document.`;
  }
}
