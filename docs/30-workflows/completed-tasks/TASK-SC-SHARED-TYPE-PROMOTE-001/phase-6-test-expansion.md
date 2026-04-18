# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 5                         |
| 後続Phase  | Phase 7                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

## 目的

Phase 5 で実装した型昇格に対して、エッジケースのテストを追加する。
特に `StructurePlanJson` の optional フィールドと barrel parity を compile-time で固定し、
import シャドウイングが発生しないことを補強する。

## 実行タスク

- [ ] Phase 5 実装後のテスト状態確認（Green 確認）
- [ ] 追加テストケース作成:
  - TC-04: `StructurePlanJson["triggers"]` と `StructurePlanJson["anchors"]` が optional のままであること
  - TC-05: `@repo/shared` root と `@repo/shared/types` が同じ型を公開していること
  - TC-06: ローカル定義が削除されており、import がシャドウイングしていないこと（コード検索で確認）
- [ ] 全テスト実行・カバレッジ確認
- [ ] 型チェック PASS 確認

## 参照資料

| 資料名                      | パス                                                                       | 用途                                     |
| --------------------------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 4 テスト設計メモ      | `outputs/phase-4/test-design.md`                                           | 既存テストケース確認                     |
| Phase 1 棚卸し結果          | `outputs/phase-1/reference-inventory.md`                                   | 全参照箇所確認（シャドウイングチェック） |
| skillCreator.ts             | `packages/shared/src/types/skillCreator.ts`                                | 型定義実装確認                           |
| 既存 contract-parity テスト | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` | 追加対象の実在テスト                     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                 | 内容               |
| ------------------ | ---------------------------------------------------- | ------------------ |
| テスト設計パターン | `.claude/skills/aiworkflow-requirements/references/` | テスト追加パターン |

## 実行手順

### 1. TC-04〜TC-06 追加テスト

```bash
# TC-04: ローカル定義残存チェック（コード検索）
grep -rn "interface StructurePlanJson" apps/
# 期待: 0件（ローカル定義が削除されていること）

# TC-05: re-export 確認
grep -n "StructurePlanJson" packages/shared/src/types/index.ts
# 期待: shared types barrel に re-export が存在すること
```

```typescript
// packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts に追加

import { describe, it, expectTypeOf } from "vitest";
import type { Anchor, StructurePlanJson } from "@repo/shared/types";

describe("StructurePlanJson edge cases", () => {
  it("TC-04: optional フィールドが optional のままであること", () => {
    expectTypeOf<StructurePlanJson["triggers"]>().toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf<StructurePlanJson["anchors"]>().toEqualTypeOf<
      Anchor[] | undefined
    >();
  });

  it("TC-05: root barrel と types barrel が同じ型を公開していること", () => {
    expectTypeOf<
      import("@repo/shared").StructurePlanJson
    >().toEqualTypeOf<StructurePlanJson>();
  });

  it("TC-06: ローカル定義が残存していないこと", () => {
    // この確認はコード検索で行う。runtime import ではなく grep を採用する。
    expectTypeOf<StructurePlanJson>().toBeObject();
  });
});
```

### 2. 全テスト実行

```bash
# @repo/shared テスト
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator.contract-parity.test.ts

# @repo/desktop テスト
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts

# 全体型チェック
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/desktop exec tsc --noEmit
```

## 統合テスト連携

| 観点               | 内容                                                  |
| ------------------ | ----------------------------------------------------- |
| シャドウイング防止 | ローカル定義が完全に削除されていること                |
| re-export 完全性   | `@repo/shared/types` から全参照元が型を取得できること |

## 多角的チェック観点（AIが判断）

- **型定義のみのテスト**: TypeScript の型定義は実行時に存在しないため、型テストは主に `tsc --noEmit` に頼る
- **テストコードの価値**: 過度なプレースホルダーを避け、コード検索や型チェックによる実際の検証を記録する

## サブタスク管理

| サブタスクID | 名称                         | ステータス |
| ------------ | ---------------------------- | ---------- |
| T-06-1       | Phase 5 Green 確認           | skipped    |
| T-06-2       | TC-04〜TC-06 追加テスト作成  | skipped    |
| T-06-3       | 全テスト・型チェック実行確認 | skipped    |

## 成果物

| 成果物名                   | パス                                                                       | 種別         |
| -------------------------- | -------------------------------------------------------------------------- | ------------ |
| テスト拡充（TC-04〜TC-06） | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` | コード       |
| テスト拡充結果メモ         | `outputs/phase-6/test-expansion.md`                                        | ドキュメント |

## 完了条件

- [ ] TC-01〜TC-06 全てが PASS していること
- [ ] 既存テストが全て PASS していること
- [ ] `outputs/phase-6/test-expansion.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] Phase 5 Green 確認完了
- [ ] TC-04〜TC-06 追加テスト作成完了
- [ ] 全テスト・型チェック PASS 確認完了

## 次Phase

[Phase 7: カバレッジ確認](phase-7-coverage-check.md)
