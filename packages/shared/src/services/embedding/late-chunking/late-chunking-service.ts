import type { ILateChunkingService } from "./late-chunking-interfaces";
import type {
  ChunkBoundary,
  LateChunkingConfig,
  ChunkEmbeddingResult,
  IEncoder,
} from "./late-chunking-types";
import { DEFAULT_LATE_CHUNKING_CONFIG } from "./late-chunking-types";
import { TokenBoundaryCalculator } from "./token-boundary-calculator";
import { HiddenStatePooler } from "./hidden-state-pooler";
import { WindowSplitter } from "./window-splitter";

export class LateChunkingService implements ILateChunkingService {
  private readonly calculator: TokenBoundaryCalculator;

  constructor(private readonly encoder: IEncoder) {
    this.calculator = new TokenBoundaryCalculator();
  }

  async generateChunkEmbeddings(
    text: string,
    chunkBoundaries: ChunkBoundary[],
    config?: Partial<LateChunkingConfig>,
  ): Promise<ChunkEmbeddingResult[]> {
    if (text.length === 0 || chunkBoundaries.length === 0) return [];

    const cfg: LateChunkingConfig = {
      ...DEFAULT_LATE_CHUNKING_CONFIG,
      ...config,
    };

    const { hiddenStates, offsetMapping } = await this.encoder.encode(text);

    const splitter = new WindowSplitter(
      cfg.maxTokenLength,
      cfg.windowOverlapTokens,
    );
    const pooler = new HiddenStatePooler(cfg.poolingStrategy);

    const tokenRanges = this.calculator.calculate(
      chunkBoundaries,
      offsetMapping,
    );

    const totalTokens = hiddenStates.length;
    const windows = splitter.split(
      Array.from({ length: totalTokens }, (_, i) => i),
    );
    void windows;

    return tokenRanges.map((range) => {
      const embedding = pooler.pool(hiddenStates, range);
      return {
        chunkId: range.chunkId,
        embedding,
        tokenCount: range.endToken - range.startToken + 1,
      };
    });
  }
}
