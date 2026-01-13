# Knowledge Graph Store テスト仕様書

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 4                          |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. テスト戦略

### 1.1 テストレベル

| レベル         | 対象                    | 目的                     |
| -------------- | ----------------------- | ------------------------ |
| ユニットテスト | 各Storeクラスのメソッド | 個別機能の正確性検証     |
| 統合テスト     | Store間連携、DB層連携   | コンポーネント間整合性   |
| 境界値テスト   | パラメータ限界値        | エッジケースの堅牢性検証 |
| エラーテスト   | 異常系シナリオ          | エラーハンドリング検証   |

### 1.2 テストフレームワーク

- **Vitest**: テストランナー・アサーション
- **SQLite (in-memory)**: テスト用データベース
- **Drizzle ORM**: DBアクセス層

### 1.3 テストデータ戦略

```typescript
// テストごとにクリーンなDBを使用
beforeEach(async () => {
  db = await createTestDatabase();
  store = createKnowledgeGraphStore(db);
});

afterEach(async () => {
  await cleanupTestDatabase(db);
});
```

---

## 2. テスト対象コンポーネント

### 2.1 EntityStore

| メソッド            | テスト観点                                    |
| ------------------- | --------------------------------------------- |
| upsertEntity        | 新規作成、更新、mentionCount加算、aliases統合 |
| getEntity           | 存在時取得、不在時null                        |
| getEntityByName     | 名前正規化検索、type絞り込み                  |
| findEntities        | フィルタ条件、ページング、ソート              |
| findSimilarEntities | 空配列返却（DiskANN統合前）                   |
| deleteEntity        | CASCADE削除、存在確認                         |
| bulkUpsertEntities  | トランザクション、一括処理                    |

### 2.2 RelationStore

| メソッド         | テスト観点                                       |
| ---------------- | ------------------------------------------------ |
| addRelation      | 証拠必須チェック、自己ループ禁止、Entity存在確認 |
| getRelation      | 関係取得、evidence結合                           |
| getRelations     | direction別取得（outgoing/incoming/both）        |
| findRelations    | フィルタ条件、ページング                         |
| deleteRelation   | CASCADE削除、冪等性                              |
| bulkAddRelations | トランザクション、バリデーション一括             |

### 2.3 CommunityStore（対象外）

コミュニティ操作は今回の実装スコープ外のため、テストは最小限とする。

### 2.4 GraphQueryService

| メソッド         | テスト観点                                          |
| ---------------- | --------------------------------------------------- |
| traverse         | BFS探索、maxDepth制限、maxNodes制限、循環グラフ対応 |
| findShortestPath | BFS最短パス、パス不在時null、同一ノードパス         |
| getNeighbors     | 1ホップ隣接ノード取得                               |
| getStats         | 統計集計（エンティティ数、関係数、タイプ別）        |

---

## 3. テスト環境セットアップ

### 3.1 テストデータベース初期化

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../db/schema";

async function createTestDatabase() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  // マイグレーション実行
  await runMigrations(db);

  return db;
}
```

### 3.2 テストユーティリティ

```typescript
// Branded Type作成ヘルパー
function createTestEntityId(id: string): EntityId {
  return id as EntityId;
}

function createTestRelationId(id: string): RelationId {
  return id as RelationId;
}

function createTestChunkId(id: string): ChunkId {
  return id as ChunkId;
}

// テストエンティティ作成ヘルパー
function createTestEntity(
  overrides?: Partial<ExtractedEntity>,
): ExtractedEntity {
  return {
    name: "Test Entity",
    type: "concept",
    description: "Test description",
    ...overrides,
  };
}

// テスト関係作成ヘルパー
function createTestRelation(
  overrides?: Partial<ExtractedRelation>,
): ExtractedRelation {
  return {
    sourceEntityName: "Source Entity",
    targetEntityName: "Target Entity",
    relationType: "RELATED_TO",
    evidence: [
      {
        chunkId: createTestChunkId("chunk-1"),
        excerpt: "Test excerpt",
        confidence: 0.9,
      },
    ],
    ...overrides,
  };
}
```

---

## 4. テストカバレッジ目標

| カテゴリ       | 目標カバレッジ | 備考                 |
| -------------- | -------------- | -------------------- |
| ステートメント | 80%以上        | 主要ロジックをカバー |
| ブランチ       | 75%以上        | 条件分岐をカバー     |
| 関数           | 90%以上        | 公開APIを完全カバー  |
| 行             | 80%以上        | 実装コード全体       |

### 4.1 カバレッジ除外対象

- `findSimilarEntities`: DiskANN統合前のため空配列返却のみ
- Community関連操作: スコープ外

---

## 5. テスト実行方法

### 5.1 全テスト実行

```bash
pnpm --filter @repo/shared test
```

### 5.2 特定テストファイル実行

```bash
pnpm --filter @repo/shared test -- knowledge-graph-store.test.ts
```

### 5.3 カバレッジ付き実行

```bash
pnpm --filter @repo/shared test -- --coverage
```

### 5.4 ウォッチモード

```bash
pnpm --filter @repo/shared test -- --watch
```

---

## 6. テストファイル構成

```
packages/shared/src/services/graph/__tests__/
├── knowledge-graph-store.test.ts    # メインテストファイル
├── entity-store.test.ts             # EntityStore単体テスト（オプション）
├── relation-store.test.ts           # RelationStore単体テスト（オプション）
└── graph-query-service.test.ts      # GraphQueryService単体テスト（オプション）
```

---

## 7. モック戦略

### 7.1 DBモック

テストではin-memory SQLiteを使用し、実際のDB操作をテストする。
モックは使用せず、実DBとの整合性を重視。

### 7.2 外部依存モック

現時点で外部依存はないため、モックは不要。

---

## 8. 参照ドキュメント

| ドキュメント         | パス                                      |
| -------------------- | ----------------------------------------- |
| インターフェース設計 | `outputs/phase-2/interface-design.md`     |
| ドメインモデル設計   | `outputs/phase-2/domain-model.md`         |
| エラー設計           | `outputs/phase-2/error-design.md`         |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md` |
