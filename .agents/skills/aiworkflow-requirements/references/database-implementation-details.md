# 型安全クエリ・マイグレーション データベース設計 / detail specification

> 親仕様書: [database-implementation.md](database-implementation.md)
> 役割: detail specification

## Knowledge Graphテーブル群（GraphRAG基盤）

### 概要

GraphRAG（Graph Retrieval-Augmented Generation）のKnowledge Graph構造をSQLiteで永続化するためのテーブル群。
Entity-Relation-Communityモデルに基づき、文書から抽出されたエンティティ、関係性、コミュニティを格納する。

**実装場所**: `packages/shared/src/db/schema/graph/`

### entitiesテーブル（ノード）

Knowledge Graphのノード（頂点）を格納するテーブル。

| カラム             | 型      | 制約                  | 説明                        |
| ------------------ | ------- | --------------------- | --------------------------- |
| id                 | TEXT    | PRIMARY KEY           | エンティティID（UUID）      |
| name               | TEXT    | NOT NULL              | エンティティ名（元の形式）  |
| normalized_name    | TEXT    | NOT NULL              | 正規化されたエンティティ名  |
| type               | TEXT    | NOT NULL              | エンティティタイプ（52種類）|
| description        | TEXT    | NULL                  | エンティティの説明          |
| aliases            | TEXT    | NOT NULL DEFAULT '[]' | 別名（JSON配列）            |
| embedding          | BLOB    | NULL                  | ベクトル埋め込み            |
| embedding_model_id | TEXT    | NULL                  | 埋め込みモデルID            |
| importance         | REAL    | NOT NULL DEFAULT 0.5  | 重要度スコア（0.0〜1.0）    |
| mention_count      | INTEGER | NOT NULL DEFAULT 1    | 出現回数                    |
| metadata           | TEXT    | NULL                  | 追加メタデータ（JSON）      |
| created_at         | INTEGER | DEFAULT unixepoch()   | 作成日時（Unix epoch）      |
| updated_at         | INTEGER | DEFAULT unixepoch()   | 更新日時（Unix epoch）      |

**インデックス**:
- `entities_normalized_name_idx`: 正規化名検索用
- `entities_type_idx`: タイプ別検索用
- `entities_importance_idx`: 重要度順ソート用
- `entities_name_type_idx`: UNIQUE（正規化名＋タイプ）

**エンティティタイプ（52種類）**:

| カテゴリ     | タイプ                                                              |
| ------------ | ------------------------------------------------------------------- |
| 人物・組織   | `person`, `organization`, `company`, `team`, `department`           |
| 場所         | `location`, `country`, `city`, `region`, `building`, `address`      |
| 時間         | `date`, `time`, `datetime`, `period`, `duration`                    |
| 技術         | `technology`, `framework`, `library`, `tool`, `platform`            |
| コード       | `api`, `endpoint`, `function`, `method`, `class`, `interface`, `module`, `package`, `variable`, `constant` |
| ドキュメント | `document`, `file`, `section`, `chapter`, `paragraph`               |
| データ       | `database`, `table`, `column`, `schema`, `index`, `query`           |
| 概念         | `concept`, `pattern`, `principle`, `methodology`, `architecture`    |
| プロダクト   | `product`, `service`, `feature`, `version`, `release`               |
| イベント     | `event`, `meeting`, `milestone`, `deadline`                         |
| フォールバック | `other`                                                           |

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

### relationsテーブル（エッジ）

Knowledge Graphのエッジ（辺）を格納するテーブル。

| カラム         | 型      | 制約                      | 説明                      |
| -------------- | ------- | ------------------------- | ------------------------- |
| id             | TEXT    | PRIMARY KEY               | 関係ID（UUID）            |
| source_id      | TEXT    | FK→entities(id) CASCADE   | 始点エンティティID        |
| target_id      | TEXT    | FK→entities(id) CASCADE   | 終点エンティティID        |
| type           | TEXT    | NOT NULL                  | 関係タイプ（15種類）      |
| description    | TEXT    | NULL                      | 関係の説明                |
| weight         | REAL    | NOT NULL DEFAULT 0.5      | 関係の強さ（0.0〜1.0）    |
| bidirectional  | INTEGER | NOT NULL DEFAULT 0        | 双方向関係フラグ          |
| evidence_count | INTEGER | NOT NULL DEFAULT 1        | 証拠数（裏付けチャンク数）|
| metadata       | TEXT    | NULL                      | 追加メタデータ（JSON）    |
| created_at     | INTEGER | DEFAULT unixepoch()       | 作成日時                  |
| updated_at     | INTEGER | DEFAULT unixepoch()       | 更新日時                  |

**インデックス**:
- `relations_source_id_idx`: 始点エンティティ検索用
- `relations_target_id_idx`: 終点エンティティ検索用
- `relations_type_idx`: タイプ別検索用
- `relations_weight_idx`: 重み順ソート用
- `relations_source_target_type_idx`: UNIQUE（始点＋終点＋タイプ）

**関係タイプ（15種類）**:

| カテゴリ   | タイプ                                              |
| ---------- | --------------------------------------------------- |
| 一般       | `related_to`, `part_of`, `has_part`, `belongs_to`   |
| コード     | `uses`, `implements`, `extends`, `depends_on`       |
| 参照       | `references`, `defines`                             |
| 階層       | `contains`, `contained_by`                          |
| 時間       | `precedes`, `follows`, `created_by`                 |

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

**注記**: 変数名は`graphRelations`を使用（Drizzle ORMの`relations`関数との衝突回避）

### relation_evidenceテーブル（証拠）

関係の出典チャンク情報を格納する中間テーブル。

| カラム      | 型      | 制約                     | 説明                    |
| ----------- | ------- | ------------------------ | ----------------------- |
| relation_id | TEXT    | PK, FK→relations CASCADE | 関係ID                  |
| chunk_id    | TEXT    | PK, FK→chunks CASCADE    | チャンクID              |
| excerpt     | TEXT    | NOT NULL                 | 証拠テキスト抜粋        |
| confidence  | REAL    | NOT NULL DEFAULT 0.5     | 信頼度（0.0〜1.0）      |
| created_at  | INTEGER | DEFAULT unixepoch()      | 作成日時                |
| updated_at  | INTEGER | DEFAULT unixepoch()      | 更新日時                |

**インデックス**:
- `relation_evidence_relation_id_idx`: 関係別検索用
- `relation_evidence_chunk_id_idx`: チャンク別検索用

### communitiesテーブル（クラスター）

Leiden Algorithmによるコミュニティクラスターを格納するテーブル。

| カラム             | 型      | 制約                    | 説明                      |
| ------------------ | ------- | ----------------------- | ------------------------- |
| id                 | TEXT    | PRIMARY KEY             | コミュニティID（UUID）    |
| level              | INTEGER | NOT NULL DEFAULT 0      | 階層レベル（0=ルート）    |
| parent_id          | TEXT    | FK→communities SET NULL | 親コミュニティID          |
| name               | TEXT    | NOT NULL                | コミュニティ名（LLM生成） |
| summary            | TEXT    | NOT NULL                | コミュニティ要約（LLM生成）|
| member_count       | INTEGER | NOT NULL DEFAULT 0      | メンバー数                |
| embedding          | BLOB    | NULL                    | ベクトル埋め込み          |
| embedding_model_id | TEXT    | NULL                    | 埋め込みモデルID          |
| created_at         | INTEGER | DEFAULT unixepoch()     | 作成日時                  |
| updated_at         | INTEGER | DEFAULT unixepoch()     | 更新日時                  |

**インデックス**:
- `communities_level_idx`: 階層レベル別検索用
- `communities_parent_id_idx`: 親コミュニティ検索用

### entity_communitiesテーブル（多対多）

エンティティとコミュニティの多対多関係を格納する中間テーブル。

| カラム       | 型   | 制約                       | 説明             |
| ------------ | ---- | -------------------------- | ---------------- |
| entity_id    | TEXT | PK, FK→entities CASCADE    | エンティティID   |
| community_id | TEXT | PK, FK→communities CASCADE | コミュニティID   |

**インデックス**:
- `entity_communities_entity_id_idx`: エンティティ別検索用
- `entity_communities_community_id_idx`: コミュニティ別検索用

### chunk_entitiesテーブル（出現情報）

チャンク内のエンティティ出現情報を格納する中間テーブル。

| カラム        | 型      | 制約                    | 説明                         |
| ------------- | ------- | ----------------------- | ---------------------------- |
| chunk_id      | TEXT    | PK, FK→chunks CASCADE   | チャンクID                   |
| entity_id     | TEXT    | PK, FK→entities CASCADE | エンティティID               |
| mention_count | INTEGER | NOT NULL DEFAULT 1      | チャンク内出現回数           |
| positions     | TEXT    | NOT NULL DEFAULT '[]'   | 出現位置（JSON配列）         |

**positions JSON形式**:

| フィールド  | 型     | 説明                             |
| ----------- | ------ | -------------------------------- |
| startChar   | number | 開始文字位置                     |
| endChar     | number | 終了文字位置                     |
| surfaceForm | string | 表層形（実際のテキスト表記）     |

**インデックス**:
- `chunk_entities_chunk_id_idx`: チャンク別検索用
- `chunk_entities_entity_id_idx`: エンティティ別検索用

### Drizzleリレーション定義

`graph-relations.ts`で6つのリレーションを定義:

| リレーション                 | 定義内容                                  |
| ---------------------------- | ----------------------------------------- |
| entitiesRelations            | エンティティ→関係・コミュニティ・チャンク |
| graphRelationsTableRelations | 関係→始点/終点エンティティ・証拠         |
| relationEvidenceRelations    | 証拠→関係・チャンク                       |
| communitiesRelations         | コミュニティ→親子・メンバー               |
| entityCommunitiesRelations   | 中間テーブル→エンティティ・コミュニティ   |
| chunkEntitiesRelations       | 中間テーブル→チャンク・エンティティ       |

### テストカバレッジ（スキーマ）

| テストファイル                | テスト数 | 検証内容                       |
| ----------------------------- | -------- | ------------------------------ |
| entities.test.ts              | 33       | テーブル・カラム・インデックス |
| graph-relations-table.test.ts | 39       | 外部キー・CASCADE動作          |
| relation-evidence.test.ts     | 19       | 複合主キー・証拠チェーン       |
| communities.test.ts           | 24       | 階層構造・自己参照             |
| junction-tables.test.ts       | 31       | 中間テーブル・複合主キー       |
| graph-relations.test.ts       | 23       | Drizzleリレーション定義        |
| index.test.ts                 | 29       | エクスポート・型安全性         |
| **合計**                      | **198**  |                                |

### テストカバレッジ（Knowledge Graph Store）

| テストファイル                | テスト数 | 検証内容                       |
| ----------------------------- | -------- | ------------------------------ |
| knowledge-graph-store.test.ts | 178      | ストア全機能（CRUD・クエリ等） |

**カバレッジ**: Line 87.96%, Branch 77.77%, Function 100%

**詳細仕様**: [interfaces-rag-knowledge-graph-store.md](./interfaces-rag-knowledge-graph-store.md)

---

## パフォーマンス最適化

### クエリ最適化のポイント

1. **N+1問題を回避する**
   - リレーションデータは`with`オプションで一括取得
   - ループ内でのクエリ発行を避ける

2. **必要なカラムのみ取得する**
   - `select()`で必要なカラムを明示的に指定
   - `*`による全カラム取得を避ける

3. **インデックスを活用する**
   - WHERE句で使用するカラムにはインデックスを追加
   - 複合検索には複合インデックスを検討

4. **EXPLAIN ANALYZEで実行計画を確認する**
   - 遅いクエリは実行計画を確認して改善

### バッチ処理の最適化

- 大量INSERT: 1000件程度のチャンクに分割
- 大量UPDATE: 主キーでの範囲指定を活用
- 大量DELETE: LIMITで段階的に削除

### 接続管理

- 接続はシングルトンで管理
- 不要な接続の作成を避ける
- 長時間のアイドル接続は定期的にリフレッシュ

---

