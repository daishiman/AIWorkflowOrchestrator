# @repo/shared/services/graph モジュール 実装ガイド

## Part 1: 概念的説明（初学者・非技術者向け）

### 概要

@repo/shared パッケージの services/graph モジュールから、
Community関連の型をエクスポートできるようになりました。

### 何が変わったか

- `services/graph/index.ts` にバレルファイルを作成/更新
- Community, CommunitySummary, StoredEntity などの型を再エクスポート
- CommunityErrorCode, CommunityDetectionError などの値を再エクスポート
- normalizeEntityName 関数を再エクスポート

### なぜ必要だったか

- apps/desktop から型をインポートできなかったビルドエラーを解消
- モジュール間の依存関係を明確化
- 公開APIを整理し、内部実装を隠蔽

### 影響範囲

- 既存コードへの影響：なし（新規エクスポートの追加のみ）
- 破壊的変更：なし

---

## Part 2: 技術的詳細（開発者向け）

### 使用方法

#### 型のインポート

```typescript
import type {
  // Entity関連
  StoredEntity,
  ExtractedEntity,
  EntityMention,
  // Relation関連
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
  // Graph関連
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  // Community関連
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
  // Query関連
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "@repo/shared/services/graph";
```

#### 値のインポート

```typescript
import {
  // 検出エラー
  CommunityErrorCode,
  CommunityDetectionError,
  // 要約エラー
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  // ユーティリティ
  normalizeEntityName,
} from "@repo/shared/services/graph";
```

### エクスポート一覧

| カテゴリ         | 項目                                                                                            | 形式        |
| ---------------- | ----------------------------------------------------------------------------------------------- | ----------- |
| インターフェース | StoredEntity, ExtractedEntity, EntityMention                                                    | export type |
| インターフェース | StoredRelation, ExtractedRelation, RelationEvidence                                             | export type |
| インターフェース | GraphNode, GraphEdge, GraphPath, GraphTraversalResult, GraphStats                               | export type |
| インターフェース | Community, CommunitySummary, CommunityStructure, CommunityDetection\*, CommunitySummarization\* | export type |
| インターフェース | EntityQuery, TraversalOptions, RelationQueryOptions                                             | export type |
| 列挙型           | CommunityErrorCode, CommunitySummarizationErrorCode                                             | export      |
| クラス           | CommunityDetectionError, CommunitySummarizationError                                            | export      |
| 関数             | normalizeEntityName                                                                             | export      |

### 使用例

```typescript
// エンティティ名の正規化
import { normalizeEntityName } from "@repo/shared/services/graph";

const normalized = normalizeEntityName("TypeScript 5.x"); // "typescript 5x"

// エラーハンドリング
import {
  CommunityErrorCode,
  CommunityDetectionError,
} from "@repo/shared/services/graph";

try {
  // コミュニティ検出処理
  await detectCommunities(graph);
} catch (error) {
  if (error instanceof CommunityDetectionError) {
    switch (error.code) {
      case CommunityErrorCode.DETECTION_FAILED:
        console.error("Detection failed:", error.message);
        break;
      case CommunityErrorCode.GRAPH_LOAD_FAILED:
        console.error("Graph load failed:", error.message);
        break;
      default:
        console.error("Unknown error:", error.message);
    }
  }
}
```

### ファイル構成

```
packages/shared/src/services/graph/
├── index.ts     # バレルファイル（公開API）
├── types.ts     # 型定義ファイル
└── __tests__/
    └── type-exports.test.ts  # エクスポートテスト
```

### 関連タスク

- SHARED-TYPE-EXPORT-02: メインindex.tsからのエクスポート（Part 2）
- SHARED-TYPE-EXPORT-03: 型チェック検証（Part 3）
