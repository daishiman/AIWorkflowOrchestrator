# Phase 4 成果物: テストケース一覧

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | CONV-07-06                      |
| フェーズ | Phase 4: テスト作成（TDD: Red） |
| 作成日   | 2026-01-16                      |
| 対象機能 | Corrective RAG (CRAG)           |

---

## 1. RelevanceEvaluator テストケース

### 1.1 evaluate() メソッド

#### RE-001: 高関連性結果を"correct"と評価する

```typescript
describe("RelevanceEvaluator", () => {
  describe("evaluate", () => {
    it("高関連性の結果を'correct'と評価する (RE-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [
            { score: 9, reason: "Highly relevant" },
            { score: 8, reason: "Very relevant" },
          ],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(2, { min: 0.8, max: 0.9 });

      // Act
      const evaluation = await evaluator.evaluate("test query", results);

      // Assert
      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe("correct");
        expect(evaluation.data.overallScore).toBeGreaterThanOrEqual(0.7);
      }
    });
  });
});
```

#### RE-002: 低関連性結果を"incorrect"と評価する

```typescript
it("低関連性の結果を'incorrect'と評価する (RE-002)", async () => {
  // Arrange
  const mockLLM = createMockLLMClient({
    response: JSON.stringify({
      evaluations: [
        { score: 2, reason: "Not relevant" },
        { score: 1, reason: "Completely irrelevant" },
      ],
    }),
  });
  const evaluator = new RelevanceEvaluator(mockLLM);
  const results = createMockFusedResults(2, { min: 0.1, max: 0.2 });

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(true);
  if (evaluation.success) {
    expect(evaluation.data.action).toBe("incorrect");
    expect(evaluation.data.overallScore).toBeLessThanOrEqual(0.3);
  }
});
```

#### RE-003: 混在関連性を"ambiguous"と評価する

```typescript
it("混在した関連性を'ambiguous'と評価する (RE-003)", async () => {
  // Arrange
  const mockLLM = createMockLLMClient({
    response: JSON.stringify({
      evaluations: [
        { score: 8, reason: "Very relevant" },
        { score: 3, reason: "Somewhat relevant" },
        { score: 5, reason: "Partially relevant" },
      ],
    }),
  });
  const evaluator = new RelevanceEvaluator(mockLLM);
  const results = createMockFusedResults(3, { min: 0.3, max: 0.8 });

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(true);
  if (evaluation.success) {
    expect(evaluation.data.action).toBe("ambiguous");
    expect(evaluation.data.overallScore).toBeGreaterThan(0.3);
    expect(evaluation.data.overallScore).toBeLessThan(0.7);
  }
});
```

#### RE-004: 空の結果を"incorrect"と評価する

```typescript
it("空の結果を'incorrect'と評価する (RE-004)", async () => {
  // Arrange
  const mockLLM = createMockLLMClient({});
  const evaluator = new RelevanceEvaluator(mockLLM);
  const results: FusedSearchResult[] = [];

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(true);
  if (evaluation.success) {
    expect(evaluation.data.action).toBe("incorrect");
    expect(evaluation.data.overallScore).toBe(0);
    expect(evaluation.data.individualScores).toHaveLength(0);
  }
});
```

#### RE-005: LLM API失敗時にResult.err()を返す

```typescript
it("LLM API失敗時にResult.err()を返す (RE-005)", async () => {
  // Arrange
  const mockLLM = createMockLLMClient({
    shouldFail: true,
    error: new Error("LLM API timeout"),
  });
  const evaluator = new RelevanceEvaluator(mockLLM);
  const results = createMockFusedResults(2);

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(false);
  if (!evaluation.success) {
    expect(evaluation.error.message).toContain("LLM API");
  }
});
```

#### RE-006: 個別スコアを正しく計算する

```typescript
it("個別スコアを正しく計算する (RE-006)", async () => {
  // Arrange
  const mockLLM = createMockLLMClient({
    response: JSON.stringify({
      evaluations: [
        { score: 8, reason: "Good match" },
        { score: 6, reason: "Partial match" },
        { score: 4, reason: "Weak match" },
      ],
    }),
  });
  const evaluator = new RelevanceEvaluator(mockLLM);
  const results = createMockFusedResults(3);

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(true);
  if (evaluation.success) {
    expect(evaluation.data.individualScores).toHaveLength(3);
    expect(evaluation.data.individualScores[0].score).toBeCloseTo(0.8, 1);
    expect(evaluation.data.individualScores[1].score).toBeCloseTo(0.6, 1);
    expect(evaluation.data.individualScores[2].score).toBeCloseTo(0.4, 1);
    evaluation.data.individualScores.forEach((s) => {
      expect(s.reason).toBeDefined();
      expect(s.chunkId).toBeDefined();
    });
  }
});
```

#### RE-007: 全体スコアを加重平均で計算する

```typescript
it("全体スコアを加重平均で計算する (RE-007)", async () => {
  // Arrange: weights = [1/1, 1/2, 1/3] = [1, 0.5, 0.333]
  // scores = [0.9, 0.8, 0.7]
  // weighted = (0.9*1 + 0.8*0.5 + 0.7*0.333) / (1 + 0.5 + 0.333)
  //          = (0.9 + 0.4 + 0.233) / 1.833 ≈ 0.837
  const mockLLM = createMockLLMClient({
    response: JSON.stringify({
      evaluations: [
        { score: 9, reason: "Excellent" },
        { score: 8, reason: "Very good" },
        { score: 7, reason: "Good" },
      ],
    }),
  });
  const evaluator = new RelevanceEvaluator(mockLLM);
  const results = createMockFusedResults(3);

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(true);
  if (evaluation.success) {
    // 加重平均: (0.9*1 + 0.8*0.5 + 0.7*0.333) / (1 + 0.5 + 0.333) ≈ 0.837
    expect(evaluation.data.overallScore).toBeGreaterThan(0.8);
    expect(evaluation.data.overallScore).toBeLessThan(0.9);
  }
});
```

#### RE-008: カスタム閾値で評価する

```typescript
it("カスタム閾値で評価する (RE-008)", async () => {
  // Arrange: スコア0.75でデフォルトならcorrect、0.8閾値ならambiguous
  const mockLLM = createMockLLMClient({
    response: JSON.stringify({
      evaluations: [{ score: 7.5, reason: "Good" }],
    }),
  });
  const evaluator = new RelevanceEvaluator(mockLLM, {
    correctThreshold: 0.8, // 0.7から0.8に引き上げ
    incorrectThreshold: 0.3,
  });
  const results = createMockFusedResults(1);

  // Act
  const evaluation = await evaluator.evaluate("test query", results);

  // Assert
  expect(evaluation.success).toBe(true);
  if (evaluation.success) {
    expect(evaluation.data.overallScore).toBeCloseTo(0.75, 1);
    expect(evaluation.data.action).toBe("ambiguous"); // 0.8未満なのでambiguous
  }
});
```

---

## 2. CorrectiveRAG テストケース

### 2.1 process() メソッド

#### CR-001: correct判定時に結果をそのまま返す

```typescript
describe("CorrectiveRAG", () => {
  describe("process", () => {
    it("'correct'評価時に結果をそのまま返す (CR-001)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "correct",
        overallScore: 0.85,
      });
      const crag = new CorrectiveRAG(mockEvaluator, null, {
        enableWebSearch: false,
      });
      const results = createMockFusedResults(3);

      // Act
      const processed = await crag.process("test query", results);

      // Assert
      expect(processed.success).toBe(true);
      if (processed.success) {
        expect(processed.data.evaluation.action).toBe("correct");
        expect(processed.data.results).toHaveLength(3);
        expect(processed.data.results).toEqual(results);
        expect(processed.data.augmentedContext).toBeUndefined();
      }
    });
  });
});
```

#### CR-002: incorrect判定+Web検索有効でaugmentedContextを設定

```typescript
it("'incorrect'評価時にWeb検索で補強する (CR-002)", async () => {
  // Arrange
  const mockEvaluator = createMockEvaluator({
    action: "incorrect",
    overallScore: 0.15,
  });
  const mockWebSearcher = createMockWebSearcher({
    results: [
      {
        title: "Web Result 1",
        url: "https://example.com/1",
        snippet: "Snippet 1",
      },
      {
        title: "Web Result 2",
        url: "https://example.com/2",
        snippet: "Snippet 2",
      },
    ],
  });
  const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
    enableWebSearch: true,
  });
  const results = createMockFusedResults(2);

  // Act
  const processed = await crag.process("test query", results);

  // Assert
  expect(processed.success).toBe(true);
  if (processed.success) {
    expect(processed.data.evaluation.action).toBe("incorrect");
    expect(processed.data.results).toHaveLength(0);
    expect(processed.data.augmentedContext).toBeDefined();
    expect(processed.data.augmentedContext).toContain("Web Result 1");
  }
});
```

#### CR-003: incorrect判定+Web検索無効で空結果を返す

```typescript
it("'incorrect'評価時（Web検索無効）に空の結果を返す (CR-003)", async () => {
  // Arrange
  const mockEvaluator = createMockEvaluator({
    action: "incorrect",
    overallScore: 0.1,
  });
  const crag = new CorrectiveRAG(mockEvaluator, null, {
    enableWebSearch: false,
  });
  const results = createMockFusedResults(2);

  // Act
  const processed = await crag.process("test query", results);

  // Assert
  expect(processed.success).toBe(true);
  if (processed.success) {
    expect(processed.data.evaluation.action).toBe("incorrect");
    expect(processed.data.results).toHaveLength(0);
    expect(processed.data.augmentedContext).toBeUndefined();
  }
});
```

#### CR-004: ambiguous判定時に低スコア結果をフィルタする

```typescript
it("'ambiguous'評価時に低スコア結果をフィルタする (CR-004)", async () => {
  // Arrange
  const mockEvaluator = createMockEvaluator({
    action: "ambiguous",
    overallScore: 0.5,
    individualScores: [
      { chunkId: "chunk-0" as ChunkId, score: 0.6, reason: "Good" },
      { chunkId: "chunk-1" as ChunkId, score: 0.3, reason: "Weak" }, // フィルタ対象
      { chunkId: "chunk-2" as ChunkId, score: 0.5, reason: "OK" },
    ],
  });
  const crag = new CorrectiveRAG(mockEvaluator, null, {
    ambiguousFilterThreshold: 0.4, // 0.4未満をフィルタ
  });
  const results = createMockFusedResults(3);

  // Act
  const processed = await crag.process("test query", results);

  // Assert
  expect(processed.success).toBe(true);
  if (processed.success) {
    expect(processed.data.evaluation.action).toBe("ambiguous");
    expect(processed.data.results).toHaveLength(2); // 0.3のものがフィルタされる
  }
});
```

#### CR-005: ambiguous判定+結果不足時にWeb検索で補強

```typescript
it("'ambiguous'評価時に結果不足でWeb検索で補強する (CR-005)", async () => {
  // Arrange
  const mockEvaluator = createMockEvaluator({
    action: "ambiguous",
    overallScore: 0.5,
    individualScores: [
      { chunkId: "chunk-0" as ChunkId, score: 0.5, reason: "OK" },
    ],
  });
  const mockWebSearcher = createMockWebSearcher({
    results: [
      { title: "Web Result", url: "https://example.com", snippet: "Snippet" },
    ],
  });
  const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
    enableWebSearch: true,
    minResultsBeforeWebSearch: 3, // 3件未満でWeb検索
  });
  const results = createMockFusedResults(1);

  // Act
  const processed = await crag.process("test query", results);

  // Assert
  expect(processed.success).toBe(true);
  if (processed.success) {
    expect(processed.data.augmentedContext).toBeDefined();
  }
});
```

#### CR-006: Knowledge Refinement有効時に不要情報を除去

```typescript
it("Knowledge Refinement有効時に不要情報を除去する (CR-006)", async () => {
  // Arrange
  const mockEvaluator = createMockEvaluator({
    action: "correct",
    overallScore: 0.8,
  });
  const crag = new CorrectiveRAG(mockEvaluator, null, {
    enableRefinement: true,
  });
  const results = createMockFusedResults(3);

  // Act
  const processed = await crag.process("test query", results);

  // Assert
  expect(processed.success).toBe(true);
  if (processed.success) {
    // refinementが実行された場合、correctionsにrefineアクションが含まれる
    const hasRefineAction = processed.data.evaluation.corrections.some(
      (c) => c.type === "refine",
    );
    expect(hasRefineAction).toBe(true);
  }
});
```

#### CR-007: 評価エラー時にResult.err()を返す

```typescript
it("評価エラー時にResult.err()を返す (CR-007)", async () => {
  // Arrange
  const mockEvaluator = createMockEvaluator({
    shouldFail: true,
    error: new Error("Evaluation failed"),
  });
  const crag = new CorrectiveRAG(mockEvaluator, null, {});
  const results = createMockFusedResults(2);

  // Act
  const processed = await crag.process("test query", results);

  // Assert
  expect(processed.success).toBe(false);
  if (!processed.success) {
    expect(processed.error.message).toContain("Evaluation failed");
  }
});
```

---

## 3. 境界値テストケース

### 3.1 スコア境界テスト

```typescript
describe("境界値テスト", () => {
  describe("スコア閾値", () => {
    it.each([
      [0.69, "ambiguous"],
      [0.7, "correct"],
      [0.71, "correct"],
    ])("スコア%pで%sと判定する（correct閾値）", async (score, expected) => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: score * 10, reason: "Test" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(1);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe(expected);
      }
    });

    it.each([
      [0.29, "incorrect"],
      [0.3, "incorrect"],
      [0.31, "ambiguous"],
    ])("スコア%pで%sと判定する（incorrect閾値）", async (score, expected) => {
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [{ score: score * 10, reason: "Test" }],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const results = createMockFusedResults(1);

      const evaluation = await evaluator.evaluate("query", results);

      expect(evaluation.success).toBe(true);
      if (evaluation.success) {
        expect(evaluation.data.action).toBe(expected);
      }
    });
  });
});
```

### 3.2 配列サイズ境界テスト

```typescript
describe("配列サイズ境界", () => {
  it("単一要素を正しく処理する", async () => {
    const mockLLM = createMockLLMClient({
      response: JSON.stringify({
        evaluations: [{ score: 8, reason: "Good" }],
      }),
    });
    const evaluator = new RelevanceEvaluator(mockLLM);
    const results = createMockFusedResults(1);

    const evaluation = await evaluator.evaluate("query", results);

    expect(evaluation.success).toBe(true);
    if (evaluation.success) {
      expect(evaluation.data.individualScores).toHaveLength(1);
    }
  });

  it("最大評価数（5件）まで評価する", async () => {
    const mockLLM = createMockLLMClient({
      response: JSON.stringify({
        evaluations: Array(5)
          .fill(null)
          .map(() => ({ score: 7, reason: "Good" })),
      }),
    });
    const evaluator = new RelevanceEvaluator(mockLLM, { maxEvaluate: 5 });
    const results = createMockFusedResults(5);

    const evaluation = await evaluator.evaluate("query", results);

    expect(evaluation.success).toBe(true);
    if (evaluation.success) {
      expect(evaluation.data.individualScores).toHaveLength(5);
    }
  });

  it("最大評価数を超える場合は上位のみ評価する", async () => {
    const mockLLM = createMockLLMClient({
      response: JSON.stringify({
        evaluations: Array(5)
          .fill(null)
          .map(() => ({ score: 7, reason: "Good" })),
      }),
    });
    const evaluator = new RelevanceEvaluator(mockLLM, { maxEvaluate: 5 });
    const results = createMockFusedResults(10); // 10件だが5件のみ評価

    const evaluation = await evaluator.evaluate("query", results);

    expect(evaluation.success).toBe(true);
    if (evaluation.success) {
      expect(evaluation.data.individualScores).toHaveLength(5);
    }
  });
});
```

---

## 4. 完了確認

- [x] RE-001〜RE-008のテストケースが定義されている
- [x] CR-001〜CR-007のテストケースが定義されている
- [x] 境界値テストケースが定義されている
- [x] 各テストケースにArrange-Act-Assertパターンが適用されている
- [x] モック設定が明確に定義されている
