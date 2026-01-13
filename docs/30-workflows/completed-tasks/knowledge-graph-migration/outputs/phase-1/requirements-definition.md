# 要件定義書 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 1                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. 機能要件（FR: Functional Requirements）

### FR-1: テーブル作成

| ID     | 要件                                                | 優先度 |
| ------ | --------------------------------------------------- | ------ |
| FR-1.1 | entitiesテーブルが作成されること                    | 必須   |
| FR-1.2 | relations（graphRelations）テーブルが作成されること | 必須   |
| FR-1.3 | relation_evidenceテーブルが作成されること           | 必須   |
| FR-1.4 | communitiesテーブルが作成されること                 | 必須   |
| FR-1.5 | entity_communitiesテーブルが作成されること          | 必須   |
| FR-1.6 | chunk_entitiesテーブルが作成されること              | 必須   |

### FR-2: 外部キー制約

| ID     | 要件                                                                          | 優先度 |
| ------ | ----------------------------------------------------------------------------- | ------ |
| FR-2.1 | relations.source_idがentities.idを参照し、CASCADE DELETEが設定されること      | 必須   |
| FR-2.2 | relations.target_idがentities.idを参照し、CASCADE DELETEが設定されること      | 必須   |
| FR-2.3 | relation_evidence.relation_idがrelations.idを参照し、CASCADE DELETEが設定     | 必須   |
| FR-2.4 | relation_evidence.chunk_idがchunks.idを参照し、CASCADE DELETEが設定           | 必須   |
| FR-2.5 | communities.parent_idがcommunities.idを参照し、SET NULLが設定されること       | 必須   |
| FR-2.6 | entity_communities.entity_idがentities.idを参照し、CASCADE DELETEが設定       | 必須   |
| FR-2.7 | entity_communities.community_idがcommunities.idを参照し、CASCADE DELETEが設定 | 必須   |
| FR-2.8 | chunk_entities.chunk_idがchunks.idを参照し、CASCADE DELETEが設定              | 必須   |
| FR-2.9 | chunk_entities.entity_idがentities.idを参照し、CASCADE DELETEが設定           | 必須   |

### FR-3: インデックス作成

| ID      | 要件                                                       | 優先度 |
| ------- | ---------------------------------------------------------- | ------ |
| FR-3.1  | entities_normalized_name_idx が作成されること              | 必須   |
| FR-3.2  | entities_type_idx が作成されること                         | 必須   |
| FR-3.3  | entities_importance_idx が作成されること                   | 必須   |
| FR-3.4  | entities_name_type_idx（UNIQUE）が作成されること           | 必須   |
| FR-3.5  | relations_source_id_idx が作成されること                   | 必須   |
| FR-3.6  | relations_target_id_idx が作成されること                   | 必須   |
| FR-3.7  | relations_type_idx が作成されること                        | 必須   |
| FR-3.8  | relations_weight_idx が作成されること                      | 必須   |
| FR-3.9  | relations_source_target_type_idx（UNIQUE）が作成されること | 必須   |
| FR-3.10 | relation_evidence_relation_id_idx が作成されること         | 必須   |
| FR-3.11 | relation_evidence_chunk_id_idx が作成されること            | 必須   |
| FR-3.12 | communities_level_idx が作成されること                     | 必須   |
| FR-3.13 | communities_parent_id_idx が作成されること                 | 必須   |
| FR-3.14 | entity_communities_entity_id_idx が作成されること          | 必須   |
| FR-3.15 | entity_communities_community_id_idx が作成されること       | 必須   |
| FR-3.16 | chunk_entities_chunk_id_idx が作成されること               | 必須   |
| FR-3.17 | chunk_entities_entity_id_idx が作成されること              | 必須   |

### FR-4: マイグレーション管理

| ID     | 要件                                                  | 優先度 |
| ------ | ----------------------------------------------------- | ------ |
| FR-4.1 | Drizzle Kitでマイグレーションファイルが生成されること | 必須   |
| FR-4.2 | マイグレーションファイルがGit管理されること           | 必須   |
| FR-4.3 | マイグレーションがローカルDBに適用可能であること      | 必須   |

---

## 2. 非機能要件（NFR: Non-Functional Requirements）

### NFR-1: 互換性

| ID      | 要件                                                | 優先度 |
| ------- | --------------------------------------------------- | ------ |
| NFR-1.1 | SQLite/libSQL互換のSQL構文であること                | 必須   |
| NFR-1.2 | 既存テーブル（chunks, files等）との互換性があること | 必須   |
| NFR-1.3 | Drizzle ORM スキーマ定義と完全に一致すること        | 必須   |

### NFR-2: 品質

| ID      | 要件                                   | 優先度 |
| ------- | -------------------------------------- | ------ |
| NFR-2.1 | 型チェック（TypeScript）がパスすること | 必須   |
| NFR-2.2 | Lintエラーがないこと                   | 必須   |
| NFR-2.3 | テストが成功すること                   | 必須   |

### NFR-3: 運用

| ID      | 要件                                           | 優先度 |
| ------- | ---------------------------------------------- | ------ |
| NFR-3.1 | マイグレーション適用手順が文書化されていること | 必須   |
| NFR-3.2 | ロールバック可能な設計であること               | 推奨   |

---

## 3. 接続要件（統合テスト連携）

### DB接続要件

| カテゴリ             | 要件                                       |
| -------------------- | ------------------------------------------ |
| DB接続               | SQLite（libSQL）への接続確認               |
| マイグレーション適用 | drizzle-kit push/migrateによるスキーマ適用 |
| 外部キー制約         | PRAGMA foreign_keys = ON の有効化          |

### 接続確認手順

```bash
# 外部キー有効化確認
sqlite3 <db-path> "PRAGMA foreign_keys;"
# 期待結果: 1

# テーブル一覧確認
sqlite3 <db-path> ".tables"
# 期待結果: 6テーブルが表示される
```

---

## 4. テーブル定義サマリ

| テーブル名         | 用途                                  | 主キー                   |
| ------------------ | ------------------------------------- | ------------------------ |
| entities           | Knowledge Graphノード                 | id (TEXT)                |
| relations          | Knowledge Graphエッジ                 | id (TEXT)                |
| relation_evidence  | 関係の証拠チャンク                    | relation_id + chunk_id   |
| communities        | Leidenクラスター                      | id (TEXT)                |
| entity_communities | エンティティ-コミュニティ中間テーブル | entity_id + community_id |
| chunk_entities     | チャンク-エンティティ中間テーブル     | chunk_id + entity_id     |

---

## 5. 参照資料

| 資料                | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| DBスキーマ仕様      | `.claude/skills/aiworkflow-requirements/references/database-schema.md`                      |
| DB実装仕様          | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`              |
| RAG Knowledge Graph | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` |
| スキーマ実装        | `packages/shared/src/db/schema/graph/`                                                      |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
