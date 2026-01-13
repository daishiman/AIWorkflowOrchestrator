# GraphSearchStrategy 受け入れ基準

> Phase 1 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

各機能要件に対するGiven-When-Then形式の受け入れ基準を定義する。

---

## FR-001: ISearchStrategyインターフェース準拠

### AC-001-1: name プロパティ

**Given** GraphSearchStrategyのインスタンスが存在する
**When** nameプロパティにアクセスする
**Then** "graph"という文字列が返される

### AC-001-2: search メソッド実行

**Given** 有効なクエリ、limit、依存サービスが設定されている
**When** search()メソッドを呼び出す
**Then** Result<SearchResultItem[], Error>が返される

### AC-001-3: getMetrics メソッド実行

**Given** search()メソッドが1回以上実行されている
**When** getMetrics()メソッドを呼び出す
**Then** StrategyMetric（resultCount, processingTime, topScore含む）が返される

---

## FR-002: ローカル検索（localSearch）

### AC-002-1: 基本的なローカル検索

**Given** Knowledge Graphに複数のエンティティとチャンクが存在する
**When** queryType="local"でsearch()を実行する
**Then** クエリに関連するエンティティに紐づくチャンクがSearchResultItem[]で返される

### AC-002-2: エンティティ類似度によるフィルタリング

**Given** entityThreshold=0.7が設定されている
**When** localSearchを実行する
**Then** 類似度0.7以上のエンティティに関連するチャンクのみが返される

### AC-002-3: エンティティが見つからない場合

**Given** クエリに関連するエンティティが存在しない
**When** localSearchを実行する
**Then** 空配列がok()でラップされて返される

---

## FR-003: グローバル検索（globalSearch）

### AC-003-1: 基本的なグローバル検索

**Given** CommunitySummarizerが設定されており、コミュニティサマリが存在する
**When** queryType="global"でsearch()を実行する
**Then** クエリに関連するコミュニティがSearchResultItem[]で返される

### AC-003-2: コミュニティサマリがない場合

**Given** 該当するコミュニティサマリが存在しない
**When** globalSearchを実行する
**Then** 空配列がok()でラップされて返される

### AC-003-3: CommunitySummarizer未設定時のフォールバック

**Given** CommunitySummarizerがnullで設定されている
**When** queryType="global"でsearch()を実行する
**Then** localSearchにフォールバックして結果が返される

---

## FR-004: 関係検索（relationshipSearch）

### AC-004-1: 基本的な関係検索

**Given** 2つのエンティティ間にパスが存在する
**When** queryType="relationship"でsearch()を実行する
**Then** パス上の関係に紐づくチャンクがSearchResultItem[]で返される

### AC-004-2: 最短経路が見つかる場合

**Given** エンティティAからBへの最短経路が存在する
**When** relationshipSearchを実行する
**Then** 最短経路上のエッジに関連するチャンクが優先的に返される

### AC-004-3: パスが見つからない場合

**Given** 指定エンティティ間にパスが存在しない
**When** relationshipSearchを実行する
**Then** 空配列がok()でラップされて返される

### AC-004-4: トラバーサル深度制限

**Given** traversalDepth=2が設定されている
**When** relationshipSearchを実行する
**Then** 2ホップ以内の関連コンテンツのみが検索される

---

## FR-005: クエリタイプ対応

### AC-005-1: localタイプ指定

**Given** options.queryType="local"が指定されている
**When** search()を実行する
**Then** localSearch()が内部的に呼び出される

### AC-005-2: globalタイプ指定

**Given** options.queryType="global"が指定されている
**When** search()を実行する
**Then** globalSearch()が内部的に呼び出される

### AC-005-3: relationshipタイプ指定

**Given** options.queryType="relationship"が指定されている
**When** search()を実行する
**Then** relationshipSearch()が内部的に呼び出される

### AC-005-4: デフォルト動作

**Given** queryTypeが指定されていない
**When** search()を実行する
**Then** localSearch()がデフォルトで呼び出される

---

## FR-006: スコアリング

### AC-006-1: スコア範囲

**Given** 任意の検索が実行される
**When** 結果が返される
**Then** 各SearchResultItem.scoreは0.0〜1.0の範囲内である

### AC-006-2: ローカル検索スコア計算

**Given** localSearchで結果が返される
**When** スコアを確認する
**Then** score = エンティティ類似度 × 0.6 + チャンク関連度 × 0.4 で計算されている

### AC-006-3: グローバル検索スコア計算

**Given** globalSearchで結果が返される
**When** スコアを確認する
**Then** score = コミュニティサマリ類似度 で計算されている

### AC-006-4: 関係検索スコア計算

**Given** relationshipSearchで結果が返される
**When** スコアを確認する
**Then** score = パス距離スコア × 0.5 + チャンク関連度 × 0.5 で計算されている

### AC-006-5: スコア降順ソート

**Given** 複数の結果が返される
**When** 結果配列を確認する
**Then** scoreの降順でソートされている

---

## FR-007: フィルタ対応

### AC-007-1: fileIdsフィルタ

**Given** filters.fileIds=["file1", "file2"]が指定されている
**When** search()を実行する
**Then** 指定ファイルに関連するチャンクのみが返される

### AC-007-2: entityTypesフィルタ

**Given** filters.entityTypes=["person", "organization"]が指定されている
**When** localSearchを実行する
**Then** 指定タイプのエンティティに関連するチャンクのみが返される

### AC-007-3: minRelevanceフィルタ

**Given** filters.minRelevance=0.5が指定されている
**When** search()を実行する
**Then** スコア0.5以上の結果のみが返される

### AC-007-4: 複数フィルタの組み合わせ

**Given** fileIds, entityTypes, minRelevanceが全て指定されている
**When** search()を実行する
**Then** 全フィルタ条件を満たす結果のみが返される

---

## FR-008: エラーハンドリング

### AC-008-1: EmbeddingProviderエラー

**Given** EmbeddingProviderがエラーを返す
**When** search()を実行する
**Then** err(EmbeddingProviderError)が返される

### AC-008-2: GraphStoreエラー

**Given** IKnowledgeGraphStoreがエラーを返す
**When** search()を実行する
**Then** err(GraphStoreError)が返される

### AC-008-3: CommunitySummarizerエラー

**Given** ICommunitySummarizerがエラーを返す
**When** globalSearchを実行する
**Then** err(CommunitySummarizerError)が返される

### AC-008-4: 空クエリバリデーション

**Given** query=""（空文字列）
**When** search()を実行する
**Then** err(ValidationError: "Query cannot be empty")が返される

### AC-008-5: クエリ長超過バリデーション

**Given** queryが1000文字を超える
**When** search()を実行する
**Then** err(ValidationError: "Query exceeds maximum length")が返される

### AC-008-6: limit範囲外バリデーション

**Given** limit=0 または limit=101
**When** search()を実行する
**Then** err(ValidationError: "Limit must be between 1 and 100")が返される

---

## NFR-001: パフォーマンス

### AC-NFR-001-1: localSearch応答時間

**Given** 標準的なデータセット（1000エンティティ）
**When** localSearchを10回実行する
**Then** 平均応答時間が200ms未満である

### AC-NFR-001-2: globalSearch応答時間

**Given** 標準的なデータセット（100コミュニティ）
**When** globalSearchを10回実行する
**Then** 平均応答時間が300ms未満である

### AC-NFR-001-3: relationshipSearch応答時間

**Given** 標準的なデータセット（1000エンティティ、5000関係）
**When** relationshipSearchを10回実行する
**Then** 平均応答時間が500ms未満である

---

## NFR-003: テスト品質

### AC-NFR-003-1: Lineカバレッジ

**Given** 全テストスイートを実行する
**When** カバレッジレポートを生成する
**Then** Line Coverage が80%以上である

### AC-NFR-003-2: Branchカバレッジ

**Given** 全テストスイートを実行する
**When** カバレッジレポートを生成する
**Then** Branch Coverage が60%以上である

### AC-NFR-003-3: Functionカバレッジ

**Given** 全テストスイートを実行する
**When** カバレッジレポートを生成する
**Then** Function Coverage が80%以上である

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 1完了） |
