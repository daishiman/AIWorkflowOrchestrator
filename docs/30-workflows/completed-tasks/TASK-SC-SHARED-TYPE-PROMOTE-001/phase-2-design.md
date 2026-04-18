# Phase 2: 設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 1（昇格実施の場合のみ）   |
| 後続Phase  | Phase 3                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

> **前提条件**: Phase 1 で「昇格実施」と判断された場合にのみ実施する。

## 目的

`StructurePlanJson` インタフェースを `packages/shared/src/types/skillCreator.ts` に移し、
`@repo/shared/types` を正規 import パスとして使う設計を行う。
`packages/shared/src/types/index.ts` を subpath barrel、`packages/shared/index.ts` を root barrel として揃え、
`skillCreator.ts` 以外の不一致パスは使わない。

設計のキーポイント:

- Single Source of Truth の確立（ローカル定義の削除）
- `@repo/shared/types` と root `@repo/shared` の barrel export 整合
- ビルド依存関係の確認（`@repo/shared` → `@repo/desktop` の順序）
- import シャドウイングの防止（C-4 問題の再発防止）

## 実行タスク

- [ ] Phase 1 の棚卸し結果（`outputs/phase-1/reference-inventory.md`）確認
- [ ] `packages/shared/src/types/` の既存型定義パターン調査
- [ ] `StructurePlanJson` の移動先ファイルパス確定（`packages/shared/src/types/skillCreator.ts`）
- [ ] re-export パス設計（`packages/shared/src/types/index.ts` / `packages/shared/index.ts`）
- [ ] 各参照箇所での import パス設計（`@repo/shared/types`）
- [ ] ビルド順序・依存関係の設計
- [ ] 設計書の作成（`outputs/phase-2/design.md`）

## 参照資料

| 資料名                             | パス                                                          | 用途                             |
| ---------------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Phase 1 棚卸し結果                 | `outputs/phase-1/reference-inventory.md`                      | 参照箇所・判断根拠確認           |
| packages/shared/src/types/         | `packages/shared/src/types/`                                  | 既存型定義パターン確認           |
| packages/shared/src/types/index.ts | `packages/shared/src/types/index.ts`                          | `@repo/shared/types` barrel 確認 |
| packages/shared/index.ts           | `packages/shared/index.ts`                                    | root export 確認                 |
| SkillCreatorService.ts             | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 移動元コンテキスト確認           |
| pnpm ワークスペース設定            | `pnpm-workspace.yaml`                                         | ビルド依存関係確認               |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                 | 内容                       |
| -------------------- | ---------------------------------------------------- | -------------------------- |
| 型定義・共有パターン | `.claude/skills/aiworkflow-requirements/references/` | monorepo型共有設計パターン |

## 実行手順

### 1. 既存 shared 型定義パターンの調査

```bash
# packages/shared の型定義ファイル一覧
ls packages/shared/src/types/

# 既存の型定義パターン確認
cat packages/shared/src/types/*.ts | head -50

# barrel export 確認
sed -n '1,240p' packages/shared/index.ts
sed -n '1,220p' packages/shared/src/types/index.ts
```

### 2. 設計決定事項

以下を設計書に記録する:

**型定義移動先**:

```
packages/shared/src/types/skillCreator.ts
```

**型定義内容**:

```typescript
// packages/shared/src/types/skillCreator.ts
import type { Anchor } from "./skill";

export interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: Anchor[];
}
```

**re-export パス**:

```typescript
// packages/shared/src/types/index.ts に追加
export type { StructurePlanJson } from "./skillCreator";

// packages/shared/index.ts は既存の export * from "./types"; で追随する
// もし direct export を追加する場合は "./src/types/skillCreator" を使う
```

**import 切り替えパス**:

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts
import type { StructurePlanJson } from "@repo/shared/types";
```

**ビルド順序**:

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

### 3. 設計レビュー観点の明示

- [ ] ローカル定義を削除して Single Source of Truth を確立しているか
- [ ] `@repo/shared/types` の barrel export が root でも整合しているか
- [ ] `packages/shared/src/types/index.ts` と `packages/shared/index.ts` の双方でファイル名が `skillCreator` に揃っているか
- [ ] `@repo/shared` のビルドが先に行われる設計になっているか
- [ ] import シャドウイングが発生しない設計になっているか

## 統合テスト連携

| 観点       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 型契約     | `StructurePlanJson` の定義が変更なく `@repo/shared/types` から提供されること |
| ビルド順序 | `@repo/shared` → `@repo/desktop` のビルド順序が機能すること                  |

## 多角的チェック観点（AIが判断）

- **型の完全性**: 移動する `StructurePlanJson` の全フィールドが `skillName / description / purpose / features / agents / triggers? / anchors?` と一致していること
- **循環依存の排除**: `@repo/shared` が `@repo/desktop` に依存しないこと
- **既存コードへの影響最小化**: import パスは `@repo/shared/types` に統一し、不一致パスを増やさないこと

## サブタスク管理

| サブタスクID | 名称                          | ステータス |
| ------------ | ----------------------------- | ---------- |
| T-02-1       | shared型定義パターン調査      | skipped    |
| T-02-2       | 移動先パス・re-exportパス確定 | skipped    |
| T-02-3       | 設計書作成                    | skipped    |

## 成果物

| 成果物名     | パス                        | 種別         |
| ------------ | --------------------------- | ------------ |
| 型昇格設計書 | `outputs/phase-2/design.md` | ドキュメント |

## 完了条件

- [ ] `packages/shared/src/types/skillCreator.ts` への移動先が確定していること
- [ ] `packages/shared/src/types/index.ts` / `packages/shared/index.ts` の re-export パスが設計されていること
- [ ] 各参照箇所での import パスが `@repo/shared/types` に統一されていること
- [ ] ビルド順序・依存関係が記録されていること
- [ ] `outputs/phase-2/design.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] Phase 1 棚卸し結果の確認完了
- [ ] 既存 shared 型定義パターンの調査完了
- [ ] 型定義移動先・re-exportパスの確定完了
- [ ] 各参照箇所のimportパス設計完了
- [ ] ビルド順序・依存関係の設計完了
- [ ] 設計書作成完了

## 次Phase

[Phase 3: 設計レビューゲート](phase-3-design-review.md)
