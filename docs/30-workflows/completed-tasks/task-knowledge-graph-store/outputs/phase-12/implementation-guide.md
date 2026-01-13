# Knowledge Graph Store 実装ガイド

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 12                         |
| 機能名     | task-knowledge-graph-store |
| 作成日     | 2026-01-13                 |
| 作成者     | Claude Opus 4.5            |
| バージョン | 1.0.0                      |

---

# Part 1: 概念的説明（中学生にもわかる版）

## Knowledge Graph（ナレッジグラフ）とは？

### 友達の輪を想像してみてください

**Knowledge Graph（ナレッジグラフ）** は、「人やもの」と「つながり」をコンピュータが理解できる形で保存する仕組みです。

```
         [田中さん]
            │
      「友達」という関係
            │
            ▼
         [鈴木さん] ───「同僚」という関係───▶ [佐藤さん]
            │
      「好きなもの」という関係
            │
            ▼
         [プログラミング]
```

### 3つの重要な言葉

| 言葉                         | 読み方             | 意味                         | 例え話                   |
| ---------------------------- | ------------------ | ---------------------------- | ------------------------ |
| **Entity（エンティティ）**   | エンティティ       | 「もの」や「人」のこと       | あなた、友達、学校、本   |
| **Relation（リレーション）** | リレーション       | 「つながり」や「関係」のこと | 友達、家族、所属、好き   |
| **Evidence（エビデンス）**   | エビデンス（証拠） | 「なぜそう言えるのか」の根拠 | 「同じクラスにいるから」 |

### なぜ証拠（Evidence）が必要なの？

AIが「田中さんと鈴木さんは友達です」と言ったとき、**なぜそう判断したのか**を説明できないと困りますよね。

```
悪い例:
  「田中さん」──「友達」──▶「鈴木さん」
  （なぜ友達なの？わからない...）

良い例:
  「田中さん」──「友達」──▶「鈴木さん」
      │
      └─ 証拠: 「2024年4月の日記に『鈴木くんと遊んだ』と書いてあった」
```

### 全体の仕組み（アーキテクチャ）

```
┌─────────────────────────────────────────────────────────┐
│                    あなた（ユーザー）                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│               Knowledge Graph Store                      │
│  「知識を保存・検索するための倉庫係」                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Entity     │  │   Relation   │  │   Evidence   │   │
│  │  （もの）     │  │ （つながり）  │  │  （証拠）     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   SQLite データベース                     │
│              「実際にデータを保存する場所」                │
└─────────────────────────────────────────────────────────┘
```

### できること一覧

| やりたいこと       | 使う機能           | 例え話                               |
| ------------------ | ------------------ | ------------------------------------ |
| 新しいEntityを追加 | `upsertEntity`     | 新しい友達をアドレス帳に登録         |
| Entityを探す       | `findEntities`     | アドレス帳から友達を検索             |
| つながりを追加     | `addRelation`      | 「AさんとBさんは友達」と記録         |
| つながりをたどる   | `traverse`         | 友達の友達の友達...をたどる          |
| 最短ルートを探す   | `findShortestPath` | AさんからBさんまで何人介せば会える？ |
| 全体の統計を見る   | `getStats`         | 何人登録されてる？関係は何件？       |

### 用語集

| 英語            | 読み方             | 意味                                 |
| --------------- | ------------------ | ------------------------------------ |
| Knowledge Graph | ナレッジグラフ     | 知識をグラフ構造で表現したもの       |
| Entity          | エンティティ       | グラフの「点」（ノード）             |
| Relation        | リレーション       | グラフの「線」（エッジ）             |
| Evidence        | エビデンス         | 関係の根拠となる証拠                 |
| Traverse        | トラバース         | グラフを辿って探索すること           |
| BFS             | ビーエフエス       | 幅優先探索（近い順に探す方法）       |
| CASCADE         | カスケード         | 連鎖的に削除すること                 |
| Result型        | リザルト型         | 成功/失敗を明示的に返す型            |
| Branded Types   | ブランデッドタイプ | 型に「印」をつけて間違いを防ぐ仕組み |

---

# Part 2: 技術的詳細（開発者向け）

## 1. 概要

Knowledge Graph Storeは、AIWorkflowOrchestratorプロジェクトにおけるナレッジグラフの永続化層を提供するモジュールです。Entity（エンティティ）、Relation（関係）、Evidence（証拠）の管理と、グラフ探索機能を提供します。

### 1.1 主要機能

- **Entity管理**: 知識グラフのノード（概念、人物、場所など）の作成・取得・検索・削除
- **Relation管理**: Entity間の関係の作成・取得・検索・削除（証拠付き）
- **グラフ探索**: BFSによるトラバーサル、最短経路探索、隣接ノード取得
- **統計情報**: グラフ全体の統計情報の取得

### 1.2 設計原則

- **Result型パターン**: 全APIが`Result<T, E>`を返却し、例外を投げない
- **Branded Types**: 型安全なID管理（EntityId, RelationId, CommunityId, ChunkId）
- **CASCADE削除**: Entity削除時にRelationも自動削除、Relation削除時にEvidenceも自動削除
- **証拠必須**: Relationは最低1つの証拠が必要

---

## 2. インストールと設定

### 2.1 パッケージ構成

```
packages/shared/src/services/graph/
├── knowledge-graph-store.ts  # メイン実装
├── types.ts                  # 型定義
├── errors.ts                 # エラークラス
└── __tests__/
    └── knowledge-graph-store.test.ts
```

### 2.2 依存関係

```json
{
  "dependencies": {
    "drizzle-orm": "^0.36.x",
    "better-sqlite3": "^11.x",
    "neverthrow": "^8.x"
  }
}
```

### 2.3 インポート

```typescript
import {
  createKnowledgeGraphStore,
  type IKnowledgeGraphStore,
} from "@repo/shared/services/graph/knowledge-graph-store";

import type {
  EntityId,
  RelationId,
  Entity,
  Relation,
  GraphTraversalOptions,
  GraphStats,
} from "@repo/shared/services/graph/types";

import {
  KnowledgeGraphError,
  EntityNotFoundError,
  RelationNotFoundError,
} from "@repo/shared/services/graph/errors";
```

---

## 3. 基本的な使い方

### 3.1 ストアの作成

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { createKnowledgeGraphStore } from "@repo/shared/services/graph/knowledge-graph-store";

// データベース接続
const sqlite = new Database("knowledge.db");
const db = drizzle(sqlite);

// ストア作成
const store = createKnowledgeGraphStore(db);
```

### 3.2 Entity操作

#### 作成・更新

```typescript
// Entity作成
const result = await store.upsertEntity({
  name: "TypeScript",
  type: "programming_language",
  description: "A typed superset of JavaScript",
  metadata: { year: 2012, creator: "Microsoft" },
});

if (result.isOk()) {
  console.log("Created entity:", result.value.id);
} else {
  console.error("Error:", result.error.message);
}
```

#### 取得

```typescript
// IDで取得
const entityResult = await store.getEntity(entityId);

// 名前で取得（正規化済み名前で検索）
const byNameResult = await store.getEntityByName("typescript");
```

#### 検索

```typescript
// 条件で検索
const findResult = await store.findEntities({
  types: ["programming_language", "framework"],
  limit: 100,
  offset: 0,
});

if (findResult.isOk()) {
  console.log(`Found ${findResult.value.length} entities`);
}
```

#### 削除

```typescript
// Entity削除（関連Relationも自動削除）
const deleteResult = await store.deleteEntity(entityId);
```

### 3.3 Relation操作

#### 作成

```typescript
// Relation作成（証拠必須）
const relationResult = await store.addRelation({
  fromEntityId: entity1.id,
  toEntityId: entity2.id,
  relationType: "depends_on",
  evidence: [
    {
      chunkId: "chunk-abc123" as ChunkId,
      content: "TypeScript depends on JavaScript runtime",
    },
  ],
  metadata: { strength: 0.9 },
});
```

#### 取得

```typescript
// Entity起点のRelation取得
const relationsResult = await store.getRelations(entityId, {
  direction: "outgoing", // 'incoming' | 'outgoing' | 'both'
  limit: 50,
});
```

#### 検索

```typescript
// 条件で検索
const findRelationsResult = await store.findRelations({
  relationTypes: ["depends_on", "uses"],
  fromEntityId: entity1.id,
});
```

### 3.4 グラフ探索

#### BFSトラバーサル

```typescript
// 指定深度までのEntity取得
const traverseResult = await store.traverse(startEntityId, {
  maxDepth: 3,
  direction: "both",
  relationTypes: ["depends_on"], // フィルタ（オプション）
});

if (traverseResult.isOk()) {
  for (const entity of traverseResult.value) {
    console.log(`- ${entity.name} (depth: ${entity.depth})`);
  }
}
```

#### 最短経路探索

```typescript
// 2つのEntity間の最短経路
const pathResult = await store.findShortestPath(fromEntityId, toEntityId, {
  maxDepth: 10,
});

if (pathResult.isOk() && pathResult.value.length > 0) {
  console.log("Path:", pathResult.value.map((e) => e.name).join(" -> "));
}
```

#### 隣接ノード取得

```typescript
// 直接接続されたEntity取得
const neighborsResult = await store.getNeighbors(entityId, {
  direction: "outgoing",
});
```

### 3.5 統計情報

```typescript
const statsResult = await store.getStats();

if (statsResult.isOk()) {
  const stats = statsResult.value;
  console.log(`Total entities: ${stats.totalEntities}`);
  console.log(`Total relations: ${stats.totalRelations}`);
  console.log(`Entity types:`, stats.entityTypeCounts);
  console.log(`Relation types:`, stats.relationTypeCounts);
}
```

---

## 4. バッチ操作

### 4.1 Entity一括作成

```typescript
const entities = [
  { name: "Entity A", type: "concept" },
  { name: "Entity B", type: "concept" },
  { name: "Entity C", type: "concept" },
];

const bulkResult = await store.bulkUpsertEntities(entities);

if (bulkResult.isOk()) {
  console.log(`Created ${bulkResult.value.length} entities`);
}
```

### 4.2 Relation一括作成

```typescript
const relations = [
  {
    fromEntityId: entityA.id,
    toEntityId: entityB.id,
    relationType: "related_to",
    evidence: [{ chunkId: "chunk-1" as ChunkId, content: "evidence 1" }],
  },
  {
    fromEntityId: entityB.id,
    toEntityId: entityC.id,
    relationType: "related_to",
    evidence: [{ chunkId: "chunk-2" as ChunkId, content: "evidence 2" }],
  },
];

const bulkRelationResult = await store.bulkAddRelations(relations);
```

---

## 5. エラーハンドリング

### 5.1 Result型の使用

```typescript
const result = await store.getEntity(entityId);

// パターン1: isOk/isErr
if (result.isOk()) {
  const entity = result.value;
  // 成功処理
} else {
  const error = result.error;
  // エラー処理
}

// パターン2: match
result.match(
  (entity) => console.log("Success:", entity.name),
  (error) => console.error("Error:", error.message),
);

// パターン3: unwrapOr
const entity = result.unwrapOr(null);
```

### 5.2 エラー種別

| エラークラス            | 発生条件                       |
| ----------------------- | ------------------------------ |
| EntityNotFoundError     | 存在しないEntityへのアクセス   |
| RelationNotFoundError   | 存在しないRelationへのアクセス |
| EntityValidationError   | Entity入力値の検証エラー       |
| RelationValidationError | Relation入力値の検証エラー     |
| SelfLoopError           | 自己ループRelationの作成試行   |
| NoEvidenceError         | 証拠なしRelationの作成試行     |
| DuplicateEntityError    | 重複Entity（upsertで回避可能） |
| DatabaseError           | データベース操作エラー         |
| GraphTraversalError     | グラフ探索中のエラー           |

### 5.3 エラーハンドリング例

```typescript
import {
  EntityNotFoundError,
  RelationNotFoundError,
  SelfLoopError,
} from "@repo/shared/services/graph/errors";

const result = await store.addRelation(relationData);

if (result.isErr()) {
  const error = result.error;

  if (error instanceof EntityNotFoundError) {
    console.error("Entity not found:", error.entityId);
  } else if (error instanceof SelfLoopError) {
    console.error("Self-loop not allowed");
  } else if (error instanceof NoEvidenceError) {
    console.error("Evidence is required");
  } else {
    console.error("Unknown error:", error.message);
  }
}
```

---

## 6. 型定義

### 6.1 Branded Types

```typescript
// 型安全なID
type EntityId = string & { readonly __brand: "EntityId" };
type RelationId = string & { readonly __brand: "RelationId" };
type CommunityId = string & { readonly __brand: "CommunityId" };
type ChunkId = string & { readonly __brand: "ChunkId" };

// 型キャスト用ユーティリティ
function toEntityId(id: string): EntityId {
  return id as EntityId;
}
```

### 6.2 主要な型

```typescript
interface Entity {
  id: EntityId;
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, unknown>;
  embedding?: Float32Array;
  createdAt: Date;
  updatedAt: Date;
}

interface Relation {
  id: RelationId;
  fromEntityId: EntityId;
  toEntityId: EntityId;
  relationType: string;
  weight: number;
  metadata?: Record<string, unknown>;
  evidenceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RelationEvidence {
  id: string;
  relationId: RelationId;
  chunkId: ChunkId;
  content: string;
  createdAt: Date;
}
```

---

## 7. 制限事項と将来の拡張

### 7.1 現在の制限

| 項目                   | 制限内容               | 対応予定             |
| ---------------------- | ---------------------- | -------------------- |
| findSimilarEntities    | 常に空配列を返却       | DiskANN統合後        |
| Community操作          | 最小限の実装（IDのみ） | 将来拡張予定         |
| バッチトランザクション | 逐次処理               | パフォーマンス改善時 |

### 7.2 将来の拡張予定

1. **ベクトル検索**: DiskANN統合によるセマンティック検索
2. **Community検出**: Louvainアルゴリズムによるコミュニティ検出
3. **グラフ分析**: ページランク、中心性計算などの分析機能
4. **キャッシュ**: 頻繁にアクセスされるデータのメモリキャッシュ

---

## 8. パフォーマンス考慮事項

### 8.1 推奨プラクティス

1. **バッチ操作の活用**: 複数Entity/Relationの作成はbulk操作を使用
2. **適切なlimit設定**: findEntities/findRelationsにはlimitを指定
3. **maxDepthの制限**: traverseのmaxDepthは必要最小限に
4. **インデックス活用**: 検索条件にはインデックスされたカラムを使用

### 8.2 パフォーマンス目安

| 操作                 | 目安時間      |
| -------------------- | ------------- |
| upsertEntity         | < 10ms        |
| getEntity            | < 5ms         |
| findEntities (100件) | < 50ms        |
| traverse (depth=3)   | < 100ms       |
| findShortestPath     | < 100ms       |
| bulkUpsertEntities   | < 100ms/100件 |

---

## 9. 参照ドキュメント

| ドキュメント         | パス                                          |
| -------------------- | --------------------------------------------- |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`      |
| インターフェース設計 | `outputs/phase-2/interface-design.md`         |
| ドメインモデル設計   | `outputs/phase-2/domain-model.md`             |
| エラー設計           | `outputs/phase-2/error-design.md`             |
| テスト仕様書         | `outputs/phase-4/test-specification.md`       |
| 品質保証レポート     | `outputs/phase-9/quality-assurance-report.md` |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     |
