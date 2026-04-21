/**
 * TASK: UNASSIGNED-EMB-005-A
 * TEST IDs: XENC-INT-01〜06
 * 目的: XenovaTransformerEncoder × LateChunkingService 統合テスト（AC-6）
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LateChunkingService } from "../../late-chunking/late-chunking-service";
import { XenovaTransformerEncoder } from "../../late-chunking/xenova-transformer-encoder";
import type { ChunkBoundary } from "../../late-chunking/late-chunking-types";
import { EmbeddingError } from "../../types/errors";
import { OutOfMemoryError } from "../../late-chunking/late-chunking-types";

const HIDDEN_SIZE = 8;
const SEQ_LEN = 6;

const {
  mockTokenizerFromPretrained,
  mockModelFromPretrained,
  mockTokenize,
  mockInfer,
} = vi.hoisted(() => ({
  mockTokenizerFromPretrained: vi.fn(),
  mockModelFromPretrained: vi.fn(),
  mockTokenize: vi.fn(),
  mockInfer: vi.fn(),
}));

vi.mock("@xenova/transformers", () => ({
  AutoTokenizer: { from_pretrained: mockTokenizerFromPretrained },
  AutoModel: { from_pretrained: mockModelFromPretrained },
}));

function buildOffsetMapping(seqLen: number): { data: Int32Array } {
  const arr = new Int32Array(seqLen * 2);
  for (let i = 0; i < seqLen; i++) {
    arr[i * 2] = i * 2;
    arr[i * 2 + 1] = i * 2 + 1;
  }
  return { data: arr };
}

function buildModelOutput(
  seqLen: number,
  hiddenSize: number,
): {
  last_hidden_state: { dims: [number, number, number]; data: Float32Array };
} {
  const data = new Float32Array(seqLen * hiddenSize);
  for (let i = 0; i < seqLen * hiddenSize; i++) {
    data[i] = (i % hiddenSize) * 0.1 + 0.05;
  }
  return { last_hidden_state: { dims: [1, seqLen, hiddenSize], data } };
}

function setupIntegrationMocks(
  seqLen = SEQ_LEN,
  hiddenSize = HIDDEN_SIZE,
): void {
  mockTokenize.mockReturnValue({ offset_mapping: buildOffsetMapping(seqLen) });
  mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
  mockModelFromPretrained.mockResolvedValue(mockInfer);
  mockInfer.mockResolvedValue(buildModelOutput(seqLen, hiddenSize));
}

describe("XenovaTransformerEncoder × LateChunkingService 統合", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("XENC-INT-01: generateChunkEmbeddings が 1 チャンクで ChunkEmbeddingResult を返す", async () => {
    setupIntegrationMocks();
    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);
    const boundaries: ChunkBoundary[] = [
      { startChar: 0, endChar: 3, chunkId: "c1" },
    ];

    const result = await service.generateChunkEmbeddings(
      "hello world",
      boundaries,
    );

    expect(result).toHaveLength(1);
    expect(result[0]!.chunkId).toBe("c1");
    expect(result[0]!.embedding).toHaveLength(HIDDEN_SIZE);
  });

  it("XENC-INT-02: 複数チャンク（3件）で chunkId と tokenCount が正しい", async () => {
    setupIntegrationMocks(6, HIDDEN_SIZE);
    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);
    const boundaries: ChunkBoundary[] = [
      { startChar: 0, endChar: 1, chunkId: "c1" },
      { startChar: 2, endChar: 3, chunkId: "c2" },
      { startChar: 4, endChar: 5, chunkId: "c3" },
    ];

    const result = await service.generateChunkEmbeddings(
      "aaa bbb ccc",
      boundaries,
    );

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.chunkId)).toEqual(["c1", "c2", "c3"]);
    result.forEach((r) => expect(r.tokenCount).toBeGreaterThanOrEqual(1));
  });

  it("XENC-INT-03: mean pooling で embedding が配列を返す", async () => {
    setupIntegrationMocks();
    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);
    const boundaries: ChunkBoundary[] = [
      { startChar: 0, endChar: 3, chunkId: "c1" },
    ];

    const result = await service.generateChunkEmbeddings(
      "hello world",
      boundaries,
      { poolingStrategy: "mean" },
    );

    expect(Array.isArray(result[0]!.embedding)).toBe(true);
    expect(result[0]!.embedding.length).toBeGreaterThan(0);
  });

  it("XENC-INT-04: DI 互換性 - new LateChunkingService(new XenovaTransformerEncoder()) がコンパイル・実行可能", async () => {
    setupIntegrationMocks();

    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);

    const result = await service.generateChunkEmbeddings("test text", [
      { startChar: 0, endChar: 3, chunkId: "c1" },
    ]);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("XENC-INT-05: encode が EmbeddingError を投げると generateChunkEmbeddings が伝搬する", async () => {
    mockTokenizerFromPretrained.mockRejectedValue(
      new Error("model load failed"),
    );
    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);

    await expect(
      service.generateChunkEmbeddings("hello", [
        { startChar: 0, endChar: 4, chunkId: "c1" },
      ]),
    ).rejects.toBeInstanceOf(EmbeddingError);
  });

  it("XENC-INT-06: OutOfMemoryError が LateChunkingService を通り抜けて届く", async () => {
    mockTokenizerFromPretrained.mockRejectedValue(
      new RangeError("Out of memory"),
    );
    const encoder = new XenovaTransformerEncoder();
    const service = new LateChunkingService(encoder);

    await expect(
      service.generateChunkEmbeddings("hello", [
        { startChar: 0, endChar: 4, chunkId: "c1" },
      ]),
    ).rejects.toBeInstanceOf(OutOfMemoryError);
  });
});
