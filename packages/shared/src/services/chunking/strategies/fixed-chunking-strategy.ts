/**
 * 固定サイズチャンキング戦略
 *
 * @description トークン数に基づいた固定サイズでテキストを分割
 */

import { BaseChunkingStrategy } from "./base-chunking-strategy";
import { ValidationError } from "../errors";
import type {
  ChunkingStrategy,
  ChunkingOptions,
  FixedChunkingOptions,
  Chunk,
} from "../types";
import type { ITokenizer } from "../interfaces";

/**
 * 固定サイズチャンキング戦略
 *
 * アルゴリズム:
 * 1. テキストをトークナイズ
 * 2. chunkSizeごとにトークンを分割
 * 3. overlapSizeだけ前のチャンクと重複させる
 * 4. 最後のチャンクがminChunkSize未満なら前のチャンクに統合
 */
export class FixedChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "fixed";

  constructor(tokenizer: ITokenizer) {
    super(tokenizer);
  }

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as FixedChunkingOptions;
    this.validateOptions(opts);

    // 空テキストの場合
    if (text.length === 0) {
      return [];
    }

    const tokens = this.tokenizer.encode(text);
    const overlapSize = this.calculateOverlapSize(
      opts.chunkSize,
      opts.overlapSize,
      opts.overlapPercentage,
    );

    const chunks: Chunk[] = [];
    let currentPosition = 0;
    let chunkIndex = 0;

    while (currentPosition < tokens.length) {
      // チャンクのトークン範囲を決定
      const start = Math.max(0, currentPosition);
      const end = Math.min(tokens.length, currentPosition + opts.chunkSize);

      const chunkTokens = tokens.slice(start, end);
      const chunkText = this.tokenizer.decode(chunkTokens);

      // 最後のチャンクがminChunkSize未満かチェック
      const minSize = opts.minChunkSize || 0;
      if (end === tokens.length && chunkTokens.length < minSize) {
        if (chunks.length > 0) {
          // 前のチャンクに統合
          const lastChunk = chunks[chunks.length - 1];
          const lastChunkTokenCount = this.tokenizer.countTokens(
            lastChunk.content,
          );
          const startPos = currentPosition - overlapSize - lastChunkTokenCount;
          const mergedTokens = tokens.slice(Math.max(0, startPos), end);
          const mergedText = this.tokenizer.decode(mergedTokens);

          lastChunk.content = mergedText;
          lastChunk.tokenCount = mergedTokens.length;
          lastChunk.position.end = text.length;

          break;
        }
      }

      // チャンク位置を計算
      const charStart = this.getCharPosition(text, tokens, start);
      const charEnd = this.getCharPosition(text, tokens, end);

      // チャンクを作成
      const chunk = this.createChunk(
        this.generateChunkId("doc", chunkIndex),
        chunkText,
        {
          start: charStart,
          end: charEnd,
        },
        {
          strategy: this.name,
          overlap:
            chunkIndex > 0
              ? {
                  previous: overlapSize,
                  next: 0, // 次のチャンクで設定
                }
              : undefined,
        },
      );

      chunks.push(chunk);

      // 前のチャンクのnextオーバーラップを更新
      if (chunkIndex > 0 && chunks[chunkIndex - 1].metadata.overlap) {
        chunks[chunkIndex - 1].metadata.overlap!.next = overlapSize;
      }

      currentPosition += opts.chunkSize - overlapSize;
      chunkIndex++;
    }

    return chunks;
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as FixedChunkingOptions;

    if (opts.chunkSize <= 0) {
      throw new ValidationError("chunkSize must be positive");
    }

    if (opts.overlapSize !== undefined) {
      if (opts.overlapSize < 0) {
        throw new ValidationError("overlapSize must be non-negative");
      }

      if (opts.overlapSize >= opts.chunkSize) {
        throw new ValidationError("overlapSize must be less than chunkSize");
      }
    }

    if (opts.overlapPercentage !== undefined) {
      if (opts.overlapPercentage < 0 || opts.overlapPercentage > 100) {
        throw new ValidationError(
          "overlapPercentage must be between 0 and 100",
        );
      }
    }

    if (opts.minChunkSize !== undefined) {
      if (opts.minChunkSize < 0) {
        throw new ValidationError("minChunkSize must be non-negative");
      }

      if (opts.minChunkSize > opts.chunkSize) {
        throw new ValidationError(
          "minChunkSize must be less than or equal to chunkSize",
        );
      }
    }
  }

  getDefaultOptions(): FixedChunkingOptions {
    return {
      chunkSize: 512,
      minChunkSize: 50,
    };
  }

  /**
   * トークンインデックスから文字位置を取得
   *
   * @param text - 元のテキスト
   * @param tokens - 全トークン配列
   * @param tokenIndex - トークンインデックス
   * @returns 文字位置
   */
  private getCharPosition(
    text: string,
    tokens: number[],
    tokenIndex: number,
  ): number {
    if (tokenIndex === 0) {
      return 0;
    }
    if (tokenIndex >= tokens.length) {
      return text.length;
    }

    // トークンを順にデコードして文字位置を特定
    const upToTokens = tokens.slice(0, tokenIndex);
    const decodedText = this.tokenizer.decode(upToTokens);
    return decodedText.length;
  }
}
