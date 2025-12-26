/**
 * FixedChunkingStrategyのテスト
 *
 * @description 固定サイズチャンキング戦略のユニットテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FixedChunkingStrategy } from "../strategies/fixed-chunking-strategy";
import { MockTokenizer } from "./mocks";
import type { FixedChunkingOptions, Chunk } from "../types";

describe("FixedChunkingStrategy", () => {
  let strategy: FixedChunkingStrategy;
  let tokenizer: MockTokenizer;

  beforeEach(() => {
    tokenizer = new MockTokenizer();
    strategy = new FixedChunkingStrategy(tokenizer);
  });

  // ===========================================================================
  // 正常系
  // ===========================================================================

  describe("正常系", () => {
    it("should split text into exact chunk sizes", async () => {
      // Arrange
      const text = "A".repeat(500); // 500文字 = 500トークン
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(5);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBe(100);
        expect(chunk.content).toHaveLength(100);
      });
    });

    it("should split with overlap", async () => {
      // Arrange
      const text = "A".repeat(500);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapSize: 20,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      // 100トークン、20トークンオーバーラップ → 実質80トークンずつ進む
      // 500 / 80 = 6.25 → 7チャンク（最後は短い）
      expect(chunks.length).toBeGreaterThan(5);

      // オーバーラップのメタデータを確認
      if (chunks.length > 1) {
        expect(chunks[1].metadata.overlap?.previous).toBe(20);
      }
    });

    it("should handle remainder chunks", async () => {
      // Arrange
      const text = "A".repeat(550);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(6);

      // 最後のチャンクは50トークン
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.tokenCount).toBe(50);
      expect(lastChunk.content).toHaveLength(50);
    });

    it("should use overlap percentage", async () => {
      // Arrange
      const text = "A".repeat(500);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapPercentage: 20, // 20%オーバーラップ = 20トークン
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks.length).toBeGreaterThan(5);

      if (chunks.length > 1) {
        expect(chunks[1].metadata.overlap?.previous).toBe(20);
      }
    });

    it("should respect minChunkSize", async () => {
      // Arrange
      const text = "A".repeat(205); // 205トークン
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        minChunkSize: 50,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      // 100, 100, 5 → 最後の5トークンはminChunkSize(50)未満なので前のチャンクにマージ
      expect(chunks).toHaveLength(2);
      expect(chunks[0].tokenCount).toBe(100);
      expect(chunks[1].tokenCount).toBe(105);
    });

    it("should set correct position metadata", async () => {
      // Arrange
      const text = "ABCDEFGHIJ".repeat(50); // 500文字
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks[0].position.start).toBe(0);
      expect(chunks[0].position.end).toBe(100);

      expect(chunks[1].position.start).toBe(100);
      expect(chunks[1].position.end).toBe(200);
    });

    it("should generate unique chunk IDs", async () => {
      // Arrange
      const text = "A".repeat(300);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      const ids = chunks.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(chunks.length);
    });

    it("should include strategy name in metadata", async () => {
      // Arrange
      const text = "A".repeat(100);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks[0].metadata.strategy).toBe("fixed");
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================

  describe("境界値テスト", () => {
    it("should handle minimum chunk size", async () => {
      // Arrange
      const text = "A".repeat(10);
      const options: FixedChunkingOptions = {
        chunkSize: 10,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(1);
      expect(chunks[0].tokenCount).toBe(10);
    });

    it("should handle text smaller than chunk size", async () => {
      // Arrange
      const text = "A".repeat(50);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(1);
      expect(chunks[0].tokenCount).toBe(50);
      expect(chunks[0].content).toHaveLength(50);
    });

    it("should handle empty string", async () => {
      // Arrange
      const text = "";
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(0);
    });

    it("should handle single character", async () => {
      // Arrange
      const text = "A";
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(1);
      expect(chunks[0].tokenCount).toBe(1);
    });

    it("should handle exact multiple of chunk size", async () => {
      // Arrange
      const text = "A".repeat(300); // ちょうど3チャンク
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(3);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBe(100);
      });
    });

    it("should handle maximum overlap (chunk size - 1)", async () => {
      // Arrange
      const text = "A".repeat(200);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapSize: 99,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks.length).toBeGreaterThan(1);

      // オーバーラップが99トークン
      if (chunks.length > 1) {
        expect(chunks[1].metadata.overlap?.previous).toBe(99);
      }
    });
  });

  // ===========================================================================
  // 異常系
  // ===========================================================================

  describe("異常系", () => {
    it("should throw error for zero chunk size", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 0,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /chunkSize must be/i,
      );
    });

    it("should throw error for negative chunk size", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: -10,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /chunkSize must be positive/i,
      );
    });

    it("should throw error for overlap larger than chunk size", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapSize: 150,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /overlapSize must be/i,
      );
    });

    it("should throw error for negative overlap", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapSize: -10,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /overlapSize must be/i,
      );
    });

    it("should throw error for invalid overlap percentage", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapPercentage: 150, // 150%は無効
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /overlapPercentage must be/i,
      );
    });

    it("should throw error for negative overlap percentage", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapPercentage: -10,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /overlapPercentage must be/i,
      );
    });

    it("should throw error for negative minChunkSize", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        minChunkSize: -10,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /minChunkSize must be/i,
      );
    });

    it("should throw error for minChunkSize larger than chunkSize", () => {
      // Arrange
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        minChunkSize: 150,
      };

      // Act & Assert
      expect(() => strategy.validateOptions(options)).toThrow(
        /minChunkSize must be/i,
      );
    });
  });

  // ===========================================================================
  // getDefaultOptions()
  // ===========================================================================

  describe("getDefaultOptions()", () => {
    it("should return default options", () => {
      // Act
      const defaults = strategy.getDefaultOptions();

      // Assert
      expect(defaults.chunkSize).toBeGreaterThan(0);
      expect(defaults.overlapSize).toBeUndefined();
      expect(defaults.overlapPercentage).toBeUndefined();
    });

    it("should return valid options", () => {
      // Act
      const defaults = strategy.getDefaultOptions();

      // Assert
      expect(() => strategy.validateOptions(defaults)).not.toThrow();
    });
  });

  // ===========================================================================
  // name プロパティ
  // ===========================================================================

  describe("name property", () => {
    it("should return 'fixed'", () => {
      // Assert
      expect(strategy.name).toBe("fixed");
    });
  });

  // ===========================================================================
  // エッジケース
  // ===========================================================================

  describe("エッジケース", () => {
    it("should handle very large text", async () => {
      // Arrange
      const text = "A".repeat(100000); // 100,000文字
      const options: FixedChunkingOptions = {
        chunkSize: 1000,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(100);
      chunks.slice(0, -1).forEach((chunk) => {
        expect(chunk.tokenCount).toBe(1000);
      });
    });

    it("should handle multi-byte characters", async () => {
      // Arrange
      const text = "あ".repeat(100); // 日本語文字
      const options: FixedChunkingOptions = {
        chunkSize: 50,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(2);
      // MockTokenizerは1文字=1トークンなので、マルチバイトでも正しく動作
      chunks.slice(0, -1).forEach((chunk) => {
        expect(chunk.tokenCount).toBe(50);
      });
    });

    it("should handle whitespace-only text", async () => {
      // Arrange
      const text = " ".repeat(100);
      const options: FixedChunkingOptions = {
        chunkSize: 50,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks).toHaveLength(2);
    });

    it("should handle mixed content", async () => {
      // Arrange
      const text = "ABC 123 あいう\n\t!@# ".repeat(20); // 混在コンテンツ
      const options: FixedChunkingOptions = {
        chunkSize: 100,
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach((chunk) => {
        expect(chunk.content).toBeTruthy();
        expect(chunk.tokenCount).toBeGreaterThan(0);
      });
    });

    it("should handle both overlapSize and overlapPercentage (overlapSize takes precedence)", async () => {
      // Arrange
      const text = "A".repeat(500);
      const options: FixedChunkingOptions = {
        chunkSize: 100,
        overlapSize: 10, // これが優先される
        overlapPercentage: 50, // これは無視される
      };

      // Act
      const chunks = await strategy.chunk(text, options);

      // Assert
      if (chunks.length > 1) {
        // overlapSizeが優先されるため、オーバーラップは10トークン
        expect(chunks[1].metadata.overlap?.previous).toBe(10);
      }
    });
  });
});
