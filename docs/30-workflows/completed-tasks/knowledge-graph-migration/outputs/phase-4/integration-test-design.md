# 統合テスト設計書 - Knowledge Graph マイグレーション

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | CONV-04-06                                 |
| 作成日   | 2026-01-13                                 |
| Phase    | 4                                          |
| 機能名   | Knowledge Graph マイグレーション生成・適用 |

---

## 1. 統合テスト概要

### 1.1 テスト目的

マイグレーション適用後のデータベース状態を検証し、以下を確認する:

1. テーブルが正しく作成されている
2. 外部キー制約が正しく機能する
3. CASCADE DELETE/SET NULL動作が期待通り
4. インデックスが作成されている
5. UNIQUE制約が機能する

### 1.2 テストスコープ

| スコープ     | 内容                                        | 対象テーブル                                                                            |
| ------------ | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| IN スコープ  | Knowledge Graph 6テーブルのマイグレーション | entities, relations, relation_evidence, communities, entity_communities, chunk_entities |
| OUT スコープ | 既存テーブル（chunks等）の検証              | chunks, files等                                                                         |

---

## 2. 統合テストシナリオ

### 2.1 シナリオ1: テーブル作成検証

```
前提条件: マイグレーション適用済みのデータベース

シナリオ:
1. entities テーブルの存在を確認
2. relations テーブルの存在を確認
3. relation_evidence テーブルの存在を確認
4. communities テーブルの存在を確認
5. entity_communities テーブルの存在を確認
6. chunk_entities テーブルの存在を確認

期待結果: 全6テーブルが存在する
```

### 2.2 シナリオ2: 基本CRUD操作検証

```
前提条件: 空のデータベース

シナリオ:
1. entity を INSERT
2. INSERT 後に SELECT で確認
3. UPDATE で変更
4. UPDATE 後に SELECT で確認
5. DELETE で削除
6. DELETE 後に SELECT で確認（存在しない）

期待結果: 全操作が正常に完了
```

### 2.3 シナリオ3: CASCADE DELETE検証

```
前提条件: 以下のデータが存在
- entity1 (id: 'e1')
- entity2 (id: 'e2')
- relation (source_id: 'e1', target_id: 'e2')

シナリオ:
1. entity1 を DELETE
2. relations テーブルを SELECT

期待結果: entity1を参照するrelationも削除されている
```

### 2.4 シナリオ4: SET NULL検証

```
前提条件: 以下のデータが存在
- parentCommunity (id: 'c1')
- childCommunity (id: 'c2', parent_id: 'c1')

シナリオ:
1. parentCommunity を DELETE
2. childCommunity を SELECT

期待結果: childCommunity.parent_id が NULL
```

### 2.5 シナリオ5: UNIQUE制約検証

```
前提条件: 以下のデータが存在
- entity (normalized_name: 'test', type: 'person')

シナリオ:
1. 同じ normalized_name, type で新規 entity を INSERT

期待結果: UNIQUE constraint violation エラー
```

---

## 3. テストデータ設計

### 3.1 entities テストデータ

```typescript
const testEntity = {
  id: "test-entity-1",
  name: "Test Entity",
  normalizedName: "test_entity",
  type: "person" as const,
  description: "Test description",
  aliases: JSON.stringify(["alias1", "alias2"]),
  importance: 0.8,
  mentionCount: 5,
};
```

### 3.2 relations テストデータ

```typescript
const testRelation = {
  id: "test-relation-1",
  sourceId: "test-entity-1",
  targetId: "test-entity-2",
  type: "related_to" as const,
  description: "Test relation",
  weight: 0.7,
  bidirectional: false,
  evidenceCount: 3,
};
```

### 3.3 communities テストデータ

```typescript
const testCommunity = {
  id: "test-community-1",
  level: 0,
  parentId: null,
  name: "Test Community",
  summary: "Test summary",
  memberCount: 10,
};
```

---

## 4. テストファイル構成

### 4.1 ファイル配置

```
packages/shared/src/db/schema/graph/__tests__/
├── entities.test.ts              # 既存: スキーマ定義テスト
├── graph-relations.test.ts       # 既存: スキーマ定義テスト
├── communities.test.ts           # 既存: スキーマ定義テスト
├── relation-evidence.test.ts     # 既存: スキーマ定義テスト
├── junction-tables.test.ts       # 既存: スキーマ定義テスト
├── index.test.ts                 # 既存: エクスポートテスト
└── migration.integration.test.ts # 新規: マイグレーション統合テスト
```

### 4.2 新規テストファイル

**ファイル**: `migration.integration.test.ts`

```typescript
// テスト構成
describe("Knowledge Graph Migration Integration Tests", () => {
  describe("Table Existence", () => {
    // TC-1.1〜TC-1.6
  });

  describe("Foreign Key Constraints", () => {
    // TC-3.1〜TC-3.3
  });

  describe("CASCADE DELETE Behavior", () => {
    // TC-4.1〜TC-4.3
  });

  describe("SET NULL Behavior", () => {
    // TC-5.1
  });

  describe("UNIQUE Constraints", () => {
    // TC-6.1〜TC-6.2
  });

  describe("Index Existence", () => {
    // TC-2.1〜TC-2.2
  });
});
```

---

## 5. テスト環境設定

### 5.1 インメモリDBセットアップ

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// インメモリDBを使用
const sqlite = new Database(":memory:");
const db = drizzle(sqlite);

// 外部キー有効化
sqlite.pragma("foreign_keys = ON");
```

### 5.2 テーブル作成

```typescript
// マイグレーションSQLを実行してテーブル作成
// または push/migrate で適用されたDBに接続
```

---

## 6. TDD Red状態の確認

### 6.1 期待される失敗

Phase 4（Red）では以下のテストが失敗する:

| テストカテゴリ | 失敗理由                             |
| -------------- | ------------------------------------ |
| テーブル存在   | マイグレーション未適用でテーブルなし |
| 外部キー       | テーブルがないためFK確認不可         |
| CASCADE        | テーブルがないためCASCADE検証不可    |
| SET NULL       | テーブルがないためSET NULL検証不可   |
| UNIQUE         | テーブルがないためUNIQUE制約検証不可 |

### 6.2 Red確認コマンド

```bash
# テスト実行（失敗を確認）
pnpm --filter @repo/shared test src/db/schema/graph/__tests__/migration.integration.test.ts

# 期待: 全テストが失敗（Red状態）
```

---

## 7. Phase 5（Green）での期待

Phase 5でマイグレーション適用後、全テストがパス（Green）になる:

```bash
# マイグレーション適用
pnpm --filter @repo/shared drizzle-kit push

# テスト実行（成功を確認）
pnpm --filter @repo/shared test

# 期待: 全テストがパス（Green状態）
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
