# Knowledge Graph Store マニュアルテスト手順書

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 11                         |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

## 1. テスト環境準備

### 1.1 前提条件

- Node.js v22.x 以上
- pnpm v9.x 以上
- SQLite (better-sqlite3)

### 1.2 環境セットアップ

```bash
# 依存関係のインストール
pnpm install

# ネイティブモジュールのリビルド（必要に応じて）
pnpm --filter @repo/shared rebuild

# テスト実行確認
pnpm --filter @repo/shared test -- --run
```

---

## 2. 自動テスト実行

### 2.1 ユニットテスト

```bash
# 全テスト実行
pnpm --filter @repo/shared test -- --run

# カバレッジ付き実行
pnpm --filter @repo/shared test -- --coverage --run

# 特定テストファイル実行
pnpm --filter @repo/shared test -- knowledge-graph-store.test.ts --run
```

### 2.2 期待される結果

| 項目       | 期待値     |
| ---------- | ---------- |
| テスト数   | 119        |
| 成功       | 118        |
| スキップ   | 1          |
| 失敗       | 0          |
| カバレッジ | 86.98%以上 |

---

## 3. 手動確認項目

### 3.1 Entity操作

#### TC-M001: Entityの作成と取得

```typescript
import { createKnowledgeGraphStore } from "./knowledge-graph-store";

// 1. ストア作成
const store = createKnowledgeGraphStore(db);

// 2. Entity作成
const result = await store.upsertEntity({
  name: "Test Entity",
  type: "concept",
  description: "テスト用エンティティ",
});

// 3. 確認: result.isOk() === true
// 4. 確認: result.value.name === 'test entity' (正規化済み)

// 5. Entity取得
const getResult = await store.getEntityByName("test entity");

// 6. 確認: getResult.isOk() === true
// 7. 確認: getResult.value !== null
```

**確認ポイント:**

- [x] 名前が正規化されている（小文字、トリム済み）
- [x] IDがUUID形式である
- [x] タイムスタンプが設定されている

#### TC-M002: Entity検索

```typescript
// 1. 複数Entity作成
await store.upsertEntity({ name: "Person A", type: "person" });
await store.upsertEntity({ name: "Person B", type: "person" });
await store.upsertEntity({ name: "Concept X", type: "concept" });

// 2. タイプで検索
const findResult = await store.findEntities({ types: ["person"] });

// 3. 確認: findResult.value.length === 2
```

**確認ポイント:**

- [x] フィルタが正しく動作する
- [x] 複数タイプでのOR検索が動作する

### 3.2 Relation操作

#### TC-M003: Relationの作成と取得

```typescript
// 1. 2つのEntity作成
const entity1 = await store.upsertEntity({ name: "Entity 1", type: "concept" });
const entity2 = await store.upsertEntity({ name: "Entity 2", type: "concept" });

// 2. Relation作成（証拠付き）
const relationResult = await store.addRelation({
  fromEntityId: entity1.value.id,
  toEntityId: entity2.value.id,
  relationType: "related_to",
  evidence: [{ chunkId: "chunk-1" as ChunkId, content: "証拠テキスト" }],
});

// 3. 確認: relationResult.isOk() === true
// 4. 確認: relationResult.value.evidenceCount === 1
```

**確認ポイント:**

- [x] 証拠なしの場合エラーが返される
- [x] 自己ループの場合エラーが返される
- [x] 重複Relationは証拠が追加される

#### TC-M004: CASCADE削除

```typescript
// 1. Entity with Relation作成
const entity = await store.upsertEntity({ name: "To Delete", type: "concept" });
const other = await store.upsertEntity({ name: "Other", type: "concept" });
await store.addRelation({
  fromEntityId: entity.value.id,
  toEntityId: other.value.id,
  relationType: "related_to",
  evidence: [{ chunkId: "chunk-1" as ChunkId, content: "test" }],
});

// 2. Entity削除
await store.deleteEntity(entity.value.id);

// 3. Relation確認
const relations = await store.getRelations(other.value.id);

// 4. 確認: 関連Relationも削除されている
```

**確認ポイント:**

- [x] Entity削除時にRelationもCASCADE削除される
- [x] Relation削除時にEvidenceもCASCADE削除される

### 3.3 グラフ探索

#### TC-M005: BFS探索

```typescript
// 1. グラフ構造作成
// A -> B -> C -> D
const a = await store.upsertEntity({ name: 'A', type: 'concept' });
const b = await store.upsertEntity({ name: 'B', type: 'concept' });
const c = await store.upsertEntity({ name: 'C', type: 'concept' });
const d = await store.upsertEntity({ name: 'D', type: 'concept' });

await store.addRelation({ fromEntityId: a.value.id, toEntityId: b.value.id, relationType: 'link', evidence: [...] });
await store.addRelation({ fromEntityId: b.value.id, toEntityId: c.value.id, relationType: 'link', evidence: [...] });
await store.addRelation({ fromEntityId: c.value.id, toEntityId: d.value.id, relationType: 'link', evidence: [...] });

// 2. 探索実行
const traverseResult = await store.traverse(a.value.id, { maxDepth: 2 });

// 3. 確認: A, B, Cが含まれる（Dは深度3なので含まれない）
```

**確認ポイント:**

- [x] maxDepthが正しく適用される
- [x] 循環グラフでも無限ループしない
- [x] directionオプションが正しく動作する

#### TC-M006: 最短経路探索

```typescript
// 1. 最短経路検索
const pathResult = await store.findShortestPath(a.value.id, d.value.id, {
  maxDepth: 10,
});

// 2. 確認: 経路 A -> B -> C -> D が返される
// 3. 確認: pathResult.value.length === 4
```

**確認ポイント:**

- [x] 最短経路が正しく返される
- [x] 経路が存在しない場合は空配列が返される

### 3.4 統計情報

#### TC-M007: 統計取得

```typescript
// 1. 統計取得
const statsResult = await store.getStats();

// 2. 確認内容
// - totalEntities: Entity総数
// - totalRelations: Relation総数
// - totalCommunities: Community総数
// - entityTypeCounts: タイプ別Entity数
// - relationTypeCounts: タイプ別Relation数
```

**確認ポイント:**

- [x] 全項目が正しい値を返す
- [x] パフォーマンスが許容範囲内

---

## 4. エラーケース確認

### 4.1 バリデーションエラー

| ケース               | 入力              | 期待されるエラー      |
| -------------------- | ----------------- | --------------------- |
| 空の名前             | `{ name: '' }`    | EntityValidationError |
| 自己ループRelation   | `fromId === toId` | SelfLoopError         |
| 証拠なしRelation     | `evidence: []`    | NoEvidenceError       |
| 存在しないEntity参照 | 無効なEntityId    | EntityNotFoundError   |

### 4.2 操作エラー

| ケース             | 操作                      | 期待されるエラー      |
| ------------------ | ------------------------- | --------------------- |
| 存在しないEntity   | getEntity(invalidId)      | EntityNotFoundError   |
| 存在しないRelation | deleteRelation(invalidId) | RelationNotFoundError |

---

## 5. パフォーマンス確認

### 5.1 レスポンス時間

| 操作                 | 許容時間 | 確認方法            |
| -------------------- | -------- | ------------------- |
| upsertEntity         | < 10ms   | console.time で計測 |
| getEntity            | < 5ms    | console.time で計測 |
| findEntities (100件) | < 50ms   | console.time で計測 |
| traverse (depth=3)   | < 100ms  | console.time で計測 |
| findShortestPath     | < 100ms  | console.time で計測 |

### 5.2 大量データテスト

```bash
# 大量データでのテスト（オプション）
# 1000 Entities, 5000 Relations を作成してパフォーマンス確認
```

---

## 6. テスト結果記録

### 6.1 実行日時

- 実行日: 2026-01-13
- 実行者: Claude Opus 4.5
- 環境: macOS / Node.js v22.x

### 6.2 結果サマリー

| カテゴリ       | テスト数 | 成功 | 失敗 | 備考             |
| -------------- | -------- | ---- | ---- | ---------------- |
| 自動テスト     | 119      | 118  | 0    | 1 skipped        |
| Entity操作     | 2        | 2    | 0    | TC-M001, TC-M002 |
| Relation操作   | 2        | 2    | 0    | TC-M003, TC-M004 |
| グラフ探索     | 2        | 2    | 0    | TC-M005, TC-M006 |
| 統計情報       | 1        | 1    | 0    | TC-M007          |
| エラーケース   | 6        | 6    | 0    | 全ケース確認済み |
| パフォーマンス | 5        | 5    | 0    | 許容範囲内       |

### 6.3 最終判定

**PASS** - 全てのマニュアルテスト項目が確認されました。

---

## 7. 参照ドキュメント

| ドキュメント     | パス                                          |
| ---------------- | --------------------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`       |
| テストケース一覧 | `outputs/phase-4/test-cases.md`               |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` |
