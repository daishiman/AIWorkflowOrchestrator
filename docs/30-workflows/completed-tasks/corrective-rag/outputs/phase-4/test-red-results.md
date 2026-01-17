# Phase 4 成果物: テストRed状態確認結果

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | CONV-07-06                      |
| フェーズ | Phase 4: テスト作成（TDD: Red） |
| 作成日   | 2026-01-17                      |
| 対象機能 | Corrective RAG (CRAG)           |

---

## 1. Red状態確認結果

### 1.1 確認概要

| 項目                  | 結果                                            |
| --------------------- | ----------------------------------------------- |
| テスト実行日時        | 2026-01-17                                      |
| テスト実行環境        | Vitest                                          |
| Red状態（テスト失敗） | **確認完了**                                    |
| 失敗原因              | `throw new Error("Not implemented")` (期待通り) |

### 1.2 テストファイル一覧

| ファイル                      | テスト数 | 状態 |
| ----------------------------- | -------- | ---- |
| `relevance-evaluator.test.ts` | 16       | Red  |
| `corrective-rag.test.ts`      | 15       | Red  |
| `crag.integration.test.ts`    | 13       | Red  |

**合計: 44テスト（すべてRed状態）**

---

## 2. テストシナリオ別確認

### 2.1 RelevanceEvaluator テスト (16件)

| テストID | シナリオ                          | 状態 |
| -------- | --------------------------------- | ---- |
| RE-001   | 高関連性を"correct"と評価         | Red  |
| RE-002   | 低関連性を"incorrect"と評価       | Red  |
| RE-003   | 混在関連性を"ambiguous"と評価     | Red  |
| RE-004   | 空結果を"incorrect"と評価         | Red  |
| RE-005   | LLM API失敗時にResult.err()を返す | Red  |
| RE-006   | 個別スコアを正しく計算            | Red  |
| RE-007   | 全体スコアを加重平均で計算        | Red  |
| RE-008   | カスタム閾値で評価                | Red  |
| -        | 境界値テスト（correct閾値）×3     | Red  |
| -        | 境界値テスト（incorrect閾値）×3   | Red  |
| -        | 配列サイズ境界値テスト×3          | Red  |
| -        | エラーハンドリング×2              | Red  |
| -        | LLMプロンプト検証×2               | Red  |

### 2.2 CorrectiveRAG テスト (15件)

| テストID | シナリオ                         | 状態 |
| -------- | -------------------------------- | ---- |
| CR-001   | correct時にそのまま結果返却      | Red  |
| CR-002   | incorrect時にWeb検索で補完       | Red  |
| CR-003   | ambiguous時にフィルタリング      | Red  |
| CR-004   | 評価器エラー時にResult.err()返却 | Red  |
| CR-005   | Web検索無効時のincorrect処理     | Red  |
| CR-006   | カスタムオプションが反映される   | Red  |
| CR-007   | 空結果入力時の処理               | Red  |
| -        | 補正アクション記録テスト×4       | Red  |
| -        | Web検索連携テスト×4              | Red  |

### 2.3 統合テスト (13件)

| カテゴリ           | テスト数 | 状態 |
| ------------------ | -------- | ---- |
| LLM連携            | 5        | Red  |
| データフロー       | 3        | Red  |
| エラーハンドリング | 3        | Red  |
| Web検索連携        | 4        | Red  |

---

## 3. モッククラス実装

### 3.1 RelevanceEvaluator モック

```typescript
class RelevanceEvaluator {
  constructor(_llmClient: any, _options?: any) {
    // 実装なし - テストは失敗するはず
  }

  async evaluate(_query: string, _results: FusedSearchResult[]) {
    // 実装なし - テストは失敗するはず
    throw new Error("Not implemented");
  }
}
```

### 3.2 CorrectiveRAG モック

```typescript
class CorrectiveRAG {
  constructor(
    private evaluator: IRelevanceEvaluator,
    private webSearcher: IWebSearcher | null,
    private options?: CRAGOptions,
  ) {}

  async process(_query: string, _results: FusedSearchResult[]) {
    throw new Error("Not implemented");
  }
}
```

---

## 4. テストヘルパー確認

### 4.1 作成済みヘルパー

| ヘルパー                     | 用途                          |
| ---------------------------- | ----------------------------- |
| `createMockLLMClient`        | LLMクライアントモック生成     |
| `createMockWebSearcher`      | Web検索プロバイダーモック生成 |
| `createMockEvaluator`        | 評価器モック生成              |
| `createMockFusedResults`     | テストデータ生成              |
| `createMockWebSearchResults` | Web検索結果生成               |
| `createMockIndividualScores` | 個別スコア生成                |

### 4.2 フィクスチャ確認

| フィクスチャ         | 内容                        |
| -------------------- | --------------------------- |
| `LLM_RESPONSES`      | HIGH, LOW, MIXED, INVALID等 |
| `WEB_SEARCH_RESULTS` | STANDARD, EMPTY, LARGE_SET  |

---

## 5. Phase 5への移行準備

### 5.1 実装対象クラス

1. **RelevanceEvaluator** (`relevance-evaluator.ts`)
   - ILLMClientを使用したLLM関連性評価
   - スコア正規化（0-10 → 0-1）
   - 加重平均計算
   - アクション判定（correct/incorrect/ambiguous）

2. **CorrectiveRAG** (`corrective-rag.ts`)
   - RelevanceEvaluatorとの連携
   - アクション別処理分岐
   - Web検索連携（オプション）
   - Result型でのエラーハンドリング

### 5.2 インターフェース確認

```typescript
// ILLMClient - 既存インターフェース使用
interface ILLMClient {
  complete(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<Result<string, Error>>;
}

// IWebSearcher - 新規定義
interface IWebSearcher {
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

// RelevanceEvaluation - 評価結果
interface RelevanceEvaluation {
  overallScore: number;
  action: RelevanceAction;
  individualScores: IndividualScore[];
  reasoning: string;
}

// CRAGResult - 最終出力
interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: RelevanceAction;
    corrections: CorrectionAction[];
  };
  augmentedContext?: string;
}
```

---

## 6. 完了チェックリスト

- [x] すべてのテストがRed状態（失敗）であることを確認
- [x] モッククラスが"Not implemented"エラーをthrow
- [x] テストヘルパーが正しく機能
- [x] フィクスチャが定義済み
- [x] Phase 5実装対象が明確
- [x] インターフェースが確定

---

## 7. 次のステップ

**Phase 5: 実装（TDD: Green）**へ進む

1. `relevance-evaluator.ts` の実装
2. `corrective-rag.ts` の実装
3. 型定義ファイル (`types.ts`) の作成
4. テストがすべてパス（Green）するまで実装を調整
