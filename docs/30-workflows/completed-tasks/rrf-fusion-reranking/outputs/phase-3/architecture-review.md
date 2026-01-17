# RRF Fusion + Reranking - アーキテクチャレビュー結果

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | CONV-07-05                      |
| フェーズ     | Phase 3                         |
| レビュー種別 | アーキテクチャレビュー          |
| レビュー対象 | outputs/phase-2/architecture.md |
| 作成日       | 2026-01-13                      |
| ステータス   | 完了                            |

---

## 1. レビュー観点チェックリスト

| #   | レビュー観点                           | 確認結果 | 指摘事項                          |
| --- | -------------------------------------- | -------- | --------------------------------- |
| 1   | HybridRAGパイプラインとの統合が適切    | ✅ PASS  | パイプライン図で統合位置を明確化  |
| 2   | コンポーネント間の依存関係が明確       | ✅ PASS  | 依存関係図で可視化済み            |
| 3   | インターフェース設計が適切             | ✅ PASS  | IFusionStrategy/IRerankerで抽象化 |
| 4   | エラーハンドリング戦略が定義されている | ✅ PASS  | フォールバックフローが明確        |
| 5   | 既存のシステム仕様と整合している       | ✅ PASS  | 既存型・パスとの整合性を確認      |

---

## 2. 詳細レビュー結果

### 2.1 HybridRAGパイプラインとの統合

**評価**: ✅ PASS

**確認ポイント**:

| 統合ポイント                     | 設計内容                      | 評価 |
| -------------------------------- | ----------------------------- | ---- |
| 入力: 検索戦略からの結果         | Map<strategy, SearchResult[]> | ✅   |
| 入力: Query Classifierからの重み | SearchWeights                 | ✅   |
| 出力: CRAGEvaluatorへ            | FusedSearchResult[]           | ✅   |
| 出力: HybridRAGSearcherへ        | FusedSearchResult[]           | ✅   |

**アーキテクチャ図の確認**:

```
User Query
    ↓
Query Classifier (CONV-07-01) → SearchWeights
    ↓
並列検索 (CONV-07-02/03/04)
    ↓
★ RRF Fusion (CONV-07-05) ← このタスク
    ↓
★ Reranking (CONV-07-05) ← このタスク
    ↓
CRAG Evaluator (CONV-07-06)
```

**判定**: パイプライン内での位置と入出力が明確に定義されている。

### 2.2 コンポーネント間の依存関係

**評価**: ✅ PASS

**依存関係の確認**:

```
HybridRAGSearcher
    ├── ISearchStrategy (既存)
    │   ├── KeywordSearchStrategy
    │   ├── VectorSearchStrategy
    │   └── GraphSearchStrategy
    ├── IFusionStrategy (新規)
    │   ├── RRFFusion
    │   └── WeightedScoreFusion
    └── IReranker (新規)
        ├── LLMReranker → ILLMClient
        ├── CohereReranker → External API
        ├── VoyageReranker → External API
        └── NoOpReranker
```

**確認事項**:

- ✅ インターフェースによる疎結合
- ✅ 外部依存が明確に分離
- ✅ 循環依存なし

### 2.3 インターフェース設計

**評価**: ✅ PASS

| インターフェース | 責務                 | 実装数 | 評価 |
| ---------------- | -------------------- | ------ | ---- |
| IFusionStrategy  | 検索結果統合の抽象化 | 2      | ✅   |
| IReranker        | リランキングの抽象化 | 4      | ✅   |

**設計原則の確認**:

- ✅ 単一責務原則: 各インターフェースが1つの責務
- ✅ 開放閉鎖原則: 新規Fusion/Reranker追加時に既存コード変更不要
- ✅ 依存性逆転原則: 上位モジュールがインターフェースに依存

### 2.4 エラーハンドリング戦略

**評価**: ✅ PASS

**フォールバック戦略**:

| 障害ポイント      | フォールバック動作                    | 評価 |
| ----------------- | ------------------------------------- | ---- |
| Cohere API障害    | LLMReranker or NoOpRerankerに切り替え | ✅   |
| Voyage AI API障害 | LLMReranker or NoOpRerankerに切り替え | ✅   |
| LLM API障害       | fusedScoreをそのまま使用              | ✅   |
| 全リランカー障害  | NoOpRerankerでfusedScore順序を維持    | ✅   |

**Result型によるエラー伝播**:

```typescript
rerank(): Promise<Result<FusedSearchResult[], Error>>
```

- ✅ 明示的なエラー型
- ✅ Railway Oriented Programmingパターン

### 2.5 既存システム仕様との整合性

**評価**: ✅ PASS

| 既存仕様               | 設計内容                 | 整合性 |
| ---------------------- | ------------------------ | ------ |
| SearchResult型         | 入力型として使用         | ✅     |
| SearchWeights型        | Query Classifierと互換   | ✅     |
| Result型               | エラーハンドリングに使用 | ✅     |
| ChunkId (Branded Type) | FusedSearchResultで使用  | ✅     |
| ILLMClient             | LLMRerankerで使用        | ✅     |

**既存パスとの整合性**:
| 参照先 | 用途 | 確認 |
| ----------------------------------------- | ------------------ | ---- |
| packages/shared/src/types/rag/result.ts | Result型 | ✅ |
| packages/shared/src/types/branded.ts | ChunkId | ✅ |
| packages/shared/src/services/search/types.ts | SearchWeights | ✅ |
| packages/shared/src/services/llm/types.ts | ILLMClient | ✅ |

---

## 3. レイヤーアーキテクチャの確認

**評価**: ✅ PASS

```
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
│  HybridRAGSearcher (オーケストレーション)        │
├─────────────────────────────────────────────────┤
│                Service Layer                     │
│  ISearchStrategy | IFusionStrategy | IReranker  │
├─────────────────────────────────────────────────┤
│             Infrastructure Layer                 │
│  Database | Embedding | External API            │
└─────────────────────────────────────────────────┘
```

**確認事項**:

- ✅ 各層の責務が明確
- ✅ 上位層から下位層への一方向依存
- ✅ インフラ層の詳細が抽象化

---

## 4. 拡張性の確認

**評価**: ✅ PASS

| 拡張シナリオ     | 対応方法                | 評価 |
| ---------------- | ----------------------- | ---- |
| 新Fusion戦略追加 | IFusionStrategy実装追加 | ✅   |
| 新Reranker追加   | IReranker実装追加       | ✅   |
| 新検索戦略追加   | Map型resultSetsで対応   | ✅   |

**将来拡張例**:

```typescript
// CombMNZ Fusion
class CombMNZFusion implements IFusionStrategy { ... }

// Jina Reranker
class JinaReranker implements IReranker { ... }
```

---

## 5. 指摘事項

### 5.1 重大な指摘

なし

### 5.2 軽微な指摘

なし

### 5.3 改善推奨事項

| #   | 項目                         | 推奨内容                                | 優先度 |
| --- | ---------------------------- | --------------------------------------- | ------ |
| R-1 | リトライ戦略の詳細化（任意） | 指数バックオフの実装検討                | Low    |
| R-2 | サーキットブレーカー（任意） | 外部API障害時のサーキットブレーカー検討 | Low    |

**補足**: これらは運用フェーズでの改善として検討可能。現時点では必須ではない。

---

## 6. レビュー判定

| 観点                          | 判定    |
| ----------------------------- | ------- |
| HybridRAGパイプラインとの統合 | ✅ PASS |
| コンポーネント間の依存関係    | ✅ PASS |
| インターフェース設計          | ✅ PASS |
| エラーハンドリング戦略        | ✅ PASS |
| 既存システム仕様との整合性    | ✅ PASS |

**総合判定**: ✅ **PASS**

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-13 | 1.0.0      | 初版作成 |
