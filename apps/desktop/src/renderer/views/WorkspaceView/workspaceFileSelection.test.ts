import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSelectedFile } from "./workspaceFileSelection";

describe("createSelectedFile", () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "uuid-workspace-test",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("拡張子と MIME を推定して SelectedFile を生成する", () => {
    const selectedFile = createSelectedFile({
      filePath: "/workspace/src/app.ts",
      size: 128,
      lastModified: new Date("2026-03-11T00:00:00.000Z"),
    });

    expect(selectedFile).toMatchObject({
      id: "uuid-workspace-test",
      path: "/workspace/src/app.ts",
      name: "app.ts",
      extension: ".ts",
      size: 128,
      mimeType: "text/typescript",
      lastModified: "2026-03-11T00:00:00.000Z",
    });
  });

  it("拡張子なしファイルは txt として扱う", () => {
    const selectedFile = createSelectedFile({
      filePath: "/workspace/Makefile",
      size: 40,
      lastModified: new Date("2026-03-11T00:00:00.000Z"),
    });

    expect(selectedFile.extension).toBe(".txt");
    expect(selectedFile.mimeType).toBe("text/plain");
  });
});
