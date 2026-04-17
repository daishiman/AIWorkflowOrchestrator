# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 3                         |
| 後続Phase  | Phase 5                         |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

> **前提条件**: Phase 3 ゲートが PASS の場合にのみ実施する。昇格しない場合はスキップ。

## 目的

`StructurePlanJson` が `@repo/shared/types` から型として参照できることを、runtime import に頼らず compile-time 中心で検証する。
`packages/shared/src/types/index.ts` と `packages/shared/index.ts` の barrel parity も `expectTypeOf` と `satisfies` で固定する。

## 実行タスク

- [ ] 既存テストの baseline 確認（`pnpm --filter @repo/shared test`）
- [ ] `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` の追記・更新
- [ ] テストケース一覧:
  - TC-01: `@repo/shared/types` から `import type` でき、`satisfies StructurePlanJson` が通ること
  - TC-02: `expectTypeOf<StructurePlanJson>()` で `skillName / description / purpose / features / agents / triggers? / anchors?` の契約を pin すること
  - TC-03: `@repo/shared` root と `@repo/shared/types` が同じ型を公開すること

## 参照資料

| 資料名                             | パス                                                                       | 用途                             |
| ---------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| Phase 2 設計書                     | `outputs/phase-2/design.md`                                                | テスト対象API確認                |
| Phase 1 棚卸し結果                 | `outputs/phase-1/reference-inventory.md`                                   | StructurePlanJson フィールド確認 |
| packages/shared/src/types/index.ts | `packages/shared/src/types/index.ts`                                       | subpath barrel 確認              |
| packages/shared/index.ts           | `packages/shared/index.ts`                                                 | root barrel 確認                 |
| 既存 contract-parity テスト        | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` | compile-time テスト更新対象      |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                 | 内容                       |
| -------------------- | ---------------------------------------------------- | -------------------------- |
| 型定義テストパターン | `.claude/skills/aiworkflow-requirements/references/` | shared型テスト設計パターン |

## 実行手順

### 0. 既存テスト baseline 確認（必須）

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/shared test
# 期待: 既存テストが全て PASS すること
```

### 1. テストファイル作成（Red）

```typescript
// packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts
import { describe, expectTypeOf, it } from "vitest";
import type { Anchor, StructurePlanJson } from "@repo/shared/types";

describe("StructurePlanJson", () => {
  it("TC-01: @repo/shared/types から type-only import できること", () => {
    const plan = {
      skillName: "sample-skill",
      description: "sample description",
      purpose: "sample purpose",
      features: ["feature-a"],
      agents: ["extract-purpose", "plan-structure"],
      triggers: ["sample-skill"],
      anchors: [],
    } satisfies StructurePlanJson;

    expectTypeOf(plan).toMatchTypeOf<StructurePlanJson>();
  });

  it("TC-02: フィールド契約が現行コードと一致すること", () => {
    expectTypeOf<StructurePlanJson>().toMatchTypeOf<{
      skillName: string;
      description: string;
      purpose: string;
      features: string[];
      agents: string[];
      triggers?: string[];
      anchors?: Anchor[];
    }>();
  });

  it("TC-03: root barrel と types barrel が同じ型を公開すること", () => {
    expectTypeOf<
      import("@repo/shared").StructurePlanJson
    >().toEqualTypeOf<StructurePlanJson>();
  });
});
```

### 2. Red 確認

```bash
# テスト実行（Red 確認）
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator.contract-parity.test.ts
# 期待: まだ `StructurePlanJson` が shared で公開されていない場合は型エラーで失敗する
```

## 統合テスト連携

| 観点               | 内容                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 型エクスポート確認 | `@repo/shared/types` から `StructurePlanJson` が取得できること                                                   |
| 型完全性確認       | 全フィールドが `skillName / description / purpose / features / agents / triggers? / anchors?` と一致していること |

## 多角的チェック観点（AIが判断）

- **型テストの有効性**: TypeScript の型定義は実行時に存在しないため、runtime import ではなく `import type` / `expectTypeOf` / `satisfies` で検証する
- **barrel parity**: `packages/shared/src/types/index.ts` と `packages/shared/index.ts` が同じ型を公開することを compile-time で pin する
- **TDD の Red 確認**: 今回の Red は実行時失敗ではなく、型契約が崩れたときにコンパイルで落ちる状態を意味する

## サブタスク管理

| サブタスクID | 名称                               | ステータス |
| ------------ | ---------------------------------- | ---------- |
| T-04-1       | 既存テスト baseline 確認           | skipped    |
| T-04-2       | テストファイル作成（TC-01〜TC-03） | skipped    |
| T-04-3       | Red 確認                           | skipped    |

## 成果物

| 成果物名                         | パス                                                                       | 種別         |
| -------------------------------- | -------------------------------------------------------------------------- | ------------ |
| 型エクスポートテスト（条件付き） | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` | コード       |
| テスト設計メモ                   | `outputs/phase-4/test-design.md`                                           | ドキュメント |

## 完了条件

- [ ] `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` が更新されていること
- [ ] テストが compile-time 中心の設計になっており、runtime import による type 検証を使っていないこと
- [ ] テスト設計メモが `outputs/phase-4/test-design.md` に記録されていること

## タスク100%実行確認【必須】

- [ ] 既存テスト baseline 確認完了
- [ ] TC-01〜TC-03 テスト作成完了
- [ ] Red 状態確認完了

## 次Phase

[Phase 5: 実装](phase-5-implementation.md)
