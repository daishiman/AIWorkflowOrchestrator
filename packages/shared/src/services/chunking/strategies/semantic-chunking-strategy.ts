/**
 * セマンティックチャンキング戦略
 *
 * @description 埋め込みベクトルの類似度に基づいて意味的境界で分割
 */

import { BaseChunkingStrategy } from "./base-chunking-strategy";
import { ValidationError } from "../errors";
import type {
  ChunkingStrategy,
  ChunkingOptions,
  SemanticChunkingOptions,
  Chunk,
} from "../types";
import type { ITokenizer, IEmbeddingClient } from "../interfaces";
import { cosineSimilarity } from "../../embedding/utils/math-utils";

/**
 * セマンティックチャンキング戦略
 *
 * アルゴリズム:
 * 1. テキストを文に分割
 * 2. 各文の埋め込みベクトルを生成
 * 3. 連続する文間のコサイン類似度を計算
 * 4. 類似度がsimilarityThreshold以下の箇所で分割
 * 5. breakPointsで強制分割
 */
export class SemanticChunkingStrategy extends BaseChunkingStrategy {
  readonly name: ChunkingStrategy = "semantic";
  private embeddingClient: IEmbeddingClient;

  constructor(tokenizer: ITokenizer, embeddingClient: IEmbeddingClient) {
    super(tokenizer);
    this.embeddingClient = embeddingClient;
  }

  async chunk(text: string, options: ChunkingOptions): Promise<Chunk[]> {
    const opts = options as SemanticChunkingOptions;
    this.validateOptions(opts);

    // 空テキストの場合
    if (text.length === 0) {
      return [];
    }

    // デフォルト値の適用
    const targetChunkSize = opts.targetChunkSize ?? opts.chunkSize ?? 512;
    const maxChunkSize = opts.maxChunkSize ?? targetChunkSize * 2;
    const similarityThreshold = opts.similarityThreshold ?? 0.7;
    const breakPoints = opts.breakPoints ?? ["##", "###", "---"];

    // 文に分割
    const sentences = this.splitIntoSentences(text);

    if (sentences.length === 0) {
      return [];
    }

    // 強制分割ポイントを検出
    const breakPointIndices = this.findBreakPoints(sentences, breakPoints);

    // 各文の埋め込みを生成
    const embeddings = await this.embeddingClient.embedBatch(
      sentences.map((s) => s.text),
    );

    // 文間の類似度を計算
    const similarities = this.calculateSimilarities(embeddings);

    // 分割ポイントを決定
    const splitIndices = this.determineSplitPoints(
      similarities,
      similarityThreshold,
      breakPointIndices,
    );

    // チャンクを構築
    const chunks = this.buildChunks(
      sentences,
      splitIndices,
      text,
      maxChunkSize,
    );

    return chunks;
  }

  /**
   * テキストを文に分割
   */
  private splitIntoSentences(
    text: string,
  ): { text: string; start: number; end: number }[] {
    const delimiters = [".", "!", "?", "。", "！", "？"];
    const sentences: { text: string; start: number; end: number }[] = [];
    let currentStart = 0;
    let currentSentence = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      currentSentence += char;

      // デリミタをチェック
      if (delimiters.includes(char)) {
        const nextChar = text[i + 1];
        if (
          nextChar === undefined ||
          nextChar === " " ||
          nextChar === "\n" ||
          nextChar === "\r" ||
          nextChar === "\t"
        ) {
          const trimmed = currentSentence.trim();
          if (trimmed.length > 0) {
            let actualStart = currentStart;
            while (actualStart < i && /\s/.test(text[actualStart])) {
              actualStart++;
            }
            sentences.push({
              text: trimmed,
              start: actualStart,
              end: i + 1,
            });
          }
          currentStart = i + 1;
          currentSentence = "";
        }
      }
    }

    // 残りのテキスト
    const remaining = currentSentence.trim();
    if (remaining.length > 0) {
      let actualStart = currentStart;
      while (actualStart < text.length && /\s/.test(text[actualStart])) {
        actualStart++;
      }
      sentences.push({
        text: remaining,
        start: actualStart,
        end: text.length,
      });
    }

    return sentences;
  }

  /**
   * 強制分割ポイントを検出
   */
  private findBreakPoints(
    sentences: { text: string; start: number; end: number }[],
    breakPoints: string[],
  ): Set<number> {
    const indices = new Set<number>();

    sentences.forEach((sentence, index) => {
      for (const breakPoint of breakPoints) {
        if (sentence.text.includes(breakPoint)) {
          indices.add(index);
          break;
        }
      }
    });

    return indices;
  }

  /**
   * 埋め込みベクトル間のコサイン類似度を計算
   */
  private calculateSimilarities(embeddings: number[][]): number[] {
    const similarities: number[] = [];

    for (let i = 0; i < embeddings.length - 1; i++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[i + 1]);
      similarities.push(similarity);
    }

    return similarities;
  }

  /**
   * 分割ポイントを決定
   */
  private determineSplitPoints(
    similarities: number[],
    threshold: number,
    breakPoints: Set<number>,
  ): number[] {
    const splitIndices: number[] = [0];

    for (let i = 0; i < similarities.length; i++) {
      if (similarities[i] < threshold || breakPoints.has(i)) {
        splitIndices.push(i + 1);
      }
    }

    return splitIndices;
  }

  /**
   * チャンクを構築
   */
  private buildChunks(
    sentences: { text: string; start: number; end: number }[],
    splitIndices: number[],
    originalText: string,
    maxChunkSize: number,
  ): Chunk[] {
    const chunks: Chunk[] = [];

    for (let i = 0; i < splitIndices.length; i++) {
      const start = splitIndices[i];
      const end =
        i < splitIndices.length - 1 ? splitIndices[i + 1] : sentences.length;

      const chunkSentences = sentences.slice(start, end);

      if (chunkSentences.length === 0) {
        continue;
      }

      const content = chunkSentences.map((s) => s.text).join(" ");

      // トークン数チェック
      const tokenCount = this.tokenizer.countTokens(content);
      if (tokenCount > maxChunkSize) {
        console.warn(
          `Semantic chunk exceeds maxChunkSize: ${tokenCount} tokens`,
        );
      }

      const textStart = chunkSentences[0].start;
      const textEnd = chunkSentences[chunkSentences.length - 1].end;

      chunks.push(
        this.createChunk(
          this.generateChunkId("doc", i),
          content,
          { start: textStart, end: textEnd },
          {
            strategy: this.name,
          },
        ),
      );
    }

    return chunks;
  }

  validateOptions(options: ChunkingOptions): void {
    const opts = options as SemanticChunkingOptions;

    if (opts.similarityThreshold !== undefined) {
      if (opts.similarityThreshold < 0 || opts.similarityThreshold > 1) {
        throw new ValidationError(
          "similarityThreshold must be between 0 and 1",
        );
      }
    }

    if (opts.targetChunkSize !== undefined && opts.targetChunkSize <= 0) {
      throw new ValidationError("targetChunkSize must be positive");
    }

    if (opts.maxChunkSize !== undefined && opts.maxChunkSize <= 0) {
      throw new ValidationError("maxChunkSize must be positive");
    }
  }

  getDefaultOptions(): SemanticChunkingOptions {
    return {
      chunkSize: 512,
      targetChunkSize: 512,
      maxChunkSize: 1024,
      similarityThreshold: 0.7,
      embeddingModel: "text-embedding-3-small",
      breakPoints: ["##", "###", "---"],
    };
  }
}
