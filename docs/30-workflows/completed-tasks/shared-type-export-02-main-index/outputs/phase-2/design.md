# Phase 2: 設計書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| タスクID   | SHARED-TYPE-EXPORT-02 |
| Phase      | 2                     |
| 作成日     | 2026-01-14            |
| ステータス | 完了                  |

---

## 1. エクスポート追加位置

### 1.1 現在の構造

```typescript
// packages/shared/index.ts

// Types
export * from "./types";

// Skill types from src/types
export * from "./src/types/skill";

// Agent Execution types (AGENT-005)
export * from "./src/types/agent-execution";

// Core
export * from "./core";

// Infrastructure
export * from "./infrastructure";

// Utils
export * from "./utils";

// Slide
export * from "./src/slide";
```

### 1.2 追加位置の決定

`// Infrastructure` の後、`// Utils` の前に新しいセクション `// Services` を追加する。

**理由**:

- Services は Infrastructure に依存する可能性があるため、Infrastructure の後
- Utils は汎用的なため最後付近に配置
- 既存の構造を壊さない位置

---

## 2. エクスポート文の設計

### 2.1 追加するコード

```typescript
// =============================================================================
// Services
// =============================================================================

/**
 * Graph Service - Community関連型
 * Knowledge Graphサービスから提供される型定義。
 * Entity、Relation、Community、Graph関連の型を含む。
 *
 * @see packages/shared/src/services/graph/index.ts
 */
export type {
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
} from "./src/services/graph";

/**
 * Graph Service - 値（enum, class, function）
 * エラーコード、エラークラス、ユーティリティ関数を含む。
 */
export {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "./src/services/graph";
```

### 2.2 更新後の index.ts 全体構造

```typescript
// Types
export * from "./types";

// Skill types from src/types
export * from "./src/types/skill";

// Agent Execution types (AGENT-005)
export * from "./src/types/agent-execution";

// Core
export * from "./core";

// Infrastructure
export * from "./infrastructure";

// =============================================================================
// Services
// =============================================================================
// [新しいエクスポート文をここに追加]

// Utils
export * from "./utils";

// Slide
export * from "./src/slide";
```

---

## 3. 循環参照分析

### 3.1 依存関係グラフ

```
packages/shared/index.ts
├── ./types (packages/shared/types/index.ts)
│   └── workflow, common, auth, api-keys, file-selection
├── ./src/types/skill
├── ./src/types/agent-execution
├── ./core
├── ./infrastructure
├── ./src/services/graph (新規追加)
│   └── ./types.ts
│       └── ../../types/rag/branded.ts (CommunityId, EntityId)
├── ./utils
└── ./src/slide
```

### 3.2 循環参照チェック

| チェック項目                                 | 結果 |
| -------------------------------------------- | ---- |
| `services/graph` → `index.ts` への依存がない | ✓    |
| `types/rag/branded` → `services/graph` 依存  | なし |
| 追加するエクスポートがサイクルを作らない     | ✓    |

**結論**: 循環参照は発生しない

### 3.3 依存方向の確認

```
index.ts
    ↓ import
./src/services/graph/index.ts
    ↓ import
./src/services/graph/types.ts
    ↓ import
./src/types/rag/branded.ts
    ↓ (依存なし)
```

全て一方向の依存であり、循環は発生しない。

---

## 4. Branded ID型のエクスポート確認

### 4.1 現状

- `CommunityId`, `EntityId` は `src/types/rag/branded.ts` で定義
- `src/types/rag/index.ts` からエクスポートされている
- `src/types/index.ts` が `src/types/rag` を re-export している

### 4.2 メインindex.tsからの参照パス

現在の `packages/shared/index.ts` には以下がある:

```typescript
export * from "./src/types/skill";
export * from "./src/types/agent-execution";
```

しかし、`export * from "./src/types/rag"` は **存在しない**。

### 4.3 対応方針

`CommunityId`, `EntityId` を直接使用する場合、以下の選択肢がある:

1. **Option A**: `export * from "./src/types/rag"` を追加（全RAG型をエクスポート）
2. **Option B**: 必要な型のみ個別にエクスポート

**推奨**: Option A を採用

理由:

- RAG型は Knowledge Graph 機能に必要
- 既に整備されたエクスポート構造を活用
- 将来的な拡張に対応しやすい

### 4.4 追加するコード（RAG型）

```typescript
// RAG types (Branded IDs, Result types, etc.)
export * from "./src/types/rag";
```

---

## 5. 影響範囲

### 5.1 変更ファイル

| ファイル                   | 変更内容                     |
| -------------------------- | ---------------------------- |
| `packages/shared/index.ts` | Services セクションの追加    |
| `packages/shared/index.ts` | RAG types エクスポートの追加 |

### 5.2 互換性への影響

| 観点               | 影響                 |
| ------------------ | -------------------- |
| 既存のエクスポート | 影響なし（追加のみ） |
| 既存のインポート   | 影響なし             |
| 型定義             | 影響なし（変更なし） |
| ビルド             | 影響なし（追加のみ） |

---

## 6. 完了確認

- [x] エクスポート追加位置が決定されている
- [x] エクスポート文の具体的なコードが設計されている
- [x] 循環参照が発生しないことが確認されている
- [x] 設計書が作成されている

---

## 7. 次のアクション

Phase 3（設計レビューゲート）へ進む。

設計の妥当性を検証し、実装に進む前に問題がないことを確認する。
