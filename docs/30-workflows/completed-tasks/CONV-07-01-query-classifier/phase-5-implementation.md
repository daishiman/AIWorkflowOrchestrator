# Phase 5: 実装 - クエリ分類器

## メタ情報

| 項目         | 内容                 |
| ------------ | -------------------- |
| Phase        | 5                    |
| タスクID     | CONV-07-01           |
| Phase名      | 実装                 |
| 前提Phase    | Phase 4 (テスト作成) |
| 次Phase      | Phase 6 (テスト拡充) |
| 推定作業時間 | 4時間                |
| ステータス   | 未着手               |

---

## 目的

TDD（テスト駆動開発）のGreen段階として、Phase 4で作成したテストを全て通す最小限の実装を行う。

---

## 実装手順

### 1. 型定義の実装

```typescript
// packages/shared/src/services/search/types.ts

import { z } from "zod";

/**
 * クエリタイプ
 */
export const queryTypeSchema = z.enum([
  "local",
  "global",
  "relationship",
  "hybrid",
]);
export type QueryType = z.infer<typeof queryTypeSchema>;

/**
 * 検索重み（合計1.0制約付き）
 */
export const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine(
    (weights) => {
      const sum = weights.keyword + weights.semantic + weights.graph;
      return Math.abs(sum - 1.0) < 0.01;
    },
    { message: "検索重みの合計は1.0である必要があります" },
  );

export type SearchWeights = z.infer<typeof searchWeightsSchema>;

/**
 * クエリ分類結果
 */
export interface QueryClassification {
  type: QueryType;
  confidence: number;
  extractedEntities: string[];
  relationHint?: string;
  keywords: string[];
  intent: string;
}

/**
 * クエリ分類オプション
 */
export interface QueryClassificationOptions {
  useLLM?: boolean;
  minConfidence?: number;
  extractEntities?: boolean;
}

/**
 * デフォルトオプション
 */
export const DEFAULT_CLASSIFICATION_OPTIONS: Required<QueryClassificationOptions> =
  {
    useLLM: true,
    minConfidence: 0.6,
    extractEntities: true,
  };
```

### 2. インターフェースの実装

```typescript
// packages/shared/src/services/search/query-classifier.ts

import type { Result } from "@/types/result";
import type {
  QueryClassification,
  QueryClassificationOptions,
  QueryType,
  SearchWeights,
} from "./types";

/**
 * クエリ分類器インターフェース
 */
export interface IQueryClassifier {
  classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>>;

  getSearchWeights(type: QueryType): SearchWeights;
}
```

### 3. ルールベース分類器の実装

```typescript
// packages/shared/src/services/search/rule-based-query-classifier.ts

import { ok, type Result } from "@/types/result";
import type { IQueryClassifier } from "./query-classifier";
import type {
  QueryClassification,
  QueryClassificationOptions,
  QueryType,
  SearchWeights,
} from "./types";

/**
 * ルールベースのクエリ分類器
 */
export class RuleBasedQueryClassifier implements IQueryClassifier {
  private readonly globalPatterns: RegExp[] = [
    /全体(の|は)/,
    /概要/,
    /テーマ/,
    /主(な|要な)話題/,
    /何について/,
    /どんな内容/,
    /要約/,
    /まとめ/,
    /overview/i,
    /summary/i,
    /what is this (about|document)/i,
    /main (topic|theme)/i,
  ];

  private readonly relationshipPatterns: Array<{
    pattern: RegExp;
    extractEntities: boolean;
  }> = [
    { pattern: /(.+)と(.+)の関係/, extractEntities: true },
    { pattern: /(.+)と(.+)の違い/, extractEntities: true },
    { pattern: /(.+)と(.+)の比較/, extractEntities: true },
    { pattern: /(.+)が(.+)に与える影響/, extractEntities: true },
    { pattern: /なぜ(.+)が(.+)/, extractEntities: true },
    { pattern: /(.+)はなぜ(.+)/, extractEntities: true },
    { pattern: /(.+)と(.+)はどう関連/, extractEntities: true },
    { pattern: /relationship between/i, extractEntities: false },
    { pattern: /difference between/i, extractEntities: false },
    { pattern: /compare (.+) (and|with) (.+)/i, extractEntities: true },
    { pattern: /how does (.+) (affect|impact) (.+)/i, extractEntities: true },
  ];

  async classify(
    query: string,
    _options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>> {
    // グローバルパターンをチェック
    for (const pattern of this.globalPatterns) {
      if (pattern.test(query)) {
        return ok({
          type: "global",
          confidence: 0.8,
          extractedEntities: [],
          keywords: this.extractKeywords(query),
          intent: "全体的な概要や傾向についての質問",
        });
      }
    }

    // 関係性パターンをチェック
    for (const { pattern, extractEntities } of this.relationshipPatterns) {
      const match = query.match(pattern);
      if (match) {
        const entities = extractEntities
          ? match.slice(1).filter((m) => m && m.length > 1)
          : [];

        return ok({
          type: "relationship",
          confidence: 0.8,
          extractedEntities: entities,
          relationHint: this.detectRelationHint(query),
          keywords: this.extractKeywords(query),
          intent: "エンティティ間の関係についての質問",
        });
      }
    }

    // デフォルトはローカル
    return ok({
      type: "local",
      confidence: 0.7,
      extractedEntities: this.extractPotentialEntities(query),
      keywords: this.extractKeywords(query),
      intent: "特定の情報についての質問",
    });
  }

  getSearchWeights(type: QueryType): SearchWeights {
    switch (type) {
      case "global":
        return { keyword: 0.2, semantic: 0.3, graph: 0.5 };
      case "relationship":
        return { keyword: 0.2, semantic: 0.2, graph: 0.6 };
      case "local":
        return { keyword: 0.35, semantic: 0.35, graph: 0.3 };
      case "hybrid":
      default:
        return { keyword: 0.33, semantic: 0.33, graph: 0.34 };
    }
  }

  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      "は",
      "が",
      "を",
      "に",
      "の",
      "と",
      "で",
      "も",
      "や",
      "か",
      "て",
      "だ",
      "です",
      "ます",
      "する",
      "ある",
      "いる",
      "について",
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
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
      "can",
      "what",
      "how",
      "why",
    ]);

    return query
      .split(/[\s、,。.?！!？]+/)
      .filter((word) => word.length > 1 && !stopWords.has(word.toLowerCase()));
  }

  private extractPotentialEntities(query: string): string[] {
    const patterns = [
      /"([^"]+)"/g,
      /'([^']+)'/g,
      /「([^」]+)」/g,
      /『([^』]+)』/g,
      /\b([A-Z][a-zA-Z]+)\b/g,
    ];

    const entities = new Set<string>();

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        entities.add(match[1]);
      }
    }

    return Array.from(entities);
  }

  private detectRelationHint(query: string): string {
    if (/違い|difference|compare/i.test(query)) return "comparison";
    if (/関係|relationship|related/i.test(query)) return "relationship";
    if (/影響|affect|impact/i.test(query)) return "causation";
    if (/なぜ|why|reason/i.test(query)) return "reason";
    return "general";
  }
}
```

### 4. LLMベース分類器の実装

```typescript
// packages/shared/src/services/search/llm-query-classifier.ts

import { ok, err, type Result } from "@/types/result";
import type { ILLMProvider } from "@/services/llm/types";
import type { IQueryClassifier } from "./query-classifier";
import type {
  QueryClassification,
  QueryClassificationOptions,
  QueryType,
  SearchWeights,
} from "./types";
import { DEFAULT_CLASSIFICATION_OPTIONS } from "./types";

/**
 * LLMを使用したクエリ分類器
 */
export class LLMQueryClassifier implements IQueryClassifier {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackClassifier: IQueryClassifier,
  ) {}

  async classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>> {
    const mergedOptions = { ...DEFAULT_CLASSIFICATION_OPTIONS, ...options };

    // LLMを使用しない場合はフォールバック
    if (!mergedOptions.useLLM) {
      return this.fallbackClassifier.classify(query, options);
    }

    try {
      const prompt = this.buildClassificationPrompt(query);

      const response = await this.llmProvider.generate(prompt, {
        maxTokens: 500,
        temperature: 0.1,
        responseFormat: "json",
      });

      if (!response.success) {
        return this.fallbackClassifier.classify(query, options);
      }

      const parsed = this.parseResponse(response.data.text);
      if (!parsed.success) {
        return this.fallbackClassifier.classify(query, options);
      }

      // 信頼度が低い場合はhybridにフォールバック
      if (parsed.data.confidence < mergedOptions.minConfidence) {
        return ok({
          ...parsed.data,
          type: "hybrid",
        });
      }

      return ok(parsed.data);
    } catch (error) {
      return this.fallbackClassifier.classify(query, options);
    }
  }

  getSearchWeights(type: QueryType): SearchWeights {
    switch (type) {
      case "global":
        return { keyword: 0.2, semantic: 0.3, graph: 0.5 };
      case "relationship":
        return { keyword: 0.2, semantic: 0.2, graph: 0.6 };
      case "local":
        return { keyword: 0.35, semantic: 0.35, graph: 0.3 };
      case "hybrid":
      default:
        return { keyword: 0.33, semantic: 0.33, graph: 0.34 };
    }
  }

  private buildClassificationPrompt(query: string): string {
    return `以下の検索クエリを分類してください。

クエリタイプの定義:
- local: 特定のエンティティ、事実、定義に関する質問
  例: "TypeScriptとは？", "Reactの特徴は？", "このAPIの使い方は？"
- global: 全体のテーマ、傾向、概要に関する質問
  例: "全体のテーマは？", "主要な話題は何？", "何について書かれている？"
- relationship: エンティティ間の関係、比較、因果関係に関する質問
  例: "AとBの関係は？", "ReactとVueの違いは？", "なぜXがYを使うのか？"

クエリ:
"${query}"

JSON形式で出力してください:
{
  "type": "local | global | relationship",
  "confidence": 0.0-1.0の信頼度,
  "extractedEntities": ["抽出されたエンティティ名", ...],
  "relationHint": "関係性クエリの場合、関係のヒント（例: 'comparison', 'causation'）",
  "keywords": ["重要なキーワード", ...],
  "intent": "クエリの意図を1文で説明"
}`;
  }

  private parseResponse(
    responseText: string,
  ): Result<QueryClassification, Error> {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return err(new Error("No JSON found in response"));
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return ok({
        type: parsed.type ?? "hybrid",
        confidence: parsed.confidence ?? 0.5,
        extractedEntities: parsed.extractedEntities ?? [],
        relationHint: parsed.relationHint,
        keywords: parsed.keywords ?? [],
        intent: parsed.intent ?? "",
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Failed to parse response"),
      );
    }
  }
}
```

### 5. エクスポートの設定

```typescript
// packages/shared/src/services/search/index.ts

export * from "./types";
export * from "./query-classifier";
export { RuleBasedQueryClassifier } from "./rule-based-query-classifier";
export { LLMQueryClassifier } from "./llm-query-classifier";
```

---

## 実装チェックリスト

| ファイル                         | 実装項目                         |
| -------------------------------- | -------------------------------- |
| `types.ts`                       | 型定義、Zodスキーマ              |
| `query-classifier.ts`            | IQueryClassifierインターフェース |
| `rule-based-query-classifier.ts` | ルールベース分類器               |
| `llm-query-classifier.ts`        | LLMベース分類器                  |
| `index.ts`                       | エクスポート設定                 |

---

## システム仕様（aiworkflow-requirements）

> 実装時に以下のシステム仕様との整合性を確認してください。

| 参照資料            | パス                                                                         | 確認内容           |
| ------------------- | ---------------------------------------------------------------------------- | ------------------ |
| 検索クエリ・結果型  | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | 既存型との整合性   |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | ILLMProvider準拠   |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | Result型の使用方法 |

---

## 成果物

| 成果物             | 配置先                                                               |
| ------------------ | -------------------------------------------------------------------- |
| 型定義             | `packages/shared/src/services/search/types.ts`                       |
| インターフェース   | `packages/shared/src/services/search/query-classifier.ts`            |
| ルールベース分類器 | `packages/shared/src/services/search/rule-based-query-classifier.ts` |
| LLMベース分類器    | `packages/shared/src/services/search/llm-query-classifier.ts`        |
| エクスポート       | `packages/shared/src/services/search/index.ts`                       |

---

## 完了条件

- [ ] 全ての型定義が実装されている
- [ ] IQueryClassifierインターフェースが実装されている
- [ ] RuleBasedQueryClassifierが実装されている
- [ ] LLMQueryClassifierが実装されている
- [ ] Phase 4のテストが全てパスしている（Green）
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 6（テスト拡充）へ進み、カバレッジ目標達成に向けた追加テストを作成する。
