# services/graph 型エクスポート 実装ガイド

## 作成日

2026-01-13

## 概要

`@repo/shared/services/graph` から型をエクスポートするためのバレルファイル実装ガイド。

---

## Part 1: 概念的説明

### なぜ型エクスポートが必要か

TypeScriptでは、型情報はデフォルトでは外部に公開されません。これは「家の中の部屋」のようなもので、外からは見えません。

現在 `types.ts` には多くの型が定義されていますが、外部パッケージ（`@repo/desktop`など）からはアクセスできません。

```
┌─────────────────────────────────────┐
│ @repo/shared                         │
│                                      │
│   services/graph/                    │
│   ├── types.ts  ← 型が定義されている │
│   └── index.ts  ← ここで公開する     │
│                                      │
└─────────────────────────────────────┘
         ↓ エクスポート
         ↓
┌─────────────────────────────────────┐
│ @repo/desktop                        │
│                                      │
│   import { Community } from         │
│     "@repo/shared/services/graph"   │
│                                      │
└─────────────────────────────────────┘
```

`index.ts` でエクスポートすることで、「玄関」を作り、外部からアクセスできるようにします。

### エクスポートの2つの方法

| エクスポート方法 | 対象              | コンパイル後 |
| ---------------- | ----------------- | ------------ |
| `export type`    | interface, type   | 消える       |
| `export`         | enum, class, 関数 | 残る         |

#### なぜ使い分けるのか

TypeScriptの型情報はJavaScriptにコンパイルされると消えます。しかし、enumやclassは実行時にも値として存在します。

```typescript
// これは型情報のみ（コンパイル後は消える）
export type { Community } from "./types";

// これは値も含む（コンパイル後も残る）
export { CommunityErrorCode } from "./types";
```

この使い分けにより、必要なものだけを正しくエクスポートできます。

---

## Part 2: 技術的詳細

### エクスポート構造

```
packages/shared/src/services/graph/
├── index.ts          ← 新規作成（バレルファイル）
├── types.ts          ← 既存（型定義）
├── community-detector.ts
├── community-summarizer.ts
├── leiden-algorithm.ts
└── knowledge-graph-store.ts
```

### index.ts の構造

```typescript
/**
 * @file Knowledge Graph Service - Public API
 * @module @repo/shared/services/graph
 */

// ============================================================
// Type Re-exports (型のみ、コンパイル後は消える)
// ============================================================

// Entity関連
export type { StoredEntity, ExtractedEntity, EntityMention } from "./types";

// Relation関連
export type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "./types";

// Graph関連
export type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "./types";

// Community関連
export type {
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
} from "./types";

// Query関連
export type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./types";

// ============================================================
// Value Re-exports (値も含む、コンパイル後も残る)
// ============================================================

// Error関連 (enum + class)
export { CommunityErrorCode, CommunityDetectionError } from "./types";
export {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "./types";

// Utility関数
export { normalizeEntityName } from "./types";
```

### なぜこの構造にしたか

1. **カテゴリ別にグループ化**: 関連する型をまとめて可読性を向上
2. **Type/Value分離**: TypeScript の export 規則に従い明確に分離
3. **コメント付き**: 各セクションの目的を明記

### 使用方法

```typescript
// 型のインポート
import type {
  Community,
  CommunitySummary,
  StoredEntity,
} from "@repo/shared/services/graph";

// 値のインポート
import {
  CommunityErrorCode,
  CommunityDetectionError,
  normalizeEntityName,
} from "@repo/shared/services/graph";
```

---

## 用語集

| 用語            | 読み方                 | 説明                                                                |
| --------------- | ---------------------- | ------------------------------------------------------------------- |
| Barrel file     | バレルファイル         | 複数のモジュールを1つのエントリポイントで再エクスポートするファイル |
| export type     | エクスポートタイプ     | 型情報のみをエクスポートする構文                                    |
| export          | エクスポート           | 値と型の両方をエクスポートする構文                                  |
| Type Re-export  | タイプリエクスポート   | 型を別のモジュールから再エクスポートすること                        |
| Value Re-export | バリューリエクスポート | 値を別のモジュールから再エクスポートすること                        |
| Community       | コミュニティ           | ナレッジグラフ内のエンティティ群                                    |
| Entity          | エンティティ           | ナレッジグラフの頂点となる要素                                      |
| Relation        | リレーション           | エンティティ間の関係性                                              |

---

## エクスポート一覧

### 型（22個）

| カテゴリ  | 型名                                                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entity    | StoredEntity, ExtractedEntity, EntityMention                                                                                                                                               |
| Relation  | StoredRelation, ExtractedRelation, RelationEvidence                                                                                                                                        |
| Graph     | GraphNode, GraphPath, GraphTraversalResult, GraphStats, GraphEdge                                                                                                                          |
| Community | Community, CommunitySummary, CommunityStructure, CommunityDetectionOptions, CommunityDetectionResult, CommunityDetectionStats, CommunitySummarizationOptions, CommunitySummarizationResult |
| Query     | EntityQuery, TraversalOptions, RelationQueryOptions                                                                                                                                        |

### 値（5個）

| カテゴリ | 種別     | 名前                            |
| -------- | -------- | ------------------------------- |
| Error    | enum     | CommunityErrorCode              |
| Error    | class    | CommunityDetectionError         |
| Error    | enum     | CommunitySummarizationErrorCode |
| Error    | class    | CommunitySummarizationError     |
| Utility  | function | normalizeEntityName             |

---

## タスク1完了

✅ 実装ガイド（Part 1 + Part 2 + 用語集）作成完了
