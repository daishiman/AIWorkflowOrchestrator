# RAGサービス群（NER・Leiden・クエリ分類）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-rag.md](./architecture-rag.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                         |
| ---------- | ---------- | ------------------------------------------------ |
| v1.3.1     | 2026-03-21 | UT-RAG-08-002 実装完了反映: Task08 完了記録の HybridRAGFactory 状態を guidance stub から実装済み wiring へ補正 |
| v1.3.0     | 2026-03-20 | UT-RAG-08-002 実装準備: `LLMQueryClassifier` constructor 契約と `ILLMProvider` 要件を追記 |
| v1.2.0     | 2026-03-19 | Task08 完了記録追加（TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001） |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| v1.0.0     | 2025-01-20 | 初版作成                                         |

---

## 概要

RAGパイプラインを構成する主要サービス群。クエリ分類、エンティティ抽出（NER）、コミュニティ検出（Leiden Algorithm）を提供。

---

## クエリ分類器

### 概要

HybridRAG検索パイプラインの入口として、検索クエリを分析し最適な検索戦略を選択するコンポーネント。

### RAGパイプラインにおける位置づけ

クエリ分類器はHybridRAGの入口に位置し、ユーザークエリを分析して最適な検索戦略を決定する。

| ステップ | 処理内容               | 出力                           |
| -------- | ---------------------- | ------------------------------ |
| 1        | クエリ入力             | ユーザーの検索クエリ           |
| 2        | クエリ分類器           | クエリタイプの判定             |
| 3        | 検索重み決定           | K:S:G比率（Keyword/Semantic/Graph） |
| 4        | 検索実行               | 各検索方式による結果取得       |
| 5        | RRF統合                | Reciprocal Rank Fusionで統合   |
| 6        | 最終結果               | ランク付けされた検索結果       |

### アーキテクチャ

| 分類器                   | 特性                     | 用途           |
| ------------------------ | ------------------------ | -------------- |
| RuleBasedQueryClassifier | 高速、パターンマッチング | フォールバック |
| LLMQueryClassifier       | 高精度、コンテキスト理解 | 推奨           |

### クエリタイプと検索重み

| タイプ       | 特徴                 | K:S:G          |
| ------------ | -------------------- | -------------- |
| local        | 特定情報の検索       | 0.35:0.35:0.30 |
| global       | 全体概要の把握       | 0.20:0.30:0.50 |
| relationship | 関係性・比較の質問   | 0.20:0.20:0.60 |
| hybrid       | 判断困難時のバランス | 0.33:0.33:0.34 |

### 実装ファイル

| 種別         | パス                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 型定義       | `packages/shared/src/services/search/types.ts`                       |
| ルールベース | `packages/shared/src/services/search/rule-based-query-classifier.ts` |
| LLMベース    | `packages/shared/src/services/search/llm-query-classifier.ts`        |
| テスト       | `packages/shared/src/services/search/__tests__/`                     |

### 実装契約

| クラス | constructor | 補足 |
| --- | --- | --- |
| `RuleBasedQueryClassifier` | 引数なし | fallback と lite で使用 |
| `LLMQueryClassifier` | `(llmProvider: ILLMProvider, fallbackClassifier: IQueryClassifier)` | `ILLMClient` ではなく `ILLMProvider` を要求 |

`LLMQueryClassifier` を Factory から配線する場合は、`generate(prompt, options)` を持つ `ILLMProvider` を直接受け取るか、明示 adapter を別責務として用意する。`llm/types` 側 `ILLMClient` をそのまま渡す設計は不可。

### テスト品質

- **186テストケース**
- **94.13% Line Coverage**, **92.18% Branch Coverage**, **95.23% Function Coverage**

---

## エンティティ抽出サービス (NER)

### 概要

チャンクからエンティティを抽出し、Knowledge Graphのノード候補を生成するサービス。
RAGパイプラインにおいて、ドキュメントから構造化情報を抽出する中核コンポーネント。

### RAGパイプラインにおける位置づけ

NERサービスはドキュメント処理パイプラインにおいて、チャンキング後のテキストからエンティティを抽出し、Knowledge Graph構築の基盤を提供する。

**処理フロー**

| ステップ | 処理内容         | 説明                               |
| -------- | ---------------- | ---------------------------------- |
| 1        | ドキュメント入力 | 元となるドキュメントを受け取る     |
| 2        | 変換             | PDFやHTML等を処理可能形式に変換    |
| 3        | チャンキング     | テキストを意味的なチャンクに分割   |
| 4        | NER（本サービス）| チャンクからエンティティを抽出     |
| 5        | Knowledge Graph  | エンティティとリレーションを構築   |
| 6        | 検索             | グラフベースの検索が可能になる     |

**NERサービスの出力先テーブル**

| テーブル        | 格納内容                       |
| --------------- | ------------------------------ |
| entities        | 抽出されたエンティティ本体     |
| chunk_entities  | チャンクとエンティティの関連付け |
| graph_relations | エンティティ間の関係           |

### データフロー

1. **入力**: Chunk（テキスト断片）
2. **処理**: IEntityExtractor.extract()
3. **出力**: ExtractedEntity[]
4. **永続化**: entities + chunk_entities テーブルへ保存

### 抽出方式

| 方式         | 実装クラス               | 特性                                   |
| ------------ | ------------------------ | -------------------------------------- |
| LLMベース    | LLMEntityExtractor       | 高精度、未知エンティティ対応           |
| ルールベース | RuleBasedEntityExtractor | 高速、パターンマッチ、フォールバック用 |

### ExtractedEntity → EntityEntity 変換

NERサービスの出力（ExtractedEntity）は、Knowledge Graph永続化時にEntityEntityに変換される。

| ExtractedEntity | EntityEntity     | 変換ロジック                 |
| --------------- | ---------------- | ---------------------------- |
| name            | name             | そのまま                     |
| normalizedName  | normalizedName   | そのまま                     |
| type            | type             | EntityType enum にマッピング |
| confidence      | importance       | 初期重要度として使用         |
| description     | description      | そのまま（LLM生成時のみ）    |
| aliases         | aliases          | JSON配列として格納           |
| mentions        | → chunk_entities | 位置情報を中間テーブルへ保存 |

### 実装ファイル

| 種別         | パス                                                              |
| ------------ | ----------------------------------------------------------------- |
| サービス     | `packages/shared/src/services/extraction/`                        |
| LLM抽出器    | `packages/shared/src/services/extraction/entity-extractor.ts`     |
| ルール抽出器 | `packages/shared/src/services/extraction/rule-based-extractor.ts` |
| 型定義       | `packages/shared/src/services/extraction/types.ts`                |
| プロンプト   | `packages/shared/src/services/extraction/prompts/`                |
| テスト       | `packages/shared/src/services/extraction/__tests__/`              |

### 関連スキーマ

| テーブル        | 役割                             | 参照                                |
| --------------- | -------------------------------- | ----------------------------------- |
| entities        | エンティティ本体（ノード）       | `db/schema/graph/entities.ts`       |
| chunk_entities  | チャンクとエンティティの関連付け | `db/schema/graph/chunk-entities.ts` |
| graph_relations | エンティティ間の関係（エッジ）   | `db/schema/graph/relations.ts`      |

### テスト品質

- **224テストケース**（単体 + 統合 + E2E）
- **97.1% Line Coverage**, **96.8% Quality Score**

**詳細参照**: `docs/30-workflows/CONV-06-04-entity-extraction-ner/outputs/phase-12/implementation-guide.md`

---

## コミュニティ検出サービス (Leiden Algorithm)

### 概要

Knowledge Graphのエンティティを意味的に関連するグループ（コミュニティ）に自動分類するサービス。
GraphRAGにおいて、グラフ全体の構造を把握し、質問に対する包括的な回答を生成するための基盤を提供する。

### RAGパイプラインにおける位置づけ

コミュニティ検出サービスは、NERおよび関係抽出が完了した後に実行され、Knowledge Graph上のエンティティ群を意味的なコミュニティに分類する。検出されたコミュニティは、グローバルな質問への回答生成に活用される。

**処理フロー**

| ステップ | 処理内容              | 説明                                 |
| -------- | --------------------- | ------------------------------------ |
| 1        | ドキュメント入力      | 元となるドキュメントを受け取る       |
| 2        | 変換                  | PDFやHTML等を処理可能形式に変換      |
| 3        | チャンキング          | テキストを意味的なチャンクに分割     |
| 4        | NER                   | エンティティを抽出                   |
| 5        | 関係抽出              | エンティティ間の関係を抽出           |
| 6        | コミュニティ検出（本サービス） | Leidenアルゴリズムでグループ化 |
| 7        | 検索・要約            | コミュニティ情報を活用した検索       |

**コミュニティ検出サービスの出力先**

| 出力先            | 格納内容                             |
| ----------------- | ------------------------------------ |
| communities       | 検出されたコミュニティ               |
| entity_communities| エンティティとコミュニティのマッピング |
| Community Summary | コミュニティの要約（LLM生成）        |

### アーキテクチャ

CommunityDetectorはICommunityDetectorインターフェースを実装し、コミュニティ検出のコア機能を提供する。内部でLeidenAlgorithm（純粋関数）とICommunityRepository（永続化層）に依存する。

**CommunityDetectorのメソッド**

| メソッド                    | 説明                                 |
| --------------------------- | ------------------------------------ |
| detect()                    | Leidenアルゴリズムによるコミュニティ検出 |
| saveResults()               | 検出したコミュニティをDBに永続化     |
| getCommunitiesForEntity()   | エンティティの所属コミュニティを取得 |
| getCommunitiesByLevel()     | 指定レベルのコミュニティを取得       |
| getCommunityMembers()       | コミュニティのメンバーを取得         |

**依存コンポーネント**

| コンポーネント        | 種別         | 役割                           |
| --------------------- | ------------ | ------------------------------ |
| LeidenAlgorithm       | Pure Function| Leidenアルゴリズムの実装       |
| ICommunityRepository  | Persistence  | コミュニティの永続化インターフェース |

### Leidenアルゴリズム処理フロー

1. **Local Move Phase**: 各ノードを隣接ノードのコミュニティへ試行移動
2. **Refinement Phase**: コミュニティ内でさらにサブコミュニティを検出
3. **Aggregation Phase**: コミュニティをスーパーノードとして集約
4. **Hierarchy Build**: 階層構造を構築（level 0 → level N）

### 主要インターフェース

**ICommunityDetector**: コミュニティ検出サービスの抽象インターフェース

| メソッド                  | 説明                               |
| ------------------------- | ---------------------------------- |
| detect()                  | グラフからコミュニティを検出       |
| saveResults()             | 検出結果をDBに永続化               |
| getCommunitiesForEntity() | エンティティの所属コミュニティ取得 |
| getCommunitiesByLevel()   | レベル別コミュニティ取得           |
| getCommunityMembers()     | コミュニティのメンバー取得         |

**ICommunityRepository**: コミュニティ永続化の抽象インターフェース

| メソッド                      | 説明                                |
| ----------------------------- | ----------------------------------- |
| insert() / insertMany()       | コミュニティ挿入                    |
| findById() / findByEntityId() | コミュニティ検索                    |
| findByLevel()                 | レベル別検索                        |
| deleteAll()                   | 全削除（再検出時）                  |
| addEntityCommunityMapping()   | エンティティ-コミュニティマッピング |

### Community型

| プロパティ        | 型            | 説明                       |
| ----------------- | ------------- | -------------------------- |
| id                | CommunityId   | コミュニティ一意識別子     |
| level             | number        | 階層レベル（0が最下層）    |
| memberEntityIds   | EntityId[]    | 直接メンバーエンティティID |
| parentCommunityId | CommunityId?  | 親コミュニティID           |
| childCommunityIds | CommunityId[] | 子コミュニティID           |
| size              | number        | コミュニティサイズ         |
| modularity        | number        | モジュラリティ貢献         |

### 検出オプション (CommunityDetectionOptions)

| オプション       | デフォルト | 説明                          |
| ---------------- | ---------- | ----------------------------- |
| resolution       | 1.0        | 解像度（大→小コミュニティ多） |
| maxLevels        | 3          | 最大階層レベル数              |
| minCommunitySize | 2          | 最小コミュニティサイズ        |
| maxIterations    | 100        | 最大イテレーション数          |
| seed             | undefined  | 乱数シード（再現性用）        |

### 実装ファイル

| 種別             | パス                                                       |
| ---------------- | ---------------------------------------------------------- |
| アルゴリズム     | `packages/shared/src/services/graph/leiden-algorithm.ts`   |
| サービス         | `packages/shared/src/services/graph/community-detector.ts` |
| インターフェース | `packages/shared/src/services/graph/interfaces/`           |
| 型定義           | `packages/shared/src/services/graph/types.ts`              |
| テスト           | `packages/shared/src/services/graph/__tests__/`            |

### テスト品質

- **52テストケース**（単体 + 統合）
- **92.06% Line Coverage**, **81.30% Branch Coverage**, **100% Function Coverage**

**詳細参照**: [interfaces-rag-community-detection.md](./interfaces-rag-community-detection.md)

---

## 関連ドキュメント

- [RAGアーキテクチャ概要](./architecture-rag.md)
- [Knowledge Graph型定義](./rag-knowledge-graph.md)
- [クエリパイプライン](./rag-query-pipeline.md)

---

## Task08 完了記録（2026-03-19）

TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 Phase 1-12 完了:

- 21 surface の capability matrix 定義（3 lane: Index/Embedding/Search）
- production mock を guidance-only に置換（aiHandlers, communityHandlers）
- HybridRAGFactory は UT-RAG-08-002 で実配線済みとなり、`createFull()` / `createLite()` が `HybridRAGEngine` を返す current runtime へ移行
- SF-05/07/09 の silent fallback を明示化（warn ログ追加）
- 未タスク 13件を UT-RAG-08-001〜013 として登録
