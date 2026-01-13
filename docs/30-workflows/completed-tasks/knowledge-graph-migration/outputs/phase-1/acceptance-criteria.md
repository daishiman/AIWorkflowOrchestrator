# 受け入れ基準 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 1                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. テーブル作成の受け入れ基準

### AC-1.1: entitiesテーブル

**Given**: drizzle-kit generateが実行された
**When**: マイグレーションが適用される
**Then**:

- entitiesテーブルが存在する
- 以下のカラムが定義されている:
  - id (TEXT, PRIMARY KEY)
  - name (TEXT, NOT NULL)
  - normalized_name (TEXT, NOT NULL)
  - type (TEXT, NOT NULL)
  - description (TEXT, NULL)
  - aliases (TEXT, NOT NULL DEFAULT '[]')
  - embedding (BLOB, NULL)
  - embedding_model_id (TEXT, NULL)
  - importance (REAL, NOT NULL DEFAULT 0.5)
  - mention_count (INTEGER, NOT NULL DEFAULT 1)
  - metadata (TEXT, NULL)
  - created_at (INTEGER, DEFAULT unixepoch())
  - updated_at (INTEGER, DEFAULT unixepoch())

**検証コマンド**:

```sql
PRAGMA table_info(entities);
```

---

### AC-1.2: relationsテーブル

**Given**: drizzle-kit generateが実行された
**When**: マイグレーションが適用される
**Then**:

- relationsテーブルが存在する
- 以下のカラムが定義されている:
  - id (TEXT, PRIMARY KEY)
  - source_id (TEXT, FK→entities CASCADE)
  - target_id (TEXT, FK→entities CASCADE)
  - type (TEXT, NOT NULL)
  - description (TEXT, NULL)
  - weight (REAL, NOT NULL DEFAULT 0.5)
  - bidirectional (INTEGER, NOT NULL DEFAULT 0)
  - evidence_count (INTEGER, NOT NULL DEFAULT 1)
  - metadata (TEXT, NULL)
  - created_at (INTEGER)
  - updated_at (INTEGER)

**検証コマンド**:

```sql
PRAGMA table_info(relations);
PRAGMA foreign_key_list(relations);
```

---

### AC-1.3: relation_evidenceテーブル

**Given**: drizzle-kit generateが実行された
**When**: マイグレーションが適用される
**Then**:

- relation_evidenceテーブルが存在する
- 複合主キー(relation_id, chunk_id)が設定されている
- 以下のカラムが定義されている:
  - relation_id (TEXT, PK, FK→relations CASCADE)
  - chunk_id (TEXT, PK, FK→chunks CASCADE)
  - excerpt (TEXT, NOT NULL)
  - confidence (REAL, NOT NULL DEFAULT 0.5)
  - created_at (INTEGER)
  - updated_at (INTEGER)

**検証コマンド**:

```sql
PRAGMA table_info(relation_evidence);
PRAGMA foreign_key_list(relation_evidence);
```

---

### AC-1.4: communitiesテーブル

**Given**: drizzle-kit generateが実行された
**When**: マイグレーションが適用される
**Then**:

- communitiesテーブルが存在する
- 以下のカラムが定義されている:
  - id (TEXT, PRIMARY KEY)
  - level (INTEGER, NOT NULL DEFAULT 0)
  - parent_id (TEXT, FK→communities SET NULL)
  - name (TEXT, NOT NULL)
  - summary (TEXT, NOT NULL)
  - member_count (INTEGER, NOT NULL DEFAULT 0)
  - embedding (BLOB, NULL)
  - embedding_model_id (TEXT, NULL)
  - created_at (INTEGER)
  - updated_at (INTEGER)

**検証コマンド**:

```sql
PRAGMA table_info(communities);
PRAGMA foreign_key_list(communities);
```

---

### AC-1.5: entity_communitiesテーブル

**Given**: drizzle-kit generateが実行された
**When**: マイグレーションが適用される
**Then**:

- entity_communitiesテーブルが存在する
- 複合主キー(entity_id, community_id)が設定されている
- 外部キーCASCADE DELETEが設定されている

**検証コマンド**:

```sql
PRAGMA table_info(entity_communities);
PRAGMA foreign_key_list(entity_communities);
```

---

### AC-1.6: chunk_entitiesテーブル

**Given**: drizzle-kit generateが実行された
**When**: マイグレーションが適用される
**Then**:

- chunk_entitiesテーブルが存在する
- 複合主キー(chunk_id, entity_id)が設定されている
- 以下のカラムが定義されている:
  - chunk_id (TEXT, PK, FK→chunks CASCADE)
  - entity_id (TEXT, PK, FK→entities CASCADE)
  - mention_count (INTEGER, NOT NULL DEFAULT 1)
  - positions (TEXT, NOT NULL DEFAULT '[]')

**検証コマンド**:

```sql
PRAGMA table_info(chunk_entities);
PRAGMA foreign_key_list(chunk_entities);
```

---

## 2. インデックス作成の受け入れ基準

### AC-2.1: entitiesインデックス

**Given**: マイグレーションが適用された
**When**: インデックス一覧を取得する
**Then**: 以下のインデックスが存在する:

- entities_normalized_name_idx
- entities_type_idx
- entities_importance_idx
- entities_name_type_idx (UNIQUE)

**検証コマンド**:

```sql
PRAGMA index_list(entities);
```

---

### AC-2.2: relationsインデックス

**Given**: マイグレーションが適用された
**When**: インデックス一覧を取得する
**Then**: 以下のインデックスが存在する:

- relations_source_id_idx
- relations_target_id_idx
- relations_type_idx
- relations_weight_idx
- relations_source_target_type_idx (UNIQUE)

**検証コマンド**:

```sql
PRAGMA index_list(relations);
```

---

### AC-2.3: 中間テーブルインデックス

**Given**: マイグレーションが適用された
**When**: インデックス一覧を取得する
**Then**: 以下のインデックスが存在する:

- relation_evidence_relation_id_idx
- relation_evidence_chunk_id_idx
- communities_level_idx
- communities_parent_id_idx
- entity_communities_entity_id_idx
- entity_communities_community_id_idx
- chunk_entities_chunk_id_idx
- chunk_entities_entity_id_idx

**検証コマンド**:

```sql
PRAGMA index_list(relation_evidence);
PRAGMA index_list(communities);
PRAGMA index_list(entity_communities);
PRAGMA index_list(chunk_entities);
```

---

## 3. 外部キー制約の受け入れ基準

### AC-3.1: CASCADE DELETE動作

**Given**: 親レコードが存在する
**When**: 親レコードを削除する
**Then**: 関連する子レコードも自動削除される

| 親テーブル  | 子テーブル         | 期待動作       |
| ----------- | ------------------ | -------------- |
| entities    | relations          | CASCADE DELETE |
| entities    | entity_communities | CASCADE DELETE |
| entities    | chunk_entities     | CASCADE DELETE |
| relations   | relation_evidence  | CASCADE DELETE |
| communities | entity_communities | CASCADE DELETE |
| chunks      | relation_evidence  | CASCADE DELETE |
| chunks      | chunk_entities     | CASCADE DELETE |

---

### AC-3.2: SET NULL動作

**Given**: 親コミュニティが存在する
**When**: 親コミュニティを削除する
**Then**: 子コミュニティのparent_idがNULLになる

| 親テーブル  | 子テーブル  | カラム    | 期待動作 |
| ----------- | ----------- | --------- | -------- |
| communities | communities | parent_id | SET NULL |

---

## 4. マイグレーション管理の受け入れ基準

### AC-4.1: マイグレーションファイル生成

**Given**: drizzle.config.tsにgraph/が含まれている
**When**: `pnpm --filter @repo/shared drizzle-kit generate`を実行
**Then**:

- `packages/shared/src/db/migrations/`配下にSQLファイルが生成される
- 6テーブル分のCREATE TABLE文が含まれる

---

### AC-4.2: マイグレーション適用

**Given**: マイグレーションファイルが生成されている
**When**: `pnpm --filter @repo/shared drizzle-kit push`を実行
**Then**:

- エラーなく完了する
- 6テーブルがデータベースに存在する

**検証コマンド**:

```bash
pnpm --filter @repo/shared drizzle-kit push
```

---

## 5. 品質基準の受け入れ基準

### AC-5.1: TypeScript型チェック

**Given**: マイグレーションが完了している
**When**: `pnpm typecheck`を実行
**Then**: エラーなく完了する

---

### AC-5.2: Lintチェック

**Given**: マイグレーションが完了している
**When**: `pnpm lint`を実行
**Then**: エラーなく完了する

---

### AC-5.3: テスト実行

**Given**: マイグレーションが完了している
**When**: `pnpm --filter @repo/shared test`を実行
**Then**: 全テストがパスする

---

## 受け入れ基準サマリ

| カテゴリ         | 基準数 | 優先度 |
| ---------------- | ------ | ------ |
| テーブル作成     | 6      | 必須   |
| インデックス作成 | 3      | 必須   |
| 外部キー制約     | 2      | 必須   |
| マイグレーション | 2      | 必須   |
| 品質基準         | 3      | 必須   |
| **合計**         | **16** |        |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
