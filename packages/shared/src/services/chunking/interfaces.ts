/**
 * チャンキングサービスのインターフェース定義
 *
 * @description チャンキング戦略と外部依存のインターフェース
 */

import type { ChunkingStrategy, ChunkingOptions, Chunk } from "./types";

/**
 * チャンキング戦略インターフェース
 *
 * Strategy Patternの実装。各チャンキング戦略はこのインターフェースを実装する。
 */
export interface IChunkingStrategy {
  /**
   * 戦略名
   */
  readonly name: ChunkingStrategy;

  /**
   * テキストをチャンクに分割する
   *
   * @param text - 分割対象テキスト
   * @param options - チャンキングオプション
   * @returns チャンク配列
   * @throws {ChunkingError} チャンキング処理でエラーが発生した場合
   */
  chunk(text: string, options: ChunkingOptions): Promise<Chunk[]>;

  /**
   * オプションをバリデーションする
   *
   * @param options - チャンキングオプション
   * @throws {ValidationError} オプションが不正な場合
   */
  validateOptions(options: ChunkingOptions): void;

  /**
   * デフォルトオプションを取得する
   *
   * @returns デフォルトオプション
   */
  getDefaultOptions(): ChunkingOptions;
}

/**
 * トークナイザーインターフェース
 */
export interface ITokenizer {
  /**
   * テキストをトークンに分割する
   *
   * @param text - トークン化対象テキスト
   * @returns トークンID配列
   */
  encode(text: string): number[];

  /**
   * トークンIDをテキストに変換する
   *
   * @param tokens - トークンID配列
   * @returns テキスト
   */
  decode(tokens: number[]): string;

  /**
   * テキストのトークン数をカウントする
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number;
}

/**
 * 埋め込みクライアントインターフェース
 *
 * セマンティックチャンキングとLate Chunkingで使用
 */
export interface IEmbeddingClient {
  /**
   * テキストの埋め込みベクトルを生成する
   *
   * @param text - 埋め込み対象テキスト
   * @returns 埋め込みベクトル
   */
  embed(text: string): Promise<number[]>;

  /**
   * 複数テキストの埋め込みベクトルをバッチ生成する
   *
   * @param texts - 埋め込み対象テキスト配列
   * @returns 埋め込みベクトル配列
   */
  embedBatch(texts: string[]): Promise<number[][]>;
}

/**
 * LLM オプション
 */
export interface LLMOptions {
  /** 最大トークン数 */
  maxTokens?: number;
  /** 温度パラメータ */
  temperature?: number;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
}

/**
 * LLMクライアントインターフェース
 *
 * Contextual Embeddings生成で使用
 */
export interface ILLMClient {
  /**
   * プロンプトを送信して応答を取得する
   *
   * @param prompt - プロンプト
   * @param options - LLMオプション
   * @returns 応答テキスト
   */
  generate(prompt: string, options?: LLMOptions): Promise<string>;
}
