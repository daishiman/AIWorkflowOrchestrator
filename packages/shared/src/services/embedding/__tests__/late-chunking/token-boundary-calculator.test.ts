import { describe, it, expect } from "vitest";
import { TokenBoundaryCalculator } from "../../late-chunking/token-boundary-calculator";
import type { ChunkBoundary } from "../../late-chunking/late-chunking-types";
import { InvalidBoundaryError } from "../../late-chunking/late-chunking-types";

describe("TokenBoundaryCalculator", () => {
  const calculator = new TokenBoundaryCalculator();

  // offset_mapping: 文字インデックス → トークンインデックス
  // "Hello world" → [0,5] → token 0, [6,11] → token 1
  const sampleOffsetMapping: [number, number][] = [
    [0, 5], // token 0: "Hello"
    [6, 11], // token 1: "world"
  ];

  describe("calculate", () => {
    it("正常な文字オフセットをトークン範囲に変換する", () => {
      const boundaries: ChunkBoundary[] = [
        { startChar: 0, endChar: 5, chunkId: "c1" },
        { startChar: 6, endChar: 11, chunkId: "c2" },
      ];

      const result = calculator.calculate(boundaries, sampleOffsetMapping);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ startToken: 0, endToken: 0, chunkId: "c1" });
      expect(result[1]).toEqual({ startToken: 1, endToken: 1, chunkId: "c2" });
    });

    it("複数トークンにまたがる境界を変換する", () => {
      const offsetMapping: [number, number][] = [
        [0, 3], // token 0
        [4, 7], // token 1
        [8, 11], // token 2
      ];
      const boundaries: ChunkBoundary[] = [
        { startChar: 0, endChar: 11, chunkId: "c1" },
      ];

      const result = calculator.calculate(boundaries, offsetMapping);

      expect(result[0].startToken).toBe(0);
      expect(result[0].endToken).toBe(2);
    });

    it("空のboundaries配列で空配列を返す", () => {
      const result = calculator.calculate([], sampleOffsetMapping);
      expect(result).toHaveLength(0);
    });
  });

  describe("エラーハンドリング", () => {
    it("startChar > endChar で InvalidBoundaryError をスローする", () => {
      const boundaries: ChunkBoundary[] = [
        { startChar: 5, endChar: 2, chunkId: "bad" },
      ];

      expect(() =>
        calculator.calculate(boundaries, sampleOffsetMapping),
      ).toThrow(InvalidBoundaryError);
    });

    it("負のオフセットで InvalidBoundaryError をスローする", () => {
      const boundaries: ChunkBoundary[] = [
        { startChar: -1, endChar: 5, chunkId: "bad" },
      ];

      expect(() =>
        calculator.calculate(boundaries, sampleOffsetMapping),
      ).toThrow(InvalidBoundaryError);
    });
  });
});
