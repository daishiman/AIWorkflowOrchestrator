# GraphSearchStrategy テストケース一覧

> Phase 4 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## テストケース一覧

### 1. Constructor Tests

| ID    | テストケース                             | 期待結果                       | 優先度 |
| ----- | ---------------------------------------- | ------------------------------ | ------ |
| TC-01 | 必須依存関係で正しくインスタンス化される | インスタンス生成成功           | 高     |
| TC-02 | CommunitySummarizerはオプショナル        | null渡しでもインスタンス化成功 | 高     |

### 2. Basic Search Tests

| ID    | テストケース                                  | 期待結果                      | 優先度 |
| ----- | --------------------------------------------- | ----------------------------- | ------ |
| TC-03 | nameプロパティが"graph"を返す                 | name === "graph"              | 高     |
| TC-04 | 基本的な検索が動作する                        | Result.ok(SearchResultItem[]) | 高     |
| TC-05 | limit件数以下の結果を返す                     | result.length <= limit        | 高     |
| TC-06 | 検索結果がSearchResultItem形式で返される      | 正しい型構造                  | 高     |
| TC-07 | queryTypeに応じて適切な検索メソッドを呼び出す | 正しいメソッドがcall          | 高     |
| TC-08 | デフォルトはlocalSearch                       | options無しでlocalSearch実行  | 高     |

### 3. LocalSearch Tests

| ID    | テストケース                           | 期待結果                     | 優先度 |
| ----- | -------------------------------------- | ---------------------------- | ------ |
| TC-09 | エンティティベースの検索が動作する     | エンティティが検出される     | 高     |
| TC-10 | エンティティメタデータが含まれる       | entityIds配列が設定される    | 高     |
| TC-11 | 類似度閾値でフィルタする               | threshold以上のみ返る        | 高     |
| TC-12 | エンティティが見つからない場合は空配列 | ok([])                       | 高     |
| TC-13 | 関連チャンクが取得される               | content.textに値が設定される | 高     |
| TC-14 | 複数エンティティからチャンクを統合     | 重複除去された結果           | 中     |

### 4. GlobalSearch Tests

| ID    | テストケース                                             | 期待結果                  | 優先度 |
| ----- | -------------------------------------------------------- | ------------------------- | ------ |
| TC-15 | コミュニティサマリベースの検索が動作する                 | CommunitySummary検索結果  | 高     |
| TC-16 | コミュニティレベル情報が含まれる                         | sources.communityIdが設定 | 高     |
| TC-17 | CommunitySummarizer未設定時はlocalSearchにフォールバック | localSearchが実行される   | 高     |
| TC-18 | communityThresholdでフィルタする                         | threshold以上のみ返る     | 中     |
| TC-19 | type="community"で結果が返される                         | SearchResultItem.type確認 | 中     |

### 5. RelationshipSearch Tests

| ID    | テストケース                              | 期待結果                      | 優先度 |
| ----- | ----------------------------------------- | ----------------------------- | ------ |
| TC-20 | エンティティ間の関係検索が動作する        | パス情報が取得される          | 高     |
| TC-21 | パス距離がメタデータに含まれる            | relevance.graphにdistance反映 | 高     |
| TC-22 | 2エンティティ未満の場合はtraverseのみ実行 | traverse結果が返る            | 高     |
| TC-23 | 1エンティティの場合も結果を返す           | トラバーサル結果              | 高     |
| TC-24 | 0エンティティの場合は空配列               | ok([])                        | 高     |
| TC-25 | 最大深度を超えない                        | depth <= MAX_TRAVERSAL_DEPTH  | 中     |
| TC-26 | 最短経路が検索される（2エンティティ以上） | findShortestPath呼び出し      | 高     |
| TC-27 | relationTypesフィルタが適用される         | 指定タイプのみ                | 中     |

### 6. Scoring Tests

| ID    | テストケース                                              | 期待結果        | 優先度 |
| ----- | --------------------------------------------------------- | --------------- | ------ |
| TC-28 | スコアが0-1の範囲                                         | 0 <= score <= 1 | 高     |
| TC-29 | 結果がスコア順でソートされる                              | 降順            | 高     |
| TC-30 | localスコア = エンティティ類似度×0.6 + チャンク関連度×0.4 | 計算結果一致    | 高     |
| TC-31 | globalスコア = サマリ類似度                               | 計算結果一致    | 高     |
| TC-32 | pathスコア = (1/(1+distance))×0.5 + チャンク×0.5          | 計算結果一致    | 高     |
| TC-33 | relevance.graphにグラフスコアが設定される                 | 値が設定される  | 高     |

### 7. Filter Tests

| ID    | テストケース                    | 期待結果                   | 優先度 |
| ----- | ------------------------------- | -------------------------- | ------ |
| TC-34 | fileIdsフィルタが適用される     | 指定ファイルのみ           | 高     |
| TC-35 | entityTypesフィルタが適用される | 指定エンティティタイプのみ | 高     |
| TC-36 | フィルタなしで全結果が返される  | 全件返却                   | 中     |
| TC-37 | 空のフィルタで全結果が返される  | 全件返却                   | 中     |
| TC-38 | 複合フィルタが適用される        | AND条件で絞り込み          | 中     |

### 8. Error Handling Tests

| ID    | テストケース                                   | 期待結果             | 優先度 |
| ----- | ---------------------------------------------- | -------------------- | ------ |
| TC-39 | 埋め込みプロバイダーエラー時にResult.errを返す | err(EmbeddingError)  | 高     |
| TC-40 | グラフストアエラー時にResult.errを返す         | err(GraphStoreError) | 高     |
| TC-41 | 部分的なエラーでも他の結果を返す               | 成功分のみ返却       | 高     |
| TC-42 | 空のクエリでエラーを返す                       | err(ValidationError) | 高     |
| TC-43 | クエリが長すぎる場合にエラーを返す             | err(ValidationError) | 高     |
| TC-44 | 無効なlimitでエラーを返す（0以下）             | err(ValidationError) | 高     |
| TC-45 | 無効なlimitでエラーを返す（100超）             | err(ValidationError) | 高     |
| TC-46 | Summarizerエラー時はerr                        | err(SummarizerError) | 中     |

### 9. Metrics Tests

| ID    | テストケース                           | 期待結果            | 優先度 |
| ----- | -------------------------------------- | ------------------- | ------ |
| TC-47 | getMetrics()がStrategyMetricを返す     | 正しい型構造        | 高     |
| TC-48 | メトリクスに正しい結果件数が記録される | resultCount一致     | 高     |
| TC-49 | メトリクスに処理時間が記録される       | processingTime >= 0 | 高     |
| TC-50 | 空結果時のtopScoreが0                  | topScore === 0      | 中     |

### 10. Boundary Tests

| ID    | テストケース                            | 期待結果             | 優先度 |
| ----- | --------------------------------------- | -------------------- | ------ |
| TC-51 | limit=1で1件の結果を返す                | result.length <= 1   | 高     |
| TC-52 | limit=100で最大100件の結果を返す        | result.length <= 100 | 高     |
| TC-53 | 結果が0件の場合に空配列を返す           | ok([])               | 高     |
| TC-54 | entityThreshold=0で全エンティティを検索 | フィルタなし         | 中     |
| TC-55 | entityThreshold=1でほぼ全て除外         | 高閾値フィルタ       | 中     |
| TC-56 | traversalDepth=1で直接隣接のみ          | 深度1まで            | 中     |
| TC-57 | traversalDepth=5で最大深度まで          | 深度5まで            | 中     |
| TC-58 | クエリ長1000文字（最大値）で正常動作    | ok(results)          | 中     |

### 11. Input Validation Tests

| ID    | テストケース                   | 期待結果             | 優先度 |
| ----- | ------------------------------ | -------------------- | ------ |
| TC-59 | 空白のみのクエリでエラー       | err(ValidationError) | 高     |
| TC-60 | タブ・改行のみのクエリでエラー | err(ValidationError) | 高     |
| TC-61 | 日本語クエリで正常動作         | ok(results)          | 中     |
| TC-62 | 絵文字を含むクエリで正常動作   | ok(results)          | 低     |
| TC-63 | 特殊文字を含むクエリで正常動作 | ok(results)          | 低     |

---

## テスト実行コマンド

```bash
# ユニットテスト
pnpm test -- --filter="GraphSearchStrategy"

# 統合テスト
pnpm test -- --filter="GraphSearchStrategy Integration"

# カバレッジ
pnpm test -- --filter="GraphSearchStrategy" --coverage
```

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 4完了） |
