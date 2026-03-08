import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, unlinkSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { verifyScreenshot } from "../evidence-bundle-validator";

describe("evidence-bundle-screenshot", () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    for (const f of tempFiles) {
      try {
        unlinkSync(f);
      } catch {
        // ignore cleanup errors
      }
    }
    tempFiles.length = 0;
  });

  // T4-12: 存在する画像ファイルパスで検証成功になる
  it("T4-12: 存在する .png ファイルで exists: true を返す", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "evidence-screenshot-"));
    const filePath = join(tempDir, "test-screenshot.png");
    writeFileSync(filePath, "fake-png-content");
    tempFiles.push(filePath);

    const result = verifyScreenshot(filePath);

    expect(result.exists).toBe(true);
    expect(result.capturedAt).not.toBeNull();
  });

  // T4-13: 存在しない画像ファイルパスで検証失敗になる
  it("T4-13: 存在しないパスで exists: false を返す", () => {
    const result = verifyScreenshot("/nonexistent/path/screenshot.png");

    expect(result.exists).toBe(false);
    expect(result.capturedAt).toBeNull();
  });

  // T4-14: 取得日（ファイル更新日時）が取得できる
  it("T4-14: ファイルの mtime が ISO 8601 形式で capturedAt に記録される", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "evidence-screenshot-"));
    const filePath = join(tempDir, "dated-screenshot.png");
    writeFileSync(filePath, "fake-png-content");
    tempFiles.push(filePath);

    const result = verifyScreenshot(filePath);

    expect(result.exists).toBe(true);
    expect(result.capturedAt).toBeTruthy();

    // ISO 8601 形式の検証
    const parsed = new Date(result.capturedAt!);
    expect(parsed.getTime()).not.toBeNaN();
    expect(result.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
