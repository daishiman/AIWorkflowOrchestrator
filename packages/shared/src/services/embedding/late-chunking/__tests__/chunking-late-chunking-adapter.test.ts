/**
 * ChunkingLateChunkingAdapter 単体テスト
 *
 * @description SEP-01 〜 SEP-07 を検証する。ChunkingService から抽出した
 *              Late Chunking アダプタの単体テスト。
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ChunkingLateChunkingAdapter } from "../chunking-late-chunking-adapter";
import {
  MockTokenizer,
  MockEmbeddingClient,
  ConfigurableEmbeddingClient,
} from "../../../chunking/__tests__/mocks";
import type { Chunk, LateChunkingOptions } from "../../../chunking/types";

describe("ChunkingLateChunkingAdapter", () => {
  let tokenizer: MockTokenizer;
  let embeddingClient: MockEmbeddingClient;
  let service: ChunkingLateChunkingAdapter;

  const baseOptions: LateChunkingOptions = {
    enabled: true,
    embeddingModel: "mock",
    chunkBoundaries: "token",
    maxSequenceLength: 512,
    poolingStrategy: "mean",
  };

  const makeChunk = (
    id: string,
    start: number,
    end: number,
    content = "x",
  ): Chunk => ({
    id,
    content,
    tokenCount: end - start,
    position: { start, end },
    metadata: { strategy: "fixed" },
  });

  beforeEach(() => {
    tokenizer = new MockTokenizer();
    embeddingClient = new MockEmbeddingClient();
    service = new ChunkingLateChunkingAdapter(tokenizer, embeddingClient);
  });

  describe("applyLateChunking", () => {
    it("SEP-01: 単一チャンク・mean pooling で applied=true かつ embeddingDimension > 0 を返す", async () => {
      const chunks = [makeChunk("c1", 0, 5, "hello")];
      const result = await service.applyLateChunking(
        "hello",
        chunks,
        baseOptions,
      );

      expect(result).toHaveLength(1);
      expect(result[0].metadata.lateChunking?.applied).toBe(true);
      expect(
        result[0].metadata.lateChunking?.embeddingDimension,
      ).toBeGreaterThan(0);
    });

    it("SEP-02: 複数チャンク・cls pooling で各チャンクに applied=true を設定する", async () => {
      // 簡略化実装では maxSequenceLength < tokens.length のときのみ複数セグメントに分割される。
      // 本テストは text 長 > maxSequenceLength でセグメント化が起きる条件を設定する。
      const smallMaxSeq = 3;
      const text = "helloworld"; // 10 tokens (MockTokenizer は文字単位)
      const chunks = [
        makeChunk("c1", 0, 5, "hello"),
        makeChunk("c2", 5, 10, "world"),
      ];
      const result = await service.applyLateChunking(text, chunks, {
        ...baseOptions,
        maxSequenceLength: smallMaxSeq,
        poolingStrategy: "cls",
      });

      expect(result).toHaveLength(2);
      expect(
        result.every((c) => c.metadata.lateChunking?.applied === true),
      ).toBe(true);
      expect(
        result.every(
          (c) => (c.metadata.lateChunking?.embeddingDimension ?? 0) > 0,
        ),
      ).toBe(true);
    });

    it("SEP-02A: チャンク数がセグメント数を上回っても全チャンクで embeddingDimension > 0 を維持する", async () => {
      const text = "abcdefghij";
      const chunks = [
        makeChunk("c1", 0, 2, "ab"),
        makeChunk("c2", 2, 4, "cd"),
        makeChunk("c3", 4, 7, "efg"),
        makeChunk("c4", 7, 10, "hij"),
      ];

      const result = await service.applyLateChunking(text, chunks, {
        ...baseOptions,
        maxSequenceLength: 5,
      });

      expect(
        result.every(
          (chunk) => (chunk.metadata.lateChunking?.embeddingDimension ?? 0) > 0,
        ),
      ).toBe(true);
    });
  });

  describe("determineChunkBoundaries", () => {
    it("SEP-03: 複数チャンクで position.end の配列を返す", () => {
      const chunks = [makeChunk("c1", 0, 10), makeChunk("c2", 10, 20)];

      expect(service.determineChunkBoundaries(chunks)).toEqual([10, 20]);
    });

    it("SEP-04: 空配列で空配列を返す", () => {
      expect(service.determineChunkBoundaries([])).toEqual([]);
    });
  });

  describe("poolTokenEmbeddings", () => {
    const tokenEmbeddings = [
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ];
    const boundaries = [1, 2];

    it("SEP-05: strategy=mean で埋め込み配列を返す", () => {
      const out = service.poolTokenEmbeddings(
        tokenEmbeddings,
        boundaries,
        "mean",
      );
      expect(out).toHaveLength(tokenEmbeddings.length);
      expect(out[0]).toHaveLength(3);
    });

    it("SEP-05A: boundaries を使って mean pooling の結果が変化する", () => {
      const weightedClient = new ConfigurableEmbeddingClient(2);
      weightedClient.setEmbedding("ab", [1, 1]);
      weightedClient.setEmbedding("cd", [3, 3]);
      weightedClient.setEmbedding("ef", [9, 9]);
      const weightedService = new ChunkingLateChunkingAdapter(
        tokenizer,
        weightedClient,
      );

      const out = weightedService.poolTokenEmbeddings(
        [
          [1, 1],
          [3, 3],
          [9, 9],
        ],
        [3, 6],
        "mean",
      );

      expect(out).toHaveLength(2);
      expect(out[0][0]).toBeCloseTo(2, 5);
      expect(out[1][0]).toBeCloseTo(6, 5);
    });

    it("SEP-06: strategy=cls で埋め込み配列を返す", () => {
      const out = service.poolTokenEmbeddings(
        tokenEmbeddings,
        boundaries,
        "cls",
      );
      expect(out).toHaveLength(tokenEmbeddings.length);
      expect(out[0]).toHaveLength(3);
    });

    it("SEP-06A: strategy=cls は最初の重複セグメントを返す", () => {
      const out = service.poolTokenEmbeddings(
        [
          [1, 1],
          [3, 3],
          [9, 9],
        ],
        [3, 6],
        "cls",
      );

      expect(out[0]).toEqual([1, 1]);
      expect(out[1]).toEqual([3, 3]);
    });

    it("SEP-07: strategy=attention で埋め込み配列を返す", () => {
      const out = service.poolTokenEmbeddings(
        tokenEmbeddings,
        boundaries,
        "attention",
      );
      expect(out).toHaveLength(tokenEmbeddings.length);
      expect(out[0]).toHaveLength(3);
    });

    it("SEP-07A: strategy=attention は overlap 重み付き平均を返す", () => {
      const out = service.poolTokenEmbeddings(
        [
          [1, 1],
          [3, 3],
          [9, 9],
        ],
        [3, 6],
        "attention",
      );

      expect(out[0][0]).toBeCloseTo(1.6666667, 5);
      expect(out[1][0]).toBeCloseTo(7, 5);
    });
  });
});
