# テストケース一覧 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 4                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. テーブル存在確認テストケース

### TC-1.1: entitiesテーブル

| ID       | TC-1.1.1                      |
| -------- | ----------------------------- |
| テスト名 | entitiesテーブルが存在する    |
| 前提条件 | マイグレーション適用済み      |
| 入力     | `PRAGMA table_info(entities)` |
| 期待結果 | 13カラムの情報が返される      |
| カテゴリ | テーブル存在                  |

### TC-1.2: relationsテーブル

| ID       | TC-1.2.1                       |
| -------- | ------------------------------ |
| テスト名 | relationsテーブルが存在する    |
| 前提条件 | マイグレーション適用済み       |
| 入力     | `PRAGMA table_info(relations)` |
| 期待結果 | 11カラムの情報が返される       |
| カテゴリ | テーブル存在                   |

### TC-1.3: relation_evidenceテーブル

| ID       | TC-1.3.1                               |
| -------- | -------------------------------------- |
| テスト名 | relation_evidenceテーブルが存在する    |
| 前提条件 | マイグレーション適用済み               |
| 入力     | `PRAGMA table_info(relation_evidence)` |
| 期待結果 | 6カラムの情報が返される                |
| カテゴリ | テーブル存在                           |

### TC-1.4: communitiesテーブル

| ID       | TC-1.4.1                         |
| -------- | -------------------------------- |
| テスト名 | communitiesテーブルが存在する    |
| 前提条件 | マイグレーション適用済み         |
| 入力     | `PRAGMA table_info(communities)` |
| 期待結果 | 10カラムの情報が返される         |
| カテゴリ | テーブル存在                     |

### TC-1.5: entity_communitiesテーブル

| ID       | TC-1.5.1                                |
| -------- | --------------------------------------- |
| テスト名 | entity_communitiesテーブルが存在する    |
| 前提条件 | マイグレーション適用済み                |
| 入力     | `PRAGMA table_info(entity_communities)` |
| 期待結果 | 2カラムの情報が返される                 |
| カテゴリ | テーブル存在                            |

### TC-1.6: chunk_entitiesテーブル

| ID       | TC-1.6.1                            |
| -------- | ----------------------------------- |
| テスト名 | chunk_entitiesテーブルが存在する    |
| 前提条件 | マイグレーション適用済み            |
| 入力     | `PRAGMA table_info(chunk_entities)` |
| 期待結果 | 4カラムの情報が返される             |
| カテゴリ | テーブル存在                        |

---

## 2. インデックス存在確認テストケース

### TC-2.1: entitiesインデックス

| ID       | TC-2.1.1                               |
| -------- | -------------------------------------- |
| テスト名 | entities_normalized_name_idxが存在する |
| 前提条件 | マイグレーション適用済み               |
| 入力     | `PRAGMA index_list(entities)`          |
| 期待結果 | インデックス名が含まれる               |
| カテゴリ | インデックス                           |

| ID       | TC-2.1.2                      |
| -------- | ----------------------------- |
| テスト名 | entities_type_idxが存在する   |
| 前提条件 | マイグレーション適用済み      |
| 入力     | `PRAGMA index_list(entities)` |
| 期待結果 | インデックス名が含まれる      |
| カテゴリ | インデックス                  |

| ID       | TC-2.1.3                          |
| -------- | --------------------------------- |
| テスト名 | entities_importance_idxが存在する |
| 前提条件 | マイグレーション適用済み          |
| 入力     | `PRAGMA index_list(entities)`     |
| 期待結果 | インデックス名が含まれる          |
| カテゴリ | インデックス                      |

| ID       | TC-2.1.4                                   |
| -------- | ------------------------------------------ |
| テスト名 | entities_name_type_idx（UNIQUE）が存在する |
| 前提条件 | マイグレーション適用済み                   |
| 入力     | `PRAGMA index_list(entities)`              |
| 期待結果 | UNIQUEインデックスとして存在               |
| カテゴリ | インデックス                               |

### TC-2.2: relationsインデックス

| ID       | TC-2.2.1                          |
| -------- | --------------------------------- |
| テスト名 | relations_source_id_idxが存在する |
| 前提条件 | マイグレーション適用済み          |
| 入力     | `PRAGMA index_list(relations)`    |
| 期待結果 | インデックス名が含まれる          |
| カテゴリ | インデックス                      |

| ID       | TC-2.2.2                          |
| -------- | --------------------------------- |
| テスト名 | relations_target_id_idxが存在する |
| 前提条件 | マイグレーション適用済み          |
| 入力     | `PRAGMA index_list(relations)`    |
| 期待結果 | インデックス名が含まれる          |
| カテゴリ | インデックス                      |

| ID       | TC-2.2.3                                             |
| -------- | ---------------------------------------------------- |
| テスト名 | relations_source_target_type_idx（UNIQUE）が存在する |
| 前提条件 | マイグレーション適用済み                             |
| 入力     | `PRAGMA index_list(relations)`                       |
| 期待結果 | UNIQUEインデックスとして存在                         |
| カテゴリ | インデックス                                         |

---

## 3. 外部キー制約テストケース

### TC-3.1: relations外部キー

| ID       | TC-3.1.1                               |
| -------- | -------------------------------------- |
| テスト名 | relations.source_idがentities.idを参照 |
| 前提条件 | マイグレーション適用済み               |
| 入力     | `PRAGMA foreign_key_list(relations)`   |
| 期待結果 | source_id → entities.id のFK定義が存在 |
| カテゴリ | 外部キー                               |

| ID       | TC-3.1.2                               |
| -------- | -------------------------------------- |
| テスト名 | relations.target_idがentities.idを参照 |
| 前提条件 | マイグレーション適用済み               |
| 入力     | `PRAGMA foreign_key_list(relations)`   |
| 期待結果 | target_id → entities.id のFK定義が存在 |
| カテゴリ | 外部キー                               |

### TC-3.2: relation_evidence外部キー

| ID       | TC-3.2.1                                          |
| -------- | ------------------------------------------------- |
| テスト名 | relation_evidence.relation_idがrelations.idを参照 |
| 前提条件 | マイグレーション適用済み                          |
| 入力     | `PRAGMA foreign_key_list(relation_evidence)`      |
| 期待結果 | relation_id → relations.id のFK定義が存在         |
| カテゴリ | 外部キー                                          |

| ID       | TC-3.2.2                                     |
| -------- | -------------------------------------------- |
| テスト名 | relation_evidence.chunk_idがchunks.idを参照  |
| 前提条件 | マイグレーション適用済み                     |
| 入力     | `PRAGMA foreign_key_list(relation_evidence)` |
| 期待結果 | chunk_id → chunks.id のFK定義が存在          |
| カテゴリ | 外部キー                                     |

### TC-3.3: communities外部キー

| ID       | TC-3.3.1                                                |
| -------- | ------------------------------------------------------- |
| テスト名 | communities.parent_idがcommunities.idを参照（自己参照） |
| 前提条件 | マイグレーション適用済み                                |
| 入力     | `PRAGMA foreign_key_list(communities)`                  |
| 期待結果 | parent_id → communities.id のFK定義が存在               |
| カテゴリ | 外部キー                                                |

---

## 4. CASCADE DELETE動作テストケース

### TC-4.1: entities削除によるrelations連動削除

| ID       | TC-4.1.1                                          |
| -------- | ------------------------------------------------- |
| テスト名 | entity削除時に関連するrelationsが連動削除される   |
| 前提条件 | entity1, entity2, relation(entity1→entity2)が存在 |
| 操作     | entity1を削除                                     |
| 期待結果 | 関連するrelationも削除されている                  |
| カテゴリ | CASCADE DELETE                                    |

### TC-4.2: relations削除によるrelation_evidence連動削除

| ID       | TC-4.2.1                                            |
| -------- | --------------------------------------------------- |
| テスト名 | relation削除時に関連するrelation_evidenceが連動削除 |
| 前提条件 | relation, relation_evidence(そのrelation参照)が存在 |
| 操作     | relationを削除                                      |
| 期待結果 | 関連するrelation_evidenceも削除されている           |
| カテゴリ | CASCADE DELETE                                      |

### TC-4.3: entities削除によるentity_communities連動削除

| ID       | TC-4.3.1                                           |
| -------- | -------------------------------------------------- |
| テスト名 | entity削除時に関連するentity_communitiesが連動削除 |
| 前提条件 | entity, community, entity_communityが存在          |
| 操作     | entityを削除                                       |
| 期待結果 | 関連するentity_communityも削除されている           |
| カテゴリ | CASCADE DELETE                                     |

---

## 5. SET NULL動作テストケース

### TC-5.1: communities親削除によるSET NULL

| ID       | TC-5.1.1                                     |
| -------- | -------------------------------------------- |
| テスト名 | 親community削除時に子のparent_idがNULLになる |
| 前提条件 | 親community, 子community(parent_id=親)が存在 |
| 操作     | 親communityを削除                            |
| 期待結果 | 子communityのparent_idがNULLになっている     |
| カテゴリ | SET NULL                                     |

---

## 6. UNIQUE制約テストケース

### TC-6.1: entities UNIQUE制約

| ID       | TC-6.1.1                                            |
| -------- | --------------------------------------------------- |
| テスト名 | 同じnormalized_name+typeの組み合わせは挿入不可      |
| 前提条件 | entity(normalized_name='test', type='person')が存在 |
| 操作     | 同じnormalized_name, typeで別entityを挿入           |
| 期待結果 | UNIQUE constraint違反エラー                         |
| カテゴリ | UNIQUE制約                                          |

### TC-6.2: relations UNIQUE制約

| ID       | TC-6.2.1                                           |
| -------- | -------------------------------------------------- |
| テスト名 | 同じsource_id+target_id+typeの組み合わせは挿入不可 |
| 前提条件 | relation(source, target, type='related_to')が存在  |
| 操作     | 同じsource, target, typeで別relationを挿入         |
| 期待結果 | UNIQUE constraint違反エラー                        |
| カテゴリ | UNIQUE制約                                         |

---

## テストケースサマリ

| カテゴリ       | ケース数 | 優先度 |
| -------------- | -------- | ------ |
| テーブル存在   | 6        | 必須   |
| インデックス   | 7        | 必須   |
| 外部キー       | 5        | 必須   |
| CASCADE DELETE | 3        | 必須   |
| SET NULL       | 1        | 必須   |
| UNIQUE制約     | 2        | 必須   |
| **合計**       | **24**   |        |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
