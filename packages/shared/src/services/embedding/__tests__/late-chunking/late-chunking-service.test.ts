import { describe, it, expect, vi } from "vitest";
import { LateChunkingService } from "../../late-chunking/late-chunking-service";
import type {
  ChunkBoundary,
  LateChunkingConfig,
  IEncoder,
  EncoderOutput,
} from "../../late-chunking/late-chunking-types";

function createMockEncoder(tokenCount: number, hiddenDim: number): IEncoder {
  return {
    encode: vi.fn().mockResolvedValue({
      hiddenStates: Array.from({ length: tokenCount }, (_, i) =>
        Float32Array.from({ length: hiddenDim }, () => (i + 1) * 0.1),
      ),
      offsetMapping: Array.from({ length: tokenCount }, (_, i) => [
        i * 5,
        i * 5 + 4,
      ]) as [number, number][],
    } as EncoderOutput),
  };
}

describe("LateChunkingService", () => {
  const defaultConfig: LateChunkingConfig = {
    poolingStrategy: "mean",
    useFloat16: false,
    maxTokenLength: 512,
    windowOverlapTokens: 16,
  };

  describe("generateChunkEmbeddings", () => {
    it("正常なテキストとチャンク境界でEmbeddingを返す", async () => {
      const encoder = createMockEncoder(2, 4);
      const service = new LateChunkingService(encoder);

      const text = "Hello world";
      const boundaries: ChunkBoundary[] = [
        { startChar: 0, endChar: 4, chunkId: "c1" },
        { startChar: 5, endChar: 9, chunkId: "c2" },
      ];

      const result = await service.generateChunkEmbeddings(
        text,
        boundaries,
        defaultConfig,
      );

      expect(result).toHaveLength(2);
      expect(result[0].chunkId).toBe("c1");
      expect(result[1].chunkId).toBe("c2");
      expect(Array.isArray(result[0].embedding)).toBe(true);
    });

    it("空文字列で空配列を返す", async () => {
      const encoder = createMockEncoder(0, 4);
      (encoder.encode as ReturnType<typeof vi.fn>).mockResolvedValue({
        hiddenStates: [],
        offsetMapping: [],
      });
      const service = new LateChunkingService(encoder);

      const result = await service.generateChunkEmbeddings(
        "",
        [],
        defaultConfig,
      );

      expect(result).toHaveLength(0);
    });

    it("返されるEmbeddingの配列長がchunkBoundaries数と一致する", async () => {
      const encoder = createMockEncoder(3, 8);
      const service = new LateChunkingService(encoder);

      const text = "aaa bbb ccc";
      const boundaries: ChunkBoundary[] = [
        { startChar: 0, endChar: 2, chunkId: "c1" },
        { startChar: 4, endChar: 6, chunkId: "c2" },
        { startChar: 8, endChar: 10, chunkId: "c3" },
      ];

      const result = await service.generateChunkEmbeddings(
        text,
        boundaries,
        defaultConfig,
      );

      expect(result).toHaveLength(3);
    });

    it("poolingStrategy: max でEmbeddingを生成する", async () => {
      const encoder = createMockEncoder(2, 4);
      const service = new LateChunkingService(encoder);

      const result = await service.generateChunkEmbeddings(
        "Hello world",
        [{ startChar: 0, endChar: 4, chunkId: "c1" }],
        { ...defaultConfig, poolingStrategy: "max" },
      );

      expect(result[0].embedding).toHaveLength(4);
    });

    it("poolingStrategy: cls でEmbeddingを生成する", async () => {
      const encoder = createMockEncoder(2, 4);
      const service = new LateChunkingService(encoder);

      const result = await service.generateChunkEmbeddings(
        "Hello world",
        [{ startChar: 0, endChar: 4, chunkId: "c1" }],
        { ...defaultConfig, poolingStrategy: "cls" },
      );

      expect(result[0].embedding).toHaveLength(4);
    });
  });
});
