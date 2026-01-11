# Phase 6: テスト拡充 - クエリ分類器

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 6                              |
| タスクID     | CONV-07-01                     |
| Phase名      | テスト拡充                     |
| 前提Phase    | Phase 5 (実装)                 |
| 次Phase      | Phase 7 (テストカバレッジ確認) |
| 推定作業時間 | 2時間                          |
| ステータス   | 未着手                         |

---

## 目的

Phase 5の実装完了後、カバレッジ目標達成に向けてテストを拡充する。統合テストの拡充により、フロントエンド・バックエンド接続を含むシステム全体の動作を検証する。

---

## カバレッジ目標

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |

---

## 追加ユニットテスト

### 1. 境界値テスト

```typescript
describe("境界値テスト", () => {
  describe("クエリ長", () => {
    it("1文字のクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("あ");
      expect(result.success).toBe(true);
    });

    it("1000文字のクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const longQuery = "あ".repeat(1000);
      const result = await classifier.classify(longQuery);
      expect(result.success).toBe(true);
    });
  });

  describe("信頼度境界", () => {
    it("信頼度0.6の場合はhybridにフォールバックしない", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.6, // 閾値と同じ
              extractedEntities: [],
              keywords: [],
              intent: "",
            }),
          },
        }),
        modelId: "test-model",
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ", {
        minConfidence: 0.6,
      });
      expect(result.data.type).toBe("local");
    });

    it("信頼度0.59の場合はhybridにフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.59, // 閾値未満
              extractedEntities: [],
              keywords: [],
              intent: "",
            }),
          },
        }),
        modelId: "test-model",
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ", {
        minConfidence: 0.6,
      });
      expect(result.data.type).toBe("hybrid");
    });
  });
});
```

### 2. 異常系テスト

```typescript
describe("異常系テスト", () => {
  describe("LLMレスポンス異常", () => {
    it("空文字列のレスポンスでフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: { text: "" },
        }),
        modelId: "test-model",
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
      expect(result.data.type).toBe("global");
    });

    it("不完全なJSONでフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: { text: '{ "type": "local", "confidence":' },
        }),
        modelId: "test-model",
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
    });

    it("nullフィールドを含むJSONを処理できる", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.8,
              extractedEntities: null,
              keywords: null,
              intent: null,
            }),
          },
        }),
        modelId: "test-model",
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ");
      expect(result.success).toBe(true);
      expect(result.data.extractedEntities).toEqual([]);
    });
  });

  describe("特殊文字入力", () => {
    it("絵文字を含むクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("👍 Reactについて教えて 🚀");
      expect(result.success).toBe(true);
    });

    it("改行を含むクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("全体の\nテーマは\n？");
      expect(result.success).toBe(true);
    });

    it("タブ文字を含むクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("React\tと\tVueの違い");
      expect(result.success).toBe(true);
    });
  });
});
```

### 3. パターンマッチング網羅テスト

```typescript
describe("パターンマッチング網羅テスト", () => {
  const classifier = new RuleBasedQueryClassifier();

  describe("日本語グローバルパターン", () => {
    it.each([
      "全体のテーマ",
      "全体は何？",
      "概要を説明して",
      "主な話題は",
      "主要な話題について",
      "何について書いてある？",
      "どんな内容ですか",
      "要約して",
      "まとめてください",
    ])("'%s' をglobalに分類する", async (query) => {
      const result = await classifier.classify(query);
      expect(result.data.type).toBe("global");
    });
  });

  describe("英語グローバルパターン", () => {
    it.each([
      "give me an overview",
      "summary please",
      "what is this about",
      "what is this document about",
      "what is the main topic",
      "what is the main theme",
    ])("'%s' をglobalに分類する", async (query) => {
      const result = await classifier.classify(query);
      expect(result.data.type).toBe("global");
    });
  });

  describe("関係性パターンのヒント検出", () => {
    it.each([
      ["AとBの違い", "comparison"],
      ["difference between X and Y", "comparison"],
      ["AとBの関係", "relationship"],
      ["relationship between X and Y", "relationship"],
      ["AがBに与える影響", "causation"],
      ["how does A affect B", "causation"],
      ["なぜAがBなのか", "reason"],
      ["why does A do B", "reason"],
    ])("'%s' のヒントは '%s'", async (query, expectedHint) => {
      const result = await classifier.classify(query);
      expect(result.data.relationHint).toBe(expectedHint);
    });
  });
});
```

---

## 統合テスト拡充

```typescript
describe("統合テスト", () => {
  describe("検索パイプライン統合", () => {
    it("分類結果を検索エンジンに渡せる形式で返す", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("ReactとVueの違いは？");

      expect(result.success).toBe(true);

      // 検索エンジンで使用する形式の検証
      const { type, extractedEntities, keywords } = result.data;
      expect(typeof type).toBe("string");
      expect(Array.isArray(extractedEntities)).toBe(true);
      expect(Array.isArray(keywords)).toBe(true);

      const weights = classifier.getSearchWeights(type);
      expect(weights.keyword + weights.semantic + weights.graph).toBeCloseTo(
        1.0,
      );
    });
  });

  describe("複数クエリの連続処理", () => {
    it("連続したクエリを正しく分類できる", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const queries = [
        { query: "Reactとは？", expectedType: "local" },
        { query: "全体のテーマは？", expectedType: "global" },
        { query: "AとBの違い", expectedType: "relationship" },
        { query: "Vueについて", expectedType: "local" },
        { query: "概要を教えて", expectedType: "global" },
      ];

      for (const { query, expectedType } of queries) {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        expect(result.data.type).toBe(expectedType);
      }
    });
  });

  describe("エラー回復", () => {
    it("LLMエラー後も正常に動作を継続できる", async () => {
      const mockLLMProvider = {
        generate: vi
          .fn()
          .mockRejectedValueOnce(new Error("API Error"))
          .mockResolvedValueOnce({
            success: true,
            data: {
              text: JSON.stringify({
                type: "local",
                confidence: 0.9,
                extractedEntities: [],
                keywords: [],
                intent: "",
              }),
            },
          }),
        modelId: "test-model",
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      // 1回目: エラー → フォールバック
      const result1 = await classifier.classify("全体のテーマは？");
      expect(result1.success).toBe(true);
      expect(result1.data.type).toBe("global");

      // 2回目: 正常動作
      const result2 = await classifier.classify("Reactとは？");
      expect(result2.success).toBe(true);
      expect(result2.data.type).toBe("local");
    });
  });
});
```

---

## 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm --filter @repo/shared test:coverage

# 特定ファイルのテスト実行
pnpm --filter @repo/shared test src/services/search/__tests__/

# カバレッジレポート生成
pnpm --filter @repo/shared test:coverage -- --reporter=html
```

---

## システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様を参照してください。

| 参照資料   | パス                                                                        | 確認内容       |
| ---------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 統合テスト観点 |

---

## 成果物

| 成果物             | 配置先                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| 境界値テスト       | `packages/shared/src/services/search/__tests__/boundary.test.ts`                     |
| 異常系テスト       | `packages/shared/src/services/search/__tests__/error-handling.test.ts`               |
| パターン網羅テスト | `packages/shared/src/services/search/__tests__/pattern-coverage.test.ts`             |
| 統合テスト拡充     | `packages/shared/src/services/search/__tests__/query-classifier.integration.test.ts` |

---

## 完了条件

- [ ] 境界値テストが追加されている
- [ ] 異常系テストが追加されている
- [ ] パターンマッチング網羅テストが追加されている
- [ ] 統合テストが拡充されている
- [ ] 全てのテストがパスしている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 7（テストカバレッジ確認）へ進み、カバレッジ基準達成を検証する。
