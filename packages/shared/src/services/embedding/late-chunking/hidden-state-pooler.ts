import type { IHiddenStatePooler } from "./late-chunking-interfaces";
import type { PoolingStrategy, TokenRange } from "./late-chunking-types";

export class HiddenStatePooler implements IHiddenStatePooler {
  constructor(private readonly strategy: PoolingStrategy) {}

  pool(hiddenStates: Float32Array[], range: TokenRange): number[] {
    if (this.strategy === "cls") {
      return Array.from(hiddenStates[0] ?? new Float32Array(0));
    }

    const slice = hiddenStates.slice(range.startToken, range.endToken + 1);
    if (slice.length === 0) return [];

    const hiddenDim = slice[0].length;
    const result = new Float64Array(hiddenDim);

    if (this.strategy === "mean") {
      for (const vec of slice) {
        for (let d = 0; d < hiddenDim; d++) {
          result[d] += vec[d];
        }
      }
      for (let d = 0; d < hiddenDim; d++) {
        result[d] /= slice.length;
      }
    } else {
      // max pooling
      for (let d = 0; d < hiddenDim; d++) {
        result[d] = -Infinity;
      }
      for (const vec of slice) {
        for (let d = 0; d < hiddenDim; d++) {
          if (vec[d] > result[d]) result[d] = vec[d];
        }
      }
    }

    return Array.from(result);
  }
}
