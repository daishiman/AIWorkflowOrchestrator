# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 1                    |
| Phase名    | 要件定義             |
| 前提Phase  | -                    |
| 後続Phase  | Phase 2              |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

RRF Fusion + Reranking機能の要件を明確化し、受け入れ基準を定義する。

## 背景

HybridRAG検索エンジンでは、3つの異なる検索戦略（Keyword/Semantic/Graph）からの結果を統合する必要がある。各戦略は異なるスコア分布を持つため、単純な結合ではなくRRFアルゴリズムによる公平な統合と、Cross-Encoder Rerankingによる精度向上が求められる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の明確化

**目的**: RRF Fusion + Reranking機能の要件を整理する

**実行手順**:

1. タスク指示書（`docs/30-workflows/unassigned-task/task-07-05-rrf-fusion-reranking.md`）を精読する
2. 関連システム仕様（RAG検索インターフェース、アーキテクチャ）を確認する
3. 以下の機能要件を文書化する:
   - RRFFusion: 複数検索結果のRRFアルゴリズムによる統合
   - WeightedScoreFusion: 重み付きスコア平均による代替統合方式
   - IReranker: リランキングインターフェース
   - LLMReranker: LLMベースのリランカー
   - CohereReranker: Cohere Rerank APIを使用したリランカー
   - VoyageReranker: Voyage AI Rerank APIを使用したリランカー
   - NoOpReranker: フォールバック用のNo-Opリランカー

**期待される成果物**:

- `outputs/phase-1/requirements.md` - 機能要件ドキュメント

---

### タスク2: 非機能要件の定義

**目的**: パフォーマンス、可用性、保守性等の非機能要件を定義する

**実行手順**:

1. 以下の非機能要件を定義する:
   - **パフォーマンス**: RRF統合は50ms以内、リランキングは外部API依存
   - **可用性**: リランキング失敗時はFusionスコアでフォールバック
   - **スケーラビリティ**: バッチ処理でAPI呼び出しを効率化
   - **保守性**: IRerankerインターフェースで実装を抽象化
   - **セキュリティ**: APIキーの安全な管理

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md` - 非機能要件ドキュメント

---

### タスク3: 受け入れ基準の策定

**目的**: 各機能の受け入れ基準（Acceptance Criteria）を定義する

**実行手順**:

1. タスク指示書の完了条件を参照する
2. 以下の観点で受け入れ基準を策定する:

#### RRFFusion

| AC-ID  | 基準                                                        |
| ------ | ----------------------------------------------------------- |
| AC-001 | 3つの検索戦略からの結果を正しく統合できる                   |
| AC-002 | 各戦略の重み（Query Classifierから）が正しく適用される      |
| AC-003 | 重複するチャンクが1つにマージされ、全ソース情報が保持される |
| AC-004 | fusedScoreが0-1の範囲に正規化される                         |
| AC-005 | RRF kパラメータがコンストラクタで設定可能                   |

#### WeightedScoreFusion

| AC-ID  | 基準                                         |
| ------ | -------------------------------------------- |
| AC-006 | 各スコアに重みを適用した加重平均が計算される |
| AC-007 | 重複チャンクのスコアが正しく統合される       |

#### IReranker / 各実装

| AC-ID  | 基準                                                    |
| ------ | ------------------------------------------------------- |
| AC-008 | IRerankerインターフェースが定義されている               |
| AC-009 | LLMRerankerがバッチでスコアリングできる                 |
| AC-010 | CohereRerankerがCohere Rerank APIを呼び出せる           |
| AC-011 | VoyageRerankerがVoyage AI Rerank APIを呼び出せる        |
| AC-012 | NoOpRerankerが順序を変えずにlimitを適用する             |
| AC-013 | API失敗時にフォールバック（fusedScoreを使用）が動作する |
| AC-014 | rerankedScoreが結果に設定される                         |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` - 受け入れ基準ドキュメント

---

### タスク4: 入出力インターフェースの定義

**目的**: 入力データ形式と出力データ形式を明確化する

**実行手順**:

1. タスク指示書の入力・出力セクションを参照する
2. 以下のインターフェースを定義する:

```typescript
// 入力: 検索結果セット
type ResultSets = Map<"keyword" | "semantic" | "graph", SearchResult[]>;

// 入力: 検索重み（Query Classifierから）
interface SearchWeights {
  keyword: number; // 0-1
  semantic: number; // 0-1
  graph: number; // 0-1
}

// 出力: 統合・リランキング済み結果
interface FusedSearchResult {
  chunkId: ChunkId;
  content: string;
  fusedScore: number;
  rerankedScore?: number;
  sources: Array<{
    strategy: "keyword" | "semantic" | "graph";
    rank: number;
    score: number;
  }>;
  metadata: Record<string, unknown>;
}
```

**期待される成果物**:

- `outputs/phase-1/interface-definition.md` - インターフェース定義ドキュメント

---

## 参照資料

| 参照資料                | パス                                                                         | 内容                           |
| ----------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| タスク指示書            | `docs/30-workflows/unassigned-task/task-07-05-rrf-fusion-reranking.md`       | 元のタスク指示                 |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | SearchQuery/SearchResult型定義 |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`      | HybridRAG全体設計              |
| コアインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`       | Result型等のコア型定義         |

---

## 成果物

| 成果物               | パス                                             | 内容           |
| -------------------- | ------------------------------------------------ | -------------- |
| 機能要件             | `outputs/phase-1/requirements.md`                | 機能要件一覧   |
| 非機能要件           | `outputs/phase-1/non-functional-requirements.md` | 非機能要件一覧 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`         | AC一覧         |
| インターフェース定義 | `outputs/phase-1/interface-definition.md`        | 型定義         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1のアクション**: 接続要件（API/認証/データフロー）を要件に明記

- Cohere API / Voyage AI API の認証要件を文書化
- 3つの検索戦略からのデータフローを明確化
- HybridRAG Searcherとの統合ポイントを特定

---

## 完了条件

- [ ] 機能要件ドキュメントが作成されている
- [ ] 非機能要件ドキュメントが作成されている
- [ ] 受け入れ基準（14項目）が策定されている
- [ ] 入出力インターフェース定義が完了している
- [ ] 外部API（Cohere/Voyage）の認証要件が文書化されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: -
- **後続**: Phase 2 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/rrf-fusion-reranking/phase-2-design.md`
