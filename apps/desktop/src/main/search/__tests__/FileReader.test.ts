import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FileReader } from "../FileReader";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

describe("FileReader", () => {
  let reader: FileReader;
  let testDir: string;

  beforeEach(async () => {
    reader = new FileReader();
    testDir = path.join(tmpdir(), `fileReader-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("正常系: UTF-8 テキストファイル読み込み", () => {
    it("should read UTF-8 text file", async () => {
      const testFile = path.join(testDir, "test.txt");
      const content = "Hello World\nLine 2\nLine 3";
      await fs.writeFile(testFile, content, "utf-8");

      const result = await reader.readFile(testFile);

      expect(result).not.toBeNull();
      expect(result?.content).toBe(content);
      expect(result?.encoding).toBe("utf-8");
    });

    it("should read file with Japanese characters", async () => {
      const testFile = path.join(testDir, "japanese.txt");
      const content = "こんにちは世界\nテスト";
      await fs.writeFile(testFile, content, "utf-8");

      const result = await reader.readFile(testFile);

      expect(result).not.toBeNull();
      expect(result?.content).toBe(content);
    });
  });

  describe("正常系: 行単位ストリーム読み込み", () => {
    it("should read file line by line", async () => {
      const testFile = path.join(testDir, "lines.txt");
      const lines = ["Line 1", "Line 2", "Line 3"];
      await fs.writeFile(testFile, lines.join("\n"), "utf-8");

      const readLines: string[] = [];
      await reader.readLines(testFile, (line, lineNumber) => {
        readLines.push(line);
        expect(lineNumber).toBe(readLines.length - 1);
      });

      expect(readLines).toEqual(lines);
    });

    it("should handle empty lines", async () => {
      const testFile = path.join(testDir, "empty-lines.txt");
      const content = "Line 1\n\nLine 3\n\n\nLine 6";
      await fs.writeFile(testFile, content, "utf-8");

      const readLines: string[] = [];
      await reader.readLines(testFile, (line) => {
        readLines.push(line);
      });

      expect(readLines).toHaveLength(6);
      expect(readLines[1]).toBe("");
      expect(readLines[3]).toBe("");
      expect(readLines[4]).toBe("");
    });
  });

  describe("境界値: 空ファイル", () => {
    it("should read empty file", async () => {
      const testFile = path.join(testDir, "empty.txt");
      await fs.writeFile(testFile, "", "utf-8");

      const result = await reader.readFile(testFile);

      expect(result).not.toBeNull();
      expect(result?.content).toBe("");
    });

    it("should handle empty file in line reading", async () => {
      const testFile = path.join(testDir, "empty.txt");
      await fs.writeFile(testFile, "", "utf-8");

      const lineCount = await new Promise<number>((resolve) => {
        let count = 0;
        reader
          .readLines(testFile, () => {
            count++;
          })
          .then(() => resolve(count));
      });

      expect(lineCount).toBe(0);
    });
  });

  describe("境界値: 大きなファイル (10MB境界)", () => {
    it("should read file just under 10MB limit", async () => {
      const testFile = path.join(testDir, "large.txt");
      const size = 10 * 1024 * 1024 - 1024; // 10MB - 1KB
      const content = "a".repeat(size);
      await fs.writeFile(testFile, content, "utf-8");

      const result = await reader.readFile(testFile);

      expect(result).not.toBeNull();
      expect(result?.content.length).toBe(size);
    });

    it("should reject file over 10MB limit", async () => {
      const testFile = path.join(testDir, "too-large.txt");
      const size = 10 * 1024 * 1024 + 1024; // 10MB + 1KB
      const content = "a".repeat(size);
      await fs.writeFile(testFile, content, "utf-8");

      const result = await reader.readFile(testFile);

      expect(result).toBeNull();
    });
  });

  describe("境界値: 非常に長い行", () => {
    it("should handle very long line (10000 characters)", async () => {
      const testFile = path.join(testDir, "long-line.txt");
      const longLine = "a".repeat(10000);
      await fs.writeFile(testFile, longLine, "utf-8");

      const result = await reader.readFile(testFile);

      expect(result).not.toBeNull();
      expect(result?.content).toBe(longLine);
    });

    it("should read very long line in stream mode", async () => {
      const testFile = path.join(testDir, "long-line.txt");
      const longLine = "x".repeat(10000);
      await fs.writeFile(testFile, `${longLine}\nshort`, "utf-8");

      const lines: string[] = [];
      await reader.readLines(testFile, (line) => {
        lines.push(line);
      });

      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe(longLine);
      expect(lines[1]).toBe("short");
    });
  });

  describe("異常系: 存在しないファイル", () => {
    it("should return null for non-existent file", async () => {
      const result = await reader.readFile("/non/existent/file.txt");

      expect(result).toBeNull();
    });

    it("should handle error in line reading for non-existent file", async () => {
      await expect(async () => {
        await reader.readLines("/non/existent/file.txt", () => {});
      }).rejects.toThrow();
    });
  });

  describe("異常系: バイナリファイル", () => {
    it("should return null for binary file", async () => {
      const testFile = path.join(testDir, "binary.bin");
      // Create binary file with NULL bytes
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]);
      await fs.writeFile(testFile, buffer);

      const result = await reader.readFile(testFile);

      expect(result).toBeNull();
    });
  });

  describe("異常系: 読み取り権限なし", () => {
    it("should throw error for file without read permission", async () => {
      const testFile = path.join(testDir, "no-read.txt");
      await fs.writeFile(testFile, "test", "utf-8");
      await fs.chmod(testFile, 0o000); // Remove all permissions

      await expect(async () => {
        await reader.readFile(testFile);
      }).rejects.toThrow();

      // Cleanup: restore permissions
      await fs.chmod(testFile, 0o644);
    });
  });
});
