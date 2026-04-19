import type {
  ChunkBoundary,
  TokenRange,
  LateChunkingConfig,
  ChunkEmbeddingResult,
} from "./late-chunking-types";

export interface ITokenBoundaryCalculator {
  calculate(
    boundaries: ChunkBoundary[],
    offsetMapping: [number, number][],
  ): TokenRange[];
}

export interface IHiddenStatePooler {
  pool(hiddenStates: Float32Array[], range: TokenRange): number[];
}

export interface IWindowSplitter {
  split(tokens: number[]): number[][];
}

export interface ILateChunkingService {
  generateChunkEmbeddings(
    text: string,
    chunkBoundaries: ChunkBoundary[],
    config?: Partial<LateChunkingConfig>,
  ): Promise<ChunkEmbeddingResult[]>;
}
