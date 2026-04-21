/**
 * ChunkingLateChunkingAdapter
 *
 * @description ChunkingService から抽出した Late Chunking アルゴリズム専用サービス層。
 *              既存の token-level LateChunkingService（late-chunking-service.ts）との
 *              名前衝突を避けるため、Adapter 名称で命名。
 *              SRP 遵守とテスト観測性向上のため、public 3 メソッド
 *              (applyLateChunking / determineChunkBoundaries / poolTokenEmbeddings)
 *              を提供する。ロジックは ChunkingService からのコピー移動のみで、改変なし。
 */

import type { ITokenizer, IEmbeddingClient } from "../../chunking/interfaces";
import type { Chunk, LateChunkingOptions } from "../../chunking/types";
import { ChunkingError } from "../../chunking/errors";

export class ChunkingLateChunkingAdapter {
  constructor(
    private readonly tokenizer: ITokenizer,
    private readonly embeddingClient: IEmbeddingClient,
  ) {}

  /**
   * Late Chunkingを適用する
   *
   * @param text 元テキスト
   * @param chunks 既存チャンク
   * @param options Late Chunkingオプション
   * @returns Late Chunkingメタデータが付与されたチャンク
   */
  async applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]> {
    // 1. 文書全体をトークナイズ
    const tokens = this.tokenizer.encode(text);

    // 2. 全トークンの埋め込みを生成
    const tokenEmbeddings = await this.getTokenEmbeddings(
      tokens,
      options.maxSequenceLength,
    );

    // 3. チャンク境界位置を特定
    const boundaries = this.determineChunkBoundaries(chunks);

    // 4. 境界に基づきトークン埋め込みをグループ化してプーリング
    const chunkedEmbeddings = this.poolEmbeddingsByBoundaries(
      tokenEmbeddings,
      boundaries,
      options.poolingStrategy,
      tokens.length,
    );

    // 5. 埋め込みをチャンクに付与（実際の埋め込みベクトルは別途保存）
    return chunks.map((chunk, index) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        lateChunking: {
          applied: true,
          embeddingDimension: chunkedEmbeddings[index]?.length ?? 0,
        },
      },
    }));
  }

  /**
   * チャンク境界を決定する
   *
   * @param chunks チャンク配列
   * @returns 境界位置（文字インデックス）の配列
   */
  determineChunkBoundaries(chunks: Chunk[]): number[] {
    return chunks.map((chunk) => chunk.position.end);
  }

  /**
   * トークン埋め込みをプーリングする
   *
   * @param tokenEmbeddings トークン埋め込み配列
   * @param boundaries 境界位置配列
   * @param strategy プーリング戦略 (mean / cls / attention)
   * @returns プーリング後の埋め込み配列
   */
  poolTokenEmbeddings(
    tokenEmbeddings: number[][],
    boundaries: number[],
    strategy: "mean" | "cls" | "attention",
  ): number[][] {
    const totalUnits = Math.max(boundaries.at(-1) ?? 0, tokenEmbeddings.length);
    return this.poolEmbeddingsByBoundaries(
      tokenEmbeddings,
      boundaries,
      strategy,
      totalUnits,
    );
  }

  /**
   * トークン埋め込みを取得する
   *
   * @param tokens トークンID配列
   * @param maxSequenceLength 最大シーケンス長
   * @returns セグメントごとの埋め込みベクトル配列
   */
  private async getTokenEmbeddings(
    tokens: number[],
    maxSequenceLength: number,
  ): Promise<number[][]> {
    if (!this.embeddingClient) {
      throw new ChunkingError("Embedding client is required");
    }

    const embeddings: number[][] = [];

    // シーケンス長を超える場合は分割処理
    for (let i = 0; i < tokens.length; i += maxSequenceLength) {
      const segment = tokens.slice(i, i + maxSequenceLength);
      const segmentText = this.tokenizer.decode(segment);
      const embedding = await this.embeddingClient.embed(segmentText);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  private poolEmbeddingsByBoundaries(
    tokenEmbeddings: number[][],
    boundaries: number[],
    strategy: "mean" | "cls" | "attention",
    totalUnits: number,
  ): number[][] {
    if (tokenEmbeddings.length === 0 || boundaries.length === 0) {
      return [];
    }

    const chunkRanges = this.buildChunkRanges(boundaries);
    const segmentRanges = this.buildSegmentRanges(
      tokenEmbeddings.length,
      Math.max(totalUnits, 1),
    );

    return chunkRanges.map((range) => {
      const overlappingIndexes = segmentRanges
        .map((segmentRange, index) => ({
          index,
          overlapUnits: this.calculateOverlapUnits(range, segmentRange),
        }))
        .filter((entry) => entry.overlapUnits > 0);

      if (overlappingIndexes.length === 0) {
        const nearestIndex = this.findNearestSegmentIndex(range, segmentRanges);
        return tokenEmbeddings[nearestIndex] ?? [];
      }

      if (strategy === "cls") {
        return tokenEmbeddings[overlappingIndexes[0].index] ?? [];
      }

      if (strategy === "attention") {
        return this.averageEmbeddings(
          overlappingIndexes.map(({ index }) => tokenEmbeddings[index] ?? []),
          overlappingIndexes.map(({ overlapUnits }) => overlapUnits),
        );
      }

      return this.averageEmbeddings(
        overlappingIndexes.map(({ index }) => tokenEmbeddings[index] ?? []),
      );
    });
  }

  private buildChunkRanges(
    boundaries: number[],
  ): Array<{ start: number; end: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    let previousBoundary = 0;

    for (const boundary of boundaries) {
      ranges.push({
        start: previousBoundary,
        end: Math.max(boundary, previousBoundary + 1),
      });
      previousBoundary = boundary;
    }

    return ranges;
  }

  private buildSegmentRanges(
    segmentCount: number,
    totalUnits: number,
  ): Array<{ start: number; end: number }> {
    return Array.from({ length: segmentCount }, (_, index) => {
      const start = Math.floor((index * totalUnits) / segmentCount);
      const end = Math.max(
        start + 1,
        Math.floor(((index + 1) * totalUnits) / segmentCount),
      );
      return { start, end };
    });
  }

  private calculateOverlapUnits(
    chunkRange: { start: number; end: number },
    segmentRange: { start: number; end: number },
  ): number {
    return Math.max(
      0,
      Math.min(chunkRange.end, segmentRange.end) -
        Math.max(chunkRange.start, segmentRange.start),
    );
  }

  private findNearestSegmentIndex(
    chunkRange: { start: number; end: number },
    segmentRanges: Array<{ start: number; end: number }>,
  ): number {
    const chunkCenter = (chunkRange.start + chunkRange.end) / 2;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    segmentRanges.forEach((segmentRange, index) => {
      const segmentCenter = (segmentRange.start + segmentRange.end) / 2;
      const distance = Math.abs(chunkCenter - segmentCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private averageEmbeddings(
    embeddings: number[][],
    weights?: number[],
  ): number[] {
    const firstEmbedding = embeddings.find((embedding) => embedding.length > 0);
    if (!firstEmbedding) {
      return [];
    }

    const dimension = firstEmbedding.length;
    const accumulator = new Array<number>(dimension).fill(0);
    let totalWeight = 0;

    embeddings.forEach((embedding, index) => {
      const weight = weights?.[index] ?? 1;
      if (embedding.length === 0 || weight <= 0) {
        return;
      }
      totalWeight += weight;
      for (let dim = 0; dim < dimension; dim += 1) {
        accumulator[dim] += (embedding[dim] ?? 0) * weight;
      }
    });

    if (totalWeight === 0) {
      return firstEmbedding;
    }

    return accumulator.map((value) => value / totalWeight);
  }
}
