# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 2                    |
| Phase名    | 設計                 |
| 前提Phase  | Phase 1              |
| 後続Phase  | Phase 3              |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

RRF Fusion + Reranking機能のアーキテクチャと詳細設計を策定する。

## 背景

Phase 1で定義された要件に基づき、具体的なクラス設計、インターフェース設計、データフロー設計を行う。既存のHybridRAG検索パイプラインとの統合を考慮した設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: システム全体におけるFusion/Rerankingの位置づけを設計する

**実行手順**:

1. HybridRAG検索パイプライン内の位置を明確化:

   ```
   Query → QueryClassifier → [Keyword/Semantic/Graph検索]
                                       ↓
                               [RRF Fusion] ← このタスクの範囲
                                       ↓
                               [Reranking] ← このタスクの範囲
                                       ↓
                               [CRAG評価] → 次のタスク
   ```

2. コンポーネント間の依存関係を設計:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │                     HybridRAGSearcher                        │
   ├─────────────────────────────────────────────────────────────┤
   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
   │  │ KeywordSearch │  │ VectorSearch  │  │ GraphSearch   │   │
   │  │ Strategy      │  │ Strategy      │  │ Strategy      │   │
   │  └───────────────┘  └───────────────┘  └───────────────┘   │
   │           │                  │                  │           │
   │           └──────────────────┼──────────────────┘           │
   │                              ↓                              │
   │                    ┌─────────────────┐                      │
   │                    │   RRFFusion     │                      │
   │                    │ (IFusionStrategy)│                      │
   │                    └────────┬────────┘                      │
   │                             ↓                               │
   │                    ┌─────────────────┐                      │
   │                    │   IReranker     │                      │
   │                    │ (LLM/Cohere/    │                      │
   │                    │  Voyage/NoOp)   │                      │
   │                    └─────────────────┘                      │
   └─────────────────────────────────────────────────────────────┘
   ```

**期待される成果物**:

- `outputs/phase-2/architecture.md` - アーキテクチャ設計ドキュメント

---

### タスク2: クラス設計

**目的**: 各クラスの責務と構造を設計する

**実行手順**:

1. **IFusionStrategy インターフェース**:

   ```typescript
   interface IFusionStrategy {
     fuse(
       resultSets: Map<string, SearchResult[]>,
       weights: SearchWeights,
     ): FusedSearchResult[];
   }
   ```

2. **RRFFusion クラス**:

   ```typescript
   class RRFFusion implements IFusionStrategy {
     constructor(k: number = 60);
     fuse(resultSets, weights): FusedSearchResult[];
     private getWeight(strategy, weights): number;
     private normalizeScore(rrfScore): number;
   }
   ```

3. **WeightedScoreFusion クラス**:

   ```typescript
   class WeightedScoreFusion implements IFusionStrategy {
     fuse(resultSets, weights): FusedSearchResult[];
     private getWeight(strategy, weights): number;
   }
   ```

4. **IReranker インターフェース**:

   ```typescript
   interface IReranker {
     rerank(
       query: string,
       candidates: FusedSearchResult[],
       limit: number,
     ): Promise<Result<FusedSearchResult[], Error>>;
   }
   ```

5. **Reranker実装クラス**:
   - `LLMReranker`: LLMベースのスコアリング
   - `CohereReranker`: Cohere Rerank API
   - `VoyageReranker`: Voyage AI Rerank API
   - `NoOpReranker`: フォールバック用

**期待される成果物**:

- `outputs/phase-2/class-design.md` - クラス設計ドキュメント

---

### タスク3: シーケンス設計

**目的**: 処理フローをシーケンス図で表現する

**実行手順**:

1. RRF Fusionシーケンス:

   ```mermaid
   sequenceDiagram
     participant S as HybridSearcher
     participant F as RRFFusion
     participant R as IReranker

     S->>F: fuse(resultSets, weights)
     F->>F: 各戦略の結果を処理
     F->>F: RRFスコア計算
     F->>F: 重複チャンクをマージ
     F->>F: スコア正規化
     F-->>S: FusedSearchResult[]

     S->>R: rerank(query, candidates, limit)
     R->>R: バッチスコアリング
     R->>R: スコアでソート
     R-->>S: FusedSearchResult[] with rerankedScore
   ```

2. エラーハンドリングシーケンス:

   ```mermaid
   sequenceDiagram
     participant S as HybridSearcher
     participant R as CohereReranker

     S->>R: rerank(query, candidates, limit)
     R->>R: API呼び出し
     alt API成功
       R-->>S: Ok(rerankedResults)
     else API失敗
       R-->>S: Err(error)
       S->>S: fusedScoreでフォールバック
     end
   ```

**期待される成果物**:

- `outputs/phase-2/sequence-design.md` - シーケンス設計ドキュメント

---

### タスク4: データ構造設計

**目的**: 入出力データ構造の詳細を設計する

**実行手順**:

1. **FusedSearchResult 型定義**:

   ```typescript
   interface FusedSearchResult {
     chunkId: ChunkId;
     content: string;
     fusedScore: number; // RRF/Weighted統合スコア (0-1)
     rerankedScore?: number; // リランキング後スコア (0-1)
     sources: Array<{
       strategy: "keyword" | "semantic" | "graph";
       rank: number; // 元のランク (1-indexed)
       score: number; // 元のスコア
     }>;
     metadata: Record<string, unknown>;
   }
   ```

2. **RerankerOptions 型定義**:

   ```typescript
   interface RerankerOptions {
     alwaysRerank?: boolean; // 常にリランキングするか
     batchSize?: number; // バッチサイズ（デフォルト: 10）
   }
   ```

3. **外部APIレスポンス型**:

   ```typescript
   interface CohereRerankResponse {
     results: Array<{ index: number; relevance_score: number }>;
   }

   interface VoyageRerankResponse {
     data: Array<{ index: number; relevance_score: number }>;
   }
   ```

**期待される成果物**:

- `outputs/phase-2/data-structure.md` - データ構造設計ドキュメント

---

### タスク5: ディレクトリ構造設計

**目的**: ファイル配置を設計する

**実行手順**:

```
packages/shared/src/services/search/
├── fusion/
│   ├── index.ts                    # エクスポート
│   ├── rrf-fusion.ts               # RRFFusion, WeightedScoreFusion
│   ├── types.ts                    # IFusionStrategy, FusedSearchResult
│   └── __tests__/
│       └── rrf-fusion.test.ts
├── reranking/
│   ├── index.ts                    # エクスポート
│   ├── cross-encoder-reranker.ts   # 全Reranker実装
│   ├── types.ts                    # IReranker, RerankerOptions
│   └── __tests__/
│       └── reranker.test.ts
└── types.ts                        # 共通型（SearchWeights等）
```

**期待される成果物**:

- `outputs/phase-2/directory-structure.md` - ディレクトリ構造設計ドキュメント

---

## 参照資料

| 参照資料                | パス                                                                         | 内容                 |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------- |
| Phase 1成果物           | `outputs/phase-1/`                                                           | 要件定義ドキュメント |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | 既存型定義           |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAG全体設計    |

---

## 成果物

| 成果物             | パス                                     | 内容             |
| ------------------ | ---------------------------------------- | ---------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture.md`        | システム構成図   |
| クラス設計         | `outputs/phase-2/class-design.md`        | クラス責務・構造 |
| シーケンス設計     | `outputs/phase-2/sequence-design.md`     | 処理フロー       |
| データ構造設計     | `outputs/phase-2/data-structure.md`      | 型定義詳細       |
| ディレクトリ構造   | `outputs/phase-2/directory-structure.md` | ファイル配置     |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2のアクション**: 統合ポイント/契約（API・スキーマ）を設計に反映

- HybridRAGSearcher との統合インターフェース設計
- 外部API（Cohere/Voyage）との契約定義
- 検索戦略からの入力スキーマ確認

---

## 完了条件

- [ ] アーキテクチャ設計ドキュメントが作成されている
- [ ] クラス設計ドキュメントが作成されている
- [ ] シーケンス設計ドキュメントが作成されている
- [ ] データ構造設計ドキュメントが作成されている
- [ ] ディレクトリ構造設計ドキュメントが作成されている
- [ ] HybridRAGSearcherとの統合ポイントが明確化されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/rrf-fusion-reranking/phase-3-design-review.md`
