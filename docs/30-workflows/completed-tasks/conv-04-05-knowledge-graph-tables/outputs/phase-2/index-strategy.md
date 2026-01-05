# インデックス戦略: Knowledge Graph テーブル群

## 1. インデックス一覧

### 1.1 entitiesテーブル

| インデックス名               | カラム                | タイプ | クエリパターン                           |
| ---------------------------- | --------------------- | ------ | ---------------------------------------- |
| entities_normalized_name_idx | normalized_name       | INDEX  | `WHERE normalized_name = ?`              |
| entities_type_idx            | type                  | INDEX  | `WHERE type = ?`                         |
| entities_importance_idx      | importance            | INDEX  | `ORDER BY importance DESC`               |
| entities_name_type_idx       | normalized_name, type | UNIQUE | `WHERE normalized_name = ? AND type = ?` |

**設計根拠**:

- `normalized_name`: エンティティ検索の主要パターン
- `type`: タイプ別フィルタリング
- `importance`: 重要度順ソート（GraphRAGで頻用）
- `normalized_name + type`: 一意性保証（同名の異タイプ区別）

### 1.2 relationsテーブル

| インデックス名                   | カラム                     | タイプ | クエリパターン                                       |
| -------------------------------- | -------------------------- | ------ | ---------------------------------------------------- |
| relations_source_id_idx          | source_id                  | INDEX  | `WHERE source_id = ?`                                |
| relations_target_id_idx          | target_id                  | INDEX  | `WHERE target_id = ?`                                |
| relations_type_idx               | type                       | INDEX  | `WHERE type = ?`                                     |
| relations_weight_idx             | weight                     | INDEX  | `ORDER BY weight DESC`                               |
| relations_source_target_type_idx | source_id, target_id, type | UNIQUE | `WHERE source_id = ? AND target_id = ? AND type = ?` |

**設計根拠**:

- `source_id`: 「このエンティティからの関係」取得
- `target_id`: 「このエンティティへの関係」取得
- `type`: 関係タイプ別フィルタリング
- `weight`: 重要な関係の優先取得
- 複合UNIQUE: 同一ペア間の同種関係を防止

### 1.3 relation_evidenceテーブル

| インデックス名                    | カラム      | タイプ | クエリパターン          |
| --------------------------------- | ----------- | ------ | ----------------------- |
| relation_evidence_relation_id_idx | relation_id | INDEX  | `WHERE relation_id = ?` |
| relation_evidence_chunk_id_idx    | chunk_id    | INDEX  | `WHERE chunk_id = ?`    |

**設計根拠**:

- `relation_id`: 特定関係の証拠一覧取得
- `chunk_id`: 特定チャンクに関連する証拠取得

### 1.4 communitiesテーブル

| インデックス名            | カラム    | タイプ | クエリパターン        |
| ------------------------- | --------- | ------ | --------------------- |
| communities_level_idx     | level     | INDEX  | `WHERE level = ?`     |
| communities_parent_id_idx | parent_id | INDEX  | `WHERE parent_id = ?` |

**設計根拠**:

- `level`: 階層レベル別取得（Leidenマルチレベル）
- `parent_id`: 子コミュニティ一覧取得

### 1.5 entity_communitiesテーブル

| インデックス名                      | カラム       | タイプ | クエリパターン           |
| ----------------------------------- | ------------ | ------ | ------------------------ |
| entity_communities_entity_id_idx    | entity_id    | INDEX  | `WHERE entity_id = ?`    |
| entity_communities_community_id_idx | community_id | INDEX  | `WHERE community_id = ?` |

**設計根拠**:

- `entity_id`: エンティティが属するコミュニティ取得
- `community_id`: コミュニティのメンバー取得

### 1.6 chunk_entitiesテーブル

| インデックス名               | カラム    | タイプ | クエリパターン        |
| ---------------------------- | --------- | ------ | --------------------- |
| chunk_entities_chunk_id_idx  | chunk_id  | INDEX  | `WHERE chunk_id = ?`  |
| chunk_entities_entity_id_idx | entity_id | INDEX  | `WHERE entity_id = ?` |

**設計根拠**:

- `chunk_id`: チャンク内のエンティティ取得
- `entity_id`: エンティティが出現するチャンク取得

---

## 2. パフォーマンス考慮

### 2.1 予想クエリパターン

| 操作                       | 頻度 | 対応インデックス                    |
| -------------------------- | ---- | ----------------------------------- |
| エンティティ名検索         | 高   | entities_normalized_name_idx        |
| エンティティからの関係取得 | 高   | relations_source_id_idx             |
| エンティティへの関係取得   | 高   | relations_target_id_idx             |
| 重要度順エンティティ取得   | 中   | entities_importance_idx             |
| コミュニティのメンバー取得 | 中   | entity_communities_community_id_idx |
| チャンクのエンティティ取得 | 高   | chunk_entities_chunk_id_idx         |
| 関係の証拠取得             | 中   | relation_evidence_relation_id_idx   |

### 2.2 インデックスサイズ見積もり

| テーブル           | 予想レコード数 | インデックス数 | 概算サイズ |
| ------------------ | -------------- | -------------- | ---------- |
| entities           | 100万          | 4              | 〜400MB    |
| relations          | 500万          | 5              | 〜2GB      |
| relation_evidence  | 1000万         | 2              | 〜1GB      |
| communities        | 1万            | 2              | 〜10MB     |
| entity_communities | 100万          | 2              | 〜200MB    |
| chunk_entities     | 500万          | 2              | 〜1GB      |

### 2.3 最適化戦略

1. **部分インデックス検討**
   - 高重要度エンティティのみのインデックス（将来拡張）
   - `CREATE INDEX ... WHERE importance > 0.8`

2. **カバリングインデックス検討**
   - 頻繁なクエリパターンに対して
   - 現時点では見送り（オーバーヘッド考慮）

3. **インデックス統計更新**
   - 大量データ投入後は `ANALYZE` 実行推奨

---

## 3. SQLite固有の考慮事項

### 3.1 外部キーの有効化

```sql
PRAGMA foreign_keys = ON;
```

### 3.2 B-Treeインデックス

SQLiteのデフォルトインデックスはB-Tree。全インデックスがB-Treeとして実装される。

### 3.3 UNIQUE制約

UNIQUE制約は自動的にインデックスを作成するため、別途インデックス作成は不要。
