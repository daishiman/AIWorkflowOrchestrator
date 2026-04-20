import { describe, it, expect } from "vitest";
import { WindowSplitter } from "../../late-chunking/window-splitter";

describe("WindowSplitter", () => {
  describe("split", () => {
    it("トークン数がmaxTokenLength以下なら分割しない", () => {
      const splitter = new WindowSplitter(10, 2);
      const tokens = [1, 2, 3, 4, 5];

      const windows = splitter.split(tokens);

      expect(windows).toHaveLength(1);
      expect(windows[0]).toEqual(tokens);
    });

    it("トークン数がmaxTokenLengthを超える場合にウィンドウ分割する", () => {
      const splitter = new WindowSplitter(4, 1);
      const tokens = [1, 2, 3, 4, 5, 6];

      const windows = splitter.split(tokens);

      expect(windows.length).toBeGreaterThan(1);
      expect(windows[0]).toHaveLength(4);
    });

    it("windowOverlapTokensで指定したトークン数が重複する", () => {
      const splitter = new WindowSplitter(4, 2);
      const tokens = [1, 2, 3, 4, 5, 6, 7];

      const windows = splitter.split(tokens);

      // ウィンドウ1末尾とウィンドウ2先頭が重複
      const lastOfFirst = windows[0].slice(-2);
      const firstOfSecond = windows[1].slice(0, 2);
      expect(lastOfFirst).toEqual(firstOfSecond);
    });

    it("空配列で空配列を返す", () => {
      const splitter = new WindowSplitter(4, 1);
      expect(splitter.split([])).toEqual([[]]);
    });

    it("最終ウィンドウはパディングせず末端で打ち切る", () => {
      const splitter = new WindowSplitter(4, 1);
      const tokens = [1, 2, 3, 4, 5];

      const windows = splitter.split(tokens);
      const lastWindow = windows[windows.length - 1];

      expect(lastWindow[lastWindow.length - 1]).toBe(5);
    });
  });
});
