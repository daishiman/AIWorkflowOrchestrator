# Knowledge Graph Store インターフェース仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: .claude/skills/aiworkflow-requirements/references/

---

## 概要

### 目的

Knowledge Graph StoreはRAGパイプラインにおけるナレッジグラフ（知識グラフ）の永続化と操作を担当するリポジトリ層。エンティティ（ノード）と関係（エッジ）のCRUD操作、グラフ探索機能を提供する。

### スコープ

| スコープ内                   | スコープ外                     |
| --------------------------- | ------------------------------ |
| Entity/Relation CRUD        | エンティティ抽出（NER）        |
| グラフ探索（BFS、最短経路）  | 関係抽出（Relation Extraction）|
| バッチ操作                   | コミュニティ検出               |
| 統計情報取得                 | ベクトル類似検索（将来対応）   |

---

## 要件

### 機能要件

| ID     | 要件                       | 優先度 | 説明                                               |
| ------ | -------------------------- | ------ | -------------------------------------------------- |
| FR-001 | Entity CRUD                | 必須   | エンティティの作成・取得・更新・削除               |
| FR-002 | Relation CRUD              | 必須   | 関係の作成・取得・削除（証拠情報付き）             |
| FR-003 | グラフ探索                 | 必須   | BFSトラバーサル、最短経路探索                       |
| FR-004 | バッチ操作                 | 必須   | 複数エンティティ・関係の一括操作                    |
| FR-005 | 統計情報取得               | 推奨   | エンティティ数、関係数などのグラフ統計              |
| FR-006 | 類似エンティティ検索       | 推奨   | ベクトル埋め込みによる類似検索（DiskANN統合後）     |

### 非機能要件

| 項目           | 要件                     | 基準                     |
| -------------- | ------------------------ | ------------------------ |
| パフォーマンス | バッチ操作の効率性       | 1000件/秒以上            |
| データ整合性   | 参照整合性の維持         | CASCADE削除対応          |
| 型安全性       | Branded Types使用        | EntityId, RelationId等   |
| エラー処理     | Result型パターン         | ok/err による明示的処理  |

---

## 設計

### アーキテクチャ

**実装場所**: `packages/shared/src/services/graph/knowledge-graph-store.ts`

```
┌────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  (エンティティ抽出、関係抽出、RAGパイプライン)          │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│              IKnowledgeGraphStore (Interface)           │
│  - addEntity / getEntity / updateEntity / deleteEntity  │
│  - addRelation / getRelation / deleteRelation           │
│  - traverse / findShortestPath / getNeighbors           │
│  - bulkUpsertEntities / bulkAddRelations                │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│           SQLiteKnowledgeGraphStore (実装)              │
│  - Drizzle ORM によるデータベース操作                   │
│  - Result<T, Error> パターンによるエラー処理            │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                    SQLite Database                      │
│  - entities テーブル                                    │
│  - relations テーブル                                   │
│  - relation_evidence テーブル                           │
│  - chunk_entity_relations テーブル                      │
└────────────────────────────────────────────────────────┘
```

### データ構造

#### StoredEntity（永続化エンティティ）

| フィールド名    | 型         | 必須 | 説明                           |
| --------------- | ---------- | ---- | ------------------------------ |
| id              | EntityId   | ✅   | 一意識別子（Branded Type）     |
| name            | string     | ✅   | エンティティ名                 |
| normalizedName  | string     | ✅   | 正規化名（検索用）             |
| type            | EntityType | ✅   | エンティティタイプ（52種類）   |
| description     | string?    | -    | 説明文                         |
| aliases         | string[]   | ✅   | 別名リスト                     |
| confidence      | number     | ✅   | 信頼度スコア（0.0〜1.0）       |
| mentionCount    | number     | ✅   | 出現回数                       |
| importance      | number     | ✅   | 重要度スコア（0.0〜1.0）       |
| embedding       | number[]?  | -    | 埋め込みベクトル（384次元）    |
| createdAt       | Date       | ✅   | 作成日時                       |
| updatedAt       | Date       | ✅   | 更新日時                       |

#### StoredRelation（永続化関係）

| フィールド名    | 型             | 必須 | 説明                           |
| --------------- | -------------- | ---- | ------------------------------ |
| id              | RelationId     | ✅   | 一意識別子（Branded Type）     |
| sourceEntityId  | EntityId       | ✅   | 起点エンティティID             |
| targetEntityId  | EntityId       | ✅   | 終点エンティティID             |
| relationType    | RelationType   | ✅   | 関係タイプ（15種類）           |
| description     | string?        | -    | 関係の説明文                   |
| confidence      | number         | ✅   | 信頼度スコア（0.0〜1.0）       |
| bidirectional   | boolean        | ✅   | 双方向関係フラグ               |
| evidence        | RelationEvidence[] | ✅ | 根拠情報（1件以上必須）        |
| createdAt       | Date           | ✅   | 作成日時                       |

### 処理フロー

#### エンティティ追加フロー

- ステップ1: 名前正規化（小文字化・空白正規化）
- ステップ2: 既存エンティティの検索（normalizedNameで重複チェック）
- ステップ3: 重複時はマージ（mentionCount加算、aliases統合）
- ステップ4: 新規時は INSERT、重複時は UPDATE

#### 関係追加フロー

- ステップ1: 起点・終点エンティティの存在確認
- ステップ2: 自己ループ（source == target）の禁止チェック
- ステップ3: 証拠情報の必須チェック（1件以上）
- ステップ4: 既存関係の検索（同一ペア・同一タイプ）
- ステップ5: 重複時は証拠を追加、新規時は INSERT

---

## インターフェース定義

### IKnowledgeGraphStore

| メソッド                    | 戻り値                                           | 説明                               |
| --------------------------- | ------------------------------------------------ | ---------------------------------- |
| addEntity(entity)           | Result<StoredEntity, Error>                      | エンティティ追加（upsert）         |
| getEntity(id)               | Result<StoredEntity \| null, Error>              | IDでエンティティ取得               |
| getEntityByName(name)       | Result<StoredEntity \| null, Error>              | 名前でエンティティ取得             |
| updateEntity(id, updates)   | Result<StoredEntity, Error>                      | エンティティ更新                   |
| deleteEntity(id)            | Result<void, Error>                              | エンティティ削除（CASCADE）        |
| searchEntities(query)       | Result<StoredEntity[], Error>                    | 条件検索                           |
| addRelation(relation)       | Result<StoredRelation, Error>                    | 関係追加（証拠必須）               |
| getRelation(id)             | Result<StoredRelation \| null, Error>            | IDで関係取得                       |
| deleteRelation(id)          | Result<void, Error>                              | 関係削除                           |
| getRelationsByEntity(id)    | Result<StoredRelation[], Error>                  | エンティティの全関係取得           |
| traverse(startId, options)  | Result<TraversalResult, Error>                   | BFSトラバーサル                    |
| findShortestPath(from, to)  | Result<EntityId[] \| null, Error>                | 最短経路探索                       |
| getNeighbors(id, depth)     | Result<StoredEntity[], Error>                    | 隣接ノード取得                     |
| bulkUpsertEntities(entities)| Result<StoredEntity[], Error>                    | バッチエンティティ追加             |
| bulkAddRelations(relations) | Result<StoredRelation[], Error>                  | バッチ関係追加                     |
| getStats()                  | Result<GraphStats, Error>                        | グラフ統計取得                     |

### ファクトリ関数

```typescript
import { createKnowledgeGraphStore } from "@repo/shared/services/graph";

const store = createKnowledgeGraphStore(db);
const result = await store.addEntity({ name: "TypeScript", type: "technology" });
if (result.isOk()) {
  console.log(result.value);
}
```

---

## エラー型

| エラークラス          | 説明                                 |
| --------------------- | ------------------------------------ |
| EntityNotFoundError   | 指定エンティティが存在しない         |
| SelfLoopError         | 自己参照関係の作成試行               |
| EvidenceRequiredError | 証拠なしでの関係作成試行             |
| DatabaseError         | データベース操作エラー               |

---

## 実装ガイドライン

### コーディング規約

| 項目           | 規約                        | 理由                               |
| -------------- | --------------------------- | ---------------------------------- |
| エラー処理     | Result<T, Error>パターン    | 明示的なエラーハンドリング         |
| ID型           | Branded Types使用           | コンパイル時の型安全性確保         |
| 名前正規化     | normalizeEntityName()使用   | 検索精度と重複検出の向上           |
| 埋め込み       | Buffer形式で永続化          | SQLiteバイナリ効率化               |

### テスト要件

| テスト種別 | 対象                       | カバレッジ目標 | 必須ケース                     |
| ---------- | -------------------------- | -------------- | ------------------------------ |
| 単体テスト | 各メソッド                 | 80%+           | 正常系、異常系、境界値         |
| 結合テスト | グラフ操作フロー           | -              | BFS、最短経路、バッチ          |

**達成済みカバレッジ**: Line 87.96%, Branch 77.77%, Function 100%

---

## 実装ステータス

### 実装完了機能（2026-01-13）

| 機能カテゴリ | メソッド | 状態 | 備考 |
|-------------|---------|------|------|
| Entity CRUD | upsertEntity | ✅ 完了 | 名前正規化・重複マージ対応 |
| Entity CRUD | getEntity | ✅ 完了 | IDベース検索 |
| Entity CRUD | getEntityByName | ✅ 完了 | 正規化名で検索 |
| Entity CRUD | findEntities | ✅ 完了 | 条件検索（type, minConfidence等） |
| Entity CRUD | deleteEntity | ✅ 完了 | CASCADE削除対応 |
| Relation CRUD | addRelation | ✅ 完了 | 証拠必須・重複時証拠追加 |
| Relation CRUD | getRelation | ✅ 完了 | Evidence JOIN |
| Relation CRUD | getRelations | ✅ 完了 | エンティティID検索 |
| Relation CRUD | findRelations | ✅ 完了 | 条件検索 |
| Relation CRUD | deleteRelation | ✅ 完了 | Evidence CASCADE |
| グラフ探索 | traverse | ✅ 完了 | BFSアルゴリズム |
| グラフ探索 | findShortestPath | ✅ 完了 | 双方向BFS |
| グラフ探索 | getNeighbors | ✅ 完了 | 深さ指定可 |
| バッチ操作 | bulkUpsertEntities | ✅ 完了 | 逐次処理 |
| バッチ操作 | bulkAddRelations | ✅ 完了 | 逐次処理 |
| 統計 | getStats | ✅ 完了 | COUNT集計 |
| 類似検索 | findSimilarEntities | ⚠️ スタブ | DiskANN統合後に実装 |

### 使用例

```typescript
import { createKnowledgeGraphStore } from "@repo/shared/services/graph";
import { db } from "@repo/shared/db";

// ストア作成
const store = createKnowledgeGraphStore(db);

// Entity追加（upsert）
const entityResult = await store.upsertEntity({
  name: "TypeScript",
  type: "programming_language",
  description: "JavaScript with types",
  confidence: 0.95,
});

if (entityResult.isOk()) {
  const entity = entityResult.value;
  console.log(`Created: ${entity.id}`);
}

// Relation追加（証拠必須）
const relationResult = await store.addRelation({
  sourceEntityId: entity1.id,
  targetEntityId: entity2.id,
  relationType: "uses",
  confidence: 0.9,
  evidence: [{
    chunkId: "chunk-123" as ChunkId,
    text: "TypeScript uses JavaScript runtime",
    confidence: 0.9,
  }],
});

// グラフ探索（BFS）
const traverseResult = await store.traverse(startEntityId, {
  maxDepth: 3,
  direction: "outgoing",
  relationTypes: ["uses", "depends_on"],
});

// 最短経路探索
const pathResult = await store.findShortestPath(entityA.id, entityB.id);
if (pathResult.isOk() && pathResult.value) {
  console.log(`Path: ${pathResult.value.join(" -> ")}`);
}
```

---

## 関連ドキュメント

| ドキュメント                | 説明                                 |
| --------------------------- | ------------------------------------ |
| interfaces-rag.md           | RAG全体インターフェース仕様          |
| database-schema.md          | データベーススキーマ定義             |
| architecture-rag.md         | RAGアーキテクチャ設計                |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| 2026-01-09 | 1.0.0      | 初版作成（CONV-08-01タスク完了に伴い）         |
| 2026-01-13 | 1.1.0      | 実装ステータス・使用例セクション追加、カバレッジ86.98%達成 |
