# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

TDDの「Green」フェーズとして、Phase 4で作成したテストを通過する最小限の実装を行う。

## 背景

`services/graph/index.ts` を作成し、`types.ts` から型を再エクスポートする。これにより、外部パッケージから型をインポートできるようになる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: index.ts の作成

**目的**: バレルファイルを作成し、型を再エクスポートする

**実行手順**:

1. `packages/shared/src/services/graph/index.ts` を作成
2. Phase 2で設計した構造に従って型を再エクスポート
3. コメントでカテゴリを明示

**実装コード**:

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

// Relation関連型
export type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "./types";

// Graph関連型
export type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "./types";

// Community関連型
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

// Query関連型
export type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./types";

// =============================================================================
// Value Re-exports (enum, class, function)
// =============================================================================

// Community検出関連
export { CommunityErrorCode, CommunityDetectionError } from "./types";

// Community要約関連
export {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "./types";

// ユーティリティ関数
export { normalizeEntityName } from "./types";
```

**期待される成果物**:

- 実装ファイル（実装: `packages/shared/src/services/graph/index.ts`）

---

### タスク2: テスト成功の確認（Green状態）

**目的**: Phase 4で作成したテストが全て成功することを確認する

**実行手順**:

1. テストを実行
2. 全テストが成功することを確認
3. 成功結果を記録

**実行コマンド**:

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test -- --run services/graph/__tests__/type-exports.test.ts

# 型チェック
pnpm --filter @repo/shared typecheck
```

**期待される成果物**:

- Green状態確認レポート（出力: `outputs/phase-5/green-state-report.md`）

---

### タスク3: 既存テストの確認

**目的**: 既存のテストが壊れていないことを確認する

**実行手順**:

1. `services/graph/` 配下の全テストを実行
2. 既存テストが全て成功することを確認
3. 結果を記録

**実行コマンド**:

```bash
pnpm --filter @repo/shared test -- --run services/graph/
```

**期待される成果物**:

- 既存テスト確認レポート（出力: `outputs/phase-5/existing-tests-report.md`）

---

## 参照資料

| 参照資料      | パス                                                                | 内容                 |
| ------------- | ------------------------------------------------------------------- | -------------------- |
| Phase 2設計   | `outputs/phase-2/export-structure-design.md`                        | エクスポート構造設計 |
| Phase 4テスト | `packages/shared/src/services/graph/__tests__/type-exports.test.ts` | 型エクスポートテスト |

---

## 成果物

| 成果物             | パス                                          | 内容             |
| ------------------ | --------------------------------------------- | ---------------- |
| index.ts           | `packages/shared/src/services/graph/index.ts` | バレルファイル   |
| Green状態レポート  | `outputs/phase-5/green-state-report.md`       | 成功確認レポート |
| 既存テストレポート | `outputs/phase-5/existing-tests-report.md`    | 既存テスト確認   |

---

## 統合テスト連携（Phase 1〜11は必須）

### フロント/バック接続の実装

このタスクは型エクスポートのみのため、実際の接続実装は不要。ただし、以下を確認:

- 型インポートパスが正しく機能すること
- 既存のサービス実装に影響がないこと

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run services/graph/__tests__/type-exports.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）
- [ ] 既存テストも全て成功すること

---

## 完了条件

- [ ] `index.ts` が作成されている
- [ ] 全ての型が再エクスポートされている
- [ ] Phase 4のテストが全て成功（Green状態）
- [ ] 既存テストが全て成功
- [ ] 型チェック（`pnpm typecheck`）が成功
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 5 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-6-test-expansion.md`
