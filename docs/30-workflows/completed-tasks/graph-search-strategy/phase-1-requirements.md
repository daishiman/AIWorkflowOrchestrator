# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | なし                  |
| 後続Phase  | Phase 2               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

GraphSearchStrategyの目的、スコープ、受け入れ基準を明文化する。HybridRAGのTriple Searchにおける3つ目の検索戦略として、Knowledge Graphを活用した検索機能の要件を定義する。

## 背景

HybridRAGは3つの検索戦略（Keyword/Semantic/Graph）を統合して高精度な検索を実現する。GraphSearchStrategyは、Knowledge Graphのエンティティ、関係、コミュニティ構造を活用し、テキストマッチングやベクトル類似度では発見できない意味的な関連性を検索する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件抽出

**目的**: ユーザー要求から機能要件・非機能要件を抽出する

**実行手順**:

1. タスク指示書（`docs/30-workflows/unassigned-task/task-07-04-graph-search-strategy.md`）を確認
2. 既存の検索戦略（KeywordSearchStrategy、VectorSearchStrategy）の実装を参照
3. Knowledge Graph Store、コミュニティ検出・サマリ生成の仕様を確認
4. 機能要件（FR）と非機能要件（NFR）を分類して記載

**期待される成果物**:

- 機能要件一覧
- 非機能要件一覧

---

### タスク2: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**実行手順**:

1. 各機能要件に対してGiven-When-Then形式で受け入れ基準を記述
2. テスト可能な形式で記述（数値指標、具体的な条件）
3. 境界値・異常系の基準も含める

**期待される成果物**:

- 受け入れ基準一覧（`outputs/phase-1/acceptance-criteria.md`）

---

### タスク3: スコープ定義

**目的**: 実装範囲と除外範囲を明確化する

**実行手順**:

1. スコープ内の機能を列挙
2. スコープ外の機能を明示（将来対応予定含む）
3. 前提条件と制約を記載

**期待される成果物**:

- スコープ定義書（`outputs/phase-1/scope-definition.md`）

---

## 参照資料

| 参照資料              | パス                                                                                          | 内容                |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| タスク指示書          | `docs/30-workflows/unassigned-task/task-07-04-graph-search-strategy.md`                       | 元のタスク定義      |
| RAGアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | HybridRAG全体設計   |
| 検索インターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | ISearchStrategy定義 |
| Knowledge Graph Store | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`   | グラフストア仕様    |
| コミュニティ検出      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | Leidenアルゴリズム  |
| コミュニティサマリ    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | サマリ生成仕様      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                          | 内容                         |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| ISearchStrategy      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | 検索戦略インターフェース定義 |
| IKnowledgeGraphStore | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`   | グラフストアAPI              |
| ICommunitySummarizer | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | サマリ検索API                |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ    | 記載内容                                                |
| ------------------- | ------------------------------------------------------- |
| GraphStore接続      | IKnowledgeGraphStore経由でエンティティ・関係を取得      |
| EmbeddingProvider   | クエリ埋め込み生成のためのIEmbeddingProvider接続        |
| CommunitySummarizer | コミュニティサマリ検索のためのICommunitySummarizer接続  |
| データフロー        | Query → Embedding → Graph検索 → チャンク取得 → 結果返却 |

---

## 完了条件

- [ ] 全機能要件が抽出されている（FR-001〜FR-008）
- [ ] 全非機能要件が抽出されている（NFR-001〜NFR-004）
- [ ] 各要件に受け入れ基準がある（Given-When-Then形式）
- [ ] スコープ内・スコープ外が明確に定義されている
- [ ] 接続要件（GraphStore/Embedding/CommunitySummarizer）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初期Phase）
- **後続**: Phase 2: 設計 へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. タスク指示書の確認
2. 既存の検索戦略実装の参照
3. Knowledge Graph Store・コミュニティ仕様の確認
4. 機能要件（FR）の抽出
5. 非機能要件（NFR）の抽出
6. 受け入れ基準の作成
7. スコープ定義書の作成
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 1
```

---

## Phase実行記録

| 項目            | 内容                     |
| --------------- | ------------------------ |
| 実行開始日時    | {{EXECUTION_START}}      |
| 実行完了日時    | {{EXECUTION_END}}        |
| 実行者          | {{EXECUTOR}}             |
| 成果物確認      | [ ] 全て生成済み         |
| artifacts.json  | [ ] 更新済み             |
| 次Phase移行可否 | [ ] 可 / [ ] 否（理由:） |

---

## 機能要件（FR）

### FR-001: ISearchStrategyインターフェース実装

GraphSearchStrategyはISearchStrategyインターフェースを実装する。

| プロパティ/メソッド | 型                                           | 説明               |
| ------------------- | -------------------------------------------- | ------------------ |
| name                | `"graph"`                                    | 戦略名（readonly） |
| search()            | `Promise<Result<SearchResultItem[], Error>>` | 検索実行           |
| getMetrics()        | `StrategyMetric`                             | 検索メトリクス取得 |

### FR-002: ローカル検索（localSearch）

エンティティベースの検索機能。クエリに関連するエンティティを見つけ、関連コンテンツを取得する。

- クエリからエンティティ埋め込みを生成
- 類似エンティティを検索（findSimilarEntities）
- エンティティに関連するチャンクを取得

### FR-003: グローバル検索（globalSearch）

コミュニティサマリベースの検索機能。高レベルの概念的な質問に対応する。

- クエリ埋め込みを生成
- 類似コミュニティサマリを検索（findSimilarCommunities）
- コミュニティ情報を結果として返す

### FR-004: 関係検索（relationshipSearch）

エンティティ間の関係を辿る検索機能。「AとBの関係は？」のような質問に対応する。

- クエリからエンティティを抽出
- エンティティ間の最短経路を検索（findShortestPath）
- パス上のエッジに関連するチャンクを取得
- グラフトラバーサルで関連コンテンツも取得

### FR-005: クエリタイプ対応

QueryType（local/global/relationship）に応じた検索戦略の自動選択。

| クエリタイプ | 検索メソッド         | 用途                 |
| ------------ | -------------------- | -------------------- |
| local        | localSearch()        | 具体的な情報検索     |
| global       | globalSearch()       | 全体概要の把握       |
| relationship | relationshipSearch() | エンティティ間の関係 |

### FR-006: スコアリング

検索結果に0-1の範囲で関連度スコアを付与する。

- ローカル検索: エンティティ類似度×0.6 + チャンク関連度×0.4
- グローバル検索: コミュニティサマリ類似度
- 関係検索: パス距離スコア×0.5 + チャンク関連度×0.5

### FR-007: フィルタ対応

SearchFiltersによる検索結果のフィルタリング。

| フィルタ    | 対応状況 | 説明                   |
| ----------- | -------- | ---------------------- |
| fileIds     | 対応     | 特定ファイルに限定     |
| dateRange   | 将来対応 | 日付範囲フィルタ       |
| entityTypes | 対応     | エンティティタイプ制限 |

### FR-008: エラーハンドリング

Result型パターンによる明示的なエラー処理。

| エラー種別             | 対処                  |
| ---------------------- | --------------------- |
| EmbeddingProviderError | err()でラップして返却 |
| GraphStoreError        | err()でラップして返却 |
| エンティティ不足       | 空配列をok()で返却    |

---

## 非機能要件（NFR）

### NFR-001: パフォーマンス

- 検索応答時間: 500ms以内（99パーセンタイル）
- 同時リクエスト: 10req/sec対応

### NFR-002: 型安全性

- Branded Types使用（EntityId, RelationId, ChunkId等）
- Result<T, Error>パターン遵守
- strict TypeScript設定

### NFR-003: テスト品質

- Line Coverage: 80%以上
- Branch Coverage: 60%以上
- Function Coverage: 80%以上

### NFR-004: コード品質

- ESLint警告なし
- TypeScript型エラーなし
- JSDocコメント記述

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-2-design.md`
