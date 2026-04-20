import { EmbeddingError } from "../types/errors";

export interface ChunkBoundary {
  startChar: number;
  endChar: number;
  chunkId: string;
}

export interface TokenRange {
  startToken: number;
  endToken: number;
  chunkId: string;
}

export type PoolingStrategy = "mean" | "max" | "cls";

export interface LateChunkingConfig {
  poolingStrategy: PoolingStrategy;
  useFloat16: boolean;
  maxTokenLength: number;
  windowOverlapTokens: number;
}

export interface EncoderOutput {
  hiddenStates: Float32Array[];
  offsetMapping: [number, number][];
}

export interface IEncoder {
  encode(text: string): Promise<EncoderOutput>;
}

export interface ChunkEmbeddingResult {
  chunkId: string;
  embedding: number[];
  tokenCount: number;
}

export const DEFAULT_LATE_CHUNKING_CONFIG: LateChunkingConfig = {
  poolingStrategy: "mean",
  useFloat16: false,
  maxTokenLength: 512,
  windowOverlapTokens: 16,
};

export class InvalidBoundaryError extends EmbeddingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidBoundaryError";
  }
}

export class OutOfMemoryError extends EmbeddingError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OutOfMemoryError";
  }
}
