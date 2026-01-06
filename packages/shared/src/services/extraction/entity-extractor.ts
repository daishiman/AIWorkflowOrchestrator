/**
 * LLMベースのエンティティ抽出器
 * @description LLMを使用したNER実装
 */

import { ok, err, type Result } from "../../types/rag/result";
import type { Chunk } from "../chunking/types";
import type { IEntityExtractor, ILLMProvider } from "./interfaces";
import type {
  EntityExtractionOptionsInput,
  ExtractionResult,
  BatchExtractionResult,
  ExtractedEntity,
  LLMEntityResponse,
} from "./types";
import { LLMEntityResponseSchema } from "./types";
import {
  mergeOptions,
  findMentionsInText,
  normalizeEntityName,
  deduplicateEntities,
} from "./utils";
import { buildEntityExtractionPrompt } from "./prompts/entity-extraction";
import { LLMProviderError, JsonParseError } from "./errors";

/**
 * LLMベースのエンティティ抽出器
 */
export class LLMEntityExtractor implements IEntityExtractor {
  private readonly llmProvider: ILLMProvider;

  constructor(llmProvider: ILLMProvider) {
    this.llmProvider = llmProvider;
  }

  /**
   * 単一チャンクからエンティティを抽出
   */
  async extract(
    chunk: Chunk,
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<ExtractionResult, Error>> {
    const startTime = performance.now();
    const mergedOptions = mergeOptions(options);

    // 空のチャンクは空結果を返す
    if (!chunk.content.trim()) {
      return ok({
        entities: [],
        chunkId: chunk.id,
        processingTimeMs: performance.now() - startTime,
        modelUsed: this.llmProvider.modelId,
      });
    }

    // プロンプト生成
    const prompt = buildEntityExtractionPrompt(chunk.content, options);

    // LLM呼び出し
    const llmResult = await this.llmProvider.generate(prompt, {
      responseFormat: "json",
      temperature: 0.1,
    });

    if (!llmResult.success) {
      return err(
        new LLMProviderError("LLM generation failed", llmResult.error),
      );
    }

    // JSONパース
    let parsed: LLMEntityResponse;
    try {
      const jsonText = this.extractJsonFromResponse(llmResult.data.text);
      const rawParsed = JSON.parse(jsonText);
      const validated = LLMEntityResponseSchema.safeParse(rawParsed);

      if (!validated.success) {
        return err(
          new JsonParseError(
            "Invalid entity response format",
            llmResult.data.text,
            new Error(validated.error.message),
          ),
        );
      }
      parsed = validated.data;
    } catch (e) {
      return err(
        new JsonParseError(
          "Failed to parse LLM response as JSON",
          llmResult.data.text,
          e instanceof Error ? e : new Error(String(e)),
        ),
      );
    }

    // エンティティを処理
    const entities: ExtractedEntity[] = parsed.entities
      .map((e) => ({
        name: e.name,
        normalizedName: e.normalizedName ?? normalizeEntityName(e.name),
        type: e.type as ExtractedEntity["type"],
        confidence: e.confidence ?? 0.8,
        description: e.description,
        aliases: e.aliases ?? [],
        mentions: findMentionsInText(e.name, chunk.content, chunk.id),
      }))
      // フィルタリング
      .filter((e) => {
        // 名前長フィルタ
        if (e.name.length < mergedOptions.minNameLength) return false;
        // 信頼度フィルタ
        if (e.confidence < mergedOptions.minConfidence) return false;
        // タイプフィルタ
        if (mergedOptions.types && !mergedOptions.types.includes(e.type))
          return false;
        return true;
      })
      // 最大数制限
      .slice(0, mergedOptions.maxEntitiesPerChunk);

    return ok({
      entities,
      chunkId: chunk.id,
      processingTimeMs: performance.now() - startTime,
      modelUsed: this.llmProvider.modelId,
    });
  }

  /**
   * 複数チャンクからバッチ抽出
   */
  async extractBatch(
    chunks: Chunk[],
    options?: EntityExtractionOptionsInput,
  ): Promise<Result<BatchExtractionResult, Error>> {
    const startTime = performance.now();

    if (chunks.length === 0) {
      return ok({
        results: [],
        totalEntities: 0,
        processingTimeMs: performance.now() - startTime,
      });
    }

    const results: ExtractionResult[] = [];

    for (const chunk of chunks) {
      const result = await this.extract(chunk, options);
      if (result.success) {
        results.push(result.data);
      }
      // エラー時はスキップして継続
    }

    const totalEntities = results.reduce(
      (sum, r) => sum + r.entities.length,
      0,
    );

    return ok({
      results,
      totalEntities,
      processingTimeMs: performance.now() - startTime,
    });
  }

  /**
   * 複数結果のエンティティをマージ
   */
  mergeEntities(results: ExtractionResult[]): ExtractedEntity[] {
    const allEntities = results.flatMap((r) => r.entities);
    return deduplicateEntities(allEntities);
  }

  /**
   * レスポンスからJSONを抽出
   */
  private extractJsonFromResponse(text: string): string {
    // コードブロック内のJSONを抽出
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }
    // コードブロックなしの場合はそのまま返す
    return text.trim();
  }
}
