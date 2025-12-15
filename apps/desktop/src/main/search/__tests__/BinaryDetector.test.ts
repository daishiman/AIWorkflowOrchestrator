import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { BinaryDetector } from "../BinaryDetector";
import * as fs from "fs/promises";
import * as path from "path";
import { tmpdir } from "os";

describe("BinaryDetector", () => {
  let detector: BinaryDetector;
  let testDir: string;

  beforeEach(async () => {
    detector = new BinaryDetector();
    testDir = path.join(tmpdir(), `binaryDetector-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe("正常系: テキストファイル検出", () => {
    it("should detect .ts file as text", async () => {
      const testFile = path.join(testDir, "test.ts");
      await fs.writeFile(testFile, "const x = 1;", "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect .md file as text", async () => {
      const testFile = path.join(testDir, "README.md");
      await fs.writeFile(testFile, "# Title\n\nContent", "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect .json file as text", async () => {
      const testFile = path.join(testDir, "data.json");
      await fs.writeFile(testFile, '{"key": "value"}', "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect .txt file as text", async () => {
      const testFile = path.join(testDir, "plain.txt");
      await fs.writeFile(testFile, "Plain text content", "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect .yaml file as text", async () => {
      const testFile = path.join(testDir, "config.yaml");
      await fs.writeFile(testFile, "key: value\narray:\n  - item", "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });
  });

  describe("正常系: バイナリファイル検出", () => {
    it("should detect .png file as binary", async () => {
      const testFile = path.join(testDir, "image.png");
      // PNG header signature
      const pngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      await fs.writeFile(testFile, pngHeader);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });

    it("should detect .exe file as binary", async () => {
      const testFile = path.join(testDir, "program.exe");
      // MZ header (DOS executable)
      const exeHeader = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
      await fs.writeFile(testFile, exeHeader);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });

    it("should detect .pdf file as binary", async () => {
      const testFile = path.join(testDir, "document.pdf");
      // PDF header
      const pdfHeader = Buffer.from("%PDF-1.4\n");
      await fs.writeFile(testFile, pdfHeader);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });

    it("should detect .zip file as binary", async () => {
      const testFile = path.join(testDir, "archive.zip");
      // ZIP header
      const zipHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      await fs.writeFile(testFile, zipHeader);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });
  });

  describe("正常系: NULLバイト検出", () => {
    it("should detect file with NULL byte as binary", async () => {
      const testFile = path.join(testDir, "null-byte.txt");
      const content = Buffer.from([
        0x48,
        0x65,
        0x6c,
        0x6c,
        0x6f, // "Hello"
        0x00, // NULL byte
        0x57,
        0x6f,
        0x72,
        0x6c,
        0x64, // "World"
      ]);
      await fs.writeFile(testFile, content);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });

    it("should detect multiple NULL bytes as binary", async () => {
      const testFile = path.join(testDir, "multi-null.bin");
      const content = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      await fs.writeFile(testFile, content);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });
  });

  describe("境界値: 空ファイル", () => {
    it("should treat empty file as text", async () => {
      const testFile = path.join(testDir, "empty.txt");
      await fs.writeFile(testFile, "");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });
  });

  describe("境界値: 拡張子なし", () => {
    it("should check content when no extension", async () => {
      const testFile = path.join(testDir, "no-extension");
      await fs.writeFile(testFile, "Text content", "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect binary content without extension", async () => {
      const testFile = path.join(testDir, "binary-no-ext");
      const binaryContent = Buffer.from([0x00, 0x01, 0xff, 0xfe]);
      await fs.writeFile(testFile, binaryContent);

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(true);
    });
  });

  describe("境界値: 特殊なテキスト形式", () => {
    it("should detect XML as text", async () => {
      const testFile = path.join(testDir, "data.xml");
      await fs.writeFile(testFile, '<?xml version="1.0"?><root/>', "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect CSS as text", async () => {
      const testFile = path.join(testDir, "style.css");
      await fs.writeFile(testFile, "body { margin: 0; }", "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });

    it("should detect SVG as text", async () => {
      const testFile = path.join(testDir, "icon.svg");
      await fs.writeFile(testFile, '<svg><circle r="5"/></svg>', "utf-8");

      const isBinary = await detector.isBinary(testFile);

      expect(isBinary).toBe(false);
    });
  });

  describe("異常系: 存在しないファイル", () => {
    it("should throw error for non-existent file", async () => {
      await expect(async () => {
        await detector.isBinary("/non/existent/file.txt");
      }).rejects.toThrow();
    });
  });
});
