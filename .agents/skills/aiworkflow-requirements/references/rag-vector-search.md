# DiskANN ベクトル検索・同期アーキテクチャ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-rag.md](./architecture-rag.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| v1.0.0     | 2025-01-01 | 初版作成                                           |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: コードブロックを表・文章に変換 |

---

## 概要

libSQLのDiskANNベクトルインデックスを活用した高速な近似最近傍探索（ANN）。
セマンティック検索基盤として、チャンクの埋め込みベクトルを効率的に検索。

**実装場所**:

- スキーマ: `packages/shared/src/db/schema/embeddings.ts`
- インデックス管理: `packages/shared/src/db/schema/vector-index.ts`
- 検索クエリ: `packages/shared/src/db/queries/vector-search.ts`

---

## アーキテクチャ構成

RAG Pipelineは以下のコンポーネントで構成される。クエリベクトルを起点に、埋め込みテーブルとDiskANNインデックスを経由して、最終的にチャンクとファイルメタデータを取得する。

### コンポーネント構成

| レイヤー     | コンポーネント    | 役割                                           |
| ------------ | ----------------- | ---------------------------------------------- |
| 入力         | Query Vector      | 検索クエリの埋め込みベクトル                   |
| インデックス | Embeddings Table  | チャンクの埋め込みベクトルをBLOB形式で保存     |
| インデックス | DiskANN Index     | 高速な近似最近傍探索用インデックス             |
| データ       | Chunks            | テキストコンテンツ（検索対象）                 |
| データ       | Files             | ファイルメタデータ（出典情報）                 |

### データフロー関係

| 関係元            | 関係先            | 説明                               |
| ----------------- | ----------------- | ---------------------------------- |
| Query Vector      | Embeddings Table  | ベクトル類似度検索の入力           |
| Embeddings Table  | DiskANN Index     | インデックスによる高速検索         |
| Embeddings Table  | Chunks            | chunk_idによる外部キー参照         |
| Chunks            | Files             | file_idによる外部キー参照          |

---

## 距離メトリクス

| メトリクス       | libSQL関数          | 特性                             | 用途               |
| ---------------- | ------------------- | -------------------------------- | ------------------ |
| コサイン類似度   | vector_distance_cos | 方向の類似性を測定（0〜2）       | テキスト埋め込み   |
| ユークリッド距離 | vector_distance_l2  | ユークリッド空間での距離（0〜∞） | 空間データ         |
| 内積             | vector_dot          | 内積値（-∞〜∞）                  | 正規化ベクトル向け |

---

## 類似度計算

| メトリクス       | 距離→類似度変換                     | 範囲     |
| ---------------- | ----------------------------------- | -------- |
| コサイン類似度   | `similarity = 1 - distance / 2`     | 0.0〜1.0 |
| ユークリッド距離 | `similarity = 1 / (1 + distance)`   | 0.0〜1.0 |
| 内積             | `similarity = (dotProduct + 1) / 2` | 0.0〜1.0 |

---

## ベクトルインデックス設定

VectorIndexConfigインターフェースは、DiskANNベクトルインデックスの設定を定義する。

### VectorIndexConfig フィールド定義

| フィールド     | 型                          | 必須 | デフォルト  | 説明                               |
| -------------- | --------------------------- | ---- | ----------- | ---------------------------------- |
| name           | string                      | Yes  | -           | インデックス名                     |
| dimensions     | number                      | Yes  | -           | ベクトル次元数（512/768/1024/1536/3072） |
| metric         | "cosine" / "l2" / "dot"     | Yes  | -           | 距離メトリクス                     |
| maxElements    | number                      | No   | 1,000,000   | 最大要素数                         |
| efConstruction | number                      | No   | 200         | 構築時パラメータ（精度調整）       |
| efSearch       | number                      | No   | 100         | 検索時パラメータ（速度調整）       |

---

## プリセット設定

| プリセット          | 次元数 | メトリクス | 用途                    |
| ------------------- | ------ | ---------- | ----------------------- |
| openai_small        | 1536   | cosine     | text-embedding-3-small  |
| openai_large        | 3072   | cosine     | text-embedding-3-large  |
| cohere_multilingual | 1024   | cosine     | embed-multilingual-v3.0 |

---

## データフロー

1. **埋め込み生成**: チャンク → 埋め込みプロバイダー → Float32Array
2. **BLOB変換**: Float32Array → Buffer（ゼロコピー）
3. **挿入**: embeddings テーブルへバッチ挿入（100件単位）
4. **インデックス作成**: DiskANN自動インデックス構築
5. **検索**: クエリベクトル → ANN検索 → 類似チャンク取得

---

## CASCADE DELETE

chunksテーブルのレコード削除時に、関連するembeddingsテーブルのレコードも自動的に削除される。embeddingsテーブルのchunk_idフィールドは、chunksテーブルのidフィールドを外部キーとして参照し、ON DELETE CASCADE制約が設定されている。この設計により、データ整合性が自動的に維持される。

---

## オフライン・同期アーキテクチャ

### Turso Embedded Replicasの活用

| 項目       | 説明                                                               |
| ---------- | ------------------------------------------------------------------ |
| クラウドDB | Turso（libSQL）をプライマリDBとして使用                            |
| ローカルDB | Embedded Replicasとしてローカルにレプリカを保持                    |
| 同期方式   | クラウドからローカルへの非同期レプリケーション                     |
| 書き込み   | オンライン時はクラウドに直接書き込み、オフライン時はローカルキュー |

### オフライン時の動作

| 操作     | オフライン時の動作                           |
| -------- | -------------------------------------------- |
| 読み取り | ローカルレプリカから読み取り（即座に応答）   |
| 書き込み | ローカルキューに保存、オンライン復帰時に同期 |
| 検索     | ローカルインデックスを使用                   |
| 状態表示 | UI上でオフライン状態を明示                   |

### 同期コンフリクト解決

| 戦略             | 説明                                       |
| ---------------- | ------------------------------------------ |
| Last-Write-Wins  | タイムスタンプベースで最新の書き込みを優先 |
| 適用対象         | 設定変更、ステータス更新など単純な更新     |
| コンフリクト検出 | バージョン番号またはタイムスタンプで検出   |
| 手動解決         | 複雑なコンフリクトはユーザーに選択を委ねる |

---

## VectorSearchStrategy（セマンティック検索）

libSQL/TursoのDiskANNベクトルインデックスを使用したセマンティック検索戦略。
ISearchStrategyインターフェースを実装し、HybridRAGのTriple Search（Keyword/Semantic/Graph）のSemantic検索を担当する。

**実装場所**: `packages/shared/src/services/search/strategies/`

### アーキテクチャ構成

HybridRAG Triple Searchは3つの検索戦略を並列実行し、RRF（Reciprocal Rank Fusion）で統合する。

#### 検索戦略一覧

| 戦略             | 実装クラス           | アルゴリズム   | 特徴                             |
| ---------------- | -------------------- | -------------- | -------------------------------- |
| Keyword検索      | KeywordSearchStrategy| FTS5/BM25      | 全文検索、完全一致に強い         |
| Semantic検索     | VectorSearchStrategy | DiskANN/Cosine | 意味的類似性、本ドキュメント対象 |
| Graph検索        | GraphSearchStrategy  | Community      | 関連性ネットワーク、コンテキスト |

#### 統合処理

| コンポーネント | 役割                                               |
| -------------- | -------------------------------------------------- |
| RRF統合        | 各戦略の結果をReciprocal Rank Fusionで統合・再ランキング |

3つの検索戦略の結果は、RRFアルゴリズムにより統合され、最終的な検索結果として返却される。

### 主要クラス

| クラス                     | 責務                              |
| -------------------------- | --------------------------------- |
| VectorSearchStrategy       | ISearchStrategy実装、ベクトル検索 |
| CachedVectorSearchStrategy | 埋め込みキャッシュ付きの検索      |

### ISearchStrategyインターフェース準拠

| メソッド     | 戻り値                                     | 説明               |
| ------------ | ------------------------------------------ | ------------------ |
| search()     | Promise<Result<SearchResultItem[], Error>> | ベクトル検索実行   |
| getMetrics() | StrategyMetric                             | 検索メトリクス取得 |
| name         | "semantic"                                 | 戦略名             |

### フィルタ対応状況

| フィルタ     | 状態   | 説明                |
| ------------ | ------ | ------------------- |
| fileIds      | 実装済 | 特定ファイルに限定  |
| minRelevance | 実装済 | 最低類似度閾値      |
| limit        | 実装済 | 最大結果数（1-100） |
| dateRange    | 未実装 | 将来対応予定        |
| fileTypes    | 未実装 | 将来対応予定        |
| workspaceIds | 未実装 | 将来対応予定        |

### キャッシュ戦略

| 設定項目     | デフォルト値 | 説明                         |
| ------------ | ------------ | ---------------------------- |
| TTL          | 5分          | キャッシュ有効期間           |
| maxSize      | 1000エントリ | 最大キャッシュエントリ数     |
| アルゴリズム | LRU          | 最も使われていないものを削除 |

### テスト品質

- **83テストケース**（単体35 + 統合15 + キャッシュ33）
- **98.71% Line Coverage**, **95.65% Branch Coverage**, **100% Function Coverage**

**詳細参照**: `docs/30-workflows/vector-search-diskann/outputs/phase-12/implementation-guide.md`

---

## 関連ドキュメント

- [RAGアーキテクチャ概要](./architecture-rag.md)
- [Knowledge Graph型定義](./rag-knowledge-graph.md)
- [Desktop状態管理](./rag-desktop-state.md)
