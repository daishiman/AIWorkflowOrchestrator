# グラフ検索戦略（GraphSearchStrategy）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [interfaces-rag-search.md](./interfaces-rag-search.md)

Knowledge Graphを活用したエンティティベース・コミュニティサマリベース・関係パスベースの検索戦略。

**実装場所**: `packages/shared/src/services/search/strategies/graph-search-strategy.ts`

---

## GraphSearchStrategyインターフェース

| メソッド     | 戻り値                                     | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | グラフ検索実行     |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得 |
| name         | "graph"                                    | 戦略名（readonly） |

---

## クエリタイプ

| queryType    | 説明                                       | フォールバック            |
| ------------ | ------------------------------------------ | ------------------------- |
| local        | エンティティベースの詳細検索（デフォルト） | -                         |
| global       | コミュニティサマリベースの俯瞰検索         | localSearch               |
| relationship | エンティティ間のパス・関係検索             | 1エンティティ→localSearch |

---

## GraphSearchOptions

| オプション         | 型       | デフォルト | 説明                                    |
| ------------------ | -------- | ---------- | --------------------------------------- |
| queryType          | string   | "local"    | 検索タイプ（local/global/relationship） |
| entityThreshold    | number   | 0.5        | エンティティ類似度閾値（0-1）           |
| communityThreshold | number   | -          | コミュニティ類似度閾値（0-1）           |
| traversalDepth     | number   | 3          | トラバーサル深度（1-5）                 |
| relationTypes      | string[] | -          | 関係タイプフィルタ                      |

---

## 依存インターフェース

| インターフェース     | 必須 | 説明                      |
| -------------------- | ---- | ------------------------- |
| IKnowledgeGraphStore | ✅   | Knowledge Graphストレージ |
| IEmbeddingProvider   | ✅   | 埋め込み生成プロバイダー  |
| ICommunitySummarizer |      | コミュニティサマリ検索    |

---

## スコアリング

| 検索タイプ   | 計算式                                              |
| ------------ | --------------------------------------------------- |
| local        | `entitySimilarity × 0.6 + chunkRelevance × 0.4`     |
| relationship | `(1 / (1 + distance)) × 0.5 + chunkRelevance × 0.5` |
| global       | `summary.confidence`（コミュニティサマリの信頼度）  |

---

## 定数

| 定数名                   | 値   | 説明                       |
| ------------------------ | ---- | -------------------------- |
| MAX_QUERY_LENGTH         | 1000 | クエリ最大文字数           |
| MIN_LIMIT                | 1    | 最小取得件数               |
| MAX_LIMIT                | 100  | 最大取得件数               |
| DEFAULT_ENTITY_THRESHOLD | 0.5  | デフォルト類似度閾値       |
| DEFAULT_TRAVERSAL_DEPTH  | 3    | デフォルトトラバーサル深度 |
| MAX_TRAVERSAL_DEPTH      | 5    | 最大トラバーサル深度       |

---

## テスト品質

- **69テストケース**
- **94.54% Line Coverage**, **90.21% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/graph-search-strategy/outputs/phase-12/implementation-guide.md`

---

## 関連ドキュメント

- [検索クエリ・結果型定義](./rag-search-types.md)
- [キーワード検索戦略](./rag-search-keyword.md)
- [ベクトル検索戦略](./rag-search-vector.md)
- [Knowledge Graph型定義](./rag-knowledge-graph.md)
