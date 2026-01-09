# アーキテクチャ設計 - Knowledge Graph ストア

## 文書情報

| 項目           | 内容       |
| -------------- | ---------- |
| タスクID       | CONV-08-01 |
| Phase          | 2          |
| 文書バージョン | 1.0.0      |
| 作成日         | 2026-01-09 |

---

## 1. 全体アーキテクチャ

### 1.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                         利用者サービス                               │
│  (RAGパイプライン / コミュニティ検出 / 質問応答)                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  IKnowledgeGraphStore Interface                     │
│  ┌─────────────────┬──────────────────┬──────────────────────────┐ │
│  │ Entity操作      │ Relation操作     │ Graph操作                │ │
│  │ - upsert       │ - add            │ - traverse               │ │
│  │ - get          │ - get            │ - findShortestPath       │ │
│  │ - find         │ - find           │ - getNeighbors           │ │
│  │ - findSimilar  │ - delete         │ - getStats               │ │
│  │ - delete       │                  │                          │ │
│  │ - bulkUpsert   │ - bulkAdd        │                          │ │
│  └─────────────────┴──────────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  SQLiteKnowledgeGraphStore                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 内部ヘルパー                                                   │ │
│  │ - BFSトラバーサル                                              │ │
│  │ - ベクトル類似検索                                             │ │
│  │ - マージ処理                                                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Drizzle ORM Layer                              │
│  ┌─────────────────┬──────────────────┬──────────────────────────┐ │
│  │ entities        │ graphRelations   │ chunkEntities            │ │
│  │ テーブル         │ テーブル          │ テーブル                  │ │
│  └─────────────────┴──────────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SQLite / Turso (libSQL)                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ DiskANN Vector Index                                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 責務分担

| レイヤー                  | 責務                               |
| ------------------------- | ---------------------------------- |
| 利用者サービス            | ビジネスロジック、ワークフロー     |
| IKnowledgeGraphStore      | ストア操作のインターフェース定義   |
| SQLiteKnowledgeGraphStore | 具体的な永続化・検索ロジック       |
| Drizzle ORM Layer         | SQLクエリ生成・実行                |
| SQLite/Turso              | データ永続化・ベクトルインデックス |

---

## 2. コンポーネント設計

### 2.1 ファイル構成

```
packages/shared/src/services/graph/
├── types.ts                          # 型定義 (StoredEntity, StoredRelation等)
├── knowledge-graph-store.ts          # IKnowledgeGraphStore, SQLiteKnowledgeGraphStore
├── index.ts                          # 公開API
└── __tests__/
    └── knowledge-graph-store.test.ts # テストスイート
```

### 2.2 依存関係

```
knowledge-graph-store.ts
    │
    ├── types.ts (ドメインモデル)
    │
    ├── @/types/rag/graph (EntityEntity, RelationEntity等)
    │
    ├── @/types/rag/result (Result, ok, err)
    │
    ├── @/types/rag/branded (EntityId, RelationId等)
    │
    └── @/db/schema/graph (entities, graphRelations, chunkEntities)
```

---

## 3. データフロー

### 3.1 エンティティ永続化フロー

```
ExtractedEntity
    │
    ▼
┌───────────────────────────────────────┐
│ upsertEntity()                        │
│ ┌───────────────────────────────────┐ │
│ │ 1. 正規化名で既存エンティティ検索   │ │
│ │ 2. 既存あり: マージ処理             │ │
│ │    - mentionCount += 1             │ │
│ │    - aliases追加                   │ │
│ │    - chunkIds追加                  │ │
│ │    - embedding更新                 │ │
│ │ 3. 既存なし: 新規INSERT            │ │
│ │ 4. StoredEntity返却                │ │
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘
    │
    ▼
StoredEntity
```

### 3.2 グラフトラバーサルフロー

```
traverse(startEntityId, options)
    │
    ▼
┌───────────────────────────────────────┐
│ BFSアルゴリズム                        │
│ ┌───────────────────────────────────┐ │
│ │ 1. キュー初期化 [startEntity]      │ │
│ │ 2. while (キュー非空 && depth < max)│ │
│ │    a. 現在ノード取得                │ │
│ │    b. 隣接関係取得                  │ │
│ │    c. フィルタ適用 (types, weight)  │ │
│ │    d. 未訪問ノードをキュー追加      │ │
│ │    e. パス記録                      │ │
│ │ 3. 結果集計                         │ │
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘
    │
    ▼
GraphTraversalResult
```

### 3.3 類似エンティティ検索フロー

```
findSimilarEntities(embedding, limit, threshold)
    │
    ▼
┌───────────────────────────────────────┐
│ ベクトル検索                           │
│ ┌───────────────────────────────────┐ │
│ │ 1. DiskANN検索クエリ生成            │ │
│ │ 2. vector_distance_cos()実行       │ │
│ │ 3. 距離→類似度変換                  │ │
│ │    similarity = 1 - distance / 2   │ │
│ │ 4. 閾値フィルタ                     │ │
│ │ 5. 類似度降順ソート                 │ │
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘
    │
    ▼
StoredEntity[]
```

---

## 4. エラーハンドリング

### 4.1 Result型の活用

```typescript
// 全メソッドはResult型を返却
type MethodResult<T> = Promise<Result<T, Error>>;

// 使用例
const result = await store.getEntity(id);
if (isOk(result)) {
  const entity = result.data;
} else {
  console.error(result.error);
}
```

### 4.2 エラー種別

| エラー種別              | 発生条件                          |
| ----------------------- | --------------------------------- |
| EntityNotFoundError     | 指定IDのエンティティが存在しない  |
| RelationNotFoundError   | 指定IDの関係が存在しない          |
| SelfLoopError           | sourceId === targetIdの関係を追加 |
| EvidenceRequiredError   | evidenceが空の関係を追加          |
| DatabaseConnectionError | DB接続失敗                        |
| VectorSearchError       | ベクトル検索の実行エラー          |

---

## 5. パフォーマンス考慮

### 5.1 インデックス活用

| クエリパターン               | 使用インデックス                 |
| ---------------------------- | -------------------------------- |
| 正規化名でエンティティ検索   | entities_normalized_name_idx     |
| タイプでエンティティフィルタ | entities_type_idx                |
| エンティティからの関係取得   | relations_source_id_idx          |
| エンティティへの関係取得     | relations_target_id_idx          |
| 同一ペア間の関係重複チェック | relations_source_target_type_idx |

### 5.2 バッチ処理最適化

```typescript
// トランザクションでバッチ処理
async bulkUpsertEntities(entities: ExtractedEntity[]): Promise<Result<StoredEntity[], Error>> {
  return db.transaction(async (tx) => {
    const results: StoredEntity[] = [];
    for (const entity of entities) {
      const result = await this.upsertEntityWithTx(tx, entity);
      if (isErr(result)) throw result.error; // ロールバック
      results.push(result.data);
    }
    return ok(results);
  });
}
```

### 5.3 メモリ効率

| 操作               | 対策                                 |
| ------------------ | ------------------------------------ |
| 大規模トラバーサル | maxNodes制限、イテレータパターン検討 |
| バッチ処理         | 分割処理（デフォルト1000件/バッチ）  |
| ベクトル検索       | limit指定必須                        |

---

## 6. 統合ポイント

### 6.1 既存スキーマとの連携

| テーブル         | 用途                      |
| ---------------- | ------------------------- |
| entities         | エンティティ永続化        |
| graphRelations   | 関係永続化                |
| chunkEntities    | チャンク-エンティティ関連 |
| relationEvidence | 関係の証拠（別テーブル）  |

### 6.2 型変換

```
ExtractedEntity → StoredEntity
  - id生成 (UUID)
  - normalizedName計算
  - createdAt/updatedAt設定

ExtractedRelation → StoredRelation
  - id生成 (UUID)
  - weight初期化 (1.0)
  - evidenceCount設定
```

---

## 7. テスト戦略

### 7.1 テスト種別

| 種別           | 対象                   |
| -------------- | ---------------------- |
| ユニットテスト | 各メソッドの個別動作   |
| 統合テスト     | DB接続を含むE2Eフロー  |
| パフォーマンス | 大量データでの応答時間 |

### 7.2 テストデータ

```typescript
// テスト用ファクトリー
const createTestEntity = (
  overrides?: Partial<ExtractedEntity>,
): ExtractedEntity => ({
  name: "Test Entity",
  type: "concept",
  confidence: 0.9,
  ...overrides,
});
```

---

## 8. 変更履歴

| バージョン | 日付       | 変更者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 1.0.0      | 2026-01-09 | Claude | 初版作成 |
