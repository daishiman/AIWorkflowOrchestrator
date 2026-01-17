# RRF Fusion + Reranking - 詳細設計レビュー結果

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | CONV-07-05                                       |
| フェーズ     | Phase 3                                          |
| レビュー種別 | 詳細設計レビュー                                 |
| レビュー対象 | outputs/phase-2/ (class/sequence/data-structure) |
| 作成日       | 2026-01-13                                       |
| ステータス   | 完了                                             |

---

## 1. レビュー観点チェックリスト

| #   | レビュー観点                             | 確認結果 | 指摘事項                          |
| --- | ---------------------------------------- | -------- | --------------------------------- |
| 1   | クラス責務が単一責務原則に従っている     | ✅ PASS  | 各クラスが1つの責務に集中         |
| 2   | インターフェースが適切に抽象化されている | ✅ PASS  | IFusionStrategy/IRerankerで抽象化 |
| 3   | データ構造が要件を満たしている           | ✅ PASS  | FusedSearchResultが全要件網羅     |
| 4   | 型定義が既存システムと整合している       | ✅ PASS  | 既存型を正しく参照                |
| 5   | シーケンスが正常系・異常系を網羅している | ✅ PASS  | フォールバックフロー定義済み      |

---

## 2. クラス設計レビュー

### 2.1 単一責務原則の確認

**評価**: ✅ PASS

| クラス              | 責務                         | 単一責務 |
| ------------------- | ---------------------------- | -------- |
| RRFFusion           | RRFアルゴリズムでの統合      | ✅       |
| WeightedScoreFusion | 重み付き平均での統合         | ✅       |
| LLMReranker         | LLMによるリランキング        | ✅       |
| CohereReranker      | Cohere APIによるリランキング | ✅       |
| VoyageReranker      | Voyage APIによるリランキング | ✅       |
| NoOpReranker        | パススルー（フォールバック） | ✅       |

**詳細確認**:

#### RRFFusion

| メソッド         | 責務                    | 適切性 |
| ---------------- | ----------------------- | ------ |
| fuse()           | 統合処理のエントリ      | ✅     |
| getWeight()      | 重み取得（private）     | ✅     |
| normalizeScore() | スコア正規化（private） | ✅     |

#### LLMReranker

| メソッド             | 責務                          | 適切性 |
| -------------------- | ----------------------------- | ------ |
| rerank()             | リランキングのエントリ        | ✅     |
| scoreBatch()         | バッチスコアリング（private） | ✅     |
| buildScoringPrompt() | プロンプト構築（private）     | ✅     |
| parseScores()        | スコアパース（private）       | ✅     |

### 2.2 インターフェース抽象化の確認

**評価**: ✅ PASS

#### IFusionStrategy

```typescript
interface IFusionStrategy {
  fuse(
    resultSets: Map<string, SearchResult[]>,
    weights: SearchWeights,
  ): FusedSearchResult[];
}
```

- ✅ 同期処理（Fusion自体は高速）
- ✅ 純粋関数として設計
- ✅ 2つの実装で拡張可能性を実証

#### IReranker

```typescript
interface IReranker {
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}
```

- ✅ 非同期処理（外部API対応）
- ✅ Result型でエラー明示
- ✅ 4つの実装で拡張可能性を実証

---

## 3. データ構造レビュー

### 3.1 FusedSearchResult構造

**評価**: ✅ PASS

```typescript
interface FusedSearchResult {
  chunkId: ChunkId; // ✅ Branded Type使用
  content: string; // ✅ 必須フィールド
  fusedScore: number; // ✅ 0-1正規化
  rerankedScore?: number; // ✅ オプション（リランク時のみ）
  sources: Array<{
    // ✅ トレーサビリティ確保
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>; // ✅ 拡張性確保
}
```

**要件との対応**:
| 要件 | データ構造 | 対応 |
| ------------------------ | ------------------- | ---- |
| FR-004 重複チャンク統合 | sources配列 | ✅ |
| FR-005 スコア正規化 | fusedScore (0-1) | ✅ |
| FR-007 メタデータマージ | metadata | ✅ |
| FR-008 ソース情報記録 | sources配列 | ✅ |
| AC-014 rerankedScore設定 | rerankedScore? | ✅ |

### 3.2 中間データ構造

**評価**: ✅ PASS

| 構造                       | 用途             | 適切性 |
| -------------------------- | ---------------- | ------ |
| RRFIntermediateResult      | RRFスコア累積    | ✅     |
| WeightedIntermediateResult | 加重スコア累積   | ✅     |
| Map<ChunkId, ...>          | 重複検出・マージ | ✅     |

### 3.3 外部APIレスポンス型

**評価**: ✅ PASS

| 型                   | 用途             | API仕様との整合 |
| -------------------- | ---------------- | --------------- |
| CohereRerankResponse | Cohere応答パース | ✅              |
| VoyageRerankResponse | Voyage応答パース | ✅              |

---

## 4. シーケンス設計レビュー

### 4.1 正常系シーケンス

**評価**: ✅ PASS

**RRF Fusionシーケンス**:

```
HybridRAGSearcher
    → KeywordStrategy.search() [並列]
    → VectorStrategy.search() [並列]
    → GraphStrategy.search() [並列]
    → RRFFusion.fuse(resultSets, weights)
    → IReranker.rerank(query, candidates, limit)
    → Final Results
```

- ✅ 並列検索が明確
- ✅ Fusion→Rerankingの順序が正確
- ✅ データ型の遷移が追跡可能

**RRFスコア計算詳細**:

```
各戦略の結果をループ
    → rrfContribution = weight / (k + rank)
    → 既存チャンク: スコア累積
    → 新規チャンク: Map登録
→ スコアでソート
→ 正規化
```

- ✅ アルゴリズムが正確に表現
- ✅ 重複マージの処理が明確

### 4.2 異常系シーケンス

**評価**: ✅ PASS

**Reranker失敗時のフォールバック**:

```
CohereReranker.rerank()
    → API Timeout / 429 / 500
    → Result.err()
    → Fallback: fusedScoreでソート
    → limit件に切り詰め
```

- ✅ 各エラーケースが定義
- ✅ フォールバック動作が明確

**複数Reranker切り替え**:

```
CohereReranker → err
    → VoyageReranker → err
        → NoOpReranker → ok(candidates.slice(0, limit))
```

- ✅ 複数段階フォールバックが定義

### 4.3 状態遷移

**評価**: ✅ PASS

| 処理      | 状態遷移                                                                           | 適切性 |
| --------- | ---------------------------------------------------------------------------------- | ------ |
| Fusion    | IDLE → PROCESSING → (SCORING/MERGING/SORTING) → COMPLETED                          | ✅     |
| Reranking | IDLE → VALIDATING → (EMPTY_INPUT/SKIP_RERANK/SCORING) → SUCCESS/FAILURE → FALLBACK | ✅     |

---

## 5. ディレクトリ構造レビュー

### 5.1 ファイル配置

**評価**: ✅ PASS

```
packages/shared/src/services/search/
├── index.ts                    # メインエクスポート
├── types.ts                    # 共通型 (SearchWeights等)
├── fusion/
│   ├── index.ts                # Fusionエクスポート
│   ├── types.ts                # Fusion固有型
│   ├── rrf-fusion.ts           # RRFFusion, WeightedScoreFusion
│   └── __tests__/
│       └── rrf-fusion.test.ts
├── reranking/
│   ├── index.ts                # Rerankingエクスポート
│   ├── types.ts                # Reranking固有型
│   ├── cross-encoder-reranker.ts  # 全Reranker実装
│   └── __tests__/
│       └── reranker.test.ts
```

**確認事項**:

- ✅ モジュール分離が適切
- ✅ テストファイルの配置が適切
- ✅ エクスポート構造が明確

### 5.2 命名規則

**評価**: ✅ PASS

| パターン         | 例                         | 適切性 |
| ---------------- | -------------------------- | ------ |
| ファイル名       | `rrf-fusion.ts` (ケバブ)   | ✅     |
| クラス名         | `RRFFusion` (PascalCase)   | ✅     |
| インターフェース | `IReranker` (I+PascalCase) | ✅     |
| テストファイル   | `*.test.ts`                | ✅     |

---

## 6. 型定義の整合性

**評価**: ✅ PASS

| 既存型        | 参照先               | 使用箇所                   |
| ------------- | -------------------- | -------------------------- |
| ChunkId       | @/types/branded      | FusedSearchResult.chunkId  |
| Result        | @/types/rag/result   | IReranker.rerank()戻り値   |
| SearchWeights | ../types.ts          | IFusionStrategy.fuse()引数 |
| ILLMClient    | @/services/llm/types | LLMRerankerコンストラクタ  |

---

## 7. 指摘事項

### 7.1 重大な指摘

なし

### 7.2 軽微な指摘

なし

### 7.3 改善推奨事項

| #   | 項目                      | 推奨内容                           | 優先度 |
| --- | ------------------------- | ---------------------------------- | ------ |
| R-1 | Zodバリデーション（任意） | 外部APIレスポンスにZodスキーマ適用 | Low    |
| R-2 | メモリ最適化（任意）      | 大量候補時のストリーミング処理検討 | Low    |

**補足**: Phase 8（リファクタリング）で対応可能。

---

## 8. レビュー判定

| 観点                           | 判定    |
| ------------------------------ | ------- |
| クラス責務の単一性             | ✅ PASS |
| インターフェースの抽象化       | ✅ PASS |
| データ構造の要件適合           | ✅ PASS |
| 型定義の既存システム整合性     | ✅ PASS |
| シーケンスの正常系・異常系網羅 | ✅ PASS |

**総合判定**: ✅ **PASS**

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
