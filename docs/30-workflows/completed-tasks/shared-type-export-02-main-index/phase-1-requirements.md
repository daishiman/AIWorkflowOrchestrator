# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| Phase名    | 要件定義                         |
| 前提Phase  | なし                             |
| 後続Phase  | Phase 2                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-14                       |
| 機能名     | shared-type-export-02-main-index |

---

## 目的

`@repo/shared`のメインエントリポイント（`packages/shared/index.ts`）から、Community関連型をエクスポートするための要件を明確化する。

## 背景

Part 1（SHARED-TYPE-EXPORT-01）で`services/graph/index.ts`からの型エクスポートが整備された。しかし、パッケージのメインエントリポイントからは、これらの型がまだエクスポートされていない。`apps/desktop`からの`import { ... } from "@repo/shared"`が機能しない状態を解消する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状のエクスポート構造を確認

**目的**: 現在の`packages/shared/index.ts`のエクスポート構造を把握する

**実行手順**:

1. `packages/shared/index.ts`を読み込む
2. 現在エクスポートされている型・値を一覧化する
3. 既存のエクスポートパターン（`export *`か`export type`か）を確認する

**期待される成果物**:

- 現在のエクスポート構造の一覧

---

### タスク2: 必要な型を特定

**目的**: デスクトップアプリが必要とする型を明確化する

**実行手順**:

1. `apps/desktop`での使用例を確認（タスク指示書記載）
2. 必要な型を一覧化:
   - `Community`
   - `CommunitySummary`
   - `StoredEntity`
   - `CommunityId`
   - `EntityId`
3. 各型の定義元を特定:
   - `Community`, `CommunitySummary`, `StoredEntity` → `services/graph/index.ts`
   - `CommunityId`, `EntityId` → `types/rag/branded.ts`

**期待される成果物**:

- 必要な型の一覧と定義元

---

### タスク3: エクスポート要件を定義

**目的**: 追加すべきエクスポートの要件を定義する

**実行手順**:

1. 以下のエクスポート要件を定義:

| 型名               | 定義元            | エクスポート形式  |
| ------------------ | ----------------- | ----------------- |
| Community          | services/graph    | `export type { }` |
| CommunitySummary   | services/graph    | `export type { }` |
| StoredEntity       | services/graph    | `export type { }` |
| CommunityStructure | services/graph    | `export type { }` |
| CommunityId        | types/rag/branded | `export type { }` |
| EntityId           | types/rag/branded | `export type { }` |

2. 追加で検討すべき型:
   - `CommunityErrorCode` (enum)
   - `CommunityDetectionError` (class)
   - `createCommunityId`, `createEntityId` (関数)

3. 受け入れ基準を定義:
   - 全ての必要な型が`@repo/shared`からインポート可能
   - 循環参照が発生しない
   - 既存のエクスポートが壊れない

**期待される成果物**:

- エクスポート要件定義書

---

## 参照資料

| 参照資料                | パス                                                                         | 内容             |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------- |
| 元タスク指示書          | `docs/30-workflows/unassigned-task/task-shared-community-types-export-02.md` | 元のタスク要件   |
| メインindex.ts          | `packages/shared/index.ts`                                                   | 更新対象ファイル |
| services/graph/index.ts | `packages/shared/src/services/graph/index.ts`                                | エクスポート元   |
| types/rag/branded.ts    | `packages/shared/src/types/rag/branded.ts`                                   | ID型定義         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン |
| インターフェース仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag.md`        | RAG型インターフェース  |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "type export"`

---

## 成果物

| 成果物     | パス                              | 内容                 |
| ---------- | --------------------------------- | -------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | エクスポート要件定義 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での統合テスト連携

型エクスポートのみのタスクのため、接続要件は最小限:

- **API接続**: 該当なし（型のみ）
- **認証**: 該当なし
- **データフロー**: 該当なし
- **パッケージ間連携**: `@repo/shared` → `@repo/desktop` の型インポート

---

## 完了条件

- [ ] 現在のエクスポート構造が把握されている
- [ ] 必要な型が全て特定されている
- [ ] 各型の定義元が特定されている
- [ ] エクスポート要件が定義されている
- [ ] 受け入れ基準が定義されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json`のPhase 1ステータスを更新

---

## 依存関係

- **前提**: SHARED-TYPE-EXPORT-01（Part 1）が完了していること
- **後続**: Phase 2へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-02-main-index/phase-2-design.md`
