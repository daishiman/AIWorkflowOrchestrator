# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 前提Phase  | -                     |
| 後続Phase  | Phase 2               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | vector-search-diskann |

---

## 目的

VectorSearchStrategy（ベクトル検索戦略）の実装要件を明確化し、既存システム仕様との整合性を確認する。

## 背景

HybridRAG検索エンジンでは、Keyword検索・Semantic検索・Graph検索の3つの戦略を統合している。本タスクでは、Semantic検索を担うVectorSearchStrategyを実装する。既存のISearchStrategyインターフェース、IEmbeddingProvider、libSQLベクトル検索機能との整合性を確保する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存インターフェース仕様の確認

**目的**: ISearchStrategy、SearchResult、SearchFiltersの既存定義を確認する

**実行手順**:

1. `packages/shared/src/services/search/types.ts` を確認し、ISearchStrategyインターフェースの定義を把握
2. `packages/shared/src/types/rag/search/` 配下の型定義を確認
3. SearchResult、SearchResultItem、SearchFiltersの構造を文書化

**期待される成果物**:

- 既存インターフェース定義の確認記録（`outputs/phase-1/interface-analysis.md`）

---

### タスク2: IEmbeddingProvider仕様の確認

**目的**: 埋め込み生成に使用するIEmbeddingProviderの仕様を確認する

**実行手順**:

1. `packages/shared/src/services/embedding/` 配下を確認
2. IEmbeddingProviderのembedSingle()メソッドの戻り値型を確認
3. 埋め込みベクトルの次元数（512/768/1024/1536/3072）を確認
4. Result<T, Error>パターンの使用方法を確認

**期待される成果物**:

- IEmbeddingProvider仕様確認記録（`outputs/phase-1/embedding-provider-spec.md`）

---

### タスク3: libSQLベクトル検索機能の確認

**目的**: DiskANNベクトルインデックスを使用した検索クエリの仕様を確認する

**実行手順**:

1. `packages/shared/src/db/schema/embeddings.ts` を確認
2. `vector_distance_cos()` 関数の使用方法を確認
3. 埋め込みのBLOB形式とFloat32Array変換を確認
4. 距離→類似度変換（`1 - distance / 2`）を確認

**期待される成果物**:

- libSQLベクトル検索仕様確認記録（`outputs/phase-1/libsql-vector-spec.md`）

---

### タスク4: 機能要件の定義

**目的**: VectorSearchStrategyが満たすべき機能要件を定義する

**実行手順**:

1. 以下の機能要件を文書化:
   - クエリテキストから埋め込みを生成
   - libSQLベクトル検索でチャンクを取得
   - コサイン類似度スコア（0-1）の計算
   - SearchResultItem形式への変換
   - フィルタ条件（fileIds, fileTypes, dateRange, workspaceIds）の適用
   - 閾値によるフィルタリング
   - 結果の類似度順ソート
2. 非機能要件（パフォーマンス目標）を文書化

**期待される成果物**:

- 機能要件定義書（`outputs/phase-1/functional-requirements.md`）

---

### タスク5: 受け入れ基準の定義

**目的**: Phase完了時に検証する受け入れ基準を明確化する

**実行手順**:

1. 以下の受け入れ基準を定義:
   - VectorSearchStrategyがISearchStrategyを実装している
   - search()メソッドが正常に動作する
   - コサイン類似度が0-1の範囲で返される
   - フィルタ条件が正しく適用される
   - エラー時にResult.err()が返される
   - パフォーマンス目標を達成する

**期待される成果物**:

- 受け入れ基準定義書（`outputs/phase-1/acceptance-criteria.md`）

---

## 参照資料

| 参照資料                | パス                                                                                  | 内容                              |
| ----------------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`          | SearchQuery/SearchResult型定義    |
| RAGアーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`               | DiskANNベクトル検索アーキテクチャ |
| チャンク・埋め込みIF    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md` | IEmbeddingProvider定義            |
| データベーススキーマ    | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                | embeddings/chunksテーブル         |

---

## 成果物

| 成果物                   | パス                                         | 内容                          |
| ------------------------ | -------------------------------------------- | ----------------------------- |
| インターフェース分析     | `outputs/phase-1/interface-analysis.md`      | ISearchStrategy定義の確認記録 |
| 埋め込みプロバイダー仕様 | `outputs/phase-1/embedding-provider-spec.md` | IEmbeddingProvider仕様確認    |
| libSQLベクトル検索仕様   | `outputs/phase-1/libsql-vector-spec.md`      | vector_distance_cos使用方法   |
| 機能要件定義書           | `outputs/phase-1/functional-requirements.md` | 機能・非機能要件              |
| 受け入れ基準定義書       | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な受け入れ基準        |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1の統合テスト連携アクション**:

- IEmbeddingProvider/ISearchStrategy接続要件を要件に明記
- 埋め込み生成→ベクトル検索→結果変換のデータフローを定義
- エラーハンドリング要件（API障害時の動作）を明記

---

## 完了条件

- [ ] ISearchStrategy、SearchResult、SearchFiltersの既存定義を確認した
- [ ] IEmbeddingProviderのembedSingle()メソッド仕様を確認した
- [ ] libSQLのvector_distance_cos()関数の使用方法を確認した
- [ ] 機能要件（検索、フィルタ、スコア計算）を文書化した
- [ ] 非機能要件（パフォーマンス目標）を文書化した
- [ ] 受け入れ基準を定義した
- [ ] 統合テスト接続要件を明記した
- [ ] 全成果物が`outputs/phase-1/`に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（タスク開始ポイント）
- **後続**: Phase 2 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1: 既存インターフェース仕様の確認 - [結果]
- タスク2: IEmbeddingProvider仕様の確認 - [結果]
- タスク3: libSQLベクトル検索機能の確認 - [結果]
- タスク4: 機能要件の定義 - [結果]
- タスク5: 受け入れ基準の定義 - [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/vector-search-diskann/phase-2-design.md`
