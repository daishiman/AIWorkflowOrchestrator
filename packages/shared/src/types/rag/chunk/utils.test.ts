/**
 * @file utils.test.ts
 * @description ユーティリティ関数のテスト - TDD Red Phase
 *
 * テスト対象:
 * - ベクトル演算関数（5関数）: normalizeVector, vectorMagnitude, cosineSimilarity, euclideanDistance, dotProduct
 * - Base64変換関数（2関数）: vectorToBase64, base64ToVector
 * - トークン推定関数（1関数）: estimateTokenCount
 * - デフォルト設定（2定数）: defaultChunkingConfig, defaultEmbeddingModelConfigs
 *
 * テスト設計:
 * - 浮動小数点演算の誤差を考慮（toBeCloseTo使用）
 * - 境界値分析に基づくテストケース
 * - エラーケースの網羅
 */

import { describe, it, expect } from "vitest";

// テスト対象のインポート（まだ存在しない - TDD Red）
import {
  // ベクトル演算関数
  normalizeVector,
  vectorMagnitude,
  cosineSimilarity,
  euclideanDistance,
  dotProduct,

  // Base64変換関数
  vectorToBase64,
  base64ToVector,

  // トークン推定関数
  estimateTokenCount,

  // デフォルト設定
  defaultChunkingConfig,
  defaultEmbeddingModelConfigs,
} from "./utils";

// 型定義のインポート（検証用）
import type { ChunkingConfig, EmbeddingModelConfig } from "./types";

// =============================================================================
// テストヘルパー
// =============================================================================

/**
 * 浮動小数点比較の許容誤差（5桁の精度）
 */
const FLOAT_PRECISION = 5;

/**
 * テスト用のベクトルファクトリ
 */
const createVector = (values: number[]): Float32Array =>
  new Float32Array(values);

/**
 * ゼロベクトルを作成
 */
const createZeroVector = (length: number): Float32Array =>
  new Float32Array(length);

/**
 * 単位ベクトルを作成（既に正規化済み）
 */
const createUnitVector = (length: number, index: number): Float32Array => {
  const vector = createZeroVector(length);
  if (index >= 0 && index < length) {
    vector[index] = 1.0;
  }
  return vector;
};

// =============================================================================
// 1. normalizeVector - L2正規化テスト
// =============================================================================

describe("normalizeVector", () => {
  describe("正常系", () => {
    it("should normalize a 2D vector correctly", () => {
      // 3-4-5の直角三角形: [3, 4] → [0.6, 0.8]
      const vector = createVector([3, 4]);
      const result = normalizeVector(vector);

      expect(result[0]).toBeCloseTo(0.6, FLOAT_PRECISION);
      expect(result[1]).toBeCloseTo(0.8, FLOAT_PRECISION);
    });

    it("should normalize a 3D vector correctly", () => {
      // [1, 2, 2] → magnitude = 3 → [1/3, 2/3, 2/3]
      const vector = createVector([1, 2, 2]);
      const result = normalizeVector(vector);

      expect(result[0]).toBeCloseTo(1 / 3, FLOAT_PRECISION);
      expect(result[1]).toBeCloseTo(2 / 3, FLOAT_PRECISION);
      expect(result[2]).toBeCloseTo(2 / 3, FLOAT_PRECISION);
    });

    it("should return a new Float32Array (immutable)", () => {
      const vector = createVector([3, 4]);
      const result = normalizeVector(vector);

      expect(result).not.toBe(vector);
      expect(result).toBeInstanceOf(Float32Array);
    });

    it("should produce a vector with magnitude 1", () => {
      const vector = createVector([3, 4, 5, 6, 7]);
      const result = normalizeVector(vector);
      const magnitude = vectorMagnitude(result);

      expect(magnitude).toBeCloseTo(1.0, FLOAT_PRECISION);
    });
  });

  describe("エッジケース - ゼロベクトル", () => {
    it("should throw error for zero vector", () => {
      const zeroVector = createZeroVector(3);

      expect(() => normalizeVector(zeroVector)).toThrowError();
    });

    it("should throw error with appropriate message for zero vector", () => {
      const zeroVector = createZeroVector(3);

      expect(() => normalizeVector(zeroVector)).toThrowError(
        /zero vector|ゼロベクトル/i,
      );
    });
  });

  describe("エッジケース - 極小値", () => {
    it("should throw error for near-zero vector (magnitude < EPSILON)", () => {
      // Number.EPSILONより小さい値のベクトル
      const nearZeroVector = createVector([Number.EPSILON / 2, 0, 0]);

      expect(() => normalizeVector(nearZeroVector)).toThrowError();
    });
  });

  describe("境界値テスト - 既に正規化済み", () => {
    it("should return same values for already normalized vector", () => {
      const normalizedVector = createVector([0.6, 0.8]); // 既に単位ベクトル
      const result = normalizeVector(normalizedVector);

      expect(result[0]).toBeCloseTo(0.6, FLOAT_PRECISION);
      expect(result[1]).toBeCloseTo(0.8, FLOAT_PRECISION);
    });

    it("should return same values for unit vector", () => {
      const unitVector = createUnitVector(3, 0); // [1, 0, 0]
      const result = normalizeVector(unitVector);

      expect(result[0]).toBeCloseTo(1.0, FLOAT_PRECISION);
      expect(result[1]).toBeCloseTo(0.0, FLOAT_PRECISION);
      expect(result[2]).toBeCloseTo(0.0, FLOAT_PRECISION);
    });
  });

  describe("境界値テスト - 1次元ベクトル", () => {
    it("should normalize 1D positive vector to 1", () => {
      const vector = createVector([5]);
      const result = normalizeVector(vector);

      expect(result[0]).toBeCloseTo(1.0, FLOAT_PRECISION);
    });

    it("should normalize 1D negative vector to -1", () => {
      const vector = createVector([-5]);
      const result = normalizeVector(vector);

      expect(result[0]).toBeCloseTo(-1.0, FLOAT_PRECISION);
    });
  });

  describe("境界値テスト - 負の値", () => {
    it("should handle negative values correctly", () => {
      const vector = createVector([-3, -4]);
      const result = normalizeVector(vector);

      expect(result[0]).toBeCloseTo(-0.6, FLOAT_PRECISION);
      expect(result[1]).toBeCloseTo(-0.8, FLOAT_PRECISION);
    });

    it("should handle mixed positive and negative values", () => {
      const vector = createVector([3, -4]);
      const result = normalizeVector(vector);

      expect(result[0]).toBeCloseTo(0.6, FLOAT_PRECISION);
      expect(result[1]).toBeCloseTo(-0.8, FLOAT_PRECISION);
    });
  });
});

// =============================================================================
// 2. vectorMagnitude - ベクトルの大きさ計算テスト
// =============================================================================

describe("vectorMagnitude", () => {
  describe("正常系", () => {
    it("should calculate magnitude of 2D vector (3-4-5 triangle)", () => {
      const vector = createVector([3, 4]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(5.0, FLOAT_PRECISION);
    });

    it("should calculate magnitude of 3D vector", () => {
      // sqrt(1² + 2² + 2²) = sqrt(9) = 3
      const vector = createVector([1, 2, 2]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(3.0, FLOAT_PRECISION);
    });

    it("should calculate magnitude of high-dimensional vector", () => {
      // [1, 1, 1, ..., 1] (100次元) → sqrt(100) = 10
      const vector = new Float32Array(100).fill(1);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(10.0, FLOAT_PRECISION);
    });
  });

  describe("エッジケース - ゼロベクトル", () => {
    it("should return 0 for zero vector", () => {
      const zeroVector = createZeroVector(3);
      const result = vectorMagnitude(zeroVector);

      expect(result).toBe(0);
    });

    it("should return 0 for empty vector", () => {
      const emptyVector = createVector([]);
      const result = vectorMagnitude(emptyVector);

      expect(result).toBe(0);
    });
  });

  describe("境界値テスト - 単位ベクトル", () => {
    it("should return 1 for unit vector", () => {
      const unitVector = createUnitVector(3, 0);
      const result = vectorMagnitude(unitVector);

      expect(result).toBeCloseTo(1.0, FLOAT_PRECISION);
    });

    it("should return 1 for any standard basis vector", () => {
      for (let i = 0; i < 5; i++) {
        const unitVector = createUnitVector(5, i);
        const result = vectorMagnitude(unitVector);

        expect(result).toBeCloseTo(1.0, FLOAT_PRECISION);
      }
    });
  });

  describe("境界値テスト - 1次元ベクトル", () => {
    it("should return absolute value for 1D vector", () => {
      const vector = createVector([5]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(5.0, FLOAT_PRECISION);
    });

    it("should return absolute value for negative 1D vector", () => {
      const vector = createVector([-5]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(5.0, FLOAT_PRECISION);
    });
  });

  describe("境界値テスト - 大きな値と小さな値", () => {
    it("should handle very large values", () => {
      const vector = createVector([1e6, 0, 0]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(1e6, FLOAT_PRECISION - 3);
    });

    it("should handle very small values", () => {
      const vector = createVector([1e-6, 0, 0]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(1e-6, FLOAT_PRECISION);
    });
  });

  describe("負の値", () => {
    it("should calculate correct magnitude with negative values", () => {
      const vector = createVector([-3, 4]);
      const result = vectorMagnitude(vector);

      expect(result).toBeCloseTo(5.0, FLOAT_PRECISION);
    });
  });
});

// =============================================================================
// 3. cosineSimilarity - コサイン類似度計算テスト
// =============================================================================

describe("cosineSimilarity", () => {
  describe("正常系", () => {
    it("should return 1 for identical vectors", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2, 3]);
      const result = cosineSimilarity(a, b);

      expect(result).toBeCloseTo(1.0, FLOAT_PRECISION);
    });

    it("should return 1 for parallel vectors (same direction)", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([2, 4, 6]); // a * 2
      const result = cosineSimilarity(a, b);

      expect(result).toBeCloseTo(1.0, FLOAT_PRECISION);
    });

    it("should return -1 for opposite direction vectors", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([-1, -2, -3]); // -a
      const result = cosineSimilarity(a, b);

      expect(result).toBeCloseTo(-1.0, FLOAT_PRECISION);
    });

    it("should return 0 for orthogonal vectors", () => {
      const a = createVector([1, 0, 0]);
      const b = createVector([0, 1, 0]);
      const result = cosineSimilarity(a, b);

      expect(result).toBeCloseTo(0.0, FLOAT_PRECISION);
    });

    it("should be symmetric (a, b) = (b, a)", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);
      const sim1 = cosineSimilarity(a, b);
      const sim2 = cosineSimilarity(b, a);

      expect(sim1).toBeCloseTo(sim2, FLOAT_PRECISION);
    });
  });

  describe("エッジケース - ゼロベクトル", () => {
    it("should throw error when first vector is zero", () => {
      const a = createZeroVector(3);
      const b = createVector([1, 2, 3]);

      expect(() => cosineSimilarity(a, b)).toThrowError();
    });

    it("should throw error when second vector is zero", () => {
      const a = createVector([1, 2, 3]);
      const b = createZeroVector(3);

      expect(() => cosineSimilarity(a, b)).toThrowError();
    });

    it("should throw error with appropriate message for zero vector", () => {
      const a = createZeroVector(3);
      const b = createVector([1, 2, 3]);

      expect(() => cosineSimilarity(a, b)).toThrowError(
        /zero vector|ゼロベクトル/i,
      );
    });
  });

  describe("エッジケース - 次元不一致", () => {
    it("should throw error when dimensions do not match", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2]);

      expect(() => cosineSimilarity(a, b)).toThrowError();
    });

    it("should throw error with appropriate message for dimension mismatch", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2]);

      expect(() => cosineSimilarity(a, b)).toThrowError(/dimension|次元/i);
    });
  });

  describe("境界値テスト - 結果範囲", () => {
    it("should always return value between -1 and 1", () => {
      const a = createVector([1, 2, 3, 4, 5]);
      const b = createVector([5, 4, 3, 2, 1]);
      const result = cosineSimilarity(a, b);

      expect(result).toBeGreaterThanOrEqual(-1);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("should handle normalized vectors efficiently (dotProduct = similarity)", () => {
      const a = normalizeVector(createVector([1, 2, 3]));
      const b = normalizeVector(createVector([4, 5, 6]));
      const similarity = cosineSimilarity(a, b);
      const dot = dotProduct(a, b);

      expect(similarity).toBeCloseTo(dot, FLOAT_PRECISION);
    });
  });

  describe("高次元ベクトル", () => {
    it("should handle high-dimensional vectors", () => {
      const a = new Float32Array(1000).fill(1);
      const b = new Float32Array(1000);
      for (let i = 0; i < 1000; i++) {
        b[i] = i % 2 === 0 ? 1 : -1;
      }
      const result = cosineSimilarity(a, b);

      // 結果は-1から1の範囲
      expect(result).toBeGreaterThanOrEqual(-1);
      expect(result).toBeLessThanOrEqual(1);
    });
  });
});

// =============================================================================
// 4. euclideanDistance - ユークリッド距離計算テスト
// =============================================================================

describe("euclideanDistance", () => {
  describe("正常系", () => {
    it("should return 0 for identical vectors", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2, 3]);
      const result = euclideanDistance(a, b);

      expect(result).toBeCloseTo(0.0, FLOAT_PRECISION);
    });

    it("should calculate correct distance for 2D vectors", () => {
      // 3-4-5三角形: sqrt((4-1)² + (5-1)²) = sqrt(9 + 16) = 5
      const a = createVector([1, 1]);
      const b = createVector([4, 5]);
      const result = euclideanDistance(a, b);

      expect(result).toBeCloseTo(5.0, FLOAT_PRECISION);
    });

    it("should calculate correct distance for 3D vectors", () => {
      // sqrt((4-1)² + (5-2)² + (6-3)²) = sqrt(9 + 9 + 9) = sqrt(27) ≈ 5.196
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);
      const result = euclideanDistance(a, b);

      expect(result).toBeCloseTo(Math.sqrt(27), FLOAT_PRECISION);
    });

    it("should be symmetric (a, b) = (b, a)", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);
      const dist1 = euclideanDistance(a, b);
      const dist2 = euclideanDistance(b, a);

      expect(dist1).toBeCloseTo(dist2, FLOAT_PRECISION);
    });
  });

  describe("エッジケース - 次元不一致", () => {
    it("should throw error when dimensions do not match", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2]);

      expect(() => euclideanDistance(a, b)).toThrowError();
    });

    it("should throw error with appropriate message for dimension mismatch", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2]);

      expect(() => euclideanDistance(a, b)).toThrowError(/dimension|次元/i);
    });
  });

  describe("境界値テスト - ゼロベクトル", () => {
    it("should return magnitude when one vector is zero", () => {
      const a = createVector([3, 4]);
      const b = createZeroVector(2);
      const result = euclideanDistance(a, b);

      expect(result).toBeCloseTo(5.0, FLOAT_PRECISION);
    });

    it("should return 0 when both vectors are zero", () => {
      const a = createZeroVector(3);
      const b = createZeroVector(3);
      const result = euclideanDistance(a, b);

      expect(result).toBe(0);
    });
  });

  describe("境界値テスト - 1次元ベクトル", () => {
    it("should return absolute difference for 1D vectors", () => {
      const a = createVector([5]);
      const b = createVector([2]);
      const result = euclideanDistance(a, b);

      expect(result).toBeCloseTo(3.0, FLOAT_PRECISION);
    });
  });

  describe("境界値テスト - 単位ベクトル", () => {
    it("should calculate correct distance between unit vectors", () => {
      const a = createUnitVector(3, 0); // [1, 0, 0]
      const b = createUnitVector(3, 1); // [0, 1, 0]
      const result = euclideanDistance(a, b);

      // sqrt((1-0)² + (0-1)² + (0-0)²) = sqrt(2) ≈ 1.414
      expect(result).toBeCloseTo(Math.sqrt(2), FLOAT_PRECISION);
    });
  });

  describe("非負性", () => {
    it("should always return non-negative value", () => {
      const a = createVector([-1, -2, -3]);
      const b = createVector([4, 5, 6]);
      const result = euclideanDistance(a, b);

      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});

// =============================================================================
// 5. dotProduct - 内積計算テスト
// =============================================================================

describe("dotProduct", () => {
  describe("正常系", () => {
    it("should calculate correct dot product for simple vectors", () => {
      // 1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);
      const result = dotProduct(a, b);

      expect(result).toBeCloseTo(32, FLOAT_PRECISION);
    });

    it("should be symmetric (a · b) = (b · a)", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);
      const dot1 = dotProduct(a, b);
      const dot2 = dotProduct(b, a);

      expect(dot1).toBeCloseTo(dot2, FLOAT_PRECISION);
    });

    it("should return magnitude squared when dotting with itself", () => {
      const a = createVector([3, 4]);
      const result = dotProduct(a, a);
      const magnitudeSquared = 3 * 3 + 4 * 4; // 25

      expect(result).toBeCloseTo(magnitudeSquared, FLOAT_PRECISION);
    });
  });

  describe("エッジケース - 直交ベクトル", () => {
    it("should return 0 for orthogonal vectors", () => {
      const a = createVector([1, 0, 0]);
      const b = createVector([0, 1, 0]);
      const result = dotProduct(a, b);

      expect(result).toBeCloseTo(0.0, FLOAT_PRECISION);
    });

    it("should return 0 for any pair of orthogonal basis vectors", () => {
      const e1 = createUnitVector(3, 0);
      const e2 = createUnitVector(3, 1);
      const e3 = createUnitVector(3, 2);

      expect(dotProduct(e1, e2)).toBeCloseTo(0.0, FLOAT_PRECISION);
      expect(dotProduct(e1, e3)).toBeCloseTo(0.0, FLOAT_PRECISION);
      expect(dotProduct(e2, e3)).toBeCloseTo(0.0, FLOAT_PRECISION);
    });
  });

  describe("エッジケース - ゼロベクトル", () => {
    it("should return 0 when one vector is zero", () => {
      const a = createVector([1, 2, 3]);
      const b = createZeroVector(3);
      const result = dotProduct(a, b);

      expect(result).toBe(0);
    });

    it("should return 0 when both vectors are zero", () => {
      const a = createZeroVector(3);
      const b = createZeroVector(3);
      const result = dotProduct(a, b);

      expect(result).toBe(0);
    });
  });

  describe("エッジケース - 次元不一致", () => {
    it("should throw error when dimensions do not match", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2]);

      expect(() => dotProduct(a, b)).toThrowError();
    });

    it("should throw error with appropriate message for dimension mismatch", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([1, 2]);

      expect(() => dotProduct(a, b)).toThrowError(/dimension|次元/i);
    });
  });

  describe("正規化済みベクトル", () => {
    it("should equal cosine similarity for normalized vectors", () => {
      const a = normalizeVector(createVector([1, 2, 3]));
      const b = normalizeVector(createVector([4, 5, 6]));
      const dot = dotProduct(a, b);
      const sim = cosineSimilarity(a, b);

      expect(dot).toBeCloseTo(sim, FLOAT_PRECISION);
    });

    it("should return 1 for same unit vector dotted with itself", () => {
      const unitVector = createUnitVector(5, 2);
      const result = dotProduct(unitVector, unitVector);

      expect(result).toBeCloseTo(1.0, FLOAT_PRECISION);
    });
  });

  describe("負の値", () => {
    it("should handle negative values correctly", () => {
      // 1×(-4) + 2×(-5) + 3×(-6) = -4 - 10 - 18 = -32
      const a = createVector([1, 2, 3]);
      const b = createVector([-4, -5, -6]);
      const result = dotProduct(a, b);

      expect(result).toBeCloseTo(-32, FLOAT_PRECISION);
    });

    it("should return negative value for opposite direction vectors", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([-1, -2, -3]);
      const result = dotProduct(a, b);

      // -(1² + 2² + 3²) = -14
      expect(result).toBeCloseTo(-14, FLOAT_PRECISION);
    });
  });
});

// =============================================================================
// 6. vectorToBase64 - Float32Array → Base64文字列変換テスト
// =============================================================================

describe("vectorToBase64", () => {
  describe("正常系", () => {
    it("should convert simple vector to Base64", () => {
      const vector = createVector([0.5, 0.3, 0.2]);
      const result = vectorToBase64(vector);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should produce valid Base64 string", () => {
      const vector = createVector([1, 2, 3, 4, 5]);
      const result = vectorToBase64(vector);

      // Base64文字のみを含む
      expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it("should produce consistent output for same input", () => {
      const vector = createVector([1.5, 2.5, 3.5]);
      const result1 = vectorToBase64(vector);
      const result2 = vectorToBase64(vector);

      expect(result1).toBe(result2);
    });
  });

  describe("エッジケース - 空ベクトル", () => {
    it("should handle empty vector", () => {
      const emptyVector = createVector([]);
      const result = vectorToBase64(emptyVector);

      expect(typeof result).toBe("string");
      expect(result).toBe("");
    });
  });

  describe("エッジケース - 大きなベクトル", () => {
    it("should handle large vector (1536 dimensions)", () => {
      const largeVector = new Float32Array(1536);
      for (let i = 0; i < 1536; i++) {
        largeVector[i] = Math.random();
      }
      const result = vectorToBase64(largeVector);

      // Base64は元のバイト数 * 4/3（パディング含む）
      // 1536 * 4 bytes = 6144 bytes → ~8192 chars
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe("データサイズ検証", () => {
    it("should produce Base64 of correct length", () => {
      const vector = createVector([1, 2, 3, 4]); // 4要素 × 4bytes = 16bytes
      const result = vectorToBase64(vector);

      // Base64: ceil(16 / 3) * 4 = 24 chars
      // または (16 * 4 / 3) rounded up to multiple of 4
      expect(result.length).toBe(24);
    });
  });

  describe("特殊な値", () => {
    it("should handle zero values", () => {
      const vector = createZeroVector(5);
      const result = vectorToBase64(vector);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle negative values", () => {
      const vector = createVector([-1, -2, -3]);
      const result = vectorToBase64(vector);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// 7. base64ToVector - Base64文字列 → Float32Array変換テスト
// =============================================================================

describe("base64ToVector", () => {
  describe("正常系", () => {
    it("should convert Base64 back to Float32Array", () => {
      const original = createVector([0.5, 0.3, 0.2]);
      const base64 = vectorToBase64(original);
      const restored = base64ToVector(base64);

      expect(restored).toBeInstanceOf(Float32Array);
      expect(restored.length).toBe(original.length);
    });

    it("should restore original values (round-trip)", () => {
      const original = createVector([1.5, 2.5, 3.5, 4.5]);
      const base64 = vectorToBase64(original);
      const restored = base64ToVector(base64);

      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i], FLOAT_PRECISION);
      }
    });
  });

  describe("往復変換テスト", () => {
    it("should preserve values for typical embedding vector", () => {
      // OpenAI embedding風のベクトル
      const original = new Float32Array(384);
      for (let i = 0; i < 384; i++) {
        original[i] = (Math.random() - 0.5) * 2; // -1 to 1
      }

      const base64 = vectorToBase64(original);
      const restored = base64ToVector(base64);

      expect(restored.length).toBe(original.length);
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i], FLOAT_PRECISION);
      }
    });

    it("should preserve negative values", () => {
      const original = createVector([-0.5, -0.3, -0.2, 0.1]);
      const base64 = vectorToBase64(original);
      const restored = base64ToVector(base64);

      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i], FLOAT_PRECISION);
      }
    });

    it("should preserve zero values", () => {
      const original = createVector([0, 1, 0, 2, 0]);
      const base64 = vectorToBase64(original);
      const restored = base64ToVector(base64);

      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i], FLOAT_PRECISION);
      }
    });
  });

  describe("エッジケース - 空文字列", () => {
    it("should return empty Float32Array for empty string", () => {
      const result = base64ToVector("");

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(0);
    });
  });

  describe("エッジケース - 不正なBase64", () => {
    it("should throw error for invalid Base64 characters", () => {
      const invalidBase64 = "!!!invalid!!!";

      expect(() => base64ToVector(invalidBase64)).toThrowError();
    });

    it("should throw error when byte length is not divisible by 4", () => {
      // 3バイト（Float32は4バイト必要）
      const invalidBuffer = Buffer.from([1, 2, 3]).toString("base64");

      expect(() => base64ToVector(invalidBuffer)).toThrowError(/4|Float32/i);
    });
  });

  describe("大きなベクトル", () => {
    it("should handle 1536-dimensional vector (OpenAI embedding)", () => {
      const original = new Float32Array(1536);
      for (let i = 0; i < 1536; i++) {
        original[i] = (i / 1536) * 2 - 1; // -1 to 1
      }

      const base64 = vectorToBase64(original);
      const restored = base64ToVector(base64);

      expect(restored.length).toBe(1536);
      for (let i = 0; i < 1536; i++) {
        expect(restored[i]).toBeCloseTo(original[i], FLOAT_PRECISION);
      }
    });
  });
});

// =============================================================================
// 8. estimateTokenCount - トークン数推定テスト
// =============================================================================

describe("estimateTokenCount", () => {
  describe("正常系 - 英語テキスト", () => {
    it("should estimate tokens for English text (ASCII)", () => {
      const text = "Hello, world!"; // 13文字
      const result = estimateTokenCount(text);

      // 13 / 4 = 3.25 → ceil → 4
      expect(result).toBe(4);
    });

    it("should estimate tokens for longer English text", () => {
      const text = "The quick brown fox jumps over the lazy dog."; // 44文字
      const result = estimateTokenCount(text);

      // 44 / 4 = 11
      expect(result).toBe(11);
    });

    it("should count spaces and punctuation", () => {
      const text = "Hello, World! How are you?"; // 26文字（スペース含む）
      const result = estimateTokenCount(text);

      // 26 / 4 = 6.5 → ceil → 7
      expect(result).toBe(7);
    });
  });

  describe("正常系 - 日本語テキスト", () => {
    it("should estimate tokens for Japanese text (non-ASCII)", () => {
      const text = "こんにちは"; // 5文字
      const result = estimateTokenCount(text);

      // 5 / 1.5 = 3.33 → ceil → 4
      expect(result).toBe(4);
    });

    it("should estimate tokens for longer Japanese text", () => {
      const text = "今日は良い天気ですね"; // 10文字
      const result = estimateTokenCount(text);

      // 10 / 1.5 = 6.67 → ceil → 7
      expect(result).toBe(7);
    });

    it("should handle Japanese with punctuation", () => {
      const text = "こんにちは！元気ですか？"; // 12文字（句読点含む）
      const result = estimateTokenCount(text);

      // 日本語句読点も非ASCII: 12 / 1.5 = 8
      expect(result).toBe(8);
    });
  });

  describe("正常系 - 混合テキスト", () => {
    it("should estimate tokens for mixed English and Japanese", () => {
      const text = "Hello世界"; // 5 ASCII + 2 non-ASCII
      const result = estimateTokenCount(text);

      // 5/4 + 2/1.5 = 1.25 + 1.33 = 2.58 → ceil → 3
      expect(result).toBe(3);
    });

    it("should handle complex mixed text", () => {
      const text = "AIは人工知能です。AI is Artificial Intelligence.";
      // ASCII: "AI is Artificial Intelligence." = 32文字
      // 非ASCII: "は人工知能です。" = 8文字
      const result = estimateTokenCount(text);

      // 32/4 + 8/1.5 = 8 + 5.33 = 13.33 → ceil → 14
      expect(result).toBe(14);
    });
  });

  describe("エッジケース - 空文字列", () => {
    it("should return 0 for empty string", () => {
      const result = estimateTokenCount("");

      expect(result).toBe(0);
    });
  });

  describe("エッジケース - 記号のみ", () => {
    it("should handle ASCII symbols", () => {
      const text = "!@#$%^&*()"; // 10 ASCII文字
      const result = estimateTokenCount(text);

      // 10 / 4 = 2.5 → ceil → 3
      expect(result).toBe(3);
    });

    it("should handle Japanese symbols", () => {
      const text = "「」『』【】"; // 6 非ASCII文字
      const result = estimateTokenCount(text);

      // 6 / 1.5 = 4
      expect(result).toBe(4);
    });
  });

  describe("エッジケース - 絵文字", () => {
    it("should treat emoji as non-ASCII", () => {
      const text = "Hello 🌍🌎🌏"; // 6 ASCII + 3 emoji（サロゲートペアで6文字）
      const result = estimateTokenCount(text);

      // 絵文字はサロゲートペアなのでtext.length的には複数文字
      // 結果は非負の整数
      expect(result).toBeGreaterThan(0);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe("エッジケース - 数字", () => {
    it("should count digits as ASCII", () => {
      const text = "12345678"; // 8 ASCII文字
      const result = estimateTokenCount(text);

      // 8 / 4 = 2
      expect(result).toBe(2);
    });
  });

  describe("境界値テスト", () => {
    it("should handle single character (ASCII)", () => {
      const result = estimateTokenCount("a");

      // 1 / 4 = 0.25 → ceil → 1
      expect(result).toBe(1);
    });

    it("should handle single character (Japanese)", () => {
      const result = estimateTokenCount("あ");

      // 1 / 1.5 = 0.67 → ceil → 1
      expect(result).toBe(1);
    });

    it("should handle very long text", () => {
      const text = "a".repeat(10000);
      const result = estimateTokenCount(text);

      // 10000 / 4 = 2500
      expect(result).toBe(2500);
    });
  });

  describe("整数結果の検証", () => {
    it("should always return an integer", () => {
      const texts = ["Hello", "こんにちは", "Hello世界", "a", "あ", ""];

      for (const text of texts) {
        const result = estimateTokenCount(text);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it("should always return non-negative value", () => {
      const texts = ["Hello", "こんにちは", "Hello世界", "", " "];

      for (const text of texts) {
        const result = estimateTokenCount(text);
        expect(result).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

// =============================================================================
// 9. defaultChunkingConfig - デフォルトチャンキング設定テスト
// =============================================================================

describe("defaultChunkingConfig", () => {
  describe("設定値の検証", () => {
    it("should have RECURSIVE strategy", () => {
      expect(defaultChunkingConfig.strategy).toBe("recursive");
    });

    it("should have targetSize of 512", () => {
      expect(defaultChunkingConfig.targetSize).toBe(512);
    });

    it("should have minSize of 100", () => {
      expect(defaultChunkingConfig.minSize).toBe(100);
    });

    it("should have maxSize of 1024", () => {
      expect(defaultChunkingConfig.maxSize).toBe(1024);
    });

    it("should have overlapSize of 50", () => {
      expect(defaultChunkingConfig.overlapSize).toBe(50);
    });

    it("should have respectBoundaries as true", () => {
      expect(defaultChunkingConfig.respectBoundaries).toBe(true);
    });

    it("should have preserveFormatting as false", () => {
      expect(defaultChunkingConfig.preserveFormatting).toBe(false);
    });
  });

  describe("制約条件の検証", () => {
    it("should satisfy minSize <= targetSize", () => {
      expect(defaultChunkingConfig.minSize).toBeLessThanOrEqual(
        defaultChunkingConfig.targetSize,
      );
    });

    it("should satisfy targetSize <= maxSize", () => {
      expect(defaultChunkingConfig.targetSize).toBeLessThanOrEqual(
        defaultChunkingConfig.maxSize,
      );
    });

    it("should satisfy overlapSize < targetSize", () => {
      expect(defaultChunkingConfig.overlapSize).toBeLessThan(
        defaultChunkingConfig.targetSize,
      );
    });
  });

  describe("型の検証", () => {
    it("should be a valid ChunkingConfig type", () => {
      const config: ChunkingConfig = defaultChunkingConfig;
      expect(config).toBeDefined();
    });
  });
});

// =============================================================================
// 10. defaultEmbeddingModelConfigs - デフォルト埋め込みモデル設定テスト
// =============================================================================

describe("defaultEmbeddingModelConfigs", () => {
  describe("OpenAI設定", () => {
    it("should have OpenAI configuration", () => {
      expect(defaultEmbeddingModelConfigs.openai).toBeDefined();
    });

    it("should have correct OpenAI model name", () => {
      expect(defaultEmbeddingModelConfigs.openai.modelName).toBe(
        "text-embedding-3-small",
      );
    });

    it("should have correct OpenAI dimensions", () => {
      expect(defaultEmbeddingModelConfigs.openai.dimensions).toBe(1536);
    });

    it("should have valid OpenAI batchSize (1-100)", () => {
      const batchSize = defaultEmbeddingModelConfigs.openai.batchSize;
      expect(batchSize).toBeGreaterThanOrEqual(1);
      expect(batchSize).toBeLessThanOrEqual(100);
    });

    it("should have valid OpenAI maxTokens (1-8192)", () => {
      const maxTokens = defaultEmbeddingModelConfigs.openai.maxTokens;
      expect(maxTokens).toBeGreaterThanOrEqual(1);
      expect(maxTokens).toBeLessThanOrEqual(8192);
    });
  });

  describe("Cohere設定", () => {
    it("should have Cohere configuration", () => {
      expect(defaultEmbeddingModelConfigs.cohere).toBeDefined();
    });

    it("should have correct Cohere model name", () => {
      expect(defaultEmbeddingModelConfigs.cohere.modelName).toBe(
        "embed-english-v3.0",
      );
    });

    it("should have valid Cohere dimensions", () => {
      const dimensions = defaultEmbeddingModelConfigs.cohere.dimensions;
      expect(dimensions).toBeGreaterThanOrEqual(64);
      expect(dimensions).toBeLessThanOrEqual(4096);
    });
  });

  describe("Voyage設定", () => {
    it("should have Voyage configuration", () => {
      expect(defaultEmbeddingModelConfigs.voyage).toBeDefined();
    });

    it("should have correct Voyage model name", () => {
      expect(defaultEmbeddingModelConfigs.voyage.modelName).toBe("voyage-2");
    });

    it("should have valid Voyage dimensions", () => {
      const dimensions = defaultEmbeddingModelConfigs.voyage.dimensions;
      expect(dimensions).toBeGreaterThanOrEqual(64);
      expect(dimensions).toBeLessThanOrEqual(4096);
    });
  });

  describe("Local設定", () => {
    it("should have Local configuration", () => {
      expect(defaultEmbeddingModelConfigs.local).toBeDefined();
    });

    it("should have correct Local model name", () => {
      expect(defaultEmbeddingModelConfigs.local.modelName).toBe(
        "all-MiniLM-L6-v2",
      );
    });

    it("should have valid Local dimensions", () => {
      const dimensions = defaultEmbeddingModelConfigs.local.dimensions;
      expect(dimensions).toBeGreaterThanOrEqual(64);
      expect(dimensions).toBeLessThanOrEqual(4096);
    });
  });

  describe("すべてのプロバイダーの共通検証", () => {
    it("should have all required providers", () => {
      expect(defaultEmbeddingModelConfigs.openai).toBeDefined();
      expect(defaultEmbeddingModelConfigs.cohere).toBeDefined();
      expect(defaultEmbeddingModelConfigs.voyage).toBeDefined();
      expect(defaultEmbeddingModelConfigs.local).toBeDefined();
    });

    it("should have valid dimensions range for all providers", () => {
      const configs = [
        defaultEmbeddingModelConfigs.openai,
        defaultEmbeddingModelConfigs.cohere,
        defaultEmbeddingModelConfigs.voyage,
        defaultEmbeddingModelConfigs.local,
      ];

      for (const config of configs) {
        expect(config.dimensions).toBeGreaterThanOrEqual(64);
        expect(config.dimensions).toBeLessThanOrEqual(4096);
      }
    });

    it("should have valid batchSize range for all providers", () => {
      const configs = [
        defaultEmbeddingModelConfigs.openai,
        defaultEmbeddingModelConfigs.cohere,
        defaultEmbeddingModelConfigs.voyage,
        defaultEmbeddingModelConfigs.local,
      ];

      for (const config of configs) {
        expect(config.batchSize).toBeGreaterThanOrEqual(1);
        expect(config.batchSize).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("型の検証", () => {
    it("should be valid EmbeddingModelConfig type for each provider", () => {
      const openaiConfig: EmbeddingModelConfig =
        defaultEmbeddingModelConfigs.openai;
      const cohereConfig: EmbeddingModelConfig =
        defaultEmbeddingModelConfigs.cohere;
      const voyageConfig: EmbeddingModelConfig =
        defaultEmbeddingModelConfigs.voyage;
      const localConfig: EmbeddingModelConfig =
        defaultEmbeddingModelConfigs.local;

      expect(openaiConfig).toBeDefined();
      expect(cohereConfig).toBeDefined();
      expect(voyageConfig).toBeDefined();
      expect(localConfig).toBeDefined();
    });
  });
});

// =============================================================================
// 11. 数学的性質の検証（プロパティベーステスト風）
// =============================================================================

describe("数学的性質の検証", () => {
  describe("normalizeVector の性質", () => {
    it("normalized vector should have magnitude 1", () => {
      const vectors = [
        createVector([3, 4]),
        createVector([1, 2, 3]),
        createVector([1, 1, 1, 1, 1]),
        createVector([-1, -2, -3]),
      ];

      for (const vector of vectors) {
        const normalized = normalizeVector(vector);
        const magnitude = vectorMagnitude(normalized);
        expect(magnitude).toBeCloseTo(1.0, FLOAT_PRECISION);
      }
    });

    it("direction should be preserved after normalization", () => {
      const vector = createVector([3, 4]);
      const normalized = normalizeVector(vector);

      // 方向が同じなら比率が一定
      const ratio0 = vector[0] / normalized[0];
      const ratio1 = vector[1] / normalized[1];
      expect(ratio0).toBeCloseTo(ratio1, FLOAT_PRECISION);
    });
  });

  describe("cosineSimilarity の性質", () => {
    it("should be symmetric: cos(a, b) = cos(b, a)", () => {
      const testCases = [
        [createVector([1, 2, 3]), createVector([4, 5, 6])],
        [createVector([1, 0, 0]), createVector([0, 1, 0])],
        [createVector([-1, -2]), createVector([3, 4])],
      ];

      for (const [a, b] of testCases) {
        const sim1 = cosineSimilarity(a, b);
        const sim2 = cosineSimilarity(b, a);
        expect(sim1).toBeCloseTo(sim2, FLOAT_PRECISION);
      }
    });

    it("should return 1 for cos(a, a)", () => {
      const vectors = [
        createVector([1, 2, 3]),
        createVector([0.5, 0.5, 0.5]),
        createVector([-1, -2, -3]),
      ];

      for (const vector of vectors) {
        const sim = cosineSimilarity(vector, vector);
        expect(sim).toBeCloseTo(1.0, FLOAT_PRECISION);
      }
    });
  });

  describe("euclideanDistance の性質", () => {
    it("should satisfy triangle inequality: d(a,c) <= d(a,b) + d(b,c)", () => {
      const a = createVector([0, 0, 0]);
      const b = createVector([1, 0, 0]);
      const c = createVector([1, 1, 0]);

      const dAC = euclideanDistance(a, c);
      const dAB = euclideanDistance(a, b);
      const dBC = euclideanDistance(b, c);

      expect(dAC).toBeLessThanOrEqual(dAB + dBC + Number.EPSILON);
    });

    it("should be symmetric: d(a,b) = d(b,a)", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);

      const dist1 = euclideanDistance(a, b);
      const dist2 = euclideanDistance(b, a);

      expect(dist1).toBeCloseTo(dist2, FLOAT_PRECISION);
    });

    it("should return 0 for d(a,a)", () => {
      const a = createVector([1, 2, 3]);
      const dist = euclideanDistance(a, a);

      expect(dist).toBeCloseTo(0, FLOAT_PRECISION);
    });
  });

  describe("dotProduct の性質", () => {
    it("should be commutative: a·b = b·a", () => {
      const a = createVector([1, 2, 3]);
      const b = createVector([4, 5, 6]);

      expect(dotProduct(a, b)).toBeCloseTo(dotProduct(b, a), FLOAT_PRECISION);
    });

    it("should be distributive: a·(b+c) = a·b + a·c", () => {
      const a = createVector([1, 2]);
      const b = createVector([3, 4]);
      const c = createVector([5, 6]);

      const bPlusC = createVector([b[0] + c[0], b[1] + c[1]]);

      const left = dotProduct(a, bPlusC);
      const right = dotProduct(a, b) + dotProduct(a, c);

      expect(left).toBeCloseTo(right, FLOAT_PRECISION);
    });

    it("should satisfy: a·a = ||a||²", () => {
      const a = createVector([3, 4]);
      const magnitude = vectorMagnitude(a);

      expect(dotProduct(a, a)).toBeCloseTo(
        magnitude * magnitude,
        FLOAT_PRECISION,
      );
    });
  });
});
