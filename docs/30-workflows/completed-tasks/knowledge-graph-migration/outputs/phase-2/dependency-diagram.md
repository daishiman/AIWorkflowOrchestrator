# スキーマ依存関係図 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 2                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. 全体依存関係図

```
                              ┌─────────────────┐
                              │     chunks      │ ← 外部テーブル（既存）
                              │    (外部依存)    │
                              └────────┬────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        │                        ▼
┌─────────────────────────┐            │            ┌─────────────────────────┐
│       entities          │            │            │      communities        │
│   (Knowledge Graph      │            │            │   (Leiden Clusters)     │
│        Nodes)           │            │            │                         │
└───────────┬─────────────┘            │            └───────────┬─────────────┘
            │                          │                        │
            │                          │                        │ parent_id
            │                          │                        │ (自己参照)
            ├──────────────┬───────────┼────────────┬───────────┤
            │              │           │            │           │
            ▼              ▼           ▼            ▼           │
┌───────────────────┐  ┌──────────────────────┐  ┌─────────────┴───────────┐
│   graphRelations  │  │    chunk_entities    │  │    entity_communities   │
│  (Knowledge Graph │  │  (Chunk-Entity       │  │  (Entity-Community      │
│       Edges)      │  │   Junction)          │  │   Junction)             │
└─────────┬─────────┘  └──────────────────────┘  └─────────────────────────┘
          │
          ▼
┌─────────────────────────┐
│   relation_evidence     │
│   (Relation-Chunk       │
│    Evidence Junction)   │
└─────────────────────────┘
```

---

## 2. 外部キー依存関係マトリクス

### 2.1 依存元 → 依存先

| 依存元テーブル     | 依存先テーブル | 参照カラム   | ON DELETE |
| ------------------ | -------------- | ------------ | --------- |
| graphRelations     | entities       | source_id    | CASCADE   |
| graphRelations     | entities       | target_id    | CASCADE   |
| relation_evidence  | graphRelations | relation_id  | CASCADE   |
| relation_evidence  | chunks         | chunk_id     | CASCADE   |
| communities        | communities    | parent_id    | SET NULL  |
| entity_communities | entities       | entity_id    | CASCADE   |
| entity_communities | communities    | community_id | CASCADE   |
| chunk_entities     | chunks         | chunk_id     | CASCADE   |
| chunk_entities     | entities       | entity_id    | CASCADE   |

### 2.2 被参照テーブル（依存先）

| 被参照テーブル | 参照元テーブル                                        | 参照数 |
| -------------- | ----------------------------------------------------- | ------ |
| entities       | graphRelations(2), entity_communities, chunk_entities | 4      |
| graphRelations | relation_evidence                                     | 1      |
| communities    | entity_communities, communities(自己)                 | 2      |
| chunks         | relation_evidence, chunk_entities                     | 2      |

---

## 3. テーブル作成順序（依存関係考慮）

### 3.1 依存レベル分析

| レベル | テーブル名         | 依存先                 | 作成順序 |
| ------ | ------------------ | ---------------------- | -------- |
| 0      | chunks             | なし（外部・既存）     | -        |
| 1      | entities           | なし                   | 1        |
| 1      | communities        | communities（自己）    | 2        |
| 2      | graphRelations     | entities               | 3        |
| 2      | chunk_entities     | chunks, entities       | 4        |
| 2      | entity_communities | entities, communities  | 5        |
| 3      | relation_evidence  | graphRelations, chunks | 6        |

### 3.2 推奨作成順序

```
1. entities          ← 基本ノードテーブル（依存なし）
       ↓
2. communities       ← クラスターテーブル（自己参照のみ）
       ↓
3. graphRelations    ← エッジテーブル（entities依存）
       ↓
4. chunk_entities    ← 中間テーブル（chunks, entities依存）
       ↓
5. entity_communities ← 中間テーブル（entities, communities依存）
       ↓
6. relation_evidence ← 中間テーブル（graphRelations, chunks依存）
```

---

## 4. テーブル詳細構造

### 4.1 entities（ノードテーブル）

```
┌─────────────────────────────────────────────────────────────┐
│                         entities                            │
├──────────────────┬──────────────┬───────────────────────────┤
│ Column           │ Type         │ Constraints               │
├──────────────────┼──────────────┼───────────────────────────┤
│ id               │ TEXT         │ PRIMARY KEY               │
│ name             │ TEXT         │ NOT NULL                  │
│ normalized_name  │ TEXT         │ NOT NULL                  │
│ type             │ TEXT         │ NOT NULL                  │
│ description      │ TEXT         │ NULL                      │
│ aliases          │ TEXT         │ NOT NULL DEFAULT '[]'     │
│ embedding        │ BLOB         │ NULL                      │
│ embedding_model_id│ TEXT        │ NULL                      │
│ importance       │ REAL         │ NOT NULL DEFAULT 0.5      │
│ mention_count    │ INTEGER      │ NOT NULL DEFAULT 1        │
│ metadata         │ TEXT         │ NULL                      │
│ created_at       │ INTEGER      │ DEFAULT unixepoch()       │
│ updated_at       │ INTEGER      │ DEFAULT unixepoch()       │
├──────────────────┴──────────────┴───────────────────────────┤
│ Indexes:                                                    │
│  - entities_normalized_name_idx                             │
│  - entities_type_idx                                        │
│  - entities_importance_idx                                  │
│  - entities_name_type_idx (UNIQUE: normalized_name + type)  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 graphRelations（エッジテーブル）

```
┌─────────────────────────────────────────────────────────────────────┐
│                         relations (graphRelations)                  │
├──────────────────┬──────────────┬───────────────────────────────────┤
│ Column           │ Type         │ Constraints                       │
├──────────────────┼──────────────┼───────────────────────────────────┤
│ id               │ TEXT         │ PRIMARY KEY                       │
│ source_id        │ TEXT         │ NOT NULL, FK→entities CASCADE     │
│ target_id        │ TEXT         │ NOT NULL, FK→entities CASCADE     │
│ type             │ TEXT         │ NOT NULL                          │
│ description      │ TEXT         │ NULL                              │
│ weight           │ REAL         │ NOT NULL DEFAULT 0.5              │
│ bidirectional    │ INTEGER      │ NOT NULL DEFAULT 0                │
│ evidence_count   │ INTEGER      │ NOT NULL DEFAULT 1                │
│ metadata         │ TEXT         │ NULL                              │
│ created_at       │ INTEGER      │ DEFAULT unixepoch()               │
│ updated_at       │ INTEGER      │ DEFAULT unixepoch()               │
├──────────────────┴──────────────┴───────────────────────────────────┤
│ Indexes:                                                            │
│  - relations_source_id_idx                                          │
│  - relations_target_id_idx                                          │
│  - relations_type_idx                                               │
│  - relations_weight_idx                                             │
│  - relations_source_target_type_idx (UNIQUE: source+target+type)    │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 communities（クラスターテーブル）

```
┌─────────────────────────────────────────────────────────────────────┐
│                           communities                               │
├──────────────────┬──────────────┬───────────────────────────────────┤
│ Column           │ Type         │ Constraints                       │
├──────────────────┼──────────────┼───────────────────────────────────┤
│ id               │ TEXT         │ PRIMARY KEY                       │
│ level            │ INTEGER      │ NOT NULL DEFAULT 0                │
│ parent_id        │ TEXT         │ NULL, FK→communities SET NULL     │
│ name             │ TEXT         │ NOT NULL                          │
│ summary          │ TEXT         │ NOT NULL                          │
│ member_count     │ INTEGER      │ NOT NULL DEFAULT 0                │
│ embedding        │ BLOB         │ NULL                              │
│ embedding_model_id│ TEXT        │ NULL                              │
│ created_at       │ INTEGER      │ DEFAULT unixepoch()               │
│ updated_at       │ INTEGER      │ DEFAULT unixepoch()               │
├──────────────────┴──────────────┴───────────────────────────────────┤
│ Indexes:                                                            │
│  - communities_level_idx                                            │
│  - communities_parent_id_idx                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 中間テーブル（Junction Tables）

```
┌─────────────────────────────────────────────────────────────────────┐
│                       relation_evidence                             │
├──────────────────┬──────────────┬───────────────────────────────────┤
│ relation_id      │ TEXT         │ PK, FK→relations CASCADE          │
│ chunk_id         │ TEXT         │ PK, FK→chunks CASCADE             │
│ excerpt          │ TEXT         │ NOT NULL                          │
│ confidence       │ REAL         │ NOT NULL DEFAULT 0.5              │
│ created_at       │ INTEGER      │ DEFAULT unixepoch()               │
│ updated_at       │ INTEGER      │ DEFAULT unixepoch()               │
├──────────────────┴──────────────┴───────────────────────────────────┤
│ Indexes: relation_evidence_relation_id_idx, relation_evidence_chunk_id_idx │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      entity_communities                             │
├──────────────────┬──────────────┬───────────────────────────────────┤
│ entity_id        │ TEXT         │ PK, FK→entities CASCADE           │
│ community_id     │ TEXT         │ PK, FK→communities CASCADE        │
├──────────────────┴──────────────┴───────────────────────────────────┤
│ Indexes: entity_communities_entity_id_idx, entity_communities_community_id_idx │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        chunk_entities                               │
├──────────────────┬──────────────┬───────────────────────────────────┤
│ chunk_id         │ TEXT         │ PK, FK→chunks CASCADE             │
│ entity_id        │ TEXT         │ PK, FK→entities CASCADE           │
│ mention_count    │ INTEGER      │ NOT NULL DEFAULT 1                │
│ positions        │ TEXT         │ NOT NULL DEFAULT '[]'             │
├──────────────────┴──────────────┴───────────────────────────────────┤
│ Indexes: chunk_entities_chunk_id_idx, chunk_entities_entity_id_idx  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. DROP順序（ロールバック用）

依存関係の逆順でDROPする必要がある:

```
1. relation_evidence  ← 最も依存が深い
       ↓
2. chunk_entities     ← 中間テーブル
       ↓
3. entity_communities ← 中間テーブル
       ↓
4. graphRelations     ← エッジテーブル
       ↓
5. communities        ← クラスターテーブル
       ↓
6. entities           ← 基本ノードテーブル
```

**注意**: `chunks` テーブルは外部テーブルのためDROP対象外

---

## 6. インデックス一覧

| テーブル           | インデックス名                      | カラム                     | UNIQUE |
| ------------------ | ----------------------------------- | -------------------------- | ------ |
| entities           | entities_normalized_name_idx        | normalized_name            | No     |
| entities           | entities_type_idx                   | type                       | No     |
| entities           | entities_importance_idx             | importance                 | No     |
| entities           | entities_name_type_idx              | normalized_name, type      | Yes    |
| relations          | relations_source_id_idx             | source_id                  | No     |
| relations          | relations_target_id_idx             | target_id                  | No     |
| relations          | relations_type_idx                  | type                       | No     |
| relations          | relations_weight_idx                | weight                     | No     |
| relations          | relations_source_target_type_idx    | source_id, target_id, type | Yes    |
| relation_evidence  | relation_evidence_relation_id_idx   | relation_id                | No     |
| relation_evidence  | relation_evidence_chunk_id_idx      | chunk_id                   | No     |
| communities        | communities_level_idx               | level                      | No     |
| communities        | communities_parent_id_idx           | parent_id                  | No     |
| entity_communities | entity_communities_entity_id_idx    | entity_id                  | No     |
| entity_communities | entity_communities_community_id_idx | community_id               | No     |
| chunk_entities     | chunk_entities_chunk_id_idx         | chunk_id                   | No     |
| chunk_entities     | chunk_entities_entity_id_idx        | entity_id                  | No     |

**合計**: 17インデックス（2 UNIQUE）

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
