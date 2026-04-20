import type { ITokenBoundaryCalculator } from "./late-chunking-interfaces";
import type { ChunkBoundary, TokenRange } from "./late-chunking-types";
import { InvalidBoundaryError } from "./late-chunking-types";

export class TokenBoundaryCalculator implements ITokenBoundaryCalculator {
  calculate(
    boundaries: ChunkBoundary[],
    offsetMapping: [number, number][],
  ): TokenRange[] {
    return boundaries.map((boundary) => {
      if (boundary.startChar < 0 || boundary.endChar < 0) {
        throw new InvalidBoundaryError(
          `Negative char offset: startChar=${boundary.startChar}, endChar=${boundary.endChar}`,
        );
      }
      if (boundary.startChar > boundary.endChar) {
        throw new InvalidBoundaryError(
          `startChar (${boundary.startChar}) > endChar (${boundary.endChar})`,
        );
      }

      const startToken = this.charToToken(
        boundary.startChar,
        offsetMapping,
        "start",
      );
      const endToken = this.charToToken(boundary.endChar, offsetMapping, "end");

      return { startToken, endToken, chunkId: boundary.chunkId };
    });
  }

  private charToToken(
    charPos: number,
    offsetMapping: [number, number][],
    mode: "start" | "end",
  ): number {
    if (offsetMapping.length === 0) return 0;

    for (let i = 0; i < offsetMapping.length; i++) {
      const [_tokenStart, tokenEnd] = offsetMapping[i];
      if (mode === "start" && charPos <= tokenEnd) return i;
      if (mode === "end" && charPos <= tokenEnd) return i;
    }

    return offsetMapping.length - 1;
  }
}
