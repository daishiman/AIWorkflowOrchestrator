# Phase 4 成果物: テスト仕様書

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | CONV-07-06                                |
| フェーズ | Phase 4: テスト作成（TDD: Red）           |
| 作成日   | 2026-01-16                                |
| 対象機能 | Corrective RAG (CRAG)                     |
| 実装場所 | packages/shared/src/services/search/crag/ |

---

## 1. テスト方針

### 1.1 TDD原則

| 原則             | 説明                                                 |
| ---------------- | ---------------------------------------------------- |
| テストファースト | 実装より先にテストを作成し、失敗状態（Red）を確認    |
| 最小実装         | テストを通過させる最小限の実装を行う（Green）        |
| リファクタリング | テスト通過を維持しながらコード品質を向上（Refactor） |

### 1.2 テスト対象

| 対象クラス         | 責務                              |
| ------------------ | --------------------------------- |
| RelevanceEvaluator | LLMを使用した検索結果の関連性評価 |
| CorrectiveRAG      | 評価結果に基づく検索結果の補正    |

### 1.3 テストの分類

| 分類           | 目的                             | ファイル                |
| -------------- | -------------------------------- | ----------------------- |
| ユニットテスト | 個別クラスの振る舞いを検証       | `*.test.ts`             |
| 統合テスト     | コンポーネント間の連携を検証     | `*.integration.test.ts` |
| 境界値テスト   | エッジケース・境界値の動作を検証 | ユニットテストに含める  |

---

## 2. テスト環境

### 2.1 テストフレームワーク

| 項目           | 技術           |
| -------------- | -------------- |
| テストランナー | Vitest         |
| アサーション   | Vitest expect  |
| モック         | Vitest vi.fn() |

### 2.2 モック戦略

| 依存対象     | モック方法                  |
| ------------ | --------------------------- |
| ILLMClient   | vi.fn()でcomplete()をモック |
| IWebSearcher | vi.fn()でsearch()をモック   |

### 2.3 テストデータ

| データ種別        | 生成方法                                 |
| ----------------- | ---------------------------------------- |
| FusedSearchResult | createMockFusedResults()ファクトリー     |
| LLMレスポンス     | createMockLLMResponse()ファクトリー      |
| WebSearchResult   | createMockWebSearchResults()ファクトリー |

---

## 3. テストシナリオ設計

### 3.1 RelevanceEvaluator テストシナリオ

| テストID | シナリオ             | 入力条件                       | 期待結果                      |
| -------- | -------------------- | ------------------------------ | ----------------------------- |
| RE-001   | 高関連性結果の評価   | 全スコア≥0.7のLLMレスポンス    | action: "correct"             |
| RE-002   | 低関連性結果の評価   | 全スコア≤0.3のLLMレスポンス    | action: "incorrect"           |
| RE-003   | 混在関連性結果の評価 | スコア0.3〜0.7のLLMレスポンス  | action: "ambiguous"           |
| RE-004   | 空の結果配列         | results: []                    | action: "incorrect", score: 0 |
| RE-005   | LLM API失敗          | ILLMClient.complete()がErr返却 | Result.err()                  |
| RE-006   | 個別スコア計算       | 複数結果のLLMレスポンス        | 各結果に0-1スコアとreason     |
| RE-007   | 全体スコア加重平均   | [0.9, 0.8, 0.7]のスコア        | 加重平均値（≈0.847）          |
| RE-008   | カスタム閾値         | correctThreshold: 0.8          | 閾値に基づく判定              |

### 3.2 CorrectiveRAG テストシナリオ

| テストID | シナリオ                      | 入力条件                              | 期待結果                      |
| -------- | ----------------------------- | ------------------------------------- | ----------------------------- |
| CR-001   | correct判定時の処理           | evaluation.action: "correct"          | 結果をそのまま返却            |
| CR-002   | incorrect判定+Web検索有効     | action: "incorrect", enableWebSearch  | augmentedContextにWeb検索結果 |
| CR-003   | incorrect判定+Web検索無効     | action: "incorrect", !enableWebSearch | results: []                   |
| CR-004   | ambiguous判定時フィルタリング | action: "ambiguous"                   | 低スコア結果を除外            |
| CR-005   | ambiguous判定+Web検索補強     | フィルタ後結果数<閾値                 | Web検索で補強                 |
| CR-006   | Knowledge Refinement有効      | enableRefinement: true                | 不要情報を除去                |
| CR-007   | 評価エラー時                  | evaluator.evaluate()がErr返却         | Result.err()                  |

---

## 4. テストカバレッジ目標

### 4.1 カバレッジ閾値

| 指標       | 目標値 |
| ---------- | ------ |
| Lines      | 80%    |
| Functions  | 80%    |
| Branches   | 80%    |
| Statements | 80%    |

### 4.2 必須テストカバレッジ

| 機能                    | 優先度 | カバレッジ目標 |
| ----------------------- | ------ | -------------- |
| evaluate()              | 必須   | 100%           |
| process()               | 必須   | 100%           |
| handleCorrect()         | 必須   | 100%           |
| handleIncorrect()       | 必須   | 100%           |
| handleAmbiguous()       | 必須   | 100%           |
| calculateOverallScore() | 必須   | 100%           |
| determineAction()       | 必須   | 100%           |

---

## 5. モック定義

### 5.1 ILLMClient モック

```typescript
const createMockLLMClient = (config: {
  response?: string;
  shouldFail?: boolean;
  error?: Error;
}): ILLMClient => ({
  complete: vi.fn().mockImplementation(async () => {
    if (config.shouldFail) {
      return err(config.error ?? new Error("LLM API failed"));
    }
    return ok(config.response ?? "{}");
  }),
});
```

### 5.2 IWebSearcher モック

```typescript
const createMockWebSearcher = (config: {
  results?: WebSearchResult[];
  shouldFail?: boolean;
}): IWebSearcher => ({
  search: vi.fn().mockImplementation(async () => {
    if (config.shouldFail) {
      return err(new Error("Web search failed"));
    }
    return ok(config.results ?? []);
  }),
});
```

### 5.3 FusedSearchResult ファクトリー

```typescript
const createMockFusedResults = (
  count: number,
  scoreRange?: { min: number; max: number },
): FusedSearchResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    chunkId: `chunk-${i}` as ChunkId,
    content: `Test content ${i}`,
    fusedScore: scoreRange
      ? scoreRange.min +
        (scoreRange.max - scoreRange.min) * (i / (count - 1 || 1))
      : 0.5 + i * 0.1,
    sources: [{ strategy: "semantic" as const, rank: i, score: 0.8 }],
    metadata: {},
  }));
};
```

---

## 6. テストファイル構成

```
packages/shared/src/services/search/crag/
├── __tests__/
│   ├── relevance-evaluator.test.ts      # RelevanceEvaluatorユニットテスト
│   ├── corrective-rag.test.ts           # CorrectiveRAGユニットテスト
│   ├── crag.integration.test.ts         # LLM連携統合テスト
│   ├── crag.flow.test.ts                # データフロー統合テスト
│   ├── crag.error.test.ts               # エラーハンドリング統合テスト
│   └── crag.web-search.test.ts          # Web検索連携統合テスト
│   └── test-helpers.ts                  # テストヘルパー・モック
```

---

## 7. 境界値テスト

### 7.1 スコア境界

| 境界                     | テスト値         | 期待結果            |
| ------------------------ | ---------------- | ------------------- |
| correct閾値（0.7）       | 0.69, 0.70, 0.71 | incorrect/correct   |
| incorrect閾値（0.3）     | 0.29, 0.30, 0.31 | incorrect/ambiguous |
| スコア下限（0.0）        | 0.0              | 有効なスコア        |
| スコア上限（1.0）        | 1.0              | 有効なスコア        |
| ambiguousフィルタ（0.4） | 0.39, 0.40, 0.41 | 除外/保持           |

### 7.2 配列境界

| 境界                  | テスト値 | 期待結果            |
| --------------------- | -------- | ------------------- |
| 空配列                | []       | action: "incorrect" |
| 単一要素              | [1件]    | 正常処理            |
| 最大評価数（5件）     | [5件]    | 5件全て評価         |
| 最大評価数超過（6件） | [6件]    | 上位5件のみ評価     |

---

## 8. 完了確認

- [x] テスト方針が定義されている
- [x] テスト環境が定義されている
- [x] テストシナリオ（RE-001〜RE-008）が設計されている
- [x] テストシナリオ（CR-001〜CR-007）が設計されている
- [x] カバレッジ目標が設定されている
- [x] モック定義が設計されている
- [x] テストファイル構成が設計されている
- [x] 境界値テストが設計されている
