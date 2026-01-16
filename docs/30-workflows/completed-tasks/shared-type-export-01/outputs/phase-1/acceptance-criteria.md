# Phase 1: 受け入れ基準書

## 作成日

2026-01-13

## 概要

SHARED-TYPE-EXPORT-01（Part 1: 型整理）の完了判定基準を定義する。

---

## エクスポート対象型（最終リスト）

### 型のみ（`export type` 使用）: 22件

#### Entity 関連

- `StoredEntity`
- `ExtractedEntity`
- `EntityMention`

#### Relation 関連

- `StoredRelation`
- `ExtractedRelation`
- `RelationEvidence`

#### Graph 関連

- `GraphNode`
- `GraphPath`
- `GraphTraversalResult`
- `GraphStats`
- `GraphEdge`

#### Community 関連

- `Community`
- `CommunitySummary`
- `CommunityStructure`
- `CommunityDetectionOptions`
- `CommunityDetectionResult`
- `CommunityDetectionStats`
- `CommunitySummarizationOptions`
- `CommunitySummarizationResult`

#### Query 関連

- `EntityQuery`
- `TraversalOptions`
- `RelationQueryOptions`

### 値（`export` 使用）: 5件

#### Enum

- `CommunityErrorCode`
- `CommunitySummarizationErrorCode`

#### Class

- `CommunityDetectionError`
- `CommunitySummarizationError`

#### Function

- `normalizeEntityName`

---

## 受け入れ基準

### 機能要件

| #   | 基準                                                          | 検証方法           |
| --- | ------------------------------------------------------------- | ------------------ |
| F1  | `@repo/shared/services/graph` から全27型/関数がインポート可能 | テストコードで検証 |
| F2  | `export type` が全ての interface に対して使用されている       | コードレビュー     |
| F3  | `export` が enum, class, function に対して使用されている      | コードレビュー     |
| F4  | 既存の直接インポート（`types.ts`）が壊れていない              | 既存テスト実行     |

### 品質要件

| #   | 基準                      | 検証方法         |
| --- | ------------------------- | ---------------- |
| Q1  | TypeScript 型エラーがない | `pnpm typecheck` |
| Q2  | ESLint エラーがない       | `pnpm lint`      |
| Q3  | 全テストが成功            | `pnpm test`      |
| Q4  | ビルドが成功              | `pnpm build`     |

### 非機能要件

| #   | 基準                                     | 検証方法       |
| --- | ---------------------------------------- | -------------- |
| N1  | バレルファイルに JSDoc コメントがある    | コードレビュー |
| N2  | エクスポート順序が論理的に整理されている | コードレビュー |

---

## スコープ境界

### Part 1（本タスク）に含まれる

- `services/graph/index.ts` の作成
- `services/graph/types.ts` からの型再エクスポート

### Part 2（SHARED-TYPE-EXPORT-02）に含まれる

- `packages/shared/src/index.ts` の更新
- Branded Types のエクスポート

### Part 3（SHARED-TYPE-EXPORT-03）に含まれる

- `apps/desktop` からのインポート検証
- 型チェック成功の確認

---

## 検証シナリオ

### シナリオ1: 型インポートテスト

```typescript
// テストコード
import type { Community, CommunitySummary, StoredEntity } from "../index";

// 型が定義されていることを確認（コンパイルエラーがないこと）
type _CommunityCheck = Community;
type _CommunitySummaryCheck = CommunitySummary;
type _StoredEntityCheck = StoredEntity;
```

### シナリオ2: 値インポートテスト

```typescript
// テストコード
import { CommunityErrorCode, normalizeEntityName } from "../index";

// 実行時に使用可能であることを確認
expect(CommunityErrorCode.NOT_FOUND).toBe("NOT_FOUND");
expect(normalizeEntityName("Test")).toBe("test");
```

---

## 完了条件チェックリスト

- [x] `types.ts` 内の全ての public 型が一覧化されている
- [x] 依存関係（Branded Types 等）が整理されている
- [x] 受け入れ基準が明確に定義されている
- [x] スコープ境界（Part 1/2/3）が明確化されている

---

## タスク3完了

✅ 受け入れ基準が明確に定義されている
✅ スコープ境界（Part 1/2/3）が明確化されている
