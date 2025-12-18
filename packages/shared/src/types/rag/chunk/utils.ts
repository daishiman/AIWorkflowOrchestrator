/**
 * @file チャンク・埋め込みユーティリティ関数
 * @module @repo/shared/types/rag/chunk/utils
 * @description RAGパイプラインにおけるベクトル演算、変換、推定のユーティリティ関数群
 *
 * 設計原則:
 * - 純粋関数（副作用なし）
 * - 入力の検証とエラーハンドリング
 * - 浮動小数点演算の精度考慮
 */

import type { ChunkingConfig, EmbeddingModelConfig } from "./types";

// =============================================================================
// 定数
// =============================================================================

/**
 * ゼロベクトル判定用の閾値
 * Number.EPSILON (≈2.22e-16) より少し大きい値を使用
 */
const EPSILON = 1e-10;

/**
 * トークン推定用の係数定数
 */
const TOKEN_ESTIMATION = {
  /** ASCII文字の1トークンあたりの文字数 */
  ASCII_CHARS_PER_TOKEN: 4,
  /** 非ASCII文字（日本語等）の1トークンあたりの文字数 */
  NON_ASCII_CHARS_PER_TOKEN: 1.5,
} as const;

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * 2つのベクトルの次元が一致することを検証
 * @throws {Error} 次元が一致しない場合
 */
function validateSameDimensions(a: Float32Array, b: Float32Array): void {
  if (a.length !== b.length) {
    throw new Error(
      `次元が一致しません (dimension mismatch): ${a.length} vs ${b.length}`,
    );
  }
}

/**
 * ベクトルがゼロベクトルでないことを検証
 * @throws {Error} ゼロベクトルの場合
 */
function validateNonZeroVector(magnitude: number, context: string): void {
  if (magnitude < EPSILON) {
    throw new Error(`ゼロベクトルの${context}は計算できません (zero vector)`);
  }
}

// =============================================================================
// 1. ベクトル演算関数
// =============================================================================

/**
 * ベクトルの大きさ（L2ノルム）を計算
 *
 * @param vector - 入力ベクトル (Float32Array)
 * @returns ベクトルの大きさ (非負の数値)
 *
 * @example
 * ```typescript
 * const v = new Float32Array([3, 4]);
 * vectorMagnitude(v); // 5.0
 * ```
 */
export function vectorMagnitude(vector: Float32Array): number {
  if (vector.length === 0) {
    return 0;
  }

  let sumOfSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    sumOfSquares += vector[i] * vector[i];
  }

  return Math.sqrt(sumOfSquares);
}

/**
 * ベクトルをL2正規化（単位ベクトル化）
 *
 * @param vector - 入力ベクトル (Float32Array)
 * @returns 正規化されたベクトル (新しいFloat32Array)
 * @throws {Error} ゼロベクトルの場合
 *
 * @example
 * ```typescript
 * const v = new Float32Array([3, 4]);
 * normalizeVector(v); // Float32Array([0.6, 0.8])
 * ```
 */
export function normalizeVector(vector: Float32Array): Float32Array {
  const magnitude = vectorMagnitude(vector);
  validateNonZeroVector(magnitude, "正規化");

  const result = new Float32Array(vector.length);
  for (let i = 0; i < vector.length; i++) {
    result[i] = vector[i] / magnitude;
  }

  return result;
}

/**
 * 2つのベクトルの内積を計算
 *
 * @param a - ベクトル1 (Float32Array)
 * @param b - ベクトル2 (Float32Array)
 * @returns 内積値
 * @throws {Error} 次元が一致しない場合
 *
 * @example
 * ```typescript
 * const a = new Float32Array([1, 2, 3]);
 * const b = new Float32Array([4, 5, 6]);
 * dotProduct(a, b); // 32
 * ```
 */
export function dotProduct(a: Float32Array, b: Float32Array): number {
  validateSameDimensions(a, b);

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }

  return sum;
}

/**
 * 2つのベクトル間のコサイン類似度を計算
 *
 * @param a - ベクトル1 (Float32Array)
 * @param b - ベクトル2 (Float32Array)
 * @returns コサイン類似度 (-1 から 1 の範囲)
 * @throws {Error} 次元が一致しない場合、またはゼロベクトルの場合
 *
 * @example
 * ```typescript
 * const a = new Float32Array([1, 0, 0]);
 * const b = new Float32Array([0, 1, 0]);
 * cosineSimilarity(a, b); // 0 (直交)
 * ```
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  validateSameDimensions(a, b);

  const magA = vectorMagnitude(a);
  const magB = vectorMagnitude(b);

  validateNonZeroVector(magA, "コサイン類似度");
  validateNonZeroVector(magB, "コサイン類似度");

  const dot = dotProduct(a, b);
  return dot / (magA * magB);
}

/**
 * 2つのベクトル間のユークリッド距離を計算
 *
 * @param a - ベクトル1 (Float32Array)
 * @param b - ベクトル2 (Float32Array)
 * @returns ユークリッド距離 (非負の数値)
 * @throws {Error} 次元が一致しない場合
 *
 * @example
 * ```typescript
 * const a = new Float32Array([1, 1]);
 * const b = new Float32Array([4, 5]);
 * euclideanDistance(a, b); // 5.0 (3-4-5三角形)
 * ```
 */
export function euclideanDistance(a: Float32Array, b: Float32Array): number {
  validateSameDimensions(a, b);

  let sumOfSquares = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumOfSquares += diff * diff;
  }

  return Math.sqrt(sumOfSquares);
}

// =============================================================================
// 2. Base64変換関数
// =============================================================================

/**
 * Float32ArrayをBase64文字列に変換
 *
 * @param vector - 入力ベクトル (Float32Array)
 * @returns Base64エンコードされた文字列
 *
 * @example
 * ```typescript
 * const v = new Float32Array([0.5, 0.3, 0.2]);
 * vectorToBase64(v); // "AABAAD+amZk+..."
 * ```
 */
export function vectorToBase64(vector: Float32Array): string {
  if (vector.length === 0) {
    return "";
  }

  const buffer = Buffer.from(vector.buffer);
  return buffer.toString("base64");
}

/**
 * Base64文字列をFloat32Arrayに変換
 *
 * @param base64 - Base64エンコードされた文字列
 * @returns Float32Array
 * @throws {Error} 不正なBase64文字列、またはバイト長がFloat32Arrayに適合しない場合
 *
 * @example
 * ```typescript
 * const base64 = vectorToBase64(new Float32Array([0.5, 0.3, 0.2]));
 * base64ToVector(base64); // Float32Array([0.5, 0.3, 0.2])
 * ```
 */
export function base64ToVector(base64: string): Float32Array {
  if (base64 === "") {
    return new Float32Array(0);
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    throw new Error("不正なBase64文字列です");
  }

  // Float32は4バイト単位
  if (buffer.length % 4 !== 0) {
    throw new Error(
      `バイト長が4の倍数ではありません (Float32Arrayに変換できません): ${buffer.length} bytes`,
    );
  }

  return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
}

// =============================================================================
// 3. トークン推定関数
// =============================================================================

/**
 * テキストのトークン数を推定
 *
 * 推定ルール:
 * - ASCII文字: 4文字で1トークン
 * - 非ASCII文字（日本語等）: 1.5文字で1トークン
 *
 * @param text - 入力テキスト
 * @returns 推定トークン数 (非負の整数)
 *
 * @example
 * ```typescript
 * estimateTokenCount("Hello, world!"); // 4
 * estimateTokenCount("こんにちは"); // 4
 * ```
 */
export function estimateTokenCount(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  let asciiCount = 0;
  let nonAsciiCount = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 128) {
      asciiCount++;
    } else {
      nonAsciiCount++;
    }
  }

  const asciiTokens = asciiCount / TOKEN_ESTIMATION.ASCII_CHARS_PER_TOKEN;
  const nonAsciiTokens =
    nonAsciiCount / TOKEN_ESTIMATION.NON_ASCII_CHARS_PER_TOKEN;

  return Math.ceil(asciiTokens + nonAsciiTokens);
}

// =============================================================================
// 4. デフォルト設定
// =============================================================================

/**
 * デフォルトチャンキング設定の拡張型
 * テスト互換性のために追加フィールドを含む
 */
interface DefaultChunkingConfig extends ChunkingConfig {
  /** @deprecated preserveBoundaries の別名 */
  readonly respectBoundaries: boolean;
  /** @deprecated 未使用 - 下位互換性のため保持 */
  readonly preserveFormatting: boolean;
}

/**
 * デフォルトのチャンキング設定
 *
 * 推奨値:
 * - strategy: "recursive" (再帰的分割、バランスが良い)
 * - targetSize: 512 (GPT-4の入力に最適)
 * - minSize: 100 (意味のある最小サイズ)
 * - maxSize: 1024 (コンテキスト保持の上限)
 * - overlapSize: 50 (文脈の連続性を保持)
 */
export const defaultChunkingConfig: DefaultChunkingConfig = {
  strategy: "recursive",
  targetSize: 512,
  minSize: 100,
  maxSize: 1024,
  overlapSize: 50,
  preserveBoundaries: true,
  includeContext: true,
  // テスト互換性のための別名
  respectBoundaries: true,
  preserveFormatting: false,
};

/**
 * 各プロバイダーの埋め込みモデル設定インターフェース
 */
interface EmbeddingModelConfigs {
  openai: EmbeddingModelConfig & { modelName: string };
  cohere: EmbeddingModelConfig & { modelName: string };
  voyage: EmbeddingModelConfig & { modelName: string };
  local: EmbeddingModelConfig & { modelName: string };
}

/**
 * デフォルトの埋め込みモデル設定
 *
 * 各プロバイダーの推奨設定:
 * - OpenAI: text-embedding-3-small (1536次元, 高品質)
 * - Cohere: embed-english-v3.0 (1024次元)
 * - Voyage: voyage-2 (1024次元)
 * - Local: all-MiniLM-L6-v2 (384次元, オフライン対応)
 */
export const defaultEmbeddingModelConfigs: EmbeddingModelConfigs = {
  openai: {
    provider: "openai",
    modelId: "text-embedding-3-small",
    modelName: "text-embedding-3-small",
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100,
  },
  cohere: {
    provider: "cohere",
    modelId: "embed-english-v3.0",
    modelName: "embed-english-v3.0",
    dimensions: 1024,
    maxTokens: 512,
    batchSize: 96,
  },
  voyage: {
    provider: "voyage",
    modelId: "voyage-2",
    modelName: "voyage-2",
    dimensions: 1024,
    maxTokens: 4000,
    batchSize: 100,
  },
  local: {
    provider: "local",
    modelId: "all-MiniLM-L6-v2",
    modelName: "all-MiniLM-L6-v2",
    dimensions: 384,
    maxTokens: 256,
    batchSize: 32,
  },
};
