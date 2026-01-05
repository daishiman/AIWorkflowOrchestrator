# HybridRAG 検索エンジン - タスク指示書

## メタ情報

| 項目             | 内容                                          |
| ---------------- | --------------------------------------------- |
| タスクID         | CONV-07                                       |
| タスク名         | HybridRAG検索エンジン（GraphRAG + VectorRAG） |
| 分類             | 要件/新規機能                                 |
| 対象機能         | ファイル変換システム（RAG基盤）               |
| 優先度           | 高                                            |
| 見積もり規模     | 大規模                                        |
| ステータス       | 未実施                                        |
| 発見元           | HybridRAGアーキテクチャ設計                   |
| 発見日           | 2025-12-15                                    |
| 発見エージェント | .claude/agents/logic-dev.md                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

RAGシステムの検索精度を最大化するためには、**HybridRAG**（GraphRAG + VectorRAG統合）が必要。2025年の最新ベンチマークでは、VectorRAG単体の57.50%に対し、HybridRAGは**90%+**の正解率を達成（Lettria 2025, AWS GraphRAG研究）。

#### 検索アプローチ比較

| アプローチ    | グローバルクエリ | ローカルクエリ | 複数エンティティ | 総合精度 |
| ------------- | ---------------- | -------------- | ---------------- | -------- |
| VectorRAG単体 | 0%               | 高             | 低下             | 57.50%   |
| GraphRAG単体  | 高               | 中             | 高               | 81.67%   |
| **HybridRAG** | **高**           | **高**         | **高**           | **90%+** |

### 1.2 問題点・課題

- キーワード検索のみでは意味的類似性を捉えられない
- ベクトル検索のみでは固有名詞・専門用語の完全一致に弱い
- **VectorRAG単体ではグローバルクエリに対応不可**（正解率0%）
- **エンティティ間の関係性・因果関係を捉えられない**
- **5つ以上のエンティティを含むクエリで精度が著しく低下**
- 複数検索結果のマージ戦略が必要
- クエリの意図に応じた検索モード切り替え
- リランキングによる精度向上の余地
- **コンテキスト不十分時のハルシネーション**（Google ICLR 2025研究）
- **取得ドキュメントの関連性評価**（Corrective RAG研究）

### 1.3 放置した場合の影響

- RAG精度が57.50%（VectorRAG単体）に留まる
- グローバルクエリ（「全体のテーマは？」等）に回答できない
- 関係性・因果関係の質問に対応できない
- マルチホップ推論が困難
- ユーザーが期待する情報を取得できない
- 無関係なコンテキストがLLMに渡され、ハルシネーションが増加

---

## 2. 何を達成するか（What）

### 2.1 目的

FTS5（BM25）、DiskANN（ベクトル検索）、**Knowledge Graph（グラフ検索）**を統合したHybridRAG検索エンジンを実装し、4段階パイプラインで90%+の精度を達成する。

### 2.2 最終ゴール

- **キーワード検索**: FTS5によるBM25スコアリング
- **セマンティック検索**: DiskANNによるコサイン類似度検索
- **グラフ検索**: Knowledge Graphによるエンティティ・関係性検索
- **コミュニティ検索**: Leidenコミュニティ要約によるグローバルクエリ対応
- **HybridRAG統合**: Triple Search + RRFによるスコア統合
- **クエリ分類**: ローカル/グローバル/関係性クエリの自動判別
- **クエリ拡張**: 同義語・関連語によるクエリ強化
- **リランキング**: Cross-Encoderによる精度向上
- **CRAG**: Corrective RAGによる関連性評価と修正
- **検索API**: 統一されたインターフェース

### 2.3 スコープ

#### 含むもの

- **検索サービス抽象化レイヤー**（Triple Search対応）
- FTS5検索実装（キーワード）
- ベクトル検索実装（セマンティック）
- **グラフ検索実装**（エンティティ・関係性・コミュニティ）
- **クエリ分類器**（ローカル/グローバル/関係性クエリ判別）
- RRFスコア統合（3ソース対応）
- クエリ前処理（トークナイズ、正規化）
- クエリ拡張
- Cohere Rerank 4 / Qwen3-Reranker統合
- 検索結果のページネーション
- フィルタリング（日付、ファイルタイプ等）
- **Corrective RAG（CRAG）**: 取得結果の関連性評価と修正
- **Selective Generation**: コンテキスト充足性に基づく回答生成判断
- **Intent Matching**: クエリ意図と結果の整合性検証

#### 含まないもの

- 埋め込み生成（CONV-06で対応）
- Knowledge Graph構築（CONV-08で対応）
- UIでの検索インターフェース
- 検索履歴・分析機能

### 2.4 成果物

- `packages/shared/src/services/search/` - 検索サービスディレクトリ
- `packages/shared/src/services/search/hybridrag-search-service.ts` - HybridRAGメインサービス
- `packages/shared/src/services/search/strategies/keyword-search.ts` - キーワード検索
- `packages/shared/src/services/search/strategies/vector-search.ts` - ベクトル検索
- `packages/shared/src/services/search/strategies/graph-search.ts` - グラフ検索
- `packages/shared/src/services/search/query-classifier.ts` - クエリ分類器
- `packages/shared/src/services/search/fusion/rrf-fusion.ts` - RRFスコア統合
- `packages/shared/src/services/search/reranker/` - リランカー
- `packages/shared/src/services/search/crag/` - Corrective RAG
- 設定ファイル（検索パラメータ）
- ユニットテスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-04（データベース・インデックス）完了
- CONV-06（埋め込み生成）完了
- **CONV-08（Knowledge Graph構築）完了**
- FTS5仮想テーブル作成済み
- DiskANNインデックス作成済み
- **Knowledge Graph（entities, relations, communities）構築済み**

### 3.2 依存タスク

- CONV-04: データベーススキーマ（FTS5/DiskANNインデックス、グラフテーブル）
- CONV-06: 埋め込み生成パイプライン（ベクトルデータ）
- **CONV-08: Knowledge Graph構築（エンティティ、関係性、コミュニティ）**
- CONV-03: JSONスキーマ定義（SearchQuery/SearchResult型）

### 3.3 必要な知識・スキル

- 情報検索理論（BM25、TF-IDF）
- ベクトル検索アルゴリズム
- **グラフ検索・トラバーサルアルゴリズム**
- **クエリ分類（ローカル/グローバル/関係性）**
- RRF（Reciprocal Rank Fusion）
- SQLite FTS5クエリ構文
- TypeScript

### 3.4 推奨アプローチ

1. 検索サービスインターフェースを定義（Triple Search対応）
2. クエリ分類器を実装
3. FTS5検索を実装（キーワード）
4. ベクトル検索を実装（セマンティック）
5. **グラフ検索を実装（エンティティ・コミュニティ）**
6. RRF統合を実装（3ソース対応）
7. リランキング統合
8. CRAG（Corrective RAG）統合

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

検索要件・精度目標・パフォーマンス要件を明確化する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements hybrid-search-engine
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: 検索アルゴリズム・ビジネスロジック実装に特化
- **代替候補**: .claude/agents/gateway-dev.md（外部API統合が中心の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名             | 活用方法           | 選定理由           |
| -------------------- | ------------------ | ------------------ |
| .claude/skills/query-optimization/SKILL.md   | 検索クエリの最適化 | パフォーマンス確保 |
| .claude/skills/api-client-patterns/SKILL.md  | リランカーAPI統合  | 外部API呼び出し    |
| .claude/skills/type-safety-patterns/SKILL.md | 検索結果の型安全性 | 実行時エラー防止   |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 検索エンジン要件定義書
- 精度目標・評価指標
- パフォーマンス要件

#### 完了条件

- [ ] 検索モード（keyword/semantic/hybrid）の仕様が決定
- [ ] RRFパラメータ（k値）が決定
- [ ] リランキング要否が決定

---

### Phase 1: 設計

#### 目的

検索サービスのアーキテクチャ設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:design-architecture hybrid-search-engine
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/arch-police.md
- **選定理由**: クリーンアーキテクチャに基づいた設計検証
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法               | 選定理由           |
| ---------------------- | ---------------------- | ------------------ |
| .claude/skills/solid-principles/SKILL.md       | 検索戦略の抽象化       | 拡張性の確保       |
| .claude/skills/architectural-patterns/SKILL.md | Strategyパターンの適用 | 検索モード切り替え |
| .claude/skills/repository-pattern/SKILL.md     | データアクセスの抽象化 | テスタビリティ向上 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- アーキテクチャ設計書
- 検索サービスインターフェース定義
- シーケンス図

#### 完了条件

- [ ] 検索サービスインターフェースが定義
- [ ] 各戦略クラスの設計が完了
- [ ] RRF統合の設計が完了

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:implement-business-logic keyword-search
/ai:implement-business-logic vector-search
/ai:implement-business-logic rrf-fusion
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

- キーワード検索実装
- ベクトル検索実装
- RRF統合実装
- クエリ前処理実装

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] キーワード検索が動作（BM25）
- [ ] セマンティック検索が動作（コサイン類似度）
- [ ] **グラフ検索が動作（エンティティ・関係性検索）**
- [ ] **コミュニティ検索が動作（グローバルクエリ対応）**
- [ ] **クエリ分類が動作（ローカル/グローバル/関係性）**
- [ ] HybridRAG検索が動作（Triple Search + RRF統合）
- [ ] クエリ前処理が動作（正規化、トークナイズ）
- [ ] フィルタリングが動作（日付、ファイルタイプ）
- [ ] ページネーションが動作
- [ ] 検索モード切り替えが可能
- [ ] **CRAG（関連性評価・修正）が動作**
- [ ] **Selective Generation（充足性判定）が動作**

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上
- [ ] 1000件データで検索が100ms以内
- [ ] **HybridRAG精度が90%以上（ベンチマークテスト）**
- [ ] **グローバルクエリ対応率80%以上**

### ドキュメント要件

- [ ] 各サービスのJSDocが記述
- [ ] 検索パラメータ調整ガイドが整備
- [ ] RRFパラメータのチューニング手順が文書化

---

## 6. 検証方法

### テストケース

1. キーワード検索の正常動作
2. セマンティック検索の正常動作
3. **グラフ検索の正常動作（エンティティ検索）**
4. **グラフ検索の正常動作（関係性検索）**
5. **コミュニティ検索の正常動作（グローバルクエリ）**
6. **クエリ分類の正確性（ローカル/グローバル/関係性）**
7. HybridRAG検索のスコア統合（Triple Search + RRF）
8. 空クエリのハンドリング
9. 大量データ（10000件）でのパフォーマンス
10. フィルタリングの正確性
11. ページネーションの動作
12. **CRAG関連性評価の正確性**
13. **Selective Generationの充足性判定**
14. **マルチホップ検索の動作**

### 検証手順

1. `pnpm --filter @repo/shared test:run` でユニットテスト実行
2. サンプルデータでの精度評価（Recall@10, MRR, NDCG）
3. パフォーマンスベンチマーク
4. **グローバルクエリ評価（「全体のテーマは？」等）**
5. **関係性クエリ評価（「AとBの関係は？」等）**
6. **HybridRAG総合精度評価（目標: 90%+）**

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                  |
| ----------------------------- | ------ | -------- | ------------------------------------- |
| RRFパラメータの最適化困難     | 中     | 中       | A/Bテスト、グリッドサーチ             |
| 大量データでの検索遅延        | 高     | 中       | インデックス最適化、キャッシュ導入    |
| FTS5とベクトル検索の結果乖離  | 中     | 中       | 重み付け調整、クエリ分類              |
| リランカーAPI遅延             | 中     | 低       | タイムアウト設定、フォールバック      |
| **グラフ検索の計算コスト**    | 中     | 中       | トラバーサル深度制限、キャッシュ      |
| **クエリ分類の誤判定**        | 高     | 中       | LLM分類の精度検証、フォールバック戦略 |
| **Knowledge Graph不整合**     | 高     | 低       | CONV-08との統合テスト強化             |
| **Triple Search結果のマージ** | 中     | 中       | 重み付け調整、クエリタイプ別最適化    |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- `docs/30-workflows/unassigned-task/architecture-overview-rag-pipeline.md` - HybridRAGアーキテクチャ概要
- CONV-03: JSONスキーマ定義（SearchQuery/SearchResult型）
- CONV-04: データベース設計（FTS5/DiskANNインデックス、グラフテーブル）
- CONV-06: 埋め込み生成パイプライン（入力データ）
- **CONV-08: Knowledge Graph構築（エンティティ、関係性、コミュニティ）**

### 参考資料

- [Reciprocal Rank Fusion Explained](https://www.assembled.com/blog/understanding-reciprocal-rank-fusion)
- [SQLite FTS5 Documentation](https://www.sqlite.org/fts5.html)
- [libSQL Vector Search](https://turso.tech/blog/turso-native-vector-search-now-in-beta)
- [Cohere Rerank 4](https://cohere.com/rerank) - 32Kコンテキスト、自己学習対応
- [Google Sufficient Context (ICLR 2025)](https://arxiv.org/abs/2411.06037) - 選択的生成
- [Corrective RAG Paper](https://arxiv.org/abs/2401.15884) - 関連性評価と修正
- [Agentic RAG Survey](https://arxiv.org/abs/2501.09136) - マルチエージェントRAG
- [RAGAS: RAG Evaluation](https://docs.ragas.io/) - 評価フレームワーク
- **[Microsoft GraphRAG](https://github.com/microsoft/graphrag)** - Knowledge Graph構築参照実装
- **[GraphRAG: Query-Focused Summarization](https://arxiv.org/abs/2404.16130)** - コミュニティ検出・要約
- **[HybridRAG Paper](https://arxiv.org/abs/2408.04948)** - GraphRAG + VectorRAG統合
- **[AWS GraphRAG Implementation](https://aws.amazon.com/blogs/machine-learning/improving-retrieval-augmented-generation-accuracy-with-graphrag/)** - ベンチマーク参照
- **[Lettria HybridRAG Benchmark](https://www.lettria.com/blogpost/hybrid-rag-combining-graph-rag-and-vector-rag)** - 90%+精度検証

---

## 9. 備考

### HybridRAG 4段階パイプライン

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     HybridRAG 4段階検索パイプライン                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [クエリ]                                                                   │
│      │                                                                      │
│      ▼                                                                      │
│  ┌──────────────────┐                                                       │
│  │ Stage 1: クエリ分類 │  ローカル / グローバル / 関係性                      │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │              Stage 2: Triple Search（並列実行）               │          │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │          │
│  │  │ BM25検索   │  │ Vector検索 │  │ Graph検索              │ │          │
│  │  │ (FTS5)     │  │ (DiskANN)  │  │ (Entity/Community)     │ │          │
│  │  └─────┬──────┘  └─────┬──────┘  └──────────┬─────────────┘ │          │
│  │        │               │                     │               │          │
│  │        └───────────────┼─────────────────────┘               │          │
│  │                        ▼                                      │          │
│  │                  RRF Fusion                                   │          │
│  └──────────────────────────────────────────────────────────────┘          │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │ Stage 3: Reranking │  Cohere Rerank 4 / Qwen3-Reranker                   │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │              Stage 4: CRAG + Intent Matching                  │          │
│  │  ┌─────────────────┐  ┌──────────────────┐                   │          │
│  │  │ 関連性評価      │  │ 意図整合性検証   │                   │          │
│  │  │ Correct/Ambiguous│  │ Query ↔ Result   │                   │          │
│  │  │ /Incorrect       │  │                  │                   │          │
│  │  └────────┬────────┘  └────────┬─────────┘                   │          │
│  │           └────────────────────┘                              │          │
│  └──────────────────────────────────────────────────────────────┘          │
│           │                                                                 │
│           ▼                                                                 │
│  [検索結果]  精度目標: 90%+                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 推奨実装構造

```typescript
// =============================================================================
// HybridRAG検索サービスインターフェース
// =============================================================================
interface HybridRAGSearchService {
  search(query: HybridRAGQuery): Promise<HybridRAGResult>;
}

interface HybridRAGQuery {
  text: string;
  mode: "keyword" | "semantic" | "graph" | "hybridrag";
  limit: number;
  offset?: number;
  filters?: SearchFilters;
  weights?: SearchWeights;
}

interface SearchWeights {
  keyword: number; // 0-1
  semantic: number; // 0-1
  graph: number; // 0-1
}

interface SearchFilters {
  fileTypes?: string[];
  dateRange?: { from: Date; to: Date };
  workspaceIds?: string[];
}

interface HybridRAGResult {
  chunks: ScoredChunk[];
  queryType: QueryType;
  searchSources: SearchSource[];
  cragEvaluation: CRAGEvaluation;
  sufficiency: SufficiencyEvaluation;
}

// =============================================================================
// クエリ分類器（Stage 1）
// =============================================================================
type QueryType = "local" | "global" | "relationship";

interface QueryClassifier {
  classify(query: string): Promise<QueryClassification>;
}

interface QueryClassification {
  type: QueryType;
  confidence: number;
  entities?: string[]; // 抽出されたエンティティ
  relationHint?: string; // 関係性クエリの場合のヒント
}

class LLMQueryClassifier implements QueryClassifier {
  async classify(query: string): Promise<QueryClassification> {
    // LLMでクエリタイプを分類
    // - "全体のテーマは？" → global
    // - "AとBの関係は？" → relationship
    // - "Xについて教えて" → local
  }
}

// =============================================================================
// 検索戦略（Strategy パターン）
// =============================================================================
interface SearchStrategy {
  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<ScoredChunk[]>;
}

class KeywordSearchStrategy implements SearchStrategy {
  // FTS5 BM25検索
  async search(query: string, limit: number): Promise<ScoredChunk[]> {
    const sql = `
      SELECT c.*, bm25(content_chunks_fts) as score
      FROM content_chunks_fts
      JOIN content_chunks c ON content_chunks_fts.rowid = c.rowid
      WHERE content_chunks_fts MATCH ?
      ORDER BY score
      LIMIT ?
    `;
    // ...
  }
}

class SemanticSearchStrategy implements SearchStrategy {
  constructor(private embeddingProvider: EmbeddingProvider) {}

  async search(query: string, limit: number): Promise<ScoredChunk[]> {
    const queryEmbedding = await this.embeddingProvider.embed([query]);
    const sql = `
      SELECT *, vector_distance_cos(embedding, ?) as distance
      FROM content_chunks
      ORDER BY distance
      LIMIT ?
    `;
    // ...
  }
}

// =============================================================================
// グラフ検索戦略（GraphRAG）
// =============================================================================
interface GraphSearchStrategy {
  // エンティティベース検索（ローカルクエリ用）
  searchByEntity(query: string, limit: number): Promise<GraphSearchResult[]>;

  // コミュニティベース検索（グローバルクエリ用）
  searchByCommunity(query: string, limit: number): Promise<GraphSearchResult[]>;

  // 関係性ベース検索（関係性クエリ用）
  searchByRelation(
    entities: string[],
    relationHint: string,
    limit: number,
  ): Promise<GraphSearchResult[]>;

  // マルチホップ検索
  multiHopSearch(
    startEntity: string,
    maxHops: number,
    limit: number,
  ): Promise<GraphSearchResult[]>;
}

class KnowledgeGraphSearchStrategy implements GraphSearchStrategy {
  constructor(private graphStore: KnowledgeGraphStore) {}

  async searchByEntity(
    query: string,
    limit: number,
  ): Promise<GraphSearchResult[]> {
    // エンティティ名/説明の類似検索 + 関連チャンク取得
    const entities = await this.graphStore.findSimilarEntities(query, limit);
    return this.resolveToChunks(entities);
  }

  async searchByCommunity(
    query: string,
    limit: number,
  ): Promise<GraphSearchResult[]> {
    // コミュニティ要約の類似検索
    const communities = await this.graphStore.searchCommunitySummaries(
      query,
      limit,
    );
    return this.resolveCommunitiesToChunks(communities);
  }

  async searchByRelation(
    entities: string[],
    relationHint: string,
    limit: number,
  ): Promise<GraphSearchResult[]> {
    // エンティティ間の関係を辿って関連チャンク取得
    const relations = await this.graphStore.findRelations(
      entities,
      relationHint,
    );
    return this.resolveRelationsToChunks(relations);
  }

  async multiHopSearch(
    startEntity: string,
    maxHops: number,
    limit: number,
  ): Promise<GraphSearchResult[]> {
    // グラフトラバーサルで関連エンティティを探索
    const traversalResult = await this.graphStore.traverse(
      startEntity,
      maxHops,
    );
    return this.resolveTraversalToChunks(traversalResult);
  }
}

interface GraphSearchResult {
  chunk: ScoredChunk;
  source: "entity" | "community" | "relation" | "traversal";
  relevantEntities: string[];
  relevantRelations?: string[];
}

// =============================================================================
// RRF（Reciprocal Rank Fusion）- Triple Search対応
// =============================================================================
class RRFFusion {
  constructor(private k: number = 60) {} // RRF定数（通常60）

  fuse(
    results: Map<string, ScoredChunk[]>,
    weights?: SearchWeights,
  ): ScoredChunk[] {
    const scores = new Map<string, number>();
    const defaultWeight = 1.0;

    for (const [source, chunks] of results) {
      const weight = weights?.[source as keyof SearchWeights] ?? defaultWeight;
      chunks.forEach((chunk, rank) => {
        const rrfScore = (weight * 1) / (this.k + rank + 1);
        const current = scores.get(chunk.id) || 0;
        scores.set(chunk.id, current + rrfScore);
      });
    }

    // スコア降順でソート
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({ ...getChunkById(id), score }));
  }
}

// =============================================================================
// HybridRAG検索サービス（Triple Search）
// =============================================================================
class HybridRAGSearchService implements HybridRAGSearchService {
  constructor(
    private keywordStrategy: KeywordSearchStrategy,
    private semanticStrategy: SemanticSearchStrategy,
    private graphStrategy: KnowledgeGraphSearchStrategy,
    private queryClassifier: QueryClassifier,
    private fusion: RRFFusion,
    private reranker: Reranker,
    private cragService: CorrectiveRAGService,
  ) {}

  async search(query: HybridRAGQuery): Promise<HybridRAGResult> {
    // Stage 1: クエリ分類
    const classification = await this.queryClassifier.classify(query.text);

    // Stage 2: Triple Search（並列実行）
    const searchPromises: Promise<ScoredChunk[]>[] = [];
    const searchSources: SearchSource[] = [];

    // キーワード検索
    searchPromises.push(
      this.keywordStrategy.search(query.text, query.limit * 2),
    );
    searchSources.push("keyword");

    // セマンティック検索
    searchPromises.push(
      this.semanticStrategy.search(query.text, query.limit * 2),
    );
    searchSources.push("semantic");

    // グラフ検索（クエリタイプに応じて最適化）
    const graphResults = await this.getGraphResults(query, classification);
    searchPromises.push(Promise.resolve(graphResults));
    searchSources.push("graph");

    const [keywordResults, semanticResults, graphChunks] =
      await Promise.all(searchPromises);

    // RRF Fusion（重み付け）
    const weights = this.getWeights(classification.type, query.weights);
    let fusedResults = this.fusion.fuse(
      new Map([
        ["keyword", keywordResults],
        ["semantic", semanticResults],
        ["graph", graphChunks],
      ]),
      weights,
    );

    // Stage 3: Reranking
    fusedResults = await this.reranker.rerank(
      query.text,
      fusedResults.slice(0, query.limit * 2),
    );

    // Stage 4: CRAG + Intent Matching
    const cragEvaluation = await this.cragService.evaluateRelevance(
      query.text,
      fusedResults,
    );
    const correctedResults = await this.cragService.correctiveAction(
      query.text,
      cragEvaluation,
      fusedResults,
    );

    // Selective Generation判定
    const sufficiency = await this.evaluateSufficiency(
      query.text,
      correctedResults.chunks,
    );

    return {
      chunks: correctedResults.chunks.slice(0, query.limit),
      queryType: classification.type,
      searchSources,
      cragEvaluation,
      sufficiency,
    };
  }

  private async getGraphResults(
    query: HybridRAGQuery,
    classification: QueryClassification,
  ): Promise<ScoredChunk[]> {
    switch (classification.type) {
      case "global":
        // グローバルクエリ → コミュニティ検索
        return this.graphStrategy.searchByCommunity(
          query.text,
          query.limit * 2,
        );
      case "relationship":
        // 関係性クエリ → 関係性検索
        return this.graphStrategy.searchByRelation(
          classification.entities || [],
          classification.relationHint || "",
          query.limit * 2,
        );
      case "local":
      default:
        // ローカルクエリ → エンティティ検索
        return this.graphStrategy.searchByEntity(query.text, query.limit * 2);
    }
  }

  private getWeights(
    queryType: QueryType,
    customWeights?: SearchWeights,
  ): SearchWeights {
    if (customWeights) return customWeights;

    // クエリタイプに応じたデフォルト重み
    switch (queryType) {
      case "global":
        return { keyword: 0.2, semantic: 0.3, graph: 0.5 };
      case "relationship":
        return { keyword: 0.2, semantic: 0.2, graph: 0.6 };
      case "local":
      default:
        return { keyword: 0.35, semantic: 0.35, graph: 0.3 };
    }
  }
}
```

### RRFパラメータガイドライン（Triple Search）

| パラメータ               | 推奨値         | 説明                                         |
| ------------------------ | -------------- | -------------------------------------------- |
| k                        | 60             | RRF定数。大きいほど順位差が縮まる            |
| limit倍率                | 2x             | 各戦略から取得する件数（最終の2倍）          |
| **ローカルクエリ重み**   | 0.35:0.35:0.30 | keyword:semantic:graph（ローカルクエリ用）   |
| **グローバルクエリ重み** | 0.20:0.30:0.50 | keyword:semantic:graph（グローバルクエリ用） |
| **関係性クエリ重み**     | 0.20:0.20:0.60 | keyword:semantic:graph（関係性クエリ用）     |

### クエリタイプ別検索最適化

| クエリタイプ     | 例                      | 主要検索源       | Graph検索モード  |
| ---------------- | ----------------------- | ---------------- | ---------------- |
| **local**        | 「Reactについて教えて」 | Vector + Keyword | エンティティ検索 |
| **global**       | 「全体のテーマは？」    | Graph            | コミュニティ検索 |
| **relationship** | 「AとBの関係は？」      | Graph            | 関係性検索       |

### リランキングモデル選定基準（2025年12月時点）

| モデル                | 精度 | 速度 | コスト               | コンテキスト | 備考                           |
| --------------------- | ---- | ---- | -------------------- | ------------ | ------------------------------ |
| **Cohere Rerank 4**   | 最高 | 中   | $2/1000 queries      | 32K          | 自己学習、Cross-Encoder        |
| **Qwen3-Reranker-8B** | 最高 | 中   | 無料（セルフホスト） | -            | MTEB 1位、長文・複雑クエリ◎    |
| Zerank 2              | 高   | 高   | 有料                 | -            | 本番推奨、速度と精度のバランス |
| mxbai-rerank-large-v2 | 高   | 高   | 無料（Apache 2.0）   | -            | Qwen2.5ベース、1.5Bパラメータ  |
| Voyage Reranker       | 高   | 中   | $0.05/1M tokens      | -            | コスト効率良                   |
| BGE Reranker Large    | 高   | 高   | 無料（セルフホスト） | -            | オンプレミス向け               |

> **推奨（2025年12月更新）**:
>
> - **本番環境（API）**: Cohere Rerank 4（32Kコンテキスト、自己学習）
> - **本番環境（精度重視）**: Qwen3-Reranker-8B
> - **本番環境（速度重視）**: Zerank 2
> - **オンプレミス/OSS**: mxbai-rerank-large-v2（Apache 2.0）
>
> ※ リランキングで最大48%の検索品質向上（Databricks研究）

### Corrective RAG（CRAG）アーキテクチャ

2025年のRAG研究で注目される**Corrective RAG**は、取得したドキュメントの関連性を評価し、必要に応じて修正を行う。

#### CRAGワークフロー

```
クエリ → 検索 → 関連性評価 → 修正アクション → 生成
                    │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Correct  Ambiguous Incorrect
          │        │        │
          ▼        ▼        ▼
       知識抽出  両方併用  Web検索
```

#### 実装例

```typescript
interface CorrectiveRAGService {
  // 関連性評価（3段階: Correct / Ambiguous / Incorrect）
  evaluateRelevance(
    query: string,
    chunks: SearchResult[],
  ): Promise<RelevanceEvaluation[]>;

  // 修正アクション
  correctiveAction(
    query: string,
    evaluation: RelevanceEvaluation[],
    originalChunks: SearchResult[],
  ): Promise<CorrectedContext>;
}

interface RelevanceEvaluation {
  chunkId: string;
  confidence: "correct" | "ambiguous" | "incorrect";
  score: number; // 0-1
}

// 関連性評価プロンプト（T5-large fine-tuned推奨）
const evaluationPrompt = `
Query: {query}
Document: {chunk_content}

このドキュメントはクエリに関連していますか？
- correct: 直接関連している
- ambiguous: 部分的に関連
- incorrect: 関連していない
`;
```

### Selective Generation（Google ICLR 2025）

Googleの研究により、**コンテキストが十分かどうか**を判断し、不十分な場合は回答を控える「選択的生成」が有効であることが実証された。

#### 主な発見

| モデルタイプ                                | 十分なコンテキスト   | 不十分なコンテキスト   |
| ------------------------------------------- | -------------------- | ---------------------- |
| 大規模LLM（GPT-4o, Claude 3.5, Gemini Pro） | 高精度で回答         | **回答を控えず誤回答** |
| 小規模LLM（Llama, Mistral, Gemma）          | ハルシネーション多発 | 回答を控えることが多い |

#### 実装方法

```typescript
interface SelectiveGenerationService {
  // コンテキスト充足性を評価（93%精度で判定可能）
  evaluateSufficiency(
    query: string,
    context: SearchResult[],
  ): Promise<SufficiencyEvaluation>;

  // 充足性に基づいて回答生成を判断
  shouldGenerate(evaluation: SufficiencyEvaluation): boolean;
}

interface SufficiencyEvaluation {
  isSufficient: boolean;
  confidence: number;
  missingInfo?: string[];
}
```

> **効果**: 正解率が2-10%向上（Gemini, GPT, Gemmaで検証済み）

### RAG評価指標（RAGAS）

RAGシステムの品質を定量的に評価するためのフレームワーク。

#### 主要メトリクス

| メトリクス            | 測定対象             | 説明                                   |
| --------------------- | -------------------- | -------------------------------------- |
| **Faithfulness**      | 生成の忠実性         | 回答が取得コンテキストに基づいているか |
| **Answer Relevancy**  | 回答の関連性         | 回答がクエリに適切に答えているか       |
| **Context Precision** | コンテキストの精度   | 取得した情報の関連度                   |
| **Context Recall**    | コンテキストの網羅性 | 必要な情報を漏れなく取得しているか     |

#### 検索評価メトリクス

| メトリクス      | 説明                        |
| --------------- | --------------------------- |
| **Recall@k**    | 上位k件に正解が含まれる割合 |
| **MRR**         | 正解の順位の逆数の平均      |
| **NDCG**        | 順位を考慮した関連度スコア  |
| **Precision@k** | 上位k件中の正解の割合       |

```typescript
interface RAGEvaluator {
  // 検索評価
  evaluateRetrieval(
    query: string,
    retrievedChunks: SearchResult[],
    groundTruth: string[],
  ): RetrievalMetrics;

  // 生成評価
  evaluateGeneration(
    query: string,
    context: SearchResult[],
    answer: string,
    groundTruth?: string,
  ): GenerationMetrics;
}

interface RetrievalMetrics {
  recallAt10: number;
  mrr: number;
  ndcg: number;
  precisionAt10: number;
}

interface GenerationMetrics {
  faithfulness: number;
  answerRelevancy: number;
  contextPrecision: number;
  contextRecall: number;
}
```

### 補足事項

- このタスクは**CONV-06（埋め込み生成）およびCONV-08（Knowledge Graph構築）完了後**に実装
- 検索精度の評価にはRecall@10、MRR、NDCG、**HybridRAG総合精度（目標90%+）**を使用
- 本番環境ではクエリキャッシュの導入を検討
- **Triple Search（BM25 + Vector + Graph）がHybridRAGのコア**
- **クエリ分類器（ローカル/グローバル/関係性）がGraph検索の最適化に重要**
- **CRAG + Selective GenerationでStage 4の精度向上を実現**
- **グローバルクエリ対応率80%以上を目標**（VectorRAG単体では0%）

### ベンチマーク目標（HybridRAG）

| 指標                   | 目標値   | 備考                            |
| ---------------------- | -------- | ------------------------------- |
| HybridRAG総合精度      | **90%+** | VectorRAG + GraphRAG統合        |
| グローバルクエリ対応率 | 80%+     | コミュニティ検索                |
| 関係性クエリ対応率     | 80%+     | 関係性検索                      |
| ローカルクエリ精度     | 85%+     | エンティティ + Vector + Keyword |
| 検索レイテンシ         | < 100ms  | 1000件データ、キャッシュ無し    |
| CRAG修正成功率         | 70%+     | Incorrect → Correct への修正    |
