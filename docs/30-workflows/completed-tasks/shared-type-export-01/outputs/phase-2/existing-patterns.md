# Phase 2: 既存パターン分析書

## 作成日

2026-01-13

## 概要

`packages/shared/src/services/` 配下の既存バレルファイル（index.ts）のパターンを分析する。

---

## 調査対象

以下のバレルファイルを分析:

- `services/embedding/index.ts`
- `services/chunking/index.ts`

---

## 共通パターン

### 1. ファイル構造

```typescript
/**
 * JSDoc コメント
 * @description モジュールの概要説明
 */

// Types (export type)
export type { ... } from "./types";

// Errors (export)
export { ErrorClass, ... } from "./errors";

// Classes/Functions (export)
export { ClassName, functionName, ... } from "./file";
```

### 2. エクスポート方式

| エクスポート対象 | 使用構文      | 理由                               |
| ---------------- | ------------- | ---------------------------------- |
| interface        | `export type` | 型情報のみ（ランタイムに残らない） |
| type alias       | `export type` | 型情報のみ（ランタイムに残らない） |
| enum             | `export`      | ランタイムで値として使用される     |
| class            | `export`      | ランタイムで値として使用される     |
| function         | `export`      | ランタイムで値として使用される     |
| const            | `export`      | ランタイムで値として使用される     |

### 3. グループ化

エクスポートはカテゴリ別にグループ化され、コメントで区切られる:

```typescript
// Types
export type { ... } from "./types";

// Errors
export { ... } from "./errors";

// Services
export { ... } from "./service";
```

### 4. インライン型エクスポート

一部の実装ファイルでは、値と型を同時にエクスポートするパターンも使用:

```typescript
export { ClassName, type TypeName } from "./file";
```

---

## services/graph での適用

### 現在のディレクトリ構成

```
services/graph/
├── __tests__/
├── interfaces/
├── prompts/
├── community-detector.ts
├── community-summarizer.ts
├── errors.ts
├── knowledge-graph-store.ts
├── leiden-algorithm.ts
└── types.ts           ← Part 1 のエクスポート対象
```

### Part 1 で作成する index.ts

- `types.ts` からの型・enum・class・関数のみをエクスポート
- 他のファイル（`community-detector.ts` 等）はスコープ外

---

## 推奨パターン

```typescript
/**
 * @file Knowledge Graph Service - Public API
 * @module @repo/shared/services/graph
 * @description Knowledge Graphサービスの公開インターフェース
 */

// =============================================================================
// Type Re-exports
// =============================================================================

// Entity関連型
export type { StoredEntity, ExtractedEntity, EntityMention } from "./types";

// ... 以下同様 ...

// =============================================================================
// Value Re-exports (enum, class, function)
// =============================================================================

// Community検出関連
export { CommunityErrorCode, CommunityDetectionError } from "./types";

// ... 以下同様 ...
```

---

## タスク1完了

✅ 既存のバレルファイルパターンが分析されている
