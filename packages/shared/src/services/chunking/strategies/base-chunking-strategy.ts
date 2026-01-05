/**
 * チャンキング戦略の基底クラス
 *
 * @description 共通処理を提供し、テンプレートメソッドパターンを実装
 */

import type { IChunkingStrategy, ITokenizer } from "../interfaces";
import type {
  ChunkingStrategy,
  ChunkingOptions,
  Chunk,
  ChunkPosition,
  ChunkMetadata,
} from "../types";

/**
 * チャンキング戦略の基底クラス
 */
export abstract class BaseChunkingStrategy implements IChunkingStrategy {
  protected tokenizer: ITokenizer;

  constructor(tokenizer: ITokenizer) {
    this.tokenizer = tokenizer;
  }

  abstract readonly name: ChunkingStrategy;

  abstract chunk(text: string, options: ChunkingOptions): Promise<Chunk[]>;

  abstract validateOptions(options: ChunkingOptions): void;

  abstract getDefaultOptions(): ChunkingOptions;

  /**
   * チャンクIDを生成する
   *
   * @param documentId - ドキュメントID
   * @param index - チャンクインデックス
   * @returns チャンクID
   */
  protected generateChunkId(documentId: string, index: number): string {
    return `${documentId}-chunk-${index}`;
  }

  /**
   * オーバーラップサイズを計算する
   *
   * @param chunkSize - チャンクサイズ
   * @param overlapSize - オーバーラップサイズ（明示的）
   * @param overlapPercentage - オーバーラップ率（%）
   * @returns 計算されたオーバーラップサイズ
   */
  protected calculateOverlapSize(
    chunkSize: number,
    overlapSize?: number,
    overlapPercentage?: number,
  ): number {
    if (overlapSize !== undefined) {
      return overlapSize;
    }

    if (overlapPercentage !== undefined) {
      return Math.floor(chunkSize * (overlapPercentage / 100));
    }

    return 0;
  }

  /**
   * チャンクを作成する
   *
   * @param id - チャンクID
   * @param content - チャンク内容
   * @param position - 位置情報
   * @param metadata - メタデータ
   * @returns チャンク
   */
  protected createChunk(
    id: string,
    content: string,
    position: ChunkPosition,
    metadata: ChunkMetadata,
  ): Chunk {
    return {
      id,
      content,
      tokenCount: this.tokenizer.countTokens(content),
      position,
      metadata,
    };
  }
}
