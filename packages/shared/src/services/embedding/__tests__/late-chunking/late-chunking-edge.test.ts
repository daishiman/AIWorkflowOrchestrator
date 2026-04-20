import { describe, it, expect, vi } from "vitest";
import { LateChunkingService } from "../../late-chunking/late-chunking-service";
import { TokenBoundaryCalculator } from "../../late-chunking/token-boundary-calculator";
import {
  InvalidBoundaryError,
  type ChunkBoundary,
  type LateChunkingConfig,
  type IEncoder,
  type EncoderOutput,
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

const defaultConfig: LateChunkingConfig = {
  poolingStrategy: "mean",
  useFloat16: false,
  maxTokenLength: 512,
  windowOverlapTokens: 16,
};

describe("LateChunkingService 異常系", () => {
  it("空文字列入力で空配列を返す（エラーなし）", async () => {
    const encoder = createMockEncoder(0, 4);
    (encoder.encode as ReturnType<typeof vi.fn>).mockResolvedValue({
      hiddenStates: [],
      offsetMapping: [],
    } as EncoderOutput);
    const service = new LateChunkingService(encoder);

    const result = await service.generateChunkEmbeddings("", [], defaultConfig);
    expect(result).toEqual([]);
  });

  it("エンコーダが失敗した場合に例外が上位に伝播する", async () => {
    const encoder: IEncoder = {
      encode: vi.fn().mockRejectedValue(new Error("encoder failure")),
    };
    const service = new LateChunkingService(encoder);

    await expect(
      service.generateChunkEmbeddings(
        "test",
        [{ startChar: 0, endChar: 3, chunkId: "c1" }],
        defaultConfig,
      ),
    ).rejects.toThrow("encoder failure");
  });
});

describe("TokenBoundaryCalculator 異常系", () => {
  const calculator = new TokenBoundaryCalculator();
  const offsetMapping: [number, number][] = [
    [0, 4],
    [5, 9],
  ];

  it("startChar > endChar で InvalidBoundaryError をスローする", () => {
    const boundaries: ChunkBoundary[] = [
      { startChar: 5, endChar: 2, chunkId: "bad" },
    ];
    expect(() => calculator.calculate(boundaries, offsetMapping)).toThrow(
      InvalidBoundaryError,
    );
  });

  it("負のstartChar で InvalidBoundaryError をスローする", () => {
    const boundaries: ChunkBoundary[] = [
      { startChar: -1, endChar: 4, chunkId: "bad" },
    ];
    expect(() => calculator.calculate(boundaries, offsetMapping)).toThrow(
      InvalidBoundaryError,
    );
  });

  it("空のchunkBoundariesで空配列を返す", () => {
    const result = calculator.calculate([], offsetMapping);
    expect(result).toEqual([]);
  });
});

describe("後方互換性 - EmbeddingService", () => {
  it("LateChunkingService クラスがコンストラクタを持つ", () => {
    expect(typeof LateChunkingService).toBe("function");
    expect(LateChunkingService.prototype.generateChunkEmbeddings).toBeDefined();
  });
});
