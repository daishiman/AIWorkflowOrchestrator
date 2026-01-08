/**
 * LLMベースの関係抽出器
 * @description エンティティ間の関係を抽出するNER実装 (CONV-06-05)
 */

import { ok, err, type Result } from "../../types/rag/result";
import type { Chunk } from "../chunking/types";
import type { IRelationExtractor, ILLMProvider } from "./interfaces";
import type {
  RelationExtractionOptionsInput,
  RelationExtractionResult,
  BatchRelationExtractionResult,
  ExtractedRelation,
  ExtractedEntity,
  LLMRelationResponse,
  RelationType,
  RelationEvidence,
} from "./types";
import {
  LLMRelationResponseSchema,
  DEFAULT_RELATION_EXTRACTION_OPTIONS,
  BIDIRECTIONAL_RELATION_TYPES,
  RelationTypes,
} from "./types";
import { buildRelationExtractionPrompt } from "./prompts/relation-extraction";
import { LLMProviderError, JsonParseError } from "./errors";

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 関係抽出オプションをデフォルト値とマージ
 */
function mergeRelationOptions(options?: RelationExtractionOptionsInput): {
  minConfidence: number;
  maxRelationsPerChunk: number;
  extractEvidence: boolean;
  detectBidirectional: boolean;
  useLLM: boolean;
  maxRetries: number;
  types?: RelationType[];
} {
  return {
    ...DEFAULT_RELATION_EXTRACTION_OPTIONS,
    ...options,
  };
}

/**
 * 関係タイプが有効かどうか確認
 */
function isValidRelationType(type: string): type is RelationType {
  return Object.values(RelationTypes).includes(type as RelationType);
}

/**
 * 関係タイプを正規化（無効な場合はotherにフォールバック）
 */
function normalizeRelationType(type: string): RelationType {
  if (isValidRelationType(type)) {
    return type;
  }
  return RelationTypes.OTHER;
}

/**
 * 関係を一意に識別するキーを生成
 */
function getRelationKey(
  sourceEntity: string,
  targetEntity: string,
  relationType: RelationType,
): string {
  return `${sourceEntity}::${targetEntity}::${relationType}`;
}

/**
 * 逆方向の関係キーを生成
 */
function getReverseRelationKey(
  sourceEntity: string,
  targetEntity: string,
  relationType: RelationType,
): string {
  return `${targetEntity}::${sourceEntity}::${relationType}`;
}

/**
 * 重複関係をマージ
 */
function deduplicateRelations(
  relations: ExtractedRelation[],
): ExtractedRelation[] {
  const relationMap = new Map<string, ExtractedRelation>();

  for (const relation of relations) {
    const key = getRelationKey(
      relation.sourceEntity,
      relation.targetEntity,
      relation.relationType,
    );
    const reverseKey = getReverseRelationKey(
      relation.sourceEntity,
      relation.targetEntity,
      relation.relationType,
    );

    // 既存の関係を確認
    const existing = relationMap.get(key);
    const existingReverse = relationMap.get(reverseKey);

    if (existing) {
      // 同じ方向の関係が既存: マージ
      relationMap.set(key, mergeRelation(existing, relation));
    } else if (existingReverse && relation.bidirectional) {
      // 逆方向の関係が既存かつ双方向: マージしてbidirectional=true
      const merged = mergeRelation(existingReverse, {
        ...relation,
        sourceEntity: existingReverse.sourceEntity,
        targetEntity: existingReverse.targetEntity,
        bidirectional: true,
      });
      relationMap.set(reverseKey, merged);
    } else {
      // 新規関係
      relationMap.set(key, relation);
    }
  }

  return Array.from(relationMap.values());
}

/**
 * 2つの関係をマージ
 */
function mergeRelation(
  existing: ExtractedRelation,
  newRelation: ExtractedRelation,
): ExtractedRelation {
  return {
    ...existing,
    // 信頼度は最大値を採用
    confidence: Math.max(existing.confidence, newRelation.confidence),
    // 説明は長い方を採用
    description:
      (existing.description?.length ?? 0) >=
      (newRelation.description?.length ?? 0)
        ? existing.description
        : newRelation.description,
    // エビデンスは結合
    evidence: [...existing.evidence, ...newRelation.evidence],
    // bidirectionalはORで統合
    bidirectional: existing.bidirectional || newRelation.bidirectional,
    // attributesはマージ
    attributes: { ...existing.attributes, ...newRelation.attributes },
  };
}

// =============================================================================
// LLMRelationExtractor Implementation
// =============================================================================

/**
 * LLMベースの関係抽出器
 */
export class LLMRelationExtractor implements IRelationExtractor {
  private readonly llmProvider: ILLMProvider;

  constructor(llmProvider: ILLMProvider) {
    this.llmProvider = llmProvider;
  }

  /**
   * 単一チャンクからエンティティ間の関係を抽出
   */
  async extract(
    chunk: Chunk,
    entities: ExtractedEntity[],
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<RelationExtractionResult, Error>> {
    const startTime = performance.now();
    const mergedOptions = mergeRelationOptions(options);

    // エンティティが2件未満の場合は空結果を返す
    if (entities.length < 2) {
      return ok({
        relations: [],
        chunkId: chunk.id,
        processingTimeMs: performance.now() - startTime,
        modelUsed: this.llmProvider.modelId,
      });
    }

    // 空のチャンクは空結果を返す
    if (!chunk.content.trim()) {
      return ok({
        relations: [],
        chunkId: chunk.id,
        processingTimeMs: performance.now() - startTime,
        modelUsed: this.llmProvider.modelId,
      });
    }

    // プロンプト生成
    const prompt = buildRelationExtractionPrompt(chunk.content, entities, {
      types: mergedOptions.types,
      extractEvidence: mergedOptions.extractEvidence,
    });

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
    let parsed: LLMRelationResponse;
    try {
      const jsonText = this.extractJsonFromResponse(llmResult.data.text);
      const rawParsed = JSON.parse(jsonText);
      const validated = LLMRelationResponseSchema.safeParse(rawParsed);

      if (!validated.success) {
        return err(
          new JsonParseError(
            "Invalid relation response format",
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

    // エンティティ名のセットを作成（有効な関係のみ抽出するため）
    const entityNames = new Set(entities.map((e) => e.name));
    const normalizedEntityNames = new Set(
      entities.map((e) => e.normalizedName),
    );

    // 関係を処理
    const relations: ExtractedRelation[] = parsed.relations
      .map((r) => {
        const relationType = normalizeRelationType(r.relationType);

        // 双方向関係の検出
        const isBidirectional =
          r.bidirectional ??
          (mergedOptions.detectBidirectional &&
            BIDIRECTIONAL_RELATION_TYPES.includes(relationType));

        // エビデンスの構築
        const evidence: RelationEvidence[] = [];
        if (mergedOptions.extractEvidence && r.evidence) {
          evidence.push({
            chunkId: chunk.id,
            text: r.evidence.text.slice(0, 500), // 最大500文字
            startPosition: r.evidence.startPosition ?? 0,
            endPosition: r.evidence.endPosition ?? r.evidence.text.length,
          });
        }

        return {
          sourceEntity: r.sourceEntity,
          targetEntity: r.targetEntity,
          relationType,
          description: r.description?.slice(0, 500), // 最大500文字
          evidence,
          confidence: r.confidence ?? 0.8,
          bidirectional: isBidirectional,
        } satisfies ExtractedRelation;
      })
      // フィルタリング
      .filter((r) => {
        // 自己参照を除外
        if (r.sourceEntity === r.targetEntity) return false;

        // 信頼度フィルタ
        if (r.confidence < mergedOptions.minConfidence) return false;

        // タイプフィルタ
        if (
          mergedOptions.types &&
          !mergedOptions.types.includes(r.relationType)
        ) {
          return false;
        }

        // エンティティが存在することを確認（正規化名またはオリジナル名で）
        const sourceExists =
          entityNames.has(r.sourceEntity) ||
          normalizedEntityNames.has(r.sourceEntity.toLowerCase());
        const targetExists =
          entityNames.has(r.targetEntity) ||
          normalizedEntityNames.has(r.targetEntity.toLowerCase());

        return sourceExists && targetExists;
      })
      // 信頼度でソートして最大数制限
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, mergedOptions.maxRelationsPerChunk);

    return ok({
      relations,
      chunkId: chunk.id,
      processingTimeMs: performance.now() - startTime,
      modelUsed: this.llmProvider.modelId,
    });
  }

  /**
   * 複数チャンクからバッチで関係を抽出
   */
  async extractBatch(
    chunks: Chunk[],
    entitiesByChunk: Map<string, ExtractedEntity[]>,
    options?: RelationExtractionOptionsInput,
  ): Promise<Result<BatchRelationExtractionResult, Error>> {
    const startTime = performance.now();

    if (chunks.length === 0) {
      return ok({
        results: [],
        totalRelations: 0,
        uniqueRelations: 0,
        processingTimeMs: performance.now() - startTime,
      });
    }

    const results: RelationExtractionResult[] = [];

    for (const chunk of chunks) {
      const entities = entitiesByChunk.get(chunk.id) ?? [];
      const result = await this.extract(chunk, entities, options);
      if (result.success) {
        results.push(result.data);
      }
      // エラー時はスキップして継続
    }

    const totalRelations = results.reduce(
      (sum, r) => sum + r.relations.length,
      0,
    );

    // 重複を除去したユニーク関係数を計算
    const mergedRelations = this.mergeRelations(results);
    const uniqueRelations = mergedRelations.length;

    return ok({
      results,
      totalRelations,
      uniqueRelations,
      processingTimeMs: performance.now() - startTime,
    });
  }

  /**
   * 複数結果の関係をマージ（重複統合）
   */
  mergeRelations(results: RelationExtractionResult[]): ExtractedRelation[] {
    const allRelations = results.flatMap((r) => r.relations);
    return deduplicateRelations(allRelations);
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
