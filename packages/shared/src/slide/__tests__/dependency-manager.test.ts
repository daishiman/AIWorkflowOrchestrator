/**
 * 依存関係管理のユニットテスト
 * @module slide/__tests__/dependency-manager.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import {
  calculateHash,
  checkDependency,
  fileExists,
  bothFilesExist,
} from "../dependency-manager";

// fsモジュールをモック
vi.mock("fs/promises");

const mockedFs = vi.mocked(fs);

describe("dependency-manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("calculateHash", () => {
    it("should calculate MD5 hash for file content", async () => {
      mockedFs.readFile.mockResolvedValue("test content");

      const hash = await calculateHash("/path/to/file.md");

      // MD5 of "test content" is 9473fdd0d880a43c21b7778d34872157
      expect(hash).toBe("9473fdd0d880a43c21b7778d34872157");
      expect(mockedFs.readFile).toHaveBeenCalledWith(
        "/path/to/file.md",
        "utf-8",
      );
    });

    it("should return different hashes for different content", async () => {
      mockedFs.readFile
        .mockResolvedValueOnce("content1")
        .mockResolvedValueOnce("content2");

      const hash1 = await calculateHash("/path/to/file1.md");
      const hash2 = await calculateHash("/path/to/file2.md");

      expect(hash1).not.toBe(hash2);
    });

    it("should throw error when file cannot be read", async () => {
      mockedFs.readFile.mockRejectedValue(new Error("ENOENT"));

      await expect(calculateHash("/nonexistent/file.md")).rejects.toThrow(
        "ENOENT",
      );
    });

    it("should handle empty file", async () => {
      mockedFs.readFile.mockResolvedValue("");

      const hash = await calculateHash("/path/to/empty.md");

      expect(hash).toBe("d41d8cd98f00b204e9800998ecf8427e"); // MD5 of empty string
    });

    it("should handle unicode content", async () => {
      mockedFs.readFile.mockResolvedValue("日本語テキスト");

      const hash = await calculateHash("/path/to/unicode.md");

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(32); // MD5 hash length
    });
  });

  describe("checkDependency", () => {
    it("should return true when structure.md is older than index.html", async () => {
      const structureMtime = new Date("2026-01-01T00:00:00Z");
      const htmlMtime = new Date("2026-01-02T00:00:00Z");

      mockedFs.stat.mockImplementation((path) => {
        if (String(path).includes("structure.md")) {
          return Promise.resolve({ mtime: structureMtime } as fs.Stats);
        }
        return Promise.resolve({ mtime: htmlMtime } as fs.Stats);
      });

      const result = await checkDependency(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(true);
    });

    it("should return false when structure.md is newer than index.html", async () => {
      const structureMtime = new Date("2026-01-02T00:00:00Z");
      const htmlMtime = new Date("2026-01-01T00:00:00Z");

      mockedFs.stat.mockImplementation((path) => {
        if (String(path).includes("structure.md")) {
          return Promise.resolve({ mtime: structureMtime } as fs.Stats);
        }
        return Promise.resolve({ mtime: htmlMtime } as fs.Stats);
      });

      const result = await checkDependency(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(false);
    });

    it("should return true when both files have same mtime", async () => {
      const sameMtime = new Date("2026-01-01T00:00:00Z");

      mockedFs.stat.mockResolvedValue({ mtime: sameMtime } as fs.Stats);

      const result = await checkDependency(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(true);
    });

    it("should return false when structure.md does not exist", async () => {
      mockedFs.stat.mockImplementation((path) => {
        if (String(path).includes("structure.md")) {
          return Promise.reject(new Error("ENOENT"));
        }
        return Promise.resolve({ mtime: new Date() } as fs.Stats);
      });

      const result = await checkDependency(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(false);
    });

    it("should return false when index.html does not exist", async () => {
      mockedFs.stat.mockImplementation((path) => {
        if (String(path).includes("index.html")) {
          return Promise.reject(new Error("ENOENT"));
        }
        return Promise.resolve({ mtime: new Date() } as fs.Stats);
      });

      const result = await checkDependency(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(false);
    });
  });

  describe("fileExists", () => {
    it("should return true when file exists", async () => {
      mockedFs.access.mockResolvedValue(undefined);

      const result = await fileExists("/path/to/existing.md");

      expect(result).toBe(true);
    });

    it("should return false when file does not exist", async () => {
      mockedFs.access.mockRejectedValue(new Error("ENOENT"));

      const result = await fileExists("/path/to/nonexistent.md");

      expect(result).toBe(false);
    });
  });

  describe("bothFilesExist", () => {
    it("should return true when both files exist", async () => {
      mockedFs.access.mockResolvedValue(undefined);

      const result = await bothFilesExist(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(true);
    });

    it("should return false when structure.md does not exist", async () => {
      mockedFs.access.mockImplementation((path) => {
        if (String(path).includes("structure.md")) {
          return Promise.reject(new Error("ENOENT"));
        }
        return Promise.resolve(undefined);
      });

      const result = await bothFilesExist(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(false);
    });

    it("should return false when index.html does not exist", async () => {
      mockedFs.access.mockImplementation((path) => {
        if (String(path).includes("index.html")) {
          return Promise.reject(new Error("ENOENT"));
        }
        return Promise.resolve(undefined);
      });

      const result = await bothFilesExist(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(false);
    });

    it("should return false when neither file exists", async () => {
      mockedFs.access.mockRejectedValue(new Error("ENOENT"));

      const result = await bothFilesExist(
        "/project/structure.md",
        "/project/index.html",
      );

      expect(result).toBe(false);
    });
  });
});
