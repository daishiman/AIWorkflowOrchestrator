import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TempFileManager } from "../TempFileManager";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

// Mock fs module
vi.mock("node:fs", async () => {
  const actual = await vi.importActual("node:fs");
  return {
    ...actual,
    promises: {
      mkdir: vi.fn(),
      writeFile: vi.fn(),
      unlink: vi.fn(),
      rm: vi.fn(),
      access: vi.fn(),
    },
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  };
});

describe("TempFileManager", () => {
  let manager: TempFileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new TempFileManager();
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should create temp directory if not exists", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue(undefined);

      await manager.initialize();

      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it("should not create temp directory if exists", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await manager.initialize();

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it("should set temp directory path under os temp dir", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await manager.initialize();

      const tempDir = manager.getTempDirectory();
      expect(tempDir).toContain(os.tmpdir());
    });
  });

  describe("saveContent", () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      await manager.initialize();
    });

    it("should save html content to temp file", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);

      expect(filePath).toContain(".html");
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it("should save markdown content to temp file", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "markdown" as const,
        originalContent: "# Heading",
        sanitizedContent: "# Heading",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);

      expect(filePath).toContain(".md");
      expect(fs.promises.writeFile).toHaveBeenCalled();
    });

    it("should use correct file permissions (0o600)", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      await manager.saveContent(content);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ mode: 0o600 }),
      );
    });

    it("should track saved files for cleanup", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      const trackedFiles = manager.getTrackedFiles();

      expect(trackedFiles).toContain(filePath);
    });

    it("should generate unique file names", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath1 = await manager.saveContent(content);
      const filePath2 = await manager.saveContent(content);

      expect(filePath1).not.toBe(filePath2);
    });

    it("should throw error on write failure", async () => {
      vi.mocked(fs.promises.writeFile).mockRejectedValue(
        new Error("Write failed"),
      );

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      await expect(manager.saveContent(content)).rejects.toThrow(
        "Write failed",
      );
    });
  });

  describe("cleanup", () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      await manager.initialize();
    });

    it("should delete all tracked files", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      await manager.saveContent(content);
      await manager.saveContent(content);

      await manager.cleanup();

      expect(fs.promises.unlink).toHaveBeenCalledTimes(2);
    });

    it("should clear tracked files after cleanup", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      await manager.saveContent(content);
      await manager.cleanup();

      const trackedFiles = manager.getTrackedFiles();
      expect(trackedFiles).toHaveLength(0);
    });

    it("should continue cleanup even if file deletion fails", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.promises.unlink)
        .mockRejectedValueOnce(new Error("Delete failed"))
        .mockResolvedValueOnce(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      await manager.saveContent(content);
      await manager.saveContent(content);

      // Should not throw
      await expect(manager.cleanup()).resolves.not.toThrow();
      expect(fs.promises.unlink).toHaveBeenCalledTimes(2);
    });

    it("should handle empty tracked files", async () => {
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      // Should not throw
      await expect(manager.cleanup()).resolves.not.toThrow();
      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });
  });

  describe("cleanupFile", () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      await manager.initialize();
    });

    it("should delete specific file", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      await manager.cleanupFile(filePath);

      expect(fs.promises.unlink).toHaveBeenCalledWith(filePath);
    });

    it("should remove file from tracked files", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      await manager.cleanupFile(filePath);

      const trackedFiles = manager.getTrackedFiles();
      expect(trackedFiles).not.toContain(filePath);
    });

    it("should not throw for non-tracked file", async () => {
      vi.mocked(fs.promises.unlink).mockResolvedValue(undefined);

      await expect(
        manager.cleanupFile("/non/existent/file.html"),
      ).resolves.not.toThrow();
    });

    it("should not throw on deletion failure", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.promises.unlink).mockRejectedValue(
        new Error("Delete failed"),
      );

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);

      await expect(manager.cleanupFile(filePath)).resolves.not.toThrow();
    });
  });

  describe("getFileExtension", () => {
    beforeEach(async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      await manager.initialize();
    });

    it("should return .html for html type", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      expect(path.extname(filePath)).toBe(".html");
    });

    it("should return .md for markdown type", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "markdown" as const,
        originalContent: "# Heading",
        sanitizedContent: "# Heading",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      expect(path.extname(filePath)).toBe(".md");
    });

    it("should return .css for css type", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "css" as const,
        originalContent: ".class { color: red; }",
        sanitizedContent: ".class { color: red; }",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      expect(path.extname(filePath)).toBe(".css");
    });

    it("should return .js for javascript type", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "javascript" as const,
        originalContent: "console.log('hello');",
        sanitizedContent: "console.log('hello');",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      expect(path.extname(filePath)).toBe(".js");
    });

    it("should return .txt for text type", async () => {
      vi.mocked(fs.promises.writeFile).mockResolvedValue(undefined);

      const content = {
        id: "1",
        type: "text" as const,
        originalContent: "Plain text",
        sanitizedContent: "Plain text",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      const filePath = await manager.saveContent(content);
      expect(path.extname(filePath)).toBe(".txt");
    });
  });
});
