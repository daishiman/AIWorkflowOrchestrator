# クエリ分類器実装 - タスク指示書

## メタ情報

| 項目         | 内容                                  |
| ------------ | ------------------------------------- |
| タスクID     | CONV-07-01                            |
| タスク名     | クエリ分類器実装                      |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)       |
| 依存タスク   | CONV-03-05 (検索クエリ・結果スキーマ) |
| 規模         | 中                                    |
| 見積もり工数 | 1日                                   |
| ステータス   | 未実施                                |

---

## 1. 目的

検索クエリをローカル/グローバル/関係性の3タイプに分類し、最適な検索戦略を選択するためのクエリ分類器を実装する。HybridRAGの4段階パイプラインの第1段階。

---

## 2. 背景

### クエリタイプの重要性

HybridRAGではクエリタイプに応じて検索戦略を最適化する：

- **ローカルクエリ**: 特定のエンティティ・事実に関する質問 → Vector + Keyword重視
- **グローバルクエリ**: 全体のテーマ・傾向に関する質問 → コミュニティ検索重視
- **関係性クエリ**: エンティティ間の関係に関する質問 → グラフ検索重視

### ベンチマーク

VectorRAG単体ではグローバルクエリの正解率が0%だが、適切なクエリ分類+GraphRAGで80%+を達成。

---

## 3. 成果物

- `packages/shared/src/services/search/query-classifier.ts`
- `packages/shared/src/services/search/types.ts`
- `packages/shared/src/services/search/__tests__/query-classifier.test.ts`

---

## 4. 出力

```typescript
// packages/shared/src/services/search/types.ts
import { z } from "zod";

export const queryTypeSchema = z.enum([
  "local", // 特定エンティティ・事実
  "global", // 全体テーマ・傾向
  "relationship", // エンティティ間関係
  "hybrid", // 複合（不明な場合のデフォルト）
]);
export type QueryType = z.infer<typeof queryTypeSchema>;

export interface QueryClassification {
  type: QueryType;
  confidence: number;
  extractedEntities: string[];
  relationHint?: string;
  keywords: string[];
  intent: string;
}

export interface QueryClassificationOptions {
  /**
   * LLMを使用するか（falseの場合はルールベース）
   */
  useLLM?: boolean;

  /**
   * 最小信頼度（これ未満はhybridにフォールバック）
   */
  minConfidence?: number;

  /**
   * エンティティ抽出を行うか
   */
  extractEntities?: boolean;
}
```

---

## 5. 実装仕様

### 5.1 クエリ分類器インターフェース

```typescript
// packages/shared/src/services/search/query-classifier.ts
import type { Result } from "@/types/result";

export interface IQueryClassifier {
  /**
   * クエリを分類
   */
  classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>>;

  /**
   * クエリタイプに応じた検索重みを取得
   */
  getSearchWeights(type: QueryType): SearchWeights;
}

export interface SearchWeights {
  keyword: number; // 0-1
  semantic: number; // 0-1
  graph: number; // 0-1
}
```

### 5.2 LLMベースの分類器

```typescript
export class LLMQueryClassifier implements IQueryClassifier {
  private readonly defaultOptions: QueryClassificationOptions = {
    useLLM: true,
    minConfidence: 0.6,
    extractEntities: true,
  };

  constructor(private readonly llmProvider: ILLMProvider) {}

  async classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>> {
    const mergedOptions = { ...this.defaultOptions, ...options };

    try {
      const prompt = this.buildClassificationPrompt(query, mergedOptions);

      const response = await this.llmProvider.generate(prompt, {
        maxTokens: 500,
        temperature: 0.1,
        responseFormat: "json",
      });

      if (!response.success) {
        return err(response.error);
      }

      const parsed = this.parseResponse(response.data.text);
      if (!parsed.success) {
        // パース失敗時はルールベースにフォールバック
        return this.classifyWithRules(query);
      }

      // 信頼度が低い場合はhybridにフォールバック
      if (parsed.data.confidence < mergedOptions.minConfidence!) {
        return ok({
          ...parsed.data,
          type: "hybrid",
        });
      }

      return ok(parsed.data);
    } catch (error) {
      // エラー時はルールベースにフォールバック
      return this.classifyWithRules(query);
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

  private buildClassificationPrompt(
    query: string,
    options: QueryClassificationOptions,
  ): string {
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
  "relationHint": "関係性クエリの場合、関係のヒント（例: '比較', '原因'）",
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

  private classifyWithRules(query: string): Result<QueryClassification, Error> {
    const ruleBasedClassifier = new RuleBasedQueryClassifier();
    return ruleBasedClassifier.classify(query);
  }
}
```

### 5.3 ルールベースの分類器

```typescript
export class RuleBasedQueryClassifier implements IQueryClassifier {
  // グローバルクエリのパターン
  private readonly globalPatterns = [
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

  // 関係性クエリのパターン
  private readonly relationshipPatterns = [
    /(.+)と(.+)の関係/,
    /(.+)と(.+)の違い/,
    /(.+)と(.+)の比較/,
    /(.+)が(.+)に与える影響/,
    /なぜ(.+)が(.+)/,
    /(.+)はなぜ(.+)/,
    /(.+)と(.+)はどう関連/,
    /relationship between/i,
    /difference between/i,
    /compare (.+) (and|with) (.+)/i,
    /how does (.+) (affect|impact) (.+)/i,
  ];

  async classify(
    query: string,
    options?: QueryClassificationOptions,
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
    for (const pattern of this.relationshipPatterns) {
      const match = query.match(pattern);
      if (match) {
        const entities = match.slice(1).filter(Boolean);
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
    // LLMQueryClassifierと同じ実装
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
    // 助詞・助動詞を除去してキーワード抽出
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
    // 大文字で始まる単語や引用符内の単語をエンティティ候補として抽出
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

---

## 6. テストケース

```typescript
describe("LLMQueryClassifier", () => {
  it("ローカルクエリを正しく分類する", async () => {
    const classifier = new LLMQueryClassifier(mockLLMProvider);
    const result = await classifier.classify("TypeScriptとは何ですか？");

    expect(result.success).toBe(true);
    expect(result.data.type).toBe("local");
    expect(result.data.confidence).toBeGreaterThan(0.5);
  });

  it("グローバルクエリを正しく分類する", async () => {
    const classifier = new LLMQueryClassifier(mockLLMProvider);
    const result = await classifier.classify(
      "このドキュメント全体のテーマは何ですか？",
    );

    expect(result.success).toBe(true);
    expect(result.data.type).toBe("global");
  });

  it("関係性クエリを正しく分類する", async () => {
    const classifier = new LLMQueryClassifier(mockLLMProvider);
    const result = await classifier.classify("ReactとVueの違いは何ですか？");

    expect(result.success).toBe(true);
    expect(result.data.type).toBe("relationship");
    expect(result.data.extractedEntities).toContain("React");
    expect(result.data.extractedEntities).toContain("Vue");
  });

  it("LLMエラー時にルールベースにフォールバックする", async () => {
    const failingLLM = {
      generate: vi.fn().mockRejectedValue(new Error("API error")),
    };
    const classifier = new LLMQueryClassifier(failingLLM as any);
    const result = await classifier.classify("全体のテーマは？");

    expect(result.success).toBe(true);
    expect(result.data.type).toBe("global");
  });
});

describe("RuleBasedQueryClassifier", () => {
  it("グローバルパターンを検出する", async () => {
    const classifier = new RuleBasedQueryClassifier();

    const queries = [
      "全体のテーマは？",
      "概要を教えて",
      "What is this document about?",
    ];

    for (const query of queries) {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global");
    }
  });

  it("関係性パターンを検出する", async () => {
    const classifier = new RuleBasedQueryClassifier();

    const queries = ["TypeScriptとJavaScriptの違い", "Compare React and Vue"];

    for (const query of queries) {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe("relationship");
    }
  });
});

describe("getSearchWeights", () => {
  it("クエリタイプに応じた重みを返す", () => {
    const classifier = new LLMQueryClassifier(mockLLMProvider);

    const globalWeights = classifier.getSearchWeights("global");
    expect(globalWeights.graph).toBeGreaterThan(globalWeights.keyword);
    expect(globalWeights.graph).toBeGreaterThan(globalWeights.semantic);

    const relationshipWeights = classifier.getSearchWeights("relationship");
    expect(relationshipWeights.graph).toBeGreaterThan(0.5);

    const localWeights = classifier.getSearchWeights("local");
    expect(localWeights.keyword).toBeCloseTo(localWeights.semantic, 1);
  });
});
```

---

## 7. 完了条件

- [ ] `IQueryClassifier`インターフェースが定義済み
- [ ] `LLMQueryClassifier`が実装済み
- [ ] `RuleBasedQueryClassifier`が実装済み
- [ ] ローカルクエリの分類が動作する
- [ ] グローバルクエリの分類が動作する
- [ ] 関係性クエリの分類が動作する
- [ ] エンティティ抽出が動作する
- [ ] LLMエラー時のフォールバックが動作する
- [ ] クエリタイプに応じた検索重みが取得できる
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-07-02: キーワード検索戦略 (FTS5/BM25)

---

## 9. 参照情報

- CONV-03-05: 検索クエリ・結果スキーマ
- CONV-07: HybridRAG検索エンジン（親タスク）

---

## 10. クエリタイプ別検索最適化

| クエリタイプ     | 例                      | 主要検索源       | 重み (K:S:G)   |
| ---------------- | ----------------------- | ---------------- | -------------- |
| **local**        | 「Reactについて教えて」 | Vector + Keyword | 0.35:0.35:0.3  |
| **global**       | 「全体のテーマは？」    | Graph            | 0.2:0.3:0.5    |
| **relationship** | 「AとBの関係は？」      | Graph            | 0.2:0.2:0.6    |
| **hybrid**       | 不明・複合クエリ        | 均等             | 0.33:0.33:0.34 |
