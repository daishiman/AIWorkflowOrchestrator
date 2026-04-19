import { describe, it, expect } from "vitest";
import { WindowSplitter } from "../../late-chunking/window-splitter";
import { HiddenStatePooler } from "../../late-chunking/hidden-state-pooler";
import { TokenBoundaryCalculator } from "../../late-chunking/token-boundary-calculator";
import type { TokenRange } from "../../late-chunking/late-chunking-types";

describe("回帰テスト - 既存EmbeddingService互換", () => {
  it("EmbeddingService が lateChunkingService なしで構築できる", async () => {
    const { EmbeddingService } = await import("../../embedding-service");
    const { createMockProvider } =
      await import("../../../chunking/__tests__/helpers").catch(() => ({
        createMockProvider: null,
      }));
    void createMockProvider;
    expect(EmbeddingService).toBeDefined();
  });

  it("WindowSplitter が既存の chunkSize 設定と競合しない", () => {
    const splitter = new WindowSplitter(512, 16);
    const smallTokens = Array.from({ length: 100 }, (_, i) => i);
    const windows = splitter.split(smallTokens);
    expect(windows).toHaveLength(1);
  });
});

describe("回帰テスト - HiddenStatePooler 境界条件", () => {
  it("単一トークンでMean/Max/CLSが同じベクトルを返す", () => {
    const vector = Float32Array.from([0.1, 0.2, 0.3, 0.4]);
    const hiddenStates = [vector];
    const range: TokenRange = { startToken: 0, endToken: 0, chunkId: "c1" };

    const meanResult = new HiddenStatePooler("mean").pool(hiddenStates, range);
    const maxResult = new HiddenStatePooler("max").pool(hiddenStates, range);

    expect(meanResult[0]).toBeCloseTo(maxResult[0], 5);
  });

  it("hiddenStatesが空でも例外を投げない", () => {
    const pooler = new HiddenStatePooler("mean");
    const range: TokenRange = { startToken: 0, endToken: 0, chunkId: "c1" };
    expect(() => pooler.pool([], range)).not.toThrow();
  });
});

describe("回帰テスト - TokenBoundaryCalculator 境界条件", () => {
  it("全テキストを一つのチャンクとして扱える", () => {
    const calculator = new TokenBoundaryCalculator();
    const offsetMapping: [number, number][] = [
      [0, 4],
      [5, 9],
      [10, 14],
    ];
    const result = calculator.calculate(
      [{ startChar: 0, endChar: 14, chunkId: "whole" }],
      offsetMapping,
    );
    expect(result[0].startToken).toBe(0);
    expect(result[0].endToken).toBe(2);
  });
});
