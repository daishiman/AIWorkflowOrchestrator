/**
 * ルールベースのエンティティ抽出器
 * @description パターンマッチングによるNER実装（LLMフォールバック）
 */

import { ok, type Result } from "../../types/rag/result";
import type { Chunk } from "../chunking/types";
import type { IEntityExtractor } from "./interfaces";
import type {
  EntityExtractionOptionsInput,
  ExtractionResult,
  BatchExtractionResult,
  ExtractedEntity,
  EntityType,
} from "./types";
import {
  mergeOptions,
  findMentionsInText,
  normalizeEntityName,
  deduplicateEntities,
} from "./utils";

/**
 * パターン定義
 */
interface PatternDefinition {
  pattern: RegExp;
  type: EntityType;
  confidence: number;
}

/**
 * 技術名パターン
 */
const TECHNOLOGY_PATTERNS: PatternDefinition[] = [
  // プログラミング言語
  {
    pattern:
      /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Go|Rust|Ruby|PHP|Swift|Kotlin|Scala|Perl|Haskell|Elixir|Clojure|Erlang|OCaml|F#|Dart|R|Julia|Lua)\b/gi,
    type: "technology",
    confidence: 0.9,
  },
  // フレームワーク
  {
    pattern:
      /\b(React|Vue|Angular|Next\.js|Nuxt\.js|Svelte|Express|Django|Flask|Rails|Spring|Laravel|FastAPI|Nest\.js|Gatsby|Remix)\b/gi,
    type: "technology",
    confidence: 0.85,
  },
  // データベース
  {
    pattern:
      /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|SQLite|Oracle|SQL Server|MariaDB|DynamoDB|Cassandra|Neo4j|Firebase|Supabase)\b/gi,
    type: "technology",
    confidence: 0.85,
  },
  // ツール・ランタイム
  {
    pattern:
      /\b(Node\.js|Deno|Bun|Docker|Kubernetes|Git|npm|yarn|pnpm|Webpack|Vite|Rollup|Babel|ESLint|Prettier|Jest|Vitest|Playwright|Cypress)\b/gi,
    type: "technology",
    confidence: 0.85,
  },
  // クラウド・サービス
  {
    pattern:
      /\b(AWS|Azure|GCP|Google Cloud|Vercel|Netlify|Heroku|DigitalOcean|Cloudflare|GitHub|GitLab|Bitbucket)\b/gi,
    type: "technology",
    confidence: 0.8,
  },
];

/**
 * 組織名パターン
 */
const ORGANIZATION_PATTERNS: PatternDefinition[] = [
  {
    pattern:
      /\b(Google|Microsoft|Apple|Amazon|Meta|Facebook|Twitter|Netflix|Spotify|Uber|Airbnb|Tesla|SpaceX|OpenAI|Anthropic|DeepMind|IBM|Oracle|SAP|Salesforce|Adobe|Intel|AMD|NVIDIA|Samsung|Sony|Nintendo|ByteDance|Tencent|Alibaba|Baidu)\b/gi,
    type: "organization",
    confidence: 0.9,
  },
];

/**
 * 日付パターン
 */
const DATE_PATTERNS: PatternDefinition[] = [
  // ISO形式: 2024-01-15
  {
    pattern: /\b(\d{4}-\d{2}-\d{2})\b/g,
    type: "date",
    confidence: 0.95,
  },
  // 日本語形式: 2024年1月15日
  {
    pattern: /\b(\d{4}年\d{1,2}月\d{1,2}日)\b/g,
    type: "date",
    confidence: 0.95,
  },
  // スラッシュ形式: 2024/01/15
  {
    pattern: /\b(\d{4}\/\d{2}\/\d{2})\b/g,
    type: "date",
    confidence: 0.9,
  },
];

/**
 * 全パターンを統合
 */
const ALL_PATTERNS: PatternDefinition[] = [
  ...TECHNOLOGY_PATTERNS,
  ...ORGANIZATION_PATTERNS,
  ...DATE_PATTERNS,
];

/**
 * ルールベースのエンティティ抽出器
 */
export class RuleBasedEntityExtractor implements IEntityExtractor {
  private readonly patterns: PatternDefinition[];

  constructor(customPatterns?: PatternDefinition[]) {
    this.patterns = customPatterns ?? ALL_PATTERNS;
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
        modelUsed: "rule-based",
      });
    }

    const extractedEntities: ExtractedEntity[] = [];
    const seenNames = new Set<string>();

    // 各パターンでマッチング
    for (const patternDef of this.patterns) {
      // タイプフィルタ
      if (
        mergedOptions.types &&
        !mergedOptions.types.includes(patternDef.type)
      ) {
        continue;
      }

      // パターンマッチ
      const regex = new RegExp(
        patternDef.pattern.source,
        patternDef.pattern.flags,
      );
      let match: RegExpExecArray | null;

      while ((match = regex.exec(chunk.content)) !== null) {
        const name = match[1] ?? match[0];
        const normalizedName = normalizeEntityName(name);

        // 重複チェック
        if (seenNames.has(normalizedName)) continue;

        // 名前長フィルタ
        if (name.length < mergedOptions.minNameLength) continue;

        // 信頼度フィルタ
        if (patternDef.confidence < mergedOptions.minConfidence) continue;

        seenNames.add(normalizedName);

        extractedEntities.push({
          name,
          normalizedName,
          type: patternDef.type,
          confidence: patternDef.confidence,
          aliases: [],
          mentions: findMentionsInText(name, chunk.content, chunk.id),
        });

        // 最大数制限チェック
        if (extractedEntities.length >= mergedOptions.maxEntitiesPerChunk) {
          break;
        }
      }

      // 最大数制限チェック（外側ループ）
      if (extractedEntities.length >= mergedOptions.maxEntitiesPerChunk) {
        break;
      }
    }

    return ok({
      entities: extractedEntities.slice(0, mergedOptions.maxEntitiesPerChunk),
      chunkId: chunk.id,
      processingTimeMs: performance.now() - startTime,
      modelUsed: "rule-based",
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
}
