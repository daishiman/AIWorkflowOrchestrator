# Phase 4 成果物: 統合テスト設計

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | CONV-07-06                      |
| フェーズ | Phase 4: テスト作成（TDD: Red） |
| 作成日   | 2026-01-16                      |
| 対象機能 | Corrective RAG (CRAG)           |

---

## 1. 統合テスト概要

### 1.1 統合テストの目的

| 目的                   | 説明                                      |
| ---------------------- | ----------------------------------------- |
| コンポーネント連携検証 | RelevanceEvaluator ↔ CorrectiveRAG の連携 |
| 外部API連携検証        | ILLMClient・IWebSearcher との連携         |
| データフロー検証       | FusedSearchResult[] → CRAGResult          |
| エラー伝播検証         | 各層でのエラーハンドリング                |

### 1.2 統合テスト範囲

```
┌─────────────────────────────────────────────────────────────────┐
│                    統合テスト範囲                                │
│                                                                 │
│  ┌──────────────┐    ┌────────────────┐    ┌──────────────┐    │
│  │ FusedSearch  │───▶│ CorrectiveRAG  │───▶│  CRAGResult  │    │
│  │   Result[]   │    │                │    │              │    │
│  └──────────────┘    └───────┬────────┘    └──────────────┘    │
│                              │                                  │
│                              ▼                                  │
│                    ┌─────────────────┐                         │
│                    │ RelevanceEval   │                         │
│                    │     uator       │                         │
│                    └────────┬────────┘                         │
│                             │                                   │
│              ┌──────────────┴──────────────┐                   │
│              ▼                              ▼                   │
│      ┌──────────────┐              ┌──────────────┐           │
│      │  ILLMClient  │              │ IWebSearcher │           │
│      │   (Mock)     │              │   (Mock)     │           │
│      └──────────────┘              └──────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 統合テストカテゴリ

### 2.1 LLM API接続テスト（crag.integration.test.ts）

| テストID | シナリオ                    | 検証内容                           |
| -------- | --------------------------- | ---------------------------------- |
| INT-001  | LLMプロンプト送信           | 正しいプロンプト形式が送信される   |
| INT-002  | LLMレスポンスパース         | JSONレスポンスが正しくパースされる |
| INT-003  | LLMタイムアウト             | 10秒タイムアウトが機能する         |
| INT-004  | LLM APIエラー伝播           | エラーが正しくResult.err()で伝播   |
| INT-005  | LLMレスポンスフォールバック | パース失敗時のデフォルト値適用     |

```typescript
// crag.integration.test.ts
describe("CRAG Integration - LLM連携", () => {
  describe("LLMプロンプト送信", () => {
    it("正しい形式のプロンプトをLLMに送信する (INT-001)", async () => {
      // Arrange
      const mockLLM = vi.fn().mockResolvedValue(ok("{}"));
      const evaluator = new RelevanceEvaluator({ complete: mockLLM });
      const results = createMockFusedResults(2);

      // Act
      await evaluator.evaluate("test query", results);

      // Assert
      expect(mockLLM).toHaveBeenCalledTimes(1);
      const promptArg = mockLLM.mock.calls[0][0];
      expect(promptArg.prompt).toContain("test query");
      expect(promptArg.prompt).toContain("relevance");
      expect(promptArg.temperature).toBe(0);
      expect(promptArg.maxTokens).toBeLessThanOrEqual(500);
    });
  });

  describe("LLMレスポンス処理", () => {
    it("JSONレスポンスを正しくパースする (INT-002)", async () => {
      // テスト実装
    });

    it("10秒でタイムアウトする (INT-003)", async () => {
      // テスト実装
    });

    it("LLM APIエラーをResult.err()で伝播する (INT-004)", async () => {
      // テスト実装
    });

    it("パース失敗時にデフォルト値を適用する (INT-005)", async () => {
      // テスト実装
    });
  });
});
```

### 2.2 データフローテスト（crag.flow.test.ts）

| テストID | シナリオ           | 検証内容                               |
| -------- | ------------------ | -------------------------------------- |
| FLOW-001 | 完全なデータフロー | 入力から出力まで正しくデータが流れる   |
| FLOW-002 | メタデータ保持     | FusedSearchResultのメタデータが保持    |
| FLOW-003 | スコア変換         | LLMスコア（0-10）→正規化スコア（0-1）  |
| FLOW-004 | 評価結果の反映     | evaluation情報がCRAGResultに正しく設定 |
| FLOW-005 | corrections記録    | 実行された補正アクションが記録される   |

```typescript
// crag.flow.test.ts
describe("CRAG Integration - データフロー", () => {
  describe("完全なデータフロー", () => {
    it("入力から出力まで正しくデータが流れる (FLOW-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        response: JSON.stringify({
          evaluations: [
            { score: 8, reason: "Good match" },
            { score: 7, reason: "Decent match" },
          ],
        }),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const crag = new CorrectiveRAG(evaluator, null, {});
      const inputResults = createMockFusedResults(2);

      // Act
      const output = await crag.process("test query", inputResults);

      // Assert
      expect(output.success).toBe(true);
      if (output.success) {
        expect(output.data.evaluation.relevanceScore).toBeGreaterThan(0.7);
        expect(output.data.evaluation.action).toBe("correct");
        expect(output.data.results).toHaveLength(2);
      }
    });
  });

  describe("メタデータ保持", () => {
    it("FusedSearchResultのメタデータが保持される (FLOW-002)", async () => {
      // テスト実装
    });
  });

  describe("スコア変換", () => {
    it("LLMスコア（0-10）を正規化スコア（0-1）に変換する (FLOW-003)", async () => {
      // テスト実装
    });
  });
});
```

### 2.3 エラーハンドリングテスト（crag.error.test.ts）

| テストID | シナリオ            | 検証内容                              |
| -------- | ------------------- | ------------------------------------- |
| ERR-001  | LLM API障害         | Result.err()で返却、例外をthrowしない |
| ERR-002  | Web検索API障害      | Result.err()で返却、Web検索をスキップ |
| ERR-003  | 不正なLLMレスポンス | フォールバック処理が機能する          |
| ERR-004  | 空クエリ            | バリデーションエラー                  |
| ERR-005  | ネットワークエラー  | タイムアウトとリトライ処理            |

```typescript
// crag.error.test.ts
describe("CRAG Integration - エラーハンドリング", () => {
  describe("LLM API障害", () => {
    it("LLM API障害時にResult.err()を返す（例外をthrowしない） (ERR-001)", async () => {
      // Arrange
      const mockLLM = createMockLLMClient({
        shouldFail: true,
        error: new Error("LLM service unavailable"),
      });
      const evaluator = new RelevanceEvaluator(mockLLM);
      const crag = new CorrectiveRAG(evaluator, null, {});
      const results = createMockFusedResults(2);

      // Act
      const output = await crag.process("query", results);

      // Assert
      expect(output.success).toBe(false);
      expect(() => output).not.toThrow();
    });
  });

  describe("Web検索API障害", () => {
    it("Web検索API障害時にResult.err()を返す (ERR-002)", async () => {
      // テスト実装
    });
  });

  describe("不正なLLMレスポンス", () => {
    it("不正なJSONでフォールバック処理が機能する (ERR-003)", async () => {
      // テスト実装
    });
  });
});
```

### 2.4 Web検索連携テスト（crag.web-search.test.ts）

| テストID | シナリオ                  | 検証内容                           |
| -------- | ------------------------- | ---------------------------------- |
| WEB-001  | incorrect時のWeb検索実行  | IWebSearcher.search()が呼ばれる    |
| WEB-002  | Web検索結果のフォーマット | augmentedContextが正しく構築される |
| WEB-003  | Web検索結果数制限         | webSearchLimitに従う               |
| WEB-004  | Web検索無効時             | IWebSearcher.search()が呼ばれない  |
| WEB-005  | Web検索エラー時           | エラーが伝播するか、フォールバック |

```typescript
// crag.web-search.test.ts
describe("CRAG Integration - Web検索連携", () => {
  describe("incorrect時のWeb検索", () => {
    it("incorrect判定時にWeb検索を実行する (WEB-001)", async () => {
      // Arrange
      const mockEvaluator = createMockEvaluator({
        action: "incorrect",
        overallScore: 0.1,
      });
      const mockWebSearcher = createMockWebSearcher({
        results: [
          {
            title: "Result 1",
            url: "https://example.com/1",
            snippet: "Snippet 1",
          },
        ],
      });
      const crag = new CorrectiveRAG(mockEvaluator, mockWebSearcher, {
        enableWebSearch: true,
      });
      const results = createMockFusedResults(2);

      // Act
      await crag.process("test query", results);

      // Assert
      expect(mockWebSearcher.search).toHaveBeenCalledTimes(1);
      expect(mockWebSearcher.search).toHaveBeenCalledWith(
        "test query",
        expect.any(Number),
      );
    });
  });

  describe("Web検索結果フォーマット", () => {
    it("augmentedContextが正しく構築される (WEB-002)", async () => {
      // テスト実装
    });
  });

  describe("Web検索結果数制限", () => {
    it("webSearchLimitに従って結果数を制限する (WEB-003)", async () => {
      // テスト実装
    });
  });

  describe("Web検索無効時", () => {
    it("enableWebSearch=falseでWeb検索が呼ばれない (WEB-004)", async () => {
      // テスト実装
    });
  });
});
```

---

## 3. テストデータフィクスチャ

### 3.1 LLMレスポンスフィクスチャ

```typescript
// fixtures/llm-responses.ts
export const LLM_RESPONSES = {
  HIGH_RELEVANCE: JSON.stringify({
    evaluations: [
      { score: 9, reason: "Directly answers the question" },
      { score: 8, reason: "Highly relevant content" },
      { score: 8, reason: "Good supporting information" },
    ],
  }),

  LOW_RELEVANCE: JSON.stringify({
    evaluations: [
      { score: 2, reason: "Off-topic content" },
      { score: 1, reason: "Completely irrelevant" },
    ],
  }),

  MIXED_RELEVANCE: JSON.stringify({
    evaluations: [
      { score: 8, reason: "Good match" },
      { score: 3, reason: "Weak connection" },
      { score: 5, reason: "Partial match" },
    ],
  }),

  INVALID_JSON: "This is not valid JSON",

  EMPTY_EVALUATIONS: JSON.stringify({ evaluations: [] }),
};
```

### 3.2 Web検索結果フィクスチャ

```typescript
// fixtures/web-search-results.ts
export const WEB_SEARCH_RESULTS = {
  STANDARD: [
    {
      title: "TypeScript Documentation",
      url: "https://www.typescriptlang.org/docs",
      snippet: "TypeScript is a typed superset of JavaScript...",
    },
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook",
      snippet: "The TypeScript Handbook is the definitive guide...",
    },
  ],

  EMPTY: [],

  LARGE_SET: Array(10)
    .fill(null)
    .map((_, i) => ({
      title: `Result ${i + 1}`,
      url: `https://example.com/${i + 1}`,
      snippet: `Snippet for result ${i + 1}`,
    })),
};
```

---

## 4. テスト実行順序

### 4.1 依存関係に基づく実行順序

```
1. ユニットテスト
   ├── relevance-evaluator.test.ts
   └── corrective-rag.test.ts

2. 統合テスト（依存関係順）
   ├── crag.integration.test.ts  (LLM連携)
   ├── crag.flow.test.ts         (データフロー)
   ├── crag.error.test.ts        (エラーハンドリング)
   └── crag.web-search.test.ts   (Web検索連携)
```

### 4.2 並列実行設定

```typescript
// vitest.config.ts に追加
export default defineConfig({
  test: {
    // 統合テストは直列実行（リソース競合防止）
    fileParallelism: false,
    // ユニットテストは並列実行
    poolOptions: {
      threads: {
        maxThreads: 5,
      },
    },
  },
});
```

---

## 5. モック境界の定義

### 5.1 モック対象

| 対象         | モック理由                      | モック方法 |
| ------------ | ------------------------------- | ---------- |
| ILLMClient   | 外部API、コスト、レスポンス時間 | vi.fn()    |
| IWebSearcher | 外部API、レート制限             | vi.fn()    |

### 5.2 モックしない対象

| 対象               | 理由                           |
| ------------------ | ------------------------------ |
| RelevanceEvaluator | 統合テストの対象               |
| CorrectiveRAG      | 統合テストの対象               |
| Result型           | シンプルなデータ型、モック不要 |
| 型定義             | ランタイムに影響しない         |

---

## 6. 完了確認

- [x] 統合テスト概要が定義されている
- [x] 統合テストカテゴリ（4種類）が設計されている
- [x] LLM連携テスト（INT-001〜INT-005）が設計されている
- [x] データフローテスト（FLOW-001〜FLOW-005）が設計されている
- [x] エラーハンドリングテスト（ERR-001〜ERR-005）が設計されている
- [x] Web検索連携テスト（WEB-001〜WEB-005）が設計されている
- [x] テストデータフィクスチャが定義されている
- [x] テスト実行順序が定義されている
- [x] モック境界が明確に定義されている
