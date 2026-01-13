# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| Phase名    | 実装                             |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-14                       |
| 機能名     | shared-type-export-02-main-index |

---

## 目的

Phase 2で設計したエクスポート文を`packages/shared/index.ts`に追加し、テストを通過させる（TDD: Green状態）。

## 背景

Phase 4で設計したテストが失敗している状態から、実装を行いテストを通過させる。型エクスポートの追加により、`@repo/shared`から直接Community関連型をインポートできるようにする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: packages/shared/index.tsを更新

**目的**: Community関連型のエクスポートを追加する

**実行手順**:

1. `packages/shared/index.ts`を開く
2. 以下のコードを追加（`// Infrastructure`の後に配置）:

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

3. ファイルを保存

**期待される成果物**:

- 更新された `packages/shared/index.ts`

---

### タスク2: 型チェックを実行

**目的**: 追加したエクスポートが正しく動作することを確認する

**実行手順**:

1. 型チェックを実行:

```bash
pnpm --filter @repo/shared typecheck
```

2. エラーがないことを確認
3. エラーがある場合は修正

**期待される成果物**:

- 型チェック成功

---

### タスク3: ビルドを実行

**目的**: パッケージが正しくビルドされることを確認する

**実行手順**:

1. ビルドを実行:

```bash
pnpm --filter @repo/shared build
```

2. エラーがないことを確認
3. `dist/`ディレクトリに出力が生成されていることを確認

**期待される成果物**:

- ビルド成功

---

### タスク4: エクスポートを検証

**目的**: 追加したエクスポートが正しく公開されていることを確認する

**実行手順**:

1. 以下のインポートが機能することを確認（手動またはテストで）:

```typescript
import type { Community, CommunitySummary, StoredEntity } from "@repo/shared";

import {
  CommunityErrorCode,
  CommunityDetectionError,
  normalizeEntityName,
} from "@repo/shared";
```

2. Phase 4で設計したテストを実行し、全て通過することを確認

**期待される成果物**:

- エクスポート検証成功（Green状態）

---

## 参照資料

| 参照資料         | パス                             | 内容           |
| ---------------- | -------------------------------- | -------------- |
| 設計書           | `outputs/phase-2/design.md`      | 実装対象の設計 |
| テスト設計書     | `outputs/phase-4/test-design.md` | 検証用テスト   |
| 更新対象ファイル | `packages/shared/index.ts`       | 実装ファイル   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン |
| インターフェース仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`        | RAG型インターフェース  |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "type export"`

---

## 成果物

| 成果物                               | パス                         | 内容               |
| ------------------------------------ | ---------------------------- | ------------------ |
| **packages/shared/index.ts（更新）** | **プロジェクトディレクトリ** | 型エクスポート追加 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での統合テスト連携

フロント/バック接続の実装とテスト支援コード整備:

- **パッケージ間連携**: `@repo/shared` → 他パッケージへの型提供
- **テスト支援**: 型チェックによる静的検証

---

## TDD検証

### TDD サイクル確認

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# ビルド
pnpm --filter @repo/shared build

# テスト
pnpm --filter @repo/shared test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 完了条件

- [ ] `packages/shared/index.ts`が更新されている
- [ ] 型チェックが成功している
- [ ] ビルドが成功している
- [ ] エクスポートが正しく公開されている
- [ ] テストが全て通過している（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json`のPhase 5ステータスを更新

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む（本タスクでは該当なしのためPhase 9へスキップ）

---

## 次のPhase

本タスクは型エクスポートのみのため、Phase 6-8は該当なしとしてスキップします。

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-02-main-index/phase-9-quality.md`
