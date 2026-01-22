# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 2                     |
| Phase名    | 設計                  |
| 前提Phase  | Phase 1               |
| 後続Phase  | Phase 3               |
| ステータス | 未実施                |
| 作成日     | 2026-01-22            |
| 機能名     | shared-type-export-01 |

---

## 目的

`services/graph/index.ts` のバレルファイル構造を設計し、型エクスポートの詳細を決定する。

## 背景

Phase 1 で特定したエクスポート対象型を、`architecture-monorepo.md` の型エクスポートパターンに従って設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存 index.ts の確認

**目的**: 既存のバレルファイル構造を把握する

**実行手順**:

1. `packages/shared/src/services/graph/index.ts` が存在するか確認
2. 存在する場合、既存のエクスポートを確認
3. 存在しない場合、新規作成が必要であることを記録

**期待される成果物**:

- 既存ファイルの状態記録
- 追加すべきエクスポートの特定

---

### タスク2: エクスポート構造設計

**目的**: バレルファイルのエクスポート構造を設計する

**実行手順**:

1. `architecture-monorepo.md` の「services/graph エクスポート構造」セクションを参照
2. 以下の構造で設計:

```typescript
// packages/shared/src/services/graph/index.ts

/**
 * @module @repo/shared/services/graph
 * @description Knowledge Graphサービスの公開インターフェース
 */

// 型のエクスポート（export type）
export type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
} from "./types";

// 値のエクスポート（export）- 既存のものを維持
export { CommunityErrorCode, CommunityDetectionError } from "./types";
export { normalizeEntityName } from "./types";
```

3. 既存エクスポートとの競合がないか確認

**期待される成果物**:

- `outputs/phase-2/design.md` にエクスポート構造を記載

---

### タスク3: 下位互換性設計

**目的**: 既存コードへの影響を最小化する設計

**実行手順**:

1. 既存のインポートパターンを調査:
   - `from "./types"` （services/graph内部）
   - `from "../graph/types"` （他サービス）
2. 新規インポートパス `from "@repo/shared/services/graph"` の追加
3. 既存パスが引き続き動作することを確認

**期待される成果物**:

- 下位互換性チェックリスト
- インポートパス対応表

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 型エクスポートパターン |
| Phase 1 成果物         | `outputs/phase-1/requirements.md`                                            | エクスポート要件       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | バレルファイル戦略詳細 |

---

## 成果物

| 成果物 | パス                        | 内容                 |
| ------ | --------------------------- | -------------------- |
| 設計書 | `outputs/phase-2/design.md` | エクスポート構造設計 |

---

## 統合テスト連携

**Phase 2 アクション**: バレルファイル構造・エクスポート契約を設計

- インポートパス `@repo/shared/services/graph` からの型インポート契約を設計
- 型のみのエクスポート（`export type`）と値のエクスポート（`export`）を区別

---

## 完了条件

- [ ] 既存 `index.ts` の状態を確認
- [ ] エクスポート構造を設計
- [ ] 下位互換性を確認
- [ ] `outputs/phase-2/design.md` を作成

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-3-design-review.md`
