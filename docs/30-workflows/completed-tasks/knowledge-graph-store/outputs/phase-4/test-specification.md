# テスト仕様書 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容       |
| -------------- | ---------- |
| タスクID       | CONV-08-01 |
| Phase          | 4          |
| 文書バージョン | 1.0.0      |
| 作成日         | 2026-01-09 |

---

## 1. テスト設計方針

### 1.1 TDD原則の適用

本テストは以下のTDD原則に従って設計する：

| 原則             | 適用方法                           |
| ---------------- | ---------------------------------- |
| テストファースト | 実装前にテストを作成（Red状態）    |
| 1テスト1振る舞い | 各テストは単一の振る舞いのみを検証 |
| 最小実装         | Phase 5でテストを通す最小限の実装  |
| Refactor         | Phase 8で設計改善                  |

### 1.2 テスト対象範囲

| カテゴリ           | テスト対象                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------- |
| エンティティ操作   | upsertEntity, getEntity, getEntityByName, findEntities, findSimilarEntities, deleteEntity |
| 関係操作           | addRelation, getRelation, getRelations, findRelations, deleteRelation                     |
| グラフトラバーサル | traverse, findShortestPath, getNeighbors                                                  |
| 統計               | getStats                                                                                  |
| バッチ操作         | bulkUpsertEntities, bulkAddRelations                                                      |

---

## 2. テスト構造設計

### 2.1 ファイル構成

```
packages/shared/src/services/graph/
├── __tests__/
│   ├── knowledge-graph-store.test.ts       # メインユニットテスト
│   ├── knowledge-graph-store.integration.test.ts  # 統合テスト（Phase 6）
│   ├── helpers/
│   │   ├── test-fixtures.ts                # テストフィクスチャ
│   │   └── mock-db.ts                      # DBモック
│   └── types/
│       └── test-types.ts                   # テスト用型定義
├── knowledge-graph-store.ts                # 実装（Phase 5）
├── types.ts                                # 型定義（Phase 5）
└── errors.ts                               # エラークラス（Phase 5）
```

### 2.2 テストグループ構造

```typescript
describe("SQLiteKnowledgeGraphStore", () => {
  describe("Entity Operations", () => {
    describe("upsertEntity", () => {
      /* ... */
    });
    describe("getEntity", () => {
      /* ... */
    });
    describe("getEntityByName", () => {
      /* ... */
    });
    describe("findEntities", () => {
      /* ... */
    });
    describe("findSimilarEntities", () => {
      /* ... */
    });
    describe("deleteEntity", () => {
      /* ... */
    });
  });

  describe("Relation Operations", () => {
    describe("addRelation", () => {
      /* ... */
    });
    describe("getRelation", () => {
      /* ... */
    });
    describe("getRelations", () => {
      /* ... */
    });
    describe("findRelations", () => {
      /* ... */
    });
    describe("deleteRelation", () => {
      /* ... */
    });
  });

  describe("Graph Traversal", () => {
    describe("traverse", () => {
      /* ... */
    });
    describe("findShortestPath", () => {
      /* ... */
    });
    describe("getNeighbors", () => {
      /* ... */
    });
  });

  describe("Statistics", () => {
    describe("getStats", () => {
      /* ... */
    });
  });

  describe("Batch Operations", () => {
    describe("bulkUpsertEntities", () => {
      /* ... */
    });
    describe("bulkAddRelations", () => {
      /* ... */
    });
  });

  describe("Error Handling", () => {
    /* ... */
  });
});
```

---

## 3. モック戦略

### 3.1 モック対象

| 対象              | モック方法       | 理由                   |
| ----------------- | ---------------- | ---------------------- |
| DrizzleDatabase   | vi.mock          | DB操作の分離           |
| DiskANN検索       | vi.fn            | ベクトル検索のモック化 |
| crypto.randomUUID | vi.fn            | ID生成の予測可能性     |
| Date              | vi.useFakeTimers | 日時の制御             |

### 3.2 モックファクトリ

```typescript
// Mock Entity Factory
function createMockEntity(overrides?: Partial<StoredEntity>): StoredEntity {
  return {
    id: "entity-1" as EntityId,
    name: "Test Entity",
    normalizedName: "test entity",
    type: "concept" as EntityType,
    // ... defaults
    ...overrides,
  };
}

// Mock Relation Factory
function createMockRelation(
  overrides?: Partial<StoredRelation>,
): StoredRelation {
  return {
    id: "relation-1" as RelationId,
    sourceEntityId: "entity-1" as EntityId,
    targetEntityId: "entity-2" as EntityId,
    relationType: "references" as RelationType,
    // ... defaults
    ...overrides,
  };
}
```

---

## 4. テストケース導出（受け入れ基準対応）

### 4.1 エンティティ操作テストケース

| AC-ID  | テストケース                               | 優先度 |
| ------ | ------------------------------------------ | ------ |
| AC-001 | 新規エンティティ作成時にStoredEntityが返却 | 高     |
| AC-001 | 正規化名が正しく生成される                 | 高     |
| AC-001 | mentionCountが1で初期化される              | 高     |
| AC-002 | 既存エンティティとマージされる             | 高     |
| AC-002 | mentionCountがインクリメントされる         | 高     |
| AC-002 | aliasesがマージされる                      | 中     |
| AC-003 | IDで既存エンティティを取得できる           | 高     |
| AC-003 | 存在しないIDでnullが返却される             | 高     |
| AC-004 | 正規化名で既存エンティティを取得できる     | 高     |
| AC-004 | 存在しない名前でnullが返却される           | 高     |
| AC-005 | タイプでエンティティを検索できる           | 中     |
| AC-005 | 名前パターンで検索できる                   | 中     |
| AC-005 | mentionCountでフィルタできる               | 中     |
| AC-005 | ページネーションが適用される               | 中     |
| AC-006 | 類似エンティティが類似度降順で返却される   | 高     |
| AC-006 | 閾値以下のエンティティは除外される         | 高     |
| AC-007 | エンティティ削除後に取得できなくなる       | 高     |
| AC-007 | 関連する関係もCASCADE削除される            | 高     |

### 4.2 関係操作テストケース

| AC-ID  | テストケース                 | 優先度 |
| ------ | ---------------------------- | ------ |
| AC-008 | 新規関係が作成される         | 高     |
| AC-008 | weightが1で初期化される      | 高     |
| AC-009 | 同一関係がマージされる       | 高     |
| AC-009 | weightが累積される           | 高     |
| AC-009 | evidenceが追加される         | 高     |
| AC-010 | Self-loopが拒否される        | 高     |
| AC-010 | evidence空の関係が拒否される | 高     |
| AC-011 | 全方向の関係が取得される     | 中     |
| AC-011 | 出力方向のみ取得できる       | 中     |
| AC-011 | タイプでフィルタできる       | 中     |
| AC-012 | ヒントで関係を検索できる     | 中     |

### 4.3 グラフトラバーサルテストケース

| AC-ID  | テストケース                               | 優先度 |
| ------ | ------------------------------------------ | ------ |
| AC-013 | 指定深度までトラバースできる               | 高     |
| AC-013 | 関係タイプでフィルタできる                 | 中     |
| AC-013 | 最大ノード数で打ち切られる                 | 中     |
| AC-014 | 最短パスが見つかる                         | 高     |
| AC-014 | パスがない場合nullが返却される             | 高     |
| AC-014 | 深さ制限で見つからない場合nullが返却される | 中     |
| AC-015 | 直接の隣接ノードが取得される               | 中     |
| AC-015 | 指定深度までの隣接ノードが取得される       | 中     |

### 4.4 統計・バッチテストケース

| AC-ID  | テストケース                           | 優先度 |
| ------ | -------------------------------------- | ------ |
| AC-016 | グラフ統計が正しく計算される           | 中     |
| AC-016 | タイプ別分布が正しい                   | 中     |
| AC-017 | バッチでエンティティが一括挿入される   | 高     |
| AC-017 | バッチ内でマージが発生する             | 中     |
| AC-018 | バッチで関係が一括追加される           | 高     |
| AC-018 | バッチ操作がアトミック（ロールバック） | 高     |

### 4.5 エラーハンドリングテストケース

| AC-ID  | テストケース                         | 優先度 |
| ------ | ------------------------------------ | ------ |
| AC-019 | 存在しないsourceへの関係追加でエラー | 高     |
| AC-020 | DB接続エラー時にエラーが返却される   | 高     |

---

## 5. 統合テストシナリオ

### 5.1 IT-001: データフローテスト

```
Given: 空のデータベース
When:
  1. 3件のエンティティをupsert
  2. エンティティ間に関係を追加
  3. トラバーサルを実行
Then:
  - すべてのエンティティが訪問される
  - パス情報が正しい
```

### 5.2 IT-002: API接続テスト

```
Given: データベース接続が確立されている
When: upsertEntity, getEntity, addRelation, getRelationsを順に実行
Then: すべての操作がResult.okで完了する
```

---

## 6. テスト実行計画

### 6.1 Phase 4（現Phase）- Red状態

- すべてのテストケースを実装
- すべてのテストが失敗することを確認
- モック構造のみ実装

### 6.2 Phase 5 - Green状態

- テストを通す最小限の実装
- 各テストが成功することを確認

### 6.3 Phase 6 - テスト拡充

- 統合テストの実装
- エッジケースの追加
- カバレッジ目標達成

---

## 7. テストカバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 60%+ |
| Function Coverage | 80%+ |

---

## 8. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |
