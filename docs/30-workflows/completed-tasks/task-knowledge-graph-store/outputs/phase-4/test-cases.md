# Knowledge Graph Store テストケース一覧

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 4                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. Entity Operations テストケース

### 1.1 upsertEntity

| TC-ID    | テストケース名                | 入力                                | 期待結果                                 | 優先度 |
| -------- | ----------------------------- | ----------------------------------- | ---------------------------------------- | ------ |
| TC-E-001 | 新規エンティティの作成        | 新規ExtractedEntity                 | StoredEntity作成、mentionCount=1         | High   |
| TC-E-002 | 既存エンティティの更新        | 同名ExtractedEntity                 | mentionCount加算、updatedAt更新          | High   |
| TC-E-003 | aliasesの統合                 | 異なるaliasesを持つ同名エンティティ | aliasesがマージされる                    | Medium |
| TC-E-004 | 名前の正規化                  | 大文字小文字・空白を含む名前        | normalizedNameが正規化される             | High   |
| TC-E-005 | chunkIdの関連付け             | chunkId指定でupsert                 | chunk_entitiesテーブルに関連レコード作成 | Medium |
| TC-E-006 | metadataの保存                | metadata付きExtractedEntity         | JSONとして正しく保存される               | Low    |
| TC-E-007 | importanceScoreのデフォルト値 | importance未指定                    | デフォルト0.5が設定される                | Low    |

### 1.2 getEntity

| TC-ID    | テストケース名                 | 入力             | 期待結果           | 優先度 |
| -------- | ------------------------------ | ---------------- | ------------------ | ------ |
| TC-E-010 | 存在するエンティティの取得     | 有効なEntityId   | StoredEntityが返却 | High   |
| TC-E-011 | 存在しないエンティティの取得   | 無効なEntityId   | nullが返却         | High   |
| TC-E-012 | 論理削除済みエンティティの取得 | 削除済みEntityId | nullが返却         | Medium |

### 1.3 getEntityByName

| TC-ID    | テストケース名                   | 入力               | 期待結果                 | 優先度 |
| -------- | -------------------------------- | ------------------ | ------------------------ | ------ |
| TC-E-020 | 名前での検索（完全一致）         | 正確な名前         | StoredEntityが返却       | High   |
| TC-E-021 | 名前での検索（大文字小文字無視） | 異なるケースの名前 | StoredEntityが返却       | High   |
| TC-E-022 | type指定での絞り込み             | name + type指定    | 該当するエンティティのみ | Medium |
| TC-E-023 | 存在しない名前での検索           | 存在しない名前     | nullが返却               | High   |

### 1.4 findEntities

| TC-ID    | テストケース名           | 入力                        | 期待結果               | 優先度 |
| -------- | ------------------------ | --------------------------- | ---------------------- | ------ |
| TC-E-030 | type指定での絞り込み     | type: "person"              | person型のみ返却       | High   |
| TC-E-031 | nameContains検索         | nameContains: "test"        | 名前に"test"を含むもの | Medium |
| TC-E-032 | minImportance絞り込み    | minImportance: 0.7          | importance >= 0.7のみ  | Medium |
| TC-E-033 | limit指定                | limit: 10                   | 最大10件返却           | High   |
| TC-E-034 | offset指定（ページング） | offset: 10, limit: 10       | 11-20件目を返却        | Medium |
| TC-E-035 | orderBy name ASC         | orderBy: "name", asc        | 名前昇順でソート       | Medium |
| TC-E-036 | orderBy importance DESC  | orderBy: "importance", desc | 重要度降順でソート     | Medium |
| TC-E-037 | オプションなし           | オプション未指定            | 全エンティティ返却     | Low    |

### 1.5 findSimilarEntities

| TC-ID    | テストケース名 | 入力            | 期待結果  | 優先度 |
| -------- | -------------- | --------------- | --------- | ------ |
| TC-E-040 | 空配列の返却   | 任意のembedding | 空配列 [] | Low    |

### 1.6 deleteEntity

| TC-ID    | テストケース名               | 入力             | 期待結果                  | 優先度 |
| -------- | ---------------------------- | ---------------- | ------------------------- | ------ |
| TC-E-050 | 存在するエンティティの削除   | 有効なEntityId   | void返却、deletedAt設定   | High   |
| TC-E-051 | 関連relationsのCASCADE削除   | 関係を持つEntity | 関連relationsも削除される | High   |
| TC-E-052 | 存在しないエンティティの削除 | 無効なEntityId   | EntityNotFoundError       | High   |

### 1.7 bulkUpsertEntities

| TC-ID    | テストケース名             | 入力                 | 期待結果         | 優先度 |
| -------- | -------------------------- | -------------------- | ---------------- | ------ |
| TC-E-060 | 複数エンティティの一括作成 | 複数ExtractedEntity  | 全て作成成功     | High   |
| TC-E-061 | トランザクション整合性     | 途中で失敗するデータ | 全てロールバック | High   |
| TC-E-062 | 空配列での呼び出し         | 空配列               | 空配列返却       | Low    |

---

## 2. Relation Operations テストケース

### 2.1 addRelation

| TC-ID    | テストケース名             | 入力                    | 期待結果              | 優先度 |
| -------- | -------------------------- | ----------------------- | --------------------- | ------ |
| TC-R-001 | 正常な関係の作成           | 有効なExtractedRelation | StoredRelation作成    | High   |
| TC-R-002 | 証拠なしでの作成（エラー） | evidence空配列          | EvidenceRequiredError | High   |
| TC-R-003 | 自己ループの作成（エラー） | source == target        | SelfLoopError         | High   |
| TC-R-004 | 存在しないsourceでの作成   | 無効なsourceEntityName  | EntityNotFoundError   | High   |
| TC-R-005 | 存在しないtargetでの作成   | 無効なtargetEntityName  | EntityNotFoundError   | High   |
| TC-R-006 | weight指定                 | weight: 0.8             | weight=0.8で保存      | Medium |
| TC-R-007 | weightデフォルト値         | weight未指定            | weight=1.0            | Low    |
| TC-R-008 | 複数evidence               | evidence複数件          | 全evidence保存        | Medium |

### 2.2 getRelation

| TC-ID    | テストケース名       | 入力             | 期待結果                   | 優先度 |
| -------- | -------------------- | ---------------- | -------------------------- | ------ |
| TC-R-010 | 存在する関係の取得   | 有効なRelationId | StoredRelation + evidences | High   |
| TC-R-011 | 存在しない関係の取得 | 無効なRelationId | nullが返却                 | High   |
| TC-R-012 | evidence情報の結合   | 有効なRelationId | evidences配列が含まれる    | Medium |

### 2.3 getRelations

| TC-ID    | テストケース名               | 入力                            | 期待結果                 | 優先度 |
| -------- | ---------------------------- | ------------------------------- | ------------------------ | ------ |
| TC-R-020 | outgoing関係の取得           | entityId, direction: "outgoing" | そのEntityが起点の関係   | High   |
| TC-R-021 | incoming関係の取得           | entityId, direction: "incoming" | そのEntityが終点の関係   | High   |
| TC-R-022 | both関係の取得（デフォルト） | entityIdのみ                    | 起点・終点いずれかの関係 | High   |
| TC-R-023 | 関係のないエンティティ       | 孤立したEntity                  | 空配列返却               | Medium |

### 2.4 findRelations

| TC-ID    | テストケース名         | 入力                | 期待結果          | 優先度 |
| -------- | ---------------------- | ------------------- | ----------------- | ------ |
| TC-R-030 | sourceEntityId絞り込み | sourceEntityId指定  | 該当関係のみ      | Medium |
| TC-R-031 | targetEntityId絞り込み | targetEntityId指定  | 該当関係のみ      | Medium |
| TC-R-032 | relationType絞り込み   | relationType指定    | 該当タイプのみ    | Medium |
| TC-R-033 | minWeight絞り込み      | minWeight: 0.5      | weight >= 0.5のみ | Low    |
| TC-R-034 | limit/offset           | limit: 5, offset: 0 | 最大5件返却       | Low    |

### 2.5 deleteRelation

| TC-ID    | テストケース名                 | 入力             | 期待結果                | 優先度 |
| -------- | ------------------------------ | ---------------- | ----------------------- | ------ |
| TC-R-040 | 存在する関係の削除             | 有効なRelationId | void返却、deletedAt設定 | High   |
| TC-R-041 | relation_evidenceのCASCADE     | 有効なRelationId | evidenceも削除          | High   |
| TC-R-042 | 存在しない関係の削除（冪等性） | 無効なRelationId | void返却（エラーなし）  | Medium |

### 2.6 bulkAddRelations

| TC-ID    | テストケース名               | 入力                  | 期待結果         | 優先度 |
| -------- | ---------------------------- | --------------------- | ---------------- | ------ |
| TC-R-050 | 複数関係の一括作成           | 複数ExtractedRelation | 全て作成成功     | High   |
| TC-R-051 | バリデーションエラー時全失敗 | 1件でも無効なデータ   | 全てロールバック | High   |
| TC-R-052 | 空配列での呼び出し           | 空配列                | 空配列返却       | Low    |

---

## 3. Graph Traversal テストケース

### 3.1 traverse

| TC-ID    | テストケース名             | 入力                       | 期待結果                    | 優先度 |
| -------- | -------------------------- | -------------------------- | --------------------------- | ------ |
| TC-G-001 | 基本的なBFS探索            | startEntityId, maxDepth: 2 | 2ホップまでのノード・エッジ | High   |
| TC-G-002 | maxDepth制限               | maxDepth: 1                | 1ホップまでのみ             | High   |
| TC-G-003 | maxNodes制限               | maxNodes: 5                | 最大5ノードまで             | High   |
| TC-G-004 | 循環グラフでの探索         | 循環を含むグラフ           | 無限ループせず終了          | High   |
| TC-G-005 | direction: outgoing        | outgoing方向のみ           | 出力関係のみ探索            | Medium |
| TC-G-006 | direction: incoming        | incoming方向のみ           | 入力関係のみ探索            | Medium |
| TC-G-007 | relationTypes絞り込み      | 特定関係タイプのみ         | 指定タイプの関係のみ探索    | Medium |
| TC-G-008 | minWeight絞り込み          | minWeight: 0.5             | weight >= 0.5の関係のみ     | Low    |
| TC-G-009 | 存在しないEntityからの探索 | 無効なEntityId             | EntityNotFoundError         | High   |
| TC-G-010 | 孤立ノードからの探索       | 関係のないEntity           | 開始ノードのみ含む結果      | Medium |

### 3.2 findShortestPath

| TC-ID    | テストケース名           | 入力                   | 期待結果                   | 優先度 |
| -------- | ------------------------ | ---------------------- | -------------------------- | ------ |
| TC-G-020 | 直接接続のパス           | 隣接するfrom, to       | length: 1のパス            | High   |
| TC-G-021 | 複数ホップのパス         | 2ホップ離れたfrom, to  | 最短パス返却               | High   |
| TC-G-022 | パスが存在しない場合     | 接続のないfrom, to     | null返却                   | High   |
| TC-G-023 | 同一ノードのパス         | fromId == toId         | そのノードのみ含むパス     | Medium |
| TC-G-024 | maxDepth超過             | maxDepth: 2で3ホップ先 | null返却                   | Medium |
| TC-G-025 | 複数パス存在時の最短選択 | 複数ルートが存在       | 最短（ホップ数最小）を返却 | High   |

### 3.3 getNeighbors

| TC-ID    | テストケース名      | 入力                  | 期待結果                | 優先度 |
| -------- | ------------------- | --------------------- | ----------------------- | ------ |
| TC-G-030 | 基本的な隣接取得    | entityId              | 1ホップの隣接ノード全て | High   |
| TC-G-031 | direction: outgoing | direction: "outgoing" | 出力方向の隣接のみ      | Medium |
| TC-G-032 | limit指定           | limit: 3              | 最大3件                 | Low    |
| TC-G-033 | 隣接なし            | 孤立ノード            | 空配列                  | Medium |

---

## 4. Statistics テストケース

### 4.1 getStats

| TC-ID    | テストケース名            | 入力 | 期待結果               | 優先度 |
| -------- | ------------------------- | ---- | ---------------------- | ------ |
| TC-S-001 | 基本的な統計取得          | なし | GraphStats全項目       | High   |
| TC-S-002 | totalEntities計算         | なし | 削除済み除外のカウント | High   |
| TC-S-003 | totalRelations計算        | なし | 削除済み除外のカウント | High   |
| TC-S-004 | entitiesByType集計        | なし | タイプ別カウント       | Medium |
| TC-S-005 | relationsByType集計       | なし | 関係タイプ別カウント   | Medium |
| TC-S-006 | averageRelationsPerEntity | なし | 平均関係数             | Low    |
| TC-S-007 | 空データベースでの統計    | なし | 全項目0                | Medium |

---

## 5. Error Handling テストケース

| TC-ID      | テストケース名                     | 操作                       | 期待エラー            | 優先度 |
| ---------- | ---------------------------------- | -------------------------- | --------------------- | ------ |
| TC-ERR-001 | EntityNotFoundError - getEntity    | 存在しないID指定           | EntityNotFoundError   | High   |
| TC-ERR-002 | EntityNotFoundError - deleteEntity | 存在しないID指定           | EntityNotFoundError   | High   |
| TC-ERR-003 | SelfLoopError                      | source == targetで関係作成 | SelfLoopError         | High   |
| TC-ERR-004 | EvidenceRequiredError              | evidence空で関係作成       | EvidenceRequiredError | High   |
| TC-ERR-005 | ValidationError - empty name       | 空文字名前でupsert         | ValidationError       | Medium |
| TC-ERR-006 | ValidationError - invalid weight   | weight > 1.0で関係作成     | ValidationError       | Medium |

---

## 6. Boundary Value テストケース

| TC-ID     | テストケース名     | 入力           | 期待結果               | 優先度 |
| --------- | ------------------ | -------------- | ---------------------- | ------ |
| TC-BV-001 | limit: 0           | limit: 0       | 空配列返却             | Low    |
| TC-BV-002 | limit: 大きな値    | limit: 1000000 | 上限適用またはエラー   | Low    |
| TC-BV-003 | maxDepth: 0        | maxDepth: 0    | 開始ノードのみ         | Medium |
| TC-BV-004 | maxDepth: 大きな値 | maxDepth: 100  | 性能劣化なく動作       | Low    |
| TC-BV-005 | weight: 0.0        | weight: 0.0    | 正常保存               | Low    |
| TC-BV-006 | weight: 1.0        | weight: 1.0    | 正常保存               | Low    |
| TC-BV-007 | 非常に長い名前     | 1000文字の名前 | 正常保存または切り捨て | Low    |
| TC-BV-008 | 空文字名前         | name: ""       | ValidationError        | Medium |

---

## 7. Edge Case テストケース

| TC-ID     | テストケース名         | シナリオ                  | 期待結果           | 優先度 |
| --------- | ---------------------- | ------------------------- | ------------------ | ------ |
| TC-EC-001 | 大規模グラフ探索       | 1000ノード、5000エッジ    | 適切な時間内に完了 | Low    |
| TC-EC-002 | 完全グラフ探索         | 全ノード相互接続          | maxNodes制限が機能 | Low    |
| TC-EC-003 | 線形グラフ探索         | A→B→C→D→E...              | maxDepth制限が機能 | Medium |
| TC-EC-004 | 空データベースでの操作 | 初期状態                  | エラーなく空結果   | Medium |
| TC-EC-005 | 特殊文字を含む名前     | 日本語、絵文字、記号      | 正常保存・検索     | Medium |
| TC-EC-006 | Unicode正規化          | 同一視される異なるUnicode | 正規化後一致       | Low    |

---

## 8. テストケースサマリー

| カテゴリ            | テストケース数 | High | Medium | Low |
| ------------------- | -------------- | ---- | ------ | --- |
| Entity Operations   | 27             | 14   | 9      | 4   |
| Relation Operations | 24             | 12   | 8      | 4   |
| Graph Traversal     | 19             | 9    | 7      | 3   |
| Statistics          | 7              | 2    | 3      | 2   |
| Error Handling      | 6              | 4    | 2      | 0   |
| Boundary Value      | 8              | 0    | 2      | 6   |
| Edge Cases          | 6              | 0    | 3      | 3   |
| **合計**            | **97**         | 41   | 34     | 22  |

---

## 9. 参照ドキュメント

| ドキュメント         | パス                                    |
| -------------------- | --------------------------------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md` |
| インターフェース設計 | `outputs/phase-2/interface-design.md`   |
| エラー設計           | `outputs/phase-2/error-design.md`       |
