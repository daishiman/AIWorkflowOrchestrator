import { describe, it, expect } from "vitest";
import { HiddenStatePooler } from "../../late-chunking/hidden-state-pooler";
import type { TokenRange } from "../../late-chunking/late-chunking-types";

function makeHiddenStates(
  tokenCount: number,
  hiddenDim: number,
): Float32Array[] {
  return Array.from({ length: tokenCount }, (_, i) =>
    Float32Array.from({ length: hiddenDim }, (_, j) => (i + 1) * (j + 1) * 0.1),
  );
}

describe("HiddenStatePooler", () => {
  const hiddenDim = 4;

  describe("mean pooling", () => {
    it("指定範囲のトークンHidden Stateの平均を返す", () => {
      const pooler = new HiddenStatePooler("mean");
      // token0: [0.1, 0.2, 0.3, 0.4], token1: [0.2, 0.4, 0.6, 0.8]
      const hiddenStates = makeHiddenStates(2, hiddenDim);
      const range: TokenRange = { startToken: 0, endToken: 1, chunkId: "c1" };

      const result = pooler.pool(hiddenStates, range);

      expect(result).toHaveLength(hiddenDim);
      // 平均: [(0.1+0.2)/2, (0.2+0.4)/2, ...]
      expect(result[0]).toBeCloseTo(0.15, 5);
      expect(result[1]).toBeCloseTo(0.3, 5);
    });

    it("単一トークン範囲でそのままのベクトルを返す", () => {
      const pooler = new HiddenStatePooler("mean");
      const hiddenStates = makeHiddenStates(3, hiddenDim);
      const range: TokenRange = { startToken: 1, endToken: 1, chunkId: "c1" };

      const result = pooler.pool(hiddenStates, range);

      expect(result[0]).toBeCloseTo(hiddenStates[1][0], 5);
    });
  });

  describe("max pooling", () => {
    it("指定範囲の各次元の最大値を返す", () => {
      const pooler = new HiddenStatePooler("max");
      const hiddenStates = makeHiddenStates(2, hiddenDim);
      const range: TokenRange = { startToken: 0, endToken: 1, chunkId: "c1" };

      const result = pooler.pool(hiddenStates, range);

      // token1のベクトルが全次元で大きい
      expect(result[0]).toBeCloseTo(hiddenStates[1][0], 5);
    });
  });

  describe("cls pooling", () => {
    it("CLSトークン（インデックス0）のベクトルをそのまま返す", () => {
      const pooler = new HiddenStatePooler("cls");
      const hiddenStates = makeHiddenStates(3, hiddenDim);
      const range: TokenRange = { startToken: 1, endToken: 2, chunkId: "c1" };

      const result = pooler.pool(hiddenStates, range);

      // CLS (index 0) のベクトルを返す
      for (let i = 0; i < hiddenDim; i++) {
        expect(result[i]).toBeCloseTo(hiddenStates[0][i], 5);
      }
    });
  });

  describe("出力形式", () => {
    it("結果はnumber[]として返される", () => {
      const pooler = new HiddenStatePooler("mean");
      const hiddenStates = makeHiddenStates(2, hiddenDim);
      const range: TokenRange = { startToken: 0, endToken: 1, chunkId: "c1" };

      const result = pooler.pool(hiddenStates, range);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((v) => expect(typeof v).toBe("number"));
    });
  });
});
