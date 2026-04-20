// Late Chunking処理の責務を担うサービス層と補助コンポーネントの公開エントリ。
export { LateChunkingService } from "./late-chunking-service";
export { ChunkingLateChunkingAdapter } from "./chunking-late-chunking-adapter";
export { TokenBoundaryCalculator } from "./token-boundary-calculator";
export { HiddenStatePooler } from "./hidden-state-pooler";
export { WindowSplitter } from "./window-splitter";
export type {
  ChunkBoundary,
  TokenRange,
  PoolingStrategy,
  LateChunkingConfig,
  IEncoder,
  EncoderOutput,
  ChunkEmbeddingResult,
} from "./late-chunking-types";
export {
  InvalidBoundaryError,
  OutOfMemoryError,
  DEFAULT_LATE_CHUNKING_CONFIG,
} from "./late-chunking-types";
export type {
  ILateChunkingService,
  ITokenBoundaryCalculator,
  IHiddenStatePooler,
  IWindowSplitter,
} from "./late-chunking-interfaces";
