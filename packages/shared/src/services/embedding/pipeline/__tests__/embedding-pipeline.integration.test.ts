import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmbeddingPipeline } from "../embedding-pipeline";
import type { PipelineInput, PipelineConfig, PipelineProgress } from "../types";
import type { ChunkingService } from "../../../chunking/chunking-service";
import type { EmbeddingService } from "../../embedding-service";
import type { Chunk } from "../../../chunking/types";
import type { ChunkEmbeddingResult } from "../../late-chunking/late-chunking-types";

function makeChunk(
  id: string,
  content: string,
  start: number,
  end: number,
): Chunk {
  return {
    id,
    content,
    tokenCount: content.split(" ").length,
    position: { start, end },
    metadata: {
      strategy: "fixed-size",
      chunkIndex: 0,
      totalChunks: 1,
      documentId: "doc1",
      documentType: "text",
    },
  };
}

function makeChunkingService(chunks: Chunk[]): ChunkingService {
  return {
    chunk: vi.fn().mockResolvedValue({ chunks, warnings: [] }),
  } as unknown as ChunkingService;
}

function makeEmbeddingService(options?: {
  lateChunkingResults?: ChunkEmbeddingResult[];
}): EmbeddingService {
  return {
    embedBatch: vi.fn().mockResolvedValue({
      embeddings: [
        {
          embedding: [0.1, 0.2],
          tokenCount: 5,
          model: "test",
          processingTimeMs: 10,
        },
        {
          embedding: [0.3, 0.4],
          tokenCount: 5,
          model: "test",
          processingTimeMs: 10,
        },
      ],
      errors: [],
      totalTokenCount: 10,
    }),
    generateChunkEmbeddings: options?.lateChunkingResults
      ? vi.fn().mockResolvedValue(options.lateChunkingResults)
      : vi
          .fn()
          .mockRejectedValue(new Error("LateChunkingService not configured")),
  } as unknown as EmbeddingService;
}

const baseInput: PipelineInput = {
  documentId: "doc1",
  documentType: "text",
  text: "Hello world. This is a test document for late chunking integration.",
};

const baseConfig: PipelineConfig = {
  chunking: {
    strategy: "fixed-size",
    options: { maxTokens: 50 },
  },
  embedding: {
    modelId: "text-embedding-ada-002",
  },
};

describe("EmbeddingPipeline - Late Chunking統合テスト", () => {
  let chunks: Chunk[];

  beforeEach(() => {
    chunks = [
      makeChunk("c1", "Hello world.", 0, 12),
      makeChunk(
        "c2",
        "This is a test document for late chunking integration.",
        13,
        67,
      ),
    ];
  });

  describe("Late Chunking無効（通常フロー）", () => {
    it("lateChunking未設定時はembedBatchを使用する", async () => {
      const embeddingService = makeEmbeddingService();
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const result = await pipeline.process(baseInput, baseConfig);

      expect(embeddingService.embedBatch).toHaveBeenCalledOnce();
      expect(embeddingService.generateChunkEmbeddings).not.toHaveBeenCalled();
      expect(result.embeddings).toHaveLength(2);
    });

    it("lateChunking.enabled=falseの時はembedBatchを使用する", async () => {
      const embeddingService = makeEmbeddingService();
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: false },
      };
      const result = await pipeline.process(baseInput, config);

      expect(embeddingService.embedBatch).toHaveBeenCalledOnce();
      expect(result.embeddings).toHaveLength(2);
    });

    it("通常フローでstageTimings.lateChunkingはundefined", async () => {
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService(),
      );

      const result = await pipeline.process(baseInput, baseConfig);

      expect(result.stageTimings.lateChunking).toBeUndefined();
    });
  });

  describe("Late Chunking有効フロー", () => {
    const lateChunkingResults: ChunkEmbeddingResult[] = [
      { chunkId: "c1", embedding: [0.5, 0.6], tokenCount: 3 },
      { chunkId: "c2", embedding: [0.7, 0.8], tokenCount: 12 },
    ];

    it("lateChunking.enabled=trueの時はgenerateChunkEmbeddingsを使用する", async () => {
      const embeddingService = makeEmbeddingService({ lateChunkingResults });
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true },
      };
      await pipeline.process(baseInput, config);

      expect(embeddingService.generateChunkEmbeddings).toHaveBeenCalledOnce();
      expect(embeddingService.embedBatch).not.toHaveBeenCalled();
    });

    it("Late Chunking有効時はembedBatch (Stage 3) をスキップする", async () => {
      const embeddingService = makeEmbeddingService({ lateChunkingResults });
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true, poolingStrategy: "mean" },
      };
      const result = await pipeline.process(baseInput, config);

      expect(embeddingService.embedBatch).not.toHaveBeenCalled();
      expect(result.embeddings).toHaveLength(2);
      expect(result.embeddings[0].embedding).toEqual([0.5, 0.6]);
      expect(result.embeddings[1].embedding).toEqual([0.7, 0.8]);
    });

    it("chunkBoundaryにchunk.position.start/endを渡す", async () => {
      const embeddingService = makeEmbeddingService({ lateChunkingResults });
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true },
      };
      await pipeline.process(baseInput, config);

      expect(embeddingService.generateChunkEmbeddings).toHaveBeenCalledWith(
        expect.any(String),
        [
          { startChar: 0, endChar: 12, chunkId: "c1" },
          { startChar: 13, endChar: 67, chunkId: "c2" },
        ],
        expect.objectContaining({}),
      );
    });

    it("stageTimings.lateChunkingが記録される", async () => {
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService({ lateChunkingResults }),
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true },
      };
      const result = await pipeline.process(baseInput, config);

      expect(result.stageTimings.lateChunking).toBeTypeOf("number");
      expect(result.stageTimings.lateChunking).toBeGreaterThanOrEqual(0);
    });

    it("poolingStrategy=maxをgenerateChunkEmbeddingsに伝える", async () => {
      const embeddingService = makeEmbeddingService({ lateChunkingResults });
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true, poolingStrategy: "max" },
      };
      await pipeline.process(baseInput, config);

      expect(embeddingService.generateChunkEmbeddings).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ poolingStrategy: "max" }),
      );
    });

    it("maxTokenLengthをgenerateChunkEmbeddingsに伝える", async () => {
      const embeddingService = makeEmbeddingService({ lateChunkingResults });
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true, maxTokenLength: 256 },
      };
      await pipeline.process(baseInput, config);

      expect(embeddingService.generateChunkEmbeddings).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({ maxTokenLength: 256 }),
      );
    });

    it("chunkId順序でアライメントされる（結果が逆順で返ってきても正しく整列）", async () => {
      const reversedResults: ChunkEmbeddingResult[] = [
        { chunkId: "c2", embedding: [0.7, 0.8], tokenCount: 12 },
        { chunkId: "c1", embedding: [0.5, 0.6], tokenCount: 3 },
      ];
      const embeddingService = makeEmbeddingService({
        lateChunkingResults: reversedResults,
      });
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        embeddingService,
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true },
      };
      const result = await pipeline.process(baseInput, config);

      expect(result.embeddings[0].embedding).toEqual([0.5, 0.6]);
      expect(result.embeddings[1].embedding).toEqual([0.7, 0.8]);
    });

    it("onProgressにlateChunkingステージが通知される", async () => {
      const progressEvents: PipelineProgress[] = [];
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService({ lateChunkingResults }),
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true },
      };
      await pipeline.process(baseInput, config, (p) => progressEvents.push(p));

      const lateChunkingEvents = progressEvents.filter(
        (e) => e.currentStage === "lateChunking",
      );
      expect(lateChunkingEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("バリデーション", () => {
    it("不正なpoolingStrategyでPipelineErrorをスロー", async () => {
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService(),
      );

      const config = {
        ...baseConfig,
        lateChunking: { enabled: true, poolingStrategy: "invalid" as never },
      };

      await expect(pipeline.process(baseInput, config)).rejects.toThrow(
        "Invalid poolingStrategy",
      );
    });

    it("maxTokenLength=0でPipelineErrorをスロー", async () => {
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService(),
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true, maxTokenLength: 0 },
      };

      await expect(pipeline.process(baseInput, config)).rejects.toThrow(
        "Invalid maxTokenLength",
      );
    });

    it("maxTokenLength負値でPipelineErrorをスロー", async () => {
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService(),
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true, maxTokenLength: -1 },
      };

      await expect(pipeline.process(baseInput, config)).rejects.toThrow(
        "Invalid maxTokenLength",
      );
    });
  });

  describe("後方互換性", () => {
    it("lateChunking未設定でもPipelineOutputのstageTimingsはエラーなし", async () => {
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService(),
      );

      const result = await pipeline.process(baseInput, baseConfig);

      expect(result.stageTimings).toMatchObject({
        preprocessing: expect.any(Number),
        chunking: expect.any(Number),
        embedding: expect.any(Number),
        deduplication: expect.any(Number),
      });
    });

    it("Late Chunking有効時でも重複排除は正常動作する", async () => {
      const lateChunkingResults: ChunkEmbeddingResult[] = [
        { chunkId: "c1", embedding: [0.5, 0.5], tokenCount: 3 },
        { chunkId: "c2", embedding: [0.5, 0.5], tokenCount: 12 },
      ];
      const pipeline = new EmbeddingPipeline(
        makeChunkingService(chunks),
        makeEmbeddingService({ lateChunkingResults }),
      );

      const config: PipelineConfig = {
        ...baseConfig,
        lateChunking: { enabled: true },
        persistence: {
          deduplication: { enabled: true, method: "content-hash" },
        },
      };

      await expect(pipeline.process(baseInput, config)).resolves.toBeDefined();
    });
  });
});
