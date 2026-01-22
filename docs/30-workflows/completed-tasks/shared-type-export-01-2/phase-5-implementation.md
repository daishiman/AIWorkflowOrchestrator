# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4               |
| 後続Phase  | Phase 6               |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

TDD Green状態：`services/graph/index.ts` に型エクスポートを実装し、Phase 4 のテストを通過させる。

## 背景

設計書に基づき、バレルファイルに型の再エクスポートを実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存 index.ts の確認

**目的**: 既存ファイルの状態を確認

**実行手順**:

1. `packages/shared/src/services/graph/index.ts` を開く
2. 既存のエクスポートを確認
3. 追加すべきエクスポートを特定

**期待される成果物**:

- 既存ファイル状態の把握

---

### タスク2: 型エクスポートの実装

**目的**: 型の再エクスポートを実装

**実行手順**:

1. `packages/shared/src/services/graph/index.ts` を編集
2. 以下のエクスポートを追加:

```typescript
/**
 * @module @repo/shared/services/graph
 * @description Knowledge Graphサービスの公開インターフェース
 */

// 型のエクスポート（export type）- コンパイル後は消える
export type { StoredEntity, ExtractedEntity, EntityMention } from "./types";
export type {
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
} from "./types";
export type {
  GraphNode,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  GraphEdge,
} from "./types";
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
export type {
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./types";

// 値のエクスポート（export）- ランタイムに存在
export { CommunityErrorCode, CommunityDetectionError } from "./types";
export {
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
} from "./types";
export { normalizeEntityName } from "./types";
```

3. 既存のエクスポートと競合しないことを確認

**期待される成果物**:

- 更新された `packages/shared/src/services/graph/index.ts`

---

### タスク3: TDD Green状態の確認

**目的**: テストが通過することを確認

**実行手順**:

1. 以下のコマンドを実行:

```bash
pnpm --filter @repo/shared test -- --run services/graph/index.test.ts
```

2. 全テストがパスすることを確認（Green状態）

**期待される成果物**:

- テスト実行結果（Green状態）

---

### タスク4: 型チェック

**目的**: TypeScript型チェックをパスすることを確認

**実行手順**:

1. 以下のコマンドを実行:

```bash
pnpm --filter @repo/shared typecheck
```

2. 型エラーがないことを確認

**期待される成果物**:

- 型チェック結果（エラーなし）

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                 |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| 設計書                 | `outputs/phase-2/design.md`                                                  | エクスポート構造     |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | エクスポートパターン |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                            |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | services/graph エクスポート構造 |

---

## 成果物

| 成果物             | パス                                          | 内容               |
| ------------------ | --------------------------------------------- | ------------------ |
| バレルファイル更新 | `packages/shared/src/services/graph/index.ts` | 型エクスポート追加 |

---

## 統合テスト連携

**Phase 5 アクション**: index.ts に型再エクスポートを実装

- `export type { }` で型のみをエクスポート
- `export { }` で値（enum、class、function）をエクスポート
- 下位互換性を維持

---

## 完了条件

- [ ] `index.ts` に型エクスポートを実装
- [ ] Phase 4 のテストが全てパス（Green状態）
- [ ] 型チェックがパス
- [ ] 既存のインポートが壊れていない

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run services/graph/index.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-6-test-expansion.md`
