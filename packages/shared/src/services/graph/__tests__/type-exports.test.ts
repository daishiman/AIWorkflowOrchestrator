/**
 * @file 型エクスポートテスト
 * @description services/graph/index.ts からの型エクスポートを検証
 */
import { describe, it, expect } from "vitest";

describe("services/graph type exports", () => {
  describe("Module export", () => {
    it("should export module from index", async () => {
      const module = await import("../index");
      expect(module).toBeDefined();
    });
  });

  describe("Community detection exports", () => {
    it("should export CommunityErrorCode enum", async () => {
      const { CommunityErrorCode } = await import("../index");
      expect(CommunityErrorCode).toBeDefined();
      expect(CommunityErrorCode.GRAPH_LOAD_FAILED).toBe("GRAPH_LOAD_FAILED");
      expect(CommunityErrorCode.DETECTION_FAILED).toBe("DETECTION_FAILED");
      expect(CommunityErrorCode.SAVE_FAILED).toBe("SAVE_FAILED");
      expect(CommunityErrorCode.NOT_FOUND).toBe("NOT_FOUND");
      expect(CommunityErrorCode.INVALID_PARAMETER).toBe("INVALID_PARAMETER");
    });

    it("should export CommunityDetectionError class", async () => {
      const { CommunityDetectionError, CommunityErrorCode } =
        await import("../index");
      expect(CommunityDetectionError).toBeDefined();

      const error = new CommunityDetectionError(
        "Test error message",
        CommunityErrorCode.NOT_FOUND,
      );
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("CommunityDetectionError");
      expect(error.message).toBe("Test error message");
      expect(error.code).toBe(CommunityErrorCode.NOT_FOUND);
    });

    it("should export CommunityDetectionError with cause", async () => {
      const { CommunityDetectionError, CommunityErrorCode } =
        await import("../index");

      const cause = new Error("Original error");
      const error = new CommunityDetectionError(
        "Wrapped error",
        CommunityErrorCode.DETECTION_FAILED,
        cause,
      );
      expect(error.cause).toBe(cause);
    });
  });

  describe("Community summarization exports", () => {
    it("should export CommunitySummarizationErrorCode enum", async () => {
      const { CommunitySummarizationErrorCode } = await import("../index");
      expect(CommunitySummarizationErrorCode).toBeDefined();
      expect(CommunitySummarizationErrorCode.LLM_GENERATION_FAILED).toBe(
        "LLM_GENERATION_FAILED",
      );
      expect(CommunitySummarizationErrorCode.JSON_PARSE_FAILED).toBe(
        "JSON_PARSE_FAILED",
      );
      expect(CommunitySummarizationErrorCode.EMBEDDING_FAILED).toBe(
        "EMBEDDING_FAILED",
      );
      expect(CommunitySummarizationErrorCode.COMMUNITY_NOT_FOUND).toBe(
        "COMMUNITY_NOT_FOUND",
      );
      expect(CommunitySummarizationErrorCode.GRAPH_DATA_LOAD_FAILED).toBe(
        "GRAPH_DATA_LOAD_FAILED",
      );
      expect(CommunitySummarizationErrorCode.DB_SAVE_FAILED).toBe(
        "DB_SAVE_FAILED",
      );
    });

    it("should export CommunitySummarizationError class", async () => {
      const { CommunitySummarizationError, CommunitySummarizationErrorCode } =
        await import("../index");
      expect(CommunitySummarizationError).toBeDefined();

      const error = new CommunitySummarizationError(
        "Summarization failed",
        CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
      );
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("CommunitySummarizationError");
      expect(error.message).toBe("Summarization failed");
      expect(error.code).toBe(
        CommunitySummarizationErrorCode.LLM_GENERATION_FAILED,
      );
    });
  });

  describe("Utility function exports", () => {
    it("should export normalizeEntityName function", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName).toBeDefined();
      expect(typeof normalizeEntityName).toBe("function");
    });

    it("should normalize entity names correctly", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName("TypeScript 5.x")).toBe("typescript 5x");
      expect(normalizeEntityName("React.js")).toBe("reactjs");
      expect(normalizeEntityName("  Test  Name  ")).toBe("test name");
      expect(normalizeEntityName("UPPERCASE")).toBe("uppercase");
    });
  });

  describe("Edge cases", () => {
    describe("CommunityErrorCode enum values", () => {
      it("should have all expected error codes", async () => {
        const { CommunityErrorCode } = await import("../index");
        const keys = Object.keys(CommunityErrorCode);
        expect(keys).toContain("GRAPH_LOAD_FAILED");
        expect(keys).toContain("DETECTION_FAILED");
        expect(keys).toContain("SAVE_FAILED");
        expect(keys).toContain("NOT_FOUND");
        expect(keys).toContain("INVALID_PARAMETER");
        expect(keys.length).toBe(5);
      });
    });

    describe("CommunitySummarizationErrorCode enum values", () => {
      it("should have all expected error codes", async () => {
        const { CommunitySummarizationErrorCode } = await import("../index");
        const keys = Object.keys(CommunitySummarizationErrorCode);
        expect(keys).toContain("LLM_GENERATION_FAILED");
        expect(keys).toContain("JSON_PARSE_FAILED");
        expect(keys).toContain("EMBEDDING_FAILED");
        expect(keys).toContain("COMMUNITY_NOT_FOUND");
        expect(keys).toContain("GRAPH_DATA_LOAD_FAILED");
        expect(keys).toContain("DB_SAVE_FAILED");
        expect(keys.length).toBe(6);
      });
    });

    describe("normalizeEntityName edge cases", () => {
      it("should handle empty string", async () => {
        const { normalizeEntityName } = await import("../index");
        expect(normalizeEntityName("")).toBe("");
      });

      it("should handle string with only spaces", async () => {
        const { normalizeEntityName } = await import("../index");
        expect(normalizeEntityName("   ")).toBe("");
      });

      it("should handle unicode characters (removes non-ASCII)", async () => {
        const { normalizeEntityName } = await import("../index");
        // Non-ASCII characters are removed by the regex /[^\w\s]/g
        expect(normalizeEntityName("日本語テスト")).toBe("");
        expect(normalizeEntityName("Hello日本語World")).toBe("helloworld");
      });

      it("should handle numbers in name", async () => {
        const { normalizeEntityName } = await import("../index");
        expect(normalizeEntityName("Test123")).toBe("test123");
      });

      it("should handle mixed special characters", async () => {
        const { normalizeEntityName } = await import("../index");
        expect(normalizeEntityName("Hello@World!")).toBe("helloworld");
      });
    });

    describe("CommunitySummarizationError with cause", () => {
      it("should preserve cause error", async () => {
        const { CommunitySummarizationError, CommunitySummarizationErrorCode } =
          await import("../index");

        const cause = new Error("Original error");
        const error = new CommunitySummarizationError(
          "Wrapped error",
          CommunitySummarizationErrorCode.EMBEDDING_FAILED,
          cause,
        );
        expect(error.cause).toBe(cause);
        expect(error.code).toBe(
          CommunitySummarizationErrorCode.EMBEDDING_FAILED,
        );
      });
    });
  });
});
