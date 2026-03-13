import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createPreviewApiUnavailableError,
  createStructuredPreviewParseError,
  formatPreviewStatusText,
  readPreviewFileWithResilience,
} from "../utils/previewResilience";

describe("previewResilience", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("timeout は 3 回 retry 後に transport error へ落とす", async () => {
    vi.useFakeTimers();
    const readFile = vi.fn().mockImplementation(() => new Promise(() => {}));

    const promise = readPreviewFileWithResilience({
      filePath: "/workspace/app.ts",
      readFile,
      timeoutMs: 50,
      retryDelayMs: 10,
      maxRetries: 3,
    });

    await vi.advanceTimersByTimeAsync(170);

    await expect(promise).resolves.toMatchObject({
      success: false,
      error: {
        category: "transport",
        code: "file-read-timeout",
        retryable: true,
        attempts: 3,
      },
    });
    expect(readFile).toHaveBeenCalledTimes(3);
  });

  it("read failure も retry を経て error detail に残す", async () => {
    const readFile = vi.fn().mockResolvedValue({
      success: false,
      error: "Permission denied",
    });

    const result = await readPreviewFileWithResilience({
      filePath: "/workspace/secure.ts",
      readFile,
      retryDelayMs: 0,
      maxRetries: 3,
      wait: async () => {},
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        category: "transport",
        code: "file-read-failure",
        summary: "ファイル読み込みに失敗しました",
        detail: "Permission denied / 3回再試行済み",
      },
    });
    expect(readFile).toHaveBeenCalledTimes(3);
  });

  it("api unavailable / parse fallback の taxonomy を文字列へ変換できる", () => {
    expect(
      formatPreviewStatusText(createPreviewApiUnavailableError()),
    ).toContain("file API が利用できません");
    expect(
      formatPreviewStatusText(
        createStructuredPreviewParseError("Structured preview failed"),
      ),
    ).toContain("JSON/YAML を整形できなかったため");
  });
});
