import type { IEmbeddingClient } from "../../chunking/interfaces";
import type { TokenEmbeddingsResult } from "../../chunking/types";

/**
 * テスト用 MockTokenEmbeddingClient
 * getTokenEmbeddings を実装した IEmbeddingClient のモック実装
 * tokens.length === embeddings.length を保証する
 */
export class MockTokenEmbeddingClient implements IEmbeddingClient {
  async embed(text: string): Promise<number[]> {
    return [text.length * 0.1, text.length * 0.2, text.length * 0.3];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  /**
   * テキストをスペース区切りでトークン化し、
   * 各トークンに決定論的なダミーベクトルを返す
   */
  async getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult> {
    const tokens = text.split(/\s+/).filter((t) => t.length > 0);
    const effectiveTokens = tokens.length > 0 ? tokens : [""];
    const embeddings = effectiveTokens.map((_, index) => [
      (index + 1) * 0.1,
      (index + 1) * 0.2,
      (index + 1) * 0.3,
    ]);
    return { tokens: effectiveTokens, embeddings };
  }
}
