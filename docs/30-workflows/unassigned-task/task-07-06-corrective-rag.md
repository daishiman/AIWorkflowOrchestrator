# Corrective RAG (CRAG) - タスク指示書

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | CONV-07-06                          |
| タスク名     | Corrective RAG (CRAG)               |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)     |
| 依存タスク   | CONV-07-05 (RRF Fusion + Reranking) |
| 規模         | 中                                  |
| 見積もり工数 | 0.5日                               |
| ステータス   | 未実施                              |

---

## 1. 目的

Corrective RAG (CRAG) を実装し、検索結果の関連性を評価・補正する。低品質な検索結果を検出し、追加検索やWeb検索でコンテキストを補強する自己修正RAGパイプライン。

---

## 2. 成果物

- `packages/shared/src/services/search/crag/relevance-evaluator.ts`
- `packages/shared/src/services/search/crag/corrective-rag.ts`
- `packages/shared/src/services/search/crag/__tests__/crag.test.ts`

---

## 3. 入力

- リランキング済み検索結果
- 元のクエリ
- CRAG設定オプション

---

## 4. 出力

補正済みの検索結果

```typescript
export interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: "correct" | "incorrect" | "ambiguous";
    corrections: CorrectionAction[];
  };
  augmentedContext?: string;
}

export type CorrectionAction =
  | { type: "keep"; reason: string }
  | { type: "discard"; reason: string }
  | { type: "refine"; refinedQuery: string }
  | { type: "web_search"; searchQuery: string }
  | { type: "expand"; expansionStrategy: string };
```

---

## 5. 実装仕様

### 5.1 関連性評価器

```typescript
// packages/shared/src/services/search/crag/relevance-evaluator.ts
import type { FusedSearchResult } from "../fusion/rrf-fusion";
import { ok, err, type Result } from "@/types/result";

/**
 * 検索結果の関連性を評価
 * CRAG論文に基づく3段階評価: Correct / Incorrect / Ambiguous
 */
export class RelevanceEvaluator {
  constructor(
    private readonly llmClient: ILLMClient,
    private readonly options: EvaluatorOptions = {},
  ) {}

  /**
   * 検索結果全体の関連性を評価
   */
  async evaluate(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<RelevanceEvaluation, Error>> {
    if (results.length === 0) {
      return ok({
        overallScore: 0,
        action: "incorrect",
        individualScores: [],
        reasoning: "No search results found",
      });
    }

    try {
      // 各結果の関連性を評価
      const individualScores = await this.evaluateIndividual(query, results);
      if (!individualScores.success) {
        return err(individualScores.error);
      }

      // 全体スコアを計算
      const scores = individualScores.data;
      const overallScore = this.calculateOverallScore(scores);

      // アクションを決定
      const action = this.determineAction(overallScore, scores);

      return ok({
        overallScore,
        action,
        individualScores: scores,
        reasoning: this.generateReasoning(action, scores),
      });
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Evaluation failed"),
      );
    }
  }

  /**
   * 個別の検索結果を評価
   */
  private async evaluateIndividual(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<IndividualScore[], Error>> {
    // バッチ評価（効率化）
    const topK = Math.min(results.length, this.options.maxEvaluate ?? 5);
    const toEvaluate = results.slice(0, topK);

    const prompt = this.buildEvaluationPrompt(query, toEvaluate);

    const response = await this.llmClient.complete({
      prompt,
      maxTokens: 500,
      temperature: 0,
    });

    if (!response.success) {
      return err(response.error);
    }

    // レスポンスをパース
    const scores = this.parseEvaluationResponse(response.data, toEvaluate);
    return ok(scores);
  }

  /**
   * 評価用プロンプトを構築
   */
  private buildEvaluationPrompt(
    query: string,
    results: FusedSearchResult[],
  ): string {
    const documentsText = results
      .map(
        (r, i) =>
          `[Document ${i + 1}]\n${r.content.slice(0, 800)}${r.content.length > 800 ? "..." : ""}`,
      )
      .join("\n\n");

    return `You are evaluating the relevance of search results to a query.

Query: "${query}"

Documents:
${documentsText}

For each document, provide:
1. A relevance score (0-10, where 10 is highly relevant)
2. A brief reason

Return your evaluation in JSON format:
{
  "evaluations": [
    {"score": 8, "reason": "Directly addresses the query about X"},
    {"score": 3, "reason": "Only tangentially related"},
    ...
  ]
}`;
  }

  /**
   * 評価レスポンスをパース
   */
  private parseEvaluationResponse(
    response: string,
    results: FusedSearchResult[],
  ): IndividualScore[] {
    try {
      // JSON部分を抽出
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return results.map((r) => ({
          chunkId: r.chunkId,
          score: 0.5, // デフォルト
          reason: "Failed to parse evaluation",
        }));
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        evaluations: Array<{ score: number; reason: string }>;
      };

      return results.map((r, i) => ({
        chunkId: r.chunkId,
        score: (parsed.evaluations[i]?.score ?? 5) / 10,
        reason: parsed.evaluations[i]?.reason ?? "No reason provided",
      }));
    } catch {
      return results.map((r) => ({
        chunkId: r.chunkId,
        score: 0.5,
        reason: "Parse error",
      }));
    }
  }

  /**
   * 全体スコアを計算
   */
  private calculateOverallScore(scores: IndividualScore[]): number {
    if (scores.length === 0) return 0;

    // 上位結果に重みを付けた加重平均
    const weights = scores.map((_, i) => 1 / (i + 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const weightedSum = scores.reduce(
      (sum, s, i) => sum + s.score * weights[i],
      0,
    );

    return weightedSum / totalWeight;
  }

  /**
   * アクションを決定
   */
  private determineAction(
    overallScore: number,
    scores: IndividualScore[],
  ): "correct" | "incorrect" | "ambiguous" {
    const correctThreshold = this.options.correctThreshold ?? 0.7;
    const incorrectThreshold = this.options.incorrectThreshold ?? 0.3;

    if (overallScore >= correctThreshold) {
      return "correct";
    } else if (overallScore <= incorrectThreshold) {
      return "incorrect";
    } else {
      // Ambiguous: 結果間のばらつきも考慮
      const variance = this.calculateVariance(scores.map((s) => s.score));
      if (variance > 0.1) {
        return "ambiguous"; // ばらつきが大きい
      }
      return overallScore > 0.5 ? "correct" : "ambiguous";
    }
  }

  /**
   * 分散を計算
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * 推論理由を生成
   */
  private generateReasoning(
    action: "correct" | "incorrect" | "ambiguous",
    scores: IndividualScore[],
  ): string {
    const topScores = scores.slice(0, 3);
    const reasons = topScores.map((s) => s.reason).join("; ");

    switch (action) {
      case "correct":
        return `Results are relevant. ${reasons}`;
      case "incorrect":
        return `Results are not relevant. ${reasons}`;
      case "ambiguous":
        return `Results have mixed relevance. ${reasons}`;
    }
  }
}

export interface EvaluatorOptions {
  /**
   * 評価する最大結果数
   */
  maxEvaluate?: number;

  /**
   * "correct"判定の閾値
   */
  correctThreshold?: number;

  /**
   * "incorrect"判定の閾値
   */
  incorrectThreshold?: number;
}

export interface RelevanceEvaluation {
  overallScore: number;
  action: "correct" | "incorrect" | "ambiguous";
  individualScores: IndividualScore[];
  reasoning: string;
}

export interface IndividualScore {
  chunkId: ChunkId;
  score: number;
  reason: string;
}
```

### 5.2 Corrective RAG

```typescript
// packages/shared/src/services/search/crag/corrective-rag.ts
import type { FusedSearchResult } from "../fusion/rrf-fusion";
import type {
  RelevanceEvaluator,
  RelevanceEvaluation,
} from "./relevance-evaluator";
import { ok, err, type Result } from "@/types/result";

/**
 * Corrective RAG (CRAG) 実装
 *
 * 検索結果の品質に基づいて3つのアクションを実行:
 * 1. Correct: 結果をそのまま使用
 * 2. Incorrect: Web検索で補強または完全に置換
 * 3. Ambiguous: 内部知識と検索結果を組み合わせ、低品質結果をフィルタ
 */
export class CorrectiveRAG {
  constructor(
    private readonly evaluator: RelevanceEvaluator,
    private readonly webSearcher: IWebSearcher | null,
    private readonly options: CRAGOptions = {},
  ) {}

  /**
   * 検索結果を評価・補正
   */
  async process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>> {
    // 1. 関連性を評価
    const evaluation = await this.evaluator.evaluate(query, results);
    if (!evaluation.success) {
      return err(evaluation.error);
    }

    const eval = evaluation.data;

    // 2. アクションに基づいて処理
    switch (eval.action) {
      case "correct":
        return this.handleCorrect(query, results, eval);
      case "incorrect":
        return this.handleIncorrect(query, results, eval);
      case "ambiguous":
        return this.handleAmbiguous(query, results, eval);
    }
  }

  /**
   * Correct: 結果が十分に関連性がある
   */
  private async handleCorrect(
    query: string,
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<Result<CRAGResult, Error>> {
    // Knowledge Refinementを適用（オプション）
    const refinedResults = this.options.enableRefinement
      ? await this.refineKnowledge(results, evaluation)
      : results;

    return ok({
      results: refinedResults,
      evaluation: {
        relevanceScore: evaluation.overallScore,
        action: "correct",
        corrections: [{ type: "keep", reason: evaluation.reasoning }],
      },
    });
  }

  /**
   * Incorrect: 結果が関連性がない
   */
  private async handleIncorrect(
    query: string,
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<Result<CRAGResult, Error>> {
    const corrections: CorrectionAction[] = [
      { type: "discard", reason: evaluation.reasoning },
    ];

    // Web検索で補強
    if (this.webSearcher && this.options.enableWebSearch) {
      const webResults = await this.performWebSearch(query);
      if (webResults.success && webResults.data.length > 0) {
        corrections.push({
          type: "web_search",
          searchQuery: query,
        });

        return ok({
          results: [], // 元の結果は破棄
          evaluation: {
            relevanceScore: evaluation.overallScore,
            action: "incorrect",
            corrections,
          },
          augmentedContext: this.formatWebResults(webResults.data),
        });
      }
    }

    // Web検索なし、または失敗した場合は空の結果
    return ok({
      results: [],
      evaluation: {
        relevanceScore: evaluation.overallScore,
        action: "incorrect",
        corrections,
      },
    });
  }

  /**
   * Ambiguous: 結果の品質が混在
   */
  private async handleAmbiguous(
    query: string,
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<Result<CRAGResult, Error>> {
    const corrections: CorrectionAction[] = [];

    // 1. 低スコアの結果をフィルタ
    const threshold = this.options.ambiguousFilterThreshold ?? 0.4;
    const filteredResults: FusedSearchResult[] = [];
    const scoreMap = new Map(
      evaluation.individualScores.map((s) => [s.chunkId, s.score]),
    );

    for (const result of results) {
      const score = scoreMap.get(result.chunkId) ?? 0;
      if (score >= threshold) {
        filteredResults.push(result);
      } else {
        corrections.push({
          type: "discard",
          reason: `Low relevance score: ${score.toFixed(2)}`,
        });
      }
    }

    // 2. Knowledge Refinement
    const refinedResults = this.options.enableRefinement
      ? await this.refineKnowledge(filteredResults, evaluation)
      : filteredResults;

    // 3. 必要に応じてWeb検索で補強
    let augmentedContext: string | undefined;
    if (
      (this.webSearcher &&
        this.options.enableWebSearch &&
        refinedResults.length < this.options.minResultsBeforeWebSearch) ??
      3
    ) {
      const webResults = await this.performWebSearch(query);
      if (webResults.success && webResults.data.length > 0) {
        corrections.push({
          type: "web_search",
          searchQuery: query,
        });
        augmentedContext = this.formatWebResults(webResults.data);
      }
    }

    return ok({
      results: refinedResults,
      evaluation: {
        relevanceScore: evaluation.overallScore,
        action: "ambiguous",
        corrections,
      },
      augmentedContext,
    });
  }

  /**
   * Knowledge Refinement: 不要な情報を除去
   */
  private async refineKnowledge(
    results: FusedSearchResult[],
    evaluation: RelevanceEvaluation,
  ): Promise<FusedSearchResult[]> {
    // 基本的な実装: スコアに基づくフィルタリング
    // より高度な実装: LLMで関連部分のみを抽出
    return results;
  }

  /**
   * Web検索を実行
   */
  private async performWebSearch(
    query: string,
  ): Promise<Result<WebSearchResult[], Error>> {
    if (!this.webSearcher) {
      return err(new Error("Web searcher not configured"));
    }

    return this.webSearcher.search(query, this.options.webSearchLimit ?? 5);
  }

  /**
   * Web検索結果をフォーマット
   */
  private formatWebResults(results: WebSearchResult[]): string {
    return results
      .map(
        (r, i) =>
          `[Web Result ${i + 1}]\nTitle: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`,
      )
      .join("\n\n");
  }
}

export interface CRAGOptions {
  /**
   * Web検索を有効にするか
   */
  enableWebSearch?: boolean;

  /**
   * Knowledge Refinementを有効にするか
   */
  enableRefinement?: boolean;

  /**
   * Ambiguous時のフィルタ閾値
   */
  ambiguousFilterThreshold?: number;

  /**
   * Web検索前の最小結果数
   */
  minResultsBeforeWebSearch?: number;

  /**
   * Web検索の結果数上限
   */
  webSearchLimit?: number;
}

export interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: "correct" | "incorrect" | "ambiguous";
    corrections: CorrectionAction[];
  };
  augmentedContext?: string;
}

export type CorrectionAction =
  | { type: "keep"; reason: string }
  | { type: "discard"; reason: string }
  | { type: "refine"; refinedQuery: string }
  | { type: "web_search"; searchQuery: string }
  | { type: "expand"; expansionStrategy: string };

export interface IWebSearcher {
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}
```

---

## 6. テストケース

```typescript
describe("RelevanceEvaluator", () => {
  it("高関連性の結果を'correct'と評価する", async () => {
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(
        ok(
          JSON.stringify({
            evaluations: [
              { score: 9, reason: "Highly relevant" },
              { score: 8, reason: "Very relevant" },
            ],
          }),
        ),
      ),
    };
    const evaluator = new RelevanceEvaluator(mockLLM as any);
    const results = createMockFusedResults(2);

    const evaluation = await evaluator.evaluate("test query", results);

    expect(evaluation.success).toBe(true);
    expect(evaluation.data.action).toBe("correct");
    expect(evaluation.data.overallScore).toBeGreaterThan(0.7);
  });

  it("低関連性の結果を'incorrect'と評価する", async () => {
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(
        ok(
          JSON.stringify({
            evaluations: [
              { score: 2, reason: "Not relevant" },
              { score: 1, reason: "Completely unrelated" },
            ],
          }),
        ),
      ),
    };
    const evaluator = new RelevanceEvaluator(mockLLM as any);
    const results = createMockFusedResults(2);

    const evaluation = await evaluator.evaluate("test query", results);

    expect(evaluation.success).toBe(true);
    expect(evaluation.data.action).toBe("incorrect");
    expect(evaluation.data.overallScore).toBeLessThan(0.3);
  });

  it("混在した関連性を'ambiguous'と評価する", async () => {
    const mockLLM = {
      complete: vi.fn().mockResolvedValue(
        ok(
          JSON.stringify({
            evaluations: [
              { score: 8, reason: "Relevant" },
              { score: 3, reason: "Not very relevant" },
              { score: 5, reason: "Somewhat relevant" },
            ],
          }),
        ),
      ),
    };
    const evaluator = new RelevanceEvaluator(mockLLM as any);
    const results = createMockFusedResults(3);

    const evaluation = await evaluator.evaluate("test query", results);

    expect(evaluation.success).toBe(true);
    expect(evaluation.data.action).toBe("ambiguous");
  });

  it("空の結果を'incorrect'と評価する", async () => {
    const evaluator = new RelevanceEvaluator({} as any);

    const evaluation = await evaluator.evaluate("test query", []);

    expect(evaluation.success).toBe(true);
    expect(evaluation.data.action).toBe("incorrect");
    expect(evaluation.data.overallScore).toBe(0);
  });
});

describe("CorrectiveRAG", () => {
  describe("handleCorrect", () => {
    it("'correct'評価時に結果をそのまま返す", async () => {
      const mockEvaluator = {
        evaluate: vi.fn().mockResolvedValue(
          ok({
            overallScore: 0.85,
            action: "correct",
            individualScores: [],
            reasoning: "Relevant results",
          }),
        ),
      };
      const crag = new CorrectiveRAG(mockEvaluator as any, null);
      const results = createMockFusedResults(3);

      const cragResult = await crag.process("test query", results);

      expect(cragResult.success).toBe(true);
      expect(cragResult.data.results.length).toBe(3);
      expect(cragResult.data.evaluation.action).toBe("correct");
    });
  });

  describe("handleIncorrect", () => {
    it("'incorrect'評価時にWeb検索で補強する", async () => {
      const mockEvaluator = {
        evaluate: vi.fn().mockResolvedValue(
          ok({
            overallScore: 0.1,
            action: "incorrect",
            individualScores: [],
            reasoning: "Not relevant",
          }),
        ),
      };
      const mockWebSearcher = {
        search: vi.fn().mockResolvedValue(
          ok([
            {
              title: "Web Result",
              url: "https://example.com",
              snippet: "...",
            },
          ]),
        ),
      };
      const crag = new CorrectiveRAG(mockEvaluator as any, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(3);

      const cragResult = await crag.process("test query", results);

      expect(cragResult.success).toBe(true);
      expect(cragResult.data.results.length).toBe(0); // 元の結果は破棄
      expect(cragResult.data.augmentedContext).toBeDefined();
      expect(cragResult.data.evaluation.corrections).toContainEqual(
        expect.objectContaining({ type: "web_search" }),
      );
    });

    it("Web検索無効時は空の結果を返す", async () => {
      const mockEvaluator = {
        evaluate: vi.fn().mockResolvedValue(
          ok({
            overallScore: 0.1,
            action: "incorrect",
            individualScores: [],
            reasoning: "Not relevant",
          }),
        ),
      };
      const crag = new CorrectiveRAG(mockEvaluator as any, null);
      const results = createMockFusedResults(3);

      const cragResult = await crag.process("test query", results);

      expect(cragResult.success).toBe(true);
      expect(cragResult.data.results.length).toBe(0);
      expect(cragResult.data.augmentedContext).toBeUndefined();
    });
  });

  describe("handleAmbiguous", () => {
    it("'ambiguous'評価時に低スコア結果をフィルタする", async () => {
      const mockEvaluator = {
        evaluate: vi.fn().mockResolvedValue(
          ok({
            overallScore: 0.5,
            action: "ambiguous",
            individualScores: [
              { chunkId: "chunk-0", score: 0.8, reason: "Good" },
              { chunkId: "chunk-1", score: 0.2, reason: "Poor" },
              { chunkId: "chunk-2", score: 0.6, reason: "OK" },
            ],
            reasoning: "Mixed results",
          }),
        ),
      };
      const crag = new CorrectiveRAG(mockEvaluator as any, null, {
        ambiguousFilterThreshold: 0.4,
      });
      const results = [
        { ...createMockFusedResults(1)[0], chunkId: "chunk-0" as ChunkId },
        { ...createMockFusedResults(1)[0], chunkId: "chunk-1" as ChunkId },
        { ...createMockFusedResults(1)[0], chunkId: "chunk-2" as ChunkId },
      ];

      const cragResult = await crag.process("test query", results);

      expect(cragResult.success).toBe(true);
      // chunk-1はフィルタされる
      expect(cragResult.data.results.length).toBe(2);
      expect(
        cragResult.data.results.find((r) => r.chunkId === "chunk-1"),
      ).toBeUndefined();
    });
  });
});
```

---

## 7. 完了条件

- [ ] `RelevanceEvaluator`クラスが実装済み
- [ ] LLMベースの関連性評価が動作する
- [ ] 3段階評価（correct/incorrect/ambiguous）が正しく判定される
- [ ] `CorrectiveRAG`クラスが実装済み
- [ ] correct時の処理が動作する
- [ ] incorrect時のWeb検索補強が動作する
- [ ] ambiguous時のフィルタリングが動作する
- [ ] Knowledge Refinementが動作する（オプション）
- [ ] エラーハンドリングが動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-07-07: HybridRAG統合

---

## 9. 参照情報

- CONV-07-05: RRF Fusion + Reranking（入力元）
- [CRAG Paper](https://arxiv.org/abs/2401.15884)
- [Self-RAG Paper](https://arxiv.org/abs/2310.11511)

---

## 10. CRAGアクション決定フロー

```
検索結果
    ↓
関連性評価 (LLM)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│ overall > 0.7   │ 0.3 < overall   │ overall < 0.3   │
│                 │     < 0.7       │                 │
│   CORRECT       │   AMBIGUOUS     │   INCORRECT     │
│                 │                 │                 │
│ そのまま使用    │ フィルタ +      │ 破棄 +          │
│ (オプション:    │ Knowledge       │ Web検索で       │
│  Refinement)    │ Refinement +    │ 補強            │
│                 │ (オプション:    │                 │
│                 │  Web補強)       │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 11. 関連性評価の閾値

| 閾値設定            | デフォルト | 説明                          |
| ------------------- | ---------- | ----------------------------- |
| correctThreshold    | 0.7        | これ以上で"correct"判定       |
| incorrectThreshold  | 0.3        | これ以下で"incorrect"判定     |
| ambiguousFilter     | 0.4        | ambiguous時の結果フィルタ閾値 |
| minResultsBeforeWeb | 3          | Web検索を行う前の最小結果数   |
