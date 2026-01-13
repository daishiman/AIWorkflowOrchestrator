# テスト仕様書 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 4                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. テスト戦略

### 1.1 テストレイヤー

| レイヤー         | 対象                   | テストツール | カバレッジ目標 |
| ---------------- | ---------------------- | ------------ | -------------- |
| スキーマ定義     | Drizzle ORMスキーマ    | Vitest       | 80%+           |
| マイグレーション | DBテーブル構造         | Vitest       | 100%           |
| 外部キー制約     | CASCADE/SET NULL動作   | Vitest       | 100%           |
| インデックス     | インデックス存在・動作 | Vitest       | 100%           |

### 1.2 テストカテゴリ

| カテゴリ           | 説明                               | ファイル名パターン    |
| ------------------ | ---------------------------------- | --------------------- |
| スキーマ定義テスト | テーブル・カラム定義の検証         | `*.test.ts`           |
| マイグレーション   | テーブル存在・カラム構造の検証     | `*.migration.test.ts` |
| 外部キーテスト     | FK制約・CASCADE動作の検証          | `*.fk.test.ts`        |
| インデックステスト | インデックス存在・UNIQUE制約の検証 | `*.index.test.ts`     |

---

## 2. 既存テストカバレッジ分析

### 2.1 既存テストファイル

| テストファイル                  | カバー範囲                   | 状態    |
| ------------------------------- | ---------------------------- | ------- |
| `entities.test.ts`              | カラム・インデックス・型     | ✅ 既存 |
| `graph-relations.test.ts`       | カラム・インデックス・FK定義 | ✅ 既存 |
| `graph-relations-table.test.ts` | テーブル構造詳細             | ✅ 既存 |
| `communities.test.ts`           | カラム・自己参照FK           | ✅ 既存 |
| `relation-evidence.test.ts`     | 複合PK・FK定義               | ✅ 既存 |
| `junction-tables.test.ts`       | 中間テーブル構造             | ✅ 既存 |
| `index.test.ts`                 | エクスポート検証             | ✅ 既存 |

### 2.2 追加が必要なテスト

| テストカテゴリ       | 内容                                 | 優先度 |
| -------------------- | ------------------------------------ | ------ |
| マイグレーション統合 | 実際のDB操作後のテーブル存在確認     | 高     |
| CASCADE DELETE検証   | 親レコード削除時の子レコード連動削除 | 高     |
| SET NULL検証         | communities.parent_idのSET NULL動作  | 中     |
| UNIQUE制約検証       | 重複データ挿入時のエラー発生         | 中     |

---

## 3. テスト対象テーブル詳細

### 3.1 entities

| テスト観点         | 期待動作                                      | テストメソッド                |
| ------------------ | --------------------------------------------- | ----------------------------- |
| テーブル存在       | entitiesテーブルが存在する                    | `PRAGMA table_info(entities)` |
| カラム数           | 13カラムが定義されている                      | カラム数カウント              |
| 主キー             | id列がPRIMARY KEY                             | PK検証                        |
| NOT NULL制約       | name, normalized_name, typeがNOT NULL         | NULL挿入テスト                |
| DEFAULT値          | aliases='[]', importance=0.5, mention_count=1 | DEFAULT挿入テスト             |
| UNIQUEインデックス | normalized_name + typeの組み合わせがUNIQUE    | 重複挿入テスト                |

### 3.2 graphRelations

| テスト観点         | 期待動作                                | テストメソッド                 |
| ------------------ | --------------------------------------- | ------------------------------ |
| テーブル存在       | relationsテーブルが存在する             | `PRAGMA table_info(relations)` |
| 外部キー           | source_id, target_idがentities.idを参照 | FK検証                         |
| CASCADE DELETE     | entities削除時に関連relations削除       | DELETE連動テスト               |
| UNIQUEインデックス | source_id + target_id + typeがUNIQUE    | 重複挿入テスト                 |

### 3.3 relation_evidence

| テスト観点     | 期待動作                            | テストメソッド    |
| -------------- | ----------------------------------- | ----------------- |
| テーブル存在   | relation_evidenceテーブルが存在する | PRAGMA table_info |
| 複合主キー     | relation_id + chunk_idが複合PK      | PK検証            |
| 外部キー       | relations.id, chunks.idを参照       | FK検証            |
| CASCADE DELETE | 親レコード削除時に連動削除          | DELETE連動テスト  |

### 3.4 communities

| テスト観点   | 期待動作                        | テストメソッド         |
| ------------ | ------------------------------- | ---------------------- |
| テーブル存在 | communitiesテーブルが存在する   | PRAGMA table_info      |
| 自己参照FK   | parent_idがcommunities.idを参照 | FK検証                 |
| SET NULL動作 | 親削除時にparent_idがNULLになる | DELETE SET NULL テスト |

### 3.5 entity_communities

| テスト観点     | 期待動作                             | テストメソッド    |
| -------------- | ------------------------------------ | ----------------- |
| テーブル存在   | entity_communitiesテーブルが存在する | PRAGMA table_info |
| 複合主キー     | entity_id + community_idが複合PK     | PK検証            |
| CASCADE DELETE | 両親テーブル削除時に連動削除         | DELETE連動テスト  |

### 3.6 chunk_entities

| テスト観点     | 期待動作                         | テストメソッド    |
| -------------- | -------------------------------- | ----------------- |
| テーブル存在   | chunk_entitiesテーブルが存在する | PRAGMA table_info |
| 複合主キー     | chunk_id + entity_idが複合PK     | PK検証            |
| CASCADE DELETE | 両親テーブル削除時に連動削除     | DELETE連動テスト  |

---

## 4. テスト実行環境

### 4.1 テストフレームワーク

| 項目           | 設定                   |
| -------------- | ---------------------- |
| テストランナー | Vitest                 |
| モック         | vi.mock (必要に応じて) |
| DBテスト       | インメモリSQLite       |
| タイムアウト   | 10000ms                |

### 4.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# グラフスキーマテストのみ
pnpm --filter @repo/shared test src/db/schema/graph

# カバレッジ付き実行
pnpm --filter @repo/shared test:coverage

# ウォッチモード
pnpm --filter @repo/shared test --watch
```

---

## 5. TDD（Red-Green-Refactor）計画

### 5.1 Phase 4（Red）

| ステップ | 内容                                       | 状態    |
| -------- | ------------------------------------------ | ------- |
| 1        | マイグレーション統合テストのスケルトン作成 | Phase 4 |
| 2        | テスト実行 → 失敗確認（テーブル未作成）    | Phase 4 |
| 3        | 既存スキーマテストの動作確認               | Phase 4 |

### 5.2 Phase 5（Green）

| ステップ | 内容                       | 状態    |
| -------- | -------------------------- | ------- |
| 1        | マイグレーション生成・適用 | Phase 5 |
| 2        | テスト実行 → 成功確認      | Phase 5 |

### 5.3 Phase 6-8（Refactor）

| ステップ | 内容                           | 状態      |
| -------- | ------------------------------ | --------- |
| 1        | テストコードのリファクタリング | Phase 6-8 |
| 2        | カバレッジ向上                 | Phase 6-8 |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
