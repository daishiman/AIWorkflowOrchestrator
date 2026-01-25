import { describe, it, expect, beforeEach, vi } from "vitest";

// jsdomのESM互換性問題を回避するためにモック化（ContentSanitizerが依存）
vi.mock("jsdom", () => ({
  JSDOM: vi.fn().mockImplementation(() => ({
    window: {
      document: {
        createElement: vi.fn(),
        createDocumentFragment: vi.fn(),
      },
    },
  })),
}));

// DOMPurifyをモック化（ContentSanitizerが依存）
vi.mock("dompurify", () => {
  const mockPurify = vi.fn((html: string) => html);
  mockPurify.sanitize = mockPurify;
  return {
    default: vi.fn(() => mockPurify),
  };
});

import { EnvironmentService } from "../EnvironmentService";
import { ContentExtractor } from "../ContentExtractor";
import { ContentSanitizer } from "../ContentSanitizer";
import { TempFileManager } from "../TempFileManager";

// Mock dependencies
vi.mock("../ContentExtractor");
vi.mock("../ContentSanitizer");
vi.mock("../TempFileManager");

describe("EnvironmentService", () => {
  let service: EnvironmentService;
  let mockExtractor: ContentExtractor;
  let mockSanitizer: ContentSanitizer;
  let mockTempFileManager: TempFileManager;

  beforeEach(() => {
    vi.clearAllMocks();

    mockExtractor = new ContentExtractor();
    mockSanitizer = new ContentSanitizer();
    mockTempFileManager = new TempFileManager();

    vi.mocked(ContentExtractor).mockImplementation(() => mockExtractor);
    vi.mocked(ContentSanitizer).mockImplementation(() => mockSanitizer);
    vi.mocked(TempFileManager).mockImplementation(() => mockTempFileManager);

    service = new EnvironmentService();
  });

  describe("initialize", () => {
    it("should initialize TempFileManager", async () => {
      vi.mocked(mockTempFileManager.initialize).mockResolvedValue(undefined);

      await service.initialize();

      expect(mockTempFileManager.initialize).toHaveBeenCalled();
    });

    it("should handle initialization errors gracefully", async () => {
      vi.mocked(mockTempFileManager.initialize).mockRejectedValue(
        new Error("Init failed"),
      );

      await expect(service.initialize()).rejects.toThrow("Init failed");
    });
  });

  describe("extractAndSanitize", () => {
    const executionId = "test-execution-id";

    beforeEach(async () => {
      vi.mocked(mockTempFileManager.initialize).mockResolvedValue(undefined);
      await service.initialize();
    });

    it("should extract code blocks from text", async () => {
      const text = "```html\n<div>Hello</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>Hello</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[0],
      );
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      const result = await service.extractAndSanitize(text, executionId);

      expect(mockExtractor.extractCodeBlocks).toHaveBeenCalledWith(text);
      expect(result.executionId).toBe(executionId);
    });

    it("should sanitize each extracted content", async () => {
      const text =
        "```html\n<div>First</div>\n```\n```html\n<div>Second</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>First</div>",
          order: 0,
          extractedAt: new Date(),
        },
        {
          id: "2",
          type: "html" as const,
          content: "<div>Second</div>",
          order: 1,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockImplementation((content) => ({
        id: content.id,
        type: content.type,
        originalContent: content.content,
        sanitizedContent: content.content,
        removedElements: [],
        sanitizedAt: new Date(),
      }));
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[1],
      );
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      await service.extractAndSanitize(text, executionId);

      expect(mockSanitizer.sanitize).toHaveBeenCalledTimes(2);
    });

    it("should save previewable content to temp file", async () => {
      const text = "```html\n<div>Hello</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>Hello</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];
      const sanitizedContent = {
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      };

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue(sanitizedContent);
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[0],
      );
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      const result = await service.extractAndSanitize(text, executionId);

      expect(mockTempFileManager.saveContent).toHaveBeenCalledWith(
        sanitizedContent,
      );
      expect(result.tempFilePath).toBe("/tmp/test.html");
    });

    it("should return empty contents for empty text", async () => {
      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue([]);
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(null);

      const result = await service.extractAndSanitize("", executionId);

      expect(result.contents).toHaveLength(0);
      expect(result.tempFilePath).toBeUndefined();
    });

    it("should return empty contents for text without code blocks", async () => {
      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue([]);
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(null);

      const result = await service.extractAndSanitize(
        "No code blocks here",
        executionId,
      );

      expect(result.contents).toHaveLength(0);
    });

    it("should cache preview content", async () => {
      const text = "```html\n<div>Hello</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>Hello</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[0],
      );
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      await service.extractAndSanitize(text, executionId);
      const cached = service.getPreviewContent(executionId);

      expect(cached).not.toBeNull();
      expect(cached?.executionId).toBe(executionId);
    });

    it("should handle temp file save failure gracefully", async () => {
      const text = "```html\n<div>Hello</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>Hello</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[0],
      );
      vi.mocked(mockTempFileManager.saveContent).mockRejectedValue(
        new Error("Save failed"),
      );

      const result = await service.extractAndSanitize(text, executionId);

      // Should return result without tempFilePath
      expect(result.contents).toHaveLength(1);
      expect(result.tempFilePath).toBeUndefined();
    });

    it("should set createdAt timestamp", async () => {
      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue([]);
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(null);

      const before = new Date();
      const result = await service.extractAndSanitize("", executionId);
      const after = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should skip non-previewable content for temp file", async () => {
      const text = "```css\n.class { color: red; }\n```";
      const extractedContent = [
        {
          id: "1",
          type: "css" as const,
          content: ".class { color: red; }",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "css" as const,
        originalContent: ".class { color: red; }",
        sanitizedContent: ".class { color: red; }",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(null);

      const result = await service.extractAndSanitize(text, executionId);

      expect(mockTempFileManager.saveContent).not.toHaveBeenCalled();
      expect(result.tempFilePath).toBeUndefined();
    });
  });

  describe("getPreviewContent", () => {
    beforeEach(async () => {
      vi.mocked(mockTempFileManager.initialize).mockResolvedValue(undefined);
      await service.initialize();
    });

    it("should return cached content for existing executionId", async () => {
      const executionId = "test-execution-id";
      const text = "```html\n<div>Hello</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>Hello</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[0],
      );
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      await service.extractAndSanitize(text, executionId);
      const result = service.getPreviewContent(executionId);

      expect(result).not.toBeNull();
      expect(result?.executionId).toBe(executionId);
    });

    it("should return null for non-existing executionId", () => {
      const result = service.getPreviewContent("non-existing-id");

      expect(result).toBeNull();
    });

    it("should return null for empty executionId", () => {
      const result = service.getPreviewContent("");

      expect(result).toBeNull();
    });
  });

  describe("cleanupTempFiles", () => {
    beforeEach(async () => {
      vi.mocked(mockTempFileManager.initialize).mockResolvedValue(undefined);
      await service.initialize();
    });

    it("should call TempFileManager cleanup", async () => {
      vi.mocked(mockTempFileManager.cleanup).mockResolvedValue(undefined);

      await service.cleanupTempFiles();

      expect(mockTempFileManager.cleanup).toHaveBeenCalled();
    });

    it("should clear preview cache", async () => {
      const executionId = "test-execution-id";
      const text = "```html\n<div>Hello</div>\n```";
      const extractedContent = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>Hello</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue(
        extractedContent,
      );
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "html" as const,
        originalContent: "<div>Hello</div>",
        sanitizedContent: "<div>Hello</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue(
        extractedContent[0],
      );
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );
      vi.mocked(mockTempFileManager.cleanup).mockResolvedValue(undefined);

      await service.extractAndSanitize(text, executionId);
      await service.cleanupTempFiles();

      const cached = service.getPreviewContent(executionId);
      expect(cached).toBeNull();
    });

    it("should handle cleanup errors gracefully", async () => {
      vi.mocked(mockTempFileManager.cleanup).mockRejectedValue(
        new Error("Cleanup failed"),
      );

      // Should not throw
      await expect(service.cleanupTempFiles()).resolves.not.toThrow();
    });
  });

  describe("integration scenarios", () => {
    beforeEach(async () => {
      vi.mocked(mockTempFileManager.initialize).mockResolvedValue(undefined);
      await service.initialize();
    });

    it("should handle multiple extractions with different executionIds", async () => {
      const text1 = "```html\n<div>First</div>\n```";
      const text2 = "```html\n<div>Second</div>\n```";
      const executionId1 = "execution-1";
      const executionId2 = "execution-2";

      vi.mocked(mockExtractor.extractCodeBlocks).mockReturnValue([
        {
          id: "1",
          type: "html" as const,
          content: "<div>Content</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ]);
      vi.mocked(mockSanitizer.sanitize).mockReturnValue({
        id: "1",
        type: "html" as const,
        originalContent: "<div>Content</div>",
        sanitizedContent: "<div>Content</div>",
        removedElements: [],
        sanitizedAt: new Date(),
      });
      vi.mocked(mockExtractor.getPreviewableContent).mockReturnValue({
        id: "1",
        type: "html" as const,
        content: "<div>Content</div>",
        order: 0,
        extractedAt: new Date(),
      });
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      await service.extractAndSanitize(text1, executionId1);
      await service.extractAndSanitize(text2, executionId2);

      const cached1 = service.getPreviewContent(executionId1);
      const cached2 = service.getPreviewContent(executionId2);

      expect(cached1?.executionId).toBe(executionId1);
      expect(cached2?.executionId).toBe(executionId2);
    });

    it("should overwrite cache for same executionId", async () => {
      const executionId = "same-execution-id";
      const text1 = "```html\n<div>First</div>\n```";
      const text2 = "```html\n<div>Second</div>\n```";

      const extractedContent1 = [
        {
          id: "1",
          type: "html" as const,
          content: "<div>First</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];
      const extractedContent2 = [
        {
          id: "2",
          type: "html" as const,
          content: "<div>Second</div>",
          order: 0,
          extractedAt: new Date(),
        },
      ];

      vi.mocked(mockExtractor.extractCodeBlocks)
        .mockReturnValueOnce(extractedContent1)
        .mockReturnValueOnce(extractedContent2);
      vi.mocked(mockSanitizer.sanitize)
        .mockReturnValueOnce({
          id: "1",
          type: "html" as const,
          originalContent: "<div>First</div>",
          sanitizedContent: "<div>First</div>",
          removedElements: [],
          sanitizedAt: new Date(),
        })
        .mockReturnValueOnce({
          id: "2",
          type: "html" as const,
          originalContent: "<div>Second</div>",
          sanitizedContent: "<div>Second</div>",
          removedElements: [],
          sanitizedAt: new Date(),
        });
      vi.mocked(mockExtractor.getPreviewableContent)
        .mockReturnValueOnce(extractedContent1[0])
        .mockReturnValueOnce(extractedContent2[0]);
      vi.mocked(mockTempFileManager.saveContent).mockResolvedValue(
        "/tmp/test.html",
      );

      await service.extractAndSanitize(text1, executionId);
      await service.extractAndSanitize(text2, executionId);

      const cached = service.getPreviewContent(executionId);
      expect(cached?.contents[0].id).toBe("2");
    });
  });
});
