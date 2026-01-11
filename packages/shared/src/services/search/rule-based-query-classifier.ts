/**
 * @file ルールベースクエリ分類器
 * @description CONV-07-01: パターンマッチングによるクエリ分類
 */

import { ok } from "../../types/rag/result";
import type { Result } from "../../types/rag/result";
import {
  SEARCH_WEIGHTS,
  type IQueryClassifier,
  type QueryClassification,
  type QueryClassificationOptions,
  type QueryType,
  type SearchWeights,
} from "./types";

// =============================================================================
// Pattern Definitions
// =============================================================================

interface PatternDefinition {
  pattern: RegExp;
  type: QueryType;
  confidence: number;
  extractEntities?: (query: string, match: RegExpMatchArray) => string[];
  relationHint?: string;
}

/**
 * グローバルクエリパターン
 */
const GLOBAL_PATTERNS: PatternDefinition[] = [
  { pattern: /全体(の|は)/i, type: "global", confidence: 0.8 },
  { pattern: /概要/i, type: "global", confidence: 0.8 },
  { pattern: /テーマ/i, type: "global", confidence: 0.8 },
  { pattern: /主(な|要な)話題/i, type: "global", confidence: 0.8 },
  { pattern: /何について/i, type: "global", confidence: 0.75 },
  { pattern: /どんな内容/i, type: "global", confidence: 0.75 },
  { pattern: /要約/i, type: "global", confidence: 0.8 },
  { pattern: /まとめ/i, type: "global", confidence: 0.8 },
  { pattern: /書かれていますか/i, type: "global", confidence: 0.75 },
  { pattern: /overview/i, type: "global", confidence: 0.8 },
  { pattern: /summary/i, type: "global", confidence: 0.8 },
  { pattern: /summarize/i, type: "global", confidence: 0.8 },
  {
    pattern: /what is this (about|document)/i,
    type: "global",
    confidence: 0.8,
  },
  { pattern: /main (topic|theme)/i, type: "global", confidence: 0.8 },
  { pattern: /what are the main/i, type: "global", confidence: 0.75 },
];

/**
 * 関係性クエリパターン
 */
const RELATIONSHIP_PATTERNS: PatternDefinition[] = [
  {
    pattern: /(.+)と(.+)の関係/,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "association",
  },
  {
    pattern: /(.+)と(.+)の違い/,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "comparison",
  },
  {
    pattern: /(.+)と(.+)の比較/,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "comparison",
  },
  {
    pattern: /(.+)が(.+)に与える影響/,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "causation",
  },
  {
    pattern: /なぜ(.+)が(.+)/,
    type: "relationship",
    confidence: 0.75,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "causation",
  },
  {
    pattern: /(.+)と(.+)はどう関連/,
    type: "relationship",
    confidence: 0.8,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "association",
  },
  {
    pattern: /relationship between (.+) and (.+)/i,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "association",
  },
  {
    pattern: /difference between (.+) and (.+)/i,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[2]?.trim()].filter(Boolean) as string[],
    relationHint: "comparison",
  },
  {
    pattern: /compare (.+) (and|with) (.+)/i,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[3]?.trim()].filter(Boolean) as string[],
    relationHint: "comparison",
  },
  {
    pattern: /how does (.+) (affect|impact) (.+)/i,
    type: "relationship",
    confidence: 0.85,
    extractEntities: (_, match) =>
      [match[1]?.trim(), match[3]?.trim()].filter(Boolean) as string[],
    relationHint: "causation",
  },
];

// =============================================================================
// Stop Words
// =============================================================================

const JAPANESE_STOP_WORDS = new Set([
  "の",
  "は",
  "が",
  "を",
  "に",
  "へ",
  "と",
  "で",
  "から",
  "まで",
  "より",
  "について",
  "とは",
  "という",
  "ください",
  "教えて",
  "何",
  "どう",
  "なぜ",
  "です",
  "ます",
  "か",
  "？",
  "?",
]);

const ENGLISH_STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "of",
  "in",
  "to",
  "for",
  "with",
  "on",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "and",
  "but",
  "or",
  "nor",
  "so",
  "yet",
  "what",
  "how",
  "why",
  "when",
  "where",
  "who",
  "which",
  "that",
  "this",
  "these",
  "those",
  "it",
  "its",
  "me",
  "you",
  "we",
  "they",
  "them",
  "?",
]);

// =============================================================================
// Implementation
// =============================================================================

/**
 * ルールベースのクエリ分類器
 */
export class RuleBasedQueryClassifier implements IQueryClassifier {
  /**
   * クエリを分類
   */
  async classify(
    query: string,
    _options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>> {
    // グローバルパターンチェック
    for (const pattern of GLOBAL_PATTERNS) {
      const match = query.match(pattern.pattern);
      if (match) {
        return ok({
          type: pattern.type,
          confidence: pattern.confidence,
          extractedEntities: [],
          keywords: this.extractKeywords(query),
          intent: this.generateIntent(query, pattern.type),
        });
      }
    }

    // 関係性パターンチェック
    for (const pattern of RELATIONSHIP_PATTERNS) {
      const match = query.match(pattern.pattern);
      if (match) {
        const entities = pattern.extractEntities
          ? pattern.extractEntities(query, match)
          : [];
        return ok({
          type: pattern.type,
          confidence: pattern.confidence,
          extractedEntities: entities,
          relationHint: pattern.relationHint,
          keywords: this.extractKeywords(query),
          intent: this.generateIntent(query, pattern.type, entities),
        });
      }
    }

    // ローカルクエリ（デフォルト）
    const entities = this.extractEntitiesFromLocalQuery(query);
    return ok({
      type: "local",
      confidence: 0.5,
      extractedEntities: entities,
      keywords: this.extractKeywords(query),
      intent: this.generateIntent(query, "local", entities),
    });
  }

  /**
   * クエリタイプに応じた検索重みを取得
   */
  getSearchWeights(type: QueryType): SearchWeights {
    return SEARCH_WEIGHTS[type];
  }

  /**
   * キーワード抽出
   */
  private extractKeywords(query: string): string[] {
    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query);
    const stopWords = isJapanese ? JAPANESE_STOP_WORDS : ENGLISH_STOP_WORDS;

    // 単語分割（英語は大文字小文字を保持）
    const words = isJapanese
      ? this.tokenizeJapanese(query)
      : query.split(/\s+/);

    // ストップワード除去とフィルタリング
    return words
      .map((word) => word.replace(/^[?？!！。、,.]+|[?？!！。、,.]+$/g, "")) // 前後の句読点を除去
      .filter((word) => word.length > 1)
      .filter((word) => !stopWords.has(word.toLowerCase())); // 小文字で比較
  }

  /**
   * 日本語トークン化（簡易実装）
   */
  private tokenizeJapanese(text: string): string[] {
    // カタカナ・漢字の連続を1単語とする簡易トークナイザー
    const tokens: string[] = [];
    const patterns = [
      /[A-Za-z]+/g, // 英単語
      /[\u30A0-\u30FF]+/g, // カタカナ
      /[\u4E00-\u9FAF]+/g, // 漢字
      /[\u3040-\u309F]+/g, // ひらがな
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        tokens.push(...matches);
      }
    }

    return tokens;
  }

  /**
   * ローカルクエリからエンティティを抽出
   */
  private extractEntitiesFromLocalQuery(query: string): string[] {
    const entities: string[] = [];

    // 英語の固有名詞パターン（大文字で始まる単語）
    const englishEntities = query.match(
      /\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*/g,
    );
    if (englishEntities) {
      entities.push(...englishEntities);
    }

    // カタカナ語（技術用語に多い）
    const katakanaEntities = query.match(/[\u30A0-\u30FF]+/g);
    if (katakanaEntities) {
      entities.push(...katakanaEntities.filter((k) => k.length > 1));
    }

    return [...new Set(entities)];
  }

  /**
   * 意図の生成
   */
  private generateIntent(
    query: string,
    type: QueryType,
    entities?: string[],
  ): string {
    switch (type) {
      case "global":
        return "ドキュメント全体の概要・テーマを把握したい";
      case "relationship":
        if (entities && entities.length >= 2) {
          return `${entities[0]}と${entities[1]}の関係を理解したい`;
        }
        return "エンティティ間の関係を理解したい";
      case "local":
        if (entities && entities.length > 0) {
          return `${entities[0]}についての具体的な情報を求めている`;
        }
        return "特定のトピックについての情報を求めている";
      case "hybrid":
      default:
        return "複合的な情報を求めている";
    }
  }
}
