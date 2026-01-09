# 受け入れ基準 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容                       |
| -------------- | -------------------------- |
| タスクID       | CONV-08-01                 |
| タスク名       | Knowledge Graph ストア実装 |
| 文書バージョン | 1.0.0                      |
| 作成日         | 2026-01-09                 |

---

## エンティティ操作

### AC-001: エンティティのUpsert（新規）

```gherkin
Feature: エンティティの新規作成

  Scenario: 新規エンティティを作成する
    Given データベースに「Alice」という名前のエンティティが存在しない
    When ExtractedEntity { name: "Alice", type: "person", confidence: 0.9 } でupsertEntityを呼び出す
    Then Result.okでStoredEntityが返却される
    And StoredEntityのnameが「Alice」である
    And StoredEntityのnormalizedNameが「alice」である
    And StoredEntityのtypeが「person」である
    And StoredEntityのmentionCountが1である
    And StoredEntityのidがEntityId形式である
    And StoredEntityのcreatedAtが現在時刻付近である
```

### AC-002: エンティティのUpsert（マージ）

```gherkin
Feature: エンティティのマージ

  Scenario: 既存エンティティとマージする
    Given データベースに「alice」(normalizedName)のエンティティが存在する
    And 既存エンティティのmentionCountが3である
    And 既存エンティティのaliasesが["アリス"]である
    When ExtractedEntity { name: "Alice", aliases: ["Alice-san"], chunkId: "chunk-2" } でupsertEntityを呼び出す
    Then Result.okでStoredEntityが返却される
    And StoredEntityのmentionCountが4である
    And StoredEntityのaliasesに「アリス」と「Alice-san」が含まれる
    And StoredEntityのchunkIdsに「chunk-2」が含まれる
    And StoredEntityのupdatedAtが更新されている
```

### AC-003: エンティティの取得（ID指定）

```gherkin
Feature: IDによるエンティティ取得

  Scenario: 存在するエンティティをIDで取得する
    Given データベースにid="entity-123"のエンティティが存在する
    When getEntity("entity-123")を呼び出す
    Then Result.okでStoredEntityが返却される
    And StoredEntityのidが「entity-123」である

  Scenario: 存在しないエンティティをIDで取得する
    Given データベースにid="entity-999"のエンティティが存在しない
    When getEntity("entity-999")を呼び出す
    Then Result.okでnullが返却される
```

### AC-004: エンティティの取得（名前指定）

```gherkin
Feature: 正規化名によるエンティティ取得

  Scenario: 存在するエンティティを名前で取得する
    Given データベースにnormalizedName="tokyo"のエンティティが存在する
    When getEntityByName("tokyo")を呼び出す
    Then Result.okでStoredEntityが返却される
    And StoredEntityのnormalizedNameが「tokyo」である

  Scenario: 存在しないエンティティを名前で取得する
    Given データベースにnormalizedName="unknown"のエンティティが存在しない
    When getEntityByName("unknown")を呼び出す
    Then Result.okでnullが返却される
```

### AC-005: エンティティの検索（条件指定）

```gherkin
Feature: 条件によるエンティティ検索

  Scenario: タイプでエンティティを検索する
    Given データベースにtype="person"のエンティティが5件存在する
    And type="organization"のエンティティが3件存在する
    When findEntities({ types: ["person"] })を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 結果の件数が5件である
    And すべての結果のtypeが「person」である

  Scenario: 名前パターンでエンティティを検索する
    Given データベースに「Tokyo Tower」「Tokyo Station」「Kyoto」のエンティティが存在する
    When findEntities({ namePattern: "Tokyo%" })を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 結果の件数が2件である

  Scenario: mentionCountでエンティティをフィルタする
    Given データベースにmentionCount=1,3,5,10のエンティティが存在する
    When findEntities({ minMentionCount: 5 })を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 結果の件数が2件である

  Scenario: ページネーションを適用する
    Given データベースに10件のエンティティが存在する
    When findEntities({ limit: 3, offset: 2 })を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 結果の件数が3件である
```

### AC-006: 類似エンティティ検索

```gherkin
Feature: 埋め込みベクトルによる類似エンティティ検索

  Scenario: 類似エンティティを検索する
    Given データベースに埋め込みを持つエンティティが10件存在する
    And 検索用の埋め込みベクトルがある
    When findSimilarEntities(embedding, limit=5, threshold=0.7)を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 結果の件数が5件以下である
    And すべての結果の類似度が0.7以上である
    And 結果は類似度の降順でソートされている

  Scenario: 閾値を満たす類似エンティティがない場合
    Given データベースに埋め込みを持つエンティティが存在する
    And 類似度が0.9以上のエンティティが存在しない
    When findSimilarEntities(embedding, limit=5, threshold=0.9)を呼び出す
    Then Result.okで空配列が返却される
```

### AC-007: エンティティの削除

```gherkin
Feature: エンティティの削除

  Scenario: 存在するエンティティを削除する
    Given データベースにid="entity-to-delete"のエンティティが存在する
    When deleteEntity("entity-to-delete")を呼び出す
    Then Result.okでvoidが返却される
    And getEntity("entity-to-delete")がnullを返す

  Scenario: 関連する関係も削除される
    Given データベースにid="entity-to-delete"のエンティティが存在する
    And そのエンティティに関連する関係が存在する
    When deleteEntity("entity-to-delete")を呼び出す
    Then Result.okでvoidが返却される
    And 関連する関係も削除されている
```

---

## 関係操作

### AC-008: 関係の追加（新規）

```gherkin
Feature: 関係の新規作成

  Scenario: 新規関係を作成する
    Given データベースにsourceId="entity-1"とtargetId="entity-2"のエンティティが存在する
    And 両者間に「uses」タイプの関係が存在しない
    When ExtractedRelation { sourceId, targetId, type: "uses", evidence: [...] } でaddRelationを呼び出す
    Then Result.okでStoredRelationが返却される
    And StoredRelationのsourceEntityIdが「entity-1」である
    And StoredRelationのtargetEntityIdが「entity-2」である
    And StoredRelationのrelationTypeが「uses」である
    And StoredRelationのweightが1である
```

### AC-009: 関係の追加（マージ）

```gherkin
Feature: 関係のマージ

  Scenario: 既存関係とマージする
    Given データベースにsource/target/typeが同一の関係が存在する
    And 既存関係のweightが2である
    And 既存関係のevidenceが1件ある
    When 新しいevidenceを持つExtractedRelationでaddRelationを呼び出す
    Then Result.okでStoredRelationが返却される
    And StoredRelationのweightが3である
    And StoredRelationのevidenceが2件である
```

### AC-010: 関係のバリデーション

```gherkin
Feature: 関係のバリデーション

  Scenario: Self-loopは拒否される
    Given sourceId="entity-1"
    When sourceId=targetId="entity-1"の関係を追加しようとする
    Then Result.errでエラーが返却される
    And エラーメッセージに「Self-loop」が含まれる

  Scenario: evidenceがない関係は拒否される
    Given 有効なsourceIdとtargetIdがある
    When evidenceが空の関係を追加しようとする
    Then Result.errでエラーが返却される
    And エラーメッセージに「evidence」が含まれる
```

### AC-011: 関係の取得

```gherkin
Feature: エンティティに関連する関係の取得

  Scenario: すべての関係を取得する
    Given entity-1から出る関係が2件、入る関係が3件ある
    When getRelations("entity-1", { direction: "both" })を呼び出す
    Then Result.okでStoredRelation[]が返却される
    And 結果の件数が5件である

  Scenario: 出力方向の関係のみ取得する
    Given entity-1から出る関係が2件、入る関係が3件ある
    When getRelations("entity-1", { direction: "out" })を呼び出す
    Then Result.okでStoredRelation[]が返却される
    And 結果の件数が2件である
    And すべての結果のsourceEntityIdが「entity-1」である

  Scenario: タイプでフィルタする
    Given entity-1に「uses」2件と「depends_on」1件の関係がある
    When getRelations("entity-1", { types: ["uses"] })を呼び出す
    Then Result.okでStoredRelation[]が返却される
    And 結果の件数が2件である
```

### AC-012: 関係の検索

```gherkin
Feature: ヒントによる関係検索

  Scenario: ソースとターゲットのヒントで検索する
    Given 「Alice」→「Python」の「uses」関係が存在する
    When findRelations("Alice", "Python")を呼び出す
    Then Result.okでStoredRelation[]が返却される
    And 結果に該当する関係が含まれる

  Scenario: 関係タイプのヒントも使用する
    Given 「Alice」→「Python」の「uses」関係と「teaches」関係が存在する
    When findRelations("Alice", "Python", "teaches")を呼び出す
    Then Result.okでStoredRelation[]が返却される
    And 結果の件数が1件である
    And 結果のrelationTypeが「teaches」である
```

---

## グラフトラバーサル

### AC-013: グラフトラバーサル

```gherkin
Feature: グラフトラバーサル

  Scenario: 指定した深さまでトラバースする
    Given A→B→C→Dの関係が存在する
    When traverse("A", { maxDepth: 2 })を呼び出す
    Then Result.okでGraphTraversalResultが返却される
    And visitedEntitiesにA,B,Cが含まれる
    And visitedEntitiesにDが含まれない
    And maxDepthReachedが2である

  Scenario: 関係タイプでフィルタする
    Given A→B(uses)、A→C(references)の関係が存在する
    When traverse("A", { maxDepth: 1, relationTypes: ["uses"] })を呼び出す
    Then visitedEntitiesにA,Bが含まれる
    And visitedEntitiesにCが含まれない

  Scenario: 最大ノード数で打ち切る
    Given Aから10個のエンティティに到達可能
    When traverse("A", { maxDepth: 10, maxNodes: 5 })を呼び出す
    Then visitedEntitiesの件数が5件以下である
```

### AC-014: 最短パス検索

```gherkin
Feature: 最短パス検索

  Scenario: 最短パスを見つける
    Given A→B→C→DとA→X→Dのパスが存在する
    When findShortestPath("A", "D")を呼び出す
    Then Result.okでGraphPathが返却される
    And pathの長さが2である（A→X→D）

  Scenario: パスが存在しない場合
    Given AとZが接続されていない
    When findShortestPath("A", "Z")を呼び出す
    Then Result.okでnullが返却される

  Scenario: 深さ制限を適用する
    Given A→B→C→D→Eのパスのみ存在する
    When findShortestPath("A", "E", maxDepth=3)を呼び出す
    Then Result.okでnullが返却される
```

### AC-015: 隣接ノード取得

```gherkin
Feature: 隣接ノード取得

  Scenario: 直接の隣接ノードを取得する
    Given Aから直接到達可能なエンティティがB,C,Dである
    When getNeighbors("A", depth=1)を呼び出す
    Then Result.okでGraphNode[]が返却される
    And 結果の件数が3件である
    And 各GraphNodeにentityとin/outRelationsが含まれる

  Scenario: 2ホップ先まで取得する
    Given A→B→Cの関係が存在する
    When getNeighbors("A", depth=2)を呼び出す
    Then Result.okでGraphNode[]が返却される
    And 結果にB,Cが含まれる
```

---

## グラフ統計

### AC-016: グラフ統計取得

```gherkin
Feature: グラフ統計取得

  Scenario: グラフ統計を取得する
    Given データベースに10エンティティ、15関係が存在する
    When getStats()を呼び出す
    Then Result.okでGraphStatsが返却される
    And entityCountが10である
    And relationCountが15である
    And entityTypeDistributionが各タイプの件数を含む
    And relationTypeDistributionが各タイプの件数を含む
    And averageRelationsPerEntityが3である（15*2/10、双方向カウント）
    And graphDensityが適切な値である
```

---

## バッチ操作

### AC-017: バッチエンティティUpsert

```gherkin
Feature: バッチエンティティUpsert

  Scenario: 複数エンティティを一括で挿入する
    Given 10件のExtractedEntity配列がある
    When bulkUpsertEntities(entities)を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 結果の件数が10件である
    And 全てのエンティティがデータベースに存在する

  Scenario: バッチ内でマージが発生する
    Given 配列内に同じnormalizedNameのエンティティが2件ある
    When bulkUpsertEntities(entities)を呼び出す
    Then Result.okでStoredEntity[]が返却される
    And 重複エンティティはマージされている
```

### AC-018: バッチ関係追加

```gherkin
Feature: バッチ関係追加

  Scenario: 複数関係を一括で追加する
    Given 5件のExtractedRelation配列がある
    And すべてのsource/targetエンティティが存在する
    When bulkAddRelations(relations)を呼び出す
    Then Result.okでStoredRelation[]が返却される
    And 結果の件数が5件である

  Scenario: バッチ操作がアトミックである
    Given 10件のExtractedRelation配列がある
    And そのうち1件が無効（Self-loop）である
    When bulkAddRelations(relations)を呼び出す
    Then Result.errでエラーが返却される
    And 有効だった9件も挿入されていない（ロールバック）
```

---

## エラーハンドリング

### AC-019: 存在しないエンティティへの関係追加

```gherkin
Feature: 存在しないエンティティへの関係追加

  Scenario: sourceが存在しない
    Given targetId="entity-2"のエンティティは存在する
    And sourceId="non-existent"のエンティティは存在しない
    When addRelation({ sourceId: "non-existent", targetId: "entity-2", ... })を呼び出す
    Then Result.errでエラーが返却される
    And エラーメッセージに「source entity not found」が含まれる
```

### AC-020: データベース接続エラー

```gherkin
Feature: データベース接続エラーハンドリング

  Scenario: データベース接続が切れている場合
    Given データベース接続が確立されていない
    When 任意のストア操作を実行する
    Then Result.errでエラーが返却される
    And エラーがDatabaseConnectionErrorである
```

---

## 統合テストシナリオ

### IT-001: データフローテスト

```gherkin
Feature: エンティティ→関係→トラバーサルの往復

  Scenario: フルフローテスト
    Given 空のデータベースがある
    When 3件のエンティティをupsertする
    And それらの間に関係を追加する
    And トラバーサルを実行する
    Then すべてのエンティティが訪問される
    And パス情報が正しい
```

### IT-002: API接続テスト

```gherkin
Feature: ストア操作の疎通確認

  Scenario: 基本操作の疎通
    Given データベース接続が確立されている
    When upsertEntity, getEntity, addRelation, getRelationsを順に実行する
    Then すべての操作がResult.okで完了する
```
