# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| タスクID   | SHARED-TYPE-EXPORT-02 |
| Phase      | 1                     |
| 作成日     | 2026-01-14            |
| ステータス | 完了                  |

---

## 1. 現状のエクスポート構造

### 1.1 packages/shared/index.ts の現在のエクスポート

```typescript
// Types (packages/shared/types/index.ts)
export * from "./types"; // workflow, common, auth, api-keys, file-selection

// Skill types (packages/shared/src/types/skill)
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

### 1.2 エクスポートされていない型

以下の型・値は `@repo/shared` のメインエントリポイントからエクスポートされていない:

| カテゴリ        | 型/値                                           | 定義元                        |
| --------------- | ----------------------------------------------- | ----------------------------- |
| Entity関連型    | `StoredEntity`, `ExtractedEntity`               | `src/services/graph/types.ts` |
| Community関連型 | `Community`, `CommunitySummary`                 | `src/services/graph/types.ts` |
| Graph関連型     | `GraphNode`, `GraphEdge`, `GraphPath`           | `src/services/graph/types.ts` |
| Community関連値 | `CommunityErrorCode`, `CommunityDetectionError` | `src/services/graph/types.ts` |
| Branded ID型    | `CommunityId`, `EntityId`                       | `src/types/rag/branded.ts`    |
| ID生成関数      | `createCommunityId`, `createEntityId`           | `src/types/rag/branded.ts`    |

**注意**: `CommunityId`, `EntityId`は`src/types/rag/index.ts`からエクスポートされているが、メインindex.tsには含まれていない。

---

## 2. 必要な型の特定

### 2.1 デスクトップアプリ（apps/desktop）での使用例

```typescript
import {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";
```

### 2.2 必要な型一覧と定義元

| 型名                          | 定義元                        | 種別     |
| ----------------------------- | ----------------------------- | -------- |
| `Community`                   | `src/services/graph/types.ts` | type     |
| `CommunitySummary`            | `src/services/graph/types.ts` | type     |
| `StoredEntity`                | `src/services/graph/types.ts` | type     |
| `CommunityStructure`          | `src/services/graph/types.ts` | type     |
| `CommunityId`                 | `src/types/rag/branded.ts`    | type     |
| `EntityId`                    | `src/types/rag/branded.ts`    | type     |
| `GraphNode`                   | `src/services/graph/types.ts` | type     |
| `GraphEdge`                   | `src/services/graph/types.ts` | type     |
| `GraphPath`                   | `src/services/graph/types.ts` | type     |
| `CommunityErrorCode`          | `src/services/graph/types.ts` | enum     |
| `CommunityDetectionError`     | `src/services/graph/types.ts` | class    |
| `CommunitySummarizationError` | `src/services/graph/types.ts` | class    |
| `normalizeEntityName`         | `src/services/graph/types.ts` | function |

---

## 3. エクスポート要件定義

### 3.1 追加するエクスポート

#### A. services/graph からの型エクスポート

| 型名                            | エクスポート形式  |
| ------------------------------- | ----------------- |
| `StoredEntity`                  | `export type { }` |
| `ExtractedEntity`               | `export type { }` |
| `EntityMention`                 | `export type { }` |
| `StoredRelation`                | `export type { }` |
| `ExtractedRelation`             | `export type { }` |
| `RelationEvidence`              | `export type { }` |
| `GraphNode`                     | `export type { }` |
| `GraphEdge`                     | `export type { }` |
| `GraphPath`                     | `export type { }` |
| `GraphTraversalResult`          | `export type { }` |
| `GraphStats`                    | `export type { }` |
| `Community`                     | `export type { }` |
| `CommunitySummary`              | `export type { }` |
| `CommunityStructure`            | `export type { }` |
| `CommunityDetectionOptions`     | `export type { }` |
| `CommunityDetectionResult`      | `export type { }` |
| `CommunityDetectionStats`       | `export type { }` |
| `CommunitySummarizationOptions` | `export type { }` |
| `CommunitySummarizationResult`  | `export type { }` |
| `EntityQuery`                   | `export type { }` |
| `TraversalOptions`              | `export type { }` |
| `RelationQueryOptions`          | `export type { }` |

#### B. services/graph からの値エクスポート

| 値名                              | エクスポート形式 |
| --------------------------------- | ---------------- |
| `CommunityErrorCode`              | `export { }`     |
| `CommunityDetectionError`         | `export { }`     |
| `CommunitySummarizationErrorCode` | `export { }`     |
| `CommunitySummarizationError`     | `export { }`     |
| `normalizeEntityName`             | `export { }`     |

#### C. Branded ID型（確認が必要）

`CommunityId`, `EntityId`は`src/types/rag/index.ts`から既にエクスポートされているが、
メインindex.tsの`export * from "./src/types/rag"`が無いため、
追加するか確認が必要。

---

## 4. 受け入れ基準

### 4.1 機能要件

- [ ] 全ての必要な型が `@repo/shared` から直接インポート可能
- [ ] 以下のインポートが機能すること:
  ```typescript
  import type {
    Community,
    CommunitySummary,
    StoredEntity,
    CommunityId,
    EntityId,
  } from "@repo/shared";
  ```

### 4.2 非機能要件

- [ ] 循環参照が発生しない
- [ ] 既存のエクスポートが壊れない
- [ ] TypeScript型チェックが通る
- [ ] ビルドが成功する

---

## 5. 完了確認

- [x] 現在のエクスポート構造が把握されている
- [x] 必要な型が全て特定されている
- [x] 各型の定義元が特定されている
- [x] エクスポート要件が定義されている
- [x] 受け入れ基準が定義されている

---

## 6. 次のアクション

Phase 2（設計）へ進む。

具体的なエクスポート文のコード設計と、循環参照の分析を行う。
