# Phase 5: 実装

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## 目的

Phase 2 設計書に従い、`StructurePlanJson` を `packages/shared/src/types/skillCreator.ts` に移動し、
全参照箇所の import を `@repo/shared/types` に切り替える（TDD の Red → Green 移行）。
`packages/shared/src/types/index.ts` と `packages/shared/index.ts` の barrel parity も維持する。

**重要**: ローカル定義を即時削除して Single Source of Truth を確立すること（C-4再発防止）。

## 実行タスク

- [ ] 既存テスト baseline 確認（実装前の Red 状態確認）
- [ ] `packages/shared/src/types/skillCreator.ts` の作成（型定義移動）
- [ ] `packages/shared/src/types/index.ts` への re-export 追加
- [ ] `SkillCreatorService.ts` のローカル定義削除・import 切り替え（`@repo/shared/types`）
- [ ] `packages/shared/index.ts` の barrel parity 確認
- [ ] 他の参照箇所（Phase 1 棚卸し結果）があれば import 切り替え
- [ ] Green 確認: テストが全て PASS することを確認
- [ ] 型チェック・lint 確認

## 参照資料

| 資料名                             | パス                                                          | 用途               |
| ---------------------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 4 テスト仕様                 | `outputs/phase-4/test-design.md`                              | テストケース参照   |
| Phase 2 設計書                     | `outputs/phase-2/design.md`                                   | 実装設計確認       |
| Phase 1 棚卸し結果                 | `outputs/phase-1/reference-inventory.md`                      | 全参照箇所確認     |
| packages/shared/src/types/index.ts | `packages/shared/src/types/index.ts`                          | re-export 追加先   |
| packages/shared/index.ts           | `packages/shared/index.ts`                                    | barrel parity 確認 |
| SkillCreatorService.ts             | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 変更対象ファイル   |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                 | 内容                       |
| -------------------- | ---------------------------------------------------- | -------------------------- |
| 型定義・共有パターン | `.claude/skills/aiworkflow-requirements/references/` | monorepo型共有実装パターン |

## 実行手順

### 0. 既存テスト baseline 確認（必須）

```bash
# 変更前の既存テストを実行
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
# 期待: 既存テストが全て PASS すること（TC-01〜TC-03 はまだ Red）
```

### 1. `packages/shared/src/types/skillCreator.ts` の作成

```typescript
// packages/shared/src/types/skillCreator.ts
import type { Anchor } from "./skill";

// SkillCreatorService.ts から移動した型定義

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

> **重要**: 型定義の内容は `SkillCreatorService.ts` の現行定義と一致させること。  
> `skillName / description / purpose / features / agents / triggers? / anchors?` 以外のフィールドを増減させない。

```bash
# 現行定義の確認
grep -A 20 "interface StructurePlanJson" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 2. `packages/shared/src/types/index.ts` への re-export 追加

```typescript
// packages/shared/src/types/index.ts に追加
export type { StructurePlanJson } from "./skillCreator";

// packages/shared/index.ts は既存の export * from "./types"; で追随する
// もし direct export を追加する場合は "./src/types/skillCreator" を使う
```

### 3. `SkillCreatorService.ts` のローカル定義削除・import 切り替え

```bash
# import が機能するか事前確認
grep -n "\"@repo/shared/types\"" apps/desktop/tsconfig.json
grep -n "\"@repo/shared/types\"" apps/desktop/package.json
```

```typescript
// SkillCreatorService.ts
// 変更前（削除する）:
interface StructurePlanJson { ... }

// 変更後（追加する）:
import type { StructurePlanJson } from "@repo/shared/types";
```

### 4. ビルド順序確認・Green 確認

```bash
# @repo/shared のビルド
pnpm --filter @repo/shared build

# @repo/desktop のビルド
pnpm --filter @repo/desktop build

# テスト実行（Green 確認）
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator.contract-parity.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts

# 型チェック
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/desktop exec tsc --noEmit

# Lint
pnpm --filter @repo/shared exec eslint src/
pnpm --filter @repo/desktop exec eslint src/main/services/skill/SkillCreatorService.ts
```

## 統合テスト連携

| 観点       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Green 移行 | TC-01〜TC-03 が全て PASS になること                         |
| 回帰なし   | 既存テストが引き続き PASS であること                        |
| ビルド成功 | `@repo/shared` → `@repo/desktop` の順でビルドが成功すること |

## 多角的チェック観点（AIが判断）

- **ローカル定義の即時削除**: 移動と同時にローカル定義を削除し、2つの定義が共存する状態を作らない
- **全参照箇所の一括切り替え**: Phase 1 棚卸し結果の全ファイルを漏れなく切り替える
- **エイリアスパスの確認**: `@repo/shared/types` エイリアスが `apps/desktop/tsconfig.json` に設定されているか事前確認
- **barrel parity**: `packages/shared/src/types/index.ts` と `packages/shared/index.ts` の双方が `skillCreator` に揃っているか確認する

## サブタスク管理

| サブタスクID | 名称                                                    | ステータス |
| ------------ | ------------------------------------------------------- | ---------- |
| T-05-1       | 既存テスト baseline 確認                                | skipped    |
| T-05-2       | skillCreator.ts 作成（型定義移動）                      | skipped    |
| T-05-3       | types/index.ts re-export 追加                           | skipped    |
| T-05-4       | SkillCreatorService.ts ローカル定義削除・import切り替え | skipped    |
| T-05-5       | barrel parity 確認・ビルド・Green 確認                  | skipped    |

## 成果物

| 成果物名                         | パス                                                          | 種別   |
| -------------------------------- | ------------------------------------------------------------- | ------ |
| 型定義ファイル（新規）           | `packages/shared/src/types/skillCreator.ts`                   | コード |
| re-export 追記                   | `packages/shared/src/types/index.ts`                          | コード |
| ローカル定義削除・import切り替え | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | コード |

## 完了条件

- [ ] `packages/shared/src/types/skillCreator.ts` が作成されていること（AC-4）
- [ ] `packages/shared/src/types/index.ts` に re-export が追加されていること
- [ ] `packages/shared/index.ts` の barrel parity が維持されていること
- [ ] `SkillCreatorService.ts` からローカル定義が削除されていること（AC-4: Single Source of Truth）
- [ ] 全参照箇所（Phase 1 棚卸し結果）の import が切り替わっていること
- [ ] TC-01〜TC-03 が全て PASS していること（Green）
- [ ] 既存テストが全て PASS していること（AC-5）
- [ ] `@repo/shared` → `@repo/desktop` のビルドが成功していること（AC-3）

## タスク100%実行確認【必須】

- [ ] 既存テスト baseline 確認完了
- [ ] skillCreator.ts 作成完了
- [ ] types/index.ts re-export 追加完了
- [ ] 全参照箇所の import 切り替え完了
- [ ] ローカル定義削除完了
- [ ] barrel parity 確認完了
- [ ] ビルド・Green 確認完了
- [ ] 型チェック・lint PASS 確認完了

## 次Phase

[Phase 6: テスト拡充](phase-6-test-expansion.md)
