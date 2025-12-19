# CONV-03-05: 検索クエリ・結果スキーマ型要件定義書

**バージョン**: 1.0.0
**作成日**: 2025-12-18
**最終更新**: 2025-12-18
**作成者**: Requirements Analyst Agent
**レビュー者**: -
**承認者**: -

---

## 1. 概要

### 1.1 目的

本ドキュメントは、HybridRAG検索エンジンで使用する検索クエリ、検索結果、リランキング関連の型およびZodスキーマの要件を明文化する。CONV-07（HybridRAG検索エンジン実装）の設計・実装の基盤として、型の目的、構造、検証基準を定義する。

### 1.2 背景

検索システムでは、以下の複数段階の処理が存在する:

1. **クエリ分類**: ユーザーの検索意図を判定（local/global/relationship/hybrid）
2. **検索戦略選択**: クエリタイプに応じた検索戦略の選択と重み付け
3. **検索実行**: キーワード検索、セマンティック検索、グラフ検索の並列実行
4. **結果融合**: RRF（Reciprocal Rank Fusion）によるスコア統合
5. **リランキング**: Cross-encoder による関連度再評価
6. **CRAG評価**: Corrective RAG による検索結果の品質評価

各段階で扱うデータ構造が曖昧なままでは、後続の CONV-07 実装時に設計のブレが発生する。本ドキュメントにより型要件を先に明確化し、設計段階での手戻りを防ぐ。

### 1.3 スコープ

**含まれるもの**:

- 検索クエリ関連型（SearchQuery, QueryType, QueryClassification）
- 検索結果関連型（SearchResult, SearchResultItem, RelevanceScore）
- 検索戦略関連型（SearchStrategy, SearchWeights, SearchStrategyMetrics）
- 検索フィルター関連型（SearchFilters, SearchOptions, DateRange）
- スコアリング関連型（CRAGScore, RRFConfig, RerankConfig）
- ハイライト関連型（Highlight, HighlightOffset）
- ソース情報型（SearchResultSources, SearchResultContent）
- 全型に対応するZodスキーマ
- ユーティリティ関数のインターフェース要件

**含まれないもの**:

- 型の実装詳細（設計フェーズで決定）
- ユーティリティ関数の実装ロジック
- データベーススキーマ
- API エンドポイント設計
- UIコンポーネント設計

---

## 2. ステークホルダー

### 2.1 プライマリステークホルダー

| ロール       | 責任                           |
| ------------ | ------------------------------ |
| 設計担当者   | 型要件に基づいた設計書作成     |
| 実装担当者   | 型定義とZodスキーマの実装      |
| テスト担当者 | 受け入れ基準に基づくテスト作成 |

### 2.2 参照プロジェクト

| タスクID   | タスク名                         | 関係性                                             |
| ---------- | -------------------------------- | -------------------------------------------------- |
| CONV-03-01 | 基本型・共通インターフェース定義 | 依存元（Branded Type、共通インターフェースを使用） |
| CONV-07-01 | クエリ分類器実装                 | 依存先（QueryClassification型を使用）              |
| CONV-07-02 | キーワード検索戦略               | 依存先（SearchStrategy型を使用）                   |
| CONV-07-03 | ベクトル検索戦略                 | 依存先（SearchStrategy型を使用）                   |
| CONV-07-04 | グラフ検索戦略                   | 依存先（SearchStrategy型を使用）                   |
| CONV-07-05 | RRF Fusion + リランキング        | 依存先（RRFConfig, RerankConfig型を使用）          |
| CONV-07-06 | CRAG実装                         | 依存先（CRAGScore型を使用）                        |
| CONV-07-07 | HybridRAG統合サービス            | 依存先（全型を統合利用）                           |

---

## 3. 型要件一覧

### 3.1 列挙型・定数型

#### REQ-ENUM-001: QueryType（クエリタイプ列挙型）

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| **要件ID** | REQ-ENUM-001                             |
| **優先度** | Must have                                |
| **概要**   | ユーザーの検索意図を分類するための列挙型 |

**定義される値**:

| 値             | 説明                         | 推奨重み付け                            |
| -------------- | ---------------------------- | --------------------------------------- |
| `local`        | 具体的な事実・詳細情報の検索 | keyword:0.35, semantic:0.35, graph:0.30 |
| `global`       | 全体的な概要・要約の検索     | keyword:0.20, semantic:0.30, graph:0.50 |
| `relationship` | エンティティ間の関係検索     | keyword:0.20, semantic:0.20, graph:0.60 |
| `hybrid`       | 複合的なクエリ               | keyword:0.33, semantic:0.34, graph:0.33 |

**ビジネスルール**:

- BR-001: クエリ分類器が判定できない場合、デフォルトは `hybrid` とする
- BR-002: 各値に対応する推奨重み付けが存在すること

---

#### REQ-ENUM-002: SearchStrategy（検索戦略列挙型）

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| **要件ID** | REQ-ENUM-002                           |
| **優先度** | Must have                              |
| **概要**   | 検索アルゴリズムを識別するための列挙型 |

**定義される値**:

| 値         | 説明                 | 使用アルゴリズム                 |
| ---------- | -------------------- | -------------------------------- |
| `keyword`  | キーワードベース検索 | BM25 / FTS5                      |
| `semantic` | 意味ベース検索       | ベクトル類似度（コサイン類似度） |
| `graph`    | グラフベース検索     | PageRank / 近傍探索              |
| `hybrid`   | 3戦略の融合検索      | RRF + リランキング               |

---

#### REQ-ENUM-003: SearchResultType（検索結果タイプ列挙型）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| **要件ID** | REQ-ENUM-003                                 |
| **優先度** | Must have                                    |
| **概要**   | 検索結果アイテムの種類を識別するための列挙型 |

**定義される値**:

| 値          | 説明                   | 対応するBranded ID |
| ----------- | ---------------------- | ------------------ |
| `chunk`     | テキストチャンク       | ChunkId            |
| `entity`    | 知識グラフエンティティ | EntityId           |
| `community` | エンティティクラスタ   | CommunityId        |

---

### 3.2 検索クエリ関連型

#### REQ-TYPE-001: SearchQuery（検索クエリ型）

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| **要件ID** | REQ-TYPE-001                             |
| **優先度** | Must have                                |
| **概要**   | ユーザーからの検索リクエストを表現する型 |

**プロパティ定義**:

| プロパティ  | 型                     | 必須 | readonly | 制約                       | 説明                         |
| ----------- | ---------------------- | ---- | -------- | -------------------------- | ---------------------------- |
| `text`      | `string`               | Yes  | Yes      | 1-1000文字                 | 検索クエリテキスト           |
| `type`      | `QueryType`            | Yes  | Yes      | 列挙値                     | クエリタイプ                 |
| `embedding` | `Float32Array \| null` | No   | Yes      | 次元数は埋め込みモデル依存 | 事前計算済み埋め込みベクトル |
| `filters`   | `SearchFilters`        | Yes  | Yes      | -                          | 検索フィルター               |
| `options`   | `SearchOptions`        | Yes  | Yes      | -                          | 検索オプション               |

**ビジネスルール**:

- BR-003: `text` が空文字の場合、検索を実行しない
- BR-004: `embedding` が `null` の場合、検索時に計算する
- BR-005: `embedding` の次元数は環境設定の埋め込みモデルに依存する

---

#### REQ-TYPE-002: SearchFilters（検索フィルター型）

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| **要件ID** | REQ-TYPE-002                       |
| **優先度** | Must have                          |
| **概要**   | 検索結果の絞り込み条件を定義する型 |

**プロパティ定義**:

| プロパティ     | 型                          | 必須 | readonly | 制約                   | 説明                         |
| -------------- | --------------------------- | ---- | -------- | ---------------------- | ---------------------------- |
| `fileIds`      | `readonly FileId[] \| null` | No   | Yes      | -                      | 対象ファイルIDリスト         |
| `entityTypes`  | `readonly string[] \| null` | No   | Yes      | -                      | エンティティタイプフィルター |
| `dateRange`    | `DateRange \| null`         | No   | Yes      | -                      | 日付範囲フィルター           |
| `minRelevance` | `number`                    | Yes  | Yes      | 0.0-1.0、デフォルト0.3 | 最小関連度スコア閾値         |

**ビジネスルール**:

- BR-006: `fileIds` が空配列の場合、全ファイルを対象とする
- BR-007: `minRelevance` 未満のスコアの結果は除外する

---

#### REQ-TYPE-003: DateRange（日付範囲型）

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| **要件ID** | REQ-TYPE-003                   |
| **優先度** | Should have                    |
| **概要**   | 検索対象の日付範囲を定義する型 |

**プロパティ定義**:

| プロパティ | 型             | 必須 | readonly | 制約 | 説明           |
| ---------- | -------------- | ---- | -------- | ---- | -------------- |
| `start`    | `Date \| null` | No   | Yes      | -    | 開始日（含む） |
| `end`      | `Date \| null` | No   | Yes      | -    | 終了日（含む） |

**ビジネスルール**:

- BR-008: `start` と `end` の両方が指定された場合、`start <= end` でなければならない
- BR-009: 片方のみ指定の場合、開放区間として扱う

---

#### REQ-TYPE-004: SearchOptions（検索オプション型）

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| **要件ID** | REQ-TYPE-004                     |
| **優先度** | Must have                        |
| **概要**   | 検索の動作オプションを定義する型 |

**プロパティ定義**:

| プロパティ          | 型                          | 必須 | readonly | 制約        | デフォルト                                | 説明                       |
| ------------------- | --------------------------- | ---- | -------- | ----------- | ----------------------------------------- | -------------------------- |
| `limit`             | `number`                    | Yes  | Yes      | 1-100、整数 | 20                                        | 返却する結果の最大数       |
| `offset`            | `number`                    | Yes  | Yes      | 0以上、整数 | 0                                         | スキップする結果数         |
| `includeMetadata`   | `boolean`                   | Yes  | Yes      | -           | true                                      | メタデータを含めるか       |
| `includeHighlights` | `boolean`                   | Yes  | Yes      | -           | true                                      | ハイライトを含めるか       |
| `rerankEnabled`     | `boolean`                   | Yes  | Yes      | -           | true                                      | リランキングを有効にするか |
| `cragEnabled`       | `boolean`                   | Yes  | Yes      | -           | false                                     | CRAGを有効にするか         |
| `strategies`        | `readonly SearchStrategy[]` | Yes  | Yes      | 1個以上     | ["hybrid"]                                | 使用する検索戦略           |
| `weights`           | `SearchWeights`             | Yes  | Yes      | 合計1.0     | {keyword:0.35, semantic:0.35, graph:0.30} | 戦略重み                   |

---

#### REQ-TYPE-005: SearchWeights（検索戦略重み型）

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| **要件ID** | REQ-TYPE-005                                   |
| **優先度** | Must have                                      |
| **概要**   | 各検索戦略のスコア融合時の重み付けを定義する型 |

**プロパティ定義**:

| プロパティ | 型       | 必須 | readonly | 制約    | 説明                     |
| ---------- | -------- | ---- | -------- | ------- | ------------------------ |
| `keyword`  | `number` | Yes  | Yes      | 0.0-1.0 | キーワード検索の重み     |
| `semantic` | `number` | Yes  | Yes      | 0.0-1.0 | セマンティック検索の重み |
| `graph`    | `number` | Yes  | Yes      | 0.0-1.0 | グラフ検索の重み         |

**ビジネスルール**:

- BR-010: `keyword + semantic + graph = 1.0` でなければならない（許容誤差: 0.01）
- BR-011: 使用しない戦略の重みは 0.0 とする

---

#### REQ-TYPE-006: QueryClassification（クエリ分類結果型）

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| **要件ID** | REQ-TYPE-006                       |
| **優先度** | Must have                          |
| **概要**   | クエリ分類器の出力結果を表現する型 |

**プロパティ定義**:

| プロパティ          | 型                  | 必須 | readonly | 制約    | 説明                               |
| ------------------- | ------------------- | ---- | -------- | ------- | ---------------------------------- |
| `originalQuery`     | `string`            | Yes  | Yes      | -       | 元のクエリ文字列                   |
| `type`              | `QueryType`         | Yes  | Yes      | -       | 分類されたクエリタイプ             |
| `confidence`        | `number`            | Yes  | Yes      | 0.0-1.0 | 分類の信頼度                       |
| `extractedEntities` | `readonly string[]` | Yes  | Yes      | -       | クエリから抽出されたエンティティ名 |
| `suggestedWeights`  | `SearchWeights`     | Yes  | Yes      | -       | 推奨される検索重み                 |
| `expandedQueries`   | `readonly string[]` | Yes  | Yes      | -       | クエリ拡張（同義語・関連語）       |

**ビジネスルール**:

- BR-012: `confidence` が 0.7 未満の場合、`type` は `hybrid` にフォールバック推奨

---

### 3.3 検索結果関連型

#### REQ-TYPE-007: SearchResult（統合検索結果型）

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| **要件ID** | REQ-TYPE-007                   |
| **優先度** | Must have                      |
| **概要**   | 検索処理全体の結果を表現する型 |

**プロパティ定義**:

| プロパティ       | 型                            | 必須 | readonly | 制約        | 説明                   |
| ---------------- | ----------------------------- | ---- | -------- | ----------- | ---------------------- |
| `query`          | `SearchQuery`                 | Yes  | Yes      | -           | 実行されたクエリ       |
| `results`        | `readonly SearchResultItem[]` | Yes  | Yes      | -           | 検索結果アイテムリスト |
| `totalCount`     | `number`                      | Yes  | Yes      | 0以上、整数 | マッチした総件数       |
| `processingTime` | `number`                      | Yes  | Yes      | 0以上（ms） | 処理時間（ミリ秒）     |
| `strategies`     | `SearchStrategyMetrics`       | Yes  | Yes      | -           | 各戦略のメトリクス     |

---

#### REQ-TYPE-008: SearchResultItem（検索結果アイテム型）

| 項目       | 内容                       |
| ---------- | -------------------------- |
| **要件ID** | REQ-TYPE-008               |
| **優先度** | Must have                  |
| **概要**   | 個々の検索結果を表現する型 |

**プロパティ定義**:

| プロパティ   | 型                     | 必須 | readonly | 制約    | 説明                                 |
| ------------ | ---------------------- | ---- | -------- | ------- | ------------------------------------ |
| `id`         | `string`               | Yes  | Yes      | -       | 結果の一意識別子                     |
| `type`       | `SearchResultType`     | Yes  | Yes      | -       | 結果タイプ（chunk/entity/community） |
| `score`      | `number`               | Yes  | Yes      | 0.0-1.0 | 融合後の最終スコア                   |
| `relevance`  | `RelevanceScore`       | Yes  | Yes      | -       | 関連度スコア詳細                     |
| `content`    | `SearchResultContent`  | Yes  | Yes      | -       | 検索結果コンテンツ                   |
| `highlights` | `readonly Highlight[]` | Yes  | Yes      | -       | マッチ箇所ハイライト                 |
| `sources`    | `SearchResultSources`  | Yes  | Yes      | -       | ソース情報                           |

---

#### REQ-TYPE-009: RelevanceScore（関連度スコア詳細型）

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| **要件ID** | REQ-TYPE-009                                   |
| **優先度** | Must have                                      |
| **概要**   | 各検索戦略からのスコアと統合スコアを保持する型 |

**プロパティ定義**:

| プロパティ | 型                  | 必須 | readonly | 制約    | 説明                           |
| ---------- | ------------------- | ---- | -------- | ------- | ------------------------------ |
| `combined` | `number`            | Yes  | Yes      | 0.0-1.0 | RRF統合後スコア                |
| `keyword`  | `number`            | Yes  | Yes      | 0.0-1.0 | BM25スコア（正規化済み）       |
| `semantic` | `number`            | Yes  | Yes      | 0.0-1.0 | コサイン類似度                 |
| `graph`    | `number`            | Yes  | Yes      | 0.0-1.0 | グラフ中心性スコア             |
| `rerank`   | `number \| null`    | No   | Yes      | 0.0-1.0 | リランクスコア（未実行時null） |
| `crag`     | `CRAGScore \| null` | No   | Yes      | -       | CRAG評価（未実行時null）       |

**ビジネスルール**:

- BR-013: 検索戦略が無効の場合、該当スコアは 0.0 とする
- BR-014: `rerank` は `rerankEnabled=true` かつリランク実行後にのみ値を持つ
- BR-015: `crag` は `cragEnabled=true` かつCRAG評価実行後にのみ値を持つ

---

#### REQ-TYPE-010: CRAGScore（Corrective RAGスコア型）

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| **要件ID** | REQ-TYPE-010                                             |
| **優先度** | Should have                                              |
| **概要**   | CRAG（Corrective RAG）による検索結果品質評価を表現する型 |

**プロパティ定義**:

| プロパティ       | 型                                        | 必須 | readonly | 制約    | 説明               |
| ---------------- | ----------------------------------------- | ---- | -------- | ------- | ------------------ |
| `relevance`      | `"correct" \| "incorrect" \| "ambiguous"` | Yes  | Yes      | 列挙値  | 関連度判定結果     |
| `confidence`     | `number`                                  | Yes  | Yes      | 0.0-1.0 | 判定の信頼度       |
| `needsWebSearch` | `boolean`                                 | Yes  | Yes      | -       | Web検索が必要か    |
| `refinedQuery`   | `string \| null`                          | No   | Yes      | -       | クエリの精緻化提案 |

**ビジネスルール**:

- BR-016: `relevance` 判定基準: スコア >= 0.7 で `correct`、<= 0.3 で `incorrect`、それ以外は `ambiguous`
- BR-017: `relevance === "incorrect"` または `"ambiguous"` の場合、`needsWebSearch` は true を推奨

---

#### REQ-TYPE-011: SearchResultContent（検索結果コンテンツ型）

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| **要件ID** | REQ-TYPE-011                             |
| **優先度** | Must have                                |
| **概要**   | 検索結果のテキストコンテンツを保持する型 |

**プロパティ定義**:

| プロパティ      | 型               | 必須 | readonly | 制約 | 説明             |
| --------------- | ---------------- | ---- | -------- | ---- | ---------------- |
| `text`          | `string`         | Yes  | Yes      | -    | メインテキスト   |
| `summary`       | `string \| null` | No   | Yes      | -    | 要約テキスト     |
| `contextBefore` | `string \| null` | No   | Yes      | -    | 前方コンテキスト |
| `contextAfter`  | `string \| null` | No   | Yes      | -    | 後方コンテキスト |

---

#### REQ-TYPE-012: Highlight（ハイライト型）

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| **要件ID** | REQ-TYPE-012                       |
| **優先度** | Should have                        |
| **概要**   | テキスト内のマッチ箇所を表現する型 |

**プロパティ定義**:

| プロパティ | 型                           | 必須 | readonly | 制約 | 説明                         |
| ---------- | ---------------------------- | ---- | -------- | ---- | ---------------------------- |
| `field`    | `string`                     | Yes  | Yes      | -    | マッチしたフィールド名       |
| `fragment` | `string`                     | Yes  | Yes      | -    | マッチ箇所を含むフラグメント |
| `offsets`  | `readonly HighlightOffset[]` | Yes  | Yes      | -    | オフセット情報リスト         |

---

#### REQ-TYPE-013: HighlightOffset（ハイライトオフセット型）

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| **要件ID** | REQ-TYPE-013                         |
| **優先度** | Should have                          |
| **概要**   | ハイライト箇所の位置情報を表現する型 |

**プロパティ定義**:

| プロパティ | 型       | 必須 | readonly | 制約        | 説明     |
| ---------- | -------- | ---- | -------- | ----------- | -------- |
| `start`    | `number` | Yes  | Yes      | 0以上、整数 | 開始位置 |
| `end`      | `number` | Yes  | Yes      | 0以上、整数 | 終了位置 |

**ビジネスルール**:

- BR-018: `start < end` でなければならない

---

#### REQ-TYPE-014: SearchResultSources（検索結果ソース情報型）

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| **要件ID** | REQ-TYPE-014                   |
| **優先度** | Must have                      |
| **概要**   | 検索結果の出典情報を表現する型 |

**プロパティ定義**:

| プロパティ    | 型                    | 必須 | readonly | 制約                    | 説明                     |
| ------------- | --------------------- | ---- | -------- | ----------------------- | ------------------------ |
| `chunkId`     | `ChunkId \| null`     | No   | Yes      | CONV-03-01 Branded Type | チャンクID               |
| `fileId`      | `FileId \| null`      | No   | Yes      | CONV-03-01 Branded Type | ファイルID               |
| `entityIds`   | `readonly EntityId[]` | Yes  | Yes      | CONV-03-01 Branded Type | 関連エンティティIDリスト |
| `communityId` | `CommunityId \| null` | No   | Yes      | CONV-03-01 Branded Type | コミュニティID           |
| `relationIds` | `readonly string[]`   | Yes  | Yes      | -                       | 関連リレーションIDリスト |

**ビジネスルール**:

- BR-019: `type === "chunk"` の場合、`chunkId` は必須
- BR-020: `type === "entity"` の場合、`entityIds` は1個以上必須
- BR-021: `type === "community"` の場合、`communityId` は必須

---

### 3.4 メトリクス・設定関連型

#### REQ-TYPE-015: SearchStrategyMetrics（検索戦略メトリクス型）

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| **要件ID** | REQ-TYPE-015                               |
| **優先度** | Must have                                  |
| **概要**   | 各検索戦略の実行結果メトリクスを集約する型 |

**プロパティ定義**:

| プロパティ | 型               | 必須 | readonly | 説明                         |
| ---------- | ---------------- | ---- | -------- | ---------------------------- |
| `keyword`  | `StrategyMetric` | Yes  | Yes      | キーワード検索メトリクス     |
| `semantic` | `StrategyMetric` | Yes  | Yes      | セマンティック検索メトリクス |
| `graph`    | `StrategyMetric` | Yes  | Yes      | グラフ検索メトリクス         |

---

#### REQ-TYPE-016: StrategyMetric（個別戦略メトリクス型）

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| **要件ID** | REQ-TYPE-016                         |
| **優先度** | Must have                            |
| **概要**   | 個別の検索戦略の実行結果を表現する型 |

**プロパティ定義**:

| プロパティ       | 型        | 必須 | readonly | 制約        | 説明               |
| ---------------- | --------- | ---- | -------- | ----------- | ------------------ |
| `enabled`        | `boolean` | Yes  | Yes      | -           | 戦略が有効だったか |
| `resultCount`    | `number`  | Yes  | Yes      | 0以上、整数 | 返却された結果数   |
| `processingTime` | `number`  | Yes  | Yes      | 0以上（ms） | 処理時間（ミリ秒） |
| `topScore`       | `number`  | Yes  | Yes      | 0.0-1.0     | 最高スコア         |

---

#### REQ-TYPE-017: RRFConfig（RRF設定型）

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| **要件ID** | REQ-TYPE-017                                          |
| **優先度** | Must have                                             |
| **概要**   | Reciprocal Rank Fusion アルゴリズムの設定を定義する型 |

**プロパティ定義**:

| プロパティ        | 型        | 必須 | readonly | 制約         | デフォルト | 説明                          |
| ----------------- | --------- | ---- | -------- | ------------ | ---------- | ----------------------------- |
| `k`               | `number`  | Yes  | Yes      | 1-1000、整数 | 60         | RRF定数（ランクスムージング） |
| `normalizeScores` | `boolean` | Yes  | Yes      | -            | true       | スコア正規化を行うか          |

**ビジネスルール**:

- BR-022: RRFスコア計算式: `score = sum(weight_i * 1/(k + rank_i))`
- BR-023: `k` が大きいほどランク差の影響が小さくなる

---

#### REQ-TYPE-018: RerankConfig（リランキング設定型）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| **要件ID** | REQ-TYPE-018                                 |
| **優先度** | Should have                                  |
| **概要**   | Cross-encoder リランキングの設定を定義する型 |

**プロパティ定義**:

| プロパティ  | 型        | 必須 | readonly | 制約        | デフォルト                             | 説明                   |
| ----------- | --------- | ---- | -------- | ----------- | -------------------------------------- | ---------------------- |
| `enabled`   | `boolean` | Yes  | Yes      | -           | true                                   | リランキング有効フラグ |
| `model`     | `string`  | Yes  | Yes      | -           | "cross-encoder/ms-marco-MiniLM-L-6-v2" | 使用するモデル名       |
| `topK`      | `number`  | Yes  | Yes      | 1-100、整数 | 50                                     | リランク対象数         |
| `batchSize` | `number`  | Yes  | Yes      | 1-32、整数  | 16                                     | バッチサイズ           |

**ビジネスルール**:

- BR-024: `topK` は検索結果数以下に設定される
- BR-025: `batchSize` はメモリ制約に応じて調整可能

---

## 4. 各型の受け入れ基準

### 4.1 型推論と型安全性の受け入れ基準

#### AC-TYPE-001: SearchQuery型の型推論

**シナリオ1: プロパティアクセス時の型推論**

- **Given**: SearchQuery型の変数が定義されている
- **When**: `text`、`type`、`embedding` プロパティにアクセスする
- **Then**: TypeScript型推論が正しく機能し、IDEで補完候補が表示される

**シナリオ2: 必須プロパティの検証**

- **Given**: SearchQuery型を実装する際
- **When**: `text` プロパティを省略する
- **Then**: TypeScriptコンパイルエラーが発生する

**シナリオ3: readonly制約の検証**

- **Given**: SearchQuery型の変数が定義されている
- **When**: `query.text = "new text"` で値を変更しようとする
- **Then**: TypeScriptコンパイルエラーが発生する

---

#### AC-TYPE-002: SearchWeights型の合計値検証

**シナリオ1: 正常な重み合計**

- **Given**: SearchWeights型のZodスキーマが定義されている
- **When**: `{keyword: 0.35, semantic: 0.35, graph: 0.30}` を検証する
- **Then**: 検証が成功する

**シナリオ2: 異常な重み合計**

- **Given**: SearchWeights型のZodスキーマが定義されている
- **When**: `{keyword: 0.5, semantic: 0.5, graph: 0.5}` を検証する
- **Then**: 検証が失敗し、"Weights must sum to 1.0" エラーメッセージが返る

**シナリオ3: 境界値（許容誤差内）**

- **Given**: SearchWeights型のZodスキーマが定義されている
- **When**: `{keyword: 0.334, semantic: 0.333, graph: 0.333}` を検証する（合計0.999、誤差0.001）
- **Then**: 検証が成功する（許容誤差0.01以内）

---

#### AC-TYPE-003: DateRange型の日付検証

**シナリオ1: 正常な日付範囲**

- **Given**: DateRange型のZodスキーマが定義されている
- **When**: `{start: new Date("2024-01-01"), end: new Date("2024-12-31")}` を検証する
- **Then**: 検証が成功する

**シナリオ2: 逆転した日付範囲**

- **Given**: DateRange型のZodスキーマが定義されている
- **When**: `{start: new Date("2024-12-31"), end: new Date("2024-01-01")}` を検証する
- **Then**: 検証が失敗し、"start must be before or equal to end" エラーメッセージが返る

**シナリオ3: 片方のみ指定**

- **Given**: DateRange型のZodスキーマが定義されている
- **When**: `{start: new Date("2024-01-01"), end: null}` を検証する
- **Then**: 検証が成功する（開放区間として有効）

---

#### AC-TYPE-004: RelevanceScore型のスコア範囲検証

**シナリオ1: 正常なスコア範囲**

- **Given**: RelevanceScore型のZodスキーマが定義されている
- **When**: `{combined: 0.85, keyword: 0.7, semantic: 0.9, graph: 0.8, rerank: 0.88, crag: null}` を検証する
- **Then**: 検証が成功する

**シナリオ2: 範囲外のスコア**

- **Given**: RelevanceScore型のZodスキーマが定義されている
- **When**: `{combined: 1.5, keyword: 0.7, semantic: 0.9, graph: 0.8, rerank: null, crag: null}` を検証する
- **Then**: 検証が失敗する（combined が 0.0-1.0 の範囲外）

---

#### AC-TYPE-005: CRAGScore型の関連度判定

**シナリオ1: correct判定**

- **Given**: CRAGScore型の変数が定義されている
- **When**: `relevance === "correct"` の場合
- **Then**: `needsWebSearch` は false が推奨される

**シナリオ2: incorrect判定**

- **Given**: CRAGScore型の変数が定義されている
- **When**: `relevance === "incorrect"` の場合
- **Then**: `needsWebSearch` は true が推奨され、`refinedQuery` に改善提案が含まれる可能性がある

**シナリオ3: ambiguous判定**

- **Given**: CRAGScore型の変数が定義されている
- **When**: `relevance === "ambiguous"` の場合
- **Then**: `needsWebSearch` は true が推奨される

---

#### AC-TYPE-006: SearchResultSources型とBranded Typeの整合性

**シナリオ1: ChunkId型の互換性**

- **Given**: SearchResultSources型の `chunkId` プロパティ
- **When**: CONV-03-01で定義された `createChunkId()` で生成したIDを代入する
- **Then**: 型エラーなくコンパイルが成功する

**シナリオ2: 型の誤用検出**

- **Given**: SearchResultSources型の `chunkId` プロパティ
- **When**: FileId型の値を代入しようとする
- **Then**: TypeScriptコンパイルエラーが発生する（Branded Type による区別）

**シナリオ3: EntityId配列の検証**

- **Given**: SearchResultSources型の `entityIds` プロパティ
- **When**: `[createEntityId("id1"), createEntityId("id2")]` を代入する
- **Then**: 型エラーなくコンパイルが成功する

---

#### AC-TYPE-007: HighlightOffset型の位置検証

**シナリオ1: 正常なオフセット**

- **Given**: HighlightOffset型のZodスキーマが定義されている
- **When**: `{start: 10, end: 25}` を検証する
- **Then**: 検証が成功する

**シナリオ2: 逆転したオフセット（設計決定待ち）**

- **Given**: HighlightOffset型のZodスキーマが定義されている
- **When**: `{start: 25, end: 10}` を検証する
- **Then**: 検証が失敗する（BR-018: start < end）

**シナリオ3: 負の値**

- **Given**: HighlightOffset型のZodスキーマが定義されている
- **When**: `{start: -5, end: 10}` を検証する
- **Then**: 検証が失敗する（start は 0 以上）

---

### 4.2 Zodスキーマの受け入れ基準

#### AC-SCHEMA-001: 全型に対応するZodスキーマの存在

**シナリオ1: スキーマの網羅性**

- **Given**: 型定義ファイル（types.ts）に定義されたすべてのinterface/type
- **When**: スキーマ定義ファイル（schemas.ts）を確認する
- **Then**: 各型に対応するZodスキーマが存在する

**シナリオ2: スキーマからの型推論**

- **Given**: searchQuerySchema が定義されている
- **When**: `z.infer<typeof searchQuerySchema>` で型を推論する
- **Then**: SearchQuery型と構造的に等価な型が推論される

---

#### AC-SCHEMA-002: デフォルト値の適用

**シナリオ1: SearchOptionsのデフォルト値**

- **Given**: searchOptionsSchema が定義されている
- **When**: `{}` を parse する
- **Then**: `{limit: 20, offset: 0, includeMetadata: true, includeHighlights: true, rerankEnabled: true, cragEnabled: false, strategies: ["hybrid"], weights: {keyword: 0.35, semantic: 0.35, graph: 0.30}}` が返る

**シナリオ2: RRFConfigのデフォルト値**

- **Given**: rrfConfigSchema が定義されている
- **When**: `{}` を parse する
- **Then**: `{k: 60, normalizeScores: true}` が返る

---

## 5. CONV-03-01との整合性要件

### 5.1 Branded Type活用要件

| 要件ID         | 要件                                                                       | 優先度    |
| -------------- | -------------------------------------------------------------------------- | --------- |
| REQ-COMPAT-001 | SearchResultSources.chunkId は CONV-03-01 の ChunkId 型を使用する          | Must have |
| REQ-COMPAT-002 | SearchResultSources.fileId は CONV-03-01 の FileId 型を使用する            | Must have |
| REQ-COMPAT-003 | SearchResultSources.entityIds は CONV-03-01 の EntityId 型の配列を使用する | Must have |
| REQ-COMPAT-004 | SearchResultSources.communityId は CONV-03-01 の CommunityId 型を使用する  | Must have |
| REQ-COMPAT-005 | ID生成時は CONV-03-01 の create\*Id() 関数を使用する                       | Must have |
| REQ-COMPAT-006 | 新規ID生成時は CONV-03-01 の generate\*Id() 関数を使用する                 | Must have |

### 5.2 共通インターフェース活用要件

| 要件ID         | 要件                                                                                       | 優先度      |
| -------------- | ------------------------------------------------------------------------------------------ | ----------- |
| REQ-COMPAT-007 | SearchStrategy インターフェースは CONV-03-01 の SearchStrategy<TQuery, TResult> を拡張する | Should have |
| REQ-COMPAT-008 | ページネーション機能は CONV-03-01 の PaginationParams, PaginatedResult を使用する          | Should have |
| REQ-COMPAT-009 | 非同期処理のステータスは CONV-03-01 の AsyncStatus を使用する                              | Could have  |
| REQ-COMPAT-010 | エラー型は CONV-03-01 の RAGError と Result<T, E> パターンを使用する                       | Must have   |

### 5.3 import パス要件

| 要件ID         | 要件                                                           | 優先度    |
| -------------- | -------------------------------------------------------------- | --------- |
| REQ-COMPAT-011 | Branded Type は `../branded` からインポートする                | Must have |
| REQ-COMPAT-012 | 共通インターフェースは `../interfaces` からインポートする      | Must have |
| REQ-COMPAT-013 | 共通スキーマ（uuidSchema等）は `../schemas` からインポートする | Must have |

---

## 6. 非機能要件

### NFR-001: 型安全性

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| **要件ID**   | NFR-001                                |
| **カテゴリ** | 保守性（Maintainability）              |
| **指標**     | 型エラー検出率                         |
| **目標値**   | コンパイル時に100%の型エラーを検出     |
| **測定方法** | TypeScript strict モードでのコンパイル |
| **重要度**   | Critical                               |

**具体的要件**:

- すべてのプロパティに readonly 修飾子を使用する
- any 型の使用を禁止する（unknown または具体的な型を使用）
- Branded Type により異なる ID 型の誤用をコンパイル時に検出する

---

### NFR-002: スキーマ検証性能

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| **要件ID**   | NFR-002                              |
| **カテゴリ** | パフォーマンス（Performance）        |
| **指標**     | Zod parse 処理時間                   |
| **目標値**   | 単一オブジェクトの parse が 1ms 以内 |
| **測定方法** | Vitest でのベンチマークテスト        |
| **重要度**   | Medium                               |

**具体的要件**:

- 複雑な refine バリデーションは必要最小限に留める
- 大量データ検証時はバッチ処理を検討する

---

### NFR-003: 型推論のコンパイル時間

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| **要件ID**   | NFR-003                           |
| **カテゴリ** | 開発効率（Developer Experience）  |
| **指標**     | 型推論によるコンパイル時間増加    |
| **目標値**   | 型定義追加による増加が 500ms 以内 |
| **測定方法** | tsc --diagnostics での計測        |
| **重要度**   | Low                               |

**具体的要件**:

- 過度に複雑な条件型（Conditional Type）の使用を避ける
- 再帰的な型定義を最小限に留める

---

### NFR-004: 拡張可能性

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| **要件ID**   | NFR-004                                        |
| **カテゴリ** | 保守性（Maintainability）                      |
| **指標**     | 新規プロパティ追加の容易性                     |
| **目標値**   | 新規プロパティ追加が既存コードに影響を与えない |
| **測定方法** | 変更影響範囲のコードレビュー                   |
| **重要度**   | High                                           |

**具体的要件**:

- 列挙型は const object + type 抽出パターンを使用する（値の追加が容易）
- インターフェースは extends による拡張を考慮した設計とする
- Zodスキーマは .extend() での拡張を可能とする

---

### NFR-005: ドキュメント性

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| **要件ID**   | NFR-005                                         |
| **カテゴリ** | 保守性（Maintainability）                       |
| **指標**     | JSDoc コメントカバレッジ                        |
| **目標値**   | すべての公開型・関数に JSDoc コメントが存在する |
| **測定方法** | TypeDoc によるドキュメント生成                  |
| **重要度**   | Medium                                          |

**具体的要件**:

- すべての interface/type に `@description` を記述する
- すべてのプロパティに説明コメントを記述する
- 使用例を `@example` で提供する

---

## 7. 制約事項

### 7.1 技術制約

| 制約ID    | 制約内容                                    | 理由                                  |
| --------- | ------------------------------------------- | ------------------------------------- |
| CONST-001 | TypeScript 5.x 以上を使用すること           | strict モード、satisfies 演算子の使用 |
| CONST-002 | Zod 3.x 以上を使用すること                  | プロジェクト標準、coerce 機能の使用   |
| CONST-003 | Float32Array 型を embedding に使用すること  | メモリ効率、WebAssembly 互換性        |
| CONST-004 | readonly 修飾子を全プロパティに適用すること | 不変性の保証                          |
| CONST-005 | as const アサーションを列挙値に適用すること | リテラル型の保持                      |

### 7.2 設計制約

| 制約ID    | 制約内容                                                     | 理由                            |
| --------- | ------------------------------------------------------------ | ------------------------------- |
| CONST-006 | バレルエクスポート（index.ts）を提供すること                 | import パスの簡潔化             |
| CONST-007 | 型定義（types.ts）とスキーマ定義（schemas.ts）を分離すること | 関心の分離、Tree-shaking 最適化 |
| CONST-008 | ユーティリティ関数（utils.ts）を分離すること                 | 単体テストの容易化              |

### 7.3 命名規約

| 対象                 | 規約                            | 例                                    |
| -------------------- | ------------------------------- | ------------------------------------- |
| 型名                 | PascalCase                      | SearchQuery, SearchResult             |
| プロパティ名         | camelCase                       | processingTime, totalCount            |
| 定数オブジェクト名   | PascalCase（複数形）            | QueryTypes, SearchStrategies          |
| 列挙値               | UPPER_SNAKE_CASE                | LOCAL, GLOBAL, HYBRID                 |
| Zodスキーマ名        | camelCase + Schema サフィックス | searchQuerySchema, searchResultSchema |
| ユーティリティ関数名 | camelCase                       | getDefaultWeights, calculateRRFScore  |

---

## 8. ディレクトリ構造

```
packages/shared/src/types/rag/search/
├── index.ts      # バレルエクスポート
├── types.ts      # 型定義（interface, type, const object）
├── schemas.ts    # Zodスキーマ定義
└── utils.ts      # ユーティリティ関数（RRFスコア計算、正規化等）
```

---

## 9. 要件追跡マトリクス

| 要件ID       | 要件名                | 優先度      | 依存関係                               | 受け入れ基準               | ステータス |
| ------------ | --------------------- | ----------- | -------------------------------------- | -------------------------- | ---------- |
| REQ-ENUM-001 | QueryType             | Must have   | -                                      | AC-TYPE-001                | Draft      |
| REQ-ENUM-002 | SearchStrategy        | Must have   | -                                      | AC-TYPE-001                | Draft      |
| REQ-ENUM-003 | SearchResultType      | Must have   | REQ-COMPAT-001-004                     | AC-TYPE-006                | Draft      |
| REQ-TYPE-001 | SearchQuery           | Must have   | REQ-TYPE-002,004                       | AC-TYPE-001, AC-SCHEMA-001 | Draft      |
| REQ-TYPE-002 | SearchFilters         | Must have   | REQ-TYPE-003                           | AC-SCHEMA-001              | Draft      |
| REQ-TYPE-003 | DateRange             | Should have | -                                      | AC-TYPE-003                | Draft      |
| REQ-TYPE-004 | SearchOptions         | Must have   | REQ-TYPE-005, REQ-ENUM-002             | AC-SCHEMA-002              | Draft      |
| REQ-TYPE-005 | SearchWeights         | Must have   | -                                      | AC-TYPE-002                | Draft      |
| REQ-TYPE-006 | QueryClassification   | Must have   | REQ-ENUM-001, REQ-TYPE-005             | AC-TYPE-001                | Draft      |
| REQ-TYPE-007 | SearchResult          | Must have   | REQ-TYPE-001,008,015                   | AC-SCHEMA-001              | Draft      |
| REQ-TYPE-008 | SearchResultItem      | Must have   | REQ-TYPE-009,011,012,014, REQ-ENUM-003 | AC-TYPE-006                | Draft      |
| REQ-TYPE-009 | RelevanceScore        | Must have   | REQ-TYPE-010                           | AC-TYPE-004                | Draft      |
| REQ-TYPE-010 | CRAGScore             | Should have | -                                      | AC-TYPE-005                | Draft      |
| REQ-TYPE-011 | SearchResultContent   | Must have   | -                                      | AC-SCHEMA-001              | Draft      |
| REQ-TYPE-012 | Highlight             | Should have | REQ-TYPE-013                           | AC-SCHEMA-001              | Draft      |
| REQ-TYPE-013 | HighlightOffset       | Should have | -                                      | AC-TYPE-007                | Draft      |
| REQ-TYPE-014 | SearchResultSources   | Must have   | REQ-COMPAT-001-006                     | AC-TYPE-006                | Draft      |
| REQ-TYPE-015 | SearchStrategyMetrics | Must have   | REQ-TYPE-016                           | AC-SCHEMA-001              | Draft      |
| REQ-TYPE-016 | StrategyMetric        | Must have   | -                                      | AC-SCHEMA-001              | Draft      |
| REQ-TYPE-017 | RRFConfig             | Must have   | -                                      | AC-SCHEMA-002              | Draft      |
| REQ-TYPE-018 | RerankConfig          | Should have | -                                      | AC-SCHEMA-002              | Draft      |

---

## 10. 用語集

| 用語          | 定義                                                                                                    | 補足                                      |
| ------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Branded Type  | TypeScript のプリミティブ型に名目的な型情報を付与し、異なるID型の混同をコンパイル時に検出可能にする技法 | CONV-03-01で定義                          |
| RRF           | Reciprocal Rank Fusion。複数の検索結果リストのランクを統合するアルゴリズム                              | k=60がデフォルト                          |
| CRAG          | Corrective RAG。検索結果の品質を評価し、必要に応じてクエリ改善やWeb検索を提案する手法                   | Corrective Retrieval Augmented Generation |
| BM25          | キーワード検索で使用される TF-IDF ベースの関連度スコアリングアルゴリズム                                | SQLite FTS5 で使用                        |
| Cross-encoder | クエリと文書を同時に入力し、関連度スコアを直接出力するニューラルネットワークモデル                      | リランキングに使用                        |
| Zod           | TypeScript ファーストのスキーマ宣言・バリデーションライブラリ                                           | 3.x系を使用                               |

---

## 11. リスクと対策

| リスクID | リスク内容                              | 影響度 | 発生確率 | 対策                                                           |
| -------- | --------------------------------------- | ------ | -------- | -------------------------------------------------------------- |
| R-001    | Float32Array の JSON シリアライズ非対応 | Medium | High     | カスタムシリアライザの提供、または number[] への変換関数を用意 |
| R-002    | Branded Type の実行時型チェック不可     | Low    | High     | Zod スキーマでの UUID 形式検証を併用                           |
| R-003    | 複雑なrefineによるZodパース性能劣化     | Medium | Medium   | パフォーマンステストの実施、必要に応じてrefine削減             |
| R-004    | CONV-03-01 との破壊的変更               | High   | Low      | CONV-03-01 の変更監視、型互換性テストの作成                    |

---

## 12. 承認

| ロール       | 名前                       | 署名 | 日付       |
| ------------ | -------------------------- | ---- | ---------- |
| 要件定義担当 | Requirements Analyst Agent | -    | 2025-12-18 |
| 設計担当     | -                          | -    | -          |
| 実装担当     | -                          | -    | -          |

---

## 付録 A: MoSCoW優先度サマリー

### Must have（必須）: 18件

- REQ-ENUM-001, REQ-ENUM-002, REQ-ENUM-003
- REQ-TYPE-001, REQ-TYPE-002, REQ-TYPE-004, REQ-TYPE-005, REQ-TYPE-006
- REQ-TYPE-007, REQ-TYPE-008, REQ-TYPE-009, REQ-TYPE-011, REQ-TYPE-014
- REQ-TYPE-015, REQ-TYPE-016, REQ-TYPE-017
- REQ-COMPAT-001 ~ REQ-COMPAT-006, REQ-COMPAT-010 ~ REQ-COMPAT-013

### Should have（重要）: 6件

- REQ-TYPE-003, REQ-TYPE-010, REQ-TYPE-012, REQ-TYPE-013, REQ-TYPE-018
- REQ-COMPAT-007, REQ-COMPAT-008

### Could have（望ましい）: 1件

- REQ-COMPAT-009

### Won't have（対象外）: 0件

---

## 付録 B: 変更履歴

| バージョン | 日付       | 変更者                     | 変更内容 |
| ---------- | ---------- | -------------------------- | -------- |
| 1.0.0      | 2025-12-18 | Requirements Analyst Agent | 初版作成 |
