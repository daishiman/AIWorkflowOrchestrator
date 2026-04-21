/**
 * TASK: UNASSIGNED-EMB-005-A
 * TARGET: XenovaTransformerEncoder
 * TEST IDs:
 *   XENC-NORMAL-01〜06  正常系
 *   XENC-ERROR-01〜08   異常系
 *   XENC-BOUNDARY-01〜04 境界系
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IEncoder } from "../../late-chunking/late-chunking-types";
import { EmbeddingError } from "../../types/errors";
import { OutOfMemoryError } from "../../late-chunking/late-chunking-types";

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

function createMockOutputs(
  seqLen: number,
  hiddenSize: number,
): {
  last_hidden_state: { dims: [number, number, number]; data: Float32Array };
} {
  const data = new Float32Array(seqLen * hiddenSize).fill(0.1);
  return { last_hidden_state: { dims: [1, seqLen, hiddenSize], data } };
}

function createOffsetMapping(seqLen: number): { data: Int32Array } {
  const arr = new Int32Array(seqLen * 2);
  for (let i = 0; i < seqLen; i++) {
    arr[i * 2] = i * 3;
    arr[i * 2 + 1] = i * 3 + 2;
  }
  return { data: arr };
}

function setupMocks(seqLen = 4, hiddenSize = 8): void {
  const offsetMapping = createOffsetMapping(seqLen);
  mockTokenize.mockReturnValue({ offset_mapping: offsetMapping });
  mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
  mockModelFromPretrained.mockResolvedValue(mockInfer);
  mockInfer.mockResolvedValue(createMockOutputs(seqLen, hiddenSize));
}

describe("XenovaTransformerEncoder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("NORMAL", () => {
    it("XENC-NORMAL-01: encode() が hiddenStates/offsetMapping の形状を返す", async () => {
      setupMocks(4, 8);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello");

      expect(Array.isArray(result.hiddenStates)).toBe(true);
      expect(Array.isArray(result.offsetMapping)).toBe(true);
      result.hiddenStates.forEach((hs) =>
        expect(hs).toBeInstanceOf(Float32Array),
      );
      result.offsetMapping.forEach((pair) => {
        expect(Array.isArray(pair)).toBe(true);
        expect(pair).toHaveLength(2);
      });
    });

    it("XENC-NORMAL-02: hiddenStates.length === offsetMapping.length（seqLen 整合）", async () => {
      setupMocks(4, 8);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello");

      expect(result.hiddenStates.length).toBe(result.offsetMapping.length);
    });

    it("XENC-NORMAL-03: モデル名未指定で Xenova/all-MiniLM-L6-v2 が from_pretrained に渡る", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();
      await encoder.encode("hello");

      expect(mockTokenizerFromPretrained).toHaveBeenCalledWith(
        "Xenova/all-MiniLM-L6-v2",
      );
      expect(mockModelFromPretrained).toHaveBeenCalledWith(
        "Xenova/all-MiniLM-L6-v2",
        expect.objectContaining({ output_hidden_states: true }),
      );
    });

    it("XENC-NORMAL-04: カスタムモデル名が両 API に伝播する", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder("Xenova/bge-small-en");
      await encoder.encode("hello");

      expect(mockTokenizerFromPretrained).toHaveBeenCalledWith(
        "Xenova/bge-small-en",
      );
      expect(mockModelFromPretrained).toHaveBeenCalledWith(
        "Xenova/bge-small-en",
        expect.objectContaining({ output_hidden_states: true }),
      );
    });

    it("XENC-NORMAL-05: encode を 2 回呼んでも from_pretrained は各 1 回のみ", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();
      await encoder.encode("hello");
      await encoder.encode("world");

      expect(mockTokenizerFromPretrained).toHaveBeenCalledTimes(1);
      expect(mockModelFromPretrained).toHaveBeenCalledTimes(1);
    });

    it("XENC-NORMAL-06: IEncoder 互換（encode メソッド存在・Promise<EncoderOutput> 返却）", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();
      const ref: IEncoder = encoder;

      expect(typeof ref.encode).toBe("function");
      const result = ref.encode("hello");
      expect(result).toBeInstanceOf(Promise);
      const resolved = await result;
      expect(resolved).toHaveProperty("hiddenStates");
      expect(resolved).toHaveProperty("offsetMapping");
    });
  });

  describe("ERROR", () => {
    it("XENC-ERROR-01: AutoModel.from_pretrained が reject → EmbeddingError", async () => {
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockRejectedValue(new Error("model not found"));
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        EmbeddingError,
      );
    });

    it("XENC-ERROR-02: AutoTokenizer.from_pretrained が reject → EmbeddingError", async () => {
      mockTokenizerFromPretrained.mockRejectedValue(
        new Error("tokenizer not found"),
      );
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        EmbeddingError,
      );
    });

    it("XENC-ERROR-03: OOM（loadModel）→ OutOfMemoryError", async () => {
      mockTokenizerFromPretrained.mockRejectedValue(
        new RangeError("Out of memory"),
      );
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        OutOfMemoryError,
      );
    });

    it("XENC-ERROR-04: OOM（encode推論時）→ OutOfMemoryError", async () => {
      setupMocks();
      mockInfer.mockRejectedValue(new RangeError("Out of memory"));
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        OutOfMemoryError,
      );
    });

    it("XENC-ERROR-05: model(inputs) が reject → EmbeddingError", async () => {
      setupMocks();
      mockInfer.mockRejectedValue(new Error("inference failed"));
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        EmbeddingError,
      );
    });

    it("XENC-ERROR-06: hidden_states 欠落 → EmbeddingError", async () => {
      const offsetMapping = createOffsetMapping(4);
      mockTokenize.mockReturnValue({ offset_mapping: offsetMapping });
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockResolvedValue(mockInfer);
      mockInfer.mockResolvedValue({});

      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        EmbeddingError,
      );
    });

    it("XENC-ERROR-07: スロー例外の cause に元エラーが含まれる", async () => {
      const originalError = new Error("original cause");
      mockTokenizerFromPretrained.mockRejectedValue(originalError);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toMatchObject({
        cause: originalError,
      });
    });

    it("XENC-ERROR-08: 既に EmbeddingError のとき再ラップせずそのまま再スロー", async () => {
      const embErr = new EmbeddingError("already embedded");
      mockTokenizerFromPretrained.mockRejectedValue(embErr);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBe(embErr);
    });

    it("XENC-ERROR-09: tokenizer 呼び出し失敗も EmbeddingError に正規化する", async () => {
      mockTokenize.mockImplementation(() => {
        throw new Error("tokenize failed");
      });
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockResolvedValue(mockInfer);

      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      await expect(encoder.encode("hello")).rejects.toBeInstanceOf(
        EmbeddingError,
      );
    });
  });

  describe("BOUNDARY", () => {
    it("XENC-BOUNDARY-01: encode('') で hiddenStates:[], offsetMapping:[] を返す", async () => {
      const offsetMapping = { data: new Int32Array(0) };
      mockTokenize.mockReturnValue({ offset_mapping: offsetMapping });
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockResolvedValue(mockInfer);
      mockInfer.mockResolvedValue({
        last_hidden_state: {
          dims: [1, 0, 8] as [number, number, number],
          data: new Float32Array(0),
        },
      });
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("");

      expect(result.hiddenStates).toHaveLength(0);
      expect(result.offsetMapping).toHaveLength(0);
    });

    it("XENC-BOUNDARY-02: 長文（seqLen=512）で hiddenStates 長が seqLen と一致", async () => {
      setupMocks(512, 384);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("a".repeat(2048));

      expect(result.hiddenStates).toHaveLength(512);
    });

    it("XENC-BOUNDARY-03: flat offset_mapping → [number,number][] 変換が正確", async () => {
      const flatData = new Int32Array([0, 5, 6, 11, 12, 17]);
      mockTokenize.mockReturnValue({ offset_mapping: { data: flatData } });
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockResolvedValue(mockInfer);
      mockInfer.mockResolvedValue(createMockOutputs(3, 8));
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello world test");

      expect(result.offsetMapping).toEqual([
        [0, 5],
        [6, 11],
        [12, 17],
      ]);
    });

    it("XENC-BOUNDARY-04: 返却 Float32Array が元バッファを共有しない（slice コピー）", async () => {
      setupMocks(2, 4);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello");

      const hs0 = result.hiddenStates[0]!;
      const original0 = hs0[0];
      hs0[0] = 999;
      const result2 = await encoder.encode("hello");
      expect(result2.hiddenStates[0]![0]).toBe(original0);
    });

    it("XENC-BOUNDARY-05: CJK 文字列で offsetMapping の各ペアが数値ペアである", async () => {
      setupMocks(5, 8);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("日本語テスト");

      result.offsetMapping.forEach(([start, end]) => {
        expect(typeof start).toBe("number");
        expect(typeof end).toBe("number");
      });
    });

    it("XENC-BOUNDARY-06: 絵文字を含む文字列でも offsetMapping が壊れない", async () => {
      setupMocks(4, 8);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello 🎉 world");

      expect(result.offsetMapping).toHaveLength(4);
      result.offsetMapping.forEach((pair) => {
        expect(pair).toHaveLength(2);
        expect(isNaN(pair[0])).toBe(false);
        expect(isNaN(pair[1])).toBe(false);
      });
    });

    it("XENC-BOUNDARY-07: 大規模テキスト（seqLen=2048）で通常終了する", async () => {
      setupMocks(2048, 384);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("a".repeat(8192));

      expect(result.hiddenStates).toHaveLength(2048);
      expect(result.offsetMapping).toHaveLength(2048);
    });

    it("XENC-BOUNDARY-08: 単一トークン（seqLen=1）で長さが 1 になる", async () => {
      setupMocks(1, 8);
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hi");

      expect(result.hiddenStates).toHaveLength(1);
      expect(result.offsetMapping).toHaveLength(1);
    });

    it("XENC-BOUNDARY-09: 奇数長 offset_mapping で末尾を破棄して安全に動作する", async () => {
      const oddData = new Int32Array([0, 5, 6, 11, 12]);
      mockTokenize.mockReturnValue({ offset_mapping: { data: oddData } });
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockResolvedValue(mockInfer);
      mockInfer.mockResolvedValue({
        last_hidden_state: {
          dims: [1, 3, 8] as [number, number, number],
          data: new Float32Array(24).fill(0.1),
        },
      });
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello world");

      expect(result.offsetMapping).toEqual([
        [0, 5],
        [6, 11],
      ]);
    });
  });

  describe("REGRESSION", () => {
    it("XENC-REG-01: XenovaTransformerEncoder が IEncoder 型変数に代入可能", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();
      const ref: import("../../late-chunking/late-chunking-types").IEncoder =
        encoder;

      expect(typeof ref.encode).toBe("function");
    });

    it("XENC-REG-02: EncoderOutput のキーが hiddenStates / offsetMapping の 2 つのみ", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello");

      expect(Object.keys(result).sort()).toEqual(
        ["hiddenStates", "offsetMapping"].sort(),
      );
    });

    it("XENC-REG-03: last_hidden_state が undefined でも hidden_states fallback で動作する", async () => {
      const offsetMapping = { data: new Int32Array([0, 5, 6, 11]) };
      mockTokenize.mockReturnValue({ offset_mapping: offsetMapping });
      mockTokenizerFromPretrained.mockResolvedValue(mockTokenize);
      mockModelFromPretrained.mockResolvedValue(mockInfer);
      mockInfer.mockResolvedValue({
        hidden_states: [
          {
            dims: [1, 2, 8] as [number, number, number],
            data: new Float32Array(16).fill(0.2),
          },
        ],
      });
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();

      const result = await encoder.encode("hello world");

      expect(result.hiddenStates).toHaveLength(2);
    });

    it("XENC-REG-04: デフォルトモデル名が Xenova/all-MiniLM-L6-v2", async () => {
      setupMocks();
      const { XenovaTransformerEncoder } =
        await import("../../late-chunking/xenova-transformer-encoder");
      const encoder = new XenovaTransformerEncoder();
      await encoder.encode("hello");

      expect(mockTokenizerFromPretrained).toHaveBeenCalledWith(
        "Xenova/all-MiniLM-L6-v2",
      );
    });

    it("XENC-REG-05: OutOfMemoryError が EmbeddingError を継承している（instanceof）", () => {
      const oom = new OutOfMemoryError("test");

      expect(oom).toBeInstanceOf(OutOfMemoryError);
      expect(oom).toBeInstanceOf(EmbeddingError);
    });
  });
});
