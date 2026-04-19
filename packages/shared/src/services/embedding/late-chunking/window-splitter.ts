import type { IWindowSplitter } from "./late-chunking-interfaces";

export class WindowSplitter implements IWindowSplitter {
  constructor(
    private readonly maxTokenLength: number,
    private readonly windowOverlapTokens: number,
  ) {}

  split(tokens: number[]): number[][] {
    if (tokens.length === 0) return [[]];
    if (tokens.length <= this.maxTokenLength) return [tokens];

    const windows: number[][] = [];
    const stride = this.maxTokenLength - this.windowOverlapTokens;
    let start = 0;

    while (start < tokens.length) {
      const end = Math.min(start + this.maxTokenLength, tokens.length);
      windows.push(tokens.slice(start, end));
      if (end === tokens.length) break;
      start += stride;
    }

    return windows;
  }
}
