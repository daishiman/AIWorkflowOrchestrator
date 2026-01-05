# データベーススキーマ設計: Knowledge Graph テーブル群

## 1. entitiesテーブル

エンティティ（ノード）を格納するテーブル。

### 1.1 カラム定義

| カラム名           | 型          | 制約        | デフォルト  | 説明                   |
| ------------------ | ----------- | ----------- | ----------- | ---------------------- |
| id                 | TEXT        | PRIMARY KEY | UUID        | 主キー                 |
| name               | TEXT        | NOT NULL    | -           | エンティティ名         |
| normalized_name    | TEXT        | NOT NULL    | -           | 検索用正規化名         |
| type               | TEXT (enum) | NOT NULL    | -           | エンティティタイプ     |
| description        | TEXT        | NULL        | NULL        | 説明                   |
| aliases            | TEXT (JSON) | NOT NULL    | []          | 別名リスト             |
| embedding          | BLOB        | NULL        | NULL        | 埋め込みベクトル       |
| embedding_model_id | TEXT        | NULL        | NULL        | 埋め込みモデルID       |
| importance         | REAL        | NOT NULL    | 0.5         | 重要度スコア (0.0-1.0) |
| mention_count      | INTEGER     | NOT NULL    | 1           | 出現回数               |
| metadata           | TEXT (JSON) | NULL        | NULL        | 拡張メタデータ         |
| created_at         | INTEGER     | NOT NULL    | unixepoch() | 作成日時               |
| updated_at         | INTEGER     | NOT NULL    | unixepoch() | 更新日時               |

### 1.2 インデックス

| インデックス名               | カラム                | タイプ |
| ---------------------------- | --------------------- | ------ |
| entities_normalized_name_idx | normalized_name       | INDEX  |
| entities_type_idx            | type                  | INDEX  |
| entities_importance_idx      | importance            | INDEX  |
| entities_name_type_idx       | normalized_name, type | UNIQUE |

---

## 2. relationsテーブル

エンティティ間の関係（エッジ）を格納するテーブル。

### 2.1 カラム定義

| カラム名       | 型          | 制約         | デフォルト  | 説明                     |
| -------------- | ----------- | ------------ | ----------- | ------------------------ |
| id             | TEXT        | PRIMARY KEY  | UUID        | 主キー                   |
| source_id      | TEXT        | NOT NULL, FK | -           | ソースエンティティID     |
| target_id      | TEXT        | NOT NULL, FK | -           | ターゲットエンティティID |
| type           | TEXT (enum) | NOT NULL     | -           | 関係タイプ               |
| description    | TEXT        | NULL         | NULL        | 説明                     |
| weight         | REAL        | NOT NULL     | 0.5         | 関係の強さ (0.0-1.0)     |
| bidirectional  | INTEGER     | NOT NULL     | 0 (false)   | 双方向フラグ             |
| evidence_count | INTEGER     | NOT NULL     | 1           | 証拠数                   |
| metadata       | TEXT (JSON) | NULL         | NULL        | 拡張メタデータ           |
| created_at     | INTEGER     | NOT NULL     | unixepoch() | 作成日時                 |
| updated_at     | INTEGER     | NOT NULL     | unixepoch() | 更新日時                 |

### 2.2 外部キー

| カラム    | 参照先      | onDelete |
| --------- | ----------- | -------- |
| source_id | entities.id | CASCADE  |
| target_id | entities.id | CASCADE  |

### 2.3 インデックス

| インデックス名                   | カラム                     | タイプ |
| -------------------------------- | -------------------------- | ------ |
| relations_source_id_idx          | source_id                  | INDEX  |
| relations_target_id_idx          | target_id                  | INDEX  |
| relations_type_idx               | type                       | INDEX  |
| relations_weight_idx             | weight                     | INDEX  |
| relations_source_target_type_idx | source_id, target_id, type | UNIQUE |

---

## 3. relation_evidenceテーブル

関係の証拠（出典チャンク）を格納するテーブル。

### 3.1 カラム定義

| カラム名    | 型      | 制約             | デフォルト  | 説明                   |
| ----------- | ------- | ---------------- | ----------- | ---------------------- |
| relation_id | TEXT    | NOT NULL, FK, PK | -           | 関係ID                 |
| chunk_id    | TEXT    | NOT NULL, FK, PK | -           | チャンクID             |
| excerpt     | TEXT    | NOT NULL         | -           | 証拠テキスト抜粋       |
| confidence  | REAL    | NOT NULL         | 0.5         | 信頼度スコア (0.0-1.0) |
| created_at  | INTEGER | NOT NULL         | unixepoch() | 作成日時               |
| updated_at  | INTEGER | NOT NULL         | unixepoch() | 更新日時               |

### 3.2 外部キー

| カラム      | 参照先       | onDelete |
| ----------- | ------------ | -------- |
| relation_id | relations.id | CASCADE  |
| chunk_id    | chunks.id    | CASCADE  |

### 3.3 インデックス

| インデックス名                    | カラム      | タイプ |
| --------------------------------- | ----------- | ------ |
| relation_evidence_relation_id_idx | relation_id | INDEX  |
| relation_evidence_chunk_id_idx    | chunk_id    | INDEX  |

---

## 4. communitiesテーブル

Leidenアルゴリズムで検出されたコミュニティを格納するテーブル。

### 4.1 カラム定義

| カラム名           | 型      | 制約        | デフォルト  | 説明             |
| ------------------ | ------- | ----------- | ----------- | ---------------- |
| id                 | TEXT    | PRIMARY KEY | UUID        | 主キー           |
| level              | INTEGER | NOT NULL    | 0           | 階層レベル       |
| parent_id          | TEXT    | NULL, FK    | NULL        | 親コミュニティID |
| name               | TEXT    | NOT NULL    | -           | コミュニティ名   |
| summary            | TEXT    | NOT NULL    | -           | LLM生成サマリー  |
| member_count       | INTEGER | NOT NULL    | 0           | メンバー数       |
| embedding          | BLOB    | NULL        | NULL        | 埋め込みベクトル |
| embedding_model_id | TEXT    | NULL        | NULL        | 埋め込みモデルID |
| created_at         | INTEGER | NOT NULL    | unixepoch() | 作成日時         |
| updated_at         | INTEGER | NOT NULL    | unixepoch() | 更新日時         |

### 4.2 外部キー

| カラム    | 参照先         | onDelete |
| --------- | -------------- | -------- |
| parent_id | communities.id | SET NULL |

### 4.3 インデックス

| インデックス名            | カラム    | タイプ |
| ------------------------- | --------- | ------ |
| communities_level_idx     | level     | INDEX  |
| communities_parent_id_idx | parent_id | INDEX  |

---

## 5. entity_communitiesテーブル

エンティティとコミュニティの多対多関係を格納する中間テーブル。

### 5.1 カラム定義

| カラム名     | 型   | 制約             | デフォルト | 説明           |
| ------------ | ---- | ---------------- | ---------- | -------------- |
| entity_id    | TEXT | NOT NULL, FK, PK | -          | エンティティID |
| community_id | TEXT | NOT NULL, FK, PK | -          | コミュニティID |

### 5.2 外部キー

| カラム       | 参照先         | onDelete |
| ------------ | -------------- | -------- |
| entity_id    | entities.id    | CASCADE  |
| community_id | communities.id | CASCADE  |

### 5.3 インデックス

| インデックス名                      | カラム       | タイプ |
| ----------------------------------- | ------------ | ------ |
| entity_communities_entity_id_idx    | entity_id    | INDEX  |
| entity_communities_community_id_idx | community_id | INDEX  |

---

## 6. chunk_entitiesテーブル

チャンクとエンティティの多対多関係を格納する中間テーブル。

### 6.1 カラム定義

| カラム名      | 型          | 制約             | デフォルト | 説明           |
| ------------- | ----------- | ---------------- | ---------- | -------------- |
| chunk_id      | TEXT        | NOT NULL, FK, PK | -          | チャンクID     |
| entity_id     | TEXT        | NOT NULL, FK, PK | -          | エンティティID |
| mention_count | INTEGER     | NOT NULL         | 1          | 出現回数       |
| positions     | TEXT (JSON) | NOT NULL         | []         | 出現位置リスト |

### 6.2 外部キー

| カラム    | 参照先      | onDelete |
| --------- | ----------- | -------- |
| chunk_id  | chunks.id   | CASCADE  |
| entity_id | entities.id | CASCADE  |

### 6.3 インデックス

| インデックス名               | カラム    | タイプ |
| ---------------------------- | --------- | ------ |
| chunk_entities_chunk_id_idx  | chunk_id  | INDEX  |
| chunk_entities_entity_id_idx | entity_id | INDEX  |

### 6.4 positions型定義

```typescript
interface EntityPosition {
  startChar: number;
  endChar: number;
  surfaceForm: string;
}

type Positions = EntityPosition[];
```
