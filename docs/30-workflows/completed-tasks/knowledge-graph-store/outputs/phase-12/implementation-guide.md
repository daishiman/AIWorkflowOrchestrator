# Knowledge Graph Store 実装ガイド

## Part 1: 概念的な説明

### Knowledge Graphとは？

Knowledge Graph（ナレッジグラフ）は、**情報を「点（エンティティ）」と「線（関係）」で表現する仕組み**です。

例えば、図書館の本を整理することを考えてみましょう：

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React.js  │────▶│    使用する   │────▶│ JavaScript  │
│ (フレームワーク)│     │   (関係)     │     │   (言語)    │
└─────────────┘     └──────────────┘     └─────────────┘
```

- **エンティティ（Entity）**: 「React.js」や「JavaScript」のような具体的なモノ・概念
- **関係（Relation）**: エンティティ間のつながり（「使用する」「参照する」など）
- **証拠（Evidence）**: 「なぜその関係があるのか」の根拠（文書の抜粋）

### なぜKnowledge Graphが必要？

従来の検索は「キーワード」でしか探せませんでした。Knowledge Graphを使うと：

1. **関連情報の自動発見**: 「Reactに関連する技術は？」→ JavaScript, TypeScript, Next.js...
2. **経路探索**: 「ReactとPythonの関係は？」→ React → JavaScript → Node.js → Python
3. **文脈理解**: 単なるキーワードでなく、意味的なつながりを理解

### このストアの役割

```
┌─────────────────────────────────────────────────────────┐
│                    RAGシステム                          │
├─────────────────────────────────────────────────────────┤
│  ┌───────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │ 文書取込  │──▶│ エンティティ  │──▶│ Knowledge     │  │
│  │           │   │   抽出       │   │ Graph Store   │  │
│  └───────────┘   └──────────────┘   │ (このコード)  │  │
│                                      └───────────────┘  │
│                                             │           │
│                                             ▼           │
│                                      ┌───────────────┐  │
│                                      │   質問応答    │  │
│                                      └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Knowledge Graph Store**は、エンティティと関係を**保存**し、**検索**し、**グラフを辿る**機能を提供します。

---

## Part 2: 技術的な詳細

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           IKnowledgeGraphStore (Interface)              │    │
│  │  - upsertEntity()    - addRelation()    - traverse()    │    │
│  │  - getEntity()       - getRelations()   - findShortestPath()│
│  │  - findEntities()    - deleteRelation() - getNeighbors()│    │
│  │  - deleteEntity()    - getStats()       - bulkOps()     │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         SQLiteKnowledgeGraphStore (Implementation)      │    │
│  │  - Entity CRUD with merge logic                          │    │
│  │  - Relation CRUD with evidence management                │    │
│  │  - BFS-based graph traversal                             │    │
│  │  - Helper methods (serialization, mapping)               │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Drizzle ORM  │  │   SQLite     │  │ better-sqlite3│          │
│  │ (Query Builder)│ │ (Database)   │  │ (Driver)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### データベーススキーマ

```
┌─────────────────┐         ┌─────────────────┐
│    entities     │         │    relations    │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◀───┬────│ id (PK)         │
│ name            │    │    │ source_id (FK)  │──┐
│ normalized_name │    │    │ target_id (FK)  │──┤
│ type            │    │    │ type            │  │
│ description     │    │    │ description     │  │
│ aliases         │    │    │ weight          │  │
│ embedding       │    │    │ bidirectional   │  │
│ importance      │    │    │ evidence_count  │  │
│ mention_count   │    │    │ metadata        │  │
│ metadata        │    │    │ created_at      │  │
│ created_at      │    │    │ updated_at      │  │
│ updated_at      │    │    └─────────────────┘  │
└─────────────────┘    │                         │
         │             │    ┌─────────────────┐  │
         │             │    │relation_evidence│  │
         │             │    ├─────────────────┤  │
         │             └────│ relation_id (FK)│◀─┘
         │                  │ chunk_id        │
         │                  │ excerpt         │
         │                  │ confidence      │
         │                  │ created_at      │
         │                  │ updated_at      │
         │                  └─────────────────┘
         │
         │             ┌─────────────────┐
         │             │  chunk_entities │
         │             ├─────────────────┤
         └─────────────│ entity_id (FK)  │
                       │ chunk_id        │
                       │ mention_count   │
                       │ positions       │
                       └─────────────────┘
```

### 主要な型

```typescript
// エンティティ（入力型）
interface ExtractedEntity {
  name: string; // "React.js"
  type: EntityType; // "framework"
  confidence: number; // 0.95
  description?: string; // "A JavaScript library..."
  aliases?: string[]; // ["ReactJS", "React"]
  embedding?: number[]; // [0.1, -0.3, ...]
  chunkId?: ChunkId; // 抽出元チャンク
}

// エンティティ（出力型）
interface StoredEntity {
  id: EntityId; // Branded ID
  name: string;
  normalizedName: string; // "reactjs" (検索用)
  type: EntityType;
  mentionCount: number; // 出現回数
  importance: number; // 重要度スコア
  chunkIds: ChunkId[]; // 関連チャンクリスト
  // ... その他フィールド
}

// 関係（入力型）
interface ExtractedRelation {
  sourceName: string; // "React"
  targetName: string; // "JavaScript"
  type: RelationType; // "uses"
  confidence: number; // 0.9
  evidence: RelationEvidence; // 証拠情報
}
```

### 設計判断

#### 1. Result型によるエラーハンドリング

**なぜ？** 例外を投げる代わりにResult型を使用することで、エラーハンドリングが明示的になります。

```typescript
// 良い例（Result型）
const result = await store.getEntity(id);
if (isOk(result)) {
  console.log(result.data); // 型安全
} else {
  console.error(result.error.message);
}

// 避けるべき例（例外）
try {
  const entity = await store.getEntity(id); // エラーが隠れる
} catch (e) {
  // エラー型が不明
}
```

#### 2. Upsert（更新or挿入）パターン

**なぜ？** 同じエンティティが複数の文書から抽出されることがあるため、マージロジックが必要です。

```typescript
// 2回目の抽出で自動マージ
await store.upsertEntity({ name: "React", type: "framework", confidence: 0.8 });
await store.upsertEntity({ name: "React", type: "framework", confidence: 0.9 });
// → mentionCount: 2, confidence: 0.9（高い方を採用）
```

#### 3. BFS（幅優先探索）によるトラバーサル

**なぜ？** 最短経路探索に適しており、深さ制限が容易です。

```
          A
         /|\
        B C D     ← 深さ1
       /|   |\
      E F   G H   ← 深さ2

BFSの探索順序: A → B → C → D → E → F → G → H
```

### 用語集

| 用語         | 読み方             | 意味                                                |
| ------------ | ------------------ | --------------------------------------------------- |
| Entity       | エンティティ       | グラフの「点」。名前を持つ概念やモノ                |
| Relation     | リレーション       | グラフの「線」。エンティティ間のつながり            |
| Evidence     | エビデンス         | 関係の証拠。抽出元のテキスト抜粋                    |
| Traversal    | トラバーサル       | グラフを辿ること。BFSやDFSなど                      |
| BFS          | ビーエフエス       | 幅優先探索（Breadth-First Search）                  |
| Upsert       | アップサート       | Update or Insert の略。存在すれば更新、なければ挿入 |
| Branded Type | ブランデッドタイプ | 型に「ブランド」を付けて区別可能にする技法          |

### 使用例

```typescript
import { createKnowledgeGraphStore } from "@repo/shared/services/graph/knowledge-graph-store";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// 1. データベース初期化
const sqlite = new Database("knowledge.db");
const db = drizzle(sqlite);
const store = createKnowledgeGraphStore(db);

// 2. エンティティ追加
await store.upsertEntity({
  name: "React",
  type: "framework",
  confidence: 0.95,
  description: "A JavaScript library for building UIs",
});

await store.upsertEntity({
  name: "JavaScript",
  type: "programming_language",
  confidence: 0.99,
});

// 3. 関係追加
await store.addRelation({
  sourceName: "React",
  targetName: "JavaScript",
  type: "uses",
  confidence: 0.9,
  evidence: {
    chunkId: createChunkId("doc-1-chunk-5"),
    text: "React is a JavaScript library...",
    confidence: 0.9,
  },
});

// 4. グラフ探索
const neighbors = await store.getNeighbors(reactEntityId, 2);
// → [JavaScript, TypeScript, Next.js, ...]

// 5. 最短経路
const path = await store.findShortestPath(reactId, pythonId, 5);
// → [React, JavaScript, Node.js, Python]
```
