# Phase 4: テスト作成 - クエリ分類器

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 4                            |
| タスクID     | CONV-07-01                   |
| Phase名      | テスト作成                   |
| 前提Phase    | Phase 3 (設計レビューゲート) |
| 次Phase      | Phase 5 (実装)               |
| 推定作業時間 | 3時間                        |
| ステータス   | 未着手                       |

---

## 目的

TDD（テスト駆動開発）のRed段階として、期待される動作を検証するテストを実装より先に作成する。全てのテストが失敗状態（Red）であることを確認する。

---

## テスト対象

| 対象               | ファイル                         |
| ------------------ | -------------------------------- |
| 型定義・スキーマ   | `types.ts`                       |
| ルールベース分類器 | `rule-based-query-classifier.ts` |
| LLMベース分類器    | `llm-query-classifier.ts`        |
| 検索重み取得       | 共通メソッド `getSearchWeights`  |

---

## ユニットテスト仕様

### 1. 型定義・スキーマテスト

```typescript
// packages/shared/src/services/search/__tests__/types.test.ts

describe("QueryType Schema", () => {
  it("有効なクエリタイプを受け入れる", () => {
    expect(queryTypeSchema.safeParse("local").success).toBe(true);
    expect(queryTypeSchema.safeParse("global").success).toBe(true);
    expect(queryTypeSchema.safeParse("relationship").success).toBe(true);
    expect(queryTypeSchema.safeParse("hybrid").success).toBe(true);
  });

  it("無効なクエリタイプを拒否する", () => {
    expect(queryTypeSchema.safeParse("invalid").success).toBe(false);
    expect(queryTypeSchema.safeParse("").success).toBe(false);
    expect(queryTypeSchema.safeParse(null).success).toBe(false);
  });
});

describe("SearchWeights Schema", () => {
  it("合計1.0の重みを受け入れる", () => {
    const weights = { keyword: 0.35, semantic: 0.35, graph: 0.3 };
    expect(searchWeightsSchema.safeParse(weights).success).toBe(true);
  });

  it("合計が1.0でない重みを拒否する", () => {
    const weights = { keyword: 0.5, semantic: 0.5, graph: 0.5 };
    expect(searchWeightsSchema.safeParse(weights).success).toBe(false);
  });

  it("範囲外の値を拒否する", () => {
    const weights = { keyword: -0.1, semantic: 0.6, graph: 0.5 };
    expect(searchWeightsSchema.safeParse(weights).success).toBe(false);
  });
});
```

### 2. ルールベース分類器テスト

```typescript
// packages/shared/src/services/search/__tests__/rule-based-query-classifier.test.ts

describe("RuleBasedQueryClassifier", () => {
  let classifier: RuleBasedQueryClassifier;

  beforeEach(() => {
    classifier = new RuleBasedQueryClassifier();
  });

  describe("classify", () => {
    describe("グローバルクエリの分類", () => {
      it.each([
        ["全体のテーマは？", "global"],
        ["概要を教えて", "global"],
        ["このドキュメントは何について書かれている？", "global"],
        ["主要な話題は何ですか？", "global"],
        ["要約してください", "global"],
        ["What is this document about?", "global"],
        ["Give me an overview", "global"],
        ["What is the main topic?", "global"],
      ])("'%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe(expectedType);
      });
    });

    describe("関係性クエリの分類", () => {
      it.each([
        ["ReactとVueの違いは？", "relationship"],
        ["TypeScriptとJavaScriptの関係は？", "relationship"],
        ["AがBに与える影響は？", "relationship"],
        ["なぜReactがVueより人気なのか？", "relationship"],
        ["Compare React and Vue", "relationship"],
        ["What is the relationship between A and B?", "relationship"],
        ["How does X affect Y?", "relationship"],
      ])("'%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe(expectedType);
      });

      it("関係性クエリからエンティティを抽出する", async () => {
        const result = await classifier.classify("ReactとVueの違いは？");
        expect(result.success).toBe(true);
        expect(result.data.extractedEntities).toContain("React");
        expect(result.data.extractedEntities).toContain("Vue");
      });

      it("関係のヒントを抽出する", async () => {
        const result = await classifier.classify("ReactとVueの違いは？");
        expect(result.success).toBe(true);
        expect(result.data.relationHint).toBe("comparison");
      });
    });

    describe("ローカルクエリの分類", () => {
      it.each([
        ["Reactとは何ですか？", "local"],
        ["TypeScriptの特徴は？", "local"],
        ["このAPIの使い方を教えて", "local"],
      ])("'%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe(expectedType);
      });
    });

    describe("キーワード抽出", () => {
      it("助詞を除去してキーワードを抽出する", async () => {
        const result = await classifier.classify("Reactのフックについて教えて");
        expect(result.success).toBe(true);
        expect(result.data.keywords).toContain("React");
        expect(result.data.keywords).toContain("フック");
        expect(result.data.keywords).not.toContain("の");
        expect(result.data.keywords).not.toContain("について");
      });
    });

    describe("信頼度", () => {
      it("分類結果に信頼度が含まれる", async () => {
        const result = await classifier.classify("全体のテーマは？");
        expect(result.success).toBe(true);
        expect(result.data.confidence).toBeGreaterThanOrEqual(0);
        expect(result.data.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("getSearchWeights", () => {
    it("localクエリに正しい重みを返す", () => {
      const weights = classifier.getSearchWeights("local");
      expect(weights.keyword).toBeCloseTo(0.35);
      expect(weights.semantic).toBeCloseTo(0.35);
      expect(weights.graph).toBeCloseTo(0.3);
    });

    it("globalクエリに正しい重みを返す", () => {
      const weights = classifier.getSearchWeights("global");
      expect(weights.keyword).toBeCloseTo(0.2);
      expect(weights.semantic).toBeCloseTo(0.3);
      expect(weights.graph).toBeCloseTo(0.5);
    });

    it("relationshipクエリに正しい重みを返す", () => {
      const weights = classifier.getSearchWeights("relationship");
      expect(weights.keyword).toBeCloseTo(0.2);
      expect(weights.semantic).toBeCloseTo(0.2);
      expect(weights.graph).toBeCloseTo(0.6);
    });

    it("hybridクエリに均等な重みを返す", () => {
      const weights = classifier.getSearchWeights("hybrid");
      expect(weights.keyword).toBeCloseTo(0.33);
      expect(weights.semantic).toBeCloseTo(0.33);
      expect(weights.graph).toBeCloseTo(0.34);
    });

    it("重みの合計が1.0になる", () => {
      const types: QueryType[] = ["local", "global", "relationship", "hybrid"];
      for (const type of types) {
        const weights = classifier.getSearchWeights(type);
        const sum = weights.keyword + weights.semantic + weights.graph;
        expect(sum).toBeCloseTo(1.0);
      }
    });
  });
});
```

### 3. LLMベース分類器テスト

```typescript
// packages/shared/src/services/search/__tests__/llm-query-classifier.test.ts

describe("LLMQueryClassifier", () => {
  let classifier: LLMQueryClassifier;
  let mockLLMProvider: jest.Mocked<ILLMProvider>;
  let fallbackClassifier: IQueryClassifier;

  beforeEach(() => {
    mockLLMProvider = {
      generate: vi.fn(),
      modelId: "test-model",
    };
    fallbackClassifier = new RuleBasedQueryClassifier();
    classifier = new LLMQueryClassifier(mockLLMProvider, fallbackClassifier);
  });

  describe("classify", () => {
    it("ローカルクエリを正しく分類する", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.9,
            extractedEntities: ["TypeScript"],
            keywords: ["TypeScript", "定義"],
            intent: "TypeScriptについての情報を求めている",
          }),
        },
      });

      const result = await classifier.classify("TypeScriptとは何ですか？");

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("local");
      expect(result.data.confidence).toBeGreaterThan(0.5);
    });

    it("グローバルクエリを正しく分類する", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "global",
            confidence: 0.85,
            extractedEntities: [],
            keywords: ["テーマ", "全体"],
            intent: "ドキュメント全体のテーマを把握したい",
          }),
        },
      });

      const result = await classifier.classify(
        "このドキュメント全体のテーマは何ですか？",
      );

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global");
    });

    it("関係性クエリを正しく分類しエンティティを抽出する", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "relationship",
            confidence: 0.9,
            extractedEntities: ["React", "Vue"],
            relationHint: "comparison",
            keywords: ["React", "Vue", "違い"],
            intent: "ReactとVueの違いを比較したい",
          }),
        },
      });

      const result = await classifier.classify("ReactとVueの違いは何ですか？");

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("relationship");
      expect(result.data.extractedEntities).toContain("React");
      expect(result.data.extractedEntities).toContain("Vue");
      expect(result.data.relationHint).toBe("comparison");
    });

    it("信頼度が閾値未満の場合はhybridにフォールバックする", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.3, // 閾値0.6未満
            extractedEntities: [],
            keywords: [],
            intent: "",
          }),
        },
      });

      const result = await classifier.classify("あいまいなクエリ", {
        minConfidence: 0.6,
      });

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("hybrid");
    });

    it("LLMエラー時にルールベースにフォールバックする", async () => {
      mockLLMProvider.generate.mockRejectedValue(new Error("API error"));

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global"); // ルールベースの結果
    });

    it("JSONパースエラー時にルールベースにフォールバックする", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: true,
        data: {
          text: "これはJSONではありません",
        },
      });

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global"); // ルールベースの結果
    });

    it("LLMレスポンスがエラーの場合にルールベースにフォールバックする", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: false,
        error: new Error("Rate limit exceeded"),
      });

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global"); // ルールベースの結果
    });
  });

  describe("オプション", () => {
    it("useLLM: falseの場合はルールベースを使用する", async () => {
      const result = await classifier.classify("全体のテーマは？", {
        useLLM: false,
      });

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global");
      expect(mockLLMProvider.generate).not.toHaveBeenCalled();
    });

    it("カスタムminConfidenceが適用される", async () => {
      mockLLMProvider.generate.mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.7,
            extractedEntities: [],
            keywords: [],
            intent: "",
          }),
        },
      });

      const result = await classifier.classify("クエリ", {
        minConfidence: 0.8, // 0.7 < 0.8なのでhybridになる
      });

      expect(result.success).toBe(true);
      expect(result.data.type).toBe("hybrid");
    });
  });

  describe("getSearchWeights", () => {
    it("ルールベース分類器と同じ重みを返す", () => {
      const ruleBasedClassifier = new RuleBasedQueryClassifier();

      const types: QueryType[] = ["local", "global", "relationship", "hybrid"];
      for (const type of types) {
        const llmWeights = classifier.getSearchWeights(type);
        const ruleWeights = ruleBasedClassifier.getSearchWeights(type);

        expect(llmWeights.keyword).toBeCloseTo(ruleWeights.keyword);
        expect(llmWeights.semantic).toBeCloseTo(ruleWeights.semantic);
        expect(llmWeights.graph).toBeCloseTo(ruleWeights.graph);
      }
    });
  });
});
```

---

## 統合テスト仕様

```typescript
// packages/shared/src/services/search/__tests__/query-classifier.integration.test.ts

describe("QueryClassifier Integration", () => {
  describe("分類→重み取得フロー", () => {
    it("分類結果に基づいて正しい重みを取得できる", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);

      const weights = classifier.getSearchWeights(result.data.type);
      expect(weights.graph).toBeGreaterThan(weights.keyword);
      expect(weights.graph).toBeGreaterThan(weights.semantic);
    });
  });

  describe("LLM→ルールベースフォールバック", () => {
    it("LLMエラー時にルールベースで分類を継続できる", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockRejectedValue(new Error("Network error")),
        modelId: "test-model",
      };
      const fallbackClassifier = new RuleBasedQueryClassifier();
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        fallbackClassifier,
      );

      // 複数のクエリで一貫してフォールバックが動作する
      const queries = [
        { query: "全体のテーマは？", expectedType: "global" },
        { query: "ReactとVueの違いは？", expectedType: "relationship" },
        { query: "TypeScriptとは？", expectedType: "local" },
      ];

      for (const { query, expectedType } of queries) {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe(expectedType);
      }
    });
  });
});
```

---

## カバレッジ目標

| 指標              | 目標値 |
| ----------------- | ------ |
| Line Coverage     | 80%+   |
| Branch Coverage   | 60%+   |
| Function Coverage | 80%+   |

---

## システム仕様（aiworkflow-requirements）

> テスト設計時に以下のシステム仕様を参照してください。

| 参照資料           | パス                                                                         | 確認内容           |
| ------------------ | ---------------------------------------------------------------------------- | ------------------ |
| 検索クエリ・結果型 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | テスト対象の型定義 |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | カバレッジ基準     |

---

## 成果物

| 成果物                   | 配置先                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------ |
| 型定義テスト             | `packages/shared/src/services/search/__tests__/types.test.ts`                        |
| ルールベース分類器テスト | `packages/shared/src/services/search/__tests__/rule-based-query-classifier.test.ts`  |
| LLMベース分類器テスト    | `packages/shared/src/services/search/__tests__/llm-query-classifier.test.ts`         |
| 統合テスト               | `packages/shared/src/services/search/__tests__/query-classifier.integration.test.ts` |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが定義されている
- [ ] すべてのテストが失敗状態（Red）である
- [ ] テストカバレッジ目標が設定されている
- [ ] テストファイルが所定のディレクトリに配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 5（実装）へ進み、テストを通す実装（Green）を行う。
