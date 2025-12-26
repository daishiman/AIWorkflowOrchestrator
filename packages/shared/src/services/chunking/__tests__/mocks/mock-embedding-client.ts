/**
 * MockEmbeddingClient
 *
 * @description テスト用の埋め込みクライアントモック
 */

import type { IEmbeddingClient } from "../../interfaces";

/**
 * テスト用埋め込みクライアント
 *
 * ダミーの埋め込みベクトルを生成
 */
export class MockEmbeddingClient implements IEmbeddingClient {
  private readonly dimensions: number;
  private shouldFail: boolean = false;
  private embeddingCache: Map<string, number[]> = new Map();

  /**
   * @param dimensions - 埋め込みベクトルの次元数（デフォルト: 384）
   */
  constructor(dimensions: number = 384) {
    this.dimensions = dimensions;
  }

  /**
   * テキストを埋め込みベクトルに変換
   *
   * @param text - テキスト
   * @returns 埋め込みベクトル
   */
  async embed(text: string): Promise<number[]> {
    if (this.shouldFail) {
      throw new Error("Failed to generate embedding");
    }

    // キャッシュがあればそれを返す
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    // テキストのハッシュ値をシードとして使用し、再現性のあるベクトルを生成
    const seed = this.hashString(text);
    const embedding = this.generateDeterministicEmbedding(seed);

    // キャッシュに保存
    this.embeddingCache.set(text, embedding);

    return embedding;
  }

  /**
   * 複数テキストを一括で埋め込みベクトルに変換
   *
   * @param texts - テキスト配列
   * @returns 埋め込みベクトル配列
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
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
   * 文字列のハッシュ値を計算（簡易版）
   *
   * @param str - 文字列
   * @returns ハッシュ値
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash);
  }

  /**
   * 決定的な埋め込みベクトルを生成
   *
   * シード値から再現性のあるベクトルを生成
   *
   * @param seed - シード値
   * @returns 埋め込みベクトル
   */
  private generateDeterministicEmbedding(seed: number): number[] {
    const embedding: number[] = [];
    let current = seed;

    for (let i = 0; i < this.dimensions; i++) {
      // 線形合同法でランダム値を生成
      current = (current * 1103515245 + 12345) & 0x7fffffff;
      embedding.push((current / 0x7fffffff) * 2 - 1); // [-1, 1]の範囲に正規化
    }

    return embedding;
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }
}

/**
 * カスタム埋め込みベクトルを返すモッククライアント
 *
 * テストで特定の埋め込みを設定したい場合に使用
 */
export class ConfigurableEmbeddingClient implements IEmbeddingClient {
  private embeddingMap: Map<string, number[]> = new Map();
  private defaultEmbedding: number[];

  constructor(dimensions: number = 384) {
    this.defaultEmbedding = Array.from({ length: dimensions }, () => 0);
  }

  /**
   * テキストに対する埋め込みベクトルを設定
   *
   * @param text - テキスト
   * @param embedding - 埋め込みベクトル
   */
  setEmbedding(text: string, embedding: number[]): void {
    this.embeddingMap.set(text, embedding);
  }

  async embed(text: string): Promise<number[]> {
    return this.embeddingMap.get(text) ?? this.defaultEmbedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}
